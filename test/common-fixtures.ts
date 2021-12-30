import { ethers, deployments } from "hardhat";
import { WETH } from "../typechain";

export async function fixtureDeployedWETH(): Promise<WETH> {
  await deployments.fixture();
  const deployedContract = await deployments.getOrNull("WETH");
  if (deployedContract == undefined) throw new Error("No WETH deployed. Something weird happened");
  const weth = await ethers.getContractAt("WETH", deployedContract.address);
  return weth as WETH;
}
