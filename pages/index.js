import { ethers, providers, utils } from "ethers";
import Web3Modal from "web3modal";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import NftCollection from "../artifacts/contracts/NftCollection.sol/NftCollection.json";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef();

  const NFT_CONTRACT_ADDRESS = "0x55284BDdCed3a5674B61D0fF75eB83019De00ce1";
  const abi = NftCollection.abi;

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      alert("Change to Rinkeby network");
      throw new Error("Change to Rinkeby network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  const presaleMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await nftContract.presaleMint({
        value: ethers.utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("You successfully minted Shiki Dev NFT");
    } catch (error) {
      console.log(error);
    }
  };

  const publicMint = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await nftContract.mint({
        value: ethers.utils.parseEther("0.01"),
      });
      setLoading(true);
      await tx.wait();
      setLoading(false);
      alert("You successfully minted a Shiki Dev NFT");
    } catch (error) {
      console.log(error);
    }
  };

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      await checkIfPresaleStarted();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _presaleStarted = await nftContract.presaleStarted();

      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _presaleEnded = await nftContract.presaleEnded();
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _owner = await nftContract.owner();
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _tokenIds = await nftContract.tokenIds();
      setTokenIdsMinted(_tokenIds.toString());
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      const _presaleStarted = checkIfPresaleStarted();
      if (_presaleStarted) {
        checkIfPresaleEnded();
      }
      getTokenIdsMinted();

      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);
    }

    setInterval(async function () {
      await getTokenIdsMinted();
    }, 5 * 1000);
  }, [walletConnected]);

  const Button = () => {
    if (!walletConnected) {
      return (
        <button className={styles.button} onClick={() => connectWallet()}>
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (iwOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={() => startPresale()}>
          Start presale!
        </button>
      );
    }

    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale has not started!</div>
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Shiki
            Dev
          </div>
          <button className={styles.button} onClick={() => presaleMint()}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }
  };

  if (presaleStarted && presaleEnded) {
    <button className={styles.button} onClick={() => publicMint()}>
      Public Mint!
    </button>;
  }

  return (
    <div>
      <Head>
        <title>Shiki Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Shiki Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {Button()}
        </div>
      </div>
    </div>
  );
}
