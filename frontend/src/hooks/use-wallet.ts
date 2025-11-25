"use client";

import {useAccount, useBalance, useDisconnect, useSwitchChain} from "wagmi";
import type {celo, celoSepolia} from "wagmi/chains";
import { formatEther } from "viem";
import { toast } from "sonner";

export function useWallet() {
	const {address, isConnected, chainId} = useAccount();
	const {data: balanceData} = useBalance({address});
	const {disconnect} = useDisconnect();
	const {switchChain} = useSwitchChain();

	const disconnectWallet = () => {
		disconnect();
		toast.warning("Wallet disconnected", {
			description: "Your wallet has been disconnected",
		});
	};

	const switchToNetwork = (network: typeof celo | typeof celoSepolia) => {
		switchChain(
			{chainId: network.id},
			{
				onSuccess: () => {
					toast("Network switched", {
						description: `Switched to ${network.name}`,
					});
				},
				onError: (error) => {
					toast.error("Network error", {
						description:
							error.message || "Failed to switch network",
					});
				},
			}
		);
	};

	return {
		address: address || null,
		balance: balanceData ? formatEther(balanceData.value) : "0",
		isConnected,
		chainId: chainId || null,
		isLoading: false,
		disconnectWallet,
		switchToNetwork,
	};
}
