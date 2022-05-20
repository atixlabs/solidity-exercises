import { deployments } from "hardhat";
import { MyERC721__factory } from "../typechain";

export const deployFixture = deployments.createFixture(async function () {
  await deployments.fixture();
  const deployResult = await deployments.getOrNull("MyERC721");
  if (deployResult === null) throw new Error("MyERC721 not deployed");
  const myERC721Factory = new MyERC721__factory();
  const myERC721 = myERC721Factory.attach(deployResult.address);
  return myERC721;
});
