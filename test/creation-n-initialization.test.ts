import { expect } from "chai";
import { PaymentChannel__factory } from "../typechain";
import { DEFAULT_DURATION, DEFAULT_VALUE } from "./constants";
import { defaultInitialization } from "./helpers";

describe("Creation and intialization", function () {
  describe("GIVEN a factory is deployed", function () {
    before(defaultInitialization);
    describe("WHEN a user tries to create a channel 0 value", function () {
      it("THEN the transaction reverts", function () {
        return expect(
          this.paymentChannelsFactory.connect(this.sender).createChannel(this.receiver.address, DEFAULT_DURATION),
        ).to.be.revertedWith("Factory: no value sent");
      });
    });
  });
  describe("GIVEN a factory is deployed and a channel was created", function () {
    before(defaultInitialization);
    describe("WHEN a user tries to reinitialize it", function () {
      it("THEN the transaction reverts", function () {
        return expect(
          this.paymentChannel.initialize(this.sender.address, this.receiver.address, DEFAULT_DURATION, {
            value: 3,
          }),
        ).to.be.revertedWith("PaymentChannel: already initialized");
      });
    });
  });
  describe("GIVEN a factory is deployed", function () {
    before(defaultInitialization);
    describe("WHEN a user creates a channel", function () {
      before(async function () {
        this.tx = await this.paymentChannelsFactory
          .connect(this.sender)
          .createChannel(this.receiver.address, DEFAULT_DURATION, { value: DEFAULT_VALUE });
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
        return expect(await this.paymentChannel.provider.getBalance(this.paymentChannel.address)).to.equal(
          DEFAULT_VALUE,
        );
      });
    });
  });

  describe("GIVEN a factory is deployed", function () {
    before(defaultInitialization);
    describe("WHEN a user creates a contract with 0 value", function () {
      before(async function () {
        const deployResult = await this.paymentChannelsFactory
          .connect(this.sender)
          .createChannel(this.receiver.address, DEFAULT_DURATION, { value: DEFAULT_VALUE });
        const creationEvent = await deployResult.wait(1).then(e => {
          return e.events?.find(x => x.event === "PaymentChannelCreated");
        });
        this.paymentChannel = new PaymentChannel__factory().attach(creationEvent?.args?.channel).connect(this.sender);
      });
      it("THEN the transaction reverts", function () {
        return expect(
          this.paymentChannel
            .connect(this.sender)
            .initialize(this.sender.address, this.receiver.address, DEFAULT_DURATION, { value: 3 }),
        ).to.be.revertedWith("PaymentChannel: already initialized");
      });
    });
  });
});
