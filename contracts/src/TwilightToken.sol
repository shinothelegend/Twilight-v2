// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title TwilightToken (TWLT)
/// @notice The test ERC-20 used across the Twilight DeFi demo on Arbitrum Sepolia.
/// @dev Token accounting is inherited from OpenZeppelin's audited ERC20. The only additions are a
///      rate-limited public faucet (so anyone can self-serve test tokens) and a capped owner mint
///      used to fund the staking reward pool. Supply is hard-capped by {MAX_SUPPLY}.
contract TwilightToken is ERC20, Ownable {
    /// @notice Amount minted per successful {faucet} call.
    uint256 public constant FAUCET_AMOUNT = 100e18;

    /// @notice Minimum time an address must wait between {faucet} calls.
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    /// @notice Hard cap on total supply. Enforced by both {faucet} and {mint}.
    uint256 public constant MAX_SUPPLY = 100_000_000e18;

    /// @notice Unix timestamp of an address's most recent faucet claim (0 if never claimed).
    mapping(address account => uint256 timestamp) public lastFaucetClaim;

    /// @notice Emitted when an address successfully claims from the faucet.
    event FaucetClaimed(address indexed account, uint256 amount);

    /// @notice Thrown when the caller's faucet cooldown has not elapsed yet.
    /// @param availableAt Timestamp at which the caller may claim again.
    error FaucetCooldownActive(uint256 availableAt);

    /// @notice Thrown when a mint would push total supply past {MAX_SUPPLY}.
    error MaxSupplyExceeded();

    /// @param initialOwner Address receiving ownership and the initial supply.
    /// @param initialSupply Tokens minted to `initialOwner` at deploy time (used to seed rewards).
    constructor(address initialOwner, uint256 initialSupply) ERC20("Twilight", "TWLT") Ownable(initialOwner) {
        if (initialSupply > MAX_SUPPLY) revert MaxSupplyExceeded();
        if (initialSupply != 0) _mint(initialOwner, initialSupply);
    }

    /// @notice Mint {FAUCET_AMOUNT} TWLT to the caller, at most once per {FAUCET_COOLDOWN}.
    /// @dev Permissionless by design so hackathon judges can test without being funded manually.
    ///      Uses a per-address timestamp rather than a global limit; the first claim is always free.
    function faucet() external {
        uint256 last = lastFaucetClaim[msg.sender];
        if (last != 0 && block.timestamp < last + FAUCET_COOLDOWN) {
            revert FaucetCooldownActive(last + FAUCET_COOLDOWN);
        }
        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) revert MaxSupplyExceeded();

        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /// @notice Timestamp at which `account` may next call {faucet}.
    /// @param account Address to query.
    /// @return Unix timestamp; 0 when the address has never claimed and can claim immediately.
    function nextFaucetClaim(address account) external view returns (uint256) {
        uint256 last = lastFaucetClaim[account];
        return last == 0 ? 0 : last + FAUCET_COOLDOWN;
    }

    /// @notice Owner-only mint, used to top up the staking reward pool.
    /// @param to Recipient of the newly minted tokens.
    /// @param amount Amount to mint, in wei-denominated TWLT (18 decimals).
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) revert MaxSupplyExceeded();
        _mint(to, amount);
    }
}
