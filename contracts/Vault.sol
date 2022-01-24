// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

/**
    @author Gonzalo L Petraglia
    @dev As it is now, the contract has a reentrancy vulnerability, your task is to solve it so that all of the tests
    pass
    @notice This contract is intended for academic purpose. DO NOT USE THIS IN PRODUCTION 
 */

contract Vault {
    /**
        @notice Event emitted when someone deposits ethers into the contract
        @param sender The address that sent the amount
        @param amount Amount sent in WEIs
     */
    event Deposited(address indexed sender, uint256 amount);

    /**
        @notice Event emitted when someone withdraws all their deposited ethers
        @param withdrawer The address that withdrew its WEIs
        @param amount Amount withdrawn
     */
    event Withdrawn(address indexed withdrawer, uint256 amount);

    /**
        @notice Variable that tracks the amount deposited by each address
     */
    mapping(address => uint256) public balance;

    /**
        @notice Receives payments, increments the balance variable accordingly, and 
        emits an event
     */
    receive() external payable {
        balance[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
        @notice Function that lets users withdraw the deposited WEIs
        If the user is withdrawing twice in a row, that's not a problem as it will
        just emit an event with 0 WEIs as the amount and it will transfer 0 WEIs
     */
    function withdraw() external payable {
        uint256 withdrawAmount = balance[msg.sender];
        (bool success, ) = payable(msg.sender).call{ value: withdrawAmount }("");
        require(success, "Transfer failed");
        balance[msg.sender] = 0;
        emit Withdrawn(msg.sender, withdrawAmount);
    }
}
