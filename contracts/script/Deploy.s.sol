// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TwilightToken} from "../src/TwilightToken.sol";
import {TwilightStaking} from "../src/TwilightStaking.sol";

/// @title Deploy
/// @notice Deploys TWLT + the staking pool and opens a reward period in one transaction batch.
/// @dev Writes `contracts/deployments/<chain>.json`, which `script/sync-deployment.mjs` turns into
///      the single JSON the frontend imports. Addresses are never hand-copied anywhere.
contract Deploy is Script {
    /// @notice TWLT minted to the deployer at genesis.
    uint256 public constant INITIAL_SUPPLY = 10_000_000e18;

    /// @notice TWLT handed to the staking pool as the first reward period's emission.
    uint256 public constant REWARD_AMOUNT = 1_000_000e18;

    /// @notice Length of the first reward period.
    uint256 public constant REWARD_DURATION = 365 days;

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        TwilightToken token = new TwilightToken(deployer, INITIAL_SUPPLY);
        TwilightStaking staking = new TwilightStaking(deployer, address(token));

        // Open the first reward period so the dashboard shows live, real accrual from block one.
        token.approve(address(staking), REWARD_AMOUNT);
        staking.notifyRewardAmount(REWARD_AMOUNT, REWARD_DURATION);

        vm.stopBroadcast();

        console2.log("TwilightToken  ", address(token));
        console2.log("TwilightStaking", address(staking));
        console2.log("deployer       ", deployer);

        _write(address(token), address(staking), deployer);
    }

    /// @dev Serialises the deployment record next to the contracts.
    ///
    ///      Deliberately does NOT record `block.number`. On Arbitrum the `NUMBER` opcode returns
    ///      an estimate of the *L1* block, not the L2 block, so writing it here would give the
    ///      frontend an origin ~283M blocks adrift and make every `eth_getLogs` scan the entire
    ///      chain. The L2 deployment block is read from the broadcast receipts instead, by
    ///      script/sync-deployment.mjs.
    function _write(address token, address staking, address deployer) internal {
        string memory obj = "deployment";
        vm.serializeUint(obj, "chainId", block.chainid);
        vm.serializeAddress(obj, "deployer", deployer);
        vm.serializeAddress(obj, "twilightToken", token);
        vm.serializeAddress(obj, "twilightStaking", staking);
        vm.serializeUint(obj, "rewardAmount", REWARD_AMOUNT);
        vm.serializeUint(obj, "rewardDuration", REWARD_DURATION);
        string memory json = vm.serializeUint(obj, "deployedAt", block.timestamp);

        string memory path =
            string.concat(vm.projectRoot(), "/deployments/", vm.toString(block.chainid), ".json");
        vm.writeJson(json, path);
        console2.log("wrote", path);
    }
}
