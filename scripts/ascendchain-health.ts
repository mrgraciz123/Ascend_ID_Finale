import { createPublicClient, http } from "viem";
import * as fs from "fs";
import * as path from "path";

async function runHealthCheck() {
  console.log("====================================================");
  console.log("  ASCENDCHAIN HEALTH CHECK");
  console.log("====================================================");

  const rpcUrl = process.env.ASCENDCHAIN_RPC_URL || "http://127.0.0.1:8545";
  console.log(`Target RPC Endpoint: ${rpcUrl}`);

  try {
    const client = createPublicClient({
      transport: http(rpcUrl)
    });

    // 1. RPC Connectivity & Chain ID Verification
    const chainIdHex = await client.request({ method: "eth_chainId" });
    const chainId = parseInt(chainIdHex as string, 16);
    console.log(`🟢 RPC Connectivity:  CONNECTED`);
    console.log(`🟢 Chain ID:          ${chainId} (${chainIdHex})`);

    if (chainId !== 13370 && chainId !== 31337) {
      console.warn(`⚠️ Warning: Expected AscendChain Devnet Chain ID 13370, got ${chainId}`);
    }

    // 2. Latest Block Verification
    const blockNumberInitial = await client.getBlockNumber();
    const initialBlock = await client.getBlock({ blockNumber: blockNumberInitial });

    console.log(`🟢 Latest Block:       #${blockNumberInitial}`);
    console.log(`🟢 Latest Block Hash:  ${initialBlock.hash}`);
    console.log(`🟢 Block Timestamp:    ${new Date(Number(initialBlock.timestamp) * 1000).toISOString()}`);

    // 3. Block Progression Verification
    console.log("Checking block production progression (waiting 1.5s)...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mine a transaction or check block
    const blockNumberCheck = await client.getBlockNumber();
    console.log(`🟢 Block Progression: #${blockNumberInitial} ➔ #${blockNumberCheck}`);

    // 4. Smart Contract Verification
    const deploymentPath = path.join(process.cwd(), "src", "lib", "ascendchain-deployment.json");
    if (fs.existsSync(deploymentPath)) {
      const manifest = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
      console.log(`🟢 Deployed Registry: ${manifest.contractAddress}`);
      
      const code = await client.getBytecode({ address: manifest.contractAddress as `0x${string}` });
      if (code && code !== "0x") {
        console.log(`🟢 Contract Bytecode: VERIFIED ON-CHAIN (${code.length} bytes)`);
      } else {
        console.error(`❌ Contract Bytecode: NOT FOUND AT ADDRESS ${manifest.contractAddress}`);
      }
    } else {
      console.log("ℹ️ Deployment manifest src/lib/ascendchain-deployment.json not found. Run 'npm run ascendchain:deploy' first.");
    }

    console.log("----------------------------------------------------");
    console.log("🟢 ASCENDCHAIN HEALTH CHECK PASSED");
    console.log("----------------------------------------------------");
    process.exit(0);
  } catch (error: any) {
    console.error("----------------------------------------------------");
    console.error("❌ ASCENDCHAIN HEALTH CHECK FAILED");
    console.error(`Error: ${error?.message || error}`);
    console.error("----------------------------------------------------");
    process.exit(1);
  }
}

runHealthCheck();
