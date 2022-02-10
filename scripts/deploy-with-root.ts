import { task } from "hardhat/config";

task("deployWithRoot")
  .addPositionalParam("root")
  .setAction(async (taskArguments, hre) => {
    await hre.run("deploy");
    const deploy = await hre.deployments.getOrNull("Airdrop");
    if (deploy === null) throw new Error("Airdrop not deployed");
    const airdrop = (await hre.ethers.getContractFactory("Airdrop")).attach(deploy.address);
    return airdrop.setRoot(taskArguments.root);
  });
