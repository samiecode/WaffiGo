"use client";

import {useWallet} from "@/hooks/use-wallet";
import {WalletConnect} from "@/components/wallet-connect";
import {TransactionHistory} from "@/components/transaction-history";
import {AppLayout} from "@/components/app-layout";
import {CELO_MAINNET, CELO_SEPOLIA} from "@/lib/contract";

export default function TransactionsPage() {
	const {isConnected, chainId} = useWallet();

	const isCeloNetwork =
		chainId === CELO_MAINNET.chainId || chainId === CELO_SEPOLIA.chainId;

	if (!isConnected || !isCeloNetwork) {
		return <WalletConnect />;
	}

	return (
		<AppLayout>
			<TransactionHistory />
		</AppLayout>
	);
}
