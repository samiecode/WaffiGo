# 💚 WaffiGo

<div align="center">
  <strong>Save While You Spend — Automatically</strong>
  
  A decentralized payment app on Celo that automatically saves a percentage of every transaction you make.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Celo](https://img.shields.io/badge/Celo-FCFF52?style=for-the-badge&logo=celo&logoColor=black)](https://celo.org/)

[View Contract on Celoscan →](https://celo-sepolia.blockscout.com/address/0x1f9DAE0d86f61eF477AE7C8160cC74eEc2E65AAa)

</div>

---

## 🎯 Overview

WaffiPay is a spend-and-save payment application that enables users to send money while automatically saving a percentage of each transaction. Built on the Celo blockchain with integrated token swapping via Ubeswap.

### 🚀 Key Features

-   💸 **Spend & Save** — Automatic savings on every transfer
-   💱 **Token Swaps** — Exchange CELO, cUSD, and cEUR via Ubeswap
-   ⚙️ **Custom Rates** — Set your own savings percentage (0-100%)
-   📜 **Full History** — Track all transactions and savings
-   📱 **Farcaster Ready** — Built as a Mini App
-   🔄 **Withdraw Anytime** — Access your savings when you need them

---

## 💡 How It Works

```
You send:        10 CELO
Auto-saved:       1 CELO (10%)
Recipient gets:  10 CELO
You pay:         11 CELO total
```

---

## 🏗️ Architecture

### Frontend Stack

-   **Framework**: Next.js 15 with App Router
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS 4
-   **Web3**: Wagmi + Viem + RainbowKit
-   **Mini App**: Farcaster SDK

### Smart Contracts

-   **Language**: Solidity 0.8.20
-   **Framework**: Foundry
-   **Libraries**: OpenZeppelin (Ownable, ReentrancyGuard)
-   **DEX**: Ubeswap (Uniswap V2 fork)

---

## 🔧 Quick Start

```bash
# Clone
git clone https://github.com/samiecode/waffipay.git
cd waffipay

# Contracts
cd contract && forge install && forge build

# Frontend
cd ../frontend && npm install
cp .env.example .env.local
npm run dev
```

---

## 🔐 Smart Contract Integration

### Contract Addresses

| Contract          | Address                   |
| ----------------- | ------------------------- |
| **WaffiContract** | `0x1f9DAE0d86f61eF477AE7C8160cC74eEc2E65AAa` |
| **CeloSwap**      | `0xYOUR_CELOSWAP_ADDRESS` |

### WaffiContract Functions

-   `transfer(recipient, amount)` — Send CELO with auto-save
-   `setSavingsRate(rateBps)` — Set savings rate (1000 = 10%)
-   `setSavingsEnabled(enabled)` — Toggle auto-saving
-   `withdrawSavings()` — Withdraw savings
-   `getUserData(address)` — Get user stats
-   `getUserTransactions(address)` — Get transaction history

### CeloSwap Functions

-   `swapCeloToCUSD(amountOutMin, deadline)` — CELO → cUSD
-   `swapCeloToCEUR(amountOutMin, deadline)` — CELO → cEUR
-   `swapCeloToToken(token, amountOutMin, deadline)` — CELO → Token
-   `swapTokenToCelo(token, amountIn, amountOutMin, deadline)` — Token → CELO
-   `getEstimatedTokenForCelo(token, amount)` — Get swap quote

---

## 🌐 Network & Tokens

**Network:** Celo Alfajores Testnet (Chain ID: 44787)

| Token          | Address                                      |
| -------------- | -------------------------------------------- |
| Wrapped CELO   | `0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9` |
| cUSD           | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |
| cEUR           | `0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F` |
| Ubeswap Router | `0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121` |

---

## 🚀 Deployment

```bash
# WaffiContract (1000 = 10% default rate)
forge create src/WaffiContract.sol:WaffiContract \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --account deployer --broadcast --legacy \
  --constructor-args 1000

# CeloSwap
forge create src/CeloSwap.sol:CeloSwap \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --account deployer --broadcast --legacy \
  --constructor-args \
    0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121 \
    0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9 \
    0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1

# Connect contracts
cast send $WAFFI_CONTRACT_ADDRESS "setCeloSwap(address)" $CELO_SWAP_ADDRESS \
  --rpc-url https://forno.celo-sepolia.celo-testnet.org \
  --account deployer --legacy
```

---

## 🔒 Security

-   **OpenZeppelin** — Battle-tested contract libraries
-   **ReentrancyGuard** — Protection against reentrancy attacks
-   **Ownable** — Admin-only functions secured

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with 💚 on Celo</p>
  <p>© 2025 WaffiGo</p>
</div>
