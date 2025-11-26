"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { PiggyBank, Lock, Unlock, TrendingUp, Loader2, Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-waffi-contract"
import type { WalletSettings } from "./wallet-dashboard"

interface SpendSaveWidgetProps {
  settings?: WalletSettings
  expanded?: boolean
}

export function SpendSaveWidget({ settings, expanded = false }: SpendSaveWidgetProps) {
  const [amount, setAmount] = useState("")

  const { isConnected, balanceSymbol } = useWallet()
  const { userData, withdrawSavings, isWritePending, isConfirming, isUserDataLoading } = useContract()

  const currentSavings = userData ? Number.parseFloat(userData.totalSaved) : 0
  const totalSpent = userData ? Number.parseFloat(userData.totalSpent) : 0
  const savingsGoal = 100
  const savingsProgress = Math.min((currentSavings / savingsGoal) * 100, 100)
  const celoPrice = 0.5
  const savedUsd = currentSavings * celoPrice

  const handleWithdraw = async () => {
    try {
      await withdrawSavings()
    } catch (err) {
      console.error("Withdraw failed:", err)
    }
  }

  if (!isConnected) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Connect wallet to view savings</p>
        </CardContent>
      </Card>
    )
  }

  if (!expanded) {
    if (isUserDataLoading) {
      return (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Savings Vault</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 bg-primary/30" />
                <Skeleton className="h-4 w-16 bg-primary/30" />
              </div>
              <Skeleton className="h-8 w-32 bg-primary/30" />
              <Skeleton className="h-4 w-20 bg-primary/30" />
              <Skeleton className="h-2 w-full bg-primary/30" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 bg-primary/30" />
                <Skeleton className="h-4 w-10 bg-primary/30" />
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Savings Vault</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Savings Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <PiggyBank className="w-5 h-5" />
                <span className="font-medium">Total Saved</span>
              </div>
              <span className="text-sm text-primary font-medium">{userData?.savingsRatePercent || 10}% rate</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {currentSavings.toFixed(4)} {balanceSymbol}
            </p>
            <p className="text-sm text-muted-foreground">${savedUsd.toFixed(2)} USD</p>
            <Progress value={savingsProgress} className="h-2 bg-primary/20 [&>div]:bg-primary" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Goal: {savingsGoal} {balanceSymbol}
              </span>
              <span className="text-primary">{savingsProgress.toFixed(0)}%</span>
            </div>
          </div>

          {/* Auto-save status */}
          {settings?.saveEnabled && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Auto-save active</span>
              </div>
              <span className="text-sm font-medium text-primary">{settings.savePercentage}% per send</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isUserDataLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-14 h-14 rounded-full bg-primary/30" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20 bg-primary/30" />
                  <Skeleton className="h-8 w-32 bg-primary/30" />
                  <Skeleton className="h-4 w-24 bg-primary/30" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-4 w-12 bg-primary/30" />
                <Skeleton className="h-8 w-16 bg-primary/30" />
              </div>
            </div>
            <Skeleton className="h-3 w-full bg-primary/30" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20 w-full bg-secondary" />
            <Skeleton className="h-20 w-full bg-secondary" />
          </div>
          <Skeleton className="h-12 w-full bg-secondary" />
        </CardContent>
      </Card>
    )
  }

  // Expanded view for savings page
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 space-y-6">
        {/* Savings vault display */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-3xl font-bold text-foreground">
                  {currentSavings.toFixed(4)} {balanceSymbol}
                </p>
                <p className="text-sm text-muted-foreground">${savedUsd.toFixed(2)} USD</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Rate</p>
              <p className="text-2xl font-bold text-primary">{userData?.savingsRatePercent || 10}%</p>
            </div>
          </div>
          <Progress value={savingsProgress} className="h-3 bg-primary/20 [&>div]:bg-primary" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {(savingsGoal - currentSavings).toFixed(2)} {balanceSymbol} more to reach goal
            </p>
            <div className="flex items-center gap-1 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                Goal: {savingsGoal} {balanceSymbol}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-xl font-bold text-foreground">
              {totalSpent.toFixed(4)} {balanceSymbol}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50">
            <p className="text-sm text-muted-foreground">Save Rate</p>
            <p className="text-xl font-bold text-primary">{userData?.savingsRatePercent || 10}%</p>
          </div>
        </div>

        {/* Auto-save indicator */}
        {settings?.saveEnabled && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-chart-3/10 border border-chart-3/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <p className="font-medium text-foreground">Auto-Save Enabled</p>
                <p className="text-sm text-muted-foreground">
                  {settings.savePercentage}% of every send goes to savings
                </p>
              </div>
            </div>
            <div className="w-3 h-3 rounded-full bg-chart-3 animate-pulse" />
          </div>
        )}

        {/* Withdraw section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="font-medium text-foreground">Withdraw Savings</h3>
          <p className="text-sm text-muted-foreground">Withdraw all your saved {balanceSymbol} back to your wallet</p>
          <Button
            onClick={handleWithdraw}
            disabled={currentSavings <= 0 || isWritePending || isConfirming}
            className="w-full h-12 bg-chart-4 text-primary-foreground hover:bg-chart-4/90"
          >
            {isWritePending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Withdraw {currentSavings.toFixed(4)} {balanceSymbol}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
