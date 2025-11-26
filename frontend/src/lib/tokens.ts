export interface Token {
	symbol: string;
	name: string;
	address: `0x${string}` | "native";
	decimals: number;
	logoUrl: string;
	isNative?: boolean;
}

export interface Chain {
	id: number;
	name: string;
	logoUrl: string;
	nativeSymbol: string;
	rpcUrl: string;
	explorerUrl: string;
}

// Supported chains for cross-chain transfers
export const SUPPORTED_CHAINS: Chain[] = [
	{
		id: 42220,
		name: "CELO",
		logoUrl: "/celo-blockchain-logo-yellow-green.jpg",
		nativeSymbol: "CELO",
		rpcUrl: "https://forno.celo.org",
		explorerUrl: "https://celoscan.io",
	},
	{
		id: 1,
		name: "Ethereum",
		logoUrl: "/ethereum-logo.png",
		nativeSymbol: "ETH",
		rpcUrl: "https://eth.llamarpc.com",
		explorerUrl: "https://etherscan.io",
	},
	{
		id: 137,
		name: "Polygon",
		logoUrl: "/polygon-matic-logo.png",
		nativeSymbol: "MATIC",
		rpcUrl: "https://polygon-rpc.com",
		explorerUrl: "https://polygonscan.com",
	},
	{
		id: 42161,
		name: "Arbitrum",
		logoUrl: "/arbitrum-logo-blue.jpg",
		nativeSymbol: "ETH",
		rpcUrl: "https://arb1.arbitrum.io/rpc",
		explorerUrl: "https://arbiscan.io",
	},
	{
		id: 10,
		name: "Optimism",
		logoUrl: "/optimism-logo-red.jpg",
		nativeSymbol: "ETH",
		rpcUrl: "https://mainnet.optimism.io",
		explorerUrl: "https://optimistic.etherscan.io",
	},
	{
		id: 8453,
		name: "Base",
		logoUrl: "/base-chain-logo-blue.jpg",
		nativeSymbol: "ETH",
		rpcUrl: "https://mainnet.base.org",
		explorerUrl: "https://basescan.org",
	},
];

// CELO mainnet tokens with actual logo URLs
export const CELO_MAINNET_TOKENS: Token[] = [
	{
		symbol: "CELO",
		name: "CELO",
		address: "native",
		decimals: 18,
		logoUrl: "/celo-blockchain-logo-yellow-green.jpg",
		isNative: true,
	},
	{
		symbol: "cUSD",
		name: "Celo Dollar",
		address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
		decimals: 18,
		logoUrl: "/cusd-celo-dollar-stablecoin.jpg",
	},
	{
		symbol: "cEUR",
		name: "Celo Euro",
		address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
		decimals: 18,
		logoUrl: "/ceur-celo-euro.jpg",
	},
	{
		symbol: "cREAL",
		name: "Celo Brazilian Real",
		address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
		decimals: 18,
		logoUrl: "/creal-celo-brazilian-real.jpg",
	},
	{
		symbol: "USDC",
		name: "USD Coin",
		address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
		decimals: 6,
		logoUrl: "/usdc-coin-logo.jpg",
	},
	{
		symbol: "USDT",
		name: "Tether USD",
		address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
		decimals: 6,
		logoUrl: "/usdt-tether-logo.jpg",
	},
];

// CELO Alfajores testnet tokens
export const CELO_TESTNET_TOKENS: Token[] = [
	{
		symbol: "CELO",
		name: "CELO",
		address: "native",
		decimals: 18,
		logoUrl: "/celo-blockchain-logo-yellow-green.jpg",
		isNative: true,
	},
	{
		symbol: "cUSD",
		name: "Celo Dollar",
		address: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
		decimals: 18,
		logoUrl: "/cusd-celo-dollar-stablecoin.jpg",
	},
	{
		symbol: "cEUR",
		name: "Celo Euro",
		address: "0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F",
		decimals: 18,
		logoUrl: "/ceur-celo-euro.jpg",
	},
];

// Default to testnet tokens (change to CELO_MAINNET_TOKENS for production)
export const CELO_TOKENS = CELO_TESTNET_TOKENS;

// Helper to get tokens by chain ID
export const getTokensByChainId = (chainId: number): Token[] => {
	switch (chainId) {
		case 42220: // Celo Mainnet
			return CELO_MAINNET_TOKENS;
		case 44787: // Celo Alfajores
		case 42221: // Celo Sepolia (if different)
			return CELO_TESTNET_TOKENS;
		default:
			return CELO_TESTNET_TOKENS;
	}
};

// ERC20 ABI for token transfers
export const ERC20_ABI = [
	{
		inputs: [{name: "owner", type: "address"}],
		name: "balanceOf",
		outputs: [{name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{name: "spender", type: "address"},
			{name: "amount", type: "uint256"},
		],
		name: "approve",
		outputs: [{name: "", type: "bool"}],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{name: "to", type: "address"},
			{name: "amount", type: "uint256"},
		],
		name: "transfer",
		outputs: [{name: "", type: "bool"}],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{name: "owner", type: "address"},
			{name: "spender", type: "address"},
		],
		name: "allowance",
		outputs: [{name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "decimals",
		outputs: [{name: "", type: "uint8"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "symbol",
		outputs: [{name: "", type: "string"}],
		stateMutability: "view",
		type: "function",
	},
] as const;
