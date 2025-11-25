# Quick Start: Cross-Chain Transfers

## 🚀 Deployment Checklist

### 1. Deploy on Source Chain (Celo)

```bash
export WORMHOLE_RELAYER=0x796Dff6D74F3E27060B71255Fe517BFb23C93eed
forge script script/Deploy.s.sol:DeployV1 --rpc-url https://forno.celo.org --broadcast
```

### 2. Deploy on Destination Chains

Deploy the same contract on every chain you want to support:

-   Ethereum: `0x27428DD2d3DD32A4D7f7C497eAaa23130d894911`
-   Polygon: `0x27428DD2d3DD32A4D7f7C497eAaa23130d894911`
-   Base: `0x706F82e9bb5b0813501714Ab5974216704980e31`

### 3. Allowlist Chains

```bash
# On each deployed contract, allowlist other chains
cast send $CONTRACT "setAllowlistedChain(uint16,bool)" 2 true --rpc-url $RPC --private-key $PK
```

## 📋 Chain IDs Reference Card

| Chain     | Mainnet ID | Testnet ID |
| --------- | ---------- | ---------- |
| Celo      | 14         | 14         |
| Ethereum  | 2          | 10002      |
| Polygon   | 5          | 10005      |
| Avalanche | 6          | 6          |
| BSC       | 4          | 4          |
| Arbitrum  | 23         | 10003      |
| Optimism  | 24         | 10005      |
| Base      | 30         | 10004      |

## 💰 Usage Examples

### Get Quote

```bash
cast call $CONTRACT "quoteCrossChainTransfer(uint16,uint256)" 2 1000000000000000000 --rpc-url $RPC
```

### Send Cross-Chain

```bash
cast send $CONTRACT "transferCrossChain(uint16,address,uint256)" \
  2 $RECIPIENT 1000000000000000000 \
  --value 1100000000000000000 \
  --rpc-url $RPC \
  --private-key $PK
```

### Send Same-Chain

```bash
cast send $CONTRACT "transfer(address,uint256)" \
  $RECIPIENT 1000000000000000000 \
  --value 1100000000000000000 \
  --rpc-url $RPC \
  --private-key $PK
```

## 🔍 Track Transfers

[Wormhole Scan](https://wormholescan.io/) - Search by transaction hash

## ⚠️ Common Issues

| Error                 | Solution                                 |
| --------------------- | ---------------------------------------- |
| ChainNotAllowlisted   | Run `setAllowlistedChain(chainId, true)` |
| InsufficientFunds     | Use `quoteCrossChainTransfer()` first    |
| Transfer not arriving | Wait 5-10 minutes, check Wormhole Scan   |

## 📦 What You Get

### New Functions

-   `transferCrossChain(uint16 chain, address recipient, uint256 amount)` - Send cross-chain
-   `quoteCrossChainTransfer(uint16 chain, uint256 amount)` - Get cost estimate
-   `setAllowlistedChain(uint16 chain, bool allowed)` - Configure chains (owner only)
-   `isChainAllowlisted(uint16 chain)` - Check if chain is supported

### Original Functions (Still Work)

-   `transfer(address recipient, uint256 amount)` - Same-chain transfers
-   `withdrawSavings()` - Withdraw your savings
-   `setSavingsRate(uint256 rate)` - Set personal savings rate
-   All other existing functions

## 💡 Key Points

1. **Deploy on ALL chains** you want to support
2. **Allowlist chains** on each deployment
3. **Same contract address** recommended (use CREATE2 or deterministic deployment)
4. **Savings stay on source chain** - only the spend amount crosses chains
5. **Typical fee**: 0.1-1% of transfer amount
6. **Delivery time**: 2-5 minutes

## 📚 Full Documentation

See `WORMHOLE_GUIDE.md` for complete details
