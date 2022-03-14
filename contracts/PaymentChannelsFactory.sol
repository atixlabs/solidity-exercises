// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";

import "./PaymentChannel.sol";

/**
    @notice Factory of payment channels, it is necessary that the creator
    commits an amount to the channel
    @dev It uses minimal proxies to avoid deploying the same code over and over
    It uses create, instead of create2 to avoid that two payment channels are created using the same
    address(and possibly allows the reutilization of a signature)
 */
contract PaymentChannelsFactory {
    address public implementation;

    /**
        @notice Event emitted everytime that a payment channel is created
        @param channel Address of the newly created channel
     */
    event PaymentChannelCreated(PaymentChannel channel);

    /**
        @notice Constructor
        @param implementation_ Addres of the implemantation contract of the payment channels
     */
    constructor(address implementation_) {
        implementation = implementation_;
    }

    /**
        @notice Creates an unidirectional payment channel through create
        @param receiver_ Future receiver of payments through the payment channel
        @param duration_ Maximum amount of time before letting the sender cancel the channel
        @param token Address of the token to be used as a payment
        @param id ERC1155 Id of the tokens to be used as a payment
        @param amount Amount of tokens to be commited
     */
    function createChannel(
        address receiver_,
        uint256 duration_,
        ERC1155 token,
        uint256 id,
        uint256 amount
    ) external {
        require(amount > 0, "PaymentChannelsFactory: no value sent");
        PaymentChannel clone = PaymentChannel(Clones.clone(implementation));
        emit PaymentChannelCreated(clone);
        clone.initialize(payable(msg.sender), receiver_, duration_, token, id);
        token.safeTransferFrom(msg.sender, address(clone), id, amount, "0x0");
    }
}
