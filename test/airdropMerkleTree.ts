import { MerkleTree } from "merkletreejs";
import { ethers } from "hardhat";
import keccak256 from "keccak256";

export type Leaf = { receiver: string; amount: number };

export const hashLeaf = (x: Leaf): string =>
  ethers.utils.solidityKeccak256(["address", "uint256"], [x.receiver, x.amount]);

export const defaultLeaves: Leaf[] = [
  {
    receiver: "0xA37D9164F625C36b6B795D198bc10a5d5C41930f",
    amount: 10,
  },
  {
    receiver: "0x095418612812D8A3FB944F4236D6B8B3FE7480fF",
    amount: 20,
  },
  {
    receiver: "0x271F00368D2b046E8D2F89Fd9ACF33b298239F68",
    amount: 30,
  },
  {
    receiver: "0x0aF7e0Ad4AAA1e7d71696d65Bd68c2c9bec476e7",
    amount: 40,
  },
];

export class AirdropMerkleTree {
  merkleTree: MerkleTree;
  leaves: Leaf[];
  constructor(leaves: Leaf[]) {
    this.merkleTree = new MerkleTree(leaves.map(hashLeaf), keccak256, { sortPairs: true });
    this.leaves = leaves;
  }

  getNumberOfLeaves(): number {
    return this.leaves.length;
  }

  getLeaf(index: number): Leaf {
    return this.leaves[index];
  }

  getRoot(): Buffer {
    return this.merkleTree.getRoot();
  }

  getProof(index: number): string[] {
    return this.merkleTree.getHexProof(hashLeaf(this.leaves[index]), index);
  }
}

export const defaultMerkleTree = new AirdropMerkleTree(defaultLeaves);
