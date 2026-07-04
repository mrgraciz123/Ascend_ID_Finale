"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  Users,
  Search,
  ChevronDown,
  Building2,
  GraduationCap,
  Award,
  Lock,
  Globe,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

// Passport animation steps
const PASSPORT_STEPS = [
  { label: "Degree Verified", status: "success", detail: "B.Tech in Computer Science - IIT Bombay" },
  { label: "Internship Verified", status: "success", detail: "Software Engineering Intern - Google" },
  { label: "Certificate Issued", status: "success", detail: "AWS Certified Solutions Architect" },
  { label: "Trust Score Updated", status: "success", detail: "Score increased from 620 to 840 (Top 2%)" },
  { label: "Recruiter Viewed Profile", status: "info", detail: "Hiring Manager @ Stripe reviewed credentials" },
  { label: "Interview Invite", status: "action", detail: "Technical Interview scheduled for tomorrow" }
];

export default function Home() {
  const [passportStep, setPassportStep] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPassportStep((prev) => (prev + 1) % PASSPORT_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-[#0B1020] text-white font-sans overflow-x-hidden selection:bg-blue-600/30 selection:text-white">
      
      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-10 h-10 object-contain" />
            <span className="text-sm font-bold tracking-tight text-white">
              AscendID
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/demo">
              <span className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5 mr-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Demo
              </span>
            </Link>
            <Link href="/auth/login">
              <span className="text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer">Log In</span>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 font-bold h-8 px-4 text-xs rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02]">
                Create Identity
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[100vh] flex flex-col lg:flex-row items-center justify-between px-6 pt-24 pb-12 max-w-7xl mx-auto gap-12">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 z-10 space-y-8 text-left"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight leading-[1.1] text-white">
              Your Professional Identity.<br />
              <span className="text-blue-500">Verified Once.</span><br />
              Trusted Everywhere.
            </h1>
            <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-normal">
              AscendID creates a unified professional identity that connects education, achievements, internships, certifications, and skills into one trusted verification layer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/signup">
                <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(37,99,235,0.25)]">
                  Create Identity
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5 text-white font-bold rounded-xl transition-transform hover:scale-[1.02]">
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5 max-w-xl">
              <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest block">Quick Demo Portal Entry Points</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full bg-white/[0.02] hover:bg-white/5 border-white/5 text-white text-[11px] h-9 rounded-lg font-medium">
                    🎓 Student
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full bg-white/[0.02] hover:bg-white/5 border-white/5 text-white text-[11px] h-9 rounded-lg font-medium">
                    💼 Recruiter
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full bg-white/[0.02] hover:bg-white/5 border-white/5 text-white text-[11px] h-9 rounded-lg font-medium">
                    🏫 University
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full bg-white/[0.02] hover:bg-white/5 border-white/5 text-white text-[11px] h-9 rounded-lg font-medium">
                    🏛️ Government
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* LIVE ANIMATED DIGITAL PASSPORT */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full max-w-md z-10 mt-8 lg:mt-0"
          >
            <div className="relative w-full aspect-[1/1.4] rounded-[24px] bg-[#111827] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col p-6 backdrop-blur-xl">
              {/* Glass reflection shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent opacity-50 pointer-events-none" />
              
              {/* Card Top Branding */}
              <div className="flex justify-between items-start pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center gap-2">
                  <img src="/assets/logo.png" alt="AscendID Logo" className="w-5 h-5 object-contain" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 font-mono">AscendID Passport</span>
                </div>
                <div className="px-2.5 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Live Telemetry</span>
                </div>
              </div>

              {/* Profile Card Body */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/10 flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0">
                  AS
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white tracking-tight">Aditya Sharma</h3>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">did:ascendid:9x7f28bc91</p>
                </div>
              </div>

              {/* Interactive Timeline Items */}
              <div className="flex-1 space-y-3">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block">Verification Timeline</span>
                <div className="space-y-2.5">
                  {PASSPORT_STEPS.map((step, idx) => {
                    const isPassed = passportStep >= idx;
                    const isActive = passportStep === idx;
                    return (
                      <motion.div 
                        key={idx}
                        className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? "bg-blue-600/5 border-blue-500/30 shadow-[0_4px_12px_rgba(37,99,235,0.08)] scale-[1.01]" 
                            : isPassed
                              ? "bg-white/[0.01] border-white/5 opacity-60"
                              : "border-transparent opacity-25"
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/25 flex items-center justify-center text-[9px] text-gray-400">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-bold ${isActive ? "text-blue-400" : "text-white"}`}>{step.label}</p>
                          {isActive && (
                            <motion.p 
                              initial={{ opacity: 0, y: 2 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[10px] text-gray-400 mt-0.5 leading-normal"
                            >
                              {step.detail}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Card Metas */}
              <div className="border-t border-white/5 pt-4 mt-4 flex justify-between items-center">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-gray-500 block">Trust Score</span>
                  <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>{passportStep >= 3 ? "840" : "620"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-gray-500 block">Integrity Tier</span>
                  <span className="text-[10px] font-bold text-emerald-400 mt-0.5 block uppercase tracking-wider">
                    {passportStep >= 3 ? "Exceptional" : "Very Good"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="w-full py-24 border-t border-white/5 bg-[#111827]/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">The Problem</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tight text-white leading-tight">
                Traditional talent verification is broken.
              </h2>
              <p className="text-gray-400 text-base md:text-lg">
                Resumes are unverified claims, PDFs are easily forged, and background verification (BGV) is a slow, manual process that takes weeks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Credential Fraud</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Up to 30% of resumes contain altered graduation dates, inflated grades, or fabricated work histories. Forgery of PDF certificates is rampant.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Slow Background Checks</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Recruiters spend an average of 14 days verifying candidates' degrees and employment. This manual verification slows down hiring and leads to candidate drop-off.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 space-y-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Scattered Profiles</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Students have credentials scattered across university portals, emails, Google Drive, and paper transcripts, with no way to present them as a single, verified layer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section className="w-full py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">The Solution</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tight text-white leading-tight">
                A cryptographically sealed passport for talent.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                AscendID collapses the chaos of unverified achievements into a single, immutable digital identity. By anchoring verified credentials on the blockchain, we establish an instant trust layer between students, institutions, and recruiters.
              </p>
              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cryptographic Soundness</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Every credential is signed by the issuer's private key and anchored on Base Sepolia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Instant Verification</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Recruiters can verify an entire portfolio of credentials in under 5 seconds with a single scan.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full bg-[#111827] border border-white/5 p-8 rounded-2xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none" />
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                AscendID Trust Metrics
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs text-gray-400">Ledger Integrations</span>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full">Base Sepolia Active</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs text-gray-400">Academics Import</span>
                  <div className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full">DigiLocker API Connected</div>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <span className="text-xs text-gray-400">Format Standards</span>
                  <div className="text-xs font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded-full">W3C Verifiable Credentials</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Tamper Evidence</span>
                  <div className="text-xs font-mono font-bold text-blue-400 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded-full">SHA-256 Hashed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="w-full py-24 border-t border-white/5 bg-[#111827]/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">The Workflow</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
                How AscendID Works
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                A simple three-step process connecting students, institutions, and recruiters in a secure network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-4 relative overflow-hidden group">
                <div className="text-3xl font-display font-medium text-blue-600/30 group-hover:text-blue-500/40 transition-colors">01</div>
                <h3 className="text-lg font-bold text-white">Import & Verify</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Students import official marks from DigiLocker or request digital credentials from verified universities, companies, and certifiers.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-4 relative overflow-hidden group">
                <div className="text-3xl font-display font-medium text-blue-600/30 group-hover:text-blue-500/40 transition-colors">02</div>
                <h3 className="text-lg font-bold text-white">Seal On-Chain</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  The credentials are cryptographically normalized, hashed, and anchored on the blockchain, creating an immutable, tamper-proof record.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-4 relative overflow-hidden group">
                <div className="text-3xl font-display font-medium text-blue-600/30 group-hover:text-blue-500/40 transition-colors">03</div>
                <h3 className="text-lg font-bold text-white">Share with Trust</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Students share their verified passport link or QR code. Recruiters scan it to instantly verify credentials and audit potential score matches.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VERIFICATION FLOW TEASER */}
        <section className="w-full py-24 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full bg-neutral-950 border border-white/5 p-6 rounded-2xl shadow-2xl font-mono text-xs text-gray-400 space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none" />
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> VERIFICATION PIPELINE</span>
                <span className="text-[10px] text-gray-500">Base Sepolia</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span>✔</span> <span>Document Uploaded</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span>✔</span> <span>OCR Extraction Complete</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span>✔</span> <span>SHA-256 Hash Generated</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold animate-pulse">
                <span className="animate-spin inline-block">⏳</span> <span>Anchoring on Ledger...</span>
              </div>
              <div className="text-gray-600 text-[10px] pt-2 border-t border-white/5">
                Tx Hash: 0x89e13b29ceee72df292a8fc2e87...
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Verification Flow</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium tracking-tight text-white leading-tight">
                Traceable from origin to ledger.
              </h2>
              <p className="text-gray-400 text-base leading-relaxed">
                Our verification flow isn't a black box. Watch in real time as documents are parsed, hashed, matched against issuer signatures, and verified against the blockchain registry.
              </p>
              <Link href="/verify">
                <Button className="bg-white text-black hover:bg-white/90 text-xs font-bold h-10 px-6 rounded-lg flex items-center gap-1.5 shadow-md">
                  Launch Verification Portal <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION (STUDENT, RECRUITER, ENTERPRISE) */}
        <section className="w-full py-24 border-t border-white/5 bg-[#111827]/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Ecosystem Benefits</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
                Value for Every Stakeholder
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Student Benefits */}
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">For Students</h3>
                <ul className="space-y-3 text-xs text-gray-400 leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">✓</span> Own your verified credentials forever
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">✓</span> Share a single, secure link with recruiters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">✓</span> Get AI-driven career matching
                  </li>
                </ul>
              </div>

              {/* Recruiter Benefits */}
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">For Recruiters</h3>
                <ul className="space-y-3 text-xs text-gray-400 leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> 100% fraud-proof candidate profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> Eliminate manual background check delays
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> AI ranking by verified skills
                  </li>
                </ul>
              </div>

              {/* Enterprise Benefits */}
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-6">
                <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">For Enterprises</h3>
                <ul className="space-y-3 text-xs text-gray-400 leading-relaxed">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span> Scale hiring with trusted verification APIs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span> Zero-trust security architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">✓</span> Institutional compliance and auditing
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT METRICS */}
        <section className="w-full py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-display font-medium text-white">99%</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Fraud Reduction</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-display font-medium text-blue-500">2 Hours</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">BGV Speed (vs 14 Days)</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-display font-medium text-white">100%</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Tamper Proof</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl md:text-5xl font-display font-medium text-blue-500">5 Sec</div>
                <div className="text-xs text-gray-400 uppercase tracking-widest font-mono">Instant Audit Scan</div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="w-full py-24 border-t border-white/5 bg-[#111827]/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white">
                Trusted by Top Talent & Teams
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-6">
                <p className="text-gray-300 text-sm italic leading-relaxed">
                  "I was tired of uploading my marksheets 50 times for 50 different applications. Now I just share my AscendID profile, and recruiters know it's cryptographically backed by DigiLocker and Base."
                </p>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-blue-600/15 flex items-center justify-center text-blue-400 font-bold text-sm">
                    PM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Priya Menon</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Verified B.Tech Candidate</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 space-y-6">
                <p className="text-gray-300 text-sm italic leading-relaxed">
                  "As a hiring manager at a fast-growing startup, we don't have a massive background verification team. AscendID guarantees that the candidates we interview actually have the degrees and experience they claim."
                </p>
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/15 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    RD
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Rohit Das</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Talent Acquisition, Series B Startup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="w-full py-24 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Questions</span>
              <h2 className="text-3xl font-display font-medium tracking-tight text-white">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "How does AscendID verify academic records?",
                  a: "AscendID connects directly to DigiLocker, a national digital document wallet, to fetch verified academic records. Once retrieved, we generate a SHA-256 hash of the normalized metadata and anchor it on the Base Sepolia blockchain ledger."
                },
                {
                  q: "Can recruiters trust the verification status?",
                  a: "Yes, absolutely. The verification status is determined cryptographically. The verifier recovers the issuer's public key from the digital signature, recalculates the metadata hash, and checks if the hash is registered and unrevoked in our smart contract."
                },
                {
                  q: "Is candidate data stored on the blockchain?",
                  a: "No. For privacy and compliance, we never store personally identifiable information (PII) on the blockchain. We only anchor cryptographic hashes of the normalized metadata. The actual details are stored securely in Firestore."
                },
                {
                  q: "How is the Trust Score calculated?",
                  a: "The Trust Score is calculated dynamically using factors such as the reputation of the credential issuers, the consistency of skills across certificates, peer validations, and active verification history."
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-white/5 bg-[#111827]/30 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex justify-between items-center text-sm font-bold text-white hover:bg-white/[0.02]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="p-5 pt-0 text-xs text-gray-400 leading-relaxed border-t border-white/5 bg-[#111827]/10">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA HERO SECTION */}
        <section className="w-full py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-[#111827]/20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/5 via-[#0B1020] to-[#0B1020]" />
          <div className="max-w-2xl mx-auto px-6 z-10 relative space-y-8">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-12 h-12 mx-auto object-contain" />
            <h2 className="text-3xl md:text-4xl font-display font-medium tracking-tight text-white leading-tight">
              Ready to claim your trusted professional identity?
            </h2>
            <Link href="/auth/signup">
              <Button className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-transform hover:scale-[1.02] shadow-[0_4px_20px_rgba(37,99,235,0.3)]">
                Establish Your Identity
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#0B1020] relative z-10 text-xs text-gray-500">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/assets/logo.png" alt="AscendID Logo" className="w-5 h-5 object-contain" />
                <span className="font-bold text-white">AscendID</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Building the trust infrastructure for the next generation of global talent.
              </p>
              <a
                href="https://sepolia.basescan.org/address/0xC9a43158891282A2B1475592D5719c001986926b"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-bold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Base Sepolia · Live Contract
              </a>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-bold text-white">Protocol</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/student/trust-engine" className="hover:text-white transition-colors">Trust Engine</Link></li>
                <li>
                  <a href="https://sepolia.basescan.org/address/0xC9a43158891282A2B1475592D5719c001986926b" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Smart Contract</a>
                </li>
                <li><Link href="/verify" className="hover:text-white transition-colors">Verify Credential</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-bold text-white">Ecosystem</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Students</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Recruiters</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Universities</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-bold text-white">Company</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/auth/signup" className="hover:text-white transition-colors">Get Started</Link></li>
                <li><Link href="/verify" className="hover:text-white transition-colors">Verify Portal</Link></li>
                <li><Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © {new Date().getFullYear()} AscendID. Professional Identity Infrastructure. Powered by Base Sepolia &amp; Google Gemini.
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
