import { expect } from "chai";
import { PaymentChannel__factory } from "../typechain";
import { DEFAULT_DURATION, DEFAULT_ID, DEFAULT_VALUE } from "./constants";
import { defaultInitialization } from "./helpers";

describe("Creation and intialization", function () {
  describe("GIVEN a factory is deployed", function () {
    before(defaultInitialization);
    describe("WHEN a user tries to create a channel with 0 value", function () {
      it("THEN the transaction reverts", function () {
        return expect(
          this.paymentChannelsFactory
            .connect(this.sender)
            .createChannel(this.receiver.address, DEFAULT_DURATION, this.token.address, DEFAULT_ID, 0),
        ).to.be.revertedWith("Factory: no value sent");
      });
    });
  });
  describe("GIVEN a factory is deployed and a channel was created", function () {
    before(defaultInitialization);
    describe("WHEN a user tries to reinitialize it", function () {
      it("THEN the transaction reverts", function () {
        return expect(
          this.paymentChannel.initialize(
            this.sender.address,
            this.receiver.address,
            DEFAULT_DURATION,
            this.token.address,
            DEFAULT_ID,
          ),
        ).to.be.revertedWith("PaymentChannel: already initialized");
      });
    });
  });
  describe("GIVEN a factory is deployed", function () {
    before(defaultInitialization);
    describe("WHEN a user creates a channel", function () {
      before(async function () {
        await this.token.connect(this.sender).mint(this.sender.address, DEFAULT_ID, DEFAULT_VALUE, "0x00");
        await this.token.connect(this.sender).setApprovalForAll(this.paymentChannelsFactory.address, true);
        this.tx = await this.paymentChannelsFactory
          .connect(this.sender)
          .createChannel(this.receiver.address, DEFAULT_DURATION, this.token.address, DEFAULT_ID, DEFAULT_VALUE);
        const creationEvent = await this.tx.wait(1).then(e => {
          return e.events?.find(x => x.event === "PaymentChannelCreated");
        });
        this.paymentChannel = new PaymentChannel__factory().attach(creationEvent?.args?.channel).connect(this.sender);
      });
      it("THEN an event is emitted", function () {
        expect(this.paymentChannel.address).to.be.properAddress;
        return expect(this.tx)
          .to.emit(this.paymentChannelsFactory, "PaymentChannelCreated")
          .withArgs(this.paymentChannel.address);
      });
      it("THEN the sender is set", async function () {
        return expect(await this.paymentChannel.sender()).to.be.equal(this.sender.address);
      });
      it("THEN the receiver is set", async function () {
        return expect(await this.paymentChannel.receiver()).to.be.equal(this.receiver.address);
      });
      it("THEN the expiration is set", async function () {
        if (this.tx.blockNumber === undefined) throw new Error("block number not set");
        const block = await this.sender.provider?.getBlock(this.tx.blockNumber);
        if (block === undefined) throw new Error("block not found");
        const timestamp = block?.timestamp;
        return expect(await this.paymentChannel.expiresAt()).to.be.equal((DEFAULT_DURATION + timestamp).toString());
      });
      it("THEN the funds are locked", async function () {
        return expect(
          await this.token.connect(this.sender).balanceOf(this.paymentChannel.address, DEFAULT_ID),
        ).to.equal(DEFAULT_VALUE);
      });
    });
  });
});
