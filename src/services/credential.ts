import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
} from "firebase/firestore";
import { isDemoUser } from "@/lib/demo-data";

export interface Credential {
  id: string; // UUID — Firestore document ID
  issuerId: string;
  issuerName: string;
  issuerType: "university" | "company" | "hackathon" | "certifier";
  studentName: string;
  studentEmail: string;
  studentId: string; // Firebase UID if student is registered; empty string otherwise
  title: string;
  description: string;
  credentialType: "degree" | "diploma" | "experience" | "internship" | "achievement" | "certification" | "badge";
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD or "Never"
  verificationStatus: "issued" | "revoked";
  revocationReason?: string;
  revokedAt?: any;

  /** Cryptographic signature — generated server-side via viem/accounts.signMessage */
  digitalSignature: string;

  /** SHA-256 hash of normalized metadata — matches what is anchored on-chain */
  blockchainHash: string;

  /** QR code URL pointing to the public verification page */
  qrCodeUrl: string;

  /** W3C Verifiable Credential representation */
  w3cData?: any;

  /** The normalized metadata hash (same as blockchainHash for clarity) */
  metadataHash?: string;

  /** On-chain anchoring details */
  blockchain?: {
    chainId: number;
    contractAddress: string;
    transactionHash: string;
    blockNumber: number;
    issuerWallet: string;
    verificationStatus: string;
    anchoredAt: string;
  };

  /** Full audit trail of all status changes */
  auditTrail?: Array<{
    status: string;
    timestamp: string;
    transactionHash: string;
    details: string;
  }>;

  createdAt: any;
  updatedAt: any;
}

export class CredentialService {
  /**
   * Issues a brand new credential via the secure server-side anchoring API.
   * All cryptographic operations (signing, hashing, blockchain anchoring)
   * happen exclusively on the server — never in the browser.
   */
  static async issueCredential(data: {
    issuerId: string;
    issuerName: string;
    issuerType: Credential["issuerType"];
    studentName: string;
    studentEmail: string;
    title: string;
    description: string;
    credentialType: Credential["credentialType"];
    issueDate: string;
    expiryDate: string;
    issuerWallet?: string;
    documentUrl?: string;
    documentFraudReport?: any;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // Demo mode header for API fallback
      if (isDemoUser(auth.currentUser?.email || auth.currentUser?.uid)) {
        headers["X-Demo-Role"] = "issuer";
      }

      const response = await fetch("/api/credentials/anchor", {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to anchor credential via API");
      }
      return { success: true, id: result.id };
    } catch (error: any) {
      console.error("Error in issueCredential:", error);
      return { success: false, error: error.message || "Failed to issue credential" };
    }
  }

  /**
   * Links any unlinked credentials (by email) to a student's UID when they register.
   */
  static async linkStudentToCredential(studentId: string, studentEmail: string): Promise<void> {
    try {
      const q = query(
        collection(db, "credentials"),
        where("studentEmail", "==", studentEmail.toLowerCase()),
        where("studentId", "==", "")
      );
      const snapshot = await getDocs(q);
      for (const d of snapshot.docs) {
        await updateDoc(doc(db, "credentials", d.id), {
          studentId,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Failed to link student credentials:", e);
    }
  }

  /**
   * Updates basic metadata of an active credential (title, description, expiryDate).
   * Signature is re-generated server-side on next verification.
   */
  static async updateCredential(
    id: string,
    data: { title: string; description: string; expiryDate: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const docRef = doc(db, "credentials", id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) throw new Error("Credential not found");

      const cred = docSnap.data() as Credential;
      if (cred.verificationStatus === "revoked") {
        throw new Error("Cannot edit a revoked credential");
      }

      await updateDoc(docRef, {
        title: data.title,
        description: data.description,
        expiryDate: data.expiryDate || "Never",
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error in updateCredential:", error);
      return { success: false, error: error.message || "Failed to update credential" };
    }
  }

  /**
   * Revokes a credential via the secure server-side revocation API.
   */
  static async revokeCredential(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { auth } = await import("@/lib/firebase");
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      if (isDemoUser(auth.currentUser?.email || auth.currentUser?.uid)) {
        headers["X-Demo-Role"] = "issuer";
      }

      const response = await fetch("/api/credentials/revoke", {
        method: "POST",
        headers,
        body: JSON.stringify({ id, reason })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to revoke credential via API");
      }
      return { success: true };
    } catch (error: any) {
      console.error("Error in revokeCredential:", error);
      return { success: false, error: error.message || "Failed to revoke credential" };
    }
  }

  /**
   * Fetches all credentials issued by a specific issuer.
   */
  static async getIssuerCredentials(issuerId: string): Promise<Credential[]> {
    try {
      const q = query(collection(db, "credentials"), where("issuerId", "==", issuerId));
      const snapshot = await getDocs(q);
      const list: Credential[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Credential));
      return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } catch (error) {
      console.error("Error in getIssuerCredentials:", error);
      return [];
    }
  }

  /**
   * Fetches all credentials issued to a student (by email).
   */
  static async getStudentCredentials(studentEmail: string): Promise<Credential[]> {
    try {
      const q = query(
        collection(db, "credentials"),
        where("studentEmail", "==", studentEmail.toLowerCase())
      );
      const snapshot = await getDocs(q);
      const list: Credential[] = [];
      snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as Credential));
      return list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } catch (error) {
      console.error("Error in getStudentCredentials:", error);
      return [];
    }
  }

  /**
   * Fetches a single credential by its ID.
   */
  static async getCredentialById(id: string): Promise<Credential | null> {
    try {
      const docRef = doc(db, "credentials", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Credential;
      }
      return null;
    } catch (error) {
      console.error("Error in getCredentialById:", error);
      return null;
    }
  }
}
