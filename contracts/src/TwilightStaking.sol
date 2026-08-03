// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title TwilightStaking
/// @notice Single-sided TWLT staking with linearly accruing rewards.
/// @dev Reimplementation of the Synthetix `StakingRewards` accumulator pattern: a global
///      `rewardPerTokenStored` accumulator advances with time, and each account's debt is
///      snapshotted in `userRewardPerTokenPaid`, making accrual O(1) per user regardless of
///      how many stakers exist.
///
///      Staking token and reward token are the same asset (TWLT), so this contract keeps
///      `totalStaked` separate from its raw balance and only ever pays rewards out of
///      `balanceOf(this) - totalStaked`. Principal can therefore never be paid out as
///      someone else's reward, which is the main hazard of a same-token pool.
contract TwilightStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Fixed-point scalar for the reward-per-token accumulator.
    uint256 private constant PRECISION = 1e18;

    /// @notice Token that is both staked and paid out as reward.
    IERC20 public immutable stakingToken;

    /// @notice Reward emitted per second while a reward period is active.
    uint256 public rewardRate;

    /// @notice Timestamp at which the current reward period ends.
    uint256 public periodFinish;

    /// @notice Last time {rewardPerTokenStored} was brought up to date.
    uint256 public lastUpdateTime;

    /// @notice Accumulated reward per staked token, scaled by {PRECISION}.
    uint256 public rewardPerTokenStored;

    /// @notice Total TWLT currently staked by all accounts.
    uint256 public totalStaked;

    /// @notice Accumulator value already accounted for, per account.
    mapping(address account => uint256 rewardPerToken) public userRewardPerTokenPaid;

    /// @notice Reward earned but not yet claimed, per account.
    mapping(address account => uint256 amount) public rewards;

    /// @notice Amount staked, per account.
    mapping(address account => uint256 amount) public stakedBalanceOf;

    /// @notice Emitted when an account stakes tokens.
    event Staked(address indexed account, uint256 amount);

    /// @notice Emitted when an account withdraws staked principal.
    event Withdrawn(address indexed account, uint256 amount);

    /// @notice Emitted when accrued rewards are transferred to an account.
    event RewardPaid(address indexed account, uint256 amount);

    /// @notice Emitted when the owner funds a new reward period.
    event RewardAdded(uint256 reward, uint256 duration, uint256 periodFinish);

    /// @notice Emitted when the owner rescues a non-staking ERC-20 sent here by mistake.
    event Recovered(address indexed token, uint256 amount);

    /// @notice Thrown when an amount argument is zero.
    error ZeroAmount();

    /// @notice Thrown when withdrawing more than the caller has staked.
    error InsufficientStake();

    /// @notice Thrown when a reward period is configured with a zero duration.
    error ZeroDuration();

    /// @notice Thrown when `reward / duration` truncates to zero, which would emit nothing at all.
    error RewardRateTooLow();

    /// @notice Thrown when attempting to rescue the staking token itself.
    error CannotRecoverStakingToken();

    /// @dev Brings the global accumulator and `account`'s snapshot up to date before state changes.
    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    /// @param initialOwner Address allowed to fund reward periods.
    /// @param stakingToken_ TWLT token address.
    constructor(address initialOwner, address stakingToken_) Ownable(initialOwner) {
        stakingToken = IERC20(stakingToken_);
    }

    /// @notice Last timestamp at which rewards are still accruing.
    /// @return The current time, clamped to {periodFinish}.
    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    /// @notice Current value of the reward-per-token accumulator, scaled by 1e18.
    /// @return Reward owed per staked token since inception.
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;
        uint256 elapsed = lastTimeRewardApplicable() - lastUpdateTime;
        return rewardPerTokenStored + (elapsed * rewardRate * PRECISION) / totalStaked;
    }

    /// @notice Rewards `account` could claim right now.
    /// @param account Address to query.
    /// @return Claimable TWLT amount.
    function earned(address account) public view returns (uint256) {
        uint256 delta = rewardPerToken() - userRewardPerTokenPaid[account];
        return rewards[account] + (stakedBalanceOf[account] * delta) / PRECISION;
    }

    /// @notice Reward still scheduled to be emitted before the current period ends.
    /// @return Remaining TWLT emissions; 0 once the period has finished.
    function remainingRewards() external view returns (uint256) {
        if (block.timestamp >= periodFinish) return 0;
        return (periodFinish - block.timestamp) * rewardRate;
    }

    /// @notice TWLT held by this contract that is not staked principal, i.e. the reward pool.
    /// @return Unstaked TWLT balance available to pay rewards.
    function rewardPoolBalance() public view returns (uint256) {
        return stakingToken.balanceOf(address(this)) - totalStaked;
    }

    /// @notice Stake TWLT into the pool. Caller must have approved this contract first.
    /// @param amount TWLT amount to stake (18 decimals).
    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();

        totalStaked += amount;
        stakedBalanceOf[msg.sender] += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Withdraw staked principal. Accrued rewards stay claimable via {claimRewards}.
    /// @param amount TWLT amount to withdraw (18 decimals).
    function withdraw(uint256 amount) public nonReentrant updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        if (amount > stakedBalanceOf[msg.sender]) revert InsufficientStake();

        totalStaked -= amount;
        stakedBalanceOf[msg.sender] -= amount;

        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Transfer all rewards accrued by the caller.
    /// @dev No-op (no event, no transfer) when nothing has accrued, so the UI can call it safely.
    function claimRewards() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward == 0) return;

        rewards[msg.sender] = 0;
        stakingToken.safeTransfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    /// @notice Withdraw the caller's entire stake and claim rewards in one transaction.
    function exit() external {
        uint256 staked = stakedBalanceOf[msg.sender];
        if (staked != 0) withdraw(staked);
        claimRewards();
    }

    /// @notice Fund a reward period of `duration` seconds, pulling `reward` TWLT from the owner.
    /// @dev Any reward left over from an unfinished period is rolled into the new rate, matching
    ///      the Synthetix behaviour.
    ///
    ///      Solvency is guaranteed by construction rather than by a runtime balance check: the
    ///      reward is pulled in atomically here, and `rewardRate * duration <= reward + leftover`
    ///      because integer division truncates down. Combined with paying rewards only out of
    ///      `balanceOf(this) - totalStaked`, the pool can always cover everything it has promised.
    /// @param reward TWLT to distribute over the period.
    /// @param duration Length of the reward period in seconds.
    function notifyRewardAmount(uint256 reward, uint256 duration)
        external
        onlyOwner
        updateReward(address(0))
    {
        if (duration == 0) revert ZeroDuration();
        if (reward == 0) revert ZeroAmount();

        stakingToken.safeTransferFrom(msg.sender, address(this), reward);

        if (block.timestamp >= periodFinish) {
            rewardRate = reward / duration;
        } else {
            uint256 leftover = (periodFinish - block.timestamp) * rewardRate;
            rewardRate = (reward + leftover) / duration;
        }

        if (rewardRate == 0) revert RewardRateTooLow();

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + duration;
        emit RewardAdded(reward, duration, periodFinish);
    }

    /// @notice Rescue an unrelated ERC-20 accidentally sent to this contract.
    /// @param token Token to rescue. Must not be the staking token.
    /// @param amount Amount to send to the owner.
    function recoverERC20(address token, uint256 amount) external onlyOwner {
        if (token == address(stakingToken)) revert CannotRecoverStakingToken();
        IERC20(token).safeTransfer(owner(), amount);
        emit Recovered(token, amount);
    }
}
