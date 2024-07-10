// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract DexPay {
    using SafeERC20 for IERC20;

    constructor(address payable receiver, address token) {
        withdraw(receiver, token);
    }

    function withdraw(address payable receiver, address token) public {
        if (token == address(0)) {
            receiver.transfer(address(this).balance);
        } else {
            uint256 balance = IERC20(token).balanceOf(address(this));
            IERC20(token).safeTransfer(receiver, balance);
        }
    }
}
