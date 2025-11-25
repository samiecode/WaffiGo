'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';

import { config } from '../lib/wagmi';

const client = new QueryClient();

function RootProvider({children}: {children: React.ReactNode}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider theme={darkTheme({
                    accentColor: "hsl(var(--primary))",
                    accentColorForeground: "hsl(var(--primary-foreground))",
                    borderRadius: "medium",
                  })}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default RootProvider;