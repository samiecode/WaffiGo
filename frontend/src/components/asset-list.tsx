"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Wallet} from "lucide-react";
import {useWallet} from "@/hooks/use-wallet";
import {useTokenBalances} from "@/hooks/use-token-balances";
import Image from "next/image";

export function AssetList() {
	const {isConnected, isBalanceLoading} = useWallet();
	const {tokensWithBalance, isLoading: isTokensLoading} = useTokenBalances();

	const isLoading = isBalanceLoading || isTokensLoading;

	if (!isConnected) {
		return (
			<Card className="bg-card border-border">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg font-semibold text-foreground">
						Assets
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
							<Wallet className="w-6 h-6 text-muted-foreground" />
						</div>
						<p className="text-muted-foreground text-sm">
							Connect wallet to view assets
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card className="bg-card border-border">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg font-semibold text-foreground">
							Assets
						</CardTitle>
						<Skeleton className="h-5 w-16 bg-secondary" />
					</div>
				</CardHeader>
				<CardContent className="space-y-2">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex items-center justify-between p-3 rounded-xl"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="w-10 h-10 rounded-full bg-secondary" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-16 bg-secondary" />
									<Skeleton className="h-3 w-12 bg-secondary" />
								</div>
							</div>
							<div className="text-right space-y-2">
								<Skeleton className="h-4 w-20 bg-secondary" />
								<Skeleton className="h-3 w-16 bg-secondary" />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-card border-border">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<CardTitle className="text-lg font-semibold text-foreground">
						Assets
					</CardTitle>
					<Badge variant="outline" className="text-muted-foreground">
						{tokensWithBalance.length} token
						{tokensWithBalance.length !== 1 ? "s" : ""}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-2">
				{tokensWithBalance.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground text-sm">
							No assets found
						</p>
						<p className="text-muted-foreground/60 text-xs mt-1">
							Your wallet balance is zero
						</p>
					</div>
				) : (
					tokensWithBalance.map((tokenBalance) => (
						<div
							key={tokenBalance.token.symbol}
							className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer group"
						>
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
									<Image
										src={
											tokenBalance.token.logoUrl ||
											"/placeholder.svg"
										}
										alt={tokenBalance.token.name}
										width={40}
										height={40}
										className="w-full h-full object-cover"
									/>
								</div>
								<div>
									<p className="font-medium text-foreground">
										{tokenBalance.token.symbol}
									</p>
									<p className="text-sm text-muted-foreground">
										{tokenBalance.token.name}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="font-medium text-foreground">
									${tokenBalance.usdValue.toFixed(2)}
								</p>
								<div className="flex items-center justify-end gap-1">
									<span className="text-sm text-muted-foreground">
										{tokenBalance.balanceFormatted}{" "}
										{tokenBalance.token.symbol}
									</span>
								</div>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
}
