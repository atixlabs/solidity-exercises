import { BigNumberish } from "@ethersproject/bignumber";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PaymentChannelsFactory, PaymentChannelsFactory__factory, PaymentChannel__factory } from "../typechain";
import { MockToken__factory } from "../typechain/factories/MockToken__factory";
import { MockToken } from "../typechain/MockToken";
import { DEFAULT_DURATION, DEFAULT_ID, DEFAULT_VALUE } from "./constants";
import { MochaBaseContext } from "./helpers";

export function createFixtureDeployContract(): () => Promise<{
  factory: PaymentChannelsFactory;
  token: MockToken;
}> {
  return deployments.createFixture(async function (hre: HardhatRuntimeEnvironment) {
    await hre.deployments.fixture();

    const deployResultFactory = await hre.deployments.getOrNull("PaymentChannelsFactory");
    if (deployResultFactory === null) throw new Error("Factory not deployed");
    const factoryFactory = new PaymentChannelsFactory__factory();
    const factory = factoryFactory.attach(deployResultFactory.address);

    const deployResultToken = await hre.deployments.getOrNull("MockToken");
    if (deployResultToken === null) throw new Error("MockToken not deployed");
    const tokenFactory = new MockToken__factory();
    const token = tokenFactory.attach(deployResultToken.address);
    return { factory, token };
  });
}

export const deployFixture = createFixtureDeployContract();

export const createFixtureChannelCreation = function (
  duration: BigNumberish,
  value: BigNumberish,
): (options?: unknown) => Promise<MochaBaseContext> {
  return deployments.createFixture(async function (): Promise<MochaBaseContext> {
    const { factory, token } = await deployFixture();
    const sender = await getNamedAccounts().then((accounts: Record<string, string>) =>
      ethers.getSigner(accounts.sender),
    );
    const receiver = await getNamedAccounts().then((accounts: Record<string, string>) =>
      ethers.getSigner(accounts.receiver),
    );
    const paymentChannelsFactory = factory.connect(sender);
    await token.connect(sender).mint(sender.address, DEFAULT_ID, value, "0x00");
    await token.connect(sender).setApprovalForAll(paymentChannelsFactory.address, true);
    const tx = await paymentChannelsFactory.createChannel(receiver.address, duration, token.address, DEFAULT_ID, value);
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
      token,
    };
  });
};

export const fixturePaymentChannelCreation = createFixtureChannelCreation(DEFAULT_DURATION, DEFAULT_VALUE);
