use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");

#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub creator: Pubkey,
    pub title: String,
    pub category: String,
    pub mu: f64,
    pub sigma: f64,
    pub ends_at: i64,
}

#[event]
pub struct PredictionPlaced {
    pub market: Pubkey,
    pub position: Pubkey,
    pub owner: Pubkey,
    pub point: f64,
    pub amount: u64,
    pub new_mu: f64,
}

#[event]
pub struct MarketResolved {
    pub market: Pubkey,
    pub final_outcome: f64,
    pub resolved_at: i64,
}

#[event]
pub struct PositionSettled {
    pub position: Pubkey,
    pub owner: Pubkey,
    pub payout: u64,
}

#[program]
pub mod gossip {
    use super::*;

    /// Initialize a new continuous prediction market.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        title: String,
        category: String,
        initial_mu: f64,
        initial_sigma: f64,
        b: f64,
        resolution_source: String,
        ends_at: i64,
        oracle_authority: Pubkey,
        fee_bps: u16,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.creator = ctx.accounts.authority.key();
        market.title = title;
        market.category = category;
        market.mu = initial_mu;
        market.sigma = initial_sigma;
        market.b = b;
        market.total_liquidity = 0;
        market.resolved = false;
        market.final_outcome = 0.0;
        market.resolution_source = resolution_source;
        market.ends_at = ends_at;
        market.mint = ctx.accounts.mint.key();
        market.vault_bump = ctx.bumps.vault;
        market.oracle_authority = oracle_authority;
        market.fee_bps = fee_bps;
        market.paused = false;

        emit!(MarketCreated {
            market: market.key(),
            creator: market.creator,
            title: market.title.clone(),
            category: market.category.clone(),
            mu: market.mu,
            sigma: market.sigma,
            ends_at: market.ends_at,
        });

        msg!("Market Created: {} with mu: {}, sigma: {}", market.title, market.mu, market.sigma);
        Ok(())
    }

    /// Place a prediction on a specific point.
    pub fn place_prediction(
        ctx: Context<PlacePrediction>,
        prediction_id: u64,
        point: f64,
        amount: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let prediction = &mut ctx.accounts.prediction;

        // Validation checks
        require!(!market.paused, GossipError::MarketPaused);
        require!(market.sigma > 0.0, GossipError::InvalidParams);
        require!(market.b > 0.0, GossipError::InvalidParams);
        require!(market.ends_at > Clock::get()?.unix_timestamp, GossipError::MarketEnded);

        // Point must be within 5 sigma of current mu
        require!(
            (point - market.mu).abs() <= 5.0 * market.sigma,
            GossipError::PointTooFar
        );

        // Transfer tokens from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        let weight = (amount as f64) / (market.b + 1.0);
        let old_mu = market.mu;
        
        // Tilt the market curve
        market.mu = old_mu + weight * (point - old_mu) / (market.sigma.powi(2) + 0.1);
        market.total_liquidity += amount;

        prediction.id = prediction_id;
        prediction.owner = ctx.accounts.user.key();
        prediction.market = market.key();
        prediction.point = point;
        prediction.amount = amount;
        prediction.initial_mu = old_mu;
        prediction.initial_sigma = market.sigma;
        prediction.created_at = Clock::get()?.unix_timestamp;
        prediction.settled = false;
        prediction.payout = 0;

        emit!(PredictionPlaced {
            market: market.key(),
            position: prediction.key(),
            owner: prediction.owner,
            point: prediction.point,
            amount: prediction.amount,
            new_mu: market.mu,
        });

        msg!("Prediction placed at {} with amount {}. New mu: {}", point, amount, market.mu);
        Ok(())
    }

    /// Resolve the market with a final outcome.
    pub fn resolve_market(
        ctx: Context<ResolveMarket>,
        final_outcome: f64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(!market.resolved, GossipError::AlreadyResolved);

        // 15-minute cooldown after market ends
        require!(
            Clock::get()?.unix_timestamp >= market.ends_at + 900,
            GossipError::ResolutionTooEarly
        );

        // Only oracle authority can resolve
        require!(
            ctx.accounts.oracle_authority.key() == market.oracle_authority,
            GossipError::UnauthorizedOracle
        );

        market.resolved = true;
        market.final_outcome = final_outcome;

        emit!(MarketResolved {
            market: market.key(),
            final_outcome: market.final_outcome,
            resolved_at: Clock::get()?.unix_timestamp,
        });

        msg!("Market Resolved: {} with final outcome: {}", market.title, final_outcome);
        Ok(())
    }

    /// Settle a user's prediction after market resolves
    pub fn settle_position(ctx: Context<SettlePosition>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let prediction = &mut ctx.accounts.prediction;

        require!(market.resolved, GossipError::NotResolved);
        require!(!prediction.settled, GossipError::AlreadySettled);

        // Quadratic payoff calculation
        let deviation = (market.final_outcome - prediction.point).abs();
        let k = 1.5; // Scaling factor for quadratic curve
        let max_deviation = k * prediction.initial_sigma;

        // Payoff ratio: 1.0 when exact, 0.0 when at max_deviation
        let payoff_ratio = if deviation >= max_deviation {
            0.0
        } else {
            1.0 - (deviation.powi(2) / max_deviation.powi(2))
        };

        // Payout: stake * (1 + payoff_ratio * multiplier)
        // Multiplier of 10x means max payout = 11x stake
        let multiplier = if payoff_ratio > 0.0 {
            1.0 + payoff_ratio * 10.0
        } else {
            0.0
        };

        let payout = (prediction.amount as f64 * multiplier) as u64;

        // Apply protocol fee (fee_bps from market)
        let fee = (payout as f64 * market.fee_bps as f64 / 10000.0) as u64;
        let payout_after_fee = payout - fee;

        prediction.payout = payout_after_fee;
        prediction.settled = true;

        emit!(PositionSettled {
            position: prediction.key(),
            owner: prediction.owner,
            payout: payout_after_fee,
        });

        if payout_after_fee > 0 {
            // Transfer winnings from vault to user
            let market_title = market.title.clone();
            let seeds = &[
                b"vault",
                market_title.as_bytes(),
                &[market.vault_bump],
            ];
            let signer = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
            token::transfer(cpi_ctx, payout_after_fee)?;
        }

        msg!("Settled position with payout: {} (fee: {})", payout_after_fee, fee);
        Ok(())
    }

    /// Update market parameters (oracle only)
    pub fn update_market(ctx: Context<UpdateMarket>, new_mu: f64, new_sigma: f64) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(new_sigma > 0.0, GossipError::InvalidParams);

        market.mu = new_mu;
        market.sigma = new_sigma;

        msg!("Updated market: mu={}, sigma={}", new_mu, new_sigma);
        Ok(())
    }

    pub fn pause_market(ctx: Context<UpdateMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            ctx.accounts.authority.key() == market.authority,
            GossipError::UnauthorizedOracle
        );
        market.paused = true;
        msg!("Market paused: {}", market.title);
        Ok(())
    }

    pub fn unpause_market(ctx: Context<UpdateMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            ctx.accounts.authority.key() == market.authority,
            GossipError::UnauthorizedOracle
        );
        market.paused = false;
        msg!("Market unpaused: {}", market.title);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, category: String, resolution_source: String)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + (4 + title.len()) + (4 + category.len()) + 8 + 8 + 8 + 8 + 1 + 8 + (4 + resolution_source.len()) + 8 + 32 + 1 + 32 + 2 + 1,
        seeds = [b"market", title.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = authority,
        seeds = [b"vault", title.as_bytes()],
        bump,
        token::mint = mint,
        token::authority = vault,
    )]
    pub vault: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(prediction_id: u64)]
pub struct PlacePrediction<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    #[account(
        init,
        payer = user,
        space = 8 + 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 1 + 8,
        seeds = [b"prediction", market.key().as_ref(), user.key().as_ref(), prediction_id.to_le_bytes().as_ref()],
        bump
    )]
    pub prediction: Account<'info, Prediction>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", market.title.as_bytes()],
        bump = market.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut, has_one = oracle_authority)]
    pub market: Account<'info, Market>,
    pub oracle_authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SettlePosition<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    
    #[account(mut, has_one = owner)]
    pub prediction: Account<'info, Prediction>,
    
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", market.title.as_bytes()],
        bump = market.vault_bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateMarket<'info> {
    #[account(mut, has_one = authority)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub creator: Pubkey,
    pub title: String,
    pub category: String,
    pub mu: f64,
    pub sigma: f64,
    pub b: f64,
    pub total_liquidity: u64,
    pub resolved: bool,
    pub final_outcome: f64,
    pub resolution_source: String,
    pub ends_at: i64,
    pub mint: Pubkey,
    pub vault_bump: u8,
    pub oracle_authority: Pubkey,
    pub fee_bps: u16,
    pub paused: bool,
}

#[account]
pub struct Prediction {
    pub id: u64,
    pub owner: Pubkey,
    pub market: Pubkey,
    pub point: f64,
    pub amount: u64,
    pub initial_mu: f64,
    pub initial_sigma: f64,
    pub created_at: i64,
    pub settled: bool,
    pub payout: u64,
}

#[error_code]
pub enum GossipError {
    #[msg("Market is already resolved")]
    AlreadyResolved,
    #[msg("Market has not been resolved yet")]
    NotResolved,
    #[msg("Position already settled")]
    AlreadySettled,
    #[msg("Prediction not found")]
    PredictionNotFound,
    #[msg("Invalid market parameters")]
    InvalidParams,
    #[msg("Resolution attempted too early (15min cooldown)")]
    ResolutionTooEarly,
    #[msg("Oracle authority not authorized to resolve")]
    UnauthorizedOracle,
    #[msg("Prediction point too far from market consensus")]
    PointTooFar,
    #[msg("Market is paused for trading")]
    MarketPaused,
    #[msg("Market has ended")]
    MarketEnded,
    #[msg("Position index not found")]
    PositionNotFound,
}
