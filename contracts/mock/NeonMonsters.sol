// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NeonMonsters is ERC721 {
    uint256 private _nextId;

    constructor() ERC721("Neon Monsters Mock", "NEMOMOCK") {}

    function mint(address to) external {
        _safeMint(to, _nextId);
        _nextId++;
    }
}
