import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  await deploy("Airdrop", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
    },
  });
};
export default deployFunc;

deployFunc.id = "deployed_Airdrop"; // id required to prevent reexecution
