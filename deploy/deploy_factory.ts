import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const paymentChannel = await hre.deployments.getOrNull("PaymentChannel");
  if (paymentChannel === null) throw new Error("Implmenation not deployed");
  await hre.deployments.deploy("PaymentChannelsFactory", {
    args: [paymentChannel.address],
    from: await hre.getNamedAccounts().then(accounts => accounts.deployer),
  });
};

deployFunc.id = "deployed_factory"; // id required to prevent reexecution
deployFunc.tags = ["Factory"];
deployFunc.dependencies = ["Implementation"];

export default deployFunc;
