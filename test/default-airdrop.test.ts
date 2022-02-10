import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractTransaction } from "ethers";

import { Airdrop, AirdroppableToken } from "../typechain";
import { defaultDeploy } from "./common-fixtures";
import { defaultMerkleTree, hashLeaf, Leaf } from "./airdropMerkleTree";

declare module "mocha" {
  export interface Context {
    airdrop: Airdrop;
    token: AirdroppableToken;
    leaf: Leaf;
    tx: ContractTransaction;
    txs: ContractTransaction[];
  }
}

describe("Airdrop: Succesful merkle tree - default", function () {
  describe("GIVEN an airdroppable contract was deployed and set up", function () {
    before(async function () {
      const { token, airdrop } = await defaultDeploy();
      this.token = token;
      this.airdrop = airdrop;
    });
    describe("WHEN a user presents a valid proof", function () {
      before(async function () {
        this.leaf = defaultMerkleTree.getLeaf(0);
        this.tx = await this.airdrop.claim(this.leaf.receiver, this.leaf.amount, defaultMerkleTree.getProof(0));
      });
      it("THEN the tokens are sent", async function () {
        return expect(await this.token.balanceOf(this.leaf.receiver)).to.be.equal(this.leaf.amount);
      });
      it("THEN the leaf is marked as used", async function () {
        return expect(await this.airdrop.used(hashLeaf(this.leaf))).to.be.true;
      });
      it("THEN an event signaling the transfer is emitted", async function () {
        return expect(this.tx)
          .to.emit(this.token, "Transfer")
          .withArgs(ethers.constants.AddressZero, this.leaf.receiver, this.leaf.amount);
      });
    });
  });

  describe("GIVEN an airdroppable contract was deployed and set up using a merkle tree with a power of two number of leafs", function () {
    before(async function () {
      const { token, airdrop } = await defaultDeploy();
      this.token = token;
      this.airdrop = airdrop;
    });
    describe("WHEN all of the proofs are presented", function () {
      before(async function () {
        this.txs = await Promise.all(
          defaultMerkleTree.leaves.map((leaf, i) =>
            this.airdrop.claim(leaf.receiver, leaf.amount, defaultMerkleTree.getProof(i)),
          ),
        );
      });
      it("THEN all of the tokens are sent", async function () {
        const balances = await Promise.all(defaultMerkleTree.leaves.map(leaf => this.token.balanceOf(leaf.receiver)));
        balances.forEach((balance, i) => expect(balance).to.be.equal(defaultMerkleTree.getLeaf(i).amount));
      });
      it("THEN all of the leaves are marked as used", async function () {
        const usedArray = await Promise.all(defaultMerkleTree.leaves.map(leaf => this.airdrop.used(hashLeaf(leaf))));
        usedArray.forEach(used => expect(used).to.be.true);
      });
      it("THEN all of the events signaling the transfer are emitted", async function () {
        await Promise.all(
          this.txs.map((tx, i) =>
            expect(tx)
              .to.emit(this.token, "Transfer")
              .withArgs(
                ethers.constants.AddressZero,
                defaultMerkleTree.getLeaf(i).receiver,
                defaultMerkleTree.getLeaf(i).amount,
              ),
          ),
        );
      });
    });
  });
});

// odd
// non-power
// twice the same user
