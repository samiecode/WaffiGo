// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SpendAndSaveReceiver} from "../src/SpendAndSaveReceiver.sol";

contract DeployReceiver is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Wormhole Relayer addresses for different networks
        // Celo Mainnet: 0x796Dff6D74F3E27060B71255Fe517BFb23C93eed
        // Celo Testnet (Alfajores): 0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84
        // Ethereum Sepolia: 0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470
        // Polygon Mumbai: 0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0
        
        address wormholeRelayer = vm.envOr(
            "WORMHOLE_RELAYER",
            address(0x796Dff6D74F3E27060B71255Fe517BFb23C93eed) // Default to Celo Mainnet
        );

        vm.startBroadcast(deployerPrivateKey);

        SpendAndSaveReceiver receiver = new SpendAndSaveReceiver(wormholeRelayer);

        console.log("SpendAndSaveReceiver deployed at:", address(receiver));
        console.log("Wormhole Relayer:", wormholeRelayer);

        vm.stopBroadcast();
    }
}
