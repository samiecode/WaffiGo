import {celo, celoSepolia, celoAlfajores} from "wagmi/chains";

export const CONTRACT_ADDRESS = process.env
	.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const SPEND_AND_SAVE_ABI = [
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_defaultSavingsRateBps",
				type: "uint256",
			},
		],
		stateMutability: "nonpayable",
		type: "constructor",
	},
	{
		inputs: [{internalType: "address", name: "owner", type: "address"}],
		name: "OwnableInvalidOwner",
		type: "error",
	},
	{
		inputs: [{internalType: "address", name: "account", type: "address"}],
		name: "OwnableUnauthorizedAccount",
		type: "error",
	},
	{inputs: [], name: "ReentrancyGuardReentrantCall", type: "error"},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "newCeloSwap",
				type: "address",
			},
		],
		name: "CeloSwapUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "newRateBps",
				type: "uint256",
			},
		],
		name: "DefaultSavingsRateUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "previousOwner",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newOwner",
				type: "address",
			},
		],
		name: "OwnershipTransferred",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "SavingsWithdrawn",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "celoIn",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tokenOut",
				type: "uint256",
			},
		],
		name: "SwappedCeloToToken",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "token",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "tokenIn",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "celoOut",
				type: "uint256",
			},
		],
		name: "SwappedTokenToCelo",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "sender",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "recipient",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amountSent",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amountSaved",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "effectiveRateBps",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "timestamp",
				type: "uint256",
			},
		],
		name: "TransferCompleted",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "bool",
				name: "enabled",
				type: "bool",
			},
		],
		name: "UserSavingsEnabledUpdated",
		type: "event",
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "user",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "newRateBps",
				type: "uint256",
			},
		],
		name: "UserSavingsRateUpdated",
		type: "event",
	},
	{
		inputs: [],
		name: "DEFAULT_SAVINGS_ENABLED",
		outputs: [{internalType: "bool", name: "", type: "bool"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "celoSwap",
		outputs: [
			{internalType: "contract ICeloSwap", name: "", type: "address"},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "defaultSavingsRateBps",
		outputs: [{internalType: "uint256", name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getContractBalance",
		outputs: [{internalType: "uint256", name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{internalType: "address", name: "tokenIn", type: "address"},
			{internalType: "uint256", name: "tokenAmount", type: "uint256"},
		],
		name: "getEstimatedCeloForToken",
		outputs: [{internalType: "uint256", name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{internalType: "address", name: "tokenOut", type: "address"},
			{internalType: "uint256", name: "celoAmount", type: "uint256"},
		],
		name: "getEstimatedTokenForCelo",
		outputs: [{internalType: "uint256", name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{internalType: "address", name: "account", type: "address"}],
		name: "getUserData",
		outputs: [
			{internalType: "uint256", name: "totalSpent", type: "uint256"},
			{internalType: "uint256", name: "totalSaved", type: "uint256"},
			{
				internalType: "uint256",
				name: "effectiveRateBps",
				type: "uint256",
			},
			{
				internalType: "bool",
				name: "isSavingEnabled",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{internalType: "address", name: "user", type: "address"}],
		name: "getUserTransactionCount",
		outputs: [{internalType: "uint256", name: "", type: "uint256"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{internalType: "address", name: "user", type: "address"}],
		name: "getUserTransactions",
		outputs: [
			{
				components: [
					{internalType: "address", name: "sender", type: "address"},
					{
						internalType: "address",
						name: "recipient",
						type: "address",
					},
					{
						internalType: "uint256",
						name: "amountSent",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "amountSaved",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "timestamp",
						type: "uint256",
					},
					{
						internalType: "uint256",
						name: "savingsRateBps",
						type: "uint256",
					},
				],
				internalType: "struct WaffiContract.Transaction[]",
				name: "",
				type: "tuple[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "owner",
		outputs: [{internalType: "address", name: "", type: "address"}],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "renounceOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{internalType: "address", name: "_celoSwap", type: "address"}],
		name: "setCeloSwap",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "uint256", name: "newRateBps", type: "uint256"},
		],
		name: "setDefaultSavingsRate",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{internalType: "bool", name: "enabled", type: "bool"}],
		name: "setSavingsEnabled",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "uint256", name: "newRateBps", type: "uint256"},
		],
		name: "setSavingsRate",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "uint256", name: "amountIn", type: "uint256"},
			{internalType: "uint256", name: "amountOutMin", type: "uint256"},
			{internalType: "uint256", name: "deadline", type: "uint256"},
		],
		name: "swapCUSDToCelo",
		outputs: [
			{internalType: "uint256", name: "amountOut", type: "uint256"},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "uint256", name: "amountOutMin", type: "uint256"},
			{internalType: "uint256", name: "deadline", type: "uint256"},
		],
		name: "swapCeloToCEUR",
		outputs: [
			{internalType: "uint256", name: "amountOut", type: "uint256"},
		],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "uint256", name: "amountOutMin", type: "uint256"},
			{internalType: "uint256", name: "deadline", type: "uint256"},
		],
		name: "swapCeloToCUSD",
		outputs: [
			{internalType: "uint256", name: "amountOut", type: "uint256"},
		],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "address", name: "tokenOut", type: "address"},
			{internalType: "uint256", name: "amountOutMin", type: "uint256"},
			{internalType: "uint256", name: "deadline", type: "uint256"},
		],
		name: "swapCeloToToken",
		outputs: [
			{internalType: "uint256", name: "amountOut", type: "uint256"},
		],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "address", name: "tokenIn", type: "address"},
			{internalType: "uint256", name: "amountIn", type: "uint256"},
			{internalType: "uint256", name: "amountOutMin", type: "uint256"},
			{internalType: "uint256", name: "deadline", type: "uint256"},
		],
		name: "swapTokenToCelo",
		outputs: [
			{internalType: "uint256", name: "amountOut", type: "uint256"},
		],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address payable",
				name: "recipient",
				type: "address",
			},
			{internalType: "uint256", name: "amountToSend", type: "uint256"},
		],
		name: "transfer",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [{internalType: "address", name: "newOwner", type: "address"}],
		name: "transferOwnership",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{internalType: "address", name: "", type: "address"},
			{internalType: "uint256", name: "", type: "uint256"},
		],
		name: "userTransactions",
		outputs: [
			{internalType: "address", name: "sender", type: "address"},
			{internalType: "address", name: "recipient", type: "address"},
			{internalType: "uint256", name: "amountSent", type: "uint256"},
			{internalType: "uint256", name: "amountSaved", type: "uint256"},
			{internalType: "uint256", name: "timestamp", type: "uint256"},
			{internalType: "uint256", name: "savingsRateBps", type: "uint256"},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{internalType: "address", name: "", type: "address"}],
		name: "users",
		outputs: [
			{internalType: "uint256", name: "totalSpent", type: "uint256"},
			{internalType: "uint256", name: "totalSaved", type: "uint256"},
			{internalType: "uint256", name: "savingsRateBps", type: "uint256"},
			{internalType: "bool", name: "isSavingEnabled", type: "bool"},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "withdrawSavings",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
] as const;

export const CELO_MAINNET = {
	chainId: celo.id,
	chainName: celo.name,
	rpcUrls: celo.rpcUrls.default.http,
	nativeCurrency: celo.nativeCurrency,
	blockExplorerUrls: celo.blockExplorers?.default.url
		? [celo.blockExplorers.default.url]
		: [],
};

export const CELO_SEPOLIA = {
	chainId: celoSepolia.id,
	chainName: celoSepolia.name,
	rpcUrls: celoSepolia.rpcUrls.default.http,
	nativeCurrency: celoSepolia.nativeCurrency,
	blockExplorerUrls: celoSepolia.blockExplorers?.default.url
		? [celoSepolia.blockExplorers.default.url]
		: [],
};
