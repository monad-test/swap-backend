// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SwapToken is ERC20 {
    address public owner;

    constructor() ERC20("HealthToken", "HLT") {
        owner = msg.sender;
        _mint(owner, 1000000 * 10 ** decimals()); // Mint 1M tokens
    }

    function reward(address user, uint amount) external {
        require(msg.sender == owner, "Only owner can reward");
        _transfer(owner, user, amount);
    }
}
