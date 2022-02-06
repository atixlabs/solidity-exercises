import { getNamedAccounts, ethers } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";

import { fixtureDeployedGuessTheNumber } from "./common-fixtures";
import { GuessTheNumber } from "../typechain";
import { expect } from "chai";

describe("Feature: GuessTheNumber - Invalid guesses", () => {
  let guessTheNumber: GuessTheNumber;
  let chooser: Address;
  let guesser: Address;

  const choice = 1;
  const salt = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const fixtureDeploy = fixtureDeployedGuessTheNumber(choice, salt);
  describe("GIVEN a GuessTheNumber contract was just created", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());
    });

    describe("WHEN the guessed number is below 1", async () => {
      it("THEN the tx reverts", async () => {
        const guesserSigner = await ethers.getSigner(guesser);
        return expect(guessTheNumber.connect(guesserSigner).guessValue(0)).to.be.revertedWith("Invalid guess");
      });
    });
  });
  describe("GIVEN a GuessTheNumber contract was just created", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());
    });

    describe("WHEN the guessed number is above 6", async () => {
      it("THEN the tx reverts", async () => {
        const guesserSigner = await ethers.getSigner(guesser);
        return expect(guessTheNumber.connect(guesserSigner).guessValue(7)).to.be.revertedWith("Invalid guess");
      });
    });
  });

  describe("GIVEN a GuessTheNumber was just created", async () => {
    before(async () => {
      ({ chooser, guesser } = await getNamedAccounts());
      guessTheNumber = await fixtureDeploy();
    });

    describe("WHEN the chooser wants to guess", async () => {
      it("THEN the tx reverts", async () => {
        const chooserSigner = await ethers.getSigner(chooser);

        return expect(guessTheNumber.connect(chooserSigner).guessValue(1)).to.be.revertedWith("Only guesser can guess");
      });
    });
  });

  describe("GIVEN a GuessTheNumber was just created", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());
    });

    describe("WHEN a non-player account wants to guess", async () => {
      it("THEN the tx reverts", async () => {
        const { anotherUser } = await getNamedAccounts();
        const anotherUserSigner = await ethers.getSigner(anotherUser);
        return expect(guessTheNumber.connect(anotherUserSigner).guessValue(1)).to.be.revertedWith(
          "Only guesser can guess",
        );
      });
    });
  });
});
