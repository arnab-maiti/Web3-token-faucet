// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Faucet is Ownable {
    
    IERC20 public token;
    uint256 public claimAmount = 15 * 10 ** 18;
    uint256 public cooldown = 5 hours;

    mapping(address => uint256) public lastClaimTime;
uint256 public cooldownTime = 1 days;


    constructor(address tokenAddress) Ownable(msg.sender) {
        token = IERC20(tokenAddress);
    }

    function claim() external {
    require(
        block.timestamp >= lastClaimTime[msg.sender] + cooldownTime,
        "Cooldown active"
    );

    lastClaimTime[msg.sender] = block.timestamp;

    token.transfer(msg.sender, claimAmount);
}
function getRemainingCooldown(address user) 
    external 
    view 
    returns (uint256) 
{
    if (block.timestamp >= lastClaimTime[user] + cooldownTime) {
        return 0;
    }
    return (lastClaimTime[user] + cooldownTime) - block.timestamp;
}



    function updateClaimAmount(uint256 amount) external onlyOwner {
        claimAmount = amount;
    }

    function updateCooldown(uint256 time) external onlyOwner {
        cooldown = time;
    }
}
