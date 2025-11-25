# Wormhole Cross-Chain Integration Guide

## Overview

Your `SpendAndSave` contract now supports cross-chain transfers via **Wormhole**, allowing users to send money across 30+ blockchains including Celo, Ethereum, Polygon, and more.

## How It Works

1. **User sends cross-chain transfer**: Calls `transferCrossChain()` with target chain, recipient, and amount
2. **Savings calculated**: Contract saves the configured percentage locally on source chain
3. **Wormhole relays**: The remaining amount is sent via Wormhole to the destination chain
4. **Recipient receives**: Funds arrive at the recipient's address on the destination chain

## Wormhole Chain IDs

### Mainnets

-   **Celo**: 14
-   **Ethereum**: 2
-   **Polygon**: 5
-   **Avalanche**: 6
-   **BSC**: 4
-   **Arbitrum**: 23
-   **Optimism**: 24
-   **Base**: 30

### Testnets

-   **Celo Alfajores**: 14 (same as mainnet)
-   **Ethereum Sepolia**: 10002
-   **Polygon Mumbai**: 10005
-   **Avalanche Fuji**: 6 (same as mainnet)
-   **BSC Testnet**: 4 (same as mainnet)
-   **Arbitrum Sepolia**: 10003
-   **Optimism Sepolia**: 10005
-   **Base Sepolia**: 10004

## Wormhole Relayer Addresses

### Mainnets

```solidity
Celo:      0x796Dff6D74F3E27060B71255Fe517BFb23C93eed
Ethereum:  0x27428DD2d3DD32A4D7f7C497eAaa23130d894911
Polygon:   0x27428DD2d3DD32A4D7f7C497eAaa23130d894911
Avalanche: 0x27428DD2d3DD32A4D7f7C497eAaa23130d894911
BSC:       0x27428DD2d3DD32A4D7f7C497eAaa23130d894911
Arbitrum:  0x27428DD2d3DD32A4D7f7C497eAaa23130d894911
Optimism:  0x27428DD2d3DD32A4D7f7C497eAaa23130d894911
Base:      0x706F82e9bb5b0813501714Ab5974216704980e31
```

### Testnets

```solidity
Celo Alfajores:     0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84
Ethereum Sepolia:   0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470
Polygon Mumbai:     0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0
Avalanche Fuji:     0xA3cF45939bD6260bcFe3D66bc73d60f19e49a8BB
BSC Testnet:        0x80aC94316391752A193C1c47E27D382b507c93F3
Arbitrum Sepolia:   0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470
Optimism Sepolia:   0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE
Base Sepolia:       0x93BAD53DDfB6132b0aC8E37f6029163E63372cEE
```

## Deployment

### 1. Deploy on Celo

```bash
# Set environment variables
export PRIVATE_KEY=your_private_key
export WORMHOLE_RELAYER=0x796Dff6D74F3E27060B71255Fe517BFb23C93eed  # Celo Mainnet

# Deploy
forge script script/Deploy.s.sol:DeployV1 --rpc-url https://forno.celo.org --broadcast --verify
```

### 2. Deploy on Ethereum

```bash
export WORMHOLE_RELAYER=0x27428DD2d3DD32A4D7f7C497eAaa23130d894911  # Ethereum Mainnet

forge script script/Deploy.s.sol:DeployV1 --rpc-url https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY --broadcast --verify
```

### 3. Deploy on Polygon

```bash
export WORMHOLE_RELAYER=0x27428DD2d3DD32A4D7f7C497eAaa23130d894911  # Polygon Mainnet

forge script script/Deploy.s.sol:DeployV1 --rpc-url https://polygon-rpc.com --broadcast --verify
```

## Initial Configuration

After deployment, you must allowlist the chains you want to support:

```solidity
// Example: Allow transfers to Ethereum (chain ID 2)
spendAndSave.setAllowlistedChain(2, true);

// Allow transfers to Polygon (chain ID 5)
spendAndSave.setAllowlistedChain(5, true);

// Allow transfers to Base (chain ID 30)
spendAndSave.setAllowlistedChain(30, true);
```

You can do this via Foundry cast:

```bash
# From Celo, allowlist Ethereum
cast send $CONTRACT_ADDRESS "setAllowlistedChain(uint16,bool)" 2 true \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY

# Allowlist Polygon
cast send $CONTRACT_ADDRESS "setAllowlistedChain(uint16,bool)" 5 true \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY
```

## Usage

### 1. Get Quote for Cross-Chain Transfer

Before sending, check how much it will cost:

```solidity
(uint256 totalCost, uint256 deliveryFee) = spendAndSave.quoteCrossChainTransfer(
    2,              // targetChain (Ethereum)
    1 ether         // amountToSend
);

// totalCost includes: amountToSend + savings + deliveryFee
// For 10% savings: totalCost = 1 ETH + 0.1 ETH + ~0.005 ETH = 1.105 ETH
```

Via cast:

```bash
cast call $CONTRACT_ADDRESS "quoteCrossChainTransfer(uint16,uint256)" 2 1000000000000000000 \
  --rpc-url https://forno.celo.org
```

### 2. Send Cross-Chain Transfer

```solidity
uint64 sequence = spendAndSave.transferCrossChain{value: 1.105 ether}(
    2,                    // targetChain (Ethereum)
    0x742d35Cc...,        // recipient address
    1 ether               // amountToSend
);
```

Via cast:

```bash
cast send $CONTRACT_ADDRESS "transferCrossChain(uint16,address,uint256)" \
  2 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 1000000000000000000 \
  --value 1105000000000000000 \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY
```

### 3. Track Your Transfer

Use [Wormhole Scan](https://wormholescan.io/) to track your cross-chain message:

-   Search by transaction hash
-   Search by sequence number
-   Typical delivery time: 2-5 minutes

### 4. Same-Chain Transfers

The original `transfer()` function still works for same-chain transfers:

```solidity
spendAndSave.transfer{value: 1.1 ether}(
    0x742d35Cc...,        // recipient
    1 ether               // amountToSend
);
```

## Cost Breakdown

### Example: Send 100 CELO from Celo to Ethereum

1. **Amount to send**: 100 CELO
2. **Savings (10%)**: 10 CELO (stays on Celo)
3. **Wormhole fee**: ~0.5 CELO
4. **Total required**: 110.5 CELO

The recipient receives: 100 CELO worth of ETH on Ethereum

## Frontend Integration

### Check Quote Before Transfer

```typescript
import {parseEther} from "viem";

const [totalCost, deliveryFee] = await contract.read.quoteCrossChainTransfer([
	2, // Ethereum chain ID
	parseEther("1"), // Amount to send
]);

console.log(`Total cost: ${formatEther(totalCost)} CELO`);
console.log(`Delivery fee: ${formatEther(deliveryFee)} CELO`);
```

### Send Cross-Chain Transfer

```typescript
const hash = await contract.write.transferCrossChain(
	[
		2, // Target chain
		recipientAddress, // Recipient
		parseEther("1"), // Amount
	],
	{
		value: totalCost, // Include total cost
	}
);

// Wait for confirmation
await publicClient.waitForTransactionReceipt({hash});
```

### Listen for Events

```typescript
// Listen for cross-chain transfers
const unwatch = contract.watchEvent.CrossChainTransferInitiated({
	fromBlock: "latest",
	onLogs: (logs) => {
		logs.forEach((log) => {
			console.log("Transfer to chain:", log.args.targetChain);
			console.log("Sequence:", log.args.sequence);
			console.log("Amount:", log.args.amountSent);
		});
	},
});
```

## Testing on Testnet

### 1. Deploy on Celo Alfajores

```bash
export WORMHOLE_RELAYER=0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84

forge script script/Deploy.s.sol:DeployV1 \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast
```

### 2. Deploy on Ethereum Sepolia

```bash
export WORMHOLE_RELAYER=0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470

forge script script/Deploy.s.sol:DeployV1 \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --broadcast
```

### 3. Configure Cross-Chain

```bash
# On Alfajores, allowlist Sepolia (chain ID 10002)
cast send $CELO_CONTRACT "setAllowlistedChain(uint16,bool)" 10002 true \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

### 4. Send Test Transfer

```bash
# Get testnet CELO from: https://faucet.celo.org

cast send $CELO_CONTRACT "transferCrossChain(uint16,address,uint256)" \
  10002 $RECIPIENT_ADDRESS 100000000000000000 \
  --value 120000000000000000 \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

## Security Considerations

### 1. Chain Allowlisting

Only allowlist chains where you've deployed the contract. This prevents funds from being sent to chains where they can't be received.

### 2. Relayer Verification

The contract verifies that `msg.sender` is the Wormhole relayer in `receiveWormholeMessages()`. This prevents unauthorized calls.

### 3. Gas Limits

The contract uses a fixed `GAS_LIMIT` of 300,000. This should be sufficient for the receive function, but can be adjusted if needed.

### 4. Testing

Always test on testnets first:

1. Deploy on both source and destination testnets
2. Allowlist the destination chain
3. Send a small test transfer
4. Verify receipt on destination

## Troubleshooting

### "ChainNotAllowlisted" Error

**Solution**: Call `setAllowlistedChain(chainId, true)` from the owner account

### "InsufficientFunds" Error

**Solution**: Get a quote first using `quoteCrossChainTransfer()`, then send that exact amount

### Transfer Not Arriving

**Causes**:

1. Contract not deployed on destination chain
2. Wormhole delivery still in progress (wait 5-10 minutes)
3. Destination chain congestion

**Check**: Use [Wormhole Scan](https://wormholescan.io/) to see delivery status

### High Delivery Fees

**Explanation**: Wormhole fees vary by:

-   Source chain gas prices
-   Destination chain gas prices
-   Network congestion

**Tip**: Fees are typically 0.1-1% of transfer amount

## Advanced: Custom Gas Limits

If you need to adjust the gas limit for receiving:

```solidity
// In contract, change:
uint256 public constant GAS_LIMIT = 300_000;

// To:
uint256 public gasLimit = 300_000;

// Add setter:
function setGasLimit(uint256 _gasLimit) external onlyOwner {
    gasLimit = _gasLimit;
}
```

## Resources

-   [Wormhole Documentation](https://docs.wormhole.com/)
-   [Wormhole Scan](https://wormholescan.io/)
-   [Chain IDs Reference](https://docs.wormhole.com/wormhole/reference/environments)
-   [Relayer Addresses](https://docs.wormhole.com/wormhole/explore-wormhole/core-contracts)
-   [Wormhole Discord](https://discord.gg/wormholecrypto)

## Support

For issues:

1. Check [Wormhole Scan](https://wormholescan.io/) for delivery status
2. Verify contract is deployed on both chains
3. Ensure chains are properly allowlisted
4. Join [Wormhole Discord](https://discord.gg/wormholecrypto) for help
