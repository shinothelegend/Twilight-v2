// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {TwilightToken} from "../src/TwilightToken.sol";
import {TwilightStaking} from "../src/TwilightStaking.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TwilightStakingTest is Test {
    TwilightToken internal token;
    TwilightStaking internal staking;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant OWNER_SUPPLY = 5_000_000e18;
    uint256 internal constant REWARD = 604_800e18; // 1 TWLT per second for a week
    uint256 internal constant DURATION = 7 days;

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event RewardPaid(address indexed account, uint256 amount);

    function setUp() public {
        token = new TwilightToken(owner, OWNER_SUPPLY);
        staking = new TwilightStaking(owner, address(token));

        // Fund the test users from the owner's supply.
        vm.startPrank(owner);
        token.transfer(alice, 10_000e18);
        token.transfer(bob, 10_000e18);
        vm.stopPrank();

        vm.prank(alice);
        token.approve(address(staking), type(uint256).max);
        vm.prank(bob);
        token.approve(address(staking), type(uint256).max);
    }

    function _startRewards() internal {
        vm.startPrank(owner);
        token.approve(address(staking), REWARD);
        staking.notifyRewardAmount(REWARD, DURATION);
        vm.stopPrank();
    }

    // ---------------------------------------------------------------- staking

    function test_Stake_UpdatesBalancesAndEmits() public {
        vm.expectEmit(true, false, false, true);
        emit Staked(alice, 1_000e18);
        vm.prank(alice);
        staking.stake(1_000e18);

        assertEq(staking.stakedBalanceOf(alice), 1_000e18);
        assertEq(staking.totalStaked(), 1_000e18);
        assertEq(token.balanceOf(address(staking)), 1_000e18);
        assertEq(token.balanceOf(alice), 9_000e18);
    }

    function test_Stake_RevertsOnZero() public {
        vm.expectRevert(TwilightStaking.ZeroAmount.selector);
        vm.prank(alice);
        staking.stake(0);
    }

    function test_Withdraw_ReturnsPrincipal() public {
        vm.startPrank(alice);
        staking.stake(1_000e18);

        vm.expectEmit(true, false, false, true);
        emit Withdrawn(alice, 400e18);
        staking.withdraw(400e18);
        vm.stopPrank();

        assertEq(staking.stakedBalanceOf(alice), 600e18);
        assertEq(staking.totalStaked(), 600e18);
        assertEq(token.balanceOf(alice), 9_400e18);
    }

    function test_Withdraw_RevertsAboveStake() public {
        vm.startPrank(alice);
        staking.stake(1_000e18);
        vm.expectRevert(TwilightStaking.InsufficientStake.selector);
        staking.withdraw(1_000e18 + 1);
        vm.stopPrank();
    }

    function test_Withdraw_RevertsOnZero() public {
        vm.expectRevert(TwilightStaking.ZeroAmount.selector);
        vm.prank(alice);
        staking.withdraw(0);
    }

    // ---------------------------------------------------------- reward accrual

    function test_RewardAccrual_SingleStakerEarnsWholeEmission() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        _startRewards();

        assertEq(staking.earned(alice), 0);

        vm.warp(block.timestamp + 1 days);
        // rewardRate == REWARD / DURATION == 1e18 per second.
        assertApproxEqRel(staking.earned(alice), 86_400e18, 1e12);

        vm.warp(block.timestamp + 6 days);
        assertApproxEqRel(staking.earned(alice), REWARD, 1e12);
    }

    function test_RewardAccrual_StopsAtPeriodFinish() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        _startRewards();

        vm.warp(block.timestamp + DURATION + 30 days);
        assertApproxEqRel(staking.earned(alice), REWARD, 1e12);
        assertEq(staking.remainingRewards(), 0);
    }

    function test_RewardAccrual_SplitsProRataByStakeAndTime() public {
        _startRewards();

        vm.prank(alice);
        staking.stake(1_000e18);

        // Alice alone for a day.
        vm.warp(block.timestamp + 1 days);

        vm.prank(bob);
        staking.stake(3_000e18);

        // Then a day shared 25% / 75%.
        vm.warp(block.timestamp + 1 days);

        uint256 perDay = 86_400e18;
        assertApproxEqRel(staking.earned(alice), perDay + perDay / 4, 1e12);
        assertApproxEqRel(staking.earned(bob), (perDay * 3) / 4, 1e12);
    }

    function test_RewardAccrual_PausesWhenPoolIsEmpty() public {
        _startRewards();

        // Nobody staked for a day: those emissions are simply not accrued to anyone.
        vm.warp(block.timestamp + 1 days);

        vm.prank(alice);
        staking.stake(1_000e18);
        assertEq(staking.earned(alice), 0);

        vm.warp(block.timestamp + 1 days);
        assertApproxEqRel(staking.earned(alice), 86_400e18, 1e12);
    }

    function test_ClaimRewards_TransfersAndZeroesAccrual() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        _startRewards();
        vm.warp(block.timestamp + 1 days);

        uint256 expected = staking.earned(alice);
        uint256 balanceBefore = token.balanceOf(alice);

        vm.expectEmit(true, false, false, true);
        emit RewardPaid(alice, expected);
        vm.prank(alice);
        staking.claimRewards();

        assertEq(token.balanceOf(alice), balanceBefore + expected);
        assertEq(staking.earned(alice), 0);
        // Principal is untouched by a claim.
        assertEq(staking.stakedBalanceOf(alice), 1_000e18);
    }

    function test_ClaimRewards_NoOpWhenNothingAccrued() public {
        uint256 balanceBefore = token.balanceOf(alice);
        vm.prank(alice);
        staking.claimRewards();
        assertEq(token.balanceOf(alice), balanceBefore);
    }

    function test_Withdraw_KeepsRewardsClaimable() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        _startRewards();
        vm.warp(block.timestamp + 1 days);

        vm.prank(alice);
        staking.withdraw(1_000e18);

        uint256 pending = staking.earned(alice);
        assertApproxEqRel(pending, 86_400e18, 1e12);

        // No stake left, so nothing further accrues.
        vm.warp(block.timestamp + 1 days);
        assertEq(staking.earned(alice), pending);
    }

    function test_Exit_WithdrawsAndClaims() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        _startRewards();
        vm.warp(block.timestamp + 1 days);

        uint256 expected = staking.earned(alice);
        vm.prank(alice);
        staking.exit();

        assertEq(staking.stakedBalanceOf(alice), 0);
        assertEq(staking.earned(alice), 0);
        assertEq(token.balanceOf(alice), 10_000e18 + expected);
    }

    function test_Exit_WorksWithNoStake() public {
        vm.prank(alice);
        staking.exit();
        assertEq(staking.stakedBalanceOf(alice), 0);
    }

    // ------------------------------------------------------- reward accounting

    function test_RewardPool_NeverConsumesPrincipal() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        _startRewards();

        assertEq(staking.rewardPoolBalance(), REWARD);
        assertEq(token.balanceOf(address(staking)), REWARD + 1_000e18);

        vm.warp(block.timestamp + DURATION);
        vm.prank(alice);
        staking.claimRewards();

        // Everything paid out came from the reward pool; the stake is still fully backed.
        assertGe(token.balanceOf(address(staking)), staking.totalStaked());
    }

    function test_NotifyRewardAmount_RollsOverLeftover() public {
        _startRewards();
        uint256 rateBefore = staking.rewardRate();

        // Halfway through, add the same reward again over a fresh full duration.
        vm.warp(block.timestamp + DURATION / 2);
        vm.startPrank(owner);
        token.approve(address(staking), REWARD);
        staking.notifyRewardAmount(REWARD, DURATION);
        vm.stopPrank();

        // leftover == half of REWARD, so the new rate is 1.5x the old one.
        assertApproxEqRel(staking.rewardRate(), (rateBefore * 3) / 2, 1e12);
        assertEq(staking.periodFinish(), block.timestamp + DURATION);
    }

    function test_NotifyRewardAmount_RevertsWhenRateTruncatesToZero() public {
        // A reward smaller than the duration in seconds would emit 0 per second.
        vm.prank(owner);
        token.approve(address(staking), type(uint256).max);

        vm.expectRevert(TwilightStaking.RewardRateTooLow.selector);
        vm.prank(owner);
        staking.notifyRewardAmount(DURATION - 1, DURATION);
    }

    /// @dev The pool must always hold at least principal plus everything it has promised.
    function test_Solvency_PoolCoversPrincipalAndPromisedRewards() public {
        vm.prank(alice);
        staking.stake(1_000e18);
        vm.prank(bob);
        staking.stake(3_000e18);
        _startRewards();

        for (uint256 i = 0; i < 7; i++) {
            vm.warp(block.timestamp + 1 days);
            uint256 promised = staking.earned(alice) + staking.earned(bob) + staking.remainingRewards();
            assertGe(token.balanceOf(address(staking)), staking.totalStaked() + promised);
        }
    }

    function test_NotifyRewardAmount_OnlyOwner() public {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        vm.prank(alice);
        staking.notifyRewardAmount(REWARD, DURATION);
    }

    function test_NotifyRewardAmount_RevertsOnZeroDuration() public {
        vm.expectRevert(TwilightStaking.ZeroDuration.selector);
        vm.prank(owner);
        staking.notifyRewardAmount(REWARD, 0);
    }

    function test_NotifyRewardAmount_RevertsOnZeroReward() public {
        vm.expectRevert(TwilightStaking.ZeroAmount.selector);
        vm.prank(owner);
        staking.notifyRewardAmount(0, DURATION);
    }

    function test_RecoverERC20_RejectsStakingToken() public {
        vm.expectRevert(TwilightStaking.CannotRecoverStakingToken.selector);
        vm.prank(owner);
        staking.recoverERC20(address(token), 1);
    }

    function test_RecoverERC20_RescuesStrayToken() public {
        StrayToken stray = new StrayToken();
        stray.mint(address(staking), 500e18);

        vm.prank(owner);
        staking.recoverERC20(address(stray), 500e18);
        assertEq(stray.balanceOf(owner), 500e18);
    }

    // ------------------------------------------------------------- reentrancy

    /// @dev Deploys the staking contract against a token whose `transfer` calls back into
    ///      `withdraw`. The nonReentrant guard must make the reentrant call revert.
    function test_Withdraw_IsReentrancyGuarded() public {
        ReentrantToken evil = new ReentrantToken();
        TwilightStaking pool = new TwilightStaking(owner, address(evil));
        ReentrantAttacker attacker = new ReentrantAttacker(pool, evil);

        evil.mint(address(attacker), 100e18);
        evil.setTarget(address(pool), address(attacker));

        attacker.deposit(100e18);

        vm.expectRevert(ReentrantToken.ReentrantCallReverted.selector);
        attacker.attack(50e18);
    }

    /// @dev Same setup for the reward path.
    function test_ClaimRewards_IsReentrancyGuarded() public {
        ReentrantToken evil = new ReentrantToken();
        TwilightStaking pool = new TwilightStaking(owner, address(evil));
        ReentrantAttacker attacker = new ReentrantAttacker(pool, evil);

        evil.mint(address(attacker), 100e18);
        evil.mint(owner, 1_000e18);

        attacker.deposit(100e18);

        vm.startPrank(owner);
        evil.approve(address(pool), 1_000e18);
        pool.notifyRewardAmount(1_000e18, 1_000);
        vm.stopPrank();

        vm.warp(block.timestamp + 500);
        evil.setTarget(address(pool), address(attacker));
        evil.setMode(ReentrantToken.Mode.Claim);

        vm.expectRevert(ReentrantToken.ReentrantCallReverted.selector);
        attacker.claim();
    }

    // ------------------------------------------------------------------ fuzz

    /// @dev Total accrued rewards must never exceed what the period actually emitted.
    function testFuzz_AccrualNeverExceedsEmission(uint96 aliceStake, uint96 bobStake, uint32 elapsed) public {
        aliceStake = uint96(bound(aliceStake, 1e18, 10_000e18));
        bobStake = uint96(bound(bobStake, 1e18, 10_000e18));
        elapsed = uint32(bound(elapsed, 1, DURATION));

        vm.prank(alice);
        staking.stake(aliceStake);
        vm.prank(bob);
        staking.stake(bobStake);
        _startRewards();

        vm.warp(block.timestamp + elapsed);

        uint256 totalEarned = staking.earned(alice) + staking.earned(bob);
        assertLe(totalEarned, staking.rewardRate() * elapsed + 1e6);
        assertLe(totalEarned, staking.rewardPoolBalance());
    }
}

// ---------------------------------------------------------------- test doubles

/// @dev A plain ERC-20 that was never meant to be here, used to test {recoverERC20}.
contract StrayToken is ERC20 {
    constructor() ERC20("Stray", "STRAY") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @dev ERC-20 whose transfers call back into the staking pool, to prove the guard holds.
contract ReentrantToken is ERC20 {
    enum Mode {
        Withdraw,
        Claim
    }

    address public pool;
    address public attacker;
    Mode public mode;
    bool private entered;

    error ReentrantCallReverted();

    constructor() ERC20("Evil", "EVIL") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setTarget(address pool_, address attacker_) external {
        pool = pool_;
        attacker = attacker_;
    }

    function setMode(Mode mode_) external {
        mode = mode_;
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        // Only re-enter on the pool's outbound transfer to the attacker.
        if (from == pool && to == attacker && !entered) {
            entered = true;
            (bool ok,) = pool.call(
                mode == Mode.Withdraw
                    ? abi.encodeWithSignature("withdraw(uint256)", uint256(1))
                    : abi.encodeWithSignature("claimRewards()")
            );
            entered = false;
            if (!ok) revert ReentrantCallReverted();
        }
    }
}

/// @dev Holds a stake in a pool backed by {ReentrantToken} and triggers the reentrant path.
contract ReentrantAttacker {
    TwilightStaking public immutable pool;
    ReentrantToken public immutable token;

    constructor(TwilightStaking pool_, ReentrantToken token_) {
        pool = pool_;
        token = token_;
    }

    function deposit(uint256 amount) external {
        token.approve(address(pool), amount);
        pool.stake(amount);
    }

    function attack(uint256 amount) external {
        pool.withdraw(amount);
    }

    function claim() external {
        pool.claimRewards();
    }
}
