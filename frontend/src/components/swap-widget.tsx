"use client";

import {useState, useEffect} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
	ArrowDownUp,
	Loader2,
	CheckCircle2,
	AlertCircle,
	ChevronDown,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {useWallet} from "@/hooks/use-wallet";
import {useTokenBalances} from "@/hooks/use-token-balances";
import {
	CELO_TOKENS,
	getTokensByChainId,
	type Token,
	ERC20_ABI,
} from "@/lib/tokens";
import {CONTRACT_ADDRESS, SPEND_AND_SAVE_ABI} from "@/lib/contract";
import {
	useWriteContract,
	useWaitForTransactionReceipt,
	useReadContract,
	useChainId,
} from "wagmi";
import {parseUnits} from "viem";
import Image from "next/image";
import {toast} from "sonner";

type SwapStatus = "idle" | "pending" | "success" | "error";

export function SwapWidget() {
	const chainId = useChainId();
	const tokens = getTokensByChainId(chainId);

	const [fromToken, setFromToken] = useState<Token>(tokens[0]);
	const [toToken, setToToken] = useState<Token>(tokens[1]);
	const [fromAmount, setFromAmount] = useState("");
	const [status, setStatus] = useState<SwapStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();

	const {isConnected, address} = useWallet();
	const {balances} = useTokenBalances();
	const {writeContract, data: txHash, isPending} = useWriteContract();
	const {isLoading: isConfirming, isSuccess: isConfirmed} =
		useWaitForTransactionReceipt({
			hash: pendingHash,
		});

	// Update tokens when chain changes
	useEffect(() => {
		const newTokens = getTokensByChainId(chainId);
		setFromToken(newTokens[0]);
		setToToken(newTokens[1]);
	}, [chainId]);

	// Check token allowance for swapTokenToCelo
	const {data: allowance} = useReadContract({
		address:
			!fromToken.isNative && fromToken.address !== "native"
				? (fromToken.address as `0x${string}`)
				: undefined,
		abi: ERC20_ABI,
		functionName: "allowance",
		args:
			address && !fromToken.isNative && fromToken.address !== "native"
				? [address, CONTRACT_ADDRESS]
				: undefined,
		query: {
			enabled:
				!!address &&
				!fromToken.isNative &&
				fromToken.address !== "native",
		},
	});

	useEffect(() => {
		if (txHash) {
			setPendingHash(txHash);
		}
	}, [txHash]);

	useEffect(() => {
		if (isConfirmed && status === "pending") {
			setStatus("success");
		}
	}, [isConfirmed, status]);

	const fromTokenBalance = balances.find(
		(b) => b.token.symbol === fromToken.symbol
	);
	const toTokenBalance = balances.find(
		(b) => b.token.symbol === toToken.symbol
	);

	const fromAmountNumber = Number.parseFloat(fromAmount) || 0;

	const handleSwap = () => {
		setSwapDirection((prev) =>
			prev === "celoToToken" ? "tokenToCelo" : "celoToToken"
		);
		const temp = fromToken;
		setFromToken(toToken);
		setToToken(temp);
		setFromAmount("");
	};

	const [swapDirection, setSwapDirection] = useState<
		"celoToToken" | "tokenToCelo"
	>("celoToToken");

	useEffect(() => {
		if (fromToken.isNative && !toToken.isNative) {
			setSwapDirection("celoToToken");
		} else if (!fromToken.isNative && toToken.isNative) {
			setSwapDirection("tokenToCelo");
		}
	}, [fromToken, toToken]);

	const handleExecuteSwap = async () => {
		if (!fromAmount || !address) {
			toast.error("Amount or address not set!");
			return;
		}

		setError(null);
		setStatus("pending");

		try {
			const amountInWei = parseUnits(fromAmount, fromToken.decimals);
			const minAmountOut = BigInt(0); // In production, calculate based on slippage tolerance
			const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

			if (swapDirection === "celoToToken") {
				// Swap CELO to Token
				writeContract({
					address: CONTRACT_ADDRESS,
					abi: SPEND_AND_SAVE_ABI,
					functionName: "swapCeloToToken",
					args: [
						toToken.address as `0x${string}`,
						minAmountOut,
						BigInt(deadline),
					],
					value: amountInWei,
				});
			} else {
				// Swap Token to CELO
				// Check if we need to approve first
				const needsApproval = !allowance || allowance < amountInWei;

				if (needsApproval) {
					// Approve token spending
					writeContract({
						address: fromToken.address as `0x${string}`,
						abi: ERC20_ABI,
						functionName: "approve",
						args: [CONTRACT_ADDRESS, amountInWei],
					});
				} else {
					// Execute swap
					writeContract({
						address: CONTRACT_ADDRESS,
						abi: SPEND_AND_SAVE_ABI,
						functionName: "swapTokenToCelo",
						args: [
							fromToken.address as `0x${string}`,
							amountInWei,
							minAmountOut,
							BigInt(deadline),
						],
					});
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Swap failed");
			setStatus("error");
			console.error(err);
		}
	};

	if (!isConnected) {
		return (
			<Card className="bg-card border-border">
				<CardContent className="p-8 text-center">
					<p className="text-muted-foreground">
						Connect wallet to swap tokens
					</p>
				</CardContent>
			</Card>
		);
	}

	if (status === "success") {
		return (
			<Card className="bg-card border-border">
				<CardContent className="p-8 text-center space-y-6">
					<div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
						<CheckCircle2 className="w-10 h-10 text-primary" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Swap Complete!
						</h2>
						<p className="text-muted-foreground">
							Your swap has been successfully processed.
						</p>
					</div>
					<div className="p-4 rounded-xl bg-secondary/50 space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								You swapped
							</span>
							<span className="text-foreground font-medium">
								{fromAmount} {fromToken.symbol}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">For</span>
							<span className="text-foreground font-medium">
								{toToken.symbol}
							</span>
						</div>
					</div>
					<Button
						onClick={() => {
							setStatus("idle");
							setFromAmount("");
							setPendingHash(undefined);
						}}
						className="w-full bg-primary text-primary-foreground"
					>
						Make Another Swap
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="bg-card border-border">
			<CardContent className="p-6 space-y-6">
				<div>
					<h2 className="text-xl font-bold text-foreground mb-1">
						Swap Tokens
					</h2>
					<p className="text-sm text-muted-foreground">
						Swap between CELO native tokens
					</p>
				</div>

				{/* From token */}
				<div className="space-y-3">
					<Label className="text-muted-foreground">From</Label>
					<div className="p-4 rounded-xl bg-secondary/50 space-y-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="w-full justify-between h-auto p-0 hover:bg-transparent"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
											<Image
												src={
													fromToken.logoUrl ||
													"/placeholder.svg"
												}
												alt={fromToken.symbol}
												width={32}
												height={32}
												className="object-cover"
											/>
										</div>
										<div className="text-left">
											<p className="font-medium">
												{fromToken.symbol}
											</p>
											<p className="text-xs text-muted-foreground">
												{fromToken.name}
											</p>
										</div>
									</div>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-72 bg-card border-border">
								<DropdownMenuLabel>
									Select Token
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{tokens
									.filter((t) => t.symbol !== toToken.symbol)
									.map((token) => {
										const tokenBal = balances.find(
											(b) =>
												b.token.symbol === token.symbol
										);
										return (
											<DropdownMenuItem
												key={token.symbol}
												onClick={() =>
													setFromToken(token)
												}
												className="flex items-center justify-between py-3"
											>
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
														<Image
															src={
																token.logoUrl ||
																"/placeholder.svg"
															}
															alt={token.symbol}
															width={32}
															height={32}
															className="object-cover"
														/>
													</div>
													<div>
														<p className="font-medium">
															{token.symbol}
														</p>
														<p className="text-xs text-muted-foreground">
															{token.name}
														</p>
													</div>
												</div>
												<span className="text-sm text-muted-foreground">
													{tokenBal?.balanceFormatted ||
														"0"}
												</span>
											</DropdownMenuItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>

						<Input
							type="number"
							placeholder="0.00"
							value={fromAmount}
							onChange={(e) => setFromAmount(e.target.value)}
							className="h-12 text-xl bg-background border-0 font-bold"
						/>

						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">
								Balance:{" "}
								{fromTokenBalance?.balanceFormatted || "0"}{" "}
								{fromToken.symbol}
							</span>
							<Button
								variant="link"
								size="sm"
								onClick={() =>
									setFromAmount(
										fromTokenBalance?.balance || "0"
									)
								}
								className="h-auto p-0 text-primary"
							>
								Max
							</Button>
						</div>
					</div>
				</div>

				{/* Swap button */}
				<div className="flex justify-center">
					<Button
						onClick={handleSwap}
						variant="outline"
						size="icon"
						className="rounded-full w-12 h-12 border-2 bg-secondary hover:bg-secondary/80"
					>
						<ArrowDownUp className="w-5 h-5" />
					</Button>
				</div>

				{/* To token */}
				<div className="space-y-3">
					<Label className="text-muted-foreground">
						To (estimated)
					</Label>
					<div className="p-4 rounded-xl bg-secondary/50 space-y-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="w-full justify-between h-auto p-0 hover:bg-transparent"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
											<Image
												src={
													toToken.logoUrl ||
													"/placeholder.svg"
												}
												alt={toToken.symbol}
												width={32}
												height={32}
												className="object-cover"
											/>
										</div>
										<div className="text-left">
											<p className="font-medium">
												{toToken.symbol}
											</p>
											<p className="text-xs text-muted-foreground">
												{toToken.name}
											</p>
										</div>
									</div>
									<ChevronDown className="w-4 h-4 text-muted-foreground" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-72 bg-card border-border">
								<DropdownMenuLabel>
									Select Token
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{tokens
									.filter(
										(t) => t.symbol !== fromToken.symbol
									)
									.map((token) => {
										const tokenBal = balances.find(
											(b) =>
												b.token.symbol === token.symbol
										);
										return (
											<DropdownMenuItem
												key={token.symbol}
												onClick={() =>
													setToToken(token)
												}
												className="flex items-center justify-between py-3"
											>
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
														<Image
															src={
																token.logoUrl ||
																"/placeholder.svg"
															}
															alt={token.symbol}
															width={32}
															height={32}
															className="object-cover"
														/>
													</div>
													<div>
														<p className="font-medium">
															{token.symbol}
														</p>
														<p className="text-xs text-muted-foreground">
															{token.name}
														</p>
													</div>
												</div>
												<span className="text-sm text-muted-foreground">
													{tokenBal?.balanceFormatted ||
														"0"}
												</span>
											</DropdownMenuItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>

						<div className="h-12 flex items-center px-4 text-xl font-bold text-muted-foreground">
							~
						</div>

						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">
								Balance:{" "}
								{toTokenBalance?.balanceFormatted || "0"}{" "}
								{toToken.symbol}
							</span>
						</div>
					</div>
				</div>

				{/* Error message */}
				{error && (
					<div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
						<AlertCircle className="w-4 h-4" />
						<span className="text-sm">{error}</span>
					</div>
				)}

				{/* Swap button */}
				<Button
					onClick={handleExecuteSwap}
					disabled={!fromAmount || isPending || isConfirming}
					className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
				>
					{isPending && (
						<>
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							Confirm in wallet...
						</>
					)}
					{isConfirming && (
						<>
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							Swapping...
						</>
					)}
					{!isPending && !isConfirming && (
						<>
							Swap {fromToken.symbol} for {toToken.symbol}
						</>
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
