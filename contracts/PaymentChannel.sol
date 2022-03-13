// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract PaymentChannel is EIP712 {
    bool private initialized;
    address payable public sender;
    address payable public receiver;
    uint256 public expiresAt;

    struct Payment {
        uint256 amount;
    }
    event PaymentChannelClosed(uint256 amount);
    event PaymentChannelCancelled();

    constructor() EIP712("PaymentChannel", "1.0.0") {
        // Safe because these are immutable variables
        // avoid the funds being locked by a hacker who initializes the implementation and selfdestructs it
        initialized = true;
    }

    function initialize(
        address payable sender_,
        address payable receiver_,
        uint256 duration_
    ) external payable {
        require(!initialized, "PaymentChannel: already initialized");
        sender = sender_;
        receiver = receiver_;
        expiresAt = block.timestamp + duration_;
        initialized = true;
    }

    function close(uint256 _amount, bytes memory _sig) external {
        require(msg.sender == receiver, "PaymentChannel: not receiver");
        require(_verify(_amount, _sig), "PaymentChannel: invalid signature");

        (bool sent, ) = receiver.call{ value: _amount }("");
        require(sent, "PaymentChannel: failed to send Ether");
        emit PaymentChannelClosed(_amount);
        selfdestruct(sender); // Sends funds back to sender_
    }

    function cancel() external {
        require(msg.sender == sender, "PaymentChannel: not sender");
        require(block.timestamp >= expiresAt, "PaymentChannel: not expired yet");
        emit PaymentChannelCancelled();
        selfdestruct(sender); // Sends funds back to sender_
    }

    function _verify(uint256 amount, bytes memory signature) private view returns (bool) {
        bytes32 digest = EIP712._hashTypedDataV4(keccak256(abi.encode(keccak256("Payment(uint256 amount)"), amount)));
        address signer = ECDSA.recover(digest, signature);
        return signer == sender;
    }
}
