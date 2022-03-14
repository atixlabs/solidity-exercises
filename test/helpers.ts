import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ContractTransaction } from "ethers";
import { PaymentChannel, PaymentChannelsFactory } from "../typechain";
import { MockToken } from "../typechain/MockToken";
import { fixturePaymentChannelCreation } from "./common-fixtures";

export interface MochaBaseContext {
  paymentChannelsFactory: PaymentChannelsFactory;
  sender: SignerWithAddress;
  receiver: SignerWithAddress;
  paymentChannel: PaymentChannel;
  token: MockToken;
  tx: ContractTransaction;
}
declare module "mocha" {
  // The following is needed for mocha to recognize the correct this typing
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Context extends MochaBaseContext {}
}

export const defaultInitialization = async function (this: MochaBaseContext): Promise<void> {
  Object.assign(this, await fixturePaymentChannelCreation());
};

export const createSignature = async function (
  signer: SignerWithAddress,
  contract: PaymentChannel,
  amount: number,
  domainOpts?: TypedDataDomain,
): Promise<string> {
  const domain: TypedDataDomain = {
    chainId: await signer.getChainId(),
    verifyingContract: contract.address,
    name: "PaymentChannel",
    version: "1.0.0",
    ...domainOpts,
  };
  const types: Record<string, TypedDataField[]> = {
    Payment: [{ name: "amount", type: "uint256" }],
  };
  const value: Record<string, number> = {
    amount,
  };

  return signer._signTypedData(domain, types, value);
};
