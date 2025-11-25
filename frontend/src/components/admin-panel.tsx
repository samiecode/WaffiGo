"use client"

import { useState, useEffect } from "react"
import { Shield, Wallet, Settings, AlertTriangle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/hooks/use-wallet"
import { useContract } from "@/hooks/use-contract"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AdminPanel() {
  const { address } = useWallet()
  const { getContractBalance, setDefaultSavingsRate, getOwner } = useContract()
  const [isLoading, setIsLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [contractBalance, setContractBalance] = useState("0")
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [defaultRate, setDefaultRate] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (address) {
      loadAdminData()
    }
  }, [address])

  const loadAdminData = async () => {
    if (!address) return
    setIsLoading(true)

    const owner = await getOwner()
    setOwnerAddress(owner)
    setIsOwner(owner?.toLowerCase() === address.toLowerCase())

    const balance = await getContractBalance()
    setContractBalance(balance)

    setIsLoading(false)
  }

  const handleSaveDefaultRate = async () => {
    setIsSaving(true)
    const rateBps = Math.round(defaultRate * 100)
    const success = await setDefaultSavingsRate(rateBps)
    if (success) {
      await loadAdminData()
    }
    setIsSaving(false)
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Contract administration and monitoring</p>
        </div>
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Contract administration and monitoring</p>
        </div>

        <Card className="shadow-lg border-destructive/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-6 mb-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              You do not have permission to access the admin panel. Only the contract owner can view this page.
            </p>
            {ownerAddress && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Contract Owner</div>
                <div className="font-mono text-sm font-medium">{formatAddress(ownerAddress)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-destructive/10 p-3">
          <Shield className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Contract administration and monitoring</p>
        </div>
      </div>

      <Alert className="border-destructive/50 bg-destructive/5">
        <Shield className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive">Admin Access Granted</AlertTitle>
        <AlertDescription>You have full administrative access to the SpendAndSave contract</AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Contract Balance
            </CardTitle>
            <CardDescription>Total CELO held in the contract</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">Total Balance</div>
                <div className="text-4xl font-bold text-primary">
                  {Number.parseFloat(contractBalance).toFixed(4)}
                  <span className="text-lg font-normal text-muted-foreground ml-2">CELO</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Contract</div>
                  <div className="text-sm font-mono font-medium break-all">
                    {ownerAddress ? formatAddress(ownerAddress) : "—"}
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Network</div>
                  <div className="text-sm font-medium">Celo</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Settings className="h-5 w-5" />
              Default Savings Rate
            </CardTitle>
            <CardDescription>Set the default savings rate for new users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will affect all new users. Existing users retain their custom rates.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="default-rate">Default Rate</Label>
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
                  id="default-rate"
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
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>Key details about the SpendAndSave smart contract</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm text-muted-foreground">Contract Owner</div>
              <div className="font-mono text-sm font-medium break-all">{ownerAddress || "—"}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm text-muted-foreground">Your Address</div>
              <div className="font-mono text-sm font-medium break-all">{address}</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm text-muted-foreground">Total Locked</div>
              <div className="text-lg font-bold text-primary">{Number.parseFloat(contractBalance).toFixed(4)} CELO</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
