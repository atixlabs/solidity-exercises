import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (_hre: HardhatRuntimeEnvironment) => {
  await _hre.deployments.deploy("PaymentChannel", {
    args: [],
    from: await _hre.getNamedAccounts().then(accounts => accounts.deployer),
  });
};

deployFunc.id = "deployed_channel"; // id required to prevent reexecution
deployFunc.tags = ["PaymentChannel", "Implementation"];

export default deployFunc;
