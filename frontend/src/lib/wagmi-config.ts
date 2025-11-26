import { http, createConfig } from "wagmi"
import { celo, celoSepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"
import { defineChain } from "viem"

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo"

export const config = createConfig({
  chains: [celo, celoSepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "Waffi",
        description: "Cross-chain transfers, spend & save on CELO",
        url: "https://celovault.app",
        icons: ["https://celovault.app/icon.png"],
      },
    }),
  ],
  transports: {
    [celo.id]: http(),
    [celoSepolia.id]: http(),
  },
  ssr: true,
})
