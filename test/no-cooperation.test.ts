import hre, { ethers, getNamedAccounts } from "hardhat";
import { Address } from "hardhat-deploy/dist/types";
import { expect } from "chai";

import { fixtureDeployedGuessTheNumber } from "./common-fixtures";
import { GuessTheNumber } from "../typechain";
import { ContractTransaction } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface HardhatRuntimeEnvironmentExtended extends HardhatRuntimeEnvironment {
  timeAndMine: any;
}

const hreExtended: HardhatRuntimeEnvironmentExtended = hre as HardhatRuntimeEnvironmentExtended;
const FINISHED_STATE = 3;
describe("Feature: GuessTheNumber - No cooperation", () => {
  let guessTheNumber: GuessTheNumber;
  let chooser: Address;
  let guesser: Address;
  let tx: ContractTransaction;

  const choice = 1;
  const salt = "0x1234567890123456789012345678901234567890123456789012345678901234";
  const fixtureDeploy = fixtureDeployedGuessTheNumber(choice, salt);
  describe("GIVEN a GuessTheNumber contract is on its last stage(about to be revealed) where the numbers differ", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());

      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(1);
    });

    describe("WHEN the time limit is reached and claimExpired is called", async () => {
      before(async () => {
        await hreExtended.timeAndMine.increaseTime(1000000);
        tx = await guessTheNumber.claimExpired();
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
      await guessTheNumber.connect(guesserSigner).guessValue(1);
    });

    describe("WHEN the time limit is reached and claimExpired is called", async () => {
      before(async () => {
        await hreExtended.timeAndMine.increaseTime(1000000);
        tx = await guessTheNumber.claimExpired();
      });
      it("THEN an event signaling that the guesser won is emitted", async () => {
        return expect(tx).to.emit(guessTheNumber, "WinnerDeclared").withArgs(guesser);
      });
      it("THEN the game is finished", async () => {
        return expect(await guessTheNumber.gameState()).equal(FINISHED_STATE);
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract was just created", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser } = await getNamedAccounts());
    });

    describe("WHEN the time limit is reached and claimExpired is called", async () => {
      before(async () => {
        await hreExtended.timeAndMine.increaseTime(1000000);
        tx = await guessTheNumber.claimExpired();
      });
      it("THEN an event signaling that the chooser won is emitted", async () => {
        return expect(tx).to.emit(guessTheNumber, "WinnerDeclared").withArgs(chooser);
      });
      it("THEN the game is finished", async () => {
        return expect(await guessTheNumber.gameState()).equal(FINISHED_STATE);
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract was just created and the limit was not reached", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser } = await getNamedAccounts());
    });

    describe("WHEN claimExpired is called", async () => {
      it("THEN the tx fails", async () => {
        return expect(guessTheNumber.claimExpired()).to.be.revertedWith("Cannot claim now");
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract is about to be revealed and the limit of the previous stage was reached", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser } = await getNamedAccounts());
      await hreExtended.timeAndMine.increaseTime(1000000);

      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(1);
    });

    describe("WHEN claimExpired is called", async () => {
      it("THEN the tx fails", async () => {
        return expect(guessTheNumber.claimExpired()).to.be.revertedWith("Cannot claim now");
      });
    });
  });

  describe("GIVEN a GuessTheNumber contract is in its last stage and the limit was not reached", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());
      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(1);
    });

    describe("WHEN claimExpired is called", async () => {
      it("THEN the tx fails", async () => {
        return expect(guessTheNumber.claimExpired()).to.be.revertedWith("Cannot claim now");
      });
    });
  });

  describe("GIVEN a GuessTheNumber has finished and the limit to reveal was reached", async () => {
    before(async () => {
      guessTheNumber = await fixtureDeploy();
      ({ chooser, guesser } = await getNamedAccounts());
      const chooserSigner = await ethers.getSigner(chooser);
      const guesserSigner = await ethers.getSigner(guesser);
      await guessTheNumber.connect(guesserSigner).guessValue(1);
      await guessTheNumber.connect(chooserSigner).reveal(choice, salt);

      await hreExtended.timeAndMine.increaseTime(1000000);
    });

    describe("WHEN claimExpired is called", async () => {
      it("THEN the tx fails", async () => {
        return expect(guessTheNumber.claimExpired()).to.be.revertedWith("Game is not being played");
      });
    });
  });
});
