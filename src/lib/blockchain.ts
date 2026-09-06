// Dynamically resolve Node fs and path on server only to prevent bundler compilation errors in browser.
let fs: any = null;
let path: any = null;
if (typeof window === "undefined") {
  try {
    fs = require("fs");
    path = require("path");
  } catch (e) {
    console.warn("Server fs/path require failed:", e);
  }
}

export interface AnchorReceipt {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  anchoredAt: string;
  error?: string;
}

export interface RevocationReceipt {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  revokedAt: string;
  error?: string;
}

export interface CredentialOnChainRecord {
  hash: string;
  isRevoked: boolean;
  revocationReason: string;
  issuerWallet: string;
  blockTimestamp: number;
}

export interface BlockchainProvider {
  chainId: number;
  chainName: string;
  contractAddress: string;
  anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt>;
  revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt>;
  getCredentialHash(uuid: string): Promise<CredentialOnChainRecord>;
}

// ---------------------------------------------------------
// Mock Blockchain Provider for Local Presentation / Demo Mode
// ---------------------------------------------------------
export class MockBlockchainProvider implements BlockchainProvider {
  chainId = 84532; // Base Sepolia Chain ID
  chainName = "Base Sepolia (Mocked)";
  contractAddress = "0xMockCredentialRegistryAddressBaseSepolia";

  private getStateFilePath() {
    if (!fs || !path) return "";
    const dir = path.join(process.cwd(), "src", "lib");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, "mock_blockchain_state.json");
  }

  private readState(): Record<string, CredentialOnChainRecord> {
    if (typeof window !== "undefined") {
      try {
        const content = localStorage.getItem("mock_blockchain_state");
        return content ? JSON.parse(content) : {};
      } catch (e) {
        console.error("Failed to read mock blockchain state from localStorage:", e);
        return {};
      }
    }

    const filePath = this.getStateFilePath();
    if (filePath && fs && fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(content);
      } catch (e) {
        console.error("Failed to read mock blockchain state, resetting:", e);
      }
    }
    return {};
  }

  private writeState(state: Record<string, CredentialOnChainRecord>) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("mock_blockchain_state", JSON.stringify(state));
      } catch (e) {
        console.error("Failed to write mock blockchain state to localStorage:", e);
      }
      return;
    }

    const filePath = this.getStateFilePath();
    if (filePath && fs) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
      } catch (e) {
        console.error("Failed to write mock blockchain state:", e);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt> {
    await this.delay(Math.floor(Math.random() * 700) + 800);

    const state = this.readState();
    if (state[uuid]) {
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        anchoredAt: "",
        error: "Credential already anchored on-chain (mock)"
      };
    }

    state[uuid] = {
      hash: dataHash,
      isRevoked: false,
      revocationReason: "",
      issuerWallet: issuerWallet || "0x0000000000000000000000000000000000000000",
      blockTimestamp: Math.floor(Date.now() / 1000)
    };
    this.writeState(state);

    const txHash = `0x${Buffer.from(dataHash + uuid).toString('hex').padEnd(64, '0').substring(0, 64)}`;
    const blockNum = Math.floor(Math.random() * 100000) + 1200000;

    return {
      success: true,
      transactionHash: txHash,
      blockNumber: blockNum,
      anchoredAt: new Date().toISOString()
    };
  }

  async revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt> {
    await this.delay(Math.floor(Math.random() * 700) + 800);

    const state = this.readState();
    const record = state[uuid];
    if (!record) {
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: "Credential not found on-chain (mock)"
      };
    }

    if (record.isRevoked) {
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: "Credential already revoked on-chain (mock)"
      };
    }

    record.isRevoked = true;
    record.revocationReason = reason;
    this.writeState(state);

    const txHash = `0x${Buffer.from(uuid + reason).toString('hex').padEnd(64, '0').substring(0, 64)}`;
    const blockNum = Math.floor(Math.random() * 100000) + 1300000;

    return {
      success: true,
      transactionHash: txHash,
      blockNumber: blockNum,
      revokedAt: new Date().toISOString()
    };
  }

  async getCredentialHash(uuid: string): Promise<CredentialOnChainRecord> {
    if (typeof window !== "undefined") {
      try {
        const response = await fetch(`/api/blockchain/mock-state?uuid=${encodeURIComponent(uuid)}`);
        if (response.ok) {
          const res = await response.json();
          if (res.success && res.record) {
            return res.record;
          }
        }
      } catch (e) {
        console.error("Failed to fetch mock blockchain state from API:", e);
      }
    }

    const state = this.readState();
    const record = state[uuid];
    if (record) {
      return record;
    }
    return {
      hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
      isRevoked: false,
      revocationReason: "",
      issuerWallet: "0x0000000000000000000000000000000000000000",
      blockTimestamp: 0
    };
  }
}

// ---------------------------------------------------------
// Common Contract ABI
// ---------------------------------------------------------
const ABI = [
  {
    inputs: [
      { name: "uuid", type: "string" },
      { name: "dataHash", type: "bytes32" },
      { name: "issuerWallet", type: "address" }
    ],
    name: "anchorCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "uuid", type: "string" },
      { name: "reason", type: "string" }
    ],
    name: "revokeCredential",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "uuid", type: "string" }],
    name: "getCredential",
    outputs: [
      { name: "dataHash", type: "bytes32" },
      { name: "issuerWallet", type: "address" },
      { name: "isRevoked", type: "bool" },
      { name: "revocationReason", type: "string" },
      { name: "blockTimestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "issuer", type: "address" }],
    name: "isIssuerVerified",
    outputs: [{ name: "status", type: "bool" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

// ---------------------------------------------------------
// AscendChain Sovereign Blockchain Provider
// ---------------------------------------------------------
export class AscendChainProvider implements BlockchainProvider {
  chainId = 13370;
  chainName = "AscendChain Devnet";
  contractAddress: string;

  constructor(address?: string) {
    let deployedAddr = "";
    if (fs && path) {
      try {
        const manifestPath = path.join(process.cwd(), "src", "lib", "ascendchain-deployment.json");
        if (fs.existsSync(manifestPath)) {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
          deployedAddr = manifest.contractAddress;
        }
      } catch (e) {
        // Fallback
      }
    }
    this.contractAddress = address || process.env.ASCENDCHAIN_CONTRACT_ADDRESS || deployedAddr || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  }

  private async getClients() {
    const { createPublicClient, createWalletClient, http, defineChain } = await import("viem");
    const { privateKeyToAccount } = await import("viem/accounts");

    const ascendChainSpec = defineChain({
      id: 13370,
      name: "AscendChain Devnet",
      nativeCurrency: { name: "Ascend Token", symbol: "ASCEND", decimals: 18 },
      rpcUrls: {
        default: { http: [process.env.ASCENDCHAIN_RPC_URL || "http://127.0.0.1:8545"] }
      }
    });

    const rpcUrl = process.env.ASCENDCHAIN_RPC_URL || "http://127.0.0.1:8545";
    const privateKey = process.env.ASCENDCHAIN_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    const publicClient = createPublicClient({
      chain: ascendChainSpec,
      transport: http(rpcUrl)
    });

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: ascendChainSpec,
      transport: http(rpcUrl)
    });

    return { publicClient, walletClient, account };
  }

  async anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt> {
    try {
      const { publicClient, walletClient, account } = await this.getClients();
      const formattedHash = dataHash.startsWith("0x") ? (dataHash as `0x${string}`) : (`0x${dataHash}` as `0x${string}`);

      const { request } = await publicClient.simulateContract({
        account,
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "anchorCredential",
        args: [uuid, formattedHash, issuerWallet as `0x${string}`]
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        anchoredAt: new Date().toISOString()
      };
    } catch (e: any) {
      console.error("AscendChainProvider.anchorCredential error:", e);
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        anchoredAt: "",
        error: e?.message || "AscendChain transaction execution failed"
      };
    }
  }

  async revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt> {
    try {
      const { publicClient, walletClient, account } = await this.getClients();

      const { request } = await publicClient.simulateContract({
        account,
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "revokeCredential",
        args: [uuid, reason]
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        revokedAt: new Date().toISOString()
      };
    } catch (e: any) {
      console.error("AscendChainProvider.revokeCredential error:", e);
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: e?.message || "AscendChain revocation transaction failed"
      };
    }
  }

  async getCredentialHash(uuid: string): Promise<CredentialOnChainRecord> {
    try {
      const { publicClient } = await this.getClients();
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "getCredential",
        args: [uuid]
      }) as [string, string, boolean, string, bigint];

      return {
        hash: result[0],
        issuerWallet: result[1],
        isRevoked: result[2],
        revocationReason: result[3],
        blockTimestamp: Number(result[4])
      };
    } catch (e: any) {
      console.error("AscendChainProvider.getCredentialHash error:", e);
      return {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        issuerWallet: "0x0000000000000000000000000000000000000000",
        isRevoked: false,
        revocationReason: "",
        blockTimestamp: 0
      };
    }
  }
}

// ---------------------------------------------------------
// Base Sepolia Viem Blockchain Provider (Legacy / Staging)
// ---------------------------------------------------------
export class BaseSepoliaProvider implements BlockchainProvider {
  chainId = 84532;
  chainName = "Base Sepolia (Legacy)";
  contractAddress: string;

  constructor() {
    this.contractAddress = process.env.NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  }

  private async getClients() {
    const { createPublicClient, createWalletClient, http } = await import("viem");
    const { baseSepolia } = await import("viem/chains");
    const { privateKeyToAccount } = await import("viem/accounts");

    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || "https://sepolia.base.org";
    const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    if (!privateKey) {
      return { publicClient, walletClient: null, account: null };
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(rpcUrl)
    });

    return { publicClient, walletClient, account };
  }

  async anchorCredential(uuid: string, dataHash: string, issuerWallet: string): Promise<AnchorReceipt> {
    try {
      const { publicClient, walletClient, account } = await this.getClients();
      if (!walletClient || !account) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is missing on server");
      }

      const formattedHash = dataHash.startsWith("0x") ? (dataHash as `0x${string}`) : (`0x${dataHash}` as `0x${string}`);

      const { request } = await publicClient.simulateContract({
        account,
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "anchorCredential",
        args: [uuid, formattedHash, issuerWallet as `0x${string}`]
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        anchoredAt: new Date().toISOString()
      };
    } catch (e: any) {
      console.error("BaseSepoliaProvider.anchorCredential error:", e);
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        anchoredAt: "",
        error: e.message || "Base Sepolia transaction failed"
      };
    }
  }

  async revokeCredential(uuid: string, reason: string): Promise<RevocationReceipt> {
    try {
      const { publicClient, walletClient, account } = await this.getClients();
      if (!walletClient || !account) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is missing on server");
      }

      const { request } = await publicClient.simulateContract({
        account,
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "revokeCredential",
        args: [uuid, reason]
      });

      const hash = await walletClient.writeContract(request);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        transactionHash: hash,
        blockNumber: Number(receipt.blockNumber),
        revokedAt: new Date().toISOString()
      };
    } catch (e: any) {
      console.error("BaseSepoliaProvider.revokeCredential error:", e);
      return {
        success: false,
        transactionHash: "",
        blockNumber: 0,
        revokedAt: "",
        error: e.message || "Base Sepolia transaction failed"
      };
    }
  }

  async getCredentialHash(uuid: string): Promise<CredentialOnChainRecord> {
    try {
      const { publicClient } = await this.getClients();
      const result = await publicClient.readContract({
        address: this.contractAddress as `0x${string}`,
        abi: ABI,
        functionName: "getCredential",
        args: [uuid]
      }) as [string, string, boolean, string, bigint];

      return {
        hash: result[0],
        issuerWallet: result[1],
        isRevoked: result[2],
        revocationReason: result[3],
        blockTimestamp: Number(result[4])
      };
    } catch (e: any) {
      console.error("BaseSepoliaProvider.getCredentialHash error:", e);
      return {
        hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        issuerWallet: "0x0000000000000000000000000000000000000000",
        isRevoked: false,
        revocationReason: "",
        blockTimestamp: 0
      };
    }
  }
}

// ---------------------------------------------------------
// Global Provider Getter
// ---------------------------------------------------------
// NOTE: NEXT_PUBLIC_DEMO_MODE does NOT affect this function.
// The /demo simulation page handles its own state independently.
// Provider selection is determined solely by which chain env vars are set:
//   USE_ASCENDCHAIN=true or ASCENDCHAIN_RPC_URL set → AscendChainProvider (default)
//   USE_MOCK_BLOCKCHAIN=true → MockBlockchainProvider (explicit opt-in for local testing only)
//   Neither of the above, but Base Sepolia contract configured → BaseSepoliaProvider (legacy)
export function getBlockchainProvider(): BlockchainProvider {
  // Explicit mock opt-in (local testing only — never set in production)
  if (process.env.USE_MOCK_BLOCKCHAIN === "true") {
    return new MockBlockchainProvider();
  }

  // AscendChain Devnet (primary)
  if (process.env.USE_ASCENDCHAIN === "true" || process.env.ASCENDCHAIN_RPC_URL) {
    return new AscendChainProvider();
  }

  // Base Sepolia (legacy fallback — only if AscendChain vars are not set)
  const contractAddr = process.env.NEXT_PUBLIC_BLOCKCHAIN_CONTRACT_ADDRESS;
  if (contractAddr && contractAddr !== "0x0000000000000000000000000000000000000000") {
    return new BaseSepoliaProvider();
  }

  // Default: AscendChain
  return new AscendChainProvider();
}
