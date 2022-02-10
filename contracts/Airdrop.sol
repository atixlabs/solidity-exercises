// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "./AirdroppableToken.sol";

/**
    @title Airdrop
    @notice A contract that checks through a merkle tree if a given pair(receiver, amount)
    belongs to the defined set, if it does it mints `amount` tokens to the `receiver` in the
    also predefined token contract

 */
contract Airdrop {
    bytes32 public root;
    AirdroppableToken public token;

    /**
        @notice Tracks if a leaf has been used
        The key is the hash of the leaf that is used or not
     */
    mapping(bytes32 => bool) public used;

    /** 
        @notice Set address of the token to be minted, can only be called once
    */
    function setToken(AirdroppableToken token_) external {
        require(address(token) == address(0), "Airdrop: token already set");
        token = token_;
    }

    /** 
        @notice Set root of the merkle tree, can only be called once
    */
    function setRoot(bytes32 root_) external {
        require(root == bytes32(0), "Airdrop: root already set");
        root = root_;
    }

    /** 
        @notice Mint amount tokens to the receiver. For this call to be succesful,
        the caller has to provide a MerkleTreeProof that proves that those parameters are
        a leaf in the MerkleTree that was set using setRoot.
        Can only be called once per leaf, and supports multiple leaves per user
        @param receiver Address that's going to receive the tokens
        @param amount Amount of tokens to be sent
        @param proof Merkle tree proof that the (receiver, amount) pair is a leaf.
        Look in the tests for an example on how to create it 
    */
    function claim(
        address receiver,
        uint256 amount,
        bytes32[] memory proof
    ) external {
        bytes32 leafHash = hashLeaf(receiver, amount);
        require(MerkleProofUpgradeable.processProof(proof, leafHash) == root, "Airdrop: failed merkle check");
        require(!used[leafHash], "Airdrop: proof already used");
        used[leafHash] = true;
        token.mint(receiver, amount);
    }

    /**
        @notice Hashes a leaf so that it can be used in the MerkleTree
        @param receiver Receiver of the to-be-generated tokens
        @param amount Amount of tokens to be sent
     */
    function hashLeaf(address receiver, uint256 amount) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(receiver, amount));
    }

    /**
        @notice Gap so that in the case of an upgrade, we can create more storage variables without disrupting 
        the storage layout if there are inheritors
     */
    uint256[50] private __gap;
}
