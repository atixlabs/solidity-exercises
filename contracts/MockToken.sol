// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MockToken is ERC1155 {
    constructor() ERC1155("http://dummy") {}

    // allow anyone to mint, it is just for testing purposes
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public {
        _mint(to, id, amount, data);
    }
}
