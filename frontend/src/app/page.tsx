"use client";

import {Dashboard} from "@/components/pages/dashboard";
import {useWallet} from "@/hooks/use-wallet";
import {CELO_MAINNET, CELO_SEPOLIA} from "@/lib/contract";
import {WalletConnect} from "@/components/wallet-connect";
import {AppLayout} from "@/components/app-layout";
import { WalletDashboard } from "@/components/wallet-dashboard"

export default function Home() {
	// const {isConnected, chainId} = useWallet();

	// const isCeloNetwork =
	// 	chainId === CELO_MAINNET.chainId || chainId === CELO_SEPOLIA.chainId;

	// if (!isConnected || !isCeloNetwork) {
	// 	return <WalletConnect />;
	// }
	// return (
	// 	<AppLayout>
	// 		<Dashboard />
	// 	</AppLayout>
	// );
	return <WalletDashboard />;
}
