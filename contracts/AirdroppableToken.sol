// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

/**
    @notice Token that can be Airdroppable. There's an address set at initialization
    that will be in charge of the minting(initally thought to be used using a 
    MerkleTree airdrop)
 */
contract AirdroppableToken is ERC20Upgradeable {
    /**
        @notice Address that is in charge of the minting(no restrictions over this)
     */
    address public airdrop;

    /**
        @notice Can only be used by the minting address
     */
    modifier onlyAirdrop() {
        require(msg.sender == airdrop, "AirdroppableToken: not airdrop");
        _;
    }

    /**
        @notice Init Airdrop and its subclasses
        @param name_ Name of the tokens
        @param symbol_ Ticker/Symbol of the tokens
        @param airdrop_ Address that will be in charge of the minting
    */
    // solhint-disable-next-line func-name-mixedcase
    function __AirdroppableToken_init(
        string memory name_,
        string memory symbol_,
        address airdrop_
    ) external initializer {
        __ERC20_init(name_, symbol_);
        __AirdroppableToken_init_unchained(airdrop_);
    }

    /**
        @notice Init Airdrop and NOT init its subclasses
        @param airdrop_ Address that will be in charge of the minting
        @dev Needed to prevent reinitialization if faced with a Diamond problem
    */
    // solhint-disable-next-line func-name-mixedcase
    function __AirdroppableToken_init_unchained(address airdrop_) public initializer {
        airdrop = airdrop_;
    }

    /**
        @notice Create new tokens. Can only be called by airdrop
        Emits an Transfer event where the sender is the ZERO_ADDRESS,
        the receiver is the receiver and amount is amount
        @param receiver New owner of the newly minted tokens
        @param amount Amount to be minted
    */
    function mint(address receiver, uint256 amount) external onlyAirdrop {
        _mint(receiver, amount);
    }

    /**
        @notice Gap so that in the case of an upgrade, we can create more storage variables without disrupting 
        the storage layout if there are inheritors
     */
    uint256[50] private __gapAirdroppableToken;
}
