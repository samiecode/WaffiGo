"use client"

import { useState, useEffect } from "react"
import { History, ArrowUpRight, ArrowDownLeft, Calendar, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"
import type { Transaction } from "@/types"
import { formatEther } from "viem"
import { Skeleton } from "@/components/ui/skeleton"

const ITEMS_PER_PAGE = 10

export function TransactionHistory() {
  const { address } = useWallet()
  const { getUserTransactions } = useContract()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (address) {
      loadTransactions()
    }
  }, [address])
  

  const loadTransactions = async () => {
    if (!address) return
    setIsLoading(true)
    const txs = await getUserTransactions(address)
    setTransactions(txs.reverse()) // Most recent first
    setIsLoading(false)
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTransactions = transactions.slice(startIndex, endIndex)

  const isSender = (tx: Transaction) => tx.sender.toLowerCase() === address?.toLowerCase()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Transaction History</h1>
          <p className="text-muted-foreground mt-2">View all your past payments and savings</p>
        </div>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {transactions.length} {transactions.length === 1 ? "transaction" : "transactions"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <History className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground max-w-md">
              Your transaction history will appear here once you start sending payments
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {currentTransactions.map((tx, index) => {
              const isSent = isSender(tx)
              const savingsPercent = Number(tx.savingsRateBps) / 100

              return (
                <Card key={startIndex + index} className="shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-3 ${isSent ? "bg-destructive/10" : "bg-primary/10"}`}>
                        {isSent ? (
                          <ArrowUpRight className={`h-6 w-6 ${isSent ? "text-destructive" : "text-primary"}`} />
                        ) : (
                          <ArrowDownLeft className={`h-6 w-6 text-primary`} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{isSent ? "Sent to" : "Received from"}</h3>
                              <Badge variant={isSent ? "destructive" : "default"} className="text-xs">
                                {isSent ? "Sent" : "Received"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {formatAddress(isSent ? tx.recipient : tx.sender)}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className={`text-xl font-bold ${isSent ? "text-destructive" : "text-primary"}`}>
                              {isSent ? "-" : "+"}
                              {Number.parseFloat(formatEther(tx.amountSent)).toFixed(4)} CELO
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Date
                            </div>
                            <div className="text-sm font-medium">{formatDate(tx.timestamp)}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <TrendingUp className="h-3 w-3" />
                              Savings Rate
                            </div>
                            <div className="text-sm font-medium text-primary">{savingsPercent.toFixed(2)}%</div>
                          </div>

                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Amount Saved</div>
                            <div className="text-sm font-medium text-accent">
                              {Number.parseFloat(formatEther(tx.amountSaved)).toFixed(4)} CELO
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border bg-card hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
