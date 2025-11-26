"use client"

import { useAccount, useBalance, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import {celo, celoSepolia} from "wagmi/chains";
import { formatEther } from "viem"
import { useQuery } from "@tanstack/react-query";

const priceFetcher = async () => {
  const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd")
  const data = await res.json()
  return data.celo?.usd || 0
}

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount()
  const chainId = useChainId()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  const {
	data: balance,
	isLoading: isBalanceLoading,
	refetch: refetchBalance,
  } = useBalance({
	address,
  })

  const {data: celoPrice = 0, isLoading: isPriceLoading} = useQuery({
	queryKey: ['celo-price'],
	queryFn: priceFetcher,
	refetchInterval: 60000, // Refresh every minute
	staleTime: 30000,
  })

  const formattedBalance = balance ? formatEther(balance.value) : "0"
  const balanceNum = Number.parseFloat(formattedBalance)
  const balanceSymbol = balance?.symbol || "CELO"

  const usdBalance = balanceNum * celoPrice

  const isOnCelo = chainId === celo.id || chainId === celoSepolia.id
  const currentChain = chainId === celo.id ? "CELO Mainnet" : chainId === celoSepolia.id ? "CELO Sepolia" : "Unknown"

  const switchToCelo = () => {
	switchChain({ chainId: celo.id })
  }

  const switchToSepolia = () => {
	switchChain({ chainId: celoSepolia.id })
  }

  const shortenAddress = (addr: string) => {
	if (!addr) return ""
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
	address,
	isConnected,
	isConnecting,
	connector,
	disconnect,
	balance: formattedBalance,
	balanceNum,
	balanceSymbol,
	isBalanceLoading,
	refetchBalance,
	celoPrice,
	usdBalance,
	isPriceLoading,
	chainId,
	isOnCelo,
	currentChain,
	switchToCelo,
	switchToSepolia,
	shortenAddress: address ? shortenAddress(address) : "",
  }
}
