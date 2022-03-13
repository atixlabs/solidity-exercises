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

    function createChannel(address payable receiver_, uint256 duration_) external payable {
        require(msg.value > 0, "PaymentChannelsFactory: no value sent");
        PaymentChannel clone = PaymentChannel(Clones.clone(implementation));
        clone.initialize{ value: msg.value }(payable(msg.sender), receiver_, duration_);
        emit PaymentChannelCreated(clone);
    }
}
