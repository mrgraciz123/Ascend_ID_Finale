const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("====================================================");
  console.log("  ASCENDCHAIN DEVNET — SMART CONTRACT DEPLOYMENT");
  console.log("====================================================");

  const [deployer] = await hre.ethers.getSigners();
  const provider = hre.ethers.provider;
  const network = await provider.getNetwork();

  console.log(`Deployer Address:    ${deployer.address}`);
  console.log(`Deployer Balance:    ${hre.ethers.formatEther(await provider.getBalance(deployer.address))} ETH`);
  console.log(`AscendChain ChainID: ${network.chainId.toString()} (${network.name})`);

  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.deploy();
  await registry.waitForDeployment();

  const contractAddress = await registry.getAddress();
  const deploymentTxHash = registry.deploymentTransaction() ? registry.deploymentTransaction().hash : "0x0";
  const receipt = await registry.deploymentTransaction().wait();

  console.log("----------------------------------------------------");
  console.log(`🟢 CredentialRegistry Deployed Successfully!`);
  console.log(`Contract Address:   ${contractAddress}`);
  console.log(`Deployment Tx Hash: ${deploymentTxHash}`);
  console.log(`Deployment Block:   ${receipt ? receipt.blockNumber : 'N/A'}`);
  console.log("----------------------------------------------------");

  // Save deployment artifact for AscendChain client SDK & health scripts
  const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "CredentialRegistry.sol", "CredentialRegistry.json");
  let artifactAbi = [];
  if (fs.existsSync(artifactPath)) {
    const raw = fs.readFileSync(artifactPath, "utf-8");
    artifactAbi = JSON.parse(raw).abi;
  }

  const deploymentData = {
    chainName: "AscendChain Devnet",
    chainId: Number(network.chainId),
    contractAddress,
    deploymentTxHash,
    deploymentBlock: receipt ? receipt.blockNumber : null,
    deployerAddress: deployer.address,
    deployedAt: new Date().toISOString(),
    rpcUrl: "http://127.0.0.1:8545",
    abi: artifactAbi
  };

  const outputFilePath = path.join(process.cwd(), "src", "lib", "ascendchain-deployment.json");
  fs.writeFileSync(outputFilePath, JSON.stringify(deploymentData, null, 2));
  console.log(`Saved deployment manifest to: ${outputFilePath}`);
}

main().catch((error) => {
  console.error("❌ AscendChain Deployment Failed:", error);
  process.exitCode = 1;
});
