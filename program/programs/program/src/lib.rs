use anchor_lang::prelude::*;

declare_id!("9XhqEsnBFSLB1trNuq57wJjMtFyrPvcHUT2xQiFSbNKi");

#[program]
pub mod program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
