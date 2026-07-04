"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { DEMO_MODE } from "@/lib/demo-data";

const DEMO_ROLES = [
  { id: "student", label: "Student", emoji: "🎓", desc: "Aarav Sharma · IIT Bombay" },
  { id: "recruiter", label: "Recruiter", emoji: "💼", desc: "Talent Suite · Google HR" },
  { id: "university", label: "University", emoji: "🏫", desc: "IIT Bombay · Admin Console" },
  { id: "government", label: "Government", emoji: "🏛️", desc: "National Intelligence Portal" }
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
  const { login, loginWithGoogle, signup } = useAuth();

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
      // Silent — fall through to student
    }
    router.push("/student/dashboard");
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
      } catch (signupErr: any) {
        // If signup fails (e.g. account exists with different password), show error
        setError(`Demo login failed. Try signing in manually with ${creds.email}.`);
        setLoadingRole(null);
        return;
      }
    }

    // Wait for auth state then redirect
    await new Promise(r => setTimeout(r, 600));
    const { auth } = await import("@/lib/firebase");
    const uid = auth.currentUser?.uid;
    if (uid) {
      await redirectByRole(uid);
    } else {
      setError("Authentication succeeded but session not established. Please try again.");
    }
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
      const { auth } = await import("@/lib/firebase");
      let uid = auth.currentUser?.uid;
      if (!uid) {
        await new Promise(r => setTimeout(r, 500));
        uid = auth.currentUser?.uid;
      }
      if (uid) {
        await redirectByRole(uid);
      } else {
        router.push("/student/dashboard");
      }
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Invalid email or password. Please check your credentials.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please wait a few minutes and try again.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0B1020] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <img src="/assets/logo.png" alt="AscendID Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AscendID</span>
          </Link>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white">Welcome back</h1>
              <p className="text-gray-400 text-sm mt-1">Sign in to your AscendID account</p>
            </div>

            {/* Demo Quick Login */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  Quick Demo Access
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ROLES.map(role => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleDemoLogin(role.id)}
                    disabled={isLoading || !!loadingRole}
                    className="flex flex-col items-start gap-0.5 px-3.5 py-3 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                  >
                    {loadingRole === role.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-[11px] text-gray-400">Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-base">{role.emoji}</span>
                        <span className="text-[11px] font-bold text-white group-hover:text-blue-400 transition-colors">{role.label}</span>
                        <span className="text-[9px] text-gray-500 font-mono leading-tight">{role.desc}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">or sign in manually</span>
              <div className="flex-1 h-px bg-white/5" />
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
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="bg-white/[0.03] border-white/10 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 text-white h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="bg-white/[0.03] border-white/10 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 text-white h-11 rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !!loadingRole}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-60"
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
                className="w-full bg-white/[0.02] border-white/10 hover:bg-white/[0.05] text-white h-11 rounded-xl font-medium text-sm"
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
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-5">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Create Identity
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
