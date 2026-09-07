import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  const { adminDb } = await import("../src/lib/firebase-admin");
  const docSnap = await adminDb.collection("credentials").doc("4YuP8ASxMurVPhVR6270").get();
  if (docSnap.exists) {
    const data = docSnap.data()!;
    console.log("FIRESTORE DATA FOR 4YuP8ASxMurVPhVR6270:");
    console.log("ID:", data.id);
    console.log("Metadata Hash:          ", data.metadataHash);
    console.log("Anchor Transaction Hash:", data.anchorTransactionHash);
    console.log("Are Hashes Distinct:    ", data.metadataHash !== data.anchorTransactionHash);
  } else {
    console.log("Document not found in Firestore!");
  }
}

run().catch(console.error);
