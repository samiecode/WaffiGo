# Spend & Save V1

An **on-chain financial app** (like OPay/PalmPay) on the Celo network that allows users to **send money to others** while automatically saving a percentage of each transaction.

## 🎯 Overview

This dApp is a **real financial application** that demonstrates:

-   **Send money** to any wallet address on Celo
-   **Automatic savings**: A configurable percentage of each transfer is automatically saved
-   **Transaction history**: View all your past transfers with recipients, amounts, and savings
-   **Flexible savings rate**: Set your own auto-save percentage (0-100%)
-   **Withdraw savings**: Transfer your accumulated savings back to your wallet anytime

### How It Works

When you send money:

1. You specify recipient address + amount (e.g., send 10 CELO)
2. The contract calculates your savings (e.g., 10% = 1 CELO saved)
3. The recipient receives the remaining amount (e.g., 9 CELO)
4. Your savings accumulate in the contract (e.g., +1 CELO to your savings)
5. Transaction is recorded in your history

## 📋 Prerequisites

-   **Node.js** (v18 or higher)
-   **Foundry** (install via `foundryup` - see [getfoundry.sh](https://getfoundry.sh))
-   **Celo Alfajores Testnet Wallet** with test CELO
    -   Get test CELO from [Celo Faucet](https://faucet.celo.org/alfajores)
-   **Yarn or npm** for frontend dependencies

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd spendandsave
```

### 2. Install Foundry Dependencies

```bash
forge install
```

---

## ⚒️ Foundry Toolkit

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools)
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL

📚 **Full Documentation**: https://book.getfoundry.sh/

---

## 🚀 Smart Contract Development

The smart contract is located in `src/SpendAndSaveV1.sol`.

### Build

Compile your contracts:

```bash
forge build
```

### Test

Run all tests:

```bash
forge test
```

Run tests with different verbosity levels:

```bash
forge test -v      # Basic output
forge test -vv     # Show logs
forge test -vvv    # Show execution traces
forge test -vvvv   # Show execution traces with stack
```

Run specific test:

```bash
forge test --match-test testSpendAndSaveDefaultRate
```

### Format Code

Format your Solidity code:

```bash
forge fmt
```

### Gas Snapshots

Generate gas usage snapshots:

```bash
forge snapshot
```

This creates a `.gas-snapshot` file with gas usage for each test.

### Local Development with Anvil

Start a local Ethereum node:

```bash
anvil
```

This starts a local node with 10 pre-funded accounts.

### Deploy to Celo Alfajores

#### Preparation

1. **Create environment file:**

    ```bash
    cp .env.example .env
    ```

2. **Edit `.env` and add your private key:**

    ```env
    PRIVATE_KEY=your_private_key_here_without_0x_prefix
    CELO_RPC_URL=https://alfajores-forno.celo-testnet.org
    ```

#### Method 1: Using Forge Script (Recommended)

Deploy using the deployment script:

```bash
forge script script/Deploy.s.sol --rpc-url https://reth-ethereum.ithaca.xyz/rpc --broadcast --legacy
```

> **Note:** The `--legacy` flag is required for Celo compatibility

#### Method 2: Using Forge Create

Deploy directly with forge create:

```bash
forge create ./src/SpendAndSave.sol:SpendAndSave \
  --rpc-url $CELO_RPC_URL \
  --account deployer \
  --broadcast \
  --constructor-args 1000 \
  --legacy 
```

The constructor arg `1000` sets the default savings rate to 10% (1000 basis points).

#### Save Contract Address

**Important:** Save the deployed contract address from the output. You'll need it for:

-   Frontend configuration
-   Contract verification
-   Interacting with the contract

### Verify Contract (Optional)

Verify your contract on Celoscan:

```bash
forge verify-contract \
  $CONTRACT_ADDRESS \
  ./src/SpendAndSave.sol:SpendAndSave \
  --chain celo-sepolia \
  --verifier blockscout \
  --verifier-api-key $CELOSCAN_API_KEY \
  --verifier-url $CELOSCAN_API_URL \
  --constructor-args $(cast abi-encode "constructor(uint256)" 1000)
```

Replace `$CONTRACT_ADDRESS` with your deployed contract address.

### Interact with Contract Using Cast

After deployment, you can interact with your contract using Cast:

```bash
# Check default savings rate
cast call $CONTRACT_ADDRESS "defaultSavingsRateBps()(uint256)" --rpc-url https://alfajores-forno.celo-testnet.org

# Get user data
cast call $CONTRACT_ADDRESS "getUserData(address)(uint256,uint256,uint256)" $USER_ADDRESS --rpc-url https://alfajores-forno.celo-testnet.org

# Send transaction (set savings rate)
cast send $CONTRACT_ADDRESS "setSavingsRate(uint256)" 2000 \
  --private-key $PRIVATE_KEY \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --legacy
```

### Foundry Help

Get help on any Foundry command:

```bash
forge --help
cast --help
anvil --help
chisel --help
```

## 🎨 Frontend Setup

The frontend is a Next.js app using Wagmi + Viem for Celo integration.

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Contract Address

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your deployed contract address:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Using the dApp

### 1. **Connect Wallet**

-   Click "Connect Wallet" button
-   Approve the connection with your Celo wallet (e.g., MetaMask configured for Celo Alfajores)
-   Your wallet balance will be displayed at the top

### 2. **Send Money** (Main Feature)

-   Go to the "Send Money" tab
-   Enter the **recipient's wallet address** (0x...)
-   Enter the **amount in CELO** you want to send
-   See the breakdown:
    -   Amount recipient will receive
    -   Amount automatically saved
    -   Your current savings rate
-   Click "Send Money" to complete the transaction
-   **The recipient gets the money minus your savings!**

### 3. **Manage Your Savings**

-   Switch to the "Savings" tab to view your accumulated savings
-   Click ⚙️ settings icon to change your auto-save rate (0-100%)
-   Click "Withdraw All Savings" to transfer saved CELO back to your wallet

### 4. **View Transaction History**

-   Click "View Transaction History" at the bottom
-   See all your past transfers with:
    -   Recipient addresses
    -   Amounts sent
    -   Amounts saved
    -   Timestamps
    -   Savings rates used

### 5. **Dashboard Stats**

-   **Total Saved**: Cumulative CELO you've saved
-   **Transactions**: Number of money transfers completed
-   **Your Balance**: Current CELO in your wallet

## 🏗️ Project Structure

```
spendandsave/
├── src/
│   └── SpendAndSaveV1.sol       # Main smart contract with transfer logic
├── script/
│   └── DeployV1.s.sol           # Foundry deployment script
├── test/
│   └── SpendAndSaveV1.t.sol     # Contract tests
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       │   └── SpendAndSave.tsx  # Main financial app UI
│   │       ├── transactions/
│   │       │   └── page.tsx          # Transaction history page
│   │       ├── abi.ts                # Contract ABI
│   │       ├── providers.tsx         # Wagmi/Celo config
│   │       └── page.tsx              # Home page
│   └── package.json
├── foundry.toml                 # Foundry configuration
├── .env.example                 # Contract deployment env template
└── README.md
```

## 🧪 Contract Details

### Key Functions

-   `spendAndSave(address recipient)` - **Send CELO to recipient** while automatically saving a percentage
-   `setSavingsRate(uint256 newRateBps)` - Set your personal savings rate (in basis points: 1000 = 10%)
-   `withdrawSavings()` - Withdraw all your accumulated savings back to your wallet
-   `getUserData(address user)` - View user stats (totalSpent, totalSaved, savingsRate)
-   `getUserTransactions(address user)` - Get full transaction history array
-   `getUserTransactionCount(address user)` - Get count of transactions

### Transaction Structure

Each transaction records:

-   `sender` - Your address
-   `recipient` - Who received the money
-   `amountSent` - CELO amount transferred to recipient
-   `amountSaved` - CELO amount saved in contract
-   `timestamp` - When the transaction occurred
-   `savingsRateBps` - Savings rate used for this transaction

### Events

-   `SpentAndSaved(sender, recipient, amountSent, amountSaved, rate, timestamp)` - Emitted when money is sent
-   `SavingsWithdrawn(user, amount)` - Emitted when user withdraws savings
-   `UserSavingsRateUpdated(user, newRate)` - Emitted when user updates their rate

## 🔍 Verifying Transactions

All transactions can be viewed on [Celo Alfajores Explorer](https://alfajores.celoscan.io/)

The UI provides direct links to transaction details after each action.

## ⚠️ Important Notes

-   This is a **V1 proof-of-concept** for hackathon/demo purposes
-   Not production-ready or security-audited
-   **Real money transfers**: Recipients actually receive CELO (minus your savings)
-   Only your savings remain in the contract until you withdraw them
-   Cannot send money to yourself (validation built-in)
-   Savings rate can be set between 0-100%

## 🛠️ Troubleshooting

**Issue:** Transaction fails with "insufficient funds"

-   **Solution:** Get test CELO from the [Celo Faucet](https://faucet.celo.org/alfajores)

**Issue:** Contract address not updating

-   **Solution:** Make sure `.env.local` is in the `frontend/` directory and restart the dev server

**Issue:** Wrong network

-   **Solution:** Switch your wallet to Celo Alfajores testnet (Chain ID: 44787)

## 📄 License

MIT
