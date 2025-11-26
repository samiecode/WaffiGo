"use client"

import { TrendingUp, TrendingDown, Eye, EyeOff, Copy, Check, Wallet } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-waffi-contract"

export function BalanceCard() {
  const [showBalance, setShowBalance] = useState(true)
  const [copied, setCopied] = useState(false)

  const {
    address,
    isConnected,
    balance,
    balanceNum,
    balanceSymbol,
    shortenAddress,
    celoPrice,
    usdBalance,
    isPriceLoading,
    isBalanceLoading,
  } = useWallet()
  const { userData } = useContract()

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const savedAmount = userData ? Number.parseFloat(userData.totalSaved) : 0
  const savedUsd = savedAmount * celoPrice
  const spentAmount = userData ? Number.parseFloat(userData.totalSpent) : 0
  const spentUsd = spentAmount * celoPrice

  const priceChange = 2.4

  if (!isConnected) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary/50 border-border p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Wallet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Connect your wallet to view your balance and start using spend & save features
          </p>
        </div>
      </Card>
    )
  }

  const isLoading = isBalanceLoading || isPriceLoading

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-secondary/50 border-border p-6">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-12 w-48 bg-secondary" />
              ) : (
                <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                  {showBalance
                    ? `$${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "••••••••"}
                </h2>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
                className="text-muted-foreground"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
            </div>
            {isLoading ? (
              <Skeleton className="h-4 w-32 mt-2 bg-secondary" />
            ) : (
              showBalance && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">
                    {balanceNum.toFixed(4)} {balanceSymbol}
                  </p>
                  <span className="text-xs text-muted-foreground/60">@ ${celoPrice.toFixed(2)}/CELO</span>
                </div>
              )
            )}
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${priceChange >= 0 ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}`}
          >
            {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {priceChange >= 0 ? "+" : ""}
              {priceChange}%
            </span>
          </div>
        </div>

        {/* Wallet address */}
        <div className="flex items-center gap-2 mb-6">
          <code className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">{shortenAddress}</code>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
            {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
          </Button>
        </div>

        {/* Chain breakdown */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16 bg-secondary" />
                <Skeleton className="h-6 w-20 bg-secondary" />
                <Skeleton className="h-1.5 w-full bg-secondary" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <ChainBalance
              chain="CELO"
              amount={showBalance ? `$${usdBalance.toFixed(2)}` : "••••"}
              percentage={80}
              color="bg-primary"
            />
            <ChainBalance
              chain="Saved"
              amount={showBalance ? `$${savedUsd.toFixed(2)}` : "••••"}
              percentage={savedAmount > 0 ? 15 : 0}
              color="bg-chart-3"
            />
            <ChainBalance
              chain="Spent"
              amount={showBalance ? `$${spentUsd.toFixed(2)}` : "••••"}
              percentage={spentAmount > 0 ? 5 : 0}
              color="bg-chart-4"
            />
          </div>
        )}
      </div>
    </Card>
  )
}

function ChainBalance({
  chain,
  amount,
  percentage,
  color,
}: {
  chain: string
  amount: string
  percentage: number
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="text-sm text-muted-foreground">{chain}</span>
      </div>
      <p className="text-lg font-semibold text-foreground">{amount}</p>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
