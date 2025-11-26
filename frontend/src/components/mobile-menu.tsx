"use client";

import {
	X,
	LayoutDashboard,
	ArrowUpRight,
	PiggyBank,
	Settings,
	History,
	HelpCircle,
	LogOut,
	ArrowDownUp,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import { TapTypes } from "@/types";

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
	activeTab: string;
	setActiveTab: (
		tab:
			TapTypes
	) => void;
}

export function MobileMenu({
	isOpen,
	onClose,
	activeTab,
	setActiveTab,
}: MobileMenuProps) {
	const navItems = [
		{id: "dashboard", label: "Dashboard", icon: LayoutDashboard},
		{id: "transfer", label: "Send", icon: ArrowUpRight},
		{id: "swap", label: "Swap", icon: ArrowDownUp},
		{id: "savings", label: "Savings", icon: PiggyBank},
		{id: "history", label: "History", icon: History},
		{id: "settings", label: "Settings", icon: Settings},
	];

	const handleNavClick = (id: TapTypes) => {
		setActiveTab(id);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
				onClick={onClose}
			/>

			{/* Menu panel */}
			<div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border z-50 md:hidden flex flex-col animate-in slide-in-from-left duration-300">
				{/* Header */}
				<div className="p-6 border-b border-border flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
							<span className="text-primary-foreground font-bold text-lg">
								WG
							</span>
						</div>
						<div>
							<h1 className="font-bold text-foreground">
								WaffiGo
							</h1>
							<p className="text-xs text-muted-foreground">
								Web3 Wallet
							</p>
						</div>
					</div>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4 space-y-2">
					{navItems.map((item) => (
						<button
							key={item.id}
							onClick={() => handleNavClick(item.id as TapTypes)}
							className={cn(
								"w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
								activeTab === item.id
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:text-foreground hover:bg-secondary"
							)}
						>
							<item.icon className="w-5 h-5" />
							{item.label}
						</button>
					))}
				</nav>

				{/* Bottom actions */}
				<div className="p-4 border-t border-border space-y-2">
					<Button
						variant="ghost"
						className="w-full justify-start gap-3 text-muted-foreground"
					>
						<HelpCircle className="w-5 h-5" />
						Help
					</Button>
					<Button
						variant="ghost"
						className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
					>
						<LogOut className="w-5 h-5" />
						Disconnect
					</Button>
				</div>
			</div>
		</>
	);
}
