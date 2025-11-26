"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { PiggyBank, Bell, Shield, Palette, Info, Loader2, CheckCircle2 } from "lucide-react"
import { useContract } from "@/hooks/use-waffi-contract"
import { useWallet } from "@/hooks/use-wallet"
import type { WalletSettings } from "./wallet-dashboard"
import { toast } from "sonner"

interface SettingsPageProps {
  settings: WalletSettings
  setSettings: (settings: WalletSettings) => void
}

export function SettingsPage({ settings, setSettings }: SettingsPageProps) {
  const [notifications, setNotifications] = useState(true)
  const [biometrics, setBiometrics] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const { isConnected } = useWallet()
  const { setSavingsRate, setSavingsEnabled, userData, isWritePending, isConfirming } = useContract()

  const handleSaveRate = async () => {
    if (!isConnected) return

    setIsSaving(true)
    try {
      // Convert percentage to basis points (1% = 100 bps)
      await setSavingsRate(settings.savePercentage * 100)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Failed to save rate:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const contractRate = userData?.savingsRatePercent || 10
  const hasUnsavedChanges = settings.savePercentage !== contractRate

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your wallet preferences</p>
      </div>

      {/* Auto-Save Settings */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Auto-Save on Send</CardTitle>
              <CardDescription>Automatically save a percentage when you send money</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="save-enabled" className="text-base font-medium">
                Enable Auto-Save
              </Label>
              <p className="text-sm text-muted-foreground">A percentage of every send will be saved automatically</p>
            </div>
            <Switch
              id="save-enabled"
              checked={settings.saveEnabled}
              disabled={isWritePending || isConfirming}
              onCheckedChange={async (checked) => {
                if (isConnected) {
                  try {
                    await setSavingsEnabled(checked)
                    setSettings({ ...settings, saveEnabled: checked })
                  } catch (err) {
                    toast.error("Failed to update savings enabled")
                  }
                }
              }}
            />
          </div>

          {/* Percentage Slider */}
          {settings.saveEnabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Save Percentage</Label>
                <span className="text-2xl font-bold text-primary">{settings.savePercentage}%</span>
              </div>
              <Slider
                value={[settings.savePercentage]}
                onValueChange={(value) => setSettings({ ...settings, savePercentage: value[0] })}
                min={1}
                max={50}
                step={1}
                className="[&>span:first-child]:bg-secondary [&>span:first-child>span]:bg-primary [&>span:last-child]:bg-primary [&>span:last-child]:border-primary"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1%</span>
                <span>50%</span>
              </div>

              {/* Current on-chain rate */}
              {isConnected && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Current on-chain rate:</span>
                  <span className="text-sm font-medium text-foreground">{contractRate}%</span>
                </div>
              )}

              {/* Save button */}
              {isConnected && hasUnsavedChanges && (
                <Button
                  onClick={handleSaveRate}
                  disabled={isWritePending || isConfirming || isSaving}
                  className="w-full bg-primary text-primary-foreground"
                >
                  {isWritePending || isConfirming || isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving to blockchain...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    "Save Rate to Blockchain"
                  )}
                </Button>
              )}

              {/* Example calculation */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">How it works</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      When you send <span className="text-foreground font-medium">100 CELO</span>,
                      <span className="text-primary font-medium"> {settings.savePercentage} CELO</span> will be
                      automatically saved to your vault via the smart contract.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-chart-3" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base font-medium">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">Receive alerts for transactions and savings</p>
            </div>
            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-chart-4/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-chart-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Protect your wallet</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="biometrics" className="text-base font-medium">
                Biometric Authentication
              </Label>
              <p className="text-sm text-muted-foreground">Use Face ID or fingerprint to unlock</p>
            </div>
            <Switch id="biometrics" checked={biometrics} onCheckedChange={setBiometrics} />
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Palette className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 border-2 border-primary">
              Dark
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Light
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              System
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
