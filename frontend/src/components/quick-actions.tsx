"use client"

import { ArrowUpRight, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface QuickActionsProps {
  setActiveTab: (tab: "dashboard" | "transfer" | "savings" | "settings" | "history") => void
}

export function QuickActions({ setActiveTab }: QuickActionsProps) {
  const actions = [
    {
      label: "Send",
      icon: ArrowUpRight,
      onClick: () => setActiveTab("transfer"),
      primary: true,
    },
    {
      label: "Scan",
      icon: QrCode,
      onClick: () => {},
      primary: false,
    },
  ]

  return (
    <Card className="bg-card border-border p-4">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.primary ? "default" : "secondary"}
            onClick={action.onClick}
            className={`flex flex-col items-center gap-2 h-auto py-4 ${
              action.primary
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  )
}
