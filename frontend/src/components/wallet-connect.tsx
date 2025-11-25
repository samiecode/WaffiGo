"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Card } from "@/components/ui/card"
import { useAccount, useBalance } from "wagmi"
import { celo, celoSepolia } from "wagmi/chains"
import { Button } from "@/components/ui/button"
import { useSwitchChain } from "wagmi"
import { Wallet } from "lucide-react"

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const { switchChain } = useSwitchChain()

  const isCeloNetwork = chainId === celo.id || chainId === celoSepolia.id

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Wallet className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">SpendAndSave</h1>
            <p className="text-muted-foreground">
              Connect your wallet to start sending payments and saving automatically on Celo
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="flex justify-center">
            <ConnectButton />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Connected Address</div>
              <div className="font-mono text-sm bg-muted p-3 rounded-lg break-all">{address}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Balance</div>
              <div className="text-2xl font-bold">
                {balanceData ? Number.parseFloat(balanceData.formatted).toFixed(4) : "0.0000"} CELO
              </div>
            </div>

            {!isCeloNetwork && (
              <div className="space-y-3 pt-2">
                <div className="text-sm text-destructive font-medium">Please switch to a Celo network</div>
                <div className="flex gap-2">
                  <Button onClick={() => switchChain({ chainId: celo.id })} variant="outline" className="flex-1">
                    Mainnet
                  </Button>
                  <Button
                    onClick={() => switchChain({ chainId: celoSepolia.id })}
                    variant="outline"
                    className="flex-1"
                  >
                    Celo Sepolia
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
