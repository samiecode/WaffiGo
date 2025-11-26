"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, ArrowDownLeft, PiggyBank, Search, Download, Wallet, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-waffi-contract"

const iconMap = {
  send: ArrowUpRight,
  receive: ArrowDownLeft,
  save: PiggyBank,
}

const colorMap = {
  send: "text-destructive bg-destructive/10",
  receive: "text-primary bg-primary/10",
  save: "text-chart-3 bg-chart-3/10",
}

export function TransactionHistoryPage() {
  const [filter, setFilter] = useState<"all" | "send" | "save">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { isConnected, address, balanceSymbol } = useWallet()
  const { transactions, isTransactionsLoading } = useContract()

  // Transform contract transactions to display format
  const formattedTransactions = transactions.map((tx, index) => {
    const isSender = tx.sender.toLowerCase() === address?.toLowerCase()
    return {
      id: index,
      type: isSender ? "send" : "receive",
      amount: `${isSender ? "-" : "+"}${Number.parseFloat(tx.amountSent).toFixed(4)}`,
      amountUsd: `$${(Number.parseFloat(tx.amountSent) * 0.5).toFixed(2)}`,
      to: tx.recipient,
      from: tx.sender,
      time: tx.timestamp.toLocaleTimeString(),
      date: tx.timestamp.toLocaleDateString(),
      status: "completed",
      saved: tx.amountSaved ? `${Number.parseFloat(tx.amountSaved).toFixed(4)} ${balanceSymbol}` : undefined,
      chain: "CELO",
      savingsRate: tx.savingsRatePercent,
    }
  })

  // Add save transactions for amounts saved
  const allTransactions = formattedTransactions.flatMap((tx) => {
    const items = [tx]
    if (tx.saved && Number.parseFloat(tx.saved) > 0) {
      items.push({
        ...tx,
        id: tx.id + 1000,
        type: "save",
        amount: `+${tx.saved}`,
        amountUsd: `$${(Number.parseFloat(tx.saved.replace(` ${balanceSymbol}`, "")) * 0.5).toFixed(2)}`,
        saved: undefined,
        note: `Auto-saved from send (${tx.savingsRate}%)`,
      })
    }
    return items
  })

  const filteredTransactions = allTransactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        tx.amount.toLowerCase().includes(query) ||
        tx.to?.toLowerCase().includes(query) ||
        tx.from?.toLowerCase().includes(query)
      )
    }
    return true
  })

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
          <p className="text-muted-foreground mt-1">View all your wallet activity</p>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">Connect your wallet to view your transaction history</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transaction History</h2>
          <p className="text-muted-foreground mt-1">View all your wallet activity</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>

            {/* Type filter */}
            <div className="flex gap-2">
              {(["all", "send", "save"] as const).map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className={cn(filter === type && "bg-primary text-primary-foreground")}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            {isTransactionsLoading ? (
              <Skeleton className="h-5 w-32 bg-secondary" />
            ) : (
              `${filteredTransactions.length} Transactions`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isTransactionsLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-full bg-secondary" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-16 bg-secondary" />
                        <Skeleton className="h-4 w-12 bg-secondary" />
                      </div>
                      <Skeleton className="h-3 w-40 bg-secondary" />
                      <Skeleton className="h-3 w-28 bg-secondary" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-4 w-24 bg-secondary" />
                    <Skeleton className="h-3 w-16 bg-secondary" />
                  </div>
                </div>
              ))}
            </>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {transactions.length === 0
                  ? "No transactions yet. Start by sending some CELO!"
                  : "No transactions found"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const Icon = iconMap[tx.type as keyof typeof iconMap]
              const color = colorMap[tx.type as keyof typeof colorMap]

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground capitalize">{tx.type}</p>
                        <Badge variant="outline" className="text-xs">
                          {tx.chain}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {tx.type === "send"
                          ? `To: ${tx.to?.slice(0, 8)}...${tx.to?.slice(-6)}`
                          : tx.type === "save"
                            ? (tx as typeof tx & { note?: string }).note || "Auto-saved"
                            : `From: ${tx.from?.slice(0, 8)}...${tx.from?.slice(-6)}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tx.date} - {tx.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p
                        className={cn(
                          "font-semibold",
                          tx.type === "receive" || tx.type === "save" ? "text-primary" : "text-foreground",
                        )}
                      >
                        {tx.amount} {balanceSymbol}
                      </p>
                      <p className="text-sm text-muted-foreground">{tx.amountUsd}</p>
                      {tx.saved && <p className="text-xs text-chart-3 mt-1">+{tx.saved} saved</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
