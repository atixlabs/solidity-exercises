import { ethers, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { expect } from "chai";

import { fixtureDeployedGuessTheNumber } from "./common-fixtures";
import { GuessTheNumber } from "../typechain";

describe("Feature: GuessTheNumber - Invalid Reveals", () => {
  let guessTheNumber: GuessTheNumber;
  let chooser: Address;
  let guesser: Address;

  const choice = 1;
  const wrongChoice = 2;
  const salt = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const wrongSalt = "0x1234567890123456789012345678901234567890123456789012345678904123";
  const fixtureDeploy = fixtureDeployedGuessTheNumber(choice, salt);

  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed)", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());

      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(choice);
    });

    describe("WHEN another number is revealed", async () => {
      it("THEN the tx reverts", async () => {
        const chooserSigner = await ethers.getSigner(chooser);
        return expect(guessTheNumber.connect(chooserSigner).reveal(wrongChoice, salt)).to.be.revertedWith(
          "Commitment does not match",
        );
      });
    });
  });
  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed)", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());

      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(choice);
    });

    describe("WHEN the chosen number is revealed but with another salt", async () => {
      it("THEN the tx reverts", async () => {
        const chooserSigner = await ethers.getSigner(chooser);
        return expect(guessTheNumber.connect(chooserSigner).reveal(choice, wrongSalt)).to.be.revertedWith(
          "Commitment does not match",
        );
      });
    });
  });

  describe("GIVEN a GuessTheNumber was just created", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser } = await getNamedAccounts());
    });

    describe("WHEN the chooser wants to reveal", async () => {
      it("THEN the tx reverts", async () => {
        const chooserSigner = await ethers.getSigner(chooser);
        return expect(guessTheNumber.connect(chooserSigner).reveal(choice, salt)).to.be.revertedWith(
          "Cannot reveal now",
        );
      });
    });
  });
});
