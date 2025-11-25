export interface UserData {
	totalSpent: bigint;
	totalSaved: bigint;
	savingsRateBps: bigint;
}

export interface Transaction {
	sender: string;
	recipient: string;
	amountSent: bigint;
	amountSaved: bigint;
	savingsRateBps: bigint;
	timestamp: bigint;
}

export interface WalletState {
	address: string | null;
	balance: string;
	isConnected: boolean;
	chainId: number | null;
}
