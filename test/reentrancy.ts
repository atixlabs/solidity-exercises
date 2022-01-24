import { ethers, waffle, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { expect } from "chai";

import { fixtureDeployedVault } from "./common-fixtures";
import { Attacker__factory, Vault } from "../typechain";

const { loadFixture } = waffle;
// DO NOT Modify this, you should correct the Vault contract
describe("Feature: Vault can deposit and withdraw", () => {
  let vault: Vault;
  let firstDepositer: Address;
  let secondDepositer: Address;
  const amount = ethers.utils.parseEther("1");

  describe("GIVEN a Vault contract was created and two users deposited", async () => {
    before(async () => {
      vault = await loadFixture(fixtureDeployedVault);
      ({ firstDepositer, secondDepositer } = await getNamedAccounts());
      const txData = {
        to: vault.address,
        value: amount,
      };
      await (await ethers.getSigner(firstDepositer)).sendTransaction(txData);
    });

    // Your goal is to fix this test by fixing the Vault contract
    describe("WHEN an attacker tries to do a reentrancy attack", async () => {
      it("THEN the contract balance does not change and the attack is unsuccesful", async () => {
        const attackerFactory = new Attacker__factory(await ethers.getSigner(secondDepositer));
        const attacker = await attackerFactory.deploy();
        const tx = await attacker.attack(vault.address, { value: amount });
        return expect(tx).to.changeEtherBalance(vault, 0);
      });
    });
  });
});
