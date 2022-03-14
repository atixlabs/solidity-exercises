import { ContractTransaction } from "@ethersproject/contracts";
import { expect } from "chai";
import { ethers, getNamedAccounts } from "hardhat";
import { PaymentChannel, PaymentChannel__factory } from "../typechain";
import { DEFAULT_DURATION, DEFAULT_ID, DEFAULT_VALUE } from "./constants";
import { MochaBaseContext, defaultInitialization, createSignature } from "./helpers";

declare module "mocha" {
  export interface Context extends MochaBaseContext {
    paymentChannel: PaymentChannel;
    tx: ContractTransaction;
  }
}

describe("Close - Signature usage", function () {
  describe("GIVEN a factory is deployed and a channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the receiver sends a signed payment with an amount smaller than the total", function () {
      before(async function () {
        this.amount = DEFAULT_VALUE - 1;
        const signature = await createSignature(this.sender, this.paymentChannel, this.amount);
        this.tx = await this.paymentChannel.connect(this.receiver).close(this.amount, signature);
      });
      it("THEN the change is sent back to the sender ", async function () {
        return expect(await this.token.connect(this.sender).balanceOf(this.sender.address, DEFAULT_ID)).to.be.equal(DEFAULT_VALUE - this.amount);
      });

      it("THEN contract gets destructed", async function () {
        return expect(await this.paymentChannel.provider.getCode(this.paymentChannel.address)).to.be.equal("0x");
      });

      it("THEN an event is emitted", function () {
        return expect(this.tx).to.emit(this.paymentChannel, "PaymentChannelClosed").withArgs(this.amount);
      });

      it("THEN the receiver receives the amount", async function () {
        return expect(await this.token.connect(this.receiver).balanceOf(this.receiver.address, DEFAULT_ID)).to.be.equal(this.amount);
      });
    });
  });
  describe("GIVEN a factory is deployed and a channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the receiver sends a signed payment with an amount equal to the total", function () {
      before(async function () {
        this.amount = DEFAULT_VALUE;
        const signature = await createSignature(this.sender, this.paymentChannel, this.amount);
        this.tx = await this.paymentChannel.connect(this.receiver).close(this.amount, signature);
      });
      it("THEN contract gets destructed", async function () {
        return expect(await this.paymentChannel.provider.getCode(this.paymentChannel.address)).to.be.equal("0x");
      });

      it("THEN the receiver receives the amount", async function () {
        return expect(await this.token.connect(this.receiver).balanceOf(this.receiver.address, DEFAULT_ID)).to.be.equal(this.amount);
      });
      it("THEN no change is sent back to the sender", async function () {
        return expect(await this.token.connect(this.receiver).balanceOf(this.sender.address, DEFAULT_ID)).to.be.equal(0);
      });

      it("THEN an event is emitted", function () {
        return expect(this.tx).to.emit(this.paymentChannel, "PaymentChannelClosed").withArgs(this.amount);
      });
    });
  });

  describe("GIVEN a factory is deployed and a channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the receiver sends a signed payment with an amount greater than the total", function () {
      it("THEN the transaction fails", async function () {
        this.amount = DEFAULT_VALUE + 1;
        const signature = await createSignature(this.sender, this.paymentChannel, this.amount);
        return expect(this.paymentChannel.connect(this.receiver).close(this.amount, signature)).to.be.revertedWith(
          "ERC1155: insufficient balance for transfer",
        );
      });
    });
  });

  describe("GIVEN a factory is deployed and a channel was deployed", function () {
    before(defaultInitialization);
    describe("WHEN another user sends a signed payment", function () {
      it("THEN the transaction fails", async function () {
        const amount = DEFAULT_VALUE - 1;
        const signature = await createSignature(this.sender, this.paymentChannel, amount);
        const { anotherUser } = await getNamedAccounts();
        return expect(
          this.paymentChannel.connect(await ethers.getSigner(anotherUser)).close(amount, signature),
        ).to.be.revertedWith("PaymentChannel: not receiver");
      });
    });
  });

  describe("GIVEN a factory is deployed and a channel was deployed", function () {
    before(defaultInitialization);
    describe("WHEN the sender sends a signed payment", function () {
      it("THEN the transaction fails", async function () {
        const amount = DEFAULT_VALUE - 1;
        const signature = await createSignature(this.sender, this.paymentChannel, amount);
        return expect(this.paymentChannel.connect(this.sender).close(amount, signature)).to.be.revertedWith(
          "PaymentChannel: not receiver",
        );
      });
    });
  });
});
