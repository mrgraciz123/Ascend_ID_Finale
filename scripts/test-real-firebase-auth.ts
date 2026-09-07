import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function runAuthForensics() {
  console.log("=== FIREBASE AUTH FORENSIC TEST ===");
  const { admin, adminDb } = await import("../src/lib/firebase-admin");
  const { authenticateRequest } = await import("../src/lib/api-security");
  const { NextRequest } = await import("next/server");

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const testEmail = "forensic-issuer@ascendid.test";
  let uid = "forensic-issuer-uid";

  // 1. Ensure user exists in Firebase Auth
  try {
    const existing = await admin.auth().getUserByEmail(testEmail);
    uid = existing.uid;
    console.log("Existing Firebase Auth user found:", uid);
  } catch {
    const created = await admin.auth().createUser({
      email: testEmail,
      emailVerified: true,
      displayName: "Forensic Issuer Test",
    });
    uid = created.uid;
    console.log("Created fresh Firebase Auth user:", uid);
  }

  // 2. Ensure Firestore user document has role: issuer
  await adminDb.collection("users").doc(uid).set({
    email: testEmail,
    role: "issuer",
    displayName: "Forensic Issuer Test",
    updatedAt: new Date().toISOString(),
  }, { merge: true });
  console.log("Firestore users/" + uid + " set with role: 'issuer'");

  // 3. Mint custom token and exchange for real Firebase ID Token
  const customToken = await admin.auth().createCustomToken(uid);
  console.log("Minted custom token for UID:", uid);

  const exchangeRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: customToken,
      returnSecureToken: true,
    }),
  });

  const exchangeData = await exchangeRes.json();
  if (!exchangeData.idToken) {
    console.error("Token exchange failed:", exchangeData);
    return;
  }
  const realIdToken = exchangeData.idToken;
  console.log("Obtained REAL Firebase ID Token (length:", realIdToken.length, ")");

  // 4. Test authenticateRequest with real Firebase ID Token
  const reqWithToken = new NextRequest("http://localhost:3000/api/credentials/anchor", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${realIdToken}`,
      "Content-Type": "application/json",
    },
  });

  const authResult = await authenticateRequest(reqWithToken);
  console.log("authenticateRequest with Real Firebase ID Token:", authResult);

  // 5. Test authenticateRequest with X-Demo-Role in simulated PRODUCTION mode
  const originalEnv = process.env.NODE_ENV;
  (process.env as any).NODE_ENV = "production";
  process.env.ALLOW_DEMO_AUTH_HEADERS = "false";

  const reqWithDemoInProd = new NextRequest("http://localhost:3000/api/credentials/anchor", {
    method: "POST",
    headers: {
      "X-Demo-Role": "issuer",
      "X-Demo-Uid": "malicious-actor",
      "Content-Type": "application/json",
    },
  });

  const demoInProdResult = await authenticateRequest(reqWithDemoInProd);
  console.log("authenticateRequest in PRODUCTION with X-Demo-Role (no token):", demoInProdResult);

  // Restore NODE_ENV
  (process.env as any).NODE_ENV = originalEnv;

  // 6. Test actual HTTP endpoint /api/credentials/anchor with Real Firebase ID Token
  const payload = {
    issuerId: uid,
    issuerName: "Forensic IIT Bombay",
    issuerType: "university",
    studentName: "Real Auth Student",
    studentEmail: "real-auth-student@ascendid.test",
    title: "Master of Science in Cryptography",
    description: "Conferred under authenticated audit.",
    credentialType: "degree",
    issueDate: "2026-09-07",
    expiryDate: "Never",
    issuerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  };

  const anchorEndpointRes = await fetch("http://127.0.0.1:3000/api/credentials/anchor", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${realIdToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const anchorData = await anchorEndpointRes.json();
  console.log("POST /api/credentials/anchor with REAL ID Token HTTP Status:", anchorEndpointRes.status);
  console.log("Response:", JSON.stringify(anchorData, null, 2));

  // 7. Test POST /api/credentials/anchor with X-Demo-Role against HTTP server
  // (Notice server currently runs in development mode, but let's test invalid role / no token)
  const unauthRes = await fetch("http://127.0.0.1:3000/api/credentials/anchor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log("POST /api/credentials/anchor with NO AUTH HTTP Status:", unauthRes.status);
}

runAuthForensics().catch(console.error);
