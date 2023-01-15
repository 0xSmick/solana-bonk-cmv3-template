import { CandyMachine, PublicKey } from "@metaplex-foundation/js";
import {
  Box,
  CircularProgress,
  styled,
  Button,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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
  const [candyMachine, setCandyMachine] = useState<CandyMachine | undefined>();
  const [itemsRemaining, setItemsRemaining] = useState<string>();
  const [price, setPrice] = useState<Number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [nftImage, setNftImage] = useState<string>("");
  const [explorerLink, setExplorerLink] = useState<string>("");

  const { connection } = useConnection();
  const { wallet, publicKey } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const CM_ID = "5hbBGAP6pgwLKVpQVvwZKR4B1VV8zchHTqggCQBgVCpT";
  const CM_NAME = "Bonkaplex";

  const handleClose = () => {
    setIsModalOpen(false);
    console.log(isModalOpen);
  };

  const metaplex = useMemo(() => {
    return connection
      ? Metaplex.make(connection)?.use(
          wallet ? walletAdapterIdentity(wallet.adapter) : guestIdentity()
        )
      : null;
  }, [wallet, connection]);

  const onMintClick = async () => {
    try {
      if (!candyMachine) throw new Error("No CandyMachine");
      setIsModalOpen(true);
      setIsFetching(true);
      const mint = await metaplex?.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
      });

      const mintResponse = await mint?.response;
      setIsFetching(false);
      if (mintResponse) {
        mint?.nft.json?.image ? setNftImage(mint?.nft.json?.image) : null;
        mint?.response.signature
          ? setExplorerLink(`https://solscan.io/tx/${mint?.response.signature}`)
          : null;
      }
      getCandyMachine();
    } catch (error) {
      console.error("Mint Error", error);
      enqueueSnackbar("Mint Error: Check console logs for more details", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  const getCandyMachine = async () => {
    setPageLoading(true);
    try {
      const cmPublicKey = new PublicKey(CM_ID ?? "");
      const candyMachine = await metaplex
        ?.candyMachines()
        .findByAddress({ address: cmPublicKey });

      console.log(candyMachine);
      if (!candyMachine) throw new Error("No Candymachine at address");
      setCandyMachine(candyMachine);
      setItemsRemaining(candyMachine?.itemsRemaining.toString());
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

  useEffect(() => {
    if (!candyMachine) return;
    const price = Number(
      candyMachine?.candyGuard?.guards.tokenPayment?.amount.basisPoints.toString()
    );
    setPrice(price / 1000000000);
    console.log(price);
  }, [candyMachine]);

  return (
    <PageWrapper>
      {isDesktop ? (
        <TopBar>
          <WalletMultiButton style={{ background: "black", color: "white" }} />
        </TopBar>
      ) : null}
      <MainBody>
        <NftModal
          isOpen={isModalOpen}
          explorerLink={explorerLink}
          onClose={handleClose}
          nftImage={nftImage}
          isFetching={isFetching}
        />
        <ImageBody>
          <img
            style={{
              maxHeight: "540px",
              maxWidth: "540px",
              height: "100%",
              width: "100%",
              justifySelf: isDesktop ? "flex-start" : "center",
            }}
            src="https://bonk-smick.s3.us-east-2.amazonaws.com/bonkagrid.png"
            alt="NFT"
          />
          <p
            style={{
              color: "grey",
              textAlign: "center",
              lineHeight: "32px",
              fontWeight: 600,
              fontSize: "20px",
              marginTop: "16px",
              marginBlockEnd: "0px",
            }}
          >
            {itemsRemaining} available
          </p>
        </ImageBody>

        {pageLoading ? (
          <CircularProgress />
        ) : (
          <HeroTitleContainer>
            <h1
              style={{
                color: "black",
                fontSize: "48px",
                marginBlockEnd: "0px",
                marginBlockStart: isDesktop ? ".67em" : "0px",
              }}
            >
              {CM_NAME}
            </h1>
            <Box
              style={{
                paddingRight: isDesktop ? "0px" : "16px",
                paddingLeft: isDesktop ? "0px" : "16px",
                textAlign: isDesktop ? "left" : "center",
              }}
            >
              <p style={{ color: "grey" }}>
                Bonkaplex is a selection of 69 images showcasing what Midjourney
                thinks of the word “bonk”. All $BONK raised will be burned.
              </p>
            </Box>
            <h2
              style={{
                color: "grey",
                marginBottom: isDesktop ? "64px" : "0px",
                marginBlockStart: "0px",
                fontWeight: 600,
                fontSize: "24px",
              }}
            >
              <>{price.toLocaleString()} $BONK per NFT</>
            </h2>
            <MintContainer>
              {publicKey ? (
                <MintButton
                  size="large"
                  onClick={onMintClick}
                  disabled={!candyMachine || !publicKey}
                >
                  <p
                    style={{
                      fontSize: "24px",
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    {publicKey ? "Mint" : "Connect Your Wallet"}
                  </p>
                </MintButton>
              ) : (
                <WalletMultiButton
                  style={{
                    color: "white",
                    background: "black",
                    width: "100%",
                    borderRadius: "100px",
                    textAlign: "center",
                    display: "inline-block",
                    height: "64px",
                  }}
                />
              )}
              {candyMachine?.candyGuard?.guards.mintLimit?.limit && (
                <h3
                  style={{
                    color: "black",
                    textAlign: "center",
                    fontSize: "16px",
                    textTransform: "none",
                    fontWeight: 400,
                    marginBlockEnd: "0px",
                  }}
                >
                  {candyMachine?.candyGuard?.guards.mintLimit?.limit} per wallet
                </h3>
              )}
            </MintContainer>
          </HeroTitleContainer>
        )}
      </MainBody>
    </PageWrapper>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftImage: string;
  explorerLink: string;
  isFetching: boolean;
}

const NftModal: React.FC<ModalProps> = ({
  nftImage,
  isOpen,
  onClose,
  explorerLink,
  isFetching,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Box
        style={{
          padding: "6x",
          display: "flex",
          justifyContent: "flex-start",
          flexDirection: "column",
          textAlign: "center",
          borderRadius: "4px",
        }}
      >
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          {!isFetching ? (
            <IconButton
              onClick={onClose}
              style={{ color: isFetching ? "white" : "black" }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </Box>
        <DialogTitle>
          {isFetching ? "Bonking..." : "You've been bonked, enjoy your NFT!"}
        </DialogTitle>
        {isFetching ? (
          <DialogContent>
            <img
              style={{
                display: "block",
                height: "100%",
                width: "100%",
                justifySelf: "center",
                padding: "16px",
                maxWidth: "520px",
                maxHeight: "520px",
              }}
              src={process.env["NEXT_PUBLIC_COLLECTION_IMAGE"]}
              alt="NFT"
            />
            Which one will you get?
          </DialogContent>
        ) : (
          <DialogContent>
            <img
              src={nftImage}
              style={{
                display: "block",
                height: "100%",
                width: "100%",
                padding: "16px",
              }}
            />
            <Link target="_blank" href={explorerLink}>
              View the details here
            </Link>
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

const PageWrapper = styled(Box)(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  background: "white",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  marginTop: "16px",
  [theme.breakpoints.up("lg")]: {
    overflow: "auto",
  },
}));

const TopBar = styled(Box)`
  display: flex;
  justify-content: flex-end;
  padding: 12px;
`;

const MainBody = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
  alignSelf: "center",

  [theme.breakpoints.up("lg")]: {
    flexDirection: "row",
  },
}));

const ImageBody = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: "16px, 16px, 0px, 16px",
  marginRight: "0px",
  alignItems: "center",
  flexDirection: "column",
  width: "75%",
  height: "75%",
  flex: 1,

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    marginRight: "48px",
  },
}));

const MintButton = styled(Button)(({ theme }) => ({
  background: "black",
  color: "white",
  borderRadius: "100px",
  width: "100%",
  height: "64px",
  "&:hover": {
    color: "white",
    background: "#333333",
  },
  "&:disabled": {
    color: "white",
    background: "black",
  },

  [theme.breakpoints.up("lg")]: {
    padding: "32px 21px 32px 21px",
    alignSelf: "center",
    width: "100%",
  },
}));

const MintContainer = styled(Box)(({ theme }) => ({
  display: "flex",

  borderRadius: "16px",
  alignItems: "center",
  flexDirection: "column",
  padding: "32px 24px 32px 24px",
  maxWidth: "517px",
  width: "100%",

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    //marginRight: "60px",
    width: "100%",
    alignItems: "center",
    border: "2px solid rgba(185, 195, 199)",
  },
}));

const HeroTitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  width: "90%",
  justifyContent: "center",
  padding: "8px, 16px, 16px, 16px",

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    marginRight: "200px",
    width: "100%",
    maxWidth: "530px",
    alignItems: "flex-start",
  },
}));
