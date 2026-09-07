import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getBlockchainProvider } from "@/lib/blockchain";

const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const credentialId = id.trim();

  if (!credentialId) {
    return NextResponse.json({ error: "Missing credential identifier" }, { status: 400 });
  }

  try {
    const credentialSnapshot = await adminDb.collection("credentials").doc(credentialId).get();
    if (!credentialSnapshot.exists) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    const data = credentialSnapshot.data() || {};
    const provider = getBlockchainProvider();
    const onChain = await provider.getCredentialHash(credentialId);
    const isRevoked = Boolean(onChain.isRevoked || data.verificationStatus === "revoked");
    const isAnchored = onChain.hash !== ZERO_HASH && onChain.issuerWallet !== ZERO_ADDRESS;

    const anchorTxHash = data.anchorTransactionHash || data.blockchain?.anchorTransactionHash || data.blockchain?.transactionHash || null;
    const anchorBlock = data.anchorBlockNumber || data.blockchain?.anchorBlockNumber || data.blockchain?.blockNumber || null;
    const anchoredAt = data.anchoredAt || data.blockchain?.anchoredAt || null;
    const anchorReceipt = data.anchorReceipt || data.blockchain?.anchorReceipt || null;

    const revocationTxHash = data.revocationTransactionHash || data.blockchain?.revocationTransactionHash || null;
    const revocationBlock = data.revocationBlockNumber || data.blockchain?.revocationBlockNumber || null;
    const revokedAt = data.revokedAt || data.blockchain?.revokedAt || null;
    const revocationReceipt = data.revocationReceipt || data.blockchain?.revocationReceipt || null;
    const revocationReason = data.revocationReason || onChain.revocationReason || "";

    return NextResponse.json({
      success: true,
      credential: {
        id: credentialId,
        studentName: data.studentName || "Unavailable",
        studentEmail: data.studentEmail || "",
        studentId: data.studentId || "",
        issuerId: data.issuerId || "",
        issuerName: data.issuerName || "Unavailable",
        issuerType: data.issuerType || "Unavailable",
        title: data.title || "Unavailable",
        description: data.description || "",
        credentialType: data.credentialType || "Unavailable",
        issueDate: data.issueDate || "Unavailable",
        expiryDate: data.expiryDate || "Unavailable",
        verificationStatus: isRevoked ? "revoked" : data.verificationStatus || "issued",
        metadataHash: data.metadataHash || null,
        blockchainHash: data.blockchainHash || data.metadataHash || null,
        digitalSignature: data.digitalSignature || null,
        qrCodeUrl: data.qrCodeUrl || null,
        w3cData: data.w3cData || null,
        documentUrl: data.documentUrl || "",
        documentFraudReport: data.documentFraudReport || null,

        // Canonical separate anchor fields
        anchorTransactionHash: anchorTxHash,
        anchorBlockNumber: anchorBlock,
        anchoredAt: anchoredAt,
        anchorReceipt: anchorReceipt,

        // Canonical separate revocation fields
        revocationTransactionHash: revocationTxHash,
        revocationBlockNumber: revocationBlock,
        revokedAt: revokedAt,
        revocationReceipt: revocationReceipt,
        revocationReason: revocationReason,

        blockchain: {
          chainId: data.blockchain?.chainId || provider.chainId,
          chainName: data.blockchain?.chainName || provider.chainName,
          contractAddress: data.blockchain?.contractAddress || provider.contractAddress,
          anchorTransactionHash: anchorTxHash,
          anchorBlockNumber: anchorBlock,
          anchoredAt: anchoredAt,
          anchorReceipt: anchorReceipt,
          revocationTransactionHash: revocationTxHash,
          revocationBlockNumber: revocationBlock,
          revokedAt: revokedAt,
          revocationReceipt: revocationReceipt,
          revocationReason: revocationReason,
          transactionHash: anchorTxHash || data.blockchain?.transactionHash || "",
          blockNumber: anchorBlock || data.blockchain?.blockNumber || 0,
          issuerWallet: data.blockchain?.issuerWallet || onChain.issuerWallet,
          verificationStatus: isRevoked ? "revoked" : "anchored"
        },
        auditTrail: data.auditTrail || []
      },
      chain: {
        chainId: provider.chainId,
        chainName: provider.chainName,
        contractAddress: provider.contractAddress,
        record: onChain,
        isAnchored,
        isRevoked
      }
    });
  } catch (error: any) {
    console.error("Public credential verification failed:", error);
    return NextResponse.json(
      { error: "Credential verification is temporarily unavailable" },
      { status: 503 }
    );
  }
}