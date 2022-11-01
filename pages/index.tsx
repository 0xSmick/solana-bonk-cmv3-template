import { CandyMachine, PublicKey } from "@metaplex-foundation/js";
import { Box, CircularProgress, styled } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSnackbar } from "notistack";
import {
  guestIdentity,
  Metaplex,
  walletAdapterIdentity,
} from "@metaplex-foundation/js";

export default function Home() {
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [mintLoading, setMintLoading] = useState<boolean>(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachine | undefined>();

  const { connection } = useConnection();
  const { wallet, publicKey } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const metaplex = useMemo(() => {
    return connection
      ? Metaplex.make(connection)?.use(
          wallet ? walletAdapterIdentity(wallet.adapter) : guestIdentity()
        )
      : null;
  }, [wallet, connection]);

  const onMintClick = async () => {
    setMintLoading(true);
    try {
      if (!candyMachine) throw new Error("No CandyMachine");
      await metaplex?.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
      });
      enqueueSnackbar("You've successfully minted an NFT!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } catch (error) {
      console.error("Mint Error", error);
      enqueueSnackbar("Mint Error: Check console logs for more details", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
    setMintLoading(false);
  };

  const getCandyMachine = async () => {
    setPageLoading(true);
    try {
      const cmPublicKey = new PublicKey(
        process.env["NEXT_PUBLIC_CANDYMACHINE_ID"] ?? ""
      );
      const candyMachine = await metaplex
        ?.candyMachines()
        .findByAddress({ address: cmPublicKey });
      if (!candyMachine) throw new Error("No Candymachine at address");
      setCandyMachine(candyMachine);
    } catch (error) {
      console.log("Fetching CM Error", error);
      enqueueSnackbar(
        "Fetching CM Error: Check console logs for more details",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
    }

    setPageLoading(false);
  };

  useEffect(() => {
    getCandyMachine();
  }, []);

  return (
    <PageWrapper>
      <TopBar>
        <WalletMultiButton />
      </TopBar>
      <MainBody>
        {pageLoading ? (
          <CircularProgress />
        ) : (
          <LoadingButton
            size="large"
            loading={mintLoading}
            onClick={onMintClick}
            disabled={!candyMachine || !publicKey}
          >
            Mint!
          </LoadingButton>
        )}
      </MainBody>
    </PageWrapper>
  );
}

const PageWrapper = styled(Box)`
  height: 100vh;
  width: 100vw;
  background: ${({ theme }) => theme.palette.grey[900]};
`;

const TopBar = styled(Box)`
  display: flex;
  justify-content: flex-end;
  padding: 12px;
`;

const MainBody = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
`;
