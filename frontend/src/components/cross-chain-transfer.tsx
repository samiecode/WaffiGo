"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Loader2, CheckCircle2, PiggyBank, Wallet, AlertCircle } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-waffi-contract"
import type { WalletSettings } from "./wallet-dashboard"

type TransferStatus = "idle" | "reviewing" | "pending" | "success" | "error"

interface CrossChainTransferProps {
  settings: WalletSettings
}

export function CrossChainTransfer({ settings }: CrossChainTransferProps) {
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [status, setStatus] = useState<TransferStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const { isConnected, balance, balanceSymbol } = useWallet()
  const {transfer, isWritePending, isConfirming, isConfirmed, userData} =
		useContract();

  const amountNumber = Number.parseFloat(amount) || 0
  const savePercentage = userData?.savingsRatePercent || settings.savePercentage
  const saveAmount = settings.saveEnabled ? (amountNumber * savePercentage) / 100 : 0
  const totalFromWallet = amountNumber + saveAmount

  const handleTransfer = async () => {
    if (!recipient || !amount) return

    setError(null)
    setStatus("reviewing")

    try {
      await transfer(recipient, amount)
      setStatus("pending")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed")
      setStatus("error")
    }
  }

  // Update status based on transaction state
  if (isConfirming && status === "pending") {
    // Still confirming
  } else if (isConfirmed && status === "pending") {
    setStatus("success")
  }

  if (!isConnected) {
    return (
      <Card className="max-w-xl mx-auto bg-card border-border">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Connect Wallet</h2>
            <p className="text-muted-foreground">Connect your wallet to send tokens with auto-save</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "success") {
    return (
      <Card className="max-w-xl mx-auto bg-card border-border">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Transfer Complete!</h2>
            <p className="text-muted-foreground">Your transfer has been successfully processed.</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Sent</span>
              <span className="text-foreground font-medium">
                {amount} {balanceSymbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">To</span>
              <span className="text-foreground font-medium font-mono text-xs">
                {recipient.slice(0, 10)}...{recipient.slice(-8)}
              </span>
            </div>
            {settings.saveEnabled && saveAmount > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-border">
                <span className="text-chart-3 flex items-center gap-1">
                  <PiggyBank className="w-4 h-4" />
                  Auto-Saved
                </span>
                <span className="text-chart-3 font-medium">
                  +{saveAmount.toFixed(4)} {balanceSymbol}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              setStatus("idle")
              setAmount("")
              setRecipient("")
            }}
            className="w-full bg-primary text-primary-foreground"
          >
            Make Another Transfer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Send</h2>
        <p className="text-muted-foreground">Send tokens on CELO with automatic savings</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-6 space-y-6">
          {/* Amount input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Amount</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {Number.parseFloat(balance).toFixed(4)} {balanceSymbol}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 text-2xl bg-background border-0 text-center font-bold"
              />
              <div className="flex gap-2">
                {["25%", "50%", "75%", "Max"].map((preset) => {
                  const balNum = Number.parseFloat(balance)
                  const presetValue = preset === "Max" ? balNum : (balNum * Number.parseInt(preset)) / 100
                  return (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(presetValue.toFixed(4))}
                      className="flex-1 text-xs"
                    >
                      {preset}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Recipient Address</Label>
            <Input
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-14 bg-secondary border-0 font-mono text-sm"
            />
          </div>

          {/* Auto-save indicator */}
          {settings.saveEnabled && amountNumber > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-chart-3/10 border border-chart-3/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Auto-Save Active</p>
                  <p className="text-sm text-muted-foreground">{savePercentage}% will be saved automatically</p>
                </div>
              </div>
              <span className="text-lg font-bold text-chart-3">
                +{saveAmount.toFixed(4)} {balanceSymbol}
              </span>
            </div>
          )}

          {/* Summary */}
          {amount && (
            <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount to Send</span>
                <span className="text-foreground">
                  {amountNumber.toFixed(4)} {balanceSymbol}
                </span>
              </div>
              {settings.saveEnabled && saveAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-chart-3">Auto-Save ({savePercentage}%)</span>
                  <span className="text-chart-3">
                    +{saveAmount.toFixed(4)} {balanceSymbol}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-foreground font-medium">Total from wallet</span>
                <span className="text-primary font-bold">
                  {totalFromWallet.toFixed(4)} {balanceSymbol}
                </span>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action button */}
          <Button
            onClick={handleTransfer}
            disabled={!amount || !recipient || isWritePending || isConfirming || status === "reviewing"}
            className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {(isWritePending || status === "reviewing") && (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Confirm in wallet...
              </>
            )}
            {isConfirming && (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            )}
            {!isWritePending && !isConfirming && status === "idle" && (
              <>
                Send
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
