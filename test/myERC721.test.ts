import { ContractTransaction } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, getNamedAccounts } from "hardhat";
import { MyERC721 } from "../typechain";
import { deployFixture } from "./common-fixtures";

declare module "mocha" {
  export interface Context {
    myERC721: MyERC721;
    tx: ContractTransaction;
    deployer: SignerWithAddress;
    otherUser: SignerWithAddress;
  }
}

describe("Some basic tests", function () {
  beforeEach(async function () {
    const deployer = await getNamedAccounts().then((accounts: Record<string, string>) =>
      ethers.getSigner(accounts.deployer),
    );
    const otherUser = await getNamedAccounts().then((accounts: Record<string, string>) =>
      ethers.getSigner(accounts.otherUser),
    );
    this.deployer = deployer;
    this.otherUser = otherUser;
    const myERC721 = await deployFixture();
    this.myERC721 = myERC721.connect(deployer);
  });
  it("first account should have some tokens at the beggining", async function () {
    expect(await this.myERC721.balanceOf(this.deployer.address)).to.equal(6);
    expect(await this.myERC721.ownerOf(1)).to.equal(this.deployer.address);
    expect(await this.myERC721.ownerOf(2)).to.equal(this.deployer.address);
    expect(await this.myERC721.ownerOf(3)).to.equal(this.deployer.address);
    expect(await this.myERC721.ownerOf(4)).to.equal(this.deployer.address);
    expect(await this.myERC721.ownerOf(5)).to.equal(this.deployer.address);
    expect(await this.myERC721.ownerOf(10000)).to.equal(this.deployer.address);
  });

  it("first account should be able to transfer tokens generated at the beginning", async function () {
    const tx = await this.myERC721.transferFrom(this.deployer.address, this.otherUser.address, 1);

    return expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.deployer.address, this.otherUser.address, 1);
  });

  it("after transfering, the approval of a token should be reset", async function () {
    await this.myERC721.approve(this.otherUser.address, 1);
    expect(await this.myERC721.getApproved(1)).to.be.equal(this.otherUser.address);
    await this.myERC721.transferFrom(this.deployer.address, this.otherUser.address, 1);
    expect(await this.myERC721.getApproved(1)).to.be.equal(ethers.constants.AddressZero);
  });

  it("chained transfers should be valid", async function () {
    await this.myERC721.transferFrom(this.deployer.address, this.otherUser.address, 1);
    const tx = await this.myERC721
      .connect(this.otherUser)
      .transferFrom(this.otherUser.address, this.deployer.address, 1);
    return expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.otherUser.address, this.deployer.address, 1);
  });

  it("after approving for all, second account should be able to transfer all of the tokens", async function () {
    await this.myERC721.setApprovalForAll(this.otherUser.address, true);
    let tx = await this.myERC721.connect(this.otherUser).transferFrom(this.deployer.address, this.otherUser.address, 1);
    await expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.deployer.address, this.otherUser.address, 1);

    tx = await this.myERC721.connect(this.otherUser).transferFrom(this.deployer.address, this.otherUser.address, 2);
    await expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.deployer.address, this.otherUser.address, 2);

    tx = await this.myERC721.connect(this.otherUser).transferFrom(this.deployer.address, this.otherUser.address, 3);
    await expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.deployer.address, this.otherUser.address, 3);

    tx = await this.myERC721.connect(this.otherUser).transferFrom(this.deployer.address, this.otherUser.address, 4);
    await expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.deployer.address, this.otherUser.address, 4);

    tx = await this.myERC721.connect(this.otherUser).transferFrom(this.deployer.address, this.otherUser.address, 5);
    await expect(tx).to.emit(this.myERC721, "Transfer").withArgs(this.deployer.address, this.otherUser.address, 5);
  });
});
