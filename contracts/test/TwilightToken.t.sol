// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {TwilightToken} from "../src/TwilightToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TwilightTokenTest is Test {
    TwilightToken internal token;

    address internal owner = makeAddr("owner");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    uint256 internal constant INITIAL_SUPPLY = 1_000_000e18;

    event FaucetClaimed(address indexed account, uint256 amount);

    function setUp() public {
        token = new TwilightToken(owner, INITIAL_SUPPLY);
    }

    function test_Metadata() public view {
        assertEq(token.name(), "Twilight");
        assertEq(token.symbol(), "TWLT");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(token.owner(), owner);
    }

    function test_Faucet_MintsFixedAmount() public {
        vm.expectEmit(true, false, false, true);
        emit FaucetClaimed(alice, token.FAUCET_AMOUNT());
        vm.prank(alice);
        token.faucet();

        assertEq(token.balanceOf(alice), token.FAUCET_AMOUNT());
        assertEq(token.lastFaucetClaim(alice), block.timestamp);
    }

    function test_Faucet_FirstClaimWorksAtGenesisTimestamp() public {
        // lastFaucetClaim starts at 0; the cooldown must not gate the very first claim even when
        // block.timestamp is smaller than FAUCET_COOLDOWN.
        vm.warp(1);
        vm.prank(alice);
        token.faucet();
        assertEq(token.balanceOf(alice), token.FAUCET_AMOUNT());
    }

    function test_Faucet_RevertsDuringCooldown() public {
        vm.startPrank(alice);
        token.faucet();
        uint256 availableAt = block.timestamp + token.FAUCET_COOLDOWN();

        vm.expectRevert(abi.encodeWithSelector(TwilightToken.FaucetCooldownActive.selector, availableAt));
        token.faucet();

        // One second before the cooldown elapses it is still blocked.
        vm.warp(availableAt - 1);
        vm.expectRevert(abi.encodeWithSelector(TwilightToken.FaucetCooldownActive.selector, availableAt));
        token.faucet();
        vm.stopPrank();
    }

    function test_Faucet_SucceedsExactlyAtCooldownBoundary() public {
        vm.startPrank(alice);
        token.faucet();
        vm.warp(block.timestamp + token.FAUCET_COOLDOWN());
        token.faucet();
        vm.stopPrank();

        assertEq(token.balanceOf(alice), token.FAUCET_AMOUNT() * 2);
    }

    function test_Faucet_IsRateLimitedPerAddress() public {
        vm.prank(alice);
        token.faucet();

        // Bob is unaffected by Alice's cooldown.
        vm.prank(bob);
        token.faucet();

        assertEq(token.balanceOf(bob), token.FAUCET_AMOUNT());
    }

    function test_Faucet_RevertsWhenMaxSupplyReached() public {
        TwilightToken full = new TwilightToken(owner, token.MAX_SUPPLY());
        vm.expectRevert(TwilightToken.MaxSupplyExceeded.selector);
        vm.prank(alice);
        full.faucet();
    }

    function test_NextFaucetClaim() public {
        assertEq(token.nextFaucetClaim(alice), 0);
        vm.prank(alice);
        token.faucet();
        assertEq(token.nextFaucetClaim(alice), block.timestamp + token.FAUCET_COOLDOWN());
    }

    function test_Mint_OnlyOwner() public {
        vm.prank(owner);
        token.mint(alice, 5e18);
        assertEq(token.balanceOf(alice), 5e18);

        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        vm.prank(alice);
        token.mint(alice, 5e18);
    }

    function test_Mint_RevertsAboveMaxSupply() public {
        // Read the cap before arming expectRevert: the getter is itself a call.
        uint256 cap = token.MAX_SUPPLY();
        vm.expectRevert(TwilightToken.MaxSupplyExceeded.selector);
        vm.prank(owner);
        token.mint(alice, cap);
    }

    function test_Constructor_RevertsAboveMaxSupply() public {
        vm.expectRevert(TwilightToken.MaxSupplyExceeded.selector);
        new TwilightToken(owner, 100_000_001e18);
    }

    /// @dev Supply must only ever grow by exactly FAUCET_AMOUNT per claim, for any caller.
    function testFuzz_Faucet_SupplyGrowsByFixedAmount(address caller) public {
        vm.assume(caller != address(0));
        uint256 before = token.totalSupply();
        vm.prank(caller);
        token.faucet();
        assertEq(token.totalSupply(), before + token.FAUCET_AMOUNT());
    }
}
