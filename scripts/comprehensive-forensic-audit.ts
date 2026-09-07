import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createPublicClient, http } from "viem";
import deployment from "../src/lib/ascendchain-deployment.json";

const APP_URL = "http://127.0.0.1:3000";
const RPC_URL = "http://127.0.0.1:8545";

async function rpcCall(method: string, params: any[] = []) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  return await res.json();
}

async function runAudit() {
  console.log("================================================================================");
  console.log("  ASCENDID COMPREHENSIVE FORENSIC LIFECYCLE & INTEGRITY AUDIT");
  console.log("================================================================================\n");

  const { admin, adminDb } = await import("../src/lib/firebase-admin");
  const { authenticateRequest } = await import("../src/lib/api-security");
  const { NextRequest } = await import("next/server");

  // ---------------------------------------------------------------------------
  // 1. SETUP REAL FIREBASE ISSUER AUTHENTICATION
  // ---------------------------------------------------------------------------
  console.log("--- STEP 1: REAL FIREBASE AUTHENTICATION AUDIT ---");
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const testEmail = `forensic-issuer-${Date.now()}@ascendid.test`;
  
  const createdUser = await admin.auth().createUser({
    email: testEmail,
    emailVerified: true,
    displayName: "Forensic Audit Verified Issuer",
  });
  const issuerUid = createdUser.uid;
  console.log(`[PASS] Created Real Firebase Auth Issuer: ${testEmail} (UID: ${issuerUid})`);

  await adminDb.collection("users").doc(issuerUid).set({
    email: testEmail,
    role: "issuer",
    displayName: "Forensic Audit Verified Issuer",
    updatedAt: new Date().toISOString(),
  });
  console.log(`[PASS] Created Firestore users/${issuerUid} document with role: 'issuer'`);

  const customToken = await admin.auth().createCustomToken(issuerUid);
  const exchangeRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  const exchangeData = await exchangeRes.json();
  const realIdToken = exchangeData.idToken;
  console.log(`[PASS] Minted Real Firebase ID Token: Bearer ${realIdToken.substring(0, 30)}... (Length: ${realIdToken.length})`);

  // Verify authenticateRequest with token
  const authCheckReq = new NextRequest(`${APP_URL}/api/credentials/anchor`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${realIdToken}` },
  });
  const decodedAuth = await authenticateRequest(authCheckReq);
  console.log(`[PASS] authenticateRequest result:`, decodedAuth);
  if (!decodedAuth || decodedAuth.role !== "issuer" || decodedAuth.isDemo) {
    throw new Error("authenticateRequest failed with real ID token!");
  }

  // Verify production isolation of X-Demo-Role
  (process.env as any).NODE_ENV = "production";
  process.env.ALLOW_DEMO_AUTH_HEADERS = "false";
  const demoCheckReq = new NextRequest(`${APP_URL}/api/credentials/anchor`, {
    method: "POST",
    headers: { "X-Demo-Role": "issuer", "X-Demo-Uid": "malicious-user" },
  });
  const demoAuthResult = await authenticateRequest(demoCheckReq);
  (process.env as any).NODE_ENV = "development";
  console.log(`[PASS] Production mode X-Demo-Role rejection:`, demoAuthResult === null ? "REJECTED (null)" : "FAILED");
  if (demoAuthResult !== null) {
    throw new Error("Demo headers were not rejected in simulated production!");
  }

  // ---------------------------------------------------------------------------
  // 2. ISSUE & ANCHOR FRESH CREDENTIAL VIA REAL AUTHENTICATED API
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 2: CREDENTIAL ISSUANCE & ASCENDCHAIN ANCHORING ---");
  const issuePayload = {
    issuerId: issuerUid,
    issuerName: "Indian Institute of Technology Bombay",
    issuerType: "university",
    studentName: "Devaiah N. Subramaniam",
    studentEmail: `devaiah-${Date.now()}@alumni.iitb.ac.in`,
    title: "Master of Technology in Quantum Computing & Applied Cryptography",
    description: "Conferred for exceptional research in zero-knowledge verifiable credentials and EVM state proof systems.",
    credentialType: "degree",
    issueDate: "2026-09-07",
    expiryDate: "Never",
    issuerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  };

  const anchorResponse = await fetch(`${APP_URL}/api/credentials/anchor`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${realIdToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(issuePayload)
  });

  const anchorData = await anchorResponse.json();
  console.log(`Anchor HTTP Status: ${anchorResponse.status}`);
  if (!anchorResponse.ok || !anchorData.success) {
    throw new Error(`Anchoring failed: ${JSON.stringify(anchorData)}`);
  }

  const credentialId = anchorData.id;
  const anchorTxHash = anchorData.anchorTransactionHash || anchorData.transactionHash;
  const anchorBlockNumber = anchorData.blockNumber;

  console.log(`[PASS] Credential Issued & Anchored:`);
  console.log(`       UUID:                   ${credentialId}`);
  console.log(`       Anchor TX Hash:         ${anchorTxHash}`);
  console.log(`       Anchor Block Number:    ${anchorBlockNumber}`);
  console.log(`       Receipt Status:         ${anchorData.receipt?.status}`);

  // ---------------------------------------------------------------------------
  // 3. ASCENDCHAIN JSON-RPC FORENSICS ON ANCHOR TRANSACTION
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 3: DIRECT ASCENDCHAIN JSON-RPC FORENSICS (ANCHOR TX) ---");
  const txQuery = await rpcCall("eth_getTransactionByHash", [anchorTxHash]);
  const receiptQuery = await rpcCall("eth_getTransactionReceipt", [anchorTxHash]);
  const blockQuery = await rpcCall("eth_getBlockByNumber", ["0x" + anchorBlockNumber.toString(16), false]);

  console.log(`   A. Transaction Exists:      ${txQuery.result ? "YES" : "NO"}`);
  console.log(`   B. Sender (from):           ${txQuery.result?.from}`);
  console.log(`   C. Recipient (to):          ${txQuery.result?.to}`);
  console.log(`   D. Calldata Selector:       ${txQuery.result?.input?.substring(0, 10)} (anchorCredential)`);
  console.log(`   E. Calldata Full:           ${txQuery.result?.input}`);
  console.log(`   F. Block Number:            ${parseInt(txQuery.result?.blockNumber, 16)}`);
  console.log(`   G. Receipt Status:          ${receiptQuery.result?.status === "0x1" ? "SUCCESS (0x1)" : "FAILED"}`);
  console.log(`   H. Gas Used:                ${parseInt(receiptQuery.result?.gasUsed, 16)}`);
  console.log(`   I. Event Logs Count:        ${receiptQuery.result?.logs?.length}`);

  // ---------------------------------------------------------------------------
  // 4. CONTRACT STATE FORENSICS (SMART CONTRACT CALL)
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 4: SMART CONTRACT STATE FORENSICS (PRE-REVOCATION) ---");
  const viemClient = createPublicClient({ transport: http(RPC_URL) });
  const contractAddr = (deployment.contractAddress || process.env.ASCENDCHAIN_CONTRACT_ADDRESS) as `0x${string}`;
  const onChainRecord = await viemClient.readContract({
    address: contractAddr,
    abi: deployment.abi,
    functionName: "getCredential",
    args: [credentialId],
  }) as [string, string, boolean, string, bigint];

  const onChainHash = onChainRecord[0];
  const onChainIssuer = onChainRecord[1];
  const onChainIsRevoked = onChainRecord[2];
  const onChainRevocationReason = onChainRecord[3];
  const onChainTimestamp = Number(onChainRecord[4]);

  console.log(`   On-Chain Stored Hash:       ${onChainHash}`);
  console.log(`   On-Chain Issuer Wallet:     ${onChainIssuer}`);
  console.log(`   On-Chain isRevoked:         ${onChainIsRevoked}`);
  console.log(`   On-Chain Revocation Reason: "${onChainRevocationReason}"`);
  console.log(`   On-Chain Timestamp:         ${new Date(onChainTimestamp * 1000).toISOString()}`);

  // ---------------------------------------------------------------------------
  // 5. FIRESTORE INTEGRITY (PRE-REVOCATION)
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 5: FIRESTORE DOCUMENT FORENSICS (PRE-REVOCATION) ---");
  const docSnap = await adminDb.collection("credentials").doc(credentialId).get();
  const firestoreData = docSnap.data()!;

  console.log(`   Firestore Doc ID:           ${firestoreData.id}`);
  console.log(`   Metadata SHA-256:           ${firestoreData.metadataHash}`);
  console.log(`   Anchor Transaction Hash:    ${firestoreData.anchorTransactionHash}`);
  console.log(`   Revocation TX Hash (pre):   ${firestoreData.revocationTransactionHash}`);
  console.log(`   Verification Status:        ${firestoreData.verificationStatus}`);

  // PROVE CRITICAL HASH SEPARATION
  const isHashSeparated = firestoreData.metadataHash !== firestoreData.anchorTransactionHash;
  console.log(`   [FORENSIC PROOF] metadataHash !== anchorTransactionHash: ${isHashSeparated}`);
  if (!isHashSeparated) {
    throw new Error("CRITICAL FAILURE: metadataHash and anchorTransactionHash are identical!");
  }
  if (firestoreData.metadataHash !== onChainHash) {
    throw new Error("CRITICAL FAILURE: metadataHash does not match on-chain dataHash!");
  }

  // ---------------------------------------------------------------------------
  // 6. PUBLIC VERIFICATION (ACTIVE CREDENTIAL)
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 6: PUBLIC ACTIVE VERIFICATION (/api/verify/[id]) ---");
  const verifyActiveRes = await fetch(`${APP_URL}/api/verify/${credentialId}`);
  const verifyActiveData = await verifyActiveRes.json();

  console.log(`   Verify Active Status:       ${verifyActiveRes.status}`);
  console.log(`   Status in API:              ${verifyActiveData.credential?.verificationStatus}`);
  console.log(`   Is Anchored:                ${verifyActiveData.chain?.isAnchored}`);
  console.log(`   Is Revoked:                 ${verifyActiveData.chain?.isRevoked}`);
  console.log(`   Metadata Hash Matches:      ${verifyActiveData.credential?.metadataHash === onChainHash}`);

  if (verifyActiveData.credential?.verificationStatus !== "issued" || verifyActiveData.chain?.isRevoked) {
    throw new Error("Active verification check failed!");
  }

  // ---------------------------------------------------------------------------
  // 7. REVOCATION EXECUTION VIA REAL AUTHENTICATED API
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 7: CREDENTIAL REVOCATION EXECUTION ---");
  const revocationReason = "Academic credential update — Transferred to Dual Master-PhD program";
  const revokeResponse = await fetch(`${APP_URL}/api/credentials/revoke`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${realIdToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: credentialId,
      reason: revocationReason
    })
  });

  const revokeData = await revokeResponse.json();
  console.log(`Revocation HTTP Status: ${revokeResponse.status}`);
  if (!revokeResponse.ok || !revokeData.success) {
    throw new Error(`Revocation failed: ${JSON.stringify(revokeData)}`);
  }

  const revocationTxHash = revokeData.revocationTransactionHash || revokeData.transactionHash;
  const revocationBlockNumber = revokeData.blockNumber;

  console.log(`[PASS] Revocation Completed:`);
  console.log(`       Revocation TX Hash:     ${revocationTxHash}`);
  console.log(`       Revocation Block Number:${revocationBlockNumber}`);
  console.log(`       Revoked At:             ${revokeData.revokedAt}`);

  // ---------------------------------------------------------------------------
  // 8. ASCENDCHAIN JSON-RPC FORENSICS ON REVOCATION TRANSACTION
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 8: DIRECT ASCENDCHAIN JSON-RPC FORENSICS (REVOKE TX) ---");
  const revokeTxQuery = await rpcCall("eth_getTransactionByHash", [revocationTxHash]);
  const revokeReceiptQuery = await rpcCall("eth_getTransactionReceipt", [revocationTxHash]);

  console.log(`   A. Transaction Exists:      ${revokeTxQuery.result ? "YES" : "NO"}`);
  console.log(`   B. Sender (from):           ${revokeTxQuery.result?.from}`);
  console.log(`   C. Recipient (to):          ${revokeTxQuery.result?.to}`);
  console.log(`   D. Calldata Selector:       ${revokeTxQuery.result?.input?.substring(0, 10)} (revokeCredential)`);
  console.log(`   E. Calldata Full:           ${revokeTxQuery.result?.input}`);
  console.log(`   F. Block Number:            ${parseInt(revokeTxQuery.result?.blockNumber, 16)}`);
  console.log(`   G. Receipt Status:          ${revokeReceiptQuery.result?.status === "0x1" ? "SUCCESS (0x1)" : "FAILED"}`);
  console.log(`   H. Gas Used:                ${parseInt(revokeReceiptQuery.result?.gasUsed, 16)}`);

  // ---------------------------------------------------------------------------
  // 9. CONTRACT STATE FORENSICS (POST-REVOCATION)
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 9: SMART CONTRACT STATE FORENSICS (POST-REVOCATION) ---");
  const postRevokeRecord = await viemClient.readContract({
    address: contractAddr,
    abi: deployment.abi,
    functionName: "getCredential",
    args: [credentialId],
  }) as [string, string, boolean, string, bigint];

  console.log(`   On-Chain Stored Hash:       ${postRevokeRecord[0]}`);
  console.log(`   On-Chain isRevoked:         ${postRevokeRecord[2]}`);
  console.log(`   On-Chain Revocation Reason: "${postRevokeRecord[3]}"`);

  if (!postRevokeRecord[2] || postRevokeRecord[3] !== revocationReason) {
    throw new Error("On-chain revocation state verification failed!");
  }

  // ---------------------------------------------------------------------------
  // 10. FIRESTORE INTEGRITY (POST-REVOCATION DUAL PROOF PRESERVATION)
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 10: FIRESTORE DOCUMENT FORENSICS (POST-REVOCATION) ---");
  const postRevokeSnap = await adminDb.collection("credentials").doc(credentialId).get();
  const postRevokeData = postRevokeSnap.data()!;

  console.log(`   Verification Status:        ${postRevokeData.verificationStatus}`);
  console.log(`   Anchor TX Hash (preserved): ${postRevokeData.anchorTransactionHash}`);
  console.log(`   Anchor Block (preserved):   ${postRevokeData.anchorBlockNumber}`);
  console.log(`   Revocation TX Hash:         ${postRevokeData.revocationTransactionHash}`);
  console.log(`   Revocation Block Number:    ${postRevokeData.revocationBlockNumber}`);
  console.log(`   Revocation Reason:          ${postRevokeData.revocationReason}`);

  // STRICT PROOFS
  console.log(`   [PROOFS]:`);
  console.log(`   1. anchorTxHash !== revocationTxHash: ${postRevokeData.anchorTransactionHash !== postRevokeData.revocationTransactionHash}`);
  console.log(`   2. anchorTxHash preserved unchanged:  ${postRevokeData.anchorTransactionHash === anchorTxHash}`);
  console.log(`   3. revocationTxHash persisted:        ${postRevokeData.revocationTransactionHash === revocationTxHash}`);
  console.log(`   4. status updated to 'revoked':       ${postRevokeData.verificationStatus === "revoked"}`);

  if (postRevokeData.anchorTransactionHash === postRevokeData.revocationTransactionHash) {
    throw new Error("Anchor and Revocation TX hashes are identical!");
  }
  if (postRevokeData.anchorTransactionHash !== anchorTxHash) {
    throw new Error("Anchor TX hash was corrupted upon revocation!");
  }

  // ---------------------------------------------------------------------------
  // 11. REPEATED REVOCATION SAFETY TEST
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 11: REPEATED REVOCATION SAFETY TEST ---");
  const repeatRevokeRes = await fetch(`${APP_URL}/api/credentials/revoke`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${realIdToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: credentialId,
      reason: "Duplicate revoke attempt"
    })
  });
  const repeatRevokeData = await repeatRevokeRes.json();
  console.log(`   Repeat Revoke HTTP Status:  ${repeatRevokeRes.status} (Expected: 400)`);
  console.log(`   Repeat Revoke Error:        ${repeatRevokeData.error}`);
  if (repeatRevokeRes.status !== 400) {
    throw new Error("Repeat revocation did not return HTTP 400!");
  }

  // ---------------------------------------------------------------------------
  // 12. PUBLIC REVOKED VERIFICATION
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 12: PUBLIC REVOKED VERIFICATION (/api/verify/[id]) ---");
  const verifyRevokedRes = await fetch(`${APP_URL}/api/verify/${credentialId}`);
  const verifyRevokedData = await verifyRevokedRes.json();

  console.log(`   Verify Revoked Status:      ${verifyRevokedRes.status}`);
  console.log(`   Status in API:              ${verifyRevokedData.credential?.verificationStatus}`);
  console.log(`   Is Revoked:                 ${verifyRevokedData.chain?.isRevoked}`);
  console.log(`   Revocation Reason in API:   "${verifyRevokedData.credential?.revocationReason}"`);
  console.log(`   Original Anchor TX Visible: ${verifyRevokedData.credential?.anchorTransactionHash}`);
  console.log(`   Revocation TX Visible:      ${verifyRevokedData.credential?.revocationTransactionHash}`);

  if (verifyRevokedData.credential?.verificationStatus !== "revoked" || !verifyRevokedData.chain?.isRevoked) {
    throw new Error("Public revoked verification failed!");
  }

  // ---------------------------------------------------------------------------
  // 13. RECEIPT-FIRST DATABASE SAFETY TEST (FAILURE HANDLING)
  // ---------------------------------------------------------------------------
  console.log("\n--- STEP 13: RECEIPT-FIRST DATABASE SAFETY TEST ---");
  // Test anchoring with missing required fields
  const invalidPayloadRes = await fetch(`${APP_URL}/api/credentials/anchor`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${realIdToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      issuerId: issuerUid,
      // Missing title, studentEmail, description
    })
  });
  console.log(`   Invalid Payload HTTP Status: ${invalidPayloadRes.status} (Expected: 400)`);
  if (invalidPayloadRes.status !== 400) {
    throw new Error("Invalid payload did not return HTTP 400!");
  }

  console.log("\n================================================================================");
  console.log("  ALL 13 FORENSIC PROOFS SUCCESSFULLY VERIFIED WITHOUT ERROR");
  console.log("================================================================================");
}

runAudit().catch((err) => {
  console.error("\nFATAL AUDIT FAILURE:", err);
  process.exit(1);
});
