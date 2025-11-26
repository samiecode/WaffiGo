// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICeloSwap} from "./interfaces/ICeloSwap.sol";

contract WaffiContract is Ownable, ReentrancyGuard {
    
    struct UserInfo {
        uint256 totalSpent;
        uint256 totalSaved;
        uint256 savingsRateBps; // 0 => use default
        bool isSavingEnabled;
    }

    struct Transaction {
        address sender;
        address recipient;
        uint256 amountSent;
        uint256 amountSaved;
        uint256 timestamp;
        uint256 savingsRateBps;
    }

    mapping(address => UserInfo) public users;
    mapping(address => Transaction[]) public userTransactions;
    uint256 public defaultSavingsRateBps; // e.g., 1000 = 10%
    bool public constant DEFAULT_SAVINGS_ENABLED = true;

    // CeloSwap contract integration
    ICeloSwap public celoSwap;

    event DefaultSavingsRateUpdated(uint256 newRateBps);
    event UserSavingsEnabledUpdated(address indexed user, bool enabled);
    event UserSavingsRateUpdated(address indexed user, uint256 newRateBps);

    event TransferCompleted(
        address indexed sender,
        address indexed recipient,
        uint256 amountSent,
        uint256 amountSaved,
        uint256 effectiveRateBps,
        uint256 timestamp
    );

    event SavingsWithdrawn(address indexed user, uint256 amount);
    event CeloSwapUpdated(address indexed newCeloSwap);
    event SwappedCeloToToken(address indexed user, address indexed token, uint256 celoIn, uint256 tokenOut);
    event SwappedTokenToCelo(address indexed user, address indexed token, uint256 tokenIn, uint256 celoOut);

    constructor(uint256 _defaultSavingsRateBps) Ownable(msg.sender) {
        require(_defaultSavingsRateBps <= 10_000, "Rate too high");
        defaultSavingsRateBps = _defaultSavingsRateBps;
        emit DefaultSavingsRateUpdated(_defaultSavingsRateBps);
    }

    function setDefaultSavingsRate(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= 10_000, "Rate too high");
        defaultSavingsRateBps = newRateBps;
        emit DefaultSavingsRateUpdated(newRateBps);
    }

    function setSavingsEnabled(bool enabled) external {
        users[msg.sender].isSavingEnabled = enabled;
        emit UserSavingsEnabledUpdated(msg.sender, enabled);
    }

    function setSavingsRate(uint256 newRateBps) external {
        require(newRateBps <= 10_000, "Rate too high");
        users[msg.sender].savingsRateBps = newRateBps;
        emit UserSavingsRateUpdated(msg.sender, newRateBps);
    }

    function transfer(address payable recipient, uint256 amountToSend) external payable nonReentrant {
        require(amountToSend > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot send to yourself");

        UserInfo storage user = users[msg.sender];

        // Check if savings is enabled (use default if user hasn't set it)
        // New users default to DEFAULT_SAVINGS_ENABLED (true)
        bool savingsEnabled = user.totalSpent == 0 && !user.isSavingEnabled 
            ? DEFAULT_SAVINGS_ENABLED 
            : user.isSavingEnabled;

        uint256 rateBps = user.savingsRateBps == 0 ? defaultSavingsRateBps : user.savingsRateBps;
        
        uint256 savings = 0;
        uint256 totalRequired = amountToSend;

        // Only calculate savings if enabled
        if (savingsEnabled) {
            savings = (amountToSend * rateBps) / 10_000;
            totalRequired = amountToSend + savings;
        }

        require(msg.value >= totalRequired, "Insufficient value for transfer + savings");

        user.totalSpent += amountToSend;
        
        if (savingsEnabled && savings > 0) {
            user.totalSaved += savings;
        }

        // Record transaction
        userTransactions[msg.sender].push(
            Transaction({
                sender: msg.sender,
                recipient: recipient,
                amountSent: amountToSend,
                amountSaved: savings,
                timestamp: block.timestamp,
                savingsRateBps: savingsEnabled ? rateBps : 0
            })
        );

        // Transfer money to recipient (actual spend)
        (bool success,) = recipient.call{value: amountToSend}("");
        require(success, "Transfer to recipient failed");

        // Refund excess if user sent more than needed
        uint256 excess = msg.value - totalRequired;
        if (excess > 0) {
            (bool refundSuccess,) = msg.sender.call{value: excess}("");
            require(refundSuccess, "Refund failed");
        }

        emit TransferCompleted(msg.sender, recipient, amountToSend, savings, savingsEnabled ? rateBps : 0, block.timestamp);
        // Savings stay in the contract
    }

    function withdrawSavings() external nonReentrant {
        UserInfo storage user = users[msg.sender];
        uint256 amount = user.totalSaved;
        require(amount > 0, "Nothing to withdraw");

        user.totalSaved = 0;

        (bool ok,) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");

        emit SavingsWithdrawn(msg.sender, amount);
    }

    function getUserData(address account)
        external
        view
        returns (uint256 totalSpent, uint256 totalSaved, uint256 effectiveRateBps, bool isSavingEnabled)
    {
        UserInfo storage user = users[account];
        uint256 rateBps = user.savingsRateBps == 0 ? defaultSavingsRateBps : user.savingsRateBps;

        return (user.totalSpent, user.totalSaved, rateBps, user.isSavingEnabled);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserTransactions(address user) external view returns (Transaction[] memory) {
        return userTransactions[user];
    }

    function getUserTransactionCount(address user) external view returns (uint256) {
        return userTransactions[user].length;
    }

    // ============ CeloSwap Integration ============

    function setCeloSwap(address _celoSwap) external onlyOwner {
        require(_celoSwap != address(0), "Invalid CeloSwap address");
        celoSwap = ICeloSwap(_celoSwap);
        emit CeloSwapUpdated(_celoSwap);
    }

    /// @notice Swap CELO to cUSD via CeloSwap contract
    /// @param amountOutMin Minimum cUSD to receive (slippage protection)
    /// @param deadline Transaction deadline timestamp
    function swapCeloToCUSD(uint256 amountOutMin, uint256 deadline)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        require(msg.value > 0, "Must send CELO");

        amountOut = celoSwap.swapCeloToCUSD{value: msg.value}(amountOutMin, deadline, msg.sender);
        emit SwappedCeloToToken(msg.sender, celoSwap.cUSD(), msg.value, amountOut);
    }

    /// @notice Swap CELO to cEUR via CeloSwap contract
    /// @param amountOutMin Minimum cEUR to receive (slippage protection)
    /// @param deadline Transaction deadline timestamp
    function swapCeloToCEUR(uint256 amountOutMin, uint256 deadline)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        require(msg.value > 0, "Must send CELO");

        amountOut = celoSwap.swapCeloToCEUR{value: msg.value}(amountOutMin, deadline, msg.sender);
        emit SwappedCeloToToken(msg.sender, celoSwap.cEUR(), msg.value, amountOut);
    }

    /// @notice Swap CELO to any supported token via CeloSwap
    /// @param tokenOut Address of token to receive
    /// @param amountOutMin Minimum tokens to receive
    /// @param deadline Transaction deadline timestamp
    function swapCeloToToken(address tokenOut, uint256 amountOutMin, uint256 deadline)
        external
        payable
        nonReentrant
        returns (uint256 amountOut)
    {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        require(msg.value > 0, "Must send CELO");

        amountOut = celoSwap.swapCeloToToken{value: msg.value}(tokenOut, amountOutMin, deadline, msg.sender);
        emit SwappedCeloToToken(msg.sender, tokenOut, msg.value, amountOut);
    }

    /// @notice Swap cUSD to CELO via CeloSwap contract
    /// @param amountIn Amount of cUSD to swap
    /// @param amountOutMin Minimum CELO to receive
    /// @param deadline Transaction deadline timestamp
    function swapCUSDToCelo(uint256 amountIn, uint256 amountOutMin, uint256 deadline)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        require(amountIn > 0, "Amount must be > 0");

        address cUSD = celoSwap.cUSD();
        
        // Transfer cUSD from user to this contract
        IERC20(cUSD).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve CeloSwap to spend cUSD
        IERC20(cUSD).approve(address(celoSwap), amountIn);

        amountOut = celoSwap.swapCUSDToCelo(amountIn, amountOutMin, deadline, msg.sender);
        emit SwappedTokenToCelo(msg.sender, cUSD, amountIn, amountOut);
    }

    /// @notice Swap any token to CELO via CeloSwap
    /// @param tokenIn Address of token to swap
    /// @param amountIn Amount of tokens to swap
    /// @param amountOutMin Minimum CELO to receive
    /// @param deadline Transaction deadline timestamp
    function swapTokenToCelo(address tokenIn, uint256 amountIn, uint256 amountOutMin, uint256 deadline)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        require(amountIn > 0, "Amount must be > 0");

        // Transfer tokens from user to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        
        // Approve CeloSwap to spend tokens
        IERC20(tokenIn).approve(address(celoSwap), amountIn);

        amountOut = celoSwap.swapTokenToCelo(tokenIn, amountIn, amountOutMin, deadline, msg.sender);
        emit SwappedTokenToCelo(msg.sender, tokenIn, amountIn, amountOut);
    }

    /// @notice Get estimated token output for a given CELO input
    function getEstimatedTokenForCelo(address tokenOut, uint256 celoAmount) external view returns (uint256) {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        return celoSwap.getEstimatedTokenForCelo(tokenOut, celoAmount);
    }

    /// @notice Get estimated CELO output for a given token input
    function getEstimatedCeloForToken(address tokenIn, uint256 tokenAmount) external view returns (uint256) {
        require(address(celoSwap) != address(0), "CeloSwap not set");
        return celoSwap.getEstimatedCeloForToken(tokenIn, tokenAmount);
    }
}
