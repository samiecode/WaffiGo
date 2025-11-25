"use client";

import {
	useReadContract,
	useWriteContract,
	useWaitForTransactionReceipt,
	useBalance,
	useAccount,
} from "wagmi";
import {SPEND_AND_SAVE_ABI, CONTRACT_ADDRESS} from "@/lib/contract";
import {useState, useEffect} from "react";
import {parseEther, formatEther, isAddress} from "viem";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {celoSepolia, celo} from 'wagmi/chains'

export function Dashboard() {
	const {address, isConnected} = useAccount();
	const {writeContract, data: hash, isPending} = useWriteContract();
	const {isLoading: isConfirming, isSuccess: isConfirmed} =
		useWaitForTransactionReceipt({hash});

	 const isCeloNetwork =
			chainId === celo.id ||
			chainId === celoSepolia.id;

	const [activeTab, setActiveTab] = useState<"send" | "savings">("send");
	const [sendAmount, setSendAmount] = useState("");
	const [recipientAddress, setRecipientAddress] = useState("");
	const [savingsRate, setSavingsRate] = useState("");
	const [showSettings, setShowSettings] = useState(false);

	// Read wallet balance
	const {data: balanceData} = useBalance({
		address: address,
	});

	// Read user data
	const {data: userData, refetch: refetchUserData} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: SPEND_AND_SAVE_ABI,
		functionName: "getUserData",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	});

	// Read transaction count
	const {data: txCount} = useReadContract({
		address: CONTRACT_ADDRESS,
		abi: SPEND_AND_SAVE_ABI,
		functionName: "getUserTransactionCount",
		args: address ? [address] : undefined,
		query: {
			enabled: !!address,
		},
	});

	useEffect(() => {
		if (isConfirmed) {
			refetchUserData();
			setSendAmount("");
			setRecipientAddress("");
		}
	}, [isConfirmed, refetchUserData]);

	const handleSetSavingsRate = () => {
		if (
			!savingsRate ||
			parseFloat(savingsRate) < 0 ||
			parseFloat(savingsRate) > 100
		) {
			alert("Please enter a valid savings rate between 0 and 100");
			return;
		}
		const rateBps = BigInt(Math.floor(parseFloat(savingsRate) * 100));
		writeContract({
			address: CONTRACT_ADDRESS,
			abi: SPEND_AND_SAVE_ABI,
			functionName: "setSavingsRate",
			args: [rateBps],
		});
		setShowSettings(false);
	};

	const handleSendMoney = () => {
		if (!sendAmount || parseFloat(sendAmount) <= 0) {
			alert("Please enter a valid amount");
			return;
		}
		if (!recipientAddress || !isAddress(recipientAddress)) {
			alert("Please enter a valid recipient address");
			return;
		}
		if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
			alert("Cannot send money to yourself");
			return;
		}

		const amount = parseEther(sendAmount);
		writeContract({
			address: CONTRACT_ADDRESS,
			abi: SPEND_AND_SAVE_ABI,
			functionName: "transfer",
			args: [recipientAddress as `0x${string}`, amount],
			value: amount,
		});
	};

	const handleWithdrawSavings = () => {
		writeContract({
			address: CONTRACT_ADDRESS,
			abi: SPEND_AND_SAVE_ABI,
			functionName: "withdrawSavings",
		});
	};

	if (!isConnected) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4">
				<div className="text-center mb-8">
					<div className="text-6xl mb-4">💰</div>
					<h1 className="text-4xl font-bold mb-2">Spend & Save</h1>
					<p className="text-blue-100">Your On-Chain Financial App</p>
				</div>
				<ConnectButton />
			</div>
		);
	}

	const currentRate = userData ? Number(userData[2]) / 100 : 10;
	const savingsAmount =
		sendAmount && parseFloat(sendAmount) > 0
			? ((parseFloat(sendAmount) * currentRate) / 100).toFixed(4)
			: "0";
	const recipientAmount =
		sendAmount && parseFloat(sendAmount) > 0
			? ((parseFloat(sendAmount) * (100 - currentRate)) / 100).toFixed(4)
			: "0";

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
				<div className="max-w-md mx-auto">
					<div className="flex items-center justify-between mb-4">
						<div>
							<p className="text-sm text-blue-100">
								Your Balance
							</p>
							<p className="text-2xl font-bold">
								{balanceData
									? parseFloat(
											formatEther(balanceData.value)
									  ).toFixed(4)
									: "0.0000"}{" "}
								CELO
							</p>
						</div>
						<button
							onClick={() => setShowSettings(!showSettings)}
							className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition flex items-center justify-center"
						>
							⚙️
						</button>
					</div>

					<ConnectButton />
				</div>
			</div>

			{/* Settings Modal */}
			{showSettings && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl p-6 max-w-md w-full">
						<h3 className="text-xl font-bold mb-4 text-gray-900">
							Settings
						</h3>

						<div className="mb-4">
							<label className="block text-sm text-gray-600 mb-2">
								Auto-Save Rate (%)
							</label>
							<input
								type="number"
								placeholder={`Current: ${currentRate}%`}
								value={savingsRate}
								onChange={(e) => setSavingsRate(e.target.value)}
								className="w-full bg-gray-100 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
								min="0"
								max="100"
								step="0.1"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Percentage of each transaction automatically
								saved
							</p>
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleSetSavingsRate}
								disabled={isPending}
								className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
							>
								Update
							</button>
							<button
								onClick={() => setShowSettings(false)}
								className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Main Content */}
			<div className="max-w-md mx-auto px-4 py-6">
				{/* Stats Cards */}
				<div className="grid grid-cols-2 gap-3 mb-6">
					<div className="bg-white rounded-xl p-4 shadow-sm">
						<p className="text-xs text-gray-500 mb-1">
							Total Saved
						</p>
						<p className="text-xl font-bold text-green-600">
							{userData
								? parseFloat(formatEther(userData[1])).toFixed(
										4
								  )
								: "0.0000"}
						</p>
						<p className="text-xs text-gray-400">CELO</p>
					</div>

					<div className="bg-white rounded-xl p-4 shadow-sm">
						<p className="text-xs text-gray-500 mb-1">
							Transactions
						</p>
						<p className="text-xl font-bold text-blue-600">
							{txCount?.toString() || "0"}
						</p>
						<p className="text-xs text-gray-400">Completed</p>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-xl shadow-sm p-1 mb-6 flex">
					<button
						onClick={() => setActiveTab("send")}
						className={`flex-1 py-2 rounded-lg font-semibold transition ${
							activeTab === "send"
								? "bg-blue-600 text-white"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						Send Money
					</button>
					<button
						onClick={() => setActiveTab("savings")}
						className={`flex-1 py-2 rounded-lg font-semibold transition ${
							activeTab === "savings"
								? "bg-blue-600 text-white"
								: "text-gray-600 hover:bg-gray-100"
						}`}
					>
						Savings
					</button>
				</div>

				{/* Send Money Tab */}
				{activeTab === "send" && (
					<div className="bg-white rounded-xl shadow-sm p-6 mb-6">
						<h3 className="font-bold text-lg mb-4 text-gray-900">
							Send Money
						</h3>

						<div className="space-y-4">
							<div>
								<label className="block text-sm text-gray-600 mb-2">
									Recipient Address
								</label>
								<input
									type="text"
									placeholder="0x..."
									value={recipientAddress}
									onChange={(e) =>
										setRecipientAddress(e.target.value)
									}
									className="w-full bg-gray-50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900"
								/>
							</div>

							<div>
								<label className="block text-sm text-gray-600 mb-2">
									Amount (CELO)
								</label>
								<input
									type="number"
									placeholder="0.00"
									value={sendAmount}
									onChange={(e) =>
										setSendAmount(e.target.value)
									}
									className="w-full bg-gray-50 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold text-gray-900"
									step="0.0001"
								/>
							</div>

							{sendAmount && parseFloat(sendAmount) > 0 && (
								<div className="bg-blue-50 rounded-lg p-4 space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											Recipient gets:
										</span>
										<span className="font-semibold text-gray-900">
											{recipientAmount} CELO
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											You save:
										</span>
										<span className="font-semibold text-green-600">
											+{savingsAmount} CELO
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-gray-600">
											Savings rate:
										</span>
										<span className="font-semibold text-gray-900">
											{currentRate}%
										</span>
									</div>
								</div>
							)}

							<button
								onClick={handleSendMoney}
								disabled={
									isPending ||
									!sendAmount ||
									!recipientAddress
								}
								className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
							>
								{isPending ? "Sending..." : "Send Money"}
							</button>
						</div>
					</div>
				)}

				{/* Savings Tab */}
				{activeTab === "savings" && (
					<div className="space-y-4">
						<div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
							<p className="text-sm opacity-90 mb-2">
								Your Savings
							</p>
							<p className="text-4xl font-bold mb-1">
								{userData
									? parseFloat(
											formatEther(userData[1])
									  ).toFixed(4)
									: "0.0000"}
							</p>
							<p className="text-sm opacity-75">CELO</p>
						</div>

						<div className="bg-white rounded-xl shadow-sm p-6">
							<h3 className="font-bold text-lg mb-2 text-gray-900">
								Auto-Save Settings
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								Currently saving{" "}
								<span className="font-bold text-green-600">
									{currentRate}%
								</span>{" "}
								of every transaction
							</p>
							<button
								onClick={() => setShowSettings(true)}
								className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
							>
								Change Rate
							</button>
						</div>

						<div className="bg-white rounded-xl shadow-sm p-6">
							<h3 className="font-bold text-lg mb-4 text-gray-900">
								Withdraw Savings
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								Transfer your saved CELO back to your wallet
							</p>
							<button
								onClick={handleWithdrawSavings}
								disabled={
									isPending ||
									!userData ||
									userData[1] === BigInt(0)
								}
								className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
							>
								{isPending
									? "Processing..."
									: "Withdraw All Savings"}
							</button>
						</div>
					</div>
				)}

				{/* Transaction History Link */}
				<Link
					href="/transactions"
					className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition text-center"
				>
					<p className="font-semibold text-gray-900">
						View Transaction History
					</p>
					<p className="text-sm text-gray-500">
						{txCount?.toString() || "0"} transactions
					</p>
				</Link>

				{/* Transaction Status */}
				{hash && (
					<div className="mt-4 p-4 bg-white rounded-xl shadow-sm">
						<p className="text-sm text-gray-600 mb-2">
							Transaction Status
						</p>
						<a
							href={`https://celo-sepolia.blockscout.com/tx/${hash}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-blue-600 hover:underline text-xs break-all"
						>
							{hash}
						</a>
						{isConfirming && (
							<p className="text-yellow-600 text-sm mt-2">
								⏳ Confirming...
							</p>
						)}
						{isConfirmed && (
							<p className="text-green-600 text-sm mt-2">
								✅ Confirmed!
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
