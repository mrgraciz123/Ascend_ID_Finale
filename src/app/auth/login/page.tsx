"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const DEMO_ROLES = [
  { id: "student", label: "Student Passport", role: "Student", desc: "Aarav Sharma · IIT Bombay", emoji: "📜" },
  { id: "university", label: "Issuer Authority Node", role: "University", desc: "IIT Bombay Admin Console", emoji: "🏛️" },
  { id: "recruiter", label: "Recruiter Fraud Suite", role: "Recruiter", desc: "Google Hiring Lead", emoji: "💼" },
  { id: "government", label: "National Telemetry", role: "Government", desc: "Gov Audit Official", emoji: "🔍" }
];

const ROLE_CREDENTIALS: Record<string, { email: string; name: string; issuerType?: string }> = {
  student: { email: "student.demo@ascendid.ai", name: "Aarav Sharma" },
  recruiter: { email: "recruiter.demo@ascendid.ai", name: "Google Hiring Lead" },
  university: { email: "issuer.demo@ascendid.ai", name: "IIT Bombay Admin", issuerType: "university" },
  government: { email: "gov.demo@ascendid.ai", name: "National Audit Official" }
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login, signup, loginWithGoogle } = useAuth();

  const redirectByRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "issuer") return router.push("/issuer/dashboard");
        if (role === "recruiter") return router.push("/recruiter/dashboard");
        if (role === "government") return router.push("/gov/dashboard");
      }
    } catch {
      // Fall through
    }
    router.push("/student/passport");
  };

  const handleDemoLogin = async (roleId: string) => {
    setLoadingRole(roleId);
    setError(null);
    const creds = ROLE_CREDENTIALS[roleId];
    if (!creds) { setLoadingRole(null); return; }

    const password = "AscendID_Demo_2026!";
    const role = roleId === "university" ? "issuer" : roleId;

    try {
      await login(creds.email, password);
    } catch {
      try {
        await signup(creds.email, password, creds.name, role, creds.issuerType || "");
        await new Promise(r => setTimeout(r, 400));
        await login(creds.email, password);
      } catch {
        setError(`Demo login failed. Try signing in manually with ${creds.email}.`);
        setLoadingRole(null);
        return;
      }
    }

    await new Promise(r => setTimeout(r, 500));
    router.push(roleId === "university" ? "/issuer/dashboard" : roleId === "recruiter" ? "/recruiter/dashboard" : roleId === "government" ? "/gov/dashboard" : "/student/passport");
    setLoadingRole(null);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string || "").trim();
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Please enter your email and password.");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      router.push("/student/passport");
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0D0D0D] relative overflow-hidden font-sans">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-md bg-[#B65F32]/10 border border-[#B65F32]/30 flex items-center justify-center">
              <img src="/assets/logo.png" alt="AscendID Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#F5F1E8]">AscendID</span>
          </Link>
        </div>

        <div className="bg-[#191919] border border-[#B65F32]/20 rounded-md overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#F5F1E8]">Welcome back</h1>
              <p className="text-[#8A847B] text-xs mt-1">Sign in to your AscendID passport checkpoint</p>
            </div>

            {/* Demo Quick Login */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#C9944A] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-[#C9944A] uppercase tracking-widest">
                  Quick Demo Access Checkpoints
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ROLES.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleDemoLogin(role.id)}
                    disabled={isLoading || !!loadingRole}
                    className="flex flex-col items-start gap-0.5 px-3.5 py-3 rounded-md border border-[#B65F32]/20 bg-[#0D0D0D] hover:bg-[#241814] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                  >
                    {loadingRole === role.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <Loader2 className="w-4 h-4 animate-spin text-[#B65F32]" />
                        <span className="text-[11px] text-[#8A847B]">Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-base">{role.emoji}</span>
                        <span className="text-[11px] font-bold text-[#F5F1E8] group-hover:text-[#B65F32] transition-colors">{role.label}</span>
                        <span className="text-[9px] text-[#8A847B] font-mono leading-tight">{role.desc}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#B65F32]/20" />
              <span className="text-[10px] uppercase text-[#8A847B] font-mono font-bold tracking-widest">or sign in manually</span>
              <div className="flex-1 h-px bg-[#B65F32]/20" />
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-md bg-[#9E2A2B]/15 border border-[#9E2A2B]/30 text-[#E57373] text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-mono font-bold text-[#8A847B] uppercase tracking-widest">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="bg-[#0D0D0D] border-[#B65F32]/20 focus-visible:border-[#B65F32] text-[#F5F1E8] h-10 rounded-md text-xs font-mono"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-mono font-bold text-[#8A847B] uppercase tracking-widest">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="bg-[#0D0D0D] border-[#B65F32]/20 focus-visible:border-[#B65F32] text-[#F5F1E8] h-10 rounded-md text-xs font-mono"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !!loadingRole}
                className="w-full bg-[#B65F32] hover:bg-[#8F4728] text-[#F5F1E8] font-bold h-11 rounded-md transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : "Sign In"}
              </Button>
            </form>

            {/* Google */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[#0D0D0D] border-[#B65F32]/20 hover:bg-[#241814] text-[#F5F1E8] h-10 rounded-md font-medium text-xs"
                disabled={isLoading || !!loadingRole}
                onClick={async () => {
                  setError(null);
                  setIsLoading(true);
                  try {
                    await loginWithGoogle();
                    const { auth } = await import("@/lib/firebase");
                    const uid = auth.currentUser?.uid;
                    if (uid) await redirectByRole(uid);
                    else router.push("/student/dashboard");
                  } catch (err: any) {
                    if (err?.code !== "auth/popup-closed-by-user") {
                      setError("Google sign-in failed. Please try again.");
                    }
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-xs text-[#8A847B] mt-5">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-[#B65F32] hover:text-[#C9944A] font-semibold transition-colors">
                Create Identity
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
