// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/* ------ Excercise requeriments ------
 - Use ERC20 openzeppelin library and extends from it to implement WETH token
 - Implement a constructor that calls ERC20 constructor
 - Call _mint function in receive and deposit functions
 - Call _burn function in withdraw function
*/

/**
 * @title WETH
 * @dev This is a prototype of a smart contract that will be used to wrap ethers into a token.
 *         You can `deposit` ETH and obtain a WETH balance.
 *         You can `withdraw` ETH from WETH, which will then burn WETH token in your wallet.
 *         The amount of WETH token in any wallet is always identical to the
 *         balance of ETH deposited minus the ETH withdrawn with that specific wallet.
 */

contract WETH is ERC20 {
    //solhint-disable no-empty-blocks
    constructor() ERC20("Wrapped Ether", "WETH") {}

    /**
     *  @notice Deposit ETH into WETH.
     *  @dev `msg.value` of ETH sent to this contract grants caller account a matching increase in WETH token balance.
     */
    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw ETH from WETH.
     * @dev Burn `value` WETH token from caller account and withdraw matching ETH to the same.
     * @param value Amount of WETH token to withdraw.
     */
    function withdraw(uint256 value) external {
        _burn(msg.sender, value);
        (bool success, ) = msg.sender.call{ value: value }("");
        require(success, "WETH: ETH transfer failed");
    }

    /**
     * @notice Fallback function.
     * @dev `msg.value` of ETH sent to this contract grants caller account a matching increase in WETH token balance.
     */
    receive() external payable {
        _mint(msg.sender, msg.value);
    }
}
