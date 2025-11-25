# Cross-Chain Transfer Setup Guide

## Current Status
The `SpendAndSave` contract currently only supports same-chain transfers. To enable cross-chain functionality, you have several options:

## Option 1: Deploy on Multiple Chains (Simplest)
Deploy the same contract on multiple chains (Celo, Ethereum, Polygon, etc.). Users can:
- Use the contract on each chain independently
- Bridge funds manually using existing bridges (Celo Bridge, Wormhole, etc.)
- Each chain maintains its own savings balance

### Advantages:
- Simple to implement (no code changes needed)
- Lower gas costs per transaction
- No cross-chain message complexity

### Disadvantages:
- Savings are split across chains
- Users need to bridge manually

## Option 2: Chainlink CCIP Integration (Recommended for Production)

### Requirements:
1. Install Chainlink CCIP contracts (v0.8):
```bash
forge install smartcontractkit/chainlink-ccip --no-commit
```

2. Update `remappings.txt`:
```
@chainlink/contracts-ccip/=lib/chainlink-ccip/contracts/
```

3. Key Components Needed:
- `IRouterClient` - For sending cross-chain messages
- `CCIPReceiver` - For receiving cross-chain messages
- LINK tokens for fees
- Router addresses for each supported chain

### Supported Networks for CCIP:
- **Mainnet**: Ethereum, Avalanche, Polygon, Arbitrum, Optimism, Base
- **Testnet**: Sepolia, Fuji, Mumbai, Arbitrum Sepolia, Optimism Sepolia, Base Sepolia

#### Celo Status:
⚠️ **Celo is NOT currently supported by Chainlink CCIP**. If you need Celo support, consider Option 3 or Option 4.

### CCIP Router Addresses:
- Ethereum Mainnet: `0x80226fc0Ee2b096224EeAc085Bb9a8cba1146f7D`
- Polygon Mainnet: `0x849c5ED5a80F5B408Dd4969b78c2C8fdf0565Bfe`
- Avalanche Mainnet: `0xF4c7E640EdA248ef95972845a62bdC74237805dB`

[Full list of addresses](https://docs.chain.link/ccip/directory/mainnet/mainnet-1)

## Option 3: Wormhole Integration

Wormhole supports more chains including Celo. 

### Requirements:
```bash
forge install wormhole-foundation/wormhole-solidity-sdk --no-commit
```

### Advantages:
- **Supports Celo** and 30+ other chains
- Wide ecosystem support
- Mature cross-chain messaging

### Implementation Steps:
1. Inherit from `WormholeRelayer`
2. Implement `receiveWormholeMessages`
3. Use `sendPayloadToEvm` for cross-chain calls

### Wormhole Relayer Addresses:
- Celo: `0x796Dff6D74F3E27060B71255Fe517BFb23C93eed`
- Ethereum: `0x27428DD2d3DD32A4D7f7C497eAaa23130d894911`
- Polygon: `0x27428DD2d3DD32A4D7f7C497eAaa23130d894911`

[Wormhole Documentation](https://docs.wormhole.com/wormhole/explore-wormhole/core-contracts)

## Option 4: LayerZero Integration (Good for Celo)

LayerZero also supports Celo and provides omnichain functionality.

### Requirements:
```bash
forge install LayerZero-Labs/LayerZero-v2 --no-commit
```

### Advantages:
- **Supports Celo**
- Lower fees than some alternatives
- Simple developer experience

### LayerZero Endpoints:
- Celo Mainnet: `0x1a44076050125825900e736c501f859c50fE728c`
- Ethereum: `0x1a44076050125825900e736c501f859c50fE728c`
- Polygon: `0x1a44076050125825900e736c501f859c50fE728c`

## Recommended Approach for Your Project

Given that you've deployed on **Celo Sepolia**, I recommend:

### Short Term (Deploy Now):
1. **Option 1**: Deploy the same contract on multiple test networks
2. Users bridge manually for now
3. This gets your app functional immediately

### Long Term (Production):
1. **Option 3 (Wormhole)** or **Option 4 (LayerZero)** since they support Celo
2. Implement cross-chain messaging
3. Unified savings across all chains

## Implementation Example (Wormhole)

```solidity
// Add to SpendAndSave.sol
import {IWormholeRelayer} from "wormhole-solidity-sdk/interfaces/IWormholeRelayer.sol";
import {IWormholeReceiver} from "wormhole-solidity-sdk/interfaces/IWormholeReceiver.sol";

contract SpendAndSave is Ownable, ReentrancyGuard, IWormholeReceiver {
    IWormholeRelayer public wormholeRelayer;
    
    constructor(
        uint256 _defaultSavingsRateBps,
        address _wormholeRelayer
    ) Ownable(msg.sender) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        // ... rest of constructor
    }
    
    function transferCrossChain(
        uint16 targetChain,
        address recipient,
        uint256 amountToSend
    ) external payable {
        // Calculate savings
        uint256 savings = (amountToSend * rateBps) / 10_000;
        
        // Update local state
        users[msg.sender].totalSaved += savings;
        
        // Send cross-chain message
        wormholeRelayer.sendPayloadToEvm{value: msg.value - savings}(
            targetChain,
            address(this), // target contract
            abi.encode(msg.sender, recipient, amountToSend),
            0, // no receiver value
            gasLimit
        );
    }
    
    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory,
        bytes32 sourceAddress,
        uint16 sourceChain,
        bytes32 deliveryHash
    ) external payable override {
        // Decode and process
        (address sender, address recipient, uint256 amount) = abi.decode(
            payload,
            (address, address, uint256)
        );
        
        // Transfer to recipient
        payable(recipient).transfer(amount);
    }
}
```

## Next Steps

1. **Choose your approach** based on:
   - Which chains you want to support
   - Your timeline
   - Your budget for cross-chain fees

2. **Test on testnets** before mainnet deployment

3. **Consider user experience**:
   - Show estimated fees clearly
   - Add time estimates for cross-chain transfers
   - Provide transaction tracking

## Need Help?

If you want me to implement any of these options, let me know which one you prefer and I'll update the contract code accordingly!
