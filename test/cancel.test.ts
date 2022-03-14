import { expect } from "chai";
import hre from "hardhat";

import { MochaBaseContext, defaultInitialization } from "./helpers";
import { DEFAULT_DURATION, DEFAULT_ID, DEFAULT_VALUE } from "./constants";

const timePassedInitialization = async function (this: MochaBaseContext) {
  await defaultInitialization.bind(this)();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const timeAndMine: any = hre.timeAndMine;
  await timeAndMine.setTimeIncrease(DEFAULT_DURATION + 1);
};
describe("Cancel - Timeout", function () {
  describe("GIVEN a payment channel was created and the time has passed", function () {
    before(timePassedInitialization);
    describe("WHEN the sender wants to cancel", function () {
      before(async function () {
        this.tx = await this.paymentChannel.connect(this.sender).cancel();
      });
      it("THEN the commited amount is sent back", async function () {
        return expect(await this.token.connect(this.sender).balanceOf(this.sender.address, DEFAULT_ID)).to.be.equal(
          DEFAULT_VALUE,
        );
      });
      it("THEN the contract is destroyed", async function () {
        return expect(await this.paymentChannel.provider.getCode(this.paymentChannel.address)).to.be.equal("0x");
      });
      it("THEN an event is emited", async function () {
        return expect(this.tx).to.emit(this.paymentChannel, "PaymentChannelCancelled").withArgs();
      });
    });
  });

  describe("GIVEN a payment channel was created and the time has passed", function () {
    before(timePassedInitialization);
    describe("WHEN another user wants to cancel", function () {
      it("THEN the transaction reverts", function () {
        return expect(this.paymentChannel.connect(this.receiver).cancel()).to.be.revertedWith(
          "PaymentChannel: not sender",
        );
      });
    });
  });

  describe("GIVEN a payment channel was created and the time has NOT passed", function () {
    before(defaultInitialization);
    describe("WHEN the sender wants to cancel it", function () {
      it("THEN the transaction reverts", function () {
        return expect(this.paymentChannel.connect(this.sender).cancel()).to.be.revertedWith(
          "PaymentChannel: not expired yet",
        );
      });
    });
  });
});
