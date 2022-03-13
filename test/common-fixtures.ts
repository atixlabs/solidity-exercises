import { BigNumberish } from "@ethersproject/bignumber";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PaymentChannelsFactory, PaymentChannelsFactory__factory, PaymentChannel__factory } from "../typechain";
import { DEFAULT_DURATION, DEFAULT_VALUE } from "./constants";
import { MochaBaseContext } from "./helpers";

export function createFixtureDeployContract(): () => Promise<PaymentChannelsFactory> {
  return deployments.createFixture(async function (hre: HardhatRuntimeEnvironment) {
    await hre.deployments.fixture();

    const deployResult = await hre.deployments.getOrNull("PaymentChannelsFactory");
    if (deployResult === null) throw new Error("Factory not deployed");
    const factory = new PaymentChannelsFactory__factory();
    return factory.attach(deployResult.address);
  });
}

export const deployFixture = createFixtureDeployContract();

export const createFixtureChannelCreation = function (
  duration: BigNumberish,
  value: BigNumberish,
): (options?: unknown) => Promise<MochaBaseContext> {
  return deployments.createFixture(async function (): Promise<MochaBaseContext> {
    const factory = await deployFixture();
    const sender = await getNamedAccounts().then((accounts: Record<string, string>) =>
      ethers.getSigner(accounts.sender),
    );
    const receiver = await getNamedAccounts().then((accounts: Record<string, string>) =>
      ethers.getSigner(accounts.receiver),
    );
    const paymentChannelsFactory = factory.connect(sender);

    const tx = await paymentChannelsFactory.createChannel(receiver.address, duration, { value: value });
    const creationEvent = await tx.wait(1).then(e => {
      return e.events?.find(x => x.event === "PaymentChannelCreated");
    });
    const paymentChannel = new PaymentChannel__factory().attach(creationEvent?.args?.channel).connect(sender);
    return {
      paymentChannel,
      tx,
      sender,
      receiver,
      paymentChannelsFactory,
    };
  });
};

export const fixturePaymentChannelCreation = createFixtureChannelCreation(DEFAULT_DURATION, DEFAULT_VALUE);
