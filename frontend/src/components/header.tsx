"use client"

import { Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ConnectWalletButton } from "@/components/connect-wallet-button"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between p-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo for mobile */}
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CV</span>
          </div>
        </div>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Search */}
        <div className="hidden md:flex relative max-w-md flex-1">
          <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assets, transactions..." className="pl-10 bg-secondary border-0" />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Network indicator */}
          <Badge variant="outline" className="hidden sm:flex gap-2 px-3 py-1.5 border-primary/30 bg-primary/10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary text-xs font-medium">CELO</span>
          </Badge>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          </Button>

          {/* Profile */}
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  )
}
