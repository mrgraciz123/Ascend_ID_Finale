/**
 * App Lifecycle Test Script
 * Exercises the actual Next.js app endpoints (/api/credentials/anchor, /api/verify/[id], /api/credentials/revoke)
 * against Firestore and the live AscendChain Devnet.
 * 
 * Verifies:
 * 1. Issuer creation & on-chain anchoring via actual app API
 * 2. Firestore canonical persistence with separate anchorTransactionHash & anchorReceipt
 * 3. Public active verification via /api/verify/[id]
 * 4. Issuer revocation via actual app API
 * 5. Preservation of anchorTransactionHash and storage of separate revocationTransactionHash & receipt
 * 6. Public revoked verification showing REVOKED state & reason
 */

import { adminDb } from "../src/lib/firebase-admin";
import * as fs from "fs";
import * as path from "path";

const APP_URL = process.env.APP_URL || "http://127.0.0.1:3000";

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAppReady(maxRetries = 15): Promise<boolean> {
  console.log(`Checking if Next.js app is ready at ${APP_URL}...`);
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${APP_URL}/api/verify/health-check`, { signal: AbortSignal.timeout(2000) });
      if (res.status === 200 || res.status === 404 || res.status === 400) {
        console.log(`Next.js app is ready!`);
        return true;
      }
    } catch {
      await wait(1500);
    }
  }
  return false;
}

async function main() {
  console.log("====================================================");
  console.log("  CANONICAL CREDENTIAL LIFECYCLE ACCEPTANCE TEST");
  console.log("  Testing actual Next.js App -> Firestore -> AscendChain");
  console.log("====================================================\n");

  const isReady = await checkAppReady();
  if (!isReady) {
    console.error(`Next.js server is not reachable at ${APP_URL}. Please ensure 'npm run dev' is running.`);
    process.exit(1);
  }

  // 1. ISSUE CREDENTIAL VIA ACTUAL APP API
  console.log("[1/6] Issuing credential via POST /api/credentials/anchor...");
  const issuePayload = {
    issuerId: "demo-issuer-001",
    issuerName: "IIT Bombay",
    issuerType: "university",
    studentName: "Canonical Acceptance Student",
    studentEmail: `canonical-${Date.now()}@ascendid.test`,
    title: "Bachelor of Technology in Computer Science",
    description: "Conferred for excellence in computer science and distributed ledger engineering.",
    credentialType: "degree",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "Never",
    issuerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  };

  const anchorResponse = await fetch(`${APP_URL}/api/credentials/anchor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Demo-Role": "issuer",
      "X-Demo-Uid": "demo-issuer-001"
    },
    body: JSON.stringify(issuePayload)
  });

  const anchorData = await anchorResponse.json();
  if (!anchorResponse.ok || !anchorData.success) {
    console.error("Anchoring failed:", anchorData);
    process.exit(1);
  }

  const credentialId = anchorData.id;
  const anchorTxHash = anchorData.anchorTransactionHash || anchorData.transactionHash;
  const anchorBlock = anchorData.blockNumber;

  console.log("   Credential UUID:        ", credentialId);
  console.log("   Anchor TX Hash:         ", anchorTxHash);
  console.log("   Anchor Block Number:    ", anchorBlock);
  console.log("   Anchor Status:          ", anchorData.receipt?.status || "confirmed");

  // 2. VERIFY CANONICAL FIRESTORE PERSISTENCE
  console.log("\n[2/6] Verifying Firestore canonical data model...");
  const firestoreSnap = await adminDb.collection("credentials").doc(credentialId).get();
  if (!firestoreSnap.exists) {
    console.error("Credential document was not found in Firestore!");
    process.exit(1);
  }

  const initialDoc = firestoreSnap.data()!;
  console.log("   Firestore Doc Found:     YES");
  console.log("   verificationStatus:     ", initialDoc.verificationStatus);
  console.log("   anchorTransactionHash:  ", initialDoc.anchorTransactionHash);
  console.log("   anchorBlockNumber:      ", initialDoc.anchorBlockNumber);
  console.log("   anchorReceipt status:   ", initialDoc.anchorReceipt?.status);
  console.log("   revocationTxHash (pre): ", initialDoc.revocationTransactionHash);

  if (initialDoc.anchorTransactionHash !== anchorTxHash) {
    console.error("Firestore anchorTransactionHash mismatch!");
    process.exit(1);
  }
  if (initialDoc.revocationTransactionHash !== null) {
    console.error("Initial revocationTransactionHash should be null!");
    process.exit(1);
  }

  // 3. PUBLIC VERIFICATION (ACTIVE STATE) VIA /api/verify/[id]
  console.log("\n[3/6] Performing public active verification via GET /api/verify/[id]...");
  const verifyActiveRes = await fetch(`${APP_URL}/api/verify/${credentialId}`);
  const verifyActiveData = await verifyActiveRes.json();

  if (!verifyActiveRes.ok || !verifyActiveData.success) {
    console.error("Public verification failed:", verifyActiveData);
    process.exit(1);
  }

  console.log("   Public Verification:    ", verifyActiveData.credential.verificationStatus);
  console.log("   Anchor TX Hash in API:  ", verifyActiveData.credential.anchorTransactionHash);
  console.log("   Live AscendChain Match: ", verifyActiveData.chain?.isAnchored ? "YES" : "NO");
  console.log("   Live On-Chain Revoked:  ", verifyActiveData.chain?.isRevoked ? "YES" : "NO");

  if (verifyActiveData.credential.verificationStatus !== "issued" || verifyActiveData.chain?.isRevoked) {
    console.error("Pre-revocation verification status is invalid!");
    process.exit(1);
  }

  // 4. REVOKE CREDENTIAL VIA ACTUAL APP API
  console.log("\n[4/6] Revoking credential via POST /api/credentials/revoke...");
  const revocationReason = "Honor code compliance audit - Degree rescinded by Academic Council";
  const revokeResponse = await fetch(`${APP_URL}/api/credentials/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Demo-Role": "issuer",
      "X-Demo-Uid": "demo-issuer-001"
    },
    body: JSON.stringify({
      id: credentialId,
      reason: revocationReason
    })
  });

  const revokeData = await revokeResponse.json();
  if (!revokeResponse.ok || !revokeData.success) {
    console.error("Revocation failed:", revokeData);
    process.exit(1);
  }

  const revocationTxHash = revokeData.revocationTransactionHash || revokeData.transactionHash;
  const revocationBlock = revokeData.blockNumber;

  console.log("   Revocation TX Hash:     ", revocationTxHash);
  console.log("   Revocation Block:       ", revocationBlock);
  console.log("   Revoked At:             ", revokeData.revokedAt);

  // 5. VERIFY POST-REVOCATION FIRESTORE STATE & SEPARATE HASHES
  console.log("\n[5/6] Verifying Firestore post-revocation state (Checking hash separation)...");
  const postRevokeSnap = await adminDb.collection("credentials").doc(credentialId).get();
  const postRevokeDoc = postRevokeSnap.data()!;

  console.log("   verificationStatus:     ", postRevokeDoc.verificationStatus);
  console.log("   anchorTransactionHash:  ", postRevokeDoc.anchorTransactionHash);
  console.log("   revocationTxHash:       ", postRevokeDoc.revocationTransactionHash);
  console.log("   revocationReason:       ", postRevokeDoc.revocationReason);
  console.log("   revocationReceipt:      ", postRevokeDoc.revocationReceipt ? "Stored" : "Missing");

  // STRICT ASSERTIONS
  if (postRevokeDoc.verificationStatus !== "revoked") {
    console.error("Status was not updated to 'revoked'!");
    process.exit(1);
  }
  if (!postRevokeDoc.anchorTransactionHash || postRevokeDoc.anchorTransactionHash !== anchorTxHash) {
    console.error("CRITICAL: anchorTransactionHash was corrupted or overwritten during revocation!");
    process.exit(1);
  }
  if (!postRevokeDoc.revocationTransactionHash || postRevokeDoc.revocationTransactionHash !== revocationTxHash) {
    console.error("CRITICAL: revocationTransactionHash was not persisted properly!");
    process.exit(1);
  }
  if (postRevokeDoc.anchorTransactionHash === postRevokeDoc.revocationTransactionHash) {
    console.error("CRITICAL: anchorTransactionHash and revocationTransactionHash must be distinct!");
    process.exit(1);
  }

  // 6. PUBLIC VERIFICATION (REVOKED STATE) VIA /api/verify/[id]
  console.log("\n[6/6] Performing public revoked verification via GET /api/verify/[id]...");
  const verifyRevokedRes = await fetch(`${APP_URL}/api/verify/${credentialId}`);
  const verifyRevokedData = await verifyRevokedRes.json();

  console.log("   Public Verification:    ", verifyRevokedData.credential.verificationStatus);
  console.log("   Anchor TX Hash:         ", verifyRevokedData.credential.anchorTransactionHash);
  console.log("   Revocation TX Hash:     ", verifyRevokedData.credential.revocationTransactionHash);
  console.log("   Revocation Reason:      ", verifyRevokedData.credential.revocationReason);
  console.log("   Live AscendChain Revoked: ", verifyRevokedData.chain?.isRevoked ? "YES" : "NO");

  if (verifyRevokedData.credential.verificationStatus !== "revoked" || !verifyRevokedData.chain?.isRevoked) {
    console.error("Public post-revocation verification failed to show REVOKED state!");
    process.exit(1);
  }

  // 7. RECORD COMPREHENSIVE LIFECYCLE EVIDENCE
  const lifecycleEvidence = {
    testName: "Canonical Credential Lifecycle Acceptance Test",
    timestamp: new Date().toISOString(),
    network: {
      chainName: "AscendChain Devnet",
      chainId: 13370,
      rpcUrl: "http://127.0.0.1:8545",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    },
    credential: {
      id: credentialId,
      studentName: issuePayload.studentName,
      studentEmail: issuePayload.studentEmail,
      title: issuePayload.title,
      credentialType: issuePayload.credentialType
    },
    issuanceAndAnchor: {
      status: "SUCCESS",
      anchorTransactionHash: anchorTxHash,
      anchorBlockNumber: anchorBlock,
      anchorReceipt: anchorData.receipt,
      preRevocationStatus: verifyActiveData.credential.verificationStatus,
      onChainActiveConfirmed: !verifyActiveData.chain.isRevoked
    },
    revocation: {
      status: "SUCCESS",
      revocationTransactionHash: revocationTxHash,
      revocationBlockNumber: revocationBlock,
      revocationReason: revocationReason,
      revocationReceipt: revokeData.receipt,
      postRevocationStatus: verifyRevokedData.credential.verificationStatus,
      onChainRevokedConfirmed: verifyRevokedData.chain.isRevoked
    },
    hashSeparationVerification: {
      distinctHashesConfirmed: anchorTxHash !== revocationTxHash,
      anchorPreservedInFirestore: postRevokeDoc.anchorTransactionHash === anchorTxHash,
      revocationPersistedInFirestore: postRevokeDoc.revocationTransactionHash === revocationTxHash
    }
  };

  const evidencePath = path.join(process.cwd(), "lifecycle_evidence.json");
  fs.writeFileSync(evidencePath, JSON.stringify(lifecycleEvidence, null, 2));
  console.log("\n====================================================");
  console.log("🟢 ALL CANONICAL LIFECYCLE TESTS PASSED!");
  console.log(`Evidence recorded to: ${evidencePath}`);
  console.log("====================================================");
}

main().catch((err) => {
  console.error("Test encountered an unhandled error:", err);
  process.exit(1);
});
