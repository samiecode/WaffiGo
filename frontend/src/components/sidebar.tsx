"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowUpRight,
  PiggyBank,
  Settings,
  HelpCircle,
  LogOut,
  History,
  ArrowDownUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TapTypes } from "@/types"

interface SidebarProps {
  activeTab: TapTypes
  setActiveTab: (tab: TapTypes) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transfer", label: "Send", icon: ArrowUpRight },
    { id: "swap", label: "Swap", icon: ArrowDownUp },
    { id: "savings", label: "Savings", icon: PiggyBank },
    { id: "history", label: "History", icon: History },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">WG</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground">WaffiGo</h1>
            <p className="text-xs text-muted-foreground">Web3 Wallet</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as typeof activeTab)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3",
            activeTab === "settings" ? "text-primary" : "text-muted-foreground",
          )}
          onClick={() => setActiveTab("settings")}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
          <HelpCircle className="w-5 h-5" />
          Help
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
          <LogOut className="w-5 h-5" />
          Disconnect
        </Button>
      </div>
    </aside>
  )
}
