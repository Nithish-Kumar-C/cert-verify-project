// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CertificateRegistry.sol";

contract DeployCertificateRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        CertificateRegistry registry = new CertificateRegistry();

        console.log("CertificateRegistry deployed at:", address(registry));
        console.log("Admin:", registry.admin());

        vm.stopBroadcast();
    }
}
