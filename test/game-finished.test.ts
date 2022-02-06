import { getNamedAccounts, ethers } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { expect } from "chai";
import { ContractTransaction } from "ethers";

import { fixtureDeployedGuessTheNumber } from "./common-fixtures";
import { GuessTheNumber } from "../typechain";

const FINISHED_STATE = 3;
describe("Feature: GuessTheNumber - Completed", () => {
  let guessTheNumber: GuessTheNumber;
  let chooser: Address;
  let guesser: Address;
  let tx: ContractTransaction;

  const choice = 1;
  const wrongGuess = 2;
  const salt = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const fixtureDeploy = fixtureDeployedGuessTheNumber(choice, salt);
  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed) where the numbers differ", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());

      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(wrongGuess);
    });

    describe("WHEN the chosen number is revealed", async () => {
      before(async () => {
        tx = await guessTheNumber.reveal(choice, salt);
      });
      it("THEN an event signaling that the chooser won is emitted", async () => {
        return expect(tx).to.emit(guessTheNumber, "WinnerDeclared").withArgs(chooser);
      });
      it("THEN the game is finished", async () => {
        return expect(await guessTheNumber.gameState()).equal(FINISHED_STATE);
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed) where the commited number is below 1", async () => {
    before(async () => {
      const fixtureDeployBelow1 = fixtureDeployedGuessTheNumber(0, salt);
      guessTheNumber = await fixtureDeployBelow1();
      ({ chooser, guesser } = await getNamedAccounts());
      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(wrongGuess);
    });

    describe("WHEN the chosen number is revealed", async () => {
      before(async () => {
        tx = await guessTheNumber.reveal(0, salt);
      });
      it("THEN an event signaling that the guesser won is emitted", async () => {
        return expect(tx).to.emit(guessTheNumber, "WinnerDeclared").withArgs(guesser);
      });
      it("THEN the game is finished", async () => {
        return expect(await guessTheNumber.gameState()).equal(FINISHED_STATE);
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed) where the commited number is above 6", async () => {
    before(async () => {
      const fixtureDeployAbove6 = fixtureDeployedGuessTheNumber(7, salt);
      guessTheNumber = await fixtureDeployAbove6();
      ({ chooser, guesser } = await getNamedAccounts());
      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(wrongGuess);
    });

    describe("WHEN the chosen number is revealed", async () => {
      before(async () => {
        tx = await guessTheNumber.reveal(7, salt);
      });
      it("THEN an event signaling that the guesser won is emitted", async () => {
        return expect(tx).to.emit(guessTheNumber, "WinnerDeclared").withArgs(guesser);
      });
      it("THEN the game is finished", async () => {
        return expect(await guessTheNumber.gameState()).equal(FINISHED_STATE);
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed) where the numbers are equal", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());
      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(choice);
    });
    describe("WHEN the chosen number is revealed", async () => {
      before(async () => {
        tx = await guessTheNumber.reveal(choice, salt);
      });
      it("THEN an event signaling that the guesser won is emitted", async () => {
        return expect(tx).to.emit(guessTheNumber, "WinnerDeclared").withArgs(guesser);
      });
      it("THEN the game is finished", async () => {
        return expect(await guessTheNumber.gameState()).equal(FINISHED_STATE);
      });
    });
  });
});
