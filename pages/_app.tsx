import type { AppProps } from "next/app";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import React, { useMemo } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import { createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SnackbarProvider } from "notistack";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const network = process.env["NEXT_PUBLIC_SOLANA_NETWORK"]
    ? (process.env["NEXT_PUBLIC_SOLANA_NETWORK"] as WalletAdapterNetwork)
    : ("devnet" as WalletAdapterNetwork);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    []
  );

  return (
    <>
      <CssBaseline />
      <SnackbarProvider>
        <ConnectionProvider endpoint={clusterApiUrl(network)}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Component {...pageProps} />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </SnackbarProvider>
    </>
  );
}
