// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

/* ------ Excercise requeriments ------
 - A “receive” function 
 - A custom payable function(named deposit)
 - A withdraw function that receives an amount, and transfers that amount to the caller(named withdraw)
 - A function to check how much an address still has available(the address is received as a parameter)(named balanceOf)
 - The contract should track how much each address deposited and allow said address 
    to extract just as much as the address deposited(not more than that). 
 - The last function should always return the amount deposited by the address minus the amount that was withdrawn.
*/

/**
 * @title WETH
 * @dev This is a prototype of a smart contract that will be used to wrap ethers into a token.
 *         You can `deposit` ETH and obtain a WETH balance.
 *         You can `withdraw` ETH from WETH, which will then burn WETH token in your wallet.
 *         The amount of WETH token in any wallet is always identical to the
 *         balance of ETH deposited minus the ETH withdrawn with that specific wallet.
 */

contract WETH {
    /// @dev Records amount of WETH token owned by account.
    mapping(address => uint256) public balanceOf;

    /**
     *  @notice Deposit ETH into WETH.
     *  @dev `msg.value` of ETH sent to this contract grants caller account a matching increase in WETH token balance.
     */
    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    /**
     * @notice Withdraw ETH from WETH.
     * @dev Burn `value` WETH token from caller account and withdraw matching ETH to the same.
     * @param value Amount of WETH token to withdraw.
     */
    function withdraw(uint256 value) external {
        uint256 balance = balanceOf[msg.sender];
        require(balance >= value, "WETH: burn amount exceeds balance");
        balanceOf[msg.sender] = balance - value;

        (bool success, ) = msg.sender.call{ value: value }("");
        require(success, "WETH: ETH transfer failed");
    }

    /**
     * @notice Fallback function.
     * @dev `msg.value` of ETH sent to this contract grants caller account a matching increase in WETH token balance.
     */
    receive() external payable {
        balanceOf[msg.sender] += msg.value;
    }
}
