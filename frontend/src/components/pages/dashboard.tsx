"use client";

import {useEffect, useState} from "react";
import {
	ArrowUpRight,
	Wallet,
	PiggyBank,
	TrendingUp,
	Loader2,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {useWallet} from "@/hooks/use-wallet";
import {useContract} from "@/hooks/use-contract";
import type {UserData} from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {parseEther, formatEther, isAddress} from "viem";

export function Dashboard() {
	const {address, balance} = useWallet();
	const {getUserData, withdrawSavings} = useContract();
	const [userData, setUserData] = useState<UserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isWithdrawing, setIsWithdrawing] = useState(false);

	useEffect(() => {
		if (address) {
			loadUserData();
		}
	}, [address]);

	const loadUserData = async () => {
		if (!address) return;
		setIsLoading(true);
		const data = await getUserData(address);
		setUserData(data);
		setIsLoading(false);
	};

	const handleWithdraw = async () => {
		setIsWithdrawing(true);
		const success = await withdrawSavings();
		if (success) {
			await loadUserData();
		}
		setIsWithdrawing(false);
	};

	const savingsRatePercent = userData
		? Number(userData.savingsRateBps) / 100
		: 0;

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-4xl font-bold tracking-tight text-balance">
						Dashboard
					</h1>
					<p className="text-muted-foreground mt-2">
						Track your spending and savings on Celo
					</p>
				</div>
				<div className="text-2xl font-bold">
					{balance ? Number.parseFloat(balance).toFixed(2) : "0.00"} CELO
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card className="shadow-lg border-primary/10">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Spent
						</CardTitle>
						<ArrowUpRight className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-32" />
						) : (
							<div className="text-3xl font-bold">
								{userData
									? Number.parseFloat(
											formatEther(userData.totalSpent)
									  ).toFixed(4)
									: "0.0000"}
								<span className="text-base font-normal text-muted-foreground ml-2">
									CELO
								</span>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="shadow-lg border-accent/20 bg-gradient-to-br from-card to-accent/5">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Saved
						</CardTitle>
						<PiggyBank className="h-4 w-4 text-accent" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-32" />
						) : (
							<div className="text-3xl font-bold text-accent">
								{userData
									? Number.parseFloat(
											formatEther(userData.totalSaved)
									  ).toFixed(4)
									: "0.0000"}
								<span className="text-base font-normal text-muted-foreground ml-2">
									CELO
								</span>
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="shadow-lg border-primary/10">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Savings Rate
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<Skeleton className="h-8 w-32" />
						) : (
							<div className="text-3xl font-bold text-primary">
								{savingsRatePercent.toFixed(2)}
								<span className="text-base font-normal text-muted-foreground ml-1">
									%
								</span>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card className="shadow-lg">
				<CardHeader>
					<CardTitle>Your Savings</CardTitle>
					<CardDescription>
						Withdraw your accumulated savings to your wallet
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
						<div className="space-y-1">
							<div className="text-sm text-muted-foreground">
								Available to Withdraw
							</div>
							{isLoading ? (
								<Skeleton className="h-6 w-24" />
							) : (
								<div className="text-2xl font-bold">
									{userData
										? Number.parseFloat(
												formatEther(userData.totalSaved)
										  ).toFixed(4)
										: "0.0000"}{" "}
									CELO
								</div>
							)}
						</div>
						<Button
							onClick={handleWithdraw}
							disabled={
								isWithdrawing ||
								isLoading ||
								!userData ||
								userData.totalSaved === BigInt(0)
							}
							size="lg"
							className="gap-2"
						>
							{isWithdrawing ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Withdrawing...
								</>
							) : (
								<>
									<Wallet className="h-4 w-4" />
									Withdraw Savings
								</>
							)}
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-4 pt-2">
						<div className="space-y-1">
							<div className="text-sm text-muted-foreground">
								Total Transactions
							</div>
							<div className="text-xl font-semibold">
								{userData ? "—" : "0"}
							</div>
						</div>
						<div className="space-y-1">
							<div className="text-sm text-muted-foreground">
								Average Save Rate
							</div>
							<div className="text-xl font-semibold">
								{savingsRatePercent.toFixed(2)}%
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
