import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (!hre.network.live) // only deployed for tests
    await hre.deployments.deploy("MockToken", {
      args: [],
      from: await hre.getNamedAccounts().then(accounts => accounts.deployer),
    });
};

deployFunc.id = "deployed_token"; // id required to prevent reexecution
deployFunc.tags = ["MockToken"];

export default deployFunc;
