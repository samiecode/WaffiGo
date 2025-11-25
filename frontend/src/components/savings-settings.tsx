"use client"

import { useState, useEffect } from "react"
import { Settings, TrendingUp, Loader2, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"
import type { UserData } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SavingsSettings() {
  const { address } = useWallet()
  const { getUserData, setSavingsRate, setDefaultSavingsRate, getOwner } = useContract()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [ownerLoading, setOwnerLoading] = useState(true)

  const [personalRate, setPersonalRate] = useState(0)
  const [defaultRate, setDefaultRate] = useState(0)

  useEffect(() => {
    if (address) {
      loadData()
    }
  }, [address])

  const loadData = async () => {
    if (!address) return
    setIsLoading(true)
    setOwnerLoading(true)

    const data = await getUserData(address)
    setUserData(data)
    if (data) {
      const rateBps = Number(data.savingsRateBps)
      setPersonalRate(rateBps / 100)
    }
    setIsLoading(false)

    const owner = await getOwner()
    setIsOwner(owner?.toLowerCase() === address.toLowerCase())
    setOwnerLoading(false)
  }

  const handleSavePersonalRate = async () => {
    setIsSaving(true)
    const rateBps = Math.round(personalRate * 100)
    const success = await setSavingsRate(rateBps)
    if (success) {
      await loadData()
    }
    setIsSaving(false)
  }

  const handleSaveDefaultRate = async () => {
    setIsSaving(true)
    const rateBps = Math.round(defaultRate * 100)
    const success = await setDefaultSavingsRate(rateBps)
    if (success) {
      await loadData()
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-balance">Savings Settings</h1>
        <p className="text-muted-foreground mt-2">Customize your automatic savings percentage</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Personal Savings Rate
            </CardTitle>
            <CardDescription>Set the percentage of each payment that will be automatically saved</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personal-rate-input">Savings Rate</Label>
                    <div className="text-3xl font-bold text-primary">{personalRate.toFixed(2)}%</div>
                  </div>

                  <Slider
                    value={[personalRate]}
                    onValueChange={(value) => setPersonalRate(value[0])}
                    max={100}
                    step={0.1}
                    className="py-4"
                  />

                  <div className="flex gap-2">
                    <Input
                      id="personal-rate-input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={personalRate}
                      onChange={(e) =>
                        setPersonalRate(Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)))
                      }
                      className="flex-1"
                    />
                    <span className="flex items-center px-3 text-muted-foreground">%</span>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Current rate:{" "}
                    <strong>{userData ? (Number(userData.savingsRateBps) / 100).toFixed(2) : "0.00"}%</strong>
                  </AlertDescription>
                </Alert>

                <Button onClick={handleSavePersonalRate} disabled={isSaving} size="lg" className="w-full gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      Update Savings Rate
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-card to-accent/5">
            <CardHeader>
              <CardTitle className="text-base">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                When you send a payment, a percentage is automatically saved to your savings balance. This helps you
                build savings effortlessly with every transaction.
              </p>
              <div className="pt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Higher rates mean more savings per transaction
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Savings can be withdrawn anytime from the dashboard
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Rate changes apply to future transactions only
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Example Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Amount</span>
                  <span className="font-semibold">10.00 CELO</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Savings Rate</span>
                  <span className="font-semibold text-primary">{personalRate.toFixed(2)}%</span>
                </div>
                <div className="pt-2 border-t flex justify-between">
                  <span className="font-medium">Amount Saved</span>
                  <span className="text-lg font-bold text-accent">{((10 * personalRate) / 100).toFixed(4)} CELO</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!ownerLoading && isOwner && (
        <Card className="shadow-lg border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Settings className="h-5 w-5" />
              Admin: Default Savings Rate
            </CardTitle>
            <CardDescription>Set the default savings rate for new users (owner only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertDescription>
                This setting will affect the default rate for all new users. Use with caution.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-rate-input">Default Rate</Label>
                <div className="text-3xl font-bold text-destructive">{defaultRate.toFixed(2)}%</div>
              </div>

              <Slider
                value={[defaultRate]}
                onValueChange={(value) => setDefaultRate(value[0])}
                max={100}
                step={0.1}
                className="py-4"
              />

              <div className="flex gap-2">
                <Input
                  id="default-rate-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(Math.min(100, Math.max(0, Number.parseFloat(e.target.value) || 0)))}
                  className="flex-1"
                />
                <span className="flex items-center px-3 text-muted-foreground">%</span>
              </div>
            </div>

            <Button
              onClick={handleSaveDefaultRate}
              disabled={isSaving}
              variant="destructive"
              size="lg"
              className="w-full gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4" />
                  Update Default Rate
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
