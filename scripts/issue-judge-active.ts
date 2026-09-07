import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function issueActiveJudgeCredential() {
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
  const idToken = exchangeData.idToken;

  const issuePayload = {
    studentName: "Priya Patel",
    studentEmail: "priya.patel@iitb.ac.in",
    credentialType: "degree",
    title: "Bachelor of Technology in Computer Science and Engineering",
    description: "Conferred with First Class Distinction by the Senate of Indian Institute of Technology Bombay.",
    issuerName: "Indian Institute of Technology Bombay",
    issuerId: uid,
    issueDate: "2026-05-18",
    expiryDate: "Never",
    skills: ["Distributed Systems", "Cryptography", "Machine Learning", "Data Structures"]
  };

  const anchorRes = await fetch("http://localhost:3000/api/credentials/anchor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(issuePayload)
  });

  const anchorData = await anchorRes.json();
  console.log("Active Judge Credential Created!");
  console.log(`Credential ID: ${anchorData.credentialId || anchorData.id}`);
  console.log(`Metadata Hash: ${anchorData.metadataHash}`);
  console.log(`Anchor TX: ${anchorData.transactionHash}`);
  console.log(`Block Number: ${anchorData.blockNumber}`);
  console.log(`Public URL: http://localhost:3000/verify/${anchorData.credentialId || anchorData.id}`);
}

issueActiveJudgeCredential().catch(console.error);
