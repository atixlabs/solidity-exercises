// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";

import "./PaymentChannel.sol";

contract PaymentChannelsFactory {
    address public implementation;

    event PaymentChannelCreated(PaymentChannel channel);

    constructor(address implementation_) {
        implementation = implementation_;
    }

    function createChannel(
        address receiver_,
        uint256 duration_,
        ERC1155 token,
        uint256 id,
        uint256 amount
    ) external {
        require(amount > 0, "PaymentChannelsFactory: no value sent");
        PaymentChannel clone = PaymentChannel(Clones.clone(implementation));
        token.safeTransferFrom(msg.sender, address(clone), id, amount, "0x0");
        clone.initialize(payable(msg.sender), receiver_, duration_, token, id);
        emit PaymentChannelCreated(clone);
    }
}
