import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  if (!hre.network.live)
    // only deployed for tests
    await hre.deployments.deploy("MyERC721", {
      args: ["MyERC721", "NFT", [1, 2, 3, 4, 5, 10000]],
      from: await hre.getNamedAccounts().then(accounts => accounts.deployer),
    });
};

deployFunc.id = "deployed_token"; // id required to prevent reexecution
deployFunc.tags = ["MyERC721"];

export default deployFunc;
