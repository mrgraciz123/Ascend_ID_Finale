import { NextRequest, NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebase-admin";
import { createHash } from "crypto";
import { getBlockchainProvider } from "@/lib/blockchain";
import { calculateMetadataHashServer } from "@/lib/normalization";
import { enforceRateLimit, checkPayloadSize, authenticateRequest } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting Check
    if (!enforceRateLimit(request)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // 2. Payload size check (5MB limit)
    if (!checkPayloadSize(request, 5 * 1024 * 1024)) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // 3. User Authentication check
    const authUser = await authenticateRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    // 4. Role Authorization check (only issuers can anchor new credentials)
    if (authUser.role !== "issuer" && authUser.role !== "government") {
      return NextResponse.json({ error: "Forbidden: Issuer credentials required to anchor" }, { status: 403 });
    }

    const body = await request.json();
    const {
      issuerId,
      issuerName,
      issuerType,
      studentName,
      studentEmail,
      title,
      description,
      credentialType,
      issueDate,
      expiryDate,
      issuerWallet: rawIssuerWallet,
      documentUrl,
      documentFraudReport
    } = body;

    if (!issuerId || !studentEmail || !title || !description) {
      return NextResponse.json({ error: "Missing required credential fields" }, { status: 400 });
    }

    const issuerWallet = rawIssuerWallet 
      || process.env.ASCENDCHAIN_ISSUER_ADDRESS
      || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Hardhat dev key #0 address (devnet only)

    // 1. Generate local UUID for the document
    const docRef = adminDb.collection("credentials").doc();
    const uuid = docRef.id;

    // 2. Query student ID if registered
    let studentId = "";
    const studentSnap = await adminDb.collection("users")
      .where("email", "==", studentEmail.toLowerCase())
      .where("role", "==", "student")
      .get();
    if (!studentSnap.empty) {
      studentId = studentSnap.docs[0].id;
    }

    // 3. Construct W3C Verifiable Credentials metadata format
    const w3cCredential: any = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.org"
      ],
      "id": `urn:uuid:${uuid}`,
      "type": ["VerifiableCredential", `${credentialType.charAt(0).toUpperCase() + credentialType.slice(1)}Credential`],
      "issuer": {
        "id": `did:ascendid:${issuerId}`,
        "name": issuerName,
        "walletAddress": issuerWallet,
        "type": issuerType || "University"
      },
      "issuanceDate": new Date(issueDate).toISOString(),
      "expirationDate": (!expiryDate || expiryDate === "Never") ? "Never" : new Date(expiryDate).toISOString(),
      "credentialSubject": {
        "id": studentId ? `did:ascendid:${studentId}` : `mailto:${studentEmail.toLowerCase()}`,
        "name": studentName,
        "email": studentEmail.toLowerCase(),
        "achievement": {
          "title": title,
          "description": description,
          "type": credentialType
        }
      }
    };

    // 4. Compute SHA-256 metadata hash of normalized fields
    const normalizationPayload = {
      studentName,
      studentEmail: studentEmail.toLowerCase(),
      issuerId,
      issuerName,
      title,
      credentialType,
      issueDate,
      expiryDate: expiryDate || "Never"
    };
    const formattedHash = calculateMetadataHashServer(normalizationPayload);

    // 5. Generate Server-Side Cryptographic Signature (Viem)
    // Uses ASCENDCHAIN_PRIVATE_KEY for signing credentials.
    // If not configured, the request fails with a clear error — no mock signature in production.
    let digitalSignature = "";
    try {
      const privateKey = process.env.ASCENDCHAIN_PRIVATE_KEY;
      if (!privateKey) {
        return NextResponse.json(
          { error: "Server signing key not configured. Set ASCENDCHAIN_PRIVATE_KEY." },
          { status: 500 }
        );
      }
      const { privateKeyToAccount } = await import("viem/accounts");
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      digitalSignature = await account.signMessage({ message: formattedHash });
    } catch (e) {
      console.error("Failed to generate cryptographic signature:", e);
      return NextResponse.json(
        { error: "Cryptographic signing failed. Check ASCENDCHAIN_PRIVATE_KEY configuration." },
        { status: 500 }
      );
    }

    // Embed proof signature to meet W3C standards
    w3cCredential.proof = {
      "type": "EcdsaSecp256k1Signature2019",
      "created": new Date().toISOString(),
      "proofPurpose": "assertionMethod",
      "verificationMethod": `did:ascendid:${issuerId}#key-1`,
      "jws": digitalSignature
    };

    // 6. Anchor hash to blockchain via the Provider
    const provider = getBlockchainProvider();
    const anchorResult = await provider.anchorCredential(uuid, formattedHash, issuerWallet);

    if (!anchorResult.success) {
      return NextResponse.json({ 
        error: anchorResult.error || "On-chain anchoring failed" 
      }, { status: 500 });
    }

    const anchorReceipt = {
      success: true,
      transactionHash: anchorResult.transactionHash,
      blockNumber: anchorResult.blockNumber,
      anchoredAt: anchorResult.anchoredAt,
      gasUsed: anchorResult.gasUsed || null,
      status: anchorResult.status || "success"
    };

    // 7. Write complete metadata document to Firestore
    const anchoredRecord = {
      id: uuid,
      studentName,
      studentEmail: studentEmail.toLowerCase(),
      studentId,
      issuerId,
      issuerName,
      issuerType: issuerType || "University",
      title,
      description,
      credentialType,
      issueDate,
      expiryDate: expiryDate || "Never",
      verificationStatus: "issued",
      
      // W3C representation
      w3cData: w3cCredential,
      metadataHash: formattedHash,
      blockchainHash: formattedHash,
      digitalSignature,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${request.nextUrl.origin}/verify/${uuid}`)}`,

      // Document upload and fraud detection integration
      documentUrl: documentUrl || "",
      documentFraudReport: documentFraudReport || null,

      // Canonical separate anchor transaction & receipt
      anchorTransactionHash: anchorResult.transactionHash,
      anchorBlockNumber: anchorResult.blockNumber,
      anchoredAt: anchorResult.anchoredAt,
      anchorReceipt,

      // Initial revocation states
      revocationTransactionHash: null,
      revocationBlockNumber: null,
      revokedAt: null,
      revocationReceipt: null,
      revocationReason: null,

      blockchain: {
        chainId: provider.chainId,
        chainName: provider.chainName,
        contractAddress: provider.contractAddress || "0x0000000000000000000000000000000000000000",
        anchorTransactionHash: anchorResult.transactionHash,
        anchorBlockNumber: anchorResult.blockNumber,
        anchoredAt: anchorResult.anchoredAt,
        anchorReceipt,
        revocationTransactionHash: null,
        revocationBlockNumber: null,
        revokedAt: null,
        revocationReceipt: null,
        revocationReason: null,
        transactionHash: anchorResult.transactionHash,
        blockNumber: anchorResult.blockNumber,
        issuerWallet,
        verificationStatus: "anchored"
      },

      auditTrail: [
        {
          status: "issued",
          timestamp: anchorResult.anchoredAt,
          transactionHash: anchorResult.transactionHash,
          details: `Credential hash ${formattedHash} anchored to AscendChain registry by issuer wallet ${issuerWallet}.`
        }
      ],

      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(anchoredRecord);

    // Link student's previous credentials if applicable
    if (studentId) {
      try {
        const unlinkedCreds = await adminDb.collection("credentials")
          .where("studentEmail", "==", studentEmail.toLowerCase())
          .where("studentId", "==", "")
          .get();
        
        const batch = adminDb.batch();
        unlinkedCreds.forEach(docSnap => {
          batch.update(docSnap.ref, {
            studentId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        await batch.commit();
      } catch (e) {
        console.error("Failed to link student credentials in API:", e);
      }
    }

    return NextResponse.json({
      success: true,
      id: uuid,
      credentialId: uuid,
      metadataHash: formattedHash,
      blockchainHash: formattedHash,
      transactionHash: anchorResult.transactionHash,
      anchorTransactionHash: anchorResult.transactionHash,
      blockNumber: anchorResult.blockNumber,
      anchoredAt: anchorResult.anchoredAt,
      receipt: anchorReceipt
    });

  } catch (error: any) {
    console.error("API Route Anchor Credential failed:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}
