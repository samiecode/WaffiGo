function withValidProperties(
	properties: Record<string, undefined | string | string[]>
) {
	return Object.fromEntries(
		Object.entries(properties).filter(([_, value]) =>
			Array.isArray(value) ? value.length > 0 : !!value
		)
	);
}

export async function GET() {
	const URL = process.env.NEXT_PUBLIC_APP_URL as string;
	return Response.json({
		accountAssociation: {
			header: "eyJmaWQiOjgzODM5NCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGNCMDEyNEM0MTlDMTFBNDVBQmQwNGI4OGM0NjQxMmE3RUQwQTIyNzAifQ",
			payload: "eyJkb21haW4iOiJ3YWZmaS1nby52ZXJjZWwuYXBwIn0",
			signature:
				"3s0LsNWrOjfJGuBTAX2E+7WzwfPKQnZ9iK3nhzQp108PvQYzFrEDPHAe+651VQAWqX/6jjfQCQqafd56LhAaPxw=",
		},
		baseBuilder: {
			ownerAddress: "0x274a0F1a24E5Ca748fc5366C2c3833AA840fbf6E", // add your Base Account address here
		},
		miniapp: {
			version: "1",
			name: process.env.NEXT_PUBLIC_APP_NAME,
			homeUrl: URL,
			iconUrl: `${URL}/icon.png`,
			splashImageUrl: `${URL}/l.png`,
			splashBackgroundColor: "#000000",
			webhookUrl: `${URL}/api/webhook`,
			subtitle: "Web3 Wallet",
			description:
				"Spend & save on CELO with WaffiGo. The ultimate dApp for effortless payments and automatic savings.",
			screenshotUrls: [
				"https://ex.co/s1.png",
				"https://ex.co/s2.png",
				"https://ex.co/s3.png",
			],
			primaryCategory: "finance",
			tags: ["example", "miniapp", "celoapp", "baseapp"],
			heroImageUrl: `${URL}/og.png`,
			tagline: "Play instantly",
			ogTitle: process.env.NEXT_PUBLIC_APP_NAME,
			ogDescription: "Challenge friends in real time.",
			ogImageUrl: `${URL}/og.png`,
			noindex: true,
		},
	}); // see the next step for the manifest_json_object
}
