import { expect } from "chai";
import { ethers } from "hardhat";
import { ContractTransaction } from "ethers";

import { Airdrop, AirdroppableToken } from "../typechain";
import { createFixtureDeployContract } from "./common-fixtures";
import { AirdropMerkleTree, hashLeaf, Leaf } from "./airdropMerkleTree";

declare module "mocha" {
  export interface Context {
    airdrop: Airdrop;
    token: AirdroppableToken;
    merkleTree: AirdropMerkleTree;
    leaf: Leaf;
    tx: ContractTransaction;
    txs: ContractTransaction[];
  }
}

describe("Airdrop: Succesful merkle tree - non default", function () {
  // Not needed, if you assumed that there is only a leaf per receiver that's ok. However, it is important to check
  // that it has not been used already
  describe("GIVEN an airdroppable contract was deployed and set up using a merkle tree with a duplicated receiver", function () {
    before(async function () {
      const leaves: Leaf[] = [
        {
          receiver: "0xA37D9164F625C36b6B795D198bc10a5d5C41930f",
          amount: 10,
        },
        {
          receiver: "0x095418612812D8A3FB944F4236D6B8B3FE7480fF",
          amount: 20,
        },
        {
          receiver: "0xA37D9164F625C36b6B795D198bc10a5d5C41930f",
          amount: 30,
        },
        {
          receiver: "0x0aF7e0Ad4AAA1e7d71696d65Bd68c2c9bec476e7",
          amount: 40,
        },
      ];
      this.merkleTree = new AirdropMerkleTree(leaves);
      const deploy = await createFixtureDeployContract(this.merkleTree.getRoot());
      const { token, airdrop } = await deploy();

      this.token = token;
      this.airdrop = airdrop;
    });
    describe("WHEN all of the proofs are presented", function () {
      before(async function () {
        this.txs = await Promise.all(
          this.merkleTree.leaves.map((leaf, i) =>
            this.airdrop.claim(leaf.receiver, leaf.amount, this.merkleTree.getProof(i)),
          ),
        );
      });
      it("THEN all of the tokens are sent", async function () {
        const accumulatedBalance: Map<string, number> = new Map([
          ["0xA37D9164F625C36b6B795D198bc10a5d5C41930f", 40],
          ["0x0aF7e0Ad4AAA1e7d71696d65Bd68c2c9bec476e7", 40],
          ["0x095418612812D8A3FB944F4236D6B8B3FE7480fF", 20],
        ]);
        const balances = await Promise.all(this.merkleTree.leaves.map(leaf => this.token.balanceOf(leaf.receiver)));
        balances.forEach((balance, i) =>
          expect(balance).to.be.equal(accumulatedBalance.get(this.merkleTree.getLeaf(i).receiver)),
        );
      });
      it("THEN all of the leaves are marked as used", async function () {
        const usedArray = await Promise.all(this.merkleTree.leaves.map(leaf => this.airdrop.used(hashLeaf(leaf))));
        usedArray.forEach(used => expect(used).to.be.true);
      });
      it("THEN all of the events signaling the transfer are emitted", async function () {
        await Promise.all(
          this.txs.map((tx, i) =>
            expect(tx)
              .to.emit(this.token, "Transfer")
              .withArgs(
                ethers.constants.AddressZero,
                this.merkleTree.getLeaf(i).receiver,
                this.merkleTree.getLeaf(i).amount,
              ),
          ),
        );
      });
    });
  });

  describe("GIVEN an airdroppable contract was deployed and set up using a merkle tree with an odd number of leafs", function () {
    before(async function () {
      const leaves: Leaf[] = [
        {
          receiver: "0xA37D9164F625C36b6B795D198bc10a5d5C41930f",
          amount: 10,
        },
        {
          receiver: "0x095418612812D8A3FB944F4236D6B8B3FE7480fF",
          amount: 20,
        },
        {
          receiver: "0x986FCF3a0BD51B8AbF5357BedFEF0DaE86480858",
          amount: 30,
        },
        {
          receiver: "0x0aF7e0Ad4AAA1e7d71696d65Bd68c2c9bec476e7",
          amount: 40,
        },
        {
          receiver: "0x80EaDE09aBeE147F8968DB0fE77FAd82A5bfc30e",
          amount: 40,
        },
        {
          receiver: "0x063672677D2D99372D69E358A30F8f4EaD6529c2",
          amount: 40,
        },
        {
          receiver: "0xA6C94075cF1b34e7de31A33f4d0BDa4EE376729A",
          amount: 40,
        },
        {
          receiver: "0x2aaA410D4E5A66A9c062b2AD2B92b551dc658764",
          amount: 40,
        },
        {
          receiver: "0x71BC3324930A563a56D936f91e7FA7cCfcE539d0",
          amount: 40,
        },
      ];
      this.merkleTree = new AirdropMerkleTree(leaves);
      const deploy = await createFixtureDeployContract(this.merkleTree.getRoot());
      const { token, airdrop } = await deploy();

      this.token = token;
      this.airdrop = airdrop;
    });
    describe("WHEN all of the proofs are presented", function () {
      before(async function () {
        this.txs = await Promise.all(
          this.merkleTree.leaves.map((leaf, i) =>
            this.airdrop.claim(leaf.receiver, leaf.amount, this.merkleTree.getProof(i)),
          ),
        );
      });
      it("THEN all of the tokens are sent", async function () {
        const balances = await Promise.all(this.merkleTree.leaves.map(leaf => this.token.balanceOf(leaf.receiver)));
        balances.forEach((balance, i) => expect(balance).to.be.equal(this.merkleTree.getLeaf(i).amount));
      });
      it("THEN all of the leaves are marked as used", async function () {
        const usedArray = await Promise.all(this.merkleTree.leaves.map(leaf => this.airdrop.used(hashLeaf(leaf))));
        usedArray.forEach(used => expect(used).to.be.true);
      });
      it("THEN all of the events signaling the transfer are emitted", async function () {
        await Promise.all(
          this.txs.map((tx, i) =>
            expect(tx)
              .to.emit(this.token, "Transfer")
              .withArgs(
                ethers.constants.AddressZero,
                this.merkleTree.getLeaf(i).receiver,
                this.merkleTree.getLeaf(i).amount,
              ),
          ),
        );
      });
    });
  });

  describe("GIVEN an airdroppable contract was deployed and set up using a merkle tree with a non-power of two(but even) number of leaves", function () {
    before(async function () {
      const leaves: Leaf[] = [
        {
          receiver: "0xA37D9164F625C36b6B795D198bc10a5d5C41930f",
          amount: 10,
        },
        {
          receiver: "0x095418612812D8A3FB944F4236D6B8B3FE7480fF",
          amount: 20,
        },
        {
          receiver: "0x986FCF3a0BD51B8AbF5357BedFEF0DaE86480858",
          amount: 30,
        },
        {
          receiver: "0x0aF7e0Ad4AAA1e7d71696d65Bd68c2c9bec476e7",
          amount: 40,
        },
        {
          receiver: "0x80EaDE09aBeE147F8968DB0fE77FAd82A5bfc30e",
          amount: 40,
        },
        {
          receiver: "0x063672677D2D99372D69E358A30F8f4EaD6529c2",
          amount: 40,
        },
        {
          receiver: "0xA6C94075cF1b34e7de31A33f4d0BDa4EE376729A",
          amount: 40,
        },
        {
          receiver: "0x2aaA410D4E5A66A9c062b2AD2B92b551dc658764",
          amount: 40,
        },
        {
          receiver: "0x71BC3324930A563a56D936f91e7FA7cCfcE539d0",
          amount: 40,
        },
        {
          receiver: "0x36603374f0c01679E64985F5BF5E338F430B0c10",
          amount: 40,
        },
      ];
      this.merkleTree = new AirdropMerkleTree(leaves);
      const deploy = await createFixtureDeployContract(this.merkleTree.getRoot());
      const { token, airdrop } = await deploy();

      this.token = token;
      this.airdrop = airdrop;
    });
    describe("WHEN all of the proofs are presented", function () {
      before(async function () {
        this.txs = await Promise.all(
          this.merkleTree.leaves.map((leaf, i) =>
            this.airdrop.claim(leaf.receiver, leaf.amount, this.merkleTree.getProof(i)),
          ),
        );
      });
      it("THEN all of the tokens are sent", async function () {
        const balances = await Promise.all(this.merkleTree.leaves.map(leaf => this.token.balanceOf(leaf.receiver)));
        balances.forEach((balance, i) => expect(balance).to.be.equal(this.merkleTree.getLeaf(i).amount));
      });
      it("THEN all of the leaves are marked as used", async function () {
        const usedArray = await Promise.all(this.merkleTree.leaves.map(leaf => this.airdrop.used(hashLeaf(leaf))));
        usedArray.forEach(used => expect(used).to.be.true);
      });
      it("THEN all of the events signaling the transfer are emitted", async function () {
        await Promise.all(
          this.txs.map((tx, i) =>
            expect(tx)
              .to.emit(this.token, "Transfer")
              .withArgs(
                ethers.constants.AddressZero,
                this.merkleTree.getLeaf(i).receiver,
                this.merkleTree.getLeaf(i).amount,
              ),
          ),
        );
      });
    });
  });
});
