use soroban_sdk::{contract, contractimpl, Address, Env, String};
use stellar_access::ownable::{self as ownable, Ownable};
use stellar_macros::{default_impl, only_owner};
use stellar_tokens::non_fungible::{
    burnable::NonFungibleBurnable, Base, ContractOverrides, NonFungibleToken,
};

#[contract]
pub struct NonFungibleTokenContract;

#[contractimpl]
impl NonFungibleTokenContract {
    pub fn __constructor(e: &Env, owner: Address) {
        // Set token metadata
        Base::set_metadata(
            e,
            String::from_str(e, "stellar-workshop.vercel.app"),
            String::from_str(e, "Donation NFT"),
            String::from_str(e, "DNFT"),
        );

        // Set the contract owner
        ownable::set_owner(e, &owner);
    }

    #[only_owner]
    pub fn mint(e: &Env, to: Address) -> u32 {
        Base::sequential_mint(e, &to)
    }
}

#[default_impl]
#[contractimpl]
impl NonFungibleToken for NonFungibleTokenContract {
    type ContractType = Base;
}

#[default_impl]
#[contractimpl]
impl NonFungibleBurnable for NonFungibleTokenContract {}

#[default_impl]
#[contractimpl]
impl Ownable for NonFungibleTokenContract {}