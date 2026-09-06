import { NextRequest, NextResponse } from "next/server";
import { getBlockchainProvider } from "@/lib/blockchain";

/**
 * GET /api/blockchain/verify?uuid=<credential-id>
 *
 * Server-side proxy for on-chain credential reads.
 * The verify page (/verify/[id]) is a client component and cannot import
 * AscendChainProvider directly because it uses Node.js fs/path modules.
 * This endpoint is the bridge: it queries AscendChain server-side and
 * returns the on-chain record as JSON.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");

  if (!uuid || uuid.trim() === "") {
    return NextResponse.json(
      { error: "Missing required query parameter: uuid" },
      { status: 400 }
    );
  }

  try {
    const provider = getBlockchainProvider();
    const record = await provider.getCredentialHash(uuid.trim());

    return NextResponse.json({
      success: true,
      chainId: provider.chainId,
      chainName: provider.chainName,
      contractAddress: provider.contractAddress,
      record
    });
  } catch (error: any) {
    console.error("GET /api/blockchain/verify error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to query blockchain",
        record: {
          hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
          issuerWallet: "0x0000000000000000000000000000000000000000",
          isRevoked: false,
          revocationReason: "",
          blockTimestamp: 0
        }
      },
      { status: 500 }
    );
  }
}
