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
} from "@mui/material";
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
  const [nftImage, setNftImage] = useState<string>("");
  const [explorerLink, setExplorerLink] = useState<string>("");

  const { connection } = useConnection();
  const { wallet, publicKey } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const isDesktop = useMediaQuery("(min-width: 1200px)");
  console.log(isDesktop);

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
      const mint = await metaplex?.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
      });

      const mintResponse = await mint?.response;
      if (mintResponse) {
        mint?.nft.json?.image ? setNftImage(mint?.nft.json?.image) : null;
        mint?.response.signature
          ? setExplorerLink(`https://solscan.io/tx/${mint?.response.signature}`)
          : null;

        setIsModalOpen(true);
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
      const cmPublicKey = new PublicKey(
        process.env["NEXT_PUBLIC_CANDYMACHINE_ID"] ?? ""
      );
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
      <TopBar>{isDesktop ? <WalletMultiButton /> : null}</TopBar>
      <MainBody>
        <NftModal
          isOpen={isModalOpen}
          explorerLink={explorerLink}
          onClose={handleClose}
          nftImage={nftImage}
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
            src={process.env["NEXT_PUBLIC_COLLECTION_IMAGE"]}
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
              {process.env["NEXT_PUBLIC_CM_NAME"]}
            </h1>
            <h2
              style={{
                color: "grey",
                marginBottom: isDesktop ? "64px" : "0px",
                marginBlockStart: "0px",
                fontWeight: 600,
                fontSize: "24px",
              }}
            >
              <>${price} $BONK Per NFT</>
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
                    background: "#512da8",
                    color: "white",
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
}

const NftModal: React.FC<ModalProps> = ({
  nftImage,
  isOpen,
  onClose,
  explorerLink,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {isLoading && <CircularProgress style={{ alignSelf: "center" }} />}
      <Box
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "flex-start",
          flexDirection: "column",
        }}
      >
        <DialogTitle>Bonkity Bonk Bonk</DialogTitle>
        <DialogContent>
          View your explorer{" "}
          {
            <Link target="_blank" href={explorerLink}>
              Link
            </Link>
          }
        </DialogContent>
        <img
          src={nftImage}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          style={{
            display: isLoading ? "none" : "block",
            height: "100%",
            width: "100%",
            padding: "16px",
          }}
        />
        <Button
          style={{
            margin: "8px",
            alignSelf: "center",
            background: "black",
            color: "white",
            borderRadius: "100px",
            textTransform: "none",
            width: "35%",
            minWidth: "36.5px",
          }}
          variant="contained"
          color="primary"
          onClick={onClose}
        >
          Close Modal
        </Button>
      </Box>
    </Dialog>
  );
};

interface ImageWithLoadingIndicatorProps {
  src: string;
}
const ImageWithLoadingIndicator: React.FC<ImageWithLoadingIndicatorProps> = ({
  src,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <CircularProgress style={{ alignSelf: "center" }} />}
      <img
        src={src}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        style={{
          display: isLoading ? "none" : "block",
          height: "100%",
          width: "100%",
          padding: "16px",
        }}
      />
    </>
  );
};

const PageWrapper = styled(Box)`
  height: 100vh;
  width: 100vw;
  background: white;
  display: flex;
  flex-direction: column;
`;

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
  padding: "16px",
  marginRight: "0px",
  alignItems: "center",
  flexDirection: "column",
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
  border: "2px solid rgba(185, 195, 199)",
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
  },
}));

const HeroTitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
  justifyContent: "center",
  padding: "16px",

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    marginRight: "60px",
    width: "100%",
    alignItems: "flex-start",
  },
}));
