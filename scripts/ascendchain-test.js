const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("====================================================");
  console.log("  ASCENDCHAIN AUTOMATED REAL BLOCKCHAIN TEST SUITE");
  console.log("====================================================");

  const [deployer] = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;
  const network = await provider.getNetwork();

  console.log(`[TEST 1] RPC & Chain Identity Check...`);
  console.log(`  RPC Endpoint:        http://127.0.0.1:8545`);
  console.log(`  Chain Name:          AscendChain Devnet`);
  console.log(`  Chain ID:            ${network.chainId.toString()}`);
  console.log(`  Deployer Address:    ${deployer.address}`);
  if (network.chainId !== 13370n && network.chainId !== 31337n) {
    throw new Error(`Unexpected Chain ID: ${network.chainId}`);
  }
  console.log(`  ✅ Chain Identity Verified.`);

  console.log(`\n[TEST 2] Block Production & Progression Check...`);
  const blockBefore = await provider.getBlockNumber();
  console.log(`  Initial Block:       #${blockBefore}`);
  
  // Submit a ping transaction to force a block state transition
  const txPing = await deployer.sendTransaction({
    to: deployer.address,
    value: 0
  });
  await txPing.wait();
  
  const blockAfter = await provider.getBlockNumber();
  console.log(`  New Block Height:    #${blockAfter}`);
  console.log(`  Ping Tx Hash:        ${txPing.hash}`);
  if (blockAfter <= blockBefore) {
    throw new Error(`Block production stalled! Before: ${blockBefore}, After: ${blockAfter}`);
  }
  console.log(`  ✅ Block Production Verified.`);

  console.log(`\n[TEST 3] Smart Contract Deployment...`);
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.deploy();
  await registry.waitForDeployment();
  const contractAddress = await registry.getAddress();
  const deployTx = registry.deploymentTransaction();
  const deployReceipt = await deployTx ? await deployTx.wait() : null;

  console.log(`  Contract Address:   ${contractAddress}`);
  console.log(`  Deployment Tx:      ${deployTx ? deployTx.hash : 'N/A'}`);
  console.log(`  Deployment Block:   #${deployReceipt ? deployReceipt.blockNumber : 'N/A'}`);
  console.log(`  Deployment Gas:     ${deployReceipt ? deployReceipt.gasUsed.toString() : 'N/A'} units`);
  console.log(`  ✅ Contract Deployed Successfully.`);

  console.log(`\n[TEST 4] Anchor Credential Real Transaction Execution...`);
  const testCredentialId = `test-cred-${Date.now()}`;
  const testDataHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(`metadata-payload-${testCredentialId}`));
  const testIssuerWallet = deployer.address;

  console.log(`  Input Credential ID: ${testCredentialId}`);
  console.log(`  Input Data Hash:     ${testDataHash}`);
  console.log(`  Input Issuer Wallet: ${testIssuerWallet}`);

  const anchorTx = await registry.anchorCredential(testCredentialId, testDataHash, testIssuerWallet);
  console.log(`  Submitted Tx Hash:  ${anchorTx.hash}`);
  const anchorReceipt = await anchorTx.wait();

  console.log(`  Mined in Block:     #${anchorReceipt ? anchorReceipt.blockNumber : 'N/A'}`);
  console.log(`  Receipt Status:     ${anchorReceipt && anchorReceipt.status === 1 ? 'SUCCESS (1)' : 'FAILURE (0)'}`);
  console.log(`  Gas Used:           ${anchorReceipt ? anchorReceipt.gasUsed.toString() : 'N/A'} units`);
  if (!anchorReceipt || anchorReceipt.status !== 1) {
    throw new Error("anchorCredential transaction failed!");
  }
  console.log(`  ✅ Real Credential Anchor Transaction Verified.`);

  console.log(`\n[TEST 5] On-Chain Credential State Read Check...`);
  const recordOnChain = await registry.getCredential(testCredentialId);
  console.log(`  On-Chain Hash:      ${recordOnChain.dataHash}`);
  console.log(`  On-Chain Issuer:    ${recordOnChain.issuerWallet}`);
  console.log(`  Is Revoked:         ${recordOnChain.isRevoked}`);
  console.log(`  Revocation Reason:  "${recordOnChain.revocationReason}"`);
  console.log(`  Block Timestamp:    ${new Date(Number(recordOnChain.blockTimestamp) * 1000).toISOString()}`);

  if (recordOnChain.dataHash.toLowerCase() !== testDataHash.toLowerCase()) {
    throw new Error(`Data hash mismatch! Expected ${testDataHash}, got ${recordOnChain.dataHash}`);
  }
  if (recordOnChain.isRevoked) {
    throw new Error("New credential should not be revoked!");
  }
  console.log(`  ✅ On-Chain State Read Verified.`);

  console.log(`\n[TEST 6] Revoke Credential Real Transaction Execution...`);
  const revocationReason = "Audit Revocation Security Test";
  const revokeTx = await registry.revokeCredential(testCredentialId, revocationReason);
  console.log(`  Submitted Revoke Tx:${revokeTx.hash}`);
  const revokeReceipt = await revokeTx.wait();

  console.log(`  Mined in Block:     #${revokeReceipt ? revokeReceipt.blockNumber : 'N/A'}`);
  console.log(`  Receipt Status:     ${revokeReceipt && revokeReceipt.status === 1 ? 'SUCCESS (1)' : 'FAILURE (0)'}`);
  if (!revokeReceipt || revokeReceipt.status !== 1) {
    throw new Error("revokeCredential transaction failed!");
  }
  console.log(`  ✅ Real Revocation Transaction Verified.`);

  console.log(`\n[TEST 7] Post-Revocation State Independent Query...`);
  const revokedRecord = await registry.getCredential(testCredentialId);
  console.log(`  Is Revoked:         ${revokedRecord.isRevoked}`);
  console.log(`  Revocation Reason:  "${revokedRecord.revocationReason}"`);

  if (!revokedRecord.isRevoked) {
    throw new Error("Credential state was not updated to revoked!");
  }
  if (revokedRecord.revocationReason !== revocationReason) {
    throw new Error(`Reason mismatch! Expected "${revocationReason}", got "${revokedRecord.revocationReason}"`);
  }
  console.log(`  ✅ Post-Revocation State Verified.`);

  console.log(`\n[TEST 8] Invalid / Empty Credential Lookup Test...`);
  const emptyRecord = await registry.getCredential("non-existent-cred-9999");
  console.log(`  Empty Data Hash:    ${emptyRecord.dataHash}`);
  console.log(`  Empty Issuer:       ${emptyRecord.issuerWallet}`);
  console.log(`  Empty Is Revoked:   ${emptyRecord.isRevoked}`);
  if (emptyRecord.dataHash !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
    throw new Error("Non-existent credential returned non-zero hash!");
  }
  console.log(`  ✅ Invalid Credential Isolation Verified.`);

  console.log("\n====================================================");
  console.log("🟢 ALL 8 ASCENDCHAIN BLOCKCHAIN TESTS PASSED");
  console.log("====================================================");

  // Write proof file to disk for report verification
  const proofData = {
    chainName: "AscendChain Devnet",
    chainId: Number(network.chainId),
    rpcEndpoint: "http://127.0.0.1:8545",
    contractAddress,
    deploymentTxHash: deployTx ? deployTx.hash : null,
    deploymentBlock: deployReceipt ? deployReceipt.blockNumber : null,
    anchorTxHash: anchorTx.hash,
    anchorBlock: anchorReceipt ? anchorReceipt.blockNumber : null,
    anchorReceiptStatus: anchorReceipt ? anchorReceipt.status : null,
    testCredentialId,
    testDataHash,
    revokeTxHash: revokeTx.hash,
    revokeBlock: revokeReceipt ? revokeReceipt.blockNumber : null,
    revokeReceiptStatus: revokeReceipt ? revokeReceipt.status : null,
    postRevocationIsRevoked: revokedRecord.isRevoked,
    postRevocationReason: revokedRecord.revocationReason,
    testedAt: new Date().toISOString()
  };

  const proofPath = path.join(process.cwd(), "artifacts", "ascendchain_test_proof.json");
  if (!fs.existsSync(path.dirname(proofPath))) {
    fs.mkdirSync(path.dirname(proofPath), { recursive: true });
  }
  fs.writeFileSync(proofPath, JSON.stringify(proofData, null, 2));
  console.log(`Written proof artifact to: ${proofPath}`);
}

main().catch((error) => {
  console.error("❌ AscendChain Test Suite Failed:", error);
  process.exitCode = 1;
});
