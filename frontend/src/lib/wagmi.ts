import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  celoSepolia
} from 'wagmi/chains';

export const config = getDefaultConfig({
	appName: "RainbowKit App",
	projectId: process.env.NEXT_PUBLIC_PROJECT_ID!,
	chains: [
		mainnet,
		polygon,
		optimism,
		arbitrum,
		base,
		...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
			? [sepolia, celoSepolia]
			: []),
	],
	ssr: true,
});
