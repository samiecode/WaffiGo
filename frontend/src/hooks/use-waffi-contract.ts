"use client";

import {
	useReadContract,
	useWriteContract,
	useWaitForTransactionReceipt,
} from "wagmi";
import {parseEther, formatEther} from "viem";
import {CONTRACT_ADDRESS, SPEND_AND_SAVE_ABI} from "@/lib/contract";
import {useWallet} from "./use-wallet";
import {useState, useEffect} from "react";

export interface UserData {
	totalSpent: bigint;
	totalSaved: bigint;
	effectiveRateBps: bigint;
}

export interface Transaction {
	sender: `0x${string}`;
	recipient: `0x${string}`;
	amountSent: bigint;
	amountSaved: bigint;
	timestamp: bigint;
	savingsRateBps: bigint;
}

export function useContract() {
	const {address, isConnected} = useWallet();
	const [pendingTxHash, setPendingTxHash] = useState<
		`0x${string}` | undefined
	>();

	// Read user data
	const {
		data: userData,
		isLoading: isUserDataLoading,
		refetch: refetchUserData,
	} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: SPEND_AND_SAVE_ABI,
		functionName: "getUserData",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	});

	// Read user transactions
	const {
		data: userTransactions,
		isLoading: isTransactionsLoading,
		refetch: refetchTransactions,
	} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: SPEND_AND_SAVE_ABI,
		functionName: "getUserTransactions",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	});

	// Read default savings rate
	const {data: defaultSavingsRate} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: SPEND_AND_SAVE_ABI,
		functionName: "defaultSavingsRateBps",
	});

	// Write contract functions
	const {
		writeContract,
		isPending: isWritePending,
		data: writeData,
	} = useWriteContract();

	// Wait for transaction
	const {isLoading: isConfirming, isSuccess: isConfirmed} =
		useWaitForTransactionReceipt({
			hash: pendingTxHash,
		});

	useEffect(() => {
		if (writeData) {
			setPendingTxHash(writeData);
		}
	}, [writeData]);

	useEffect(() => {
		if (isConfirmed) {
			refetchUserData();
			refetchTransactions();
			setPendingTxHash(undefined);
		}
	}, [isConfirmed, refetchUserData, refetchTransactions]);

	// Transfer with spend and save
	const transfer = async (recipient: string, amountToSend: string) => {
		if (!address) throw new Error("Wallet not connected");

		const amountInWei = parseEther(amountToSend);
		const savingsRate = userData?.[2] || defaultSavingsRate || BigInt(1000); // 10% default
		const saveAmount = (amountInWei * savingsRate) / BigInt(10000);
		const totalAmount = amountInWei + saveAmount;

		writeContract({
			address: CONTRACT_ADDRESS,
			abi: SPEND_AND_SAVE_ABI,
			functionName: "transfer",
			args: [recipient as `0x${string}`, amountInWei],
			value: totalAmount,
		});
	};

	// Set user savings rate
	const setSavingsRate = async (rateBps: number) => {
		if (!address) throw new Error("Wallet not connected");

		writeContract({
			address: CONTRACT_ADDRESS,
			abi: SPEND_AND_SAVE_ABI,
			functionName: "setSavingsRate",
			args: [BigInt(rateBps)],
		});
	};

	// Withdraw savings
	const withdrawSavings = async () => {
		if (!address) throw new Error("Wallet not connected");

		writeContract({
			address: CONTRACT_ADDRESS,
			abi: SPEND_AND_SAVE_ABI,
			functionName: "withdrawSavings",
		});
	};

	// Format user data
	const formattedUserData = userData
		? {
				totalSpent: formatEther(userData[0]),
				totalSaved: formatEther(userData[1]),
				savingsRateBps: Number(userData[2]),
				savingsRatePercent: Number(userData[2]) / 100,
		  }
		: null;

	// Format transactions
	const formattedTransactions =
		userTransactions?.map((tx: Transaction) => ({
			sender: tx.sender,
			recipient: tx.recipient,
			amountSent: formatEther(tx.amountSent),
			amountSaved: formatEther(tx.amountSaved),
			timestamp: new Date(Number(tx.timestamp) * 1000),
			savingsRatePercent: Number(tx.savingsRateBps) / 100,
		})) || [];

	return {
		// Data
		userData: formattedUserData,
		transactions: formattedTransactions,
		defaultSavingsRate: defaultSavingsRate
			? Number(defaultSavingsRate) / 100
			: 10,

		// Loading states
		isUserDataLoading,
		isTransactionsLoading,
		isWritePending,
		isConfirming,
		isConfirmed,

		// Actions
		transfer,
		setSavingsRate,
		withdrawSavings,
		refetchUserData,
		refetchTransactions,

		// Connection state
		isConnected,
	};
}
