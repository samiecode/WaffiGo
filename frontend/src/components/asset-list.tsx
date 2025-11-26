"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import Image from "next/image"

export function AssetList() {
  const { isConnected, balanceNum, balanceSymbol, usdBalance, isBalanceLoading, celoPrice } = useWallet()

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-foreground">Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Wallet className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Connect wallet to view assets</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isBalanceLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Assets</CardTitle>
            <Skeleton className="h-5 w-16 bg-secondary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-secondary" />
                  <Skeleton className="h-3 w-12 bg-secondary" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-20 bg-secondary" />
                <Skeleton className="h-3 w-16 bg-secondary" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const assets = [
    {
      symbol: balanceSymbol,
      name: "Celo",
      balance: balanceNum.toFixed(4),
      value: `$${usdBalance.toFixed(2)}`,
      price: celoPrice,
      change: 2.4,
      icon: "/celo-blockchain-logo-yellow-green.jpg",
    },
  ]

  const nonZeroAssets = assets.filter((asset) => Number.parseFloat(asset.balance) > 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Assets</CardTitle>
          <Badge variant="outline" className="text-muted-foreground">
            {nonZeroAssets.length} token{nonZeroAssets.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {nonZeroAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground text-sm">No assets found</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Your wallet balance is zero</p>
          </div>
        ) : (
          nonZeroAssets.map((asset) => (
            <div
              key={asset.symbol}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  <Image
                    src={asset.icon || "/placeholder.svg"}
                    alt={asset.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">{asset.symbol}</p>
                  <p className="text-sm text-muted-foreground">{asset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">{asset.value}</p>
                <div className="flex items-center justify-end gap-1">
                  <span className="text-sm text-muted-foreground">{asset.balance}</span>
                  <span
                    className={`flex items-center text-xs font-medium ${
                      asset.change >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {asset.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    )}
                    {Math.abs(asset.change)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
