import { http, createConfig } from "wagmi"
import { celo, celoSepolia } from "wagmi/chains"
import { injected, walletConnect } from "wagmi/connectors"

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo"

export const config = createConfig({
	chains: [celo, celoSepolia],
	connectors: [
		injected(),
		walletConnect({
			projectId,
			metadata: {
				name: "WaffiGo",
				description:
					"Spend & save on CELO with WaffiGo - the ultimate dApp for effortless payments and automatic savings.",
				url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
				icons: [
					`${process.env.NEXT_PUBLIC_APP_ICON_URL}/icon.png` ||
						"http://localhost:3000/icon.png",
				],
			},
		}),
	],
	transports: {
		[celo.id]: http(),
		[celoSepolia.id]: http(),
	},
	ssr: true,
});
