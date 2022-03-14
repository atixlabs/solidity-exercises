// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

contract PaymentChannel is EIP712, ERC1155Receiver {
    bool private initialized;
    address payable public sender;
    address public receiver;
    uint256 public expiresAt;
    ERC1155 public token;
    uint256 public id;

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
        address receiver_,
        uint256 duration_,
        ERC1155 token_,
        uint256 id_
    ) external {
        require(!initialized, "PaymentChannel: already initialized");
        sender = sender_;
        receiver = receiver_;
        expiresAt = block.timestamp + duration_;
        token = token_;
        id = id_;
        initialized = true;
    }

    function close(uint256 amount, bytes memory sig) external {
        require(msg.sender == receiver, "PaymentChannel: not receiver");
        require(_verify(amount, sig), "PaymentChannel: invalid signature");
        token.safeTransferFrom(address(this), receiver, id, amount, "0x0");
        emit PaymentChannelClosed(amount);
        token.safeTransferFrom(address(this), sender, id, token.balanceOf(address(this), id), "0x0");
        selfdestruct(sender);
    }

    function cancel() external {
        require(msg.sender == sender, "PaymentChannel: not sender");
        require(block.timestamp >= expiresAt, "PaymentChannel: not expired yet");
        emit PaymentChannelCancelled();
        token.safeTransferFrom(address(this), sender, id, token.balanceOf(address(this), id), "0x0");
        selfdestruct(sender);
    }

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function _verify(uint256 amount, bytes memory signature) private view returns (bool) {
        bytes32 digest = EIP712._hashTypedDataV4(keccak256(abi.encode(keccak256("Payment(uint256 amount)"), amount)));
        address signer = ECDSA.recover(digest, signature);
        return signer == sender;
    }
}
