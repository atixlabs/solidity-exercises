import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (_hre: HardhatRuntimeEnvironment) => {
  // TODO deploy here
};
export default deployFunc;

deployFunc.id = "deployed_"; // id required to prevent reexecution
