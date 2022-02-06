import { deployments } from "hardhat";
import { GuessTheNumber } from "../typechain";

export function fixtureDeployedGuessTheNumber(choice: number, salt: string): () => Promise<GuessTheNumber> {
  return deployments.createFixture(async ({ deployments, getNamedAccounts, ethers }) => {
    await deployments.fixture();
    const { guesser } = await getNamedAccounts();

    const deployedContract = await deployments.getOrNull("GuessTheNumber");
    if (deployedContract == undefined) throw new Error("No GuessTheNumber deployed. Something weird happened");
    const guessTheNumber = (await ethers.getContractAt("GuessTheNumber", deployedContract.address)) as GuessTheNumber;
    await guessTheNumber.initialize(
      ethers.utils.solidityKeccak256(["uint256", "uint256"], [choice, salt]),
      guesser,
      10000,
    );
    return guessTheNumber;
  });
}
