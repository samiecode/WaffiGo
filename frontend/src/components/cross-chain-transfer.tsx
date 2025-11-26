"use client";

import {useState, useEffect} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
	ArrowRight,
	Loader2,
	CheckCircle2,
	PiggyBank,
	Wallet,
	AlertCircle,
	ChevronDown,
	ArrowDownUp,
	Coins,
	Globe,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useWallet} from "@/hooks/use-wallet";
import {useContract} from "@/hooks/use-waffi-contract";
import {useTokenBalances} from "@/hooks/use-token-balances";
import {
	CELO_TOKENS,
	SUPPORTED_CHAINS,
	type Token,
	type Chain,
	ERC20_ABI,
} from "@/lib/tokens";
import {useWriteContract, useWaitForTransactionReceipt} from "wagmi";
import {parseUnits} from "viem";
import type {WalletSettings} from "./wallet-dashboard";
import Image from "next/image";

type TransferStatus = "idle" | "reviewing" | "pending" | "success" | "error";
type TransferMode = "same-chain" | "cross-chain";

interface CrossChainTransferProps {
	settings: WalletSettings;
}

export function CrossChainTransfer({settings}: CrossChainTransferProps) {
	const [amount, setAmount] = useState("");
	const [recipient, setRecipient] = useState("");
	const [status, setStatus] = useState<TransferStatus>("idle");
	const [error, setError] = useState<string | null>(null);
	const [selectedToken, setSelectedToken] = useState<Token>(CELO_TOKENS[0]);
	const [transferMode, setTransferMode] =
		useState<TransferMode>("same-chain");
	const [destinationChain, setDestinationChain] = useState<Chain>(
		SUPPORTED_CHAINS[0]
	);
	const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();

	const {isConnected, balance, balanceSymbol} = useWallet();
	const {transfer, isWritePending, isConfirming, isConfirmed, userData} =
		useContract();
	const {balances, tokensWithBalance} = useTokenBalances();

	// For ERC20 transfers
	const {
		writeContract: writeERC20,
		data: erc20TxHash,
		isPending: isERC20Pending,
	} = useWriteContract();
	const {isLoading: isERC20Confirming, isSuccess: isERC20Confirmed} =
		useWaitForTransactionReceipt({
			hash: pendingHash,
		});

	useEffect(() => {
		if (erc20TxHash) {
			setPendingHash(erc20TxHash);
		}
	}, [erc20TxHash]);

	// Get selected token balance
	const selectedTokenBalance = balances.find(
		(b) => b.token.symbol === selectedToken.symbol
	);

	const amountNumber = Number.parseFloat(amount) || 0;
	const savePercentage =
		userData?.savingsRatePercent || settings.savePercentage;
	const saveAmount =
		settings.saveEnabled && selectedToken.isNative
			? (amountNumber * savePercentage) / 100
			: 0;
	const totalFromWallet = amountNumber + saveAmount;

	const handleTransfer = async () => {
		if (!recipient || !amount) return;

		setError(null);
		setStatus("reviewing");

		try {
			if (transferMode === "cross-chain") {
				// Cross-chain transfer via bridge (placeholder for Squid/Axelar integration)
				setError(
					"Cross-chain transfers require bridge integration. Coming soon!"
				);
				setStatus("error");
				return;
			}

			if (selectedToken.isNative) {
				// Native CELO transfer with spend & save
				await transfer(recipient, amount);
				setStatus("pending");
			} else {
				// ERC20 token transfer
				const amountInWei = parseUnits(amount, selectedToken.decimals);
				writeERC20({
					address: selectedToken.address as `0x${string}`,
					abi: ERC20_ABI,
					functionName: "transfer",
					args: [recipient as `0x${string}`, amountInWei],
				});
				setStatus("pending");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Transfer failed");
			setStatus("error");
		}
	};

	// Update status based on transaction state
	useEffect(() => {
		if ((isConfirmed || isERC20Confirmed) && status === "pending") {
			setStatus("success");
		}
	}, [isConfirmed, isERC20Confirmed, status]);

	if (!isConnected) {
		return (
			<Card className="max-w-xl mx-auto bg-card border-border">
				<CardContent className="p-8 text-center space-y-6">
					<div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
						<Wallet className="w-10 h-10 text-primary" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Connect Wallet
						</h2>
						<p className="text-muted-foreground">
							Connect your wallet to send tokens
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (status === "success") {
		return (
			<Card className="max-w-xl mx-auto bg-card border-border">
				<CardContent className="p-8 text-center space-y-6">
					<div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
						<CheckCircle2 className="w-10 h-10 text-primary" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-foreground mb-2">
							Transfer Complete!
						</h2>
						<p className="text-muted-foreground">
							Your transfer has been successfully processed.
						</p>
					</div>
					<div className="p-4 rounded-xl bg-secondary/50 space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">
								Amount Sent
							</span>
							<span className="text-foreground font-medium">
								{amount} {selectedToken.symbol}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">To</span>
							<span className="text-foreground font-medium font-mono text-xs">
								{recipient.slice(0, 10)}...{recipient.slice(-8)}
							</span>
						</div>
						{settings.saveEnabled &&
							saveAmount > 0 &&
							selectedToken.isNative && (
								<div className="flex justify-between text-sm pt-2 border-t border-border">
									<span className="text-chart-3 flex items-center gap-1">
										<PiggyBank className="w-4 h-4" />
										Auto-Saved
									</span>
									<span className="text-chart-3 font-medium">
										+{saveAmount.toFixed(4)} CELO
									</span>
								</div>
							)}
					</div>
					<Button
						onClick={() => {
							setStatus("idle");
							setAmount("");
							setRecipient("");
							setPendingHash(undefined);
						}}
						className="w-full bg-primary text-primary-foreground"
					>
						Make Another Transfer
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="max-w-xl mx-auto space-y-6">
			<div>
				<h2 className="text-2xl font-bold text-foreground mb-2">
					Send
				</h2>
				<p className="text-muted-foreground">
					Send tokens on CELO or cross-chain
				</p>
			</div>

			<Tabs
				value={transferMode}
				onValueChange={(v) => setTransferMode(v as TransferMode)}
			>
				<TabsList className="grid w-full grid-cols-2 bg-secondary">
					<TabsTrigger
						value="same-chain"
						className="flex items-center gap-2"
					>
						<Coins className="w-4 h-4" />
						Same Chain
					</TabsTrigger>
					<TabsTrigger
						value="cross-chain"
						className="flex items-center gap-2"
					>
						<Globe className="w-4 h-4" />
						Cross-Chain
					</TabsTrigger>
				</TabsList>

				<TabsContent value="same-chain" className="mt-4">
					<Card className="bg-card border-border">
						<CardContent className="p-6 space-y-6">
							{/* Token selector */}
							<div className="space-y-3">
								<Label className="text-muted-foreground">
									Token
								</Label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full justify-between h-14 bg-secondary border-0"
										>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
													<Image
														src={
															selectedToken.logoUrl ||
															"/placeholder.svg"
														}
														alt={
															selectedToken.symbol
														}
														width={32}
														height={32}
														className="object-cover"
													/>
												</div>
												<div className="text-left">
													<p className="font-medium">
														{selectedToken.symbol}
													</p>
													<p className="text-xs text-muted-foreground">
														{selectedToken.name}
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
										{CELO_TOKENS.map((token) => {
											const tokenBal = balances.find(
												(b) =>
													b.token.symbol ===
													token.symbol
											);
											return (
												<DropdownMenuItem
													key={token.symbol}
													onClick={() =>
														setSelectedToken(token)
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
																alt={
																	token.symbol
																}
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
							</div>

							{/* Amount input */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-muted-foreground">
										Amount
									</Label>
									<span className="text-sm text-muted-foreground">
										Balance:{" "}
										{selectedTokenBalance?.balanceFormatted ||
											"0"}{" "}
										{selectedToken.symbol}
									</span>
								</div>
								<div className="p-4 rounded-xl bg-secondary/50 space-y-3">
									<Input
										type="number"
										placeholder="0.00"
										value={amount}
										onChange={(e) =>
											setAmount(e.target.value)
										}
										className="h-14 text-2xl bg-background border-0 text-center font-bold"
									/>
									<div className="flex gap-2">
										{["25%", "50%", "75%", "Max"].map(
											(preset) => {
												const balNum =
													Number.parseFloat(
														selectedTokenBalance?.balance ||
															"0"
													);
												const presetValue =
													preset === "Max"
														? balNum
														: (balNum *
																Number.parseInt(
																	preset
																)) /
														  100;
												return (
													<Button
														key={preset}
														variant="outline"
														size="sm"
														onClick={() =>
															setAmount(
																presetValue.toFixed(
																	4
																)
															)
														}
														className="flex-1 text-xs"
													>
														{preset}
													</Button>
												);
											}
										)}
									</div>
								</div>
							</div>

							{/* Recipient */}
							<div className="space-y-3">
								<Label className="text-muted-foreground">
									Recipient Address
								</Label>
								<Input
									placeholder="0x..."
									value={recipient}
									onChange={(e) =>
										setRecipient(e.target.value)
									}
									className="h-14 bg-secondary border-0 font-mono text-sm"
								/>
							</div>

							{/* Auto-save indicator (only for native CELO) */}
							{settings.saveEnabled &&
								amountNumber > 0 &&
								selectedToken.isNative && (
									<div className="flex items-center justify-between p-4 rounded-xl bg-chart-3/10 border border-chart-3/20">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-chart-3/20 flex items-center justify-center">
												<PiggyBank className="w-5 h-5 text-chart-3" />
											</div>
											<div>
												<p className="font-medium text-foreground">
													Auto-Save Active
												</p>
												<p className="text-sm text-muted-foreground">
													{savePercentage}% will be
													saved automatically
												</p>
											</div>
										</div>
										<span className="text-lg font-bold text-chart-3">
											+{saveAmount.toFixed(4)} CELO
										</span>
									</div>
								)}

							{/* Summary */}
							{amount && (
								<div className="p-4 rounded-xl bg-secondary/50 space-y-3">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Amount to Send
										</span>
										<span className="text-foreground">
											{amountNumber.toFixed(4)}{" "}
											{selectedToken.symbol}
										</span>
									</div>
									{settings.saveEnabled &&
										saveAmount > 0 &&
										selectedToken.isNative && (
											<div className="flex justify-between text-sm">
												<span className="text-chart-3">
													Auto-Save ({savePercentage}
													%)
												</span>
												<span className="text-chart-3">
													+{saveAmount.toFixed(4)}{" "}
													CELO
												</span>
											</div>
										)}
									<div className="border-t border-border pt-3 flex justify-between">
										<span className="text-foreground font-medium">
											Total from wallet
										</span>
										<span className="text-primary font-bold">
											{selectedToken.isNative
												? totalFromWallet.toFixed(4)
												: amountNumber.toFixed(4)}{" "}
											{selectedToken.symbol}
										</span>
									</div>
								</div>
							)}

							{/* Error message */}
							{error && (
								<div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
									<AlertCircle className="w-4 h-4" />
									<span className="text-sm">{error}</span>
								</div>
							)}

							{/* Action button */}
							<Button
								onClick={handleTransfer}
								disabled={
									!amount ||
									!recipient ||
									isWritePending ||
									isConfirming ||
									isERC20Pending ||
									isERC20Confirming
								}
								className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
							>
								{(isWritePending || isERC20Pending) && (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Confirm in wallet...
									</>
								)}
								{(isConfirming || isERC20Confirming) && (
									<>
										<Loader2 className="w-5 h-5 mr-2 animate-spin" />
										Processing...
									</>
								)}
								{!isWritePending &&
									!isConfirming &&
									!isERC20Pending &&
									!isERC20Confirming && (
										<>
											Send {selectedToken.symbol}
											<ArrowRight className="w-5 h-5 ml-2" />
										</>
									)}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="cross-chain" className="mt-4">
					<Card className="bg-card border-border">
						<CardContent className="p-6 space-y-6">
							{/* Source chain (always CELO) */}
							<div className="space-y-3">
								<Label className="text-muted-foreground">
									From
								</Label>
								<div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
									<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
										<Image
											src={
												SUPPORTED_CHAINS[0].logoUrl ||
												"/placeholder.svg"
											}
											alt="CELO"
											width={40}
											height={40}
											className="object-cover"
										/>
									</div>
									<div className="flex-1">
										<p className="font-medium">CELO</p>
										<p className="text-sm text-muted-foreground">
											Balance: {balance} CELO
										</p>
									</div>
								</div>
							</div>

							{/* Swap icon */}
							<div className="flex justify-center">
								<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
									<ArrowDownUp className="w-5 h-5 text-primary" />
								</div>
							</div>

							{/* Destination chain selector */}
							<div className="space-y-3">
								<Label className="text-muted-foreground">
									To
								</Label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full justify-between h-14 bg-secondary border-0"
										>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
													<Image
														src={
															destinationChain.logoUrl ||
															"/placeholder.svg"
														}
														alt={
															destinationChain.name
														}
														width={32}
														height={32}
														className="object-cover"
													/>
												</div>
												<div className="text-left">
													<p className="font-medium">
														{destinationChain.name}
													</p>
													<p className="text-xs text-muted-foreground">
														Native:{" "}
														{
															destinationChain.nativeSymbol
														}
													</p>
												</div>
											</div>
											<ChevronDown className="w-4 h-4 text-muted-foreground" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-72 bg-card border-border">
										<DropdownMenuLabel>
											Select Destination Chain
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										{SUPPORTED_CHAINS.filter(
											(c) => c.id !== 42220
										).map((chain) => (
											<DropdownMenuItem
												key={chain.id}
												onClick={() =>
													setDestinationChain(chain)
												}
												className="flex items-center gap-3 py-3"
											>
												<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
													<Image
														src={
															chain.logoUrl ||
															"/placeholder.svg"
														}
														alt={chain.name}
														width={32}
														height={32}
														className="object-cover"
													/>
												</div>
												<div>
													<p className="font-medium">
														{chain.name}
													</p>
													<p className="text-xs text-muted-foreground">
														Native:{" "}
														{chain.nativeSymbol}
													</p>
												</div>
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{/* Token selector for cross-chain */}
							<div className="space-y-3">
								<Label className="text-muted-foreground">
									Token to Bridge
								</Label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="w-full justify-between h-14 bg-secondary border-0"
										>
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
													<Image
														src={
															selectedToken.logoUrl ||
															"/placeholder.svg"
														}
														alt={
															selectedToken.symbol
														}
														width={32}
														height={32}
														className="object-cover"
													/>
												</div>
												<div className="text-left">
													<p className="font-medium">
														{selectedToken.symbol}
													</p>
													<p className="text-xs text-muted-foreground">
														{selectedToken.name}
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
										{CELO_TOKENS.map((token) => {
											const tokenBal = balances.find(
												(b) =>
													b.token.symbol ===
													token.symbol
											);
											return (
												<DropdownMenuItem
													key={token.symbol}
													onClick={() =>
														setSelectedToken(token)
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
																alt={
																	token.symbol
																}
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
							</div>

							{/* Amount input */}
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<Label className="text-muted-foreground">
										Amount
									</Label>
									<span className="text-sm text-muted-foreground">
										Balance:{" "}
										{selectedTokenBalance?.balanceFormatted ||
											"0"}{" "}
										{selectedToken.symbol}
									</span>
								</div>
								<div className="p-4 rounded-xl bg-secondary/50 space-y-3">
									<Input
										type="number"
										placeholder="0.00"
										value={amount}
										onChange={(e) =>
											setAmount(e.target.value)
										}
										className="h-14 text-2xl bg-background border-0 text-center font-bold"
									/>
									<div className="flex gap-2">
										{["25%", "50%", "75%", "Max"].map(
											(preset) => {
												const balNum =
													Number.parseFloat(
														selectedTokenBalance?.balance ||
															"0"
													);
												const presetValue =
													preset === "Max"
														? balNum
														: (balNum *
																Number.parseInt(
																	preset
																)) /
														  100;
												return (
													<Button
														key={preset}
														variant="outline"
														size="sm"
														onClick={() =>
															setAmount(
																presetValue.toFixed(
																	4
																)
															)
														}
														className="flex-1 text-xs"
													>
														{preset}
													</Button>
												);
											}
										)}
									</div>
								</div>
							</div>

							{/* Recipient */}
							<div className="space-y-3">
								<Label className="text-muted-foreground">
									Recipient Address on {destinationChain.name}
								</Label>
								<Input
									placeholder="0x..."
									value={recipient}
									onChange={(e) =>
										setRecipient(e.target.value)
									}
									className="h-14 bg-secondary border-0 font-mono text-sm"
								/>
							</div>

							{/* Bridge fee estimate */}
							{amount && (
								<div className="p-4 rounded-xl bg-secondary/50 space-y-3">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Amount to Bridge
										</span>
										<span className="text-foreground">
											{amountNumber.toFixed(4)}{" "}
											{selectedToken.symbol}
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Estimated Bridge Fee
										</span>
										<span className="text-foreground">
											~0.001 CELO
										</span>
									</div>
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Estimated Time
										</span>
										<span className="text-foreground">
											~2-5 minutes
										</span>
									</div>
									<div className="border-t border-border pt-3 flex justify-between">
										<span className="text-foreground font-medium">
											You will receive
										</span>
										<span className="text-primary font-bold">
											~{(amountNumber * 0.998).toFixed(4)}{" "}
											{selectedToken.symbol}
										</span>
									</div>
								</div>
							)}

							{/* Error message */}
							{error && (
								<div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
									<AlertCircle className="w-4 h-4" />
									<span className="text-sm">{error}</span>
								</div>
							)}

							{/* Cross-chain action button */}
							<Button
								onClick={handleTransfer}
								disabled={!amount || !recipient}
								className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
							>
								Bridge to {destinationChain.name}
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>

							{/* Bridge info */}
							<p className="text-xs text-center text-muted-foreground">
								Cross-chain transfers are powered by secure
								bridge protocols. Fees and times may vary.
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
