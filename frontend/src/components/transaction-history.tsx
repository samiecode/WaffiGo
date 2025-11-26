"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, PiggyBank, Wallet } from "lucide-react"
import { useContract } from "@/hooks/use-waffi-contract"
import { useWallet } from "@/hooks/use-wallet"

interface TransactionHistoryProps {
  onViewAll: () => void
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function TransactionHistory({ onViewAll }: TransactionHistoryProps) {
  const { transactions, isTransactionsLoading, isConnected } = useContract()
  const { address } = useWallet()

  const recentTransactions = transactions.slice(-4).reverse()

  if (isTransactionsLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
            <button className="text-sm text-primary hover:underline" onClick={onViewAll}>
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full bg-secondary" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16 bg-secondary" />
                  <Skeleton className="h-3 w-20 bg-secondary" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-20 bg-secondary ml-auto" />
                <Skeleton className="h-3 w-24 bg-secondary ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Connect wallet to view transactions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
            <button className="text-sm text-primary hover:underline" onClick={onViewAll}>
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ArrowUpRight className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Your spend & save transactions will appear here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
          <button className="text-sm text-primary hover:underline" onClick={onViewAll}>
            View All
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((tx, index) => {
          const isSender = tx.sender.toLowerCase() === address?.toLowerCase()
          const hasSaved = Number.parseFloat(tx.amountSaved) > 0

          return (
            <div
              key={`${tx.timestamp.getTime()}-${index}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSender ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10"
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{isSender ? "Sent" : "Received"}</p>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(tx.timestamp)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${isSender ? "text-foreground" : "text-primary"}`}>
                  {isSender ? "-" : "+"}
                  {Number.parseFloat(tx.amountSent).toFixed(4)} CELO
                </p>
                <p className="text-xs text-muted-foreground">
                  {isSender ? `To: ${truncateAddress(tx.recipient)}` : `From: ${truncateAddress(tx.sender)}`}
                </p>
                {hasSaved && isSender && (
                  <p className="text-xs text-chart-3 flex items-center justify-end gap-1">
                    <PiggyBank className="w-3 h-3" />+{Number.parseFloat(tx.amountSaved).toFixed(4)} saved
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
