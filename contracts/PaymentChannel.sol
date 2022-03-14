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
        // Initialize it so that other users cannot initialize it and destruct the implementation
        initialized = true;
    }

    /**
        @notice Initializes the proxy storage
        @param sender_ Future sender of payments through the payment channel
        @param receiver_ Future receiver of payments through the payment channel
        @param duration_ Maximum amount of time before letting the sender cancel the channel
        @param token_ Address of the token to be used as a payment
        @param id_ ERC1155 Id of the tokens to be used as a payment
     */
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

    /**
        @notice Executes a payment and destructs the proxy, gives back the change,
        has to be called by receiver
        @param amount Amount of tokens to be paid
        @param sig Signature that uses the EIP712 to prove will to pay from the sender
        Structure is a Payment(uint256 amount)
     */
    function close(uint256 amount, bytes memory sig) external {
        require(msg.sender == receiver, "PaymentChannel: not receiver");
        require(_verify(amount, sig), "PaymentChannel: invalid signature");
        emit PaymentChannelClosed(amount);
        token.safeTransferFrom(address(this), receiver, id, amount, "0x0");
        token.safeTransferFrom(address(this), sender, id, token.balanceOf(address(this), id), "0x0");
        selfdestruct(sender);
    }

    /**
        @notice Gives back the amount of tokens to the sender,
        has to be called by sender,
        contract has to be expired
     */
    function cancel() external {
        require(msg.sender == sender, "PaymentChannel: not sender");
        require(block.timestamp >= expiresAt, "PaymentChannel: not expired yet");
        emit PaymentChannelCancelled();
        token.safeTransferFrom(address(this), sender, id, token.balanceOf(address(this), id), "0x0");
        selfdestruct(sender);
    }

    /**
        @notice Callback to signal acceptance of the ERC1155 tokens
     */
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    /**
        @notice Callback to signal acceptance of the ERC1155 tokens
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    /**
        @notice Function that verifies tha validity of a payment's signature
        @param amount Amount of tokens to be paid
        @param signature Signature that uses the EIP712 to prove will to pay from the sender
        Structure is a Payment(uint256 amount)
     */
    function _verify(uint256 amount, bytes memory signature) private view returns (bool) {
        bytes32 digest = EIP712._hashTypedDataV4(keccak256(abi.encode(keccak256("Payment(uint256 amount)"), amount)));
        address signer = ECDSA.recover(digest, signature);
        return signer == sender;
    }
}
