use anchor_lang::prelude::*;

declare_id!("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");

#[program]
pub mod gossip {
    use super::*;

    /// Initialize a new continuous prediction market.
    pub fn create_market(
        ctx: Context<CreateMarket>,
        title: String,
        initial_mu: f64,
        initial_sigma: f64,
        b: f64, // Liquidity parameter for LMSR
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        market.authority = ctx.accounts.authority.key();
        market.title = title;
        market.mu = initial_mu;
        market.sigma = initial_sigma;
        market.b = b;
        market.total_liquidity = 0;
        market.resolved = false;
        market.final_outcome = 0.0;

        msg!("Market Created: {} with mu: {}, sigma: {}", market.title, market.mu, market.sigma);
        Ok(())
    }

    /// Place a prediction on a specific point.
    pub fn place_prediction(
        ctx: Context<PlacePrediction>,
        point: f64,
        amount: u64,
    ) -> Result<()> {
        let market = &mut ctx.accounts.market;
        let prediction = &mut ctx.accounts.prediction;

        // In a real implementation, we would transfer tokens (CASH) here.
        // For the hackathon, we simulate the state change.
        
        // Tilt logic: The prediction moves the mean.
        // The weight of the tilt is proportional to the amount and inversely proportional to market liquidity b.
        let weight = (amount as f64) / (market.b + 1.0);
        let old_mu = market.mu;
        
        // Influence factor decreases as sigma decreases (higher certainty)
        market.mu = old_mu + weight * (point - old_mu) / (market.sigma.powi(2) + 0.1);
        
        market.total_liquidity += amount;

        prediction.owner = ctx.accounts.user.key();
        prediction.market = market.key();
        prediction.point = point;
        prediction.amount = amount;
        prediction.initial_mu = old_mu;
        prediction.initial_sigma = market.sigma;

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
        
        market.resolved = true;
        market.final_outcome = final_outcome;

        msg!("Market Resolved: {} with final outcome: {}", market.title, final_outcome);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateMarket<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + title.len()) + 8 + 8 + 8 + 8 + 1 + 8,
        seeds = [b"market", title.as_bytes()],
        bump
    )]
    pub market: Account<'info, Market>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlacePrediction<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8,
        seeds = [b"prediction", market.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub prediction: Account<'info, Prediction>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveMarket<'info> {
    #[account(mut, has_one = authority)]
    pub market: Account<'info, Market>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Market {
    pub authority: Pubkey,
    pub title: String,
    pub mu: f64,             // Mean of the Gaussian distribution
    pub sigma: f64,          // Standard deviation
    pub b: f64,              // Liquidity parameter (LMSR)
    pub total_liquidity: u64,
    pub resolved: bool,
    pub final_outcome: f64,
}

#[account]
pub struct Prediction {
    pub owner: Pubkey,
    pub market: Pubkey,
    pub point: f64,          // The point the user predicted
    pub amount: u64,         // Amount bet
    pub initial_mu: f64,     // Market mu at the time of bet
    pub initial_sigma: f64,  // Market sigma at the time of bet
}

#[error_code]
pub enum GossipError {
    #[msg("Market is already resolved")]
    AlreadyResolved,
}
