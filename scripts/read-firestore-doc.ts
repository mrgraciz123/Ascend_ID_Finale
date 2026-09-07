import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { adminDb } = await import("../src/lib/firebase-admin");
  const docSnap = await adminDb.collection("credentials").doc("JMUMC5VeDCMZ4IBf2S0O").get();
  if (docSnap.exists) {
    console.log("FIRESTORE DATA FOR JMUMC5VeDCMZ4IBf2S0O:\n", JSON.stringify(docSnap.data(), null, 2));
  } else {
    console.log("Document not found in Firestore!");
  }
}

run().catch(console.error);
