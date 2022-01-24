import { ethers, waffle, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { expect } from "chai";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import { fixtureDeployedVault } from "./common-fixtures";
import { Vault } from "../typechain";
import { ContractTransaction } from "ethers";

const { loadFixture } = waffle;

describe("Feature: Vault can deposit and withdraw", () => {
  let vault: Vault;
  let firstDepositer: Address;
  let secondDepositer: Address;
  const amount = ethers.utils.parseEther("1");
  const secondAmount = ethers.utils.parseEther("1");

  describe("GIVEN a Vault contract was created", async () => {
    let tx: TransactionResponse;
    before(async () => {
      vault = await loadFixture(fixtureDeployedVault);
      ({ firstDepositer } = await getNamedAccounts());
    });

    describe("WHEN a user deposits", async () => {
      before(async () => {
        const txData = {
          to: vault.address,
          value: amount,
        };
        tx = await (await ethers.getSigner(firstDepositer)).sendTransaction(txData);
      });
      it("THEN an event is emitted", async () => {
        return expect(tx).to.emit(vault, "Deposited").withArgs(firstDepositer, amount);
      });
      it("THEN the balance of the user decreased", async () => {
        return expect(tx).to.changeEtherBalance(await ethers.getSigner(firstDepositer), amount.mul(-1));
      });

      it("THEN the balance of the contract increased", async () => {
        return expect(tx).to.changeEtherBalance(vault, amount);
      });

      it("THEN the user has that much balance in the contract", async () => {
        return expect(await vault.balance(firstDepositer)).to.be.equal(amount);
      });
    });
  });

  describe("GIVEN a Vault contract was created and someone deposited", async () => {
    let tx: ContractTransaction;
    before(async () => {
      vault = await loadFixture(fixtureDeployedVault);
      ({ firstDepositer, secondDepositer } = await getNamedAccounts());
      const txData = {
        to: vault.address,
        value: amount,
      };
      await (await ethers.getSigner(firstDepositer)).sendTransaction(txData);
    });

    describe("WHEN another user tries to withdraw", async () => {
      before(async () => {
        const vaultSecondDepositer: Vault = await vault.connect(await ethers.getSigner(secondDepositer));
        tx = await vaultSecondDepositer.withdraw();
      });
      it("THEN an event is emitted with balance equal to 0", async () => {
        return expect(tx).to.emit(vault, "Withdrawn").withArgs(secondDepositer, 0);
      });
    });
  });

  describe("GIVEN a Vault contract was created and someone deposited", async () => {
    before(async () => {
      vault = await loadFixture(fixtureDeployedVault);
      ({ firstDepositer, secondDepositer } = await getNamedAccounts());
      const txData = {
        to: vault.address,
        value: amount,
      };
      await (await ethers.getSigner(firstDepositer)).sendTransaction(txData);
    });

    describe("WHEN another user deposits", async () => {
      let tx: TransactionResponse;
      before(async () => {
        const txData = {
          to: vault.address,
          value: secondAmount,
        };
        tx = await (await ethers.getSigner(secondDepositer)).sendTransaction(txData);
      });
      it("THEN an event is emitted", async () => {
        return expect(tx).to.emit(vault, "Deposited").withArgs(secondDepositer, secondAmount);
      });
      it("THEN the balance of the user decreased", async () => {
        return expect(tx).to.changeEtherBalance(await ethers.getSigner(secondDepositer), secondAmount.mul(-1));
      });

      it("THEN the balance of the contract increased", async () => {
        return expect(tx).to.changeEtherBalance(vault, secondAmount);
      });

      it("THEN the user has that much balance in the contract", async () => {
        return expect(await vault.balance(secondDepositer)).to.be.equal(secondAmount);
      });
      it("THEN the first depositer has its balance left intact", async () => {
        return expect(await vault.balance(firstDepositer)).to.be.equal(amount);
      });
    });
  });
});
