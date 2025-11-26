"use client"

import { useReadContracts } from "wagmi"
import { formatUnits } from "viem"
import { useWallet } from "./use-wallet"
import { CELO_TOKENS, ERC20_ABI, type Token } from "@/lib/tokens"
import { useQuery } from "@tanstack/react-query"

const priceFetcher = async (tokens: string[]) => {
  const ids = tokens.join(",")
  const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
  return res.json()
}

// Map token symbols to CoinGecko IDs
const COINGECKO_IDS: Record<string, string> = {
  CELO: "celo",
  cUSD: "celo-dollar",
  cEUR: "celo-euro",
  USDC: "usd-coin",
  USDT: "tether",
}

export interface TokenBalance {
  token: Token
  balance: string
  balanceFormatted: string
  usdValue: number
}

export function useTokenBalances() {
  const { address, isConnected, balance: nativeBalance, celoPrice } = useWallet()

  // Build contract read calls for all ERC20 tokens
  const tokenContracts = CELO_TOKENS.filter((t) => !t.isNative).map((token) => ({
    address: token.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address!],
  }))

  const { data: tokenBalances, isLoading } = useReadContracts({
    contracts: tokenContracts,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Fetch prices
  const {data: prices} = useQuery({
		queryKey: [
			isConnected
				? ["token-prices", Object.values(COINGECKO_IDS).join(",")]
				: null,
		],
		queryFn: () => priceFetcher(Object.values(COINGECKO_IDS)),
		refetchInterval: 60000,
  });

  // Format balances
  const balances: TokenBalance[] = CELO_TOKENS.map((token, index) => {
    if (token.isNative) {
      const balanceNum = Number.parseFloat(nativeBalance)
      return {
        token,
        balance: nativeBalance,
        balanceFormatted: balanceNum.toFixed(4),
        usdValue: balanceNum * celoPrice,
      }
    }

    const rawBalance = tokenBalances?.[index - 1]?.result as bigint | undefined
    const balanceFormatted = rawBalance ? formatUnits(rawBalance, token.decimals) : "0"
    const balanceNum = Number.parseFloat(balanceFormatted)
    const geckoId = COINGECKO_IDS[token.symbol]
    const price = prices?.[geckoId]?.usd || 0

    return {
      token,
      balance: balanceFormatted,
      balanceFormatted: balanceNum.toFixed(4),
      usdValue: balanceNum * price,
    }
  })

  // Filter tokens with balance > 0
  const tokensWithBalance = balances.filter((b) => Number.parseFloat(b.balance) > 0)

  const totalUsdValue = balances.reduce((acc, b) => acc + b.usdValue, 0)

  return {
    balances,
    tokensWithBalance,
    totalUsdValue,
    isLoading,
  }
}
