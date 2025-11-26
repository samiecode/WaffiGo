// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {WaffiContract} from "../src/WaffiContract.sol";

contract DeployV1 is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

      

        vm.startBroadcast(deployerPrivateKey);

        // Default savings rate: 10% (1000 bps)
        WaffiContract waffiContract = new WaffiContract(1000);

        console.log("WaffiContract deployed at:", address(waffiContract));


        vm.stopBroadcast();
    }
}
