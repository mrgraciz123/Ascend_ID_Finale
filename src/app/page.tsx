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
  GraduationCap,
  Building2,
  Landmark,
  Lock,
  Globe,
  AlertTriangle,
  ChevronDown,
  ArrowLeftRight,
  Play,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

// Passport animation steps
const PASSPORT_STEPS = [
  { label: "Degree Verified", status: "success", detail: "B.Tech in Computer Science — IIT Bombay" },
  { label: "Internship Verified", status: "success", detail: "Software Engineering Intern — Google" },
  { label: "Certificate Issued", status: "success", detail: "AWS Certified Solutions Architect" },
  { label: "Trust Score Updated", status: "success", detail: "Score increased from 620 to 840 (Top 2%)" },
  { label: "Recruiter Viewed Profile", status: "info", detail: "Hiring Manager @ Stripe reviewed credentials" },
  { label: "Interview Invite", status: "action", detail: "Technical Interview scheduled for tomorrow" },
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
    <div className="relative min-h-screen bg-[#0D0D0D] text-[#F5F1E8] font-sans overflow-x-hidden selection:bg-[#B65F32]/30 selection:text-[#F5F1E8]">

      {/* HEADER */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0D0D0D]/95 border-b border-[#B65F32]/15 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-14 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-8 h-8 object-contain" />
            <span className="text-sm font-bold tracking-tight text-[#F5F1E8]">AscendID</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/auth/login">
              <span className="text-[11px] font-medium text-[#8A847B] hover:text-[#F5F1E8] transition-colors">Student</span>
            </Link>
            <Link href="/auth/login">
              <span className="text-[11px] font-medium text-[#8A847B] hover:text-[#F5F1E8] transition-colors">Issuer</span>
            </Link>
            <Link href="/auth/login">
              <span className="text-[11px] font-medium text-[#8A847B] hover:text-[#F5F1E8] transition-colors">Recruiter</span>
            </Link>
            <Link href="/auth/login">
              <span className="text-[11px] font-medium text-[#8A847B] hover:text-[#F5F1E8] transition-colors">Government</span>
            </Link>
            <div className="h-3 w-px bg-[#B65F32]/20" />
            <Link href="/verify">
              <span className="text-[11px] font-medium text-[#C9944A] hover:text-[#E8B878] transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                Verify
              </span>
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <span className="text-xs font-medium text-[#8A847B] hover:text-[#F5F1E8] transition-colors">Log In</span>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#B65F32] text-[#F5F1E8] hover:bg-[#8F4728] font-bold h-8 px-4 text-xs rounded-md transition-all">
                Enter Workspace
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center">

        {/* ─── HERO ─────────────────────────────────────────────── */}
        <section className="relative w-full min-h-[88vh] flex flex-col lg:flex-row items-center justify-between px-6 pt-28 pb-16 max-w-7xl mx-auto gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 z-10 space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#C9944A]/25 bg-[#C9944A]/8 text-[#C9944A] text-[10px] font-mono uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Credential Infrastructure · Identity Layer</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.12] text-[#F5F1E8]">
              India's Trusted<br />
              <span className="copper-gradient-text">Credential</span><br />
              Infrastructure.
            </h1>
            <p className="text-sm text-[#8A847B] max-w-lg leading-relaxed">
              AscendID connects students, institutions, recruiters and government through cryptographically verified identity, tamper-proof credentials, and instant trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/auth/signup">
                <Button className="h-11 px-7 bg-[#B65F32] hover:bg-[#8F4728] text-[#F5F1E8] font-bold rounded-md transition-all flex items-center gap-2">
                  Enter Your Workspace <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" className="h-11 px-7 border-[#B65F32]/30 bg-transparent hover:bg-[#191919] text-[#F5F1E8] font-bold rounded-md flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9944A]" /> Verify a Credential
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-[#B65F32]/15 max-w-lg">
              <span className="text-[9px] uppercase font-mono font-bold text-[#8A847B]/50 tracking-[0.15em] block mb-3">
                Four participants. One infrastructure.
              </span>
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { Icon: GraduationCap, label: "Student" },
                  { Icon: Building2, label: "Institution" },
                  { Icon: Briefcase, label: "Recruiter" },
                  { Icon: Landmark, label: "Government" },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[11px] text-[#8A847B]">
                    <Icon className="w-3.5 h-3.5 text-[#B65F32]/60" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Live Digital Passport Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full max-w-md z-10 mt-8 lg:mt-0"
          >
            <div className="relative w-full aspect-[1/1.4] rounded-md bg-[#191919] border border-[#B65F32]/25 shadow-2xl flex flex-col p-6">
              {/* Card Top */}
              <div className="flex justify-between items-start pb-4 border-b border-[#B65F32]/15 mb-5">
                <div className="flex items-center gap-2">
                  <img src="/assets/logo.png" alt="AscendID Logo" className="w-4 h-4 object-contain" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A847B] font-mono">Digital Passport</span>
                </div>
                <div className="px-2 py-0.5 bg-[#C9944A]/10 rounded border border-[#C9944A]/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C9944A] animate-pulse" />
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-[#C9944A]">W3C Anchor Active</span>
                </div>
              </div>

              {/* Profile */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-md bg-[#B65F32]/15 border border-[#B65F32]/30 flex items-center justify-center text-sm font-bold text-[#F5F1E8] shrink-0 font-mono">
                  AS
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#F5F1E8] tracking-tight">Aditya Sharma</h3>
                  <p className="text-xs text-[#8A847B] font-mono truncate">did:ascendid:9x7f28bc91</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 space-y-2.5">
                <span className="text-[9px] uppercase font-bold text-[#8A847B]/60 tracking-wider block font-mono">Verification Timeline</span>
                {PASSPORT_STEPS.map((step, idx) => {
                  const isPassed = passportStep >= idx;
                  const isActive = passportStep === idx;
                  return (
                    <motion.div
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-md border transition-all duration-300 ${
                        isActive
                          ? "bg-[#B65F32]/5 border-[#B65F32]/25 shadow-[0_4px_12px_rgba(182,95,50,0.08)] scale-[1.01]"
                          : isPassed
                          ? "bg-transparent border-transparent opacity-50"
                          : "border-transparent opacity-20"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#C9944A]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#8A847B]/30 flex items-center justify-center text-[9px] text-[#8A847B]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold ${isActive ? "text-[#C9944A]" : "text-[#F5F1E8]"}`}>{step.label}</p>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] text-[#8A847B] mt-0.5 leading-normal"
                          >
                            {step.detail}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom */}
              <div className="border-t border-[#B65F32]/10 pt-3 mt-3 flex justify-between items-center">
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-[#8A847B]/60 block font-mono">Trust Score</span>
                  <div className="text-xl font-bold text-[#F5F1E8] mt-0.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C9944A]" />
                    <span>{passportStep >= 3 ? "840" : "620"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[8px] uppercase tracking-wider text-[#8A847B]/60 block font-mono">Integrity Tier</span>
                  <span className="text-[10px] font-bold text-[#C9944A] mt-0.5 block uppercase tracking-wider">
                    {passportStep >= 3 ? "Exceptional" : "Very Good"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── ECOSYSTEM COMPOSITION ────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mb-14 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">The Ecosystem</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-[#F5F1E8] leading-tight">
                One infrastructure.<br />Four participants.
              </h2>
              <p className="text-[#8A847B] text-sm leading-relaxed max-w-xl">
                Students, institutions and recruiters are connected through shared identity, proof and credentials. Government provides ecosystem-level oversight, telemetry and compliance intelligence.
              </p>
            </div>

            {/* Ecosystem visual composition */}
            <div className="relative border border-[#B65F32]/20 rounded-md overflow-hidden">

              {/* Government oversight bar */}
              <div className="flex items-center gap-3 px-6 py-3.5 bg-[#141414] border-b border-[#B65F32]/15">
                <Landmark className="w-4 h-4 text-[#C9944A] shrink-0" />
                <span className="text-[10px] font-bold text-[#C9944A] tracking-wider uppercase font-mono">Government</span>
                <div className="h-3 w-px bg-[#B65F32]/20 mx-1" />
                <span className="text-[10px] text-[#8A847B] font-mono">National Oversight · Telemetry · Compliance Intelligence</span>
              </div>

              {/* Three-participant row */}
              <div className="flex flex-col md:flex-row items-stretch bg-[#0D0D0D]">

                {/* Student */}
                <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#B65F32]/10 space-y-4">
                  <div className="w-9 h-9 rounded-md bg-[#B65F32]/10 border border-[#B65F32]/20 flex items-center justify-center">
                    <GraduationCap className="w-4.5 h-4.5 text-[#B65F32]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F1E8] mb-1">Student</h3>
                    <p className="text-[11px] text-[#8A847B] leading-relaxed">
                      Owns and presents verified digital identity. Accumulates credentials. Builds a tamper-proof proof vault.
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-[#B65F32]/60 uppercase tracking-wider">Identity → Proof → Ascension</div>
                </div>

                {/* Connector A */}
                <div className="hidden md:flex items-center justify-center w-10 shrink-0 border-r border-[#B65F32]/10">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#B65F32]/30" />
                </div>

                {/* Institution */}
                <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-[#B65F32]/10 space-y-4">
                  <div className="w-9 h-9 rounded-md bg-[#C9944A]/10 border border-[#C9944A]/20 flex items-center justify-center">
                    <Building2 className="w-4.5 h-4.5 text-[#C9944A]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F1E8] mb-1">Institution</h3>
                    <p className="text-[11px] text-[#8A847B] leading-relaxed">
                      Issues cryptographically signed credentials. Manages a trusted credential registry. Anchors on-chain.
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-[#C9944A]/60 uppercase tracking-wider">Issue → Certify → Manage</div>
                </div>

                {/* Connector B */}
                <div className="hidden md:flex items-center justify-center w-10 shrink-0 border-r border-[#B65F32]/10">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#B65F32]/30" />
                </div>

                {/* Recruiter */}
                <div className="flex-1 p-8 space-y-4">
                  <div className="w-9 h-9 rounded-md bg-[#B65F32]/10 border border-[#B65F32]/20 flex items-center justify-center">
                    <Briefcase className="w-4.5 h-4.5 text-[#B65F32]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F1E8] mb-1">Recruiter</h3>
                    <p className="text-[11px] text-[#8A847B] leading-relaxed">
                      Discovers verified talent. Performs instant credential verification. Flags fraud with AI audit.
                    </p>
                  </div>
                  <div className="text-[9px] font-mono text-[#B65F32]/60 uppercase tracking-wider">Discover → Verify → Hire</div>
                </div>
              </div>

              {/* Trust chain footer */}
              <div className="border-t border-[#B65F32]/10 bg-[#141414] px-6 py-3 flex items-center justify-center">
                <span className="text-[9px] font-mono text-[#8A847B]/50 tracking-[0.14em] uppercase">
                  Identity · Proof · Credential · Verification · Trust
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ROLE ENTRY POINTS ─────────────────────────────────── */}
        <section className="w-full py-20 border-t border-[#B65F32]/10 bg-[#191919]/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mb-12 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">Workspaces</span>
              <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-[#F5F1E8]">
                Enter your workspace.
              </h2>
              <p className="text-[#8A847B] text-sm leading-relaxed">
                Each participant has a dedicated workspace within the same infrastructure. Authentication routes you to the correct experience.
              </p>
            </div>

            {/* Workspace entry list */}
            <div className="max-w-2xl border border-[#B65F32]/20 rounded-md overflow-hidden">
              {[
                {
                  Icon: GraduationCap,
                  label: "Student",
                  description: "Build your Digital Passport",
                  theme: "Build your verifiable identity. Import credentials, build your proof vault, track your trust score.",
                  href: "/auth/login",
                },
                {
                  Icon: Building2,
                  label: "Institution",
                  description: "Issue Trusted Credentials",
                  theme: "Issue cryptographically signed credentials. Manage your registry. Publish to the blockchain.",
                  href: "/auth/login",
                },
                {
                  Icon: Briefcase,
                  label: "Recruiter",
                  description: "Verify Talent",
                  theme: "Discover verified candidates. Verify credentials instantly. Run AI-powered fraud audits.",
                  href: "/auth/login",
                },
                {
                  Icon: Landmark,
                  label: "Government",
                  description: "Monitor the Credential Ecosystem",
                  theme: "Access national telemetry. Monitor institutional compliance. Analyze verification intelligence.",
                  href: "/auth/login",
                },
              ].map(({ Icon, label, description, theme, href }, idx, arr) => (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-5 px-6 py-5 hover:bg-[#191919]/80 transition-colors group/entry ${
                    idx < arr.length - 1 ? "border-b border-[#B65F32]/10" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-md bg-[#0D0D0D] border border-[#B65F32]/20 flex items-center justify-center shrink-0 group-hover/entry:border-[#B65F32]/40 transition-colors">
                    <Icon className="w-4 h-4 text-[#8A847B] group-hover/entry:text-[#B65F32] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-0.5">
                      <span className="text-xs font-bold text-[#F5F1E8]">{label}</span>
                      <span className="text-[10px] text-[#C9944A] font-mono">· {description}</span>
                    </div>
                    <p className="text-[11px] text-[#8A847B] leading-relaxed">{theme}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8A847B]/40 group-hover/entry:text-[#B65F32] group-hover/entry:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>

            {/* Public section */}
            <div className="max-w-2xl mt-3 border border-[#B65F32]/10 rounded-md overflow-hidden">
              <div className="px-6 py-2 border-b border-[#B65F32]/10">
                <span className="text-[9px] uppercase font-mono font-bold text-[#8A847B]/40 tracking-[0.14em]">Public</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <Link
                  href="/verify"
                  className="flex-1 flex items-center gap-4 px-6 py-4 hover:bg-[#191919]/50 transition-colors group/v border-b sm:border-b-0 sm:border-r border-[#B65F32]/10"
                >
                  <ShieldCheck className="w-4 h-4 text-[#8A847B] group-hover/v:text-[#C9944A] transition-colors shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#8A847B] group-hover/v:text-[#F5F1E8] transition-colors">Verify a Credential</span>
                    <p className="text-[10px] text-[#8A847B]/60 mt-0.5">No account required</p>
                  </div>
                </Link>
                <Link
                  href="/demo"
                  className="flex-1 flex items-center gap-4 px-6 py-4 hover:bg-[#191919]/50 transition-colors group/d"
                >
                  <Play className="w-4 h-4 text-[#8A847B] group-hover/d:text-[#C9944A] transition-colors shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-[#8A847B] group-hover/d:text-[#F5F1E8] transition-colors">Auto Simulation</span>
                    <p className="text-[10px] text-[#8A847B]/60 mt-0.5">See AscendID in action</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── PROBLEM ──────────────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">The Problem</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-[#F5F1E8] leading-tight">
                Traditional talent verification is broken.
              </h2>
              <p className="text-[#8A847B] text-sm md:text-base leading-relaxed">
                Resumes are unverified claims, PDFs are easily forged, and background verification is a slow, manual process that takes weeks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-4">
                <div className="w-9 h-9 rounded-md bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 flex items-center justify-center text-[#E57373]">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F5F1E8]">Credential Fraud</h3>
                <p className="text-[#8A847B] text-xs leading-relaxed">
                  Up to 30% of resumes contain altered graduation dates, inflated grades, or fabricated work histories. Forgery of PDF certificates is rampant.
                </p>
              </div>
              <div className="p-6 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-4">
                <div className="w-9 h-9 rounded-md bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 flex items-center justify-center text-[#E57373]">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F5F1E8]">Slow Background Checks</h3>
                <p className="text-[#8A847B] text-xs leading-relaxed">
                  Recruiters spend an average of 14 days verifying candidates' degrees and employment. Manual verification slows hiring and leads to candidate drop-off.
                </p>
              </div>
              <div className="p-6 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-4">
                <div className="w-9 h-9 rounded-md bg-[#9E2A2B]/10 border border-[#9E2A2B]/20 flex items-center justify-center text-[#E57373]">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#F5F1E8]">Scattered Profiles</h3>
                <p className="text-[#8A847B] text-xs leading-relaxed">
                  Students have credentials scattered across university portals, emails, and paper transcripts — no single, verified presentation layer exists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SOLUTION ─────────────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10 bg-[#191919]/15">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">The Solution</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-[#F5F1E8] leading-tight">
                A cryptographically sealed passport for talent.
              </h2>
              <p className="text-[#8A847B] text-sm leading-relaxed">
                AscendID collapses the chaos of unverified achievements into a single, immutable digital identity. By anchoring verified credentials on the blockchain, we establish an instant trust layer between students, institutions, and recruiters.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Cryptographic Soundness",
                    detail: "Every credential is signed by the issuer's private key and anchored on AscendChain (Chain 13370).",
                  },
                  {
                    title: "Instant Verification",
                    detail: "Recruiters can verify an entire portfolio of credentials in under 5 seconds with a single scan.",
                  },
                ].map(({ title, detail }) => (
                  <div key={title} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-[#B65F32]/10 border border-[#B65F32]/25 flex items-center justify-center text-[#B65F32] shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F1E8]">{title}</h4>
                      <p className="text-[11px] text-[#8A847B] mt-0.5 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full bg-[#191919] border border-[#B65F32]/15 p-8 rounded-md relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#B65F32]/3 rounded-full blur-[30px] pointer-events-none" />
              <h3 className="text-sm font-bold text-[#F5F1E8] mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9944A]" />
                AscendID Trust Metrics
              </h3>
              <div className="space-y-5">
                {[
                  { label: "Ledger Integrations", value: "AscendChain Active", color: "text-[#C9944A] border-[#C9944A]/20 bg-[#C9944A]/5" },
                  { label: "Academics Import", value: "DigiLocker API Connected", color: "text-[#C9944A] border-[#C9944A]/20 bg-[#C9944A]/5" },
                  { label: "Format Standards", value: "W3C Verifiable Credentials", color: "text-[#B65F32] border-[#B65F32]/20 bg-[#B65F32]/5" },
                  { label: "Tamper Evidence", value: "SHA-256 Hashed", color: "text-[#B65F32] border-[#B65F32]/20 bg-[#B65F32]/5" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center pb-4 border-b border-[#B65F32]/8 last:border-b-0 last:pb-0">
                    <span className="text-xs text-[#8A847B]">{label}</span>
                    <div className={`text-[10px] font-mono font-bold ${color} border px-2 py-0.5 rounded`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">The Workflow</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-[#F5F1E8]">
                How AscendID Works
              </h2>
              <p className="text-[#8A847B] text-xs sm:text-sm">
                A simple three-step process connecting students, institutions, and recruiters in a secure, verifiable network.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                {
                  num: "01",
                  title: "Import & Verify",
                  detail: "Students import official marks from DigiLocker or request digital credentials from verified universities, companies, and certifiers.",
                },
                {
                  num: "02",
                  title: "Seal On-Chain",
                  detail: "Credentials are cryptographically normalized, hashed, and anchored on the blockchain — creating an immutable, tamper-proof record.",
                },
                {
                  num: "03",
                  title: "Share with Trust",
                  detail: "Students share their verified passport link or QR code. Recruiters scan it to instantly verify credentials and audit potential score matches.",
                },
              ].map(({ num, title, detail }) => (
                <div key={num} className="p-8 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-4 relative overflow-hidden group">
                  <div className="text-3xl font-heading font-bold text-[#B65F32]/20 group-hover:text-[#B65F32]/35 transition-colors">{num}</div>
                  <h3 className="text-sm font-bold text-[#F5F1E8]">{title}</h3>
                  <p className="text-[#8A847B] text-xs leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── VERIFICATION FLOW ────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10 bg-[#191919]/15">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full bg-[#0D0D0D] border border-[#B65F32]/15 p-6 rounded-md shadow-2xl font-mono text-xs text-[#8A847B] space-y-3.5 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-[#B65F32]/10 pb-2.5 mb-2.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9944A] animate-pulse" /> VERIFICATION PIPELINE
                </span>
                <span className="text-[10px] text-[#C9944A] font-mono font-bold">AscendChain Devnet (13370)</span>
              </div>
              <div className="flex items-center gap-2 text-[#C9944A] font-bold"><span>✔</span> <span>Document Uploaded</span></div>
              <div className="flex items-center gap-2 text-[#C9944A] font-bold"><span>✔</span> <span>OCR Extraction Complete</span></div>
              <div className="flex items-center gap-2 text-[#C9944A] font-bold"><span>✔</span> <span>SHA-256 Hash Generated</span></div>
              <div className="flex items-center gap-2 text-[#B65F32] font-bold animate-pulse">
                <span className="animate-spin inline-block">⏳</span> <span>Anchoring on Ledger...</span>
              </div>
              <div className="text-[#8A847B]/40 text-[10px] pt-2 border-t border-[#B65F32]/10">
                Tx Hash: 0x89e13b29ceee72df292a8fc2e87...
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">Verification Flow</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold tracking-tight text-[#F5F1E8] leading-tight">
                Traceable from origin to ledger.
              </h2>
              <p className="text-[#8A847B] text-sm leading-relaxed">
                Our verification flow isn't a black box. Watch in real time as documents are parsed, hashed, matched against issuer signatures, and verified against the blockchain registry.
              </p>
              <Link href="/verify">
                <Button className="bg-[#B65F32] hover:bg-[#8F4728] text-[#F5F1E8] text-xs font-bold h-10 px-6 rounded-md flex items-center gap-1.5 transition-all">
                  Launch Verification Portal <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ─── ECOSYSTEM BENEFITS ───────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">Ecosystem Benefits</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-[#F5F1E8]">
                Value for Every Participant
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  Icon: GraduationCap,
                  label: "Students",
                  iconColor: "text-[#B65F32]",
                  iconBg: "bg-[#B65F32]/10 border-[#B65F32]/20",
                  checkColor: "text-[#B65F32]",
                  items: [
                    "Own verified credentials forever",
                    "Share a single, secure link",
                    "AI-driven career matching",
                  ],
                },
                {
                  Icon: Building2,
                  label: "Institutions",
                  iconColor: "text-[#C9944A]",
                  iconBg: "bg-[#C9944A]/10 border-[#C9944A]/20",
                  checkColor: "text-[#C9944A]",
                  items: [
                    "Issue tamper-proof credentials",
                    "Manage a trusted registry",
                    "Blockchain-anchored proof",
                  ],
                },
                {
                  Icon: Briefcase,
                  label: "Recruiters",
                  iconColor: "text-[#B65F32]",
                  iconBg: "bg-[#B65F32]/10 border-[#B65F32]/20",
                  checkColor: "text-[#B65F32]",
                  items: [
                    "100% fraud-proof candidate profiles",
                    "Eliminate manual BGV delays",
                    "AI ranking by verified skills",
                  ],
                },
                {
                  Icon: Landmark,
                  label: "Government",
                  iconColor: "text-[#C9944A]",
                  iconBg: "bg-[#C9944A]/10 border-[#C9944A]/20",
                  checkColor: "text-[#C9944A]",
                  items: [
                    "National verification telemetry",
                    "Institutional compliance monitoring",
                    "Ecosystem-level intelligence",
                  ],
                },
              ].map(({ Icon, label, iconColor, iconBg, checkColor, items }) => (
                <div key={label} className="p-6 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-5">
                  <div className={`w-10 h-10 rounded-md ${iconBg} border flex items-center justify-center ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F1E8]">For {label}</h3>
                  <ul className="space-y-2.5 text-xs text-[#8A847B] leading-relaxed">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className={`${checkColor} font-bold shrink-0`}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── IMPACT METRICS ───────────────────────────────────── */}
        <section className="w-full py-20 border-t border-[#B65F32]/10 bg-[#191919]/15">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "99%", label: "Fraud Reduction", color: "text-[#F5F1E8]" },
                { value: "2 Hours", label: "BGV Speed (vs 14 Days)", color: "text-[#C9944A]" },
                { value: "100%", label: "Tamper Proof", color: "text-[#F5F1E8]" },
                { value: "5 Sec", label: "Instant Audit Scan", color: "text-[#C9944A]" },
              ].map(({ value, label, color }) => (
                <div key={label} className="space-y-1">
                  <div className={`text-4xl md:text-5xl font-heading font-bold ${color}`}>{value}</div>
                  <div className="text-[10px] text-[#8A847B] uppercase tracking-widest font-mono">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-[#F5F1E8]">
                Trusted by Talent & Teams
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-6">
                <p className="text-[#8A847B] text-sm italic leading-relaxed">
                  "I was tired of uploading my marksheets 50 times for 50 different applications. Now I just share my AscendID profile, and recruiters know it's cryptographically backed by DigiLocker and Base."
                </p>
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-[#B65F32]/10 border border-[#B65F32]/25 flex items-center justify-center text-[#B65F32] font-bold text-xs">
                    PM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F1E8]">Priya Menon</h4>
                    <p className="text-[10px] text-[#8A847B] mt-0.5 font-mono">Verified B.Tech Candidate</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-md bg-[#191919] border border-[#B65F32]/10 space-y-6">
                <p className="text-[#8A847B] text-sm italic leading-relaxed">
                  "As a hiring manager at a fast-growing startup, we don't have a massive background verification team. AscendID guarantees that the candidates we interview actually have the degrees and experience they claim."
                </p>
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-md bg-[#C9944A]/10 border border-[#C9944A]/25 flex items-center justify-center text-[#C9944A] font-bold text-xs">
                    RD
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#F5F1E8]">Rohit Das</h4>
                    <p className="text-[10px] text-[#8A847B] mt-0.5 font-mono">Talent Acquisition, Series B Startup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10 bg-[#191919]/15">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#C9944A] font-mono">Questions</span>
              <h2 className="text-3xl font-heading font-bold tracking-tight text-[#F5F1E8]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How does AscendID verify academic records?",
                  a: "AscendID connects directly to DigiLocker, a national digital document wallet, to fetch verified academic records. Once retrieved, we generate a SHA-256 hash of the normalized metadata and anchor it on the AscendChain Devnet blockchain ledger.",
                },
                {
                  q: "Can recruiters trust the verification status?",
                  a: "Yes, absolutely. The verification status is determined cryptographically. The verifier recovers the issuer's public key from the digital signature, recalculates the metadata hash, and checks if the hash is registered and unrevoked in our smart contract.",
                },
                {
                  q: "Is candidate data stored on the blockchain?",
                  a: "No. For privacy and compliance, we never store personally identifiable information (PII) on the blockchain. We only anchor cryptographic hashes of the normalized metadata. The actual details are stored securely in Firestore.",
                },
                {
                  q: "How is the Trust Score calculated?",
                  a: "The Trust Score is calculated dynamically using factors such as the reputation of the credential issuers, the consistency of skills across certificates, peer validations, and active verification history.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="border border-[#B65F32]/12 bg-[#191919]/30 rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex justify-between items-center text-xs font-bold text-[#F5F1E8] hover:bg-[#191919]/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#8A847B] transition-transform duration-300 shrink-0 ml-4 ${activeFaq === idx ? "rotate-180" : ""}`} />
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
                        <p className="p-5 pt-0 text-xs text-[#8A847B] leading-relaxed border-t border-[#B65F32]/10">
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

        {/* ─── CTA ──────────────────────────────────────────────── */}
        <section className="w-full py-24 border-t border-[#B65F32]/10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(182,95,50,0.04)_0%,transparent_70%)]" />
          <div className="max-w-xl mx-auto px-6 z-10 relative space-y-8">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-10 h-10 mx-auto object-contain" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-[#F5F1E8] leading-tight">
              Ready to enter the trust infrastructure?
            </h2>
            <p className="text-[#8A847B] text-sm leading-relaxed">
              AscendID connects students, institutions, recruiters and government through identity, proof and verified credentials.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signup">
                <Button className="h-11 px-8 bg-[#B65F32] hover:bg-[#8F4728] text-[#F5F1E8] font-bold rounded-md transition-all flex items-center gap-2">
                  Create Your Identity <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" className="h-11 px-8 border-[#B65F32]/25 bg-transparent hover:bg-[#191919] text-[#8A847B] hover:text-[#F5F1E8] font-bold rounded-md transition-all">
                  Verify a Credential
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-[#B65F32]/10 bg-[#0D0D0D] relative z-10 text-xs text-[#8A847B]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#B65F32]/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img src="/assets/logo.png" alt="AscendID Logo" className="w-5 h-5 object-contain" />
                <span className="font-bold text-[#F5F1E8]">AscendID</span>
              </div>
              <p className="text-[10px] leading-relaxed text-[#8A847B]">
                Trusted digital identity and credential infrastructure connecting students, institutions, recruiters and government.
              </p>
              <p className="inline-flex items-center gap-1.5 text-[10px] text-[#C9944A] font-bold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9944A] animate-pulse" />
                AscendChain · Chain 13370
              </p>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-bold text-[#F5F1E8] text-[11px] uppercase tracking-wider">Protocol</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/student/trust-engine" className="hover:text-[#F5F1E8] transition-colors">Trust Engine</Link></li>
                <li>
                  <Link href="/verify" className="hover:text-[#F5F1E8] transition-colors">Smart Contract</Link>
                </li>
                <li><Link href="/verify" className="hover:text-[#F5F1E8] transition-colors">Verify Credential</Link></li>
                <li><Link href="/demo" className="hover:text-[#F5F1E8] transition-colors">Auto Simulation</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-bold text-[#F5F1E8] text-[11px] uppercase tracking-wider">Workspaces</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/auth/login" className="hover:text-[#F5F1E8] transition-colors">Student</Link></li>
                <li><Link href="/auth/login" className="hover:text-[#F5F1E8] transition-colors">Issuer</Link></li>
                <li><Link href="/auth/login" className="hover:text-[#F5F1E8] transition-colors">Recruiter</Link></li>
                <li><Link href="/auth/login" className="hover:text-[#F5F1E8] transition-colors">Government</Link></li>
              </ul>
            </div>
            <div className="space-y-2.5">
              <h4 className="font-bold text-[#F5F1E8] text-[11px] uppercase tracking-wider">Access</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link href="/auth/signup" className="hover:text-[#F5F1E8] transition-colors">Create Identity</Link></li>
                <li><Link href="/auth/login" className="hover:text-[#F5F1E8] transition-colors">Sign In</Link></li>
                <li><Link href="/verify" className="hover:text-[#F5F1E8] transition-colors">Verify Portal</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[10px]">
              © {new Date().getFullYear()} AscendID. Professional Identity Infrastructure. Powered by AscendChain &amp; Google Gemini.
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9944A] animate-pulse" />
              <span className="text-[10px] text-[#C9944A] font-bold font-mono uppercase tracking-widest">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
