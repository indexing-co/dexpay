// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DexToken is ERC20 {
    constructor(address _sendTo, uint256 _initialFunds) ERC20('Dex Token', "DEX") {
        _mint(_sendTo, _initialFunds);
    }
}
