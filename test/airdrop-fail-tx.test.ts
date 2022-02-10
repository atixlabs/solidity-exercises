import { expect } from "chai";
import { randomBytes } from "crypto";

import { Airdrop, AirdroppableToken } from "../typechain";
import { defaultDeploy } from "./common-fixtures";
import { defaultMerkleTree, Leaf } from "./airdropMerkleTree";

declare module "mocha" {
  export interface Context {
    airdrop: Airdrop;
    token: AirdroppableToken;
  }
}

describe("Airdrop: failing transactions", function () {
  describe("GIVEN an airdroppable contract was deployed and set up", function () {
    before(async function () {
      const { token, airdrop } = await defaultDeploy();
      this.token = token;
      this.airdrop = airdrop;
    });

    describe("WHEN a user presents a proof for a leaf, but changes the amount", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(
          this.airdrop.claim(leaf.receiver, leaf.amount + 1, defaultMerkleTree.getProof(0)),
        ).to.revertedWith("Airdrop: failed merkle check");
      });
    });

    describe("WHEN a user presents a proof for a leaf, but changes the receiver", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(
          this.airdrop.claim(this.airdrop.address, leaf.amount, defaultMerkleTree.getProof(0)),
        ).to.revertedWith("Airdrop: failed merkle check");
      });
    });

    describe("WHEN a user presents a proof for another leaf", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(this.airdrop.claim(leaf.receiver, leaf.amount, defaultMerkleTree.getProof(1))).to.revertedWith(
          "Airdrop: failed merkle check",
        );
      });
    });

    describe("WHEN a user presents a random proof for a valid leaf", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(
          this.airdrop.claim(leaf.receiver, leaf.amount, [randomBytes(32), randomBytes(32)]),
        ).to.revertedWith("Airdrop: failed merkle check");
      });
    });

    describe("WHEN a user presents an empty proof for a valid leaf", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(this.airdrop.claim(leaf.receiver, leaf.amount, [])).to.revertedWith(
          "Airdrop: failed merkle check",
        );
      });
    });

    describe("WHEN a user presents an invalid proof with the root hash for a valid leaf", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(this.airdrop.claim(leaf.receiver, leaf.amount, [defaultMerkleTree.getRoot()])).to.revertedWith(
          "Airdrop: failed merkle check",
        );
      });
    });

    describe("WHEN a user presents an random proof with the root hash for an invalid leaf", function () {
      it("THEN the tx fails", async function () {
        return expect(this.airdrop.claim(this.airdrop.address, 20, [randomBytes(32), randomBytes(32)])).to.revertedWith(
          "Airdrop: failed merkle check",
        );
      });
    });

    describe("WHEN a user presents an valid proof with the root hash for an invalid leaf", function () {
      it("THEN the tx fails", async function () {
        return expect(this.airdrop.claim(this.airdrop.address, 20, defaultMerkleTree.getProof(0))).to.revertedWith(
          "Airdrop: failed merkle check",
        );
      });
    });

    describe("WHEN a user presents a valid proof for the same leaf twice", function () {
      it("THEN the second tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);

        await this.airdrop.claim(leaf.receiver, leaf.amount, defaultMerkleTree.getProof(0));
        return expect(this.airdrop.claim(leaf.receiver, leaf.amount, defaultMerkleTree.getProof(0))).to.revertedWith(
          "Airdrop: proof already used",
        );
      });
    });

    describe("WHEN a user wants to mint directly through the token", function () {
      it("THEN the tx fails", async function () {
        const leaf: Leaf = defaultMerkleTree.getLeaf(0);
        return expect(this.token.mint(leaf.receiver, leaf.amount)).to.revertedWith("AirdroppableToken: not airdrop");
      });
    });

    describe("WHEN a user wants to reinitialize the token, to set the airdrop", function () {
      it("THEN the tx fails", async function () {
        return expect(
          this.token.__AirdroppableToken_init("AirdroppableToken", "ADT", await this.token.signer.getAddress()),
        ).to.revertedWith("Initializable: contract is already initialized");
      });
    });

    describe("WHEN a user wants to reinitialize unchained the token, to set the airdrop", function () {
      it("THEN the tx fails", async function () {
        return expect(
          this.token.__AirdroppableToken_init_unchained(await this.token.signer.getAddress()),
        ).to.revertedWith("Initializable: contract is already initialized");
      });
    });

    describe("WHEN a user wants to change the token", function () {
      it("THEN the tx fails", async function () {
        return expect(this.airdrop.setToken(await this.token.signer.getAddress())).to.revertedWith(
          "Airdrop: token already set",
        );
      });
    });

    describe("WHEN a user wants to change the root", function () {
      it("THEN the tx fails", async function () {
        return expect(this.airdrop.setRoot(randomBytes(32))).to.revertedWith("Airdrop: root already set");
      });
    });
  });
});
