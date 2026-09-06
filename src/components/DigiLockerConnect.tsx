"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, FileText, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { StudentService } from "@/services/student";
import { useAuth } from "@/context/AuthContext";
import { isDemoUser } from "@/lib/demo-data";

const SUPPORTED_DOCS = [
  "Class 10 & 12 Marksheets",
  "Degree Enrollment Certificate",
  "Transfer Certificate",
  "Migration Certificate"
];

export function DigiLockerConnect({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<"initial" | "connecting" | "importing" | "success">("initial");
  const { currentUser } = useAuth();

  const handleConnect = async () => {
    const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
    if (!currentUser && !demoActive) return;
    setStep("connecting");

    if (!demoActive) {
      await StudentService.connectDigiLocker(currentUser!.uid);
    }

    setStep("importing");
    // Allow time for the animated state to be visible
    await new Promise(r => setTimeout(r, 2500));
    setStep("success");
    await new Promise(r => setTimeout(r, 1500));
    onComplete();
  };

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#C9944A]/10 border border-[#C9944A]/30 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#C9944A]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#F5F1E8]">Academic Identity Connected</h3>
          <p className="text-sm text-[#8A847B] mt-1">
            {isDemoUser(currentUser?.email || currentUser?.uid) ? "Demo: Academic records synced successfully." : "Records verified and imported successfully."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-md bg-[#B65F32]/10 border border-[#B65F32]/30 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7 text-[#B65F32]" />
        </div>
        <h3 className="text-xl font-bold text-[#F5F1E8]">Connect Academic Identity</h3>
        <p className="text-sm text-[#8A847B] leading-relaxed max-w-sm mx-auto">
          {isDemoUser(currentUser?.email || currentUser?.uid)
            ? "Simulate DigiLocker connection to import and verify your academic records."
            : "Link with DigiLocker to import and cryptographically verify your government-backed academic records."}
        </p>
      </div>

      {/* Demo mode notice */}
      {isDemoUser(currentUser?.email || currentUser?.uid) && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-md bg-[#B65F32]/5 border border-[#B65F32]/20 text-[#B65F32] text-xs">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-widest text-[10px]">Demo Mode</span>
            <p className="text-[#8A847B] mt-0.5 leading-relaxed">
              This simulates the DigiLocker OAuth flow. In production, this redirects to DigiLocker's government portal for real document verification.
            </p>
          </div>
        </div>
      )}

      {step === "initial" ? (
        <>
          {/* Supported Documents */}
          <div className="bg-[#191919] border border-[#B65F32]/20 rounded-md p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5F1E8] uppercase tracking-wider font-mono">
              <FileText className="w-3.5 h-3.5 text-[#B65F32]" />
              Supported Documents
            </div>
            <ul className="space-y-1.5">
              {SUPPORTED_DOCS.map(d => (
                <li key={d} className="flex items-center gap-2 text-xs text-[#8A847B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9944A] shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleConnect}
            className="w-full bg-[#B65F32] hover:bg-[#8F4728] text-[#F5F1E8] h-11 font-bold rounded-md transition-all"
          >
            {isDemoUser(currentUser?.email || currentUser?.uid) ? "Simulate DigiLocker Connection" : "Continue to DigiLocker"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 space-y-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-[#B65F32]/30 border-t-[#B65F32] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#B65F32]" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-[#F5F1E8]">
              {step === "connecting" ? "Establishing Secure Link..." : "Syncing Academic Records..."}
            </h3>
            <p className="text-xs text-[#8A847B] animate-pulse">
              {step === "connecting"
                ? "Verifying institutional cryptographic signatures"
                : "Importing DigiLocker-verified documents"}
            </p>
          </div>
          <div className="w-full max-w-xs space-y-1.5">
            {[
              { label: "Secure session", done: true },
              { label: "Identity verification", done: step === "importing" },
              { label: "Document import", done: false }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5 text-xs">
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9944A] shrink-0" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 text-[#B65F32] animate-spin shrink-0" />
                )}
                <span className={item.done ? "text-[#F5F1E8]" : "text-[#8A847B]"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
