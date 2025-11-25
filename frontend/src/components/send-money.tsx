"use client"

import { useState, useEffect } from "react"
import { Send, Calculator, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"
import type { UserData } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export function SendMoney() {
  const { address, balance } = useWallet()
  const { getUserData, sendPayment } = useContract()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    if (address) {
      loadUserData()
    }
  }, [address])

  const loadUserData = async () => {
    if (!address) return
    setIsLoading(true)
    const data = await getUserData(address)
    setUserData(data)
    setIsLoading(false)
  }

  const savingsRatePercent = userData ? Number(userData.savingsRateBps) / 100 : 0
  const amountToSave = amount ? (Number.parseFloat(amount) * savingsRatePercent) / 100 : 0
  const totalCost = amount ? Number.parseFloat(amount) + amountToSave : 0

  const handleSend = async () => {
    if (!recipient || !amount) return

    setIsSending(true)
    const success = await sendPayment(recipient, String(totalCost));
    if (success) {
      setRecipient("")
      setAmount("")
      await loadUserData()
    }
    setIsSending(false)
  }

  const isValidAddress = recipient.length === 0 || /^0x[a-fA-F0-9]{40}$/.test(recipient)
  const hasEnoughBalance = amount ? Number.parseFloat(balance) >= totalCost : true

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">Send Money</h1>
        <p className="text-muted-foreground mt-2">Send CELO and automatically save a percentage</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Enter the recipient address and amount to send</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className={!isValidAddress ? "border-destructive" : ""}
                />
                {!isValidAddress && <p className="text-sm text-destructive">Please enter a valid Ethereum address</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (CELO)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={!hasEnoughBalance ? "border-destructive" : ""}
                />
                {!hasEnoughBalance && (
                  <p className="text-sm text-destructive">
                    Insufficient balance. You have {Number.parseFloat(balance).toFixed(4)} CELO
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Available: {Number.parseFloat(balance).toFixed(4)} CELO</p>
              </div>

              <Button
                onClick={handleSend}
                disabled={
                  isSending ||
                  !recipient ||
                  !amount ||
                  !isValidAddress ||
                  !hasEnoughBalance ||
                  Number.parseFloat(amount) <= 0
                }
                size="lg"
                className="w-full gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Payment...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Transaction Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount to Send</span>
                  <span className="font-semibold">{totalCost.toFixed(4)} CELO</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount to Save</span>
                  <span className="font-semibold text-accent">{amountToSave.toFixed(4)} CELO</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Cost</span>
                    <span className="text-xl font-bold">{totalCost.toFixed(4)} CELO</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <CardTitle className="text-base">Your Savings Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold text-accent">{savingsRatePercent.toFixed(2)}%</div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                This percentage of each payment is automatically saved
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
