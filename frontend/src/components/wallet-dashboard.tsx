"use client";

import {useState, useEffect} from "react";
import {Sidebar} from "@/components/sidebar";
import {Header} from "@/components/header";
import {BalanceCard} from "@/components/balance-card";
import {QuickActions} from "@/components/quick-actions";
import {AssetList} from "@/components/asset-list";
import {TransactionHistory} from "@/components/transaction-history";
import {SpendSaveWidget} from "@/components/spend-save-widget";
import {CrossChainTransfer} from "@/components/cross-chain-transfer";
import {SettingsPage} from "@/components/settings-page";
import {TransactionHistoryPage} from "@/components/transaction-history-page";
import {MobileMenu} from "@/components/mobile-menu";
import {TapTypes} from "@/types";
import {SwapWidget} from "@/components/swap-widget";
import {useContract} from "@/hooks/use-waffi-contract";

export interface WalletSettings {
	saveEnabled: boolean;
	savePercentage: number;
}

export function WalletDashboard() {
	const [activeTab, setActiveTab] = useState<TapTypes>("dashboard");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const {userData, defaultSavingsRate} = useContract();
	const [settings, setSettings] = useState<WalletSettings>({
		saveEnabled: true,
		savePercentage: 10,
	});

	// Sync settings with contract data when userData loads
	useEffect(() => {
		if (userData) {
			setSettings((prev) => {
				// Only update if values actually changed to prevent infinite loops
				if (
					prev.saveEnabled !== userData.isSavingEnabled ||
					prev.savePercentage !== userData.savingsRatePercent
				) {
					return {
						saveEnabled: userData.isSavingEnabled,
						savePercentage:
							userData.savingsRatePercent ?? prev.savePercentage,
					};
				}
				return prev;
			});
		}
	}, [userData?.isSavingEnabled, userData?.savingsRatePercent]);

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
			<MobileMenu
				isOpen={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
				activeTab={activeTab}
				setActiveTab={setActiveTab}
			/>
			<main className="flex-1 overflow-auto">
				<Header onMenuClick={() => setMobileMenuOpen(true)} />
				<div className="p-4 md:p-6 space-y-6">
					{activeTab === "dashboard" && (
						<>
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								<div className="lg:col-span-2 space-y-6">
									<BalanceCard />
									<QuickActions setActiveTab={setActiveTab} />
									<AssetList />
								</div>
								<div className="space-y-6">
									<SpendSaveWidget settings={settings} />
									<TransactionHistory
										onViewAll={() =>
											setActiveTab("history")
										}
									/>
								</div>
							</div>
						</>
					)}
					{activeTab === "transfer" && (
						<CrossChainTransfer settings={settings} />
					)}
					{activeTab === "savings" && (
						<div className="max-w-2xl">
							<h2 className="text-2xl font-bold text-foreground mb-6">
								Your Savings
							</h2>
							<SpendSaveWidget settings={settings} expanded />
						</div>
					)}
					{activeTab === "settings" && (
						<SettingsPage
							settings={settings}
							setSettings={setSettings}
						/>
					)}
					{activeTab === "history" && <TransactionHistoryPage />}
					{activeTab === "swap" && (
						<div className="max-w-2xl">
							<SwapWidget />
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
