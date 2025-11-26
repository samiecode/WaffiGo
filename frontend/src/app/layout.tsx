import type {Metadata, Viewport} from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "WaffiGo",
	description:
		"Spend & save on CELO with WaffiGo - the ultimate dApp for effortless payments and automatic savings.",
	other: {
		"fc:miniapp": JSON.stringify({
			version: "next",
			imageUrl: "https://your-app.com/embed-image",
			button: {
				title: `Launch Your App Name`,
				action: {
					type: "launch_miniapp",
					name: "Your App Name",
					url: "https://your-app.com",
					splashImageUrl: "https://your-app.com/splash-image",
					splashBackgroundColor: "#000000",
				},
			},
		}),
	},
};

export const viewport: Viewport = {
	themeColor: "#4bfa00",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}
             <Toaster />
        </Providers>
      </body>
    </html>
  );
}
