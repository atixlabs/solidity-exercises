// SPDX-License-Identifier: MIT
// Partially copied from OpenZeppelin
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

// This is an presentational purpose example.
// DO NOT USE THIS IN PRODUCTION
// Some parts of the standard are ignored for simplicity
contract MyERC721 is IERC721, ERC165 {
    mapping(uint256 => address) private _owner;
    mapping(uint256 => address) private _allowed;
    mapping(address => mapping(address => bool)) private _isOperator;
    mapping(address => uint256) private _balances;

    string public name;
    string public symbol;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256[] memory tokenIds
    ) {
        name = name_;
        symbol = symbol_;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            _mint(msg.sender, tokenIds[i]);
        }
    }

    modifier onlyHolder(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not owner of the token");
        _;
    }

    modifier onlyAllowed(uint256 tokenId) {
        address owner = ownerOf(tokenId);
        require(
            owner == msg.sender || _allowed[tokenId] == msg.sender || _isOperator[owner][msg.sender],
            "Not allowed"
        );
        _;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owner[tokenId];
    }

    function approve(address to, uint256 tokenId) external onlyHolder(tokenId) {
        _allowed[tokenId] = to;
        emit Approval(msg.sender, to, tokenId);
    }

    function balanceOf(address owner) external view returns (uint256 balance) {
        return _balances[owner];
    }

    function setApprovalForAll(address operator, bool _approved) external {
        _isOperator[msg.sender][operator] = _approved;
        emit ApprovalForAll(msg.sender, operator, _approved);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public onlyAllowed(tokenId) {
        require(from == ownerOf(tokenId), "Incorrect owner");
        _clearApproval(tokenId);
        _owner[tokenId] = to;
        _balances[from] -= 1;
        _balances[to] += 1;
        emit Transfer(from, to, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external {
        safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata
    ) external {
        safeTransferFrom(from, to, tokenId);
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _isOperator[owner][operator];
    }

    function getApproved(uint256 tokenId) public view returns (address) {
        return _allowed[tokenId];
    }

    function _clearApproval(uint256 tokenId) private {
        _allowed[tokenId] = address(0);
    }

    function _mint(address to, uint256 tokenId) private {
        _owner[tokenId] = to;
        _balances[to] += 1;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, IERC165) returns (bool) {
        return interfaceId == type(IERC721).interfaceId || super.supportsInterface(interfaceId);
    }
}
