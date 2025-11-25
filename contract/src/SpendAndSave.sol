// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";

contract SpendAndSave is Ownable, ReentrancyGuard {
    struct UserInfo {
        uint256 totalSpent;
        uint256 totalSaved;
        uint256 savingsRateBps; // 0 => use default
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

    // Wormhole state variables for sending
    IWormholeRelayer public immutable wormholeRelayer;
    mapping(uint16 => bool) public allowlistedDestinationChains;
    mapping(uint16 => address) public receiverContracts; // Receiver contract on each chain
    uint256 public constant GAS_LIMIT = 300_000;

    // Errors
    error ChainNotAllowlisted(uint16 targetChain);
    error ReceiverNotSet(uint16 targetChain);
    error InsufficientFunds(uint256 required, uint256 provided);

    event DefaultSavingsRateUpdated(uint256 newRateBps);
    event UserSavingsRateUpdated(address indexed user, uint256 newRateBps);
    event SpentAndSaved(
        address indexed sender,
        address indexed recipient,
        uint256 amountSent,
        uint256 amountSaved,
        uint256 effectiveRateBps,
        uint256 timestamp
    );
    event SavingsWithdrawn(address indexed user, uint256 amount);
    event CrossChainTransferInitiated(
        address indexed sender,
        uint16 indexed targetChain,
        address recipient,
        uint256 amountSent,
        uint256 amountSaved,
        uint64 sequence
    );

    constructor(uint256 _defaultSavingsRateBps, address _wormholeRelayer) Ownable(msg.sender) {
        require(_defaultSavingsRateBps <= 10_000, "Rate too high");
        require(_wormholeRelayer != address(0), "Invalid relayer address");
        defaultSavingsRateBps = _defaultSavingsRateBps;
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        emit DefaultSavingsRateUpdated(_defaultSavingsRateBps);
    }

    /// @notice Allowlist a destination chain for cross-chain transfers
    /// @param chainId Wormhole chain ID
    /// @param allowed Whether the chain is allowed
    function setAllowlistedDestinationChain(uint16 chainId, bool allowed) external onlyOwner {
        allowlistedDestinationChains[chainId] = allowed;
    }

    /// @notice Set receiver contract address for a destination chain
    /// @param chainId Wormhole chain ID
    /// @param receiver Address of SpendAndSaveReceiver on that chain
    function setReceiverContract(uint16 chainId, address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid receiver address");
        receiverContracts[chainId] = receiver;
    }

    function setDefaultSavingsRate(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= 10_000, "Rate too high");
        defaultSavingsRateBps = newRateBps;
        emit DefaultSavingsRateUpdated(newRateBps);
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

        uint256 rateBps = user.savingsRateBps == 0 ? defaultSavingsRateBps : user.savingsRateBps;

        uint256 savings = (amountToSend * rateBps) / 10_000;
        uint256 totalRequired = amountToSend + savings;

        require(totalRequired >= msg.value, "Insufficient value for transfer + savings");

        user.totalSpent += amountToSend;
        user.totalSaved += savings;

        // Record transaction
        userTransactions[msg.sender].push(
            Transaction({
                sender: msg.sender,
                recipient: recipient,
                amountSent: amountToSend,
                amountSaved: savings,
                timestamp: block.timestamp,
                savingsRateBps: rateBps
            })
        );

        // Transfer money to recipient (actual spend)
        (bool success,) = recipient.call{value: amountToSend}("");
        require(success, "Transfer to recipient failed");

        emit SpentAndSaved(msg.sender, recipient, amountToSend, savings, rateBps, block.timestamp);
        // Savings stay in the contract
    }

    /// @notice Send money cross-chain via Wormhole
    /// @param targetChain Wormhole chain ID of destination
    /// @param recipient Address to receive funds on destination chain
    /// @param amountToSend Exact amount to send to recipient
    /// @return sequence The Wormhole sequence number
    function transferCrossChain(uint16 targetChain, address recipient, uint256 amountToSend)
        external
        payable
        nonReentrant
        returns (uint64 sequence)
    {
        require(amountToSend > 0, "Amount must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        if (!allowlistedDestinationChains[targetChain]) {
            revert ChainNotAllowlisted(targetChain);
        }

        address receiverContract = receiverContracts[targetChain];
        if (receiverContract == address(0)) {
            revert ReceiverNotSet(targetChain);
        }

        UserInfo storage user = users[msg.sender];
        uint256 rateBps = user.savingsRateBps == 0 ? defaultSavingsRateBps : user.savingsRateBps;

        uint256 savings = (amountToSend * rateBps) / 10_000;

        // Get the cost to send the cross-chain message
        (uint256 deliveryCost,) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);

        uint256 totalRequired = amountToSend + savings + deliveryCost;
        if (msg.value < totalRequired) {
            revert InsufficientFunds(totalRequired, msg.value);
        }

        // Update user stats
        user.totalSpent += amountToSend;
        user.totalSaved += savings;

        // Record transaction
        userTransactions[msg.sender].push(
            Transaction({
                sender: msg.sender,
                recipient: recipient,
                amountSent: amountToSend,
                amountSaved: savings,
                timestamp: block.timestamp,
                savingsRateBps: rateBps
            })
        );

        // Encode the payload with sender and recipient info
        bytes memory payload = abi.encode(msg.sender, recipient, amountToSend);

        // Send cross-chain message with native token
        sequence = wormholeRelayer.sendPayloadToEvm{value: deliveryCost + amountToSend}(
            targetChain,
            receiverContract, // Target receiver contract on destination chain
            payload,
            amountToSend, // Amount of native gas to send to recipient
            GAS_LIMIT
        );

        emit CrossChainTransferInitiated(msg.sender, targetChain, recipient, amountToSend, savings, sequence);
        emit SpentAndSaved(msg.sender, recipient, amountToSend, savings, rateBps, block.timestamp);

        // Savings stay in this contract on source chain
        return sequence;
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
        returns (uint256 totalSpent, uint256 totalSaved, uint256 effectiveRateBps)
    {
        UserInfo storage user = users[account];
        uint256 rateBps = user.savingsRateBps == 0 ? defaultSavingsRateBps : user.savingsRateBps;

        return (user.totalSpent, user.totalSaved, rateBps);
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

    /// @notice Get estimated cost for cross-chain transfer
    /// @param targetChain Wormhole chain ID
    /// @param amountToSend Amount to send to recipient
    /// @return totalCost Total cost including amount, savings, and delivery fee
    /// @return deliveryFee Wormhole delivery fee
    function quoteCrossChainTransfer(uint16 targetChain, uint256 amountToSend)
        external
        view
        returns (uint256 totalCost, uint256 deliveryFee)
    {
        uint256 rateBps =
            users[msg.sender].savingsRateBps == 0 ? defaultSavingsRateBps : users[msg.sender].savingsRateBps;

        uint256 savings = (amountToSend * rateBps) / 10_000;

        (deliveryFee,) = wormholeRelayer.quoteEVMDeliveryPrice(targetChain, 0, GAS_LIMIT);

        totalCost = amountToSend + savings + deliveryFee;
        return (totalCost, deliveryFee);
    }

    /// @notice Get Wormhole relayer address
    function getWormholeRelayer() external view returns (address) {
        return address(wormholeRelayer);
    }

    /// @notice Check if a destination chain is allowlisted
    function isDestinationChainAllowlisted(uint16 chainId) external view returns (bool) {
        return allowlistedDestinationChains[chainId];
    }

    /// @notice Get receiver contract for a chain
    function getReceiverContract(uint16 chainId) external view returns (address) {
        return receiverContracts[chainId];
    }
}
