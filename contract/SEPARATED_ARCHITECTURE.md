# Cross-Chain Setup Guide (Separated Architecture)

## Architecture Overview

The cross-chain functionality is now split into two contracts:

1. **SpendAndSave** (Sender Contract)
   - Handles user deposits, savings calculation, and sending cross-chain transfers
   - Deployed on the SOURCE chain where users initiate transfers
   - Contains `transferCrossChain()` function

2. **SpendAndSaveReceiver** (Receiver Contract)
   - Handles receiving cross-chain transfers from Wormhole
   - Deployed on DESTINATION chains where funds arrive
   - Contains `receiveWormholeMessages()` function

## Why Separate Contracts?

- ✅ **Cleaner separation of concerns**
- ✅ **Smaller contract sizes**
- ✅ **Easier to upgrade receiver logic independently**
- ✅ **Better security isolation**
- ✅ **Can have multiple receivers on different chains**

## Deployment Steps

### Step 1: Deploy SpendAndSave (Sender) on Source Chain

Deploy on the chain where users will initiate transfers (e.g., Celo):

```bash
export WORMHOLE_RELAYER=0x796Dff6D74F3E27060B71255Fe517BFb23C93eed
export PRIVATE_KEY=your_private_key

forge script script/Deploy.s.sol:DeployV1 \
  --rpc-url https://forno.celo.org \
  --broadcast \
  --verify
```

**Save the deployed address!** You'll need it later.

### Step 2: Deploy SpendAndSaveReceiver on Destination Chains

Deploy the receiver on EACH chain where you want to receive funds:

#### On Ethereum:
```bash
export WORMHOLE_RELAYER=0x27428DD2d3DD32A4D7f7C497eAaa23130d894911

forge script script/DeployReceiver.s.sol:DeployReceiver \
  --rpc-url https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY \
  --broadcast \
  --verify
```

#### On Polygon:
```bash
export WORMHOLE_RELAYER=0x27428DD2d3DD32A4D7f7C497eAaa23130d894911

forge script script/DeployReceiver.s.sol:DeployReceiver \
  --rpc-url https://polygon-rpc.com \
  --broadcast \
  --verify
```

#### On Base:
```bash
export WORMHOLE_RELAYER=0x706F82e9bb5b0813501714Ab5974216704980e31

forge script script/DeployReceiver.s.sol:DeployReceiver \
  --rpc-url https://mainnet.base.org \
  --broadcast \
  --verify
```

### Step 3: Configure SpendAndSave (Sender)

On the source chain, configure which chains are allowed and their receiver addresses:

```bash
SENDER_CONTRACT=0x... # Your SpendAndSave address
RECEIVER_ETH=0x...    # Receiver address on Ethereum
RECEIVER_POLYGON=0x... # Receiver address on Polygon

# Allowlist Ethereum (chain ID 2)
cast send $SENDER_CONTRACT "setAllowlistedDestinationChain(uint16,bool)" 2 true \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY

# Set Ethereum receiver contract
cast send $SENDER_CONTRACT "setReceiverContract(uint16,address)" 2 $RECEIVER_ETH \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY

# Allowlist Polygon (chain ID 5)
cast send $SENDER_CONTRACT "setAllowlistedDestinationChain(uint16,bool)" 5 true \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY

# Set Polygon receiver contract
cast send $SENDER_CONTRACT "setReceiverContract(uint16,address)" 5 $RECEIVER_POLYGON \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY
```

### Step 4: Configure Receivers

On EACH destination chain, configure the receiver to accept messages from your sender:

```bash
# Get the sender contract address in bytes32 format
SENDER_BYTES32=$(cast --to-bytes32 $SENDER_CONTRACT)

# On Ethereum receiver - allowlist Celo source (chain ID 14)
cast send $RECEIVER_ETH "setAllowlistedSourceChain(uint16,bool)" 14 true \
  --rpc-url https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY \
  --private-key $PRIVATE_KEY

# Register the sender contract
cast send $RECEIVER_ETH "setRegisteredSender(uint16,bytes32)" 14 $SENDER_BYTES32 \
  --rpc-url https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY \
  --private-key $PRIVATE_KEY
```

Repeat for each destination chain (Polygon, Base, etc.).

## Usage

### Send Cross-Chain Transfer

```bash
# 1. Get quote
cast call $SENDER_CONTRACT "quoteCrossChainTransfer(uint16,uint256)" \
  2 1000000000000000000 \
  --rpc-url https://forno.celo.org

# Returns: [totalCost, deliveryFee]

# 2. Send transfer
cast send $SENDER_CONTRACT "transferCrossChain(uint16,address,uint256)" \
  2 0xRecipientAddress 1000000000000000000 \
  --value 1100000000000000000 \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY
```

### Track Transfer

Visit [Wormhole Scan](https://wormholescan.io/) and search by transaction hash.

## Configuration Reference

### Sender Contract Functions (SpendAndSave)

- `setAllowlistedDestinationChain(uint16 chainId, bool allowed)` - Enable/disable destination chain
- `setReceiverContract(uint16 chainId, address receiver)` - Set receiver contract address
- `transferCrossChain(uint16 chain, address recipient, uint256 amount)` - Send cross-chain
- `quoteCrossChainTransfer(uint16 chain, uint256 amount)` - Get cost estimate
- `isDestinationChainAllowlisted(uint16 chainId)` - Check if chain is enabled
- `getReceiverContract(uint16 chainId)` - Get receiver address for chain

### Receiver Contract Functions (SpendAndSaveReceiver)

- `setAllowlistedSourceChain(uint16 chainId, bool allowed)` - Enable/disable source chain
- `setRegisteredSender(uint16 sourceChain, bytes32 senderAddress)` - Register sender contract
- `isSourceChainAllowlisted(uint16 chainId)` - Check if source allowed
- `getRegisteredSender(uint16 chainId)` - Get registered sender for chain

## Wormhole Chain IDs

| Chain | Chain ID |
|-------|----------|
| Celo | 14 |
| Ethereum | 2 |
| Polygon | 5 |
| Avalanche | 6 |
| BSC | 4 |
| Arbitrum | 23 |
| Optimism | 24 |
| Base | 30 |

## Testnet Deployment Example

### 1. Deploy Sender on Celo Alfajores

```bash
export WORMHOLE_RELAYER=0x306B68267Deb7c5DfCDa3619E22E9Ca39C374f84

forge script script/Deploy.s.sol:DeployV1 \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast
```

### 2. Deploy Receiver on Ethereum Sepolia

```bash
export WORMHOLE_RELAYER=0x7B1bD7a6b4E61c2a123AC6BC2cbfC614437D0470

forge script script/DeployReceiver.s.sol:DeployReceiver \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --broadcast
```

### 3. Configure Sender (Celo Alfajores)

```bash
SENDER=0x...      # Sender on Celo Alfajores
RECEIVER=0x...    # Receiver on Sepolia

# Allowlist Sepolia (chain ID 10002)
cast send $SENDER "setAllowlistedDestinationChain(uint16,bool)" 10002 true \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY

# Set receiver
cast send $SENDER "setReceiverContract(uint16,address)" 10002 $RECEIVER \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

### 4. Configure Receiver (Sepolia)

```bash
SENDER_BYTES32=$(cast --to-bytes32 $SENDER)

# Allowlist Celo Alfajores (chain ID 14)
cast send $RECEIVER "setAllowlistedSourceChain(uint16,bool)" 14 true \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --private-key $PRIVATE_KEY

# Register sender
cast send $RECEIVER "setRegisteredSender(uint16,bytes32)" 14 $SENDER_BYTES32 \
  --rpc-url https://sepolia.infura.io/v3/YOUR_KEY \
  --private-key $PRIVATE_KEY
```

### 5. Test Transfer

```bash
# Send 0.1 testnet CELO to Sepolia
cast send $SENDER "transferCrossChain(uint16,address,uint256)" \
  10002 0xYourRecipientAddress 100000000000000000 \
  --value 150000000000000000 \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --private-key $PRIVATE_KEY
```

## Security Features

### Sender Contract
- ✅ Only owner can allowlist chains
- ✅ Only owner can set receiver contracts
- ✅ Requires both chain allowlist AND receiver set
- ✅ ReentrancyGuard on all payable functions

### Receiver Contract
- ✅ Only Wormhole relayer can call receive function
- ✅ Only allowlisted source chains accepted
- ✅ Only registered senders accepted
- ✅ Three-layer security check

## Troubleshooting

### Error: "ReceiverNotSet"
**Solution**: Call `setReceiverContract(chainId, receiverAddress)` on sender

### Error: "ChainNotAllowlisted"  
**Solution**: Call `setAllowlistedDestinationChain(chainId, true)` on sender

### Error: "SourceChainNotAllowlisted"
**Solution**: Call `setAllowlistedSourceChain(chainId, true)` on receiver

### Error: "InvalidSourceSender"
**Solution**: Call `setRegisteredSender(chainId, senderBytes32)` on receiver

## Benefits of This Architecture

1. **Modularity**: Upgrade receiver logic without touching sender
2. **Efficiency**: Sender contract doesn't need receiver code
3. **Flexibility**: Different receiver implementations per chain if needed
4. **Security**: Clear separation of concerns
5. **Gas Savings**: Smaller contracts = lower deployment costs

## Next Steps

1. Deploy sender on your primary chain
2. Deploy receivers on all destination chains
3. Configure sender with receiver addresses
4. Configure receivers with sender address
5. Test with small amounts first
6. Monitor via Wormhole Scan

## Resources

- [Wormhole Documentation](https://docs.wormhole.com/)
- [Wormhole Scan](https://wormholescan.io/)
- [Chain IDs](https://docs.wormhole.com/wormhole/reference/environments)
