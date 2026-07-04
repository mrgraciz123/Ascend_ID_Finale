const hre = require("hardhat");

async function main() {
  console.log("Deploying CredentialRegistry...");

  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const registry = await CredentialRegistry.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`CredentialRegistry deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
