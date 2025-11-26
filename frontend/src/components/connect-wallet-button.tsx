"use client"

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, Check } from "lucide-react"
import { useState } from "react"
import { celo,celoSepolia } from "wagmi/chains"

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const currentChain = chainId === celo.id ? celo : celoSepolia

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-primary/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full justify-start gap-3 h-14 bg-secondary/50 border-border hover:bg-primary/10 hover:border-primary/30"
                onClick={() => {
                  connect({ connector })
                  setOpen(false)
                }}
                disabled={isPending}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground font-medium">{connector.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Chain Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent border-primary/30 hover:bg-primary/10">
            <div className="w-4 h-4 rounded-full bg-primary/30 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">C</span>
            </div>
            <span className="hidden sm:inline text-primary text-xs">{currentChain.name}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border">
          <DropdownMenuItem
            onClick={() => switchChain?.({ chainId: celo.id })}
            className={chainId === celo.id ? "bg-primary/10" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-primary/30 mr-2" />
            Celo Mainnet
            {chainId === celo.id && <Check className="w-4 h-4 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => switchChain?.({ chainId: celoSepolia.id })}
            className={chainId === celoSepolia.id ? "bg-primary/10" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-yellow-500/30 mr-2" />
            Celo Sepolia
            {chainId === celoSepolia.id && <Check className="w-4 h-4 ml-auto text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent border-border hover:bg-secondary">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs text-primary font-bold">{address?.charAt(2).toUpperCase()}</span>
            </div>
            <span className="font-mono text-sm text-foreground">{formatAddress(address!)}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border w-56">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">Connected Wallet</p>
            <p className="font-mono text-sm text-foreground truncate">{address}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyAddress}>
            {copied ? <Check className="w-4 h-4 mr-2 text-primary" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={`https://celoscan.io/address/${address}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()} className="text-destructive focus:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
