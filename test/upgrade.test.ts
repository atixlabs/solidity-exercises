import { expect } from "chai";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { ContractTransaction } from "ethers";

import { Airdrop, AirdroppableToken } from "../typechain";
import { defaultDeploy } from "./common-fixtures";
import { defaultMerkleTree, Leaf } from "./airdropMerkleTree";

declare module "mocha" {
  export interface Context {
    airdrop: Airdrop;
    token: AirdroppableToken;
    leaf: Leaf;
    tx: ContractTransaction;
    txs: ContractTransaction[];
  }
}

describe("Airdrop: Succesful merkle tree - default", function () {
  describe("GIVEN an airdroppable contract was deployed and set up and upgraded to remove the possibility to mint", function () {
    before(async function () {
      const { token, airdrop } = await defaultDeploy();
      this.token = token;
      this.airdrop = airdrop;
      const deployAdmin = await deployments.getOrNull("DefaultProxyAdmin");
      const { deployer } = await getNamedAccounts();
      if (deployAdmin === null) throw new Error("DefaultProxyAdmin not found, cannot continue");
      const newImplementationFactory = await ethers.getContractFactory("AirdroppableTokenV2");
      const newImplementation = await newImplementationFactory.connect(await ethers.getSigner(deployer)).deploy();
      const deployedAdmin = new ethers.Contract(deployAdmin.address, deployAdmin.abi).connect(
        await ethers.getSigner(deployer),
        // We do not have the typings for this, so we have to cast it to any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as any;
      await deployedAdmin.upgrade(this.token.address, newImplementation.address);
    });
    describe("WHEN someone presents a proof", function () {
      it("THEN the tx fails", async function () {
        const leaf = defaultMerkleTree.getLeaf(0);
        // `no reason string` means that the function was not found
        return expect(this.airdrop.claim(leaf.receiver, leaf.amount, defaultMerkleTree.getProof(0))).to.be.revertedWith(
          `Transaction reverted: function selector was not recognized and there's no fallback function`,
        );
      });
    });
  });
});
