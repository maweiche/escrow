use anchor_lang::prelude::*;

mod context;
use context::*;
mod state;
use state::*;

declare_id!("5wTNXXX2CXvz9wQQd3sK3KQtSBRc6Micfm9uGZoMsprA");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, amount: u64, receive: u64) -> Result<()> {
        ctx.accounts.save_escrow(seed, receive, ctx.bumps.escrow)?;
        ctx.accounts.deposit_to_vault(amount)
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.transfer_to_maker()?;
        ctx.accounts.withdraw_and_close()
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        ctx.accounts.withdraw_and_close()
    }
}


// Escrow
// init
// maker
// maker_token
// taker_token
// offer_amount
// seed
// auth_bump
// vault_bump
// escrow_bump

// Make  --- maker_ata_a -> mint_a -> vault
// init
// - seeds-maker
// -mint account-mint boolreceive
// -bump

// Take
// Deoposit / Withdraw / Close Vault