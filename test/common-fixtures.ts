import { ethers, deployments } from "hardhat";
import { Vault } from "../typechain";

export async function fixtureDeployedVault(): Promise<Vault> {
  await deployments.fixture();
  const deployedContract = await deployments.getOrNull("Vault");
  if (deployedContract == undefined) throw new Error("No Vault deployed. Something weird happened");
  const vault = await ethers.getContractAt("Vault", deployedContract.address);
  return vault as Vault;
}
