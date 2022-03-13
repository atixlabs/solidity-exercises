import { ContractTransaction } from "@ethersproject/contracts";
import { expect } from "chai";
import { PaymentChannel, PaymentChannel__factory } from "../typechain";
import { DEFAULT_VALUE } from "./constants";
import { MochaBaseContext, defaultInitialization, createSignature } from "./helpers";

declare module "mocha" {
  export interface Context extends MochaBaseContext {
    paymentChannel: PaymentChannel;
    tx: ContractTransaction;
  }
}

describe("Wrong signatures get rejected", function () {
  describe("GIVEN a factory is deployed and a payment channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the wrong verifying contract is used", function () {
      it("THEN the transaction reverts", async function () {
        const signature = await createSignature(this.sender, this.paymentChannel, DEFAULT_VALUE, {
          verifyingContract: this.paymentChannelsFactory.address,
        });
        return expect(this.paymentChannel.connect(this.receiver).close(DEFAULT_VALUE, signature)).to.be.revertedWith(
          "PaymentChannel: invalid signature",
        );
      });
    });
  });

  describe("GIVEN a factory is deployed and a payment channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the wrong chain is used", function () {
      it("THEN the transaction reverts", async function () {
        const signature = await createSignature(this.sender, this.paymentChannel, DEFAULT_VALUE, {
          chainId: 1,
        });
        return expect(this.paymentChannel.connect(this.receiver).close(DEFAULT_VALUE, signature)).to.be.revertedWith(
          "PaymentChannel: invalid signature",
        );
      });
    });
  });

  describe("GIVEN a factory is deployed and a payment channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the wrong name is used", function () {
      it("THEN the transaction reverts", async function () {
        const signature = await createSignature(this.sender, this.paymentChannel, DEFAULT_VALUE, {
          name: "DummyName",
        });
        return expect(this.paymentChannel.connect(this.receiver).close(DEFAULT_VALUE, signature)).to.be.revertedWith(
          "PaymentChannel: invalid signature",
        );
      });
    });
  });

  describe("GIVEN a factory is deployed and a payment channel was created", function () {
    before(defaultInitialization);
    describe("WHEN the wrong version is used", function () {
      it("THEN the transaction reverts", async function () {
        const signature = await createSignature(this.sender, this.paymentChannel, DEFAULT_VALUE, {
          version: "1000.1000.1000",
        });
        return expect(this.paymentChannel.connect(this.receiver).close(DEFAULT_VALUE, signature)).to.be.revertedWith(
          "PaymentChannel: invalid signature",
        );
      });
    });
  });

  describe("GIVEN a factory is deployed and a payment channel was created", function () {
    before(defaultInitialization);
    describe("WHEN a signature made by another person is used", function () {
      it("THEN the transaction reverts", async function () {
        const signature = await createSignature(this.receiver, this.paymentChannel, DEFAULT_VALUE, {
          version: "1000.1000.1000",
        });
        return expect(this.paymentChannel.connect(this.receiver).close(DEFAULT_VALUE, signature)).to.be.revertedWith(
          "PaymentChannel: invalid signature",
        );
      });
    });
  });
});
