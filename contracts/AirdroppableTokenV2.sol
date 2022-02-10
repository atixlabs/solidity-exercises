// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/**
    @notice Token that can be Airdroppable. There's an address set at initialization
    that will be in charge of the minting(initally thought to be used using a 
    MerkleTree airdrop)
 */
contract AirdroppableTokenV2 is ERC20Upgradeable {
    /**
        @notice Address that WAS in charge of the minting(no restrictions over this)
        Have to keep it here deprecated(being not a constant), to prevent future usage of a polluted storage
        space
     */
    // solhint-disable-next-line var-name-mixedcase
    address public __Deprecated_do_not_use_airdrop;

    /**
        @notice Init Airdrop and its subclasses
        @param name_ Name of the tokens
        @param symbol_ Ticker/Symbol of the tokens
    */
    // solhint-disable-next-line func-name-mixedcase
    function __AirdroppableToken_init(string memory name_, string memory symbol_) external initializer {
        __ERC20_init(name_, symbol_);
    }

    /**
        @notice Gap so that in the case of an upgrade, we can create more storage variables without disrupting 
        the storage layout if there are inheritors
     */
    uint256[50] private __gapAirdroppableTokenV2;
}
