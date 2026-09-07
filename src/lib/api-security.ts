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
 * SECURITY AUDIT:
 * 1. Production Mode: All API requests MUST provide a valid Firebase ID Token in `Authorization: Bearer <token>`.
 *    The token is cryptographically verified against Firebase Auth Admin SDK. User role is fetched from Firestore `users/${uid}`.
 * 2. Development/Test Mode: For automated CLI test suites (such as scripts/app-lifecycle-test.ts),
 *    `X-Demo-Role` and `X-Demo-Uid` are supported strictly when `process.env.NODE_ENV !== "production"`
 *    or `process.env.ALLOW_DEMO_AUTH_HEADERS === "true"`.
 * 3. In production (`NODE_ENV === "production"`), demo headers are strictly ignored and will NOT bypass authentication.
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // -----------------------------------------------------------------------
    // 1. Primary Authentication: Verify Real Firebase ID Token
    // -----------------------------------------------------------------------
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1]?.trim();
      if (token) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
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
        } catch (tokenErr) {
          console.warn("Firebase ID Token verification failed:", tokenErr);
          // If token was provided but invalid, reject immediately
          return null;
        }
      }
    }

    // -----------------------------------------------------------------------
    // 2. Development & Automated Testing Sandbox (strictly isolated)
    // -----------------------------------------------------------------------
    const isDevOrTest = process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_AUTH_HEADERS === "true";
    const demoRoleHeader = request.headers.get("X-Demo-Role");

    if (isDevOrTest && demoRoleHeader) {
      const validRoles: AuthenticatedUser["role"][] = ["student", "recruiter", "issuer", "government"];
      if (validRoles.includes(demoRoleHeader as AuthenticatedUser["role"])) {
        const demoUids: Record<string, string> = {
          student: "demo-student-001",
          recruiter: "demo-recruiter-001",
          issuer: "demo-issuer-001",
          government: "demo-gov-001"
        };
        const customUid = request.headers.get("X-Demo-Uid");
        return {
          uid: customUid || demoUids[demoRoleHeader] || "demo-user-001",
          email: `demo-${demoRoleHeader}@ascendid.demo`,
          role: demoRoleHeader as AuthenticatedUser["role"],
          isDemo: true
        };
      }
    }

    // Unauthenticated request
    return null;
  } catch (error) {
    console.error("Authentication check exception:", error);
    return null;
  }
}
