import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const airdropDeploy = await hre.deployments.getOrNull("Airdrop");
  if (airdropDeploy === null) throw new Error("Airdrop not deployed");
  await deploy("AirdroppableToken", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "__AirdroppableToken_init",
        args: ["AirdropToken", "ADT", airdropDeploy.address],
      },
    },
  });
};
export default deployFunc;

deployFunc.id = "deployed_AirdroppableToken"; // id required to prevent reexecution
