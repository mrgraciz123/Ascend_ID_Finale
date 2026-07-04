import { NextRequest } from "next/server";
import { admin, adminDb } from "./firebase-admin";

// In-memory rate limiter (per-request, per-instance)
// For production: replace with Upstash Redis via @upstash/ratelimit
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: "student" | "recruiter" | "issuer" | "government" | "user";
  isDemo?: boolean;
}

/**
 * Standard IP Rate Limiter (Default: 100 requests per minute per IP)
 */
export function enforceRateLimit(request: NextRequest, limit = 100, durationMs = 60000): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  const now = Date.now();
  const data = rateLimitMap.get(ip);
  if (!data || now > data.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + durationMs });
    return true;
  }
  data.count++;
  // Cleanup old entries to prevent memory leak
  if (rateLimitMap.size > 5000) {
    const oldestKey = rateLimitMap.keys().next().value;
    if (oldestKey) rateLimitMap.delete(oldestKey);
  }
  return data.count <= limit;
}

/**
 * Validates request payload sizes (Default: 5MB limit)
 */
export function checkPayloadSize(request: NextRequest, maxBytes = 5 * 1024 * 1024): boolean {
  const contentLength = Number(request.headers.get("content-length") || 0);
  return contentLength <= maxBytes;
}

/**
 * Validates Firebase ID Token and retrieves User metadata and Role.
 * 
 * DEMO MODE: If request carries the header X-Demo-Role, and NEXT_PUBLIC_DEMO_MODE=true,
 * this function returns a demo user. This is clearly labeled and not a security bypass.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // -----------------------------------------------------------------------
    // DEMO MODE — Only active when NEXT_PUBLIC_DEMO_MODE env var is "true"
    // Must carry explicit X-Demo-Role header set by the client demo context
    // -----------------------------------------------------------------------
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    const demoRoleHeader = request.headers.get("X-Demo-Role");

    if (isDemoMode && demoRoleHeader) {
      const validRoles = ["student", "recruiter", "issuer", "government"];
      if (validRoles.includes(demoRoleHeader)) {
        const demoUids: Record<string, string> = {
          student: "demo-student-001",
          recruiter: "demo-recruiter-001",
          issuer: "demo-issuer-001",
          government: "demo-gov-001"
        };
        return {
          uid: demoUids[demoRoleHeader] || "demo-user-001",
          email: `demo-${demoRoleHeader}@ascendid.demo`,
          role: demoRoleHeader as AuthenticatedUser["role"],
          isDemo: true
        };
      }
    }

    // -----------------------------------------------------------------------
    // Production — Verify Firebase ID Token
    // -----------------------------------------------------------------------
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) return null;

    const decodedToken = await admin.auth().verifyIdToken(token);

    // Fetch role from Firestore users collection
    const userDoc = await adminDb.collection("users").doc(decodedToken.uid).get();
    const role: AuthenticatedUser["role"] = userDoc.exists
      ? (userDoc.data()?.role as AuthenticatedUser["role"]) || "user"
      : "user";

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || "",
      role,
      isDemo: false
    };
  } catch (error) {
    console.error("Authentication check failed:", error);
    return null;
  }
}
