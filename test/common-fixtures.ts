import { deployments } from "hardhat";

import { Airdrop, AirdroppableToken } from "../typechain";
import { defaultMerkleTree } from "./airdropMerkleTree";

type BytesLike = ArrayLike<number> | string;

export function createFixtureDeployContract(
  root: BytesLike,
): () => Promise<{
  airdrop: Airdrop;
  token: AirdroppableToken;
}> {
  return deployments.createFixture(async function (hre) {
    const { Airdrop: airdropDeploy, AirdroppableToken: airdroppableTokenDeploy } = await deployments.fixture();
    const airdropFactory = await hre.ethers.getContractFactory("Airdrop");
    const tokenFactory = await hre.ethers.getContractFactory("AirdroppableToken");
    const airdrop = await airdropFactory.attach(airdropDeploy.address);
    const token = await tokenFactory.attach(airdroppableTokenDeploy.address);
    await airdrop.setRoot(root);
    return {
      airdrop,
      token,
    };
  });
}

export const defaultDeploy = createFixtureDeployContract(defaultMerkleTree.getRoot());
