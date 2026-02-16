const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

const transactions = [
  "TR01",
  "TR02",
  "TR03",
  "TR04",
  "TR05",
  "TR06",
  "TR07",
  "TR08"
];

let level = transactions.map(tx => sha256(tx));

function buildMerkleTree(hashes) {
  const tree = [hashes];

  while (hashes.length > 1) {
    const nextLevel = [];

    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1];
      const combinedHash = sha256(left + right);
      nextLevel.push(combinedHash);
    }

    tree.push(nextLevel);
    hashes = nextLevel;
  }

  return tree;
}

const merkleTree = buildMerkleTree(level);
const merkleRoot = merkleTree[merkleTree.length - 1][0];

console.log("Merkle Root:", merkleRoot);

function getMerkleProof(tree, index) {
  const proof = [];

  for (let level = 0; level < tree.length - 1; level++) {
    const isRightNode = index % 2;
    const siblingIndex = isRightNode ? index - 1 : index + 1;

    proof.push({
      hash: tree[level][siblingIndex],
      position: isRightNode ? "left" : "right"
    });

    index = Math.floor(index / 2);
  }

  return proof;
}

const txIndex = 2;
const proof = getMerkleProof(merkleTree, txIndex);

console.log("Merkle Proof:", proof);

function verifyMerkleProof(transaction, proof, root) {
  let hash = sha256(transaction);

  for (const step of proof) {
    if (step.position === "left") {
      hash = sha256(step.hash + hash);
    } else {
      hash = sha256(hash + step.hash);
    }
  }

  return hash === root;
}

const isValid = verifyMerkleProof(
  transactions[txIndex],
  proof,
  merkleRoot
);

console.log("Transaction valid?", isValid);

