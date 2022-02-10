import { deployments } from "hardhat";

export function createFixtureDeployContract(): () => Promise<void> {
  return deployments.createFixture(async function () {
    await deployments.fixture();
    // TODO return your own contract and change the signature of createFixtureDeployContract
    // so that it returns a function that returns your contract
  });
}
