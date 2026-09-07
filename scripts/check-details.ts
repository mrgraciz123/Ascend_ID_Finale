import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { adminDb } from "../src/lib/firebase-admin";
import { AscendChainProvider } from "../src/lib/blockchain";

async function rpcCall(method: string, params: any[] = []) {
  const res = await fetch("http://127.0.0.1:8545", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  return await res.json();
}

async function main() {
  console.log("=== CHECK HARDHAT CODE ===");
  const code = await rpcCall("eth_getCode", ["0x5FbDB2315678afecb367f032d93F642f64180aa3", "latest"]);
  console.log("Contract code length:", code?.result?.length);

  console.log("\n=== QUERY VIA AscendChainProvider ===");
  const provider = new AscendChainProvider();
  const res = await provider.getCredentialHash("JMUMC5VeDCMZ4IBf2S0O");
  console.log("AscendChainProvider.getCredentialHash('JMUMC5VeDCMZ4IBf2S0O'):", res);

  console.log("\n=== QUERY FIRESTORE DOCUMENT ===");
  try {
    const snap = await adminDb.collection("credentials").doc("JMUMC5VeDCMZ4IBf2S0O").get();
    if (snap.exists) {
      console.log("Firestore doc data:", JSON.stringify(snap.data(), null, 2));
    } else {
      console.log("Document JMUMC5VeDCMZ4IBf2S0O not found in Firestore!");
    }
  } catch (e: any) {
    console.error("Firestore read error:", e.message);
  }
}

main().catch(console.error);
