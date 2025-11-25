"use client"

import { useWallet } from "@/hooks/use-wallet"
import { WalletConnect } from "@/components/wallet-connect"
import { SendMoney } from "@/components/send-money"
import { AppLayout } from "@/components/app-layout"
import { CELO_MAINNET, CELO_ALFAJORES } from "@/lib/contract-config"

export default function SendPage() {
  const { isConnected, chainId } = useWallet()

  const isCeloNetwork = chainId === CELO_MAINNET.chainId || chainId === CELO_ALFAJORES.chainId

  if (!isConnected || !isCeloNetwork) {
    return <WalletConnect />
  }

  return (
    <AppLayout>
      <SendMoney />
    </AppLayout>
  )
}
