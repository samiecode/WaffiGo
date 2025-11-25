"use client";

import {useCallback} from "react";
import {formatEther, parseEther, type Address} from "viem";
import {usePublicClient, useWalletClient} from "wagmi";
import {SPEND_AND_SAVE_ABI, CONTRACT_ADDRESS} from "@/lib/contract";
import type {UserData, Transaction} from "@/types";
import {toast} from "sonner";

export function useContract() {
	const publicClient = usePublicClient();
	const {data: walletClient} = useWalletClient();

	const getUserData = useCallback(
		async (address: string): Promise<UserData | null> => {
			if (!publicClient) return null;
			try {
				const data = (await publicClient.readContract({
					address: CONTRACT_ADDRESS as Address,
					abi: SPEND_AND_SAVE_ABI,
					functionName: "getUserData",
					args: [address as Address],
				})) as [bigint, bigint, bigint];

				return {
					totalSpent: data[0],
					totalSaved: data[1],
					savingsRateBps: data[2],
				};
			} catch (error) {
				console.error("Error fetching user data:", error);
				return null;
			}
		},
		[publicClient]
	);

	const getUserTransactions = useCallback(
		async (address: string): Promise<Transaction[]> => {
			if (!publicClient) return [];
			try {
				const transactions = (await publicClient.readContract({
					address: CONTRACT_ADDRESS as Address,
					abi: SPEND_AND_SAVE_ABI,
					functionName: "getUserTransactions",
					args: [address as Address],
				})) as Array<{
					sender: Address;
					recipient: Address;
					amountSent: bigint;
					amountSaved: bigint;
					savingsRateBps: bigint;
					timestamp: bigint;
				}>;

				return transactions.map((tx) => ({
					sender: tx.sender,
					recipient: tx.recipient,
					amountSent: tx.amountSent,
					amountSaved: tx.amountSaved,
					savingsRateBps: tx.savingsRateBps,
					timestamp: tx.timestamp,
				}));
			} catch (error) {
				console.error("Error fetching transactions:", error);
				return [];
			}
		},
		[publicClient]
	);

	const sendPayment = useCallback(
		async (recipient: string, amount: string) => {
			if (!walletClient || !publicClient) {
				toast.error("Wallet not connected", {
					description: "Please connect your wallet",
				});
				return false;
			}

			try {
				const amountWei = parseEther(amount);
				const hash = await walletClient.writeContract({
					address: CONTRACT_ADDRESS as Address,
					abi: SPEND_AND_SAVE_ABI,
					functionName: "transfer",
					args: [recipient as Address, amountWei],
					value: amountWei,
				});

				toast("Transaction submitted", {
					description: "Waiting for confirmation...",
				});

				await publicClient.waitForTransactionReceipt({hash});

				toast.success("Payment sent!", {
					description: `Successfully sent ${amount} CELO`,
				});

				return true;
			} catch (error: any) {
				console.error("Error sending payment:", error);
				toast.error("Transaction failed", {
					description: error.message || "Failed to send payment",
				});
				return false;
			}
		},
		[walletClient, publicClient, toast]
	);

	const setSavingsRate = useCallback(
		async (rateBps: number) => {
			if (!walletClient || !publicClient) {
				toast.error("Wallet not connected", {
					description: "Please connect your wallet",
				});
				return false;
			}

			try {
				const hash = await walletClient.writeContract({
					address: CONTRACT_ADDRESS as Address,
					abi: SPEND_AND_SAVE_ABI,
					functionName: "setSavingsRate",
					args: [BigInt(rateBps)],
				});

				toast("Transaction submitted", {
					description: "Updating savings rate...",
				});

				await publicClient.waitForTransactionReceipt({hash});

				toast.success("Savings rate updated",{
					
					description: `New rate: ${(rateBps / 100).toFixed(2)}%`,
				});

				return true;
			} catch (error: any) {
				console.error("Error setting savings rate:", error);
				toast.error("Transaction failed",{
					
					description:
						error.message || "Failed to update savings rate",
					
				});
				return false;
			}
		},
		[walletClient, publicClient, toast]
	);

	const setDefaultSavingsRate = useCallback(
		async (rateBps: number) => {
			if (!walletClient || !publicClient) {
				toast.error("Wallet not connected",{
					
					description: "Please connect your wallet",
					
				});
				return false;
			}

			try {
				const hash = await walletClient.writeContract({
					address: CONTRACT_ADDRESS as Address,
					abi: SPEND_AND_SAVE_ABI,
					functionName: "setDefaultSavingsRate",
					args: [BigInt(rateBps)],
				});

				toast("Transaction submitted",{
					
					description: "Updating default savings rate...",
				});

				await publicClient.waitForTransactionReceipt({hash});

				toast.success("Default rate updated",{
					description: `New default rate: ${(rateBps / 100).toFixed(
						2
					)}%`,
				});

				return true;
			} catch (error: any) {
				console.error("Error setting default savings rate:", error);
				toast.error("Transaction failed", {
					description:
						error.message || "Only owner can perform this action",
					
				});
				return false;
			}
		},
		[walletClient, publicClient, toast]
	);

	const withdrawSavings = useCallback(async () => {
		if (!walletClient || !publicClient) {
			toast.error("Wallet not connected",{
				
				description: "Please connect your wallet",
				
			});
			return false;
		}

		try {
			const hash = await walletClient.writeContract({
				address: CONTRACT_ADDRESS as Address,
				abi: SPEND_AND_SAVE_ABI,
				functionName: "withdrawSavings",
			});

			toast("Transaction submitted",{
				
				description: "Withdrawing savings...",
			});

			await publicClient.waitForTransactionReceipt({hash});

			toast.success("Withdrawal complete",{
				
				description: "Your savings have been withdrawn",
			});

			return true;
		} catch (error: any) {
			console.error("Error withdrawing savings:", error);
			toast.error("Transaction failed", {
				description: error.message || "Failed to withdraw savings",
			});
			return false;
		}
	}, [walletClient, publicClient, toast]);

	const getContractBalance = useCallback(async (): Promise<string> => {
		if (!publicClient) return "0";
		try {
			const balance = (await publicClient.readContract({
				address: CONTRACT_ADDRESS as Address,
				abi: SPEND_AND_SAVE_ABI,
				functionName: "getContractBalance",
			})) as bigint;
			return formatEther(balance);
		} catch (error) {
			console.error("Error fetching contract balance:", error);
			return "0";
		}
	}, [publicClient]);

	const getOwner = useCallback(async (): Promise<string | null> => {
		if (!publicClient) return null;
		try {
			return (await publicClient.readContract({
				address: CONTRACT_ADDRESS as Address,
				abi: SPEND_AND_SAVE_ABI,
				functionName: "owner",
			})) as string;
		} catch (error) {
			console.error("Error fetching owner:", error);
			return null;
		}
	}, [publicClient]);

	return {
		getUserData,
		getUserTransactions,
		sendPayment,
		setSavingsRate,
		setDefaultSavingsRate,
		withdrawSavings,
		getContractBalance,
		getOwner,
	};
}
