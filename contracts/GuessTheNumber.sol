// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

/// @title Guess the number game
///
/// @notice The game is a simple guess the number game using a commit-reveal scheme:
///						- Player1 commits to a number in [1, 6]
///						- Player2 makes his guess.
///						- Player1 reveals his guess and shows whether it is correct or not.
///						- If Player1 is not willing to do so (maybe because he has lost),
///                         Player2 can claim he won after some period of time known before the game starts.
///
/// @notice IMPORTANT! This version of commit-reveal is a little different from the Rock Paper Scissors example.
///           There is a good reason to be done so, if we used the same mechanism, the guesser could just copy the
///				commitment of the chooser, in order to later reveal the same number along with the same salt/nonce/password.
///           Check that your solution is not subject to this attack. Remember that you cannot assume
///             that the chooser transaction,
///             arrives before that of the guesser, even if the guesser attacks(it could be copied from the mempool).
///
/// @notice The contract won't check if the same commitment was used before making it trivial for someone
///           to win the game if an existing one is used on a previous game.
///					Pick a nonce that is unique for each game.
///
/// @dev This contract was designed to be deployead for each game.
///      This might not be the best way but the idea was to keep it simple.
///      It can be deployed using a minimal proxy pattern or eventually changed to keep a map of games.
contract GuessTheNumber {
    uint256 private constant MIN_VALUE = 1;
    uint256 private constant MAX_VALUE = 6;

    /// Different game states that will controll the game flow
    enum GameState { NOT_STARTED, GUESSING, WAITING_RESULT, FINISHED }

    /// Current game state
    GameState public gameState;

    /// Player1 commitment
    uint256 public commitment;
    /// Player that commits to the value to be guessed
    address public chooser;
    /// Player that makes the guess
    address public guesser;
    /// Player2 guessed value
    uint256 public guess;
    /// Timestamp after which Player2 can claim he won if Player1 hasn't revealed his value
    uint256 public expirationTimestamp;
    /// Amount of seconds Player1 has to reveal his value after Player2 has made his guess
    uint256 public secondsToReveal;

    /// @notice Event emitted when a new game is started
    /// @param guesser Player that makes the guess
    /// @param commitment Player1 commitment
    /// @param secondsToReveal Amount of seconds Player1 has to reveal his value after Player2 has made his guess
    event GameStarted(address indexed guesser, uint256 commitment, uint256 secondsToReveal);

    /// @notice Event emitted when a guess is made
    /// @param guess Player2 guessed value
    event GuessMade(uint256 guess);

    /// @notice Event emitted when the game finished
    /// @param winner Player that won the game
    event WinnerDeclared(address indexed winner);

    /// @notice Function to be called to initialize the game. This function can be called once before the game starts.
    /// @param _commitment Player1 commitment. See calculateHash() for more info
    /// @param _player2 Player that makes the guess
    /// @param _secondsToReveal Amount of seconds Player1 has to reveal his value after Player2 has
    /// made his guess otherwises she can claim he won
    function initialize(
        uint256 _commitment,
        address _player2,
        uint256 _secondsToReveal
    ) external {
        require(gameState == GameState.NOT_STARTED, "Game already started");
        // require(secondsToReveal > 0, "Seconds to reveal has to be positive");

        gameState = GameState.GUESSING;

        commitment = _commitment;
        chooser = msg.sender;
        guesser = _player2;
        secondsToReveal = _secondsToReveal;
        expirationTimestamp = block.timestamp + secondsToReveal;

        emit GameStarted(_player2, _commitment, _secondsToReveal);
    }

    /// @notice Function to be called to make a guess by Player2.
    ///           This function can be called only if the game is in GUESSING state.
    /// @param _guess Player2 guessed value
    function guessValue(uint256 _guess) external {
        require(msg.sender == guesser, "Only guesser can guess");
        require(gameState == GameState.GUESSING, "Cannot guess again");
        require(_guess >= 1 && _guess <= 6, "Invalid guess");

        gameState = GameState.WAITING_RESULT;
        guess = _guess;
        expirationTimestamp = block.timestamp + secondsToReveal;

        emit GuessMade(guess);
    }

    /// @notice Function to be called to reveal the value from Player1.
    ///           This function can be called only if the game is in WAITING_RESULT state.
    /// @param _value Revealed value
    /// @param _nonce Nonce to be used in the commit-reveal scheme
    function reveal(uint256 _value, uint256 _nonce) external {
        require(gameState == GameState.WAITING_RESULT, "Cannot reveal now");
        require(calculateCommitment(_value, _nonce) == commitment, "Commitment does not match");

        gameState = GameState.FINISHED;
        if (_value == guess || _value < MIN_VALUE || _value > MAX_VALUE) {
            emit WinnerDeclared(guesser);
        } else {
            emit WinnerDeclared(chooser);
        }
    }

    /// @notice Function to be called to claim the win from Player2.
    ///           This function can be called if the game is in WAITING_RESULT and the expirationTimestamp has passed.
    function claimExpired() external {
        require(gameState == GameState.WAITING_RESULT || gameState == GameState.GUESSING, "Game is not being played");
        require(block.timestamp > expirationTimestamp, "Cannot claim now");
        address winner = gameState == GameState.WAITING_RESULT ? guesser : chooser;
        emit WinnerDeclared(winner);
        gameState = GameState.FINISHED;
    }

    /// @notice Function to be used to calculate the commitment
    /// @param _value Value to commit to
    /// @param _nonce Random value to be used in the commit-reveal scheme to avoid it to be easily guessed
    function calculateCommitment(uint256 _value, uint256 _nonce) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_value, _nonce)));
    }
}
