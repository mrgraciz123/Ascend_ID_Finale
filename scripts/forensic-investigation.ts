import { adminDb } from "../src/lib/firebase-admin";
import { createPublicClient, http } from "viem";
import deployment from "../src/lib/ascendchain-deployment.json";

const RPC_URL = "http://127.0.0.1:8545";
const SUSPICIOUS_HASH = "0xca5fcc64a3b7dff8d9c71b17335d1cc8f34b4a23dceeb6fc3d019a47adad81d1";
const CREDENTIAL_ID = "JMUMC5VeDCMZ4IBf2S0O";

async function rpcCall(method: string, params: any[] = []) {
  const res = await fetch(RPC_URL, {
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

async function runForensics() {
  console.log("=== FORENSIC AUDIT 1: JSON-RPC RAW INQUIRY ===");
  
  // 1. Check eth_getTransactionByHash with SUSPICIOUS_HASH
  const txQuery = await rpcCall("eth_getTransactionByHash", [SUSPICIOUS_HASH]);
  console.log("1. eth_getTransactionByHash(SUSPICIOUS_HASH):", JSON.stringify(txQuery, null, 2));

  // 2. Check eth_getTransactionReceipt with SUSPICIOUS_HASH
  const receiptQuery = await rpcCall("eth_getTransactionReceipt", [SUSPICIOUS_HASH]);
  console.log("2. eth_getTransactionReceipt(SUSPICIOUS_HASH):", JSON.stringify(receiptQuery, null, 2));

  // 3. Check eth_getBlockByNumber for 1084 (0x43c) and recent blocks
  const block1084Hex = "0x" + (1084).toString(16);
  const block1084 = await rpcCall("eth_getBlockByNumber", [block1084Hex, true]);
  console.log("3. eth_getBlockByNumber(1084):", JSON.stringify({
    number: block1084?.result?.number,
    hash: block1084?.result?.hash,
    transactionsCount: block1084?.result?.transactions?.length,
    transactions: block1084?.result?.transactions,
  }, null, 2));

  // 4. Check latest block number
  const latestBlockHex = await rpcCall("eth_blockNumber", []);
  console.log("4. Latest Block Number:", latestBlockHex);

  // 5. Query Firestore for JMUMC5VeDCMZ4IBf2S0O
  console.log("\n=== FORENSIC AUDIT 2: FIRESTORE DOCUMENT ===");
  try {
    const docSnap = await adminDb.collection("credentials").doc(CREDENTIAL_ID).get();
    if (docSnap.exists) {
      console.log("Firestore doc data:", JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.log("Firestore doc NOT FOUND for ID:", CREDENTIAL_ID);
    }
  } catch (err: any) {
    console.error("Firestore error:", err.message);
  }

  // 6. Query Smart Contract directly
  console.log("\n=== FORENSIC AUDIT 3: CONTRACT STATE ===");
  try {
    const client = createPublicClient({
      transport: http(RPC_URL),
    });
    const result = await client.readContract({
      address: deployment.contractAddress as `0x${string}`,
      abi: deployment.abi,
      functionName: "getCredential",
      args: [CREDENTIAL_ID],
    });
    console.log("Contract getCredential result:", result);
  } catch (err: any) {
    console.error("Contract call error:", err.message);
  }
}

runForensics().catch(console.error);
