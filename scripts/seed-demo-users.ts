import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seedDemoUsers() {
  const { admin, adminDb } = await import("../src/lib/firebase-admin");

  const users = [
    {
      id: "demo-student-uid",
      email: "student.demo@ascendid.ai",
      displayName: "Aarav Sharma",
      role: "student",
      password: "AscendID_Demo_2026!"
    },
    {
      id: "demo-issuer-uid",
      email: "issuer.demo@ascendid.ai",
      displayName: "IIT Bombay Admin",
      role: "issuer",
      issuerType: "university",
      password: "AscendID_Demo_2026!"
    },
    {
      id: "demo-recruiter-uid",
      email: "recruiter.demo@ascendid.ai",
      displayName: "Google Hiring Lead",
      role: "recruiter",
      password: "AscendID_Demo_2026!"
    },
    {
      id: "demo-gov-uid",
      email: "gov.demo@ascendid.ai",
      displayName: "National Audit Official",
      role: "government",
      password: "AscendID_Demo_2026!"
    }
  ];

  for (const u of users) {
    let authUid = u.id;
    try {
      const existing = await admin.auth().getUserByEmail(u.email);
      authUid = existing.uid;
      await admin.auth().updateUser(authUid, {
        password: u.password,
        displayName: u.displayName,
        emailVerified: true
      });
      console.log(`Updated existing auth user: ${u.email} (${authUid})`);
    } catch {
      const created = await admin.auth().createUser({
        uid: u.id,
        email: u.email,
        password: u.password,
        displayName: u.displayName,
        emailVerified: true
      });
      authUid = created.uid;
      console.log(`Created new auth user: ${u.email} (${authUid})`);
    }

    // Set users collection
    await adminDb.collection("users").doc(authUid).set({
      uid: authUid,
      email: u.email,
      displayName: u.displayName,
      role: u.role,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Set specific collection
    if (u.role === "student") {
      await adminDb.collection("students").doc(authUid).set({
        uid: authUid,
        fullName: u.displayName,
        email: u.email,
        institution: "Indian Institute of Technology Bombay",
        degree: "B.Tech Computer Science",
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } else if (u.role === "issuer") {
      await adminDb.collection("issuers").doc(authUid).set({
        uid: authUid,
        name: u.displayName,
        email: u.email,
        issuerType: u.issuerType || "university",
        walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  }

  console.log("All demo users seeded successfully!");
}

seedDemoUsers().catch(console.error);
