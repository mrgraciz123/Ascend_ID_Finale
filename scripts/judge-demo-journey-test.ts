import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function getRealIssuerToken(): Promise<{ idToken: string; uid: string }> {
  const { admin, adminDb } = await import("../src/lib/firebase-admin");
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const testEmail = "judge-demo-issuer@ascendid.test";
  let uid = "judge-demo-issuer-uid";

  try {
    const existing = await admin.auth().getUserByEmail(testEmail);
    uid = existing.uid;
  } catch {
    const created = await admin.auth().createUser({
      email: testEmail,
      emailVerified: true,
      displayName: "Indian Institute of Technology Bombay",
    });
    uid = created.uid;
  }

  // Ensure role is issuer in Firestore
  await adminDb.collection("users").doc(uid).set({
    email: testEmail,
    role: "issuer",
    displayName: "Indian Institute of Technology Bombay",
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  const customToken = await admin.auth().createCustomToken(uid);
  const exchangeRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );

  const exchangeData = await exchangeRes.json();
  if (!exchangeData.idToken) {
    throw new Error(`Token exchange failed: ${JSON.stringify(exchangeData)}`);
  }

  return { idToken: exchangeData.idToken, uid };
}

async function runJudgeDemoJourney() {
  console.log("=== ASCENDID JUDGE-FACING DEMO JOURNEY TEST ===");
  console.log("Testing full canonical lifecycle via actual Next.js application endpoints with REAL Firebase Auth...\n");

  console.log("0. Obtaining REAL Firebase ID Token for Authorized Issuer...");
  const { idToken, uid: issuerUid } = await getRealIssuerToken();
  console.log(`   Obtained Real Firebase Token for UID: ${issuerUid}`);

  const timestamp = Date.now();
  const studentEmail = `judge.demo.${timestamp}@test.edu`;
  const studentName = "Aarav Sharma (Judge Demo)";
  const title = "Master of Science in Autonomous Systems";

  // Step 1: Issue and Anchor Credential via /api/credentials/anchor
  console.log("\n1. Executing Issue & Anchor via POST /api/credentials/anchor with Real Bearer Token...");
  const issuePayload = {
    studentName,
    studentEmail,
    credentialType: "degree",
    title,
    description: "Official Master of Science Degree conferred by Indian Institute of Technology Bombay.",
    issuerName: "Indian Institute of Technology Bombay",
    issuerId: issuerUid,
    issueDate: "2026-06-15",
    expiryDate: "Never",
    skills: ["Autonomous Robotics", "Deep Learning", "Sensor Fusion"]
  };

  const anchorRes = await fetch("http://localhost:3000/api/credentials/anchor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(issuePayload)
  });

  if (!anchorRes.ok) {
    throw new Error(`Anchor endpoint failed with status ${anchorRes.status}: ${await anchorRes.text()}`);
  }

  const anchorData = await anchorRes.json();
  const credId = anchorData.credentialId || anchorData.id;
  console.log("   Issue & Anchor succeeded!");
  console.log(`   Credential ID: ${credId}`);
  console.log(`   Metadata SHA-256 Hash: ${anchorData.metadataHash}`);
  console.log(`   Anchor EVM TX Hash: ${anchorData.transactionHash}`);
  console.log(`   Anchor Block Number: ${anchorData.blockNumber}`);

  const metadataHash = anchorData.metadataHash;
  const anchorTx = anchorData.transactionHash;
  const anchorBlock = anchorData.blockNumber;

  // Step 2: Public Verification (Active State)
  console.log("\n2. Querying Public Verification endpoint GET /api/verify/[id] (Active State)...");
  const verifyActiveRes = await fetch(`http://localhost:3000/api/verify/${credId}`);
  if (!verifyActiveRes.ok) {
    throw new Error(`Public verification endpoint failed with status ${verifyActiveRes.status}`);
  }

  const verifyActiveData = await verifyActiveRes.json();
  console.log("   Public Verification Query succeeded!");
  console.log(`   Firestore Status: ${verifyActiveData.credential.status || verifyActiveData.credential.verificationStatus}`);
  console.log(`   AscendChain Record Hash: ${verifyActiveData.chain?.record?.hash}`);
  console.log(`   AscendChain isRevoked: ${verifyActiveData.chain?.record?.isRevoked}`);
  console.log(`   AscendChain blockTimestamp: ${verifyActiveData.chain?.record?.blockTimestamp}`);

  // Assertions for Active State
  if (verifyActiveData.chain?.record?.isRevoked !== false) {
    throw new Error("FAIL: Credential should NOT be revoked upon initial issuance!");
  }
  if (verifyActiveData.chain?.record?.hash.toLowerCase() !== metadataHash.toLowerCase()) {
    throw new Error(`FAIL: Chain record hash ${verifyActiveData.chain?.record?.hash} does not match metadata hash ${metadataHash}!`);
  }

  // Step 3: Issuer Revocation via POST /api/credentials/revoke
  console.log("\n3. Executing Issuer Revocation via POST /api/credentials/revoke with Real Bearer Token...");
  const revokeReason = "Academic Integrity Review - Retracted for Correction";
  const revokePayload = {
    credentialId: credId,
    reason: revokeReason,
    revokedBy: issuerUid
  };

  const revokeRes = await fetch("http://localhost:3000/api/credentials/revoke", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(revokePayload)
  });

  if (!revokeRes.ok) {
    throw new Error(`Revocation endpoint failed with status ${revokeRes.status}: ${await revokeRes.text()}`);
  }

  const revokeData = await revokeRes.json();
  console.log("   Revocation succeeded!");
  console.log(`   Revocation EVM TX Hash: ${revokeData.revocationTransactionHash}`);
  console.log(`   Revocation Block Number: ${revokeData.revocationBlockNumber}`);
  console.log(`   Original Anchor TX Hash (Preserved): ${revokeData.anchorTransactionHash}`);

  const revokeTx = revokeData.revocationTransactionHash;
  const revokeBlock = revokeData.revocationBlockNumber;

  if (revokeTx === anchorTx) {
    throw new Error("FAIL: Revocation TX Hash MUST NOT equal Anchor TX Hash!");
  }

  // Step 4: Public Verification (Revoked State)
  console.log("\n4. Querying Public Verification endpoint GET /api/verify/[id] (Revoked State)...");
  const verifyRevokedRes = await fetch(`http://localhost:3000/api/verify/${credId}`);
  if (!verifyRevokedRes.ok) {
    throw new Error(`Public verification failed with status ${verifyRevokedRes.status}`);
  }

  const verifyRevokedData = await verifyRevokedRes.json();
  console.log("   Public Verification Query succeeded!");
  console.log(`   Firestore Status: ${verifyRevokedData.credential.verificationStatus}`);
  console.log(`   AscendChain isRevoked: ${verifyRevokedData.chain?.record?.isRevoked}`);
  console.log(`   AscendChain revocationReason: "${verifyRevokedData.chain?.record?.revocationReason}"`);
  console.log(`   Preserved Anchor TX: ${verifyRevokedData.credential.anchorTransactionHash || verifyRevokedData.credential.blockchain?.transactionHash}`);
  console.log(`   Recorded Revocation TX: ${verifyRevokedData.credential.revocationTransactionHash}`);

  // Assertions for Revoked State
  if (verifyRevokedData.chain?.record?.isRevoked !== true) {
    throw new Error("FAIL: Credential should be marked isRevoked=true on AscendChain!");
  }
  if (!verifyRevokedData.chain?.record?.revocationReason.includes("Academic Integrity Review")) {
    throw new Error(`FAIL: Revocation reason on-chain "${verifyRevokedData.chain?.record?.revocationReason}" does not match expected!`);
  }
  if (!verifyRevokedData.credential.anchorTransactionHash && !verifyRevokedData.credential.blockchain?.transactionHash) {
    throw new Error("FAIL: Original anchor transaction was lost in Firestore record!");
  }

  console.log("\n=======================================================");
  console.log("ALL VERIFICATIONS PASSED WITH REAL ON-CHAIN EVIDENCE!");
  console.log(`Demo Credential ID: ${credId}`);
  console.log(`Public Verification URL: http://localhost:3000/verify/${credId}`);
  console.log("=======================================================");
}

runJudgeDemoJourney().catch((err) => {
  console.error("FATAL ERROR in judge demo journey:", err);
  process.exit(1);
});
