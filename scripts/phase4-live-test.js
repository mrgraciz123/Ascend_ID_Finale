const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [signer] = await ethers.getSigners();
  
  const abi = [
    "function anchorCredential(string uuid, bytes32 dataHash, address issuerWallet) external",
    "function getCredential(string uuid) external view returns (bytes32, address, bool, string, uint256)"
  ];
  
  const CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contract = new ethers.Contract(CONTRACT, abi, signer);
  
  const uuid = "phase4-integration-test-" + Date.now();
  const dataHash = ethers.keccak256(ethers.toUtf8Bytes("phase4-test-hash-payload"));
  const issuerWallet = signer.address;
  
  console.log("UUID:", uuid);
  console.log("DataHash:", dataHash);
  console.log("IssuerWallet:", issuerWallet);
  console.log("Contract:", CONTRACT);
  
  const tx = await contract.anchorCredential(uuid, dataHash, issuerWallet);
  const receipt = await tx.wait();
  
  console.log("TxHash:", tx.hash);
  console.log("Block:", receipt.blockNumber);
  console.log("Status:", receipt.status);
  
  // Read back immediately
  const result = await contract.getCredential(uuid);
  console.log("OnChainHash:", result[0]);
  console.log("OnChainIssuer:", result[1]);
  console.log("IsRevoked:", result[2]);
  
  // Write UUID for next step
  const fs = require("fs");
  fs.writeFileSync("artifacts/phase4_live_uuid.txt", uuid);
  console.log("UUID_SAVED");
}
main().catch(console.error);
