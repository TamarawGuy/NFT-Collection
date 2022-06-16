const { ethers } = require("hardhat");
require("dotenv").config();
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  const whiteListContract = WHITELIST_CONTRACT_ADDRESS;
  const metadataURL = METADATA_URL;

  const NftCollection = await ethers.getContractFactory("NftCollection");
  const nftCollection = await NftCollection.deploy(
    metadataURL,
    whiteListContract
  );
  await nftCollection.deployed();

  console.log(`Shiki Devs Contract Address: ${nftCollection.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
