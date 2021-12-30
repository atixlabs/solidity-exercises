import { ethers, waffle, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { expect } from "chai";
import { BigNumber } from "ethers";

import { fixtureDeployedWETH } from "./common-fixtures";
import { WETH } from "../typechain";

const { loadFixture } = waffle;

describe("Feature: WETH", () => {
  let weth: WETH;
  let deployer: Address;

  describe("GIVEN a WETH contract", async () => {
    before(async () => {
      weth = await loadFixture(fixtureDeployedWETH);
      ({ deployer } = await getNamedAccounts());
    });

    describe("Scenario: WETH contract deployment", async () => {
      describe("WHEN WETH is deployed", async () => {
        it("THEN should have an address", async () => {
          expect(weth.address).to.not.be.undefined;
        });
        it("AND should return balance 0", async () => {
          expect(await weth.balanceOf(deployer)).equal(BigNumber.from(0));
        });
      });
    });

    describe("Scenario: user can deposit ETH", async () => {
      const value = BigNumber.from(10);
      describe("WHEN a user deposit ETH", async () => {
        before(async () => {
          await weth.deposit({ value: value });
        });
        it("THEN WETH contract should have received the ETH", async () => {
          expect(await ethers.provider.getBalance(weth.address)).equal(value);
        });
        it("AND should return the amount deposited in WETH", async () => {
          expect(await weth.balanceOf(deployer)).equal(value);
        });
      });
    });
  });
});
