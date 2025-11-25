// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWormholeRelayer, IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";

/// @title SpendAndSaveReceiver
/// @notice Handles receiving cross-chain transfers via Wormhole for SpendAndSave
contract SpendAndSaveReceiver is Ownable, ReentrancyGuard, IWormholeReceiver {
    
    IWormholeRelayer public immutable wormholeRelayer;
    mapping(uint16 => bool) public allowlistedSourceChains;
    mapping(uint16 => bytes32) public registeredSenders;
    
    error OnlyRelayerAllowed(address sender);
    error SourceChainNotAllowlisted(uint16 sourceChain);
    error InvalidSourceSender(uint16 sourceChain, bytes32 sender);

    event CrossChainTransferReceived(
        address indexed originalSender,
        address indexed recipient,
        uint256 amount,
        uint16 sourceChain,
        bytes32 sourceAddress
    );

    constructor(address _wormholeRelayer) Ownable(msg.sender) {
        require(_wormholeRelayer != address(0), "Invalid relayer address");
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
    }

    /// @notice Allowlist a source chain
    function setAllowlistedSourceChain(uint16 chainId, bool allowed) external onlyOwner {
        allowlistedSourceChains[chainId] = allowed;
    }

    /// @notice Register a trusted sender contract on another chain
    function setRegisteredSender(uint16 sourceChain, bytes32 sourceAddress) external onlyOwner {
        registeredSenders[sourceChain] = sourceAddress;
    }

    /// @notice Wormhole receiver function
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32
    ) external payable override nonReentrant {
        if (msg.sender != address(wormholeRelayer)) {
            revert OnlyRelayerAllowed(msg.sender);
        }

        if (!allowlistedSourceChains[sourceChain]) {
            revert SourceChainNotAllowlisted(sourceChain);
        }

        if (registeredSenders[sourceChain] != sourceAddress) {
            revert InvalidSourceSender(sourceChain, sourceAddress);
        }

        (address originalSender, address recipient, uint256 amount) = abi.decode(
            payload,
            (address, address, uint256)
        );

        (bool success,) = payable(recipient).call{value: amount}("");
        require(success, "Transfer to recipient failed");

        emit CrossChainTransferReceived(
            originalSender,
            recipient,
            amount,
            sourceChain,
            sourceAddress
        );
    }

    function getWormholeRelayer() external view returns (address) {
        return address(wormholeRelayer);
    }

    function isSourceChainAllowlisted(uint16 chainId) external view returns (bool) {
        return allowlistedSourceChains[chainId];
    }

    function getRegisteredSender(uint16 chainId) external view returns (bytes32) {
        return registeredSenders[chainId];
    }

    receive() external payable {}
}