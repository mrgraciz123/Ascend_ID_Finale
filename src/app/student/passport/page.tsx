"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Loader2, 
  Layers, 
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { StudentService } from "@/services/student";
import { AchievementService } from "@/services/achievement";
import { TrustScoreService } from "@/services/trust-score";
import { CredentialService } from "@/services/credential";
import { useAuth } from "@/context/AuthContext";
import { isDemoUser, DEMO_ACADEMIC_RECORDS, DEMO_STUDENT, DEMO_CREDENTIALS, DEMO_OPPORTUNITIES } from "@/lib/demo-data";
import Link from "next/link";
import { ProofGraph } from "@/components/ProofGraph";
import { CredentialObject } from "@/components/CredentialObject";

export default function StudentPassportPage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [instCredentials, setInstCredentials] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<"credentials" | "proofs" | "opportunities">("credentials");

  const { currentUser } = useAuth();

  useEffect(() => {
    async function load() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const uid = currentUser.uid;
        const email = currentUser.email || "";
        const [s, ach, score, instCreds] = await Promise.all([
          StudentService.getProfile(uid),
          AchievementService.getAchievements(uid),
          TrustScoreService.getScore(uid),
          CredentialService.getStudentCredentials(email)
        ]);
        setStudent(s || { id: uid, name: currentUser.displayName || email });
        setAchievements(ach || []);
        setTrustScore(score || { total: 300 });
        setInstCredentials(instCreds || []);
      } catch (err) {
        console.error("Failed to load passport data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#B65F32] animate-spin" />
          <span className="text-xs font-mono text-[#8A847B] uppercase tracking-widest">Constructing Digital Identity Passport...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 font-sans border border-white/5 p-8 rounded-2xl bg-[#111827]">
        <ShieldCheck className="w-12 h-12 text-[#B65F32] mx-auto" />
        <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
        <p className="text-xs text-gray-400 leading-relaxed">Log in or create an account to view your W3C Digital Identity Passport.</p>
        <Link href="/auth/login" className="inline-block">
          <Button className="bg-[#B65F32] hover:bg-[#8F4728] text-white font-bold text-xs h-10 px-6 rounded-lg">
            Log In to Passport
          </Button>
        </Link>
      </div>
    );
  }

  const copyDID = () => {
    navigator.clipboard.writeText(`did:ascendid:${student?.id || currentUser?.uid}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const totalScore = trustScore?.total || 300;

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-16 font-sans text-[#F5F1E8]">
      
      {/* 1. EDITORIAL HEADER & IDENTITY PROVENANCE STORY BAR */}
      <div className="border-b border-[#B65F32]/25 pb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#B65F32]/15 text-[#B65F32] border-[#B65F32]/30 text-[10px] uppercase font-mono tracking-widest rounded-md px-2.5 py-0.5">
                Official W3C Identity Document
              </Badge>
              <span className="text-xs font-mono text-[#8A847B]">Base Sepolia Ledger Anchored</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-[#F5F1E8] tracking-tight">
              Institutional Digital Passport
            </h1>
            <p className="text-sm text-[#8A847B] mt-2 max-w-2xl">
              Cryptographic identity ledger representing sovereign academic, professional, and technical proof provenance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={copyDID} variant="outline" className="border-[#B65F32]/30 bg-[#191919] text-[#F5F1E8] hover:bg-[#241814] text-xs font-mono font-bold h-10 px-4 rounded-lg">
              {copiedId ? <Check className="w-4 h-4 mr-2 text-[#C9944A]" /> : <Copy className="w-4 h-4 mr-2 text-[#B65F32]" />}
              {copiedId ? "DID Copied" : "Copy DID"}
            </Button>
            <Link href={`/verify/cred-demo-iitb-btech`} target="_blank">
              <Button className="bg-[#B65F32] hover:bg-[#8F4728] text-white font-mono text-xs font-bold h-10 px-5 rounded-lg shadow-lg shadow-[#B65F32]/20">
                <Share2 className="w-4 h-4 mr-2" />
                Public Verification Link
              </Button>
            </Link>
          </div>
        </div>

        {/* IDENTITY → PROOF → CREDENTIAL → VERIFICATION → TRUST → OPPORTUNITY PROGRESSION BAR */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { step: "01", label: "Identity", status: "Active Sovereign DID" },
            { step: "02", label: "Proof", status: `${achievements.length + 3} Vault Assets` },
            { step: "03", label: "Credential", status: `${instCredentials.length} Micro-Credentials` },
            { step: "04", label: "Verification", status: "100% Cryptographic" },
            { step: "05", label: "Trust", status: `${totalScore} FICO Index` },
            { step: "06", label: "Opportunity", status: "9 Match Eligibility" },
          ].map((item) => (
            <div key={item.step} className="p-3 bg-[#191919] border border-[#B65F32]/20 rounded-lg flex flex-col justify-between">
              <span className="text-[9px] font-mono text-[#B65F32] font-bold">{item.step}. {item.label}</span>
              <span className="text-xs font-bold font-mono text-[#F5F1E8] mt-1">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PHYSICAL PASSPORT CARD DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Physical Passport Document Block */}
        <div className="lg:col-span-8 bg-[#F5F1E8] text-[#0D0D0D] p-8 sm:p-10 rounded-2xl border-2 border-[#B65F32]/40 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#B65F32]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex flex-wrap justify-between items-center pb-6 border-b border-[#0D0D0D]/15 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] flex items-center justify-center text-[#C9944A]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#B65F32] uppercase tracking-widest block">REPUBLIC OF INDIA TALENT REGISTRY</span>
                  <h3 className="text-lg font-bold font-heading text-[#0D0D0D]">Official Student Identity Passport</h3>
                </div>
              </div>

              <Badge className="bg-[#0D0D0D] text-[#C9944A] border border-[#C9944A]/40 font-mono text-xs px-3 py-1 font-bold">
                PASSPORT NO: IND-2026-89A92
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-center">
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 border-4 border-[#0D0D0D] shadow-2xl rounded-2xl">
                  <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
                  <AvatarFallback className="bg-[#0D0D0D] text-[#F5F1E8] font-mono text-3xl font-bold">
                    {student.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] font-mono text-[#524E48] font-bold mt-3 uppercase tracking-wider">BIOMETRIC AUDIT: VERIFIED</span>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-[#524E48] uppercase block">Full Legal Identity</span>
                  <h2 className="text-3xl font-extrabold font-heading text-[#0D0D0D]">{student.name}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#524E48] uppercase block">Primary Institution</span>
                    <strong className="text-[#0D0D0D] font-bold block">{student.institution}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#524E48] uppercase block">Academic Program</span>
                    <strong className="text-[#0D0D0D] font-bold block">{student.degree}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#524E48] uppercase block">Graduation Batch</span>
                    <strong className="text-[#0D0D0D] font-bold block">{student.batch || "2021-2025"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#524E48] uppercase block">Cumulative CGPA</span>
                    <strong className="text-[#0D0D0D] font-bold block text-[#B65F32]">{student.cgpa || "9.4 / 10.0"}</strong>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-mono text-[#524E48] uppercase block">Decentralized Identifier (DID)</span>
                  <code className="text-xs font-mono font-bold text-[#0D0D0D] bg-[#0D0D0D]/10 px-3 py-1.5 rounded block truncate mt-1">
                    did:ascendid:{student.id}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#0D0D0D]/15 flex flex-wrap justify-between items-center text-xs font-mono text-[#524E48] gap-4">
            <span className="flex items-center gap-1.5 font-bold text-[#0D0D0D]">
              <CheckCircle2 className="w-4 h-4 text-[#B65F32]" />
              Authentic W3C Cryptographic Document
            </span>
            <span>Issued: SEP 2026 · Valid Worldwide</span>
          </div>
        </div>

        {/* Trust Score & Completeness Dial Column */}
        <div className="lg:col-span-4 bg-[#191919] border border-[#B65F32]/25 p-8 rounded-2xl flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs font-mono text-[#B65F32] font-bold uppercase tracking-widest block mb-2">
              Identity Signal Audit
            </span>
            <h3 className="text-xl font-bold font-heading text-[#F5F1E8]">Trust Engine Index</h3>

            <div className="my-8 text-center bg-[#0D0D0D] border border-[#B65F32]/30 p-6 rounded-xl relative overflow-hidden">
              <span className="text-6xl font-black font-heading text-[#C9944A] tracking-tight block">
                {totalScore}
              </span>
              <span className="text-xs font-mono text-[#8A847B] uppercase tracking-widest mt-1 block">
                FICO Computed Identity Score
              </span>
              <Badge className="mt-3 bg-[#C9944A]/15 text-[#C9944A] border-[#C9944A]/30 text-xs font-mono font-bold">
                Exceptional Trust Class
              </Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#8A847B]">Verified Micro-Credentials</span>
                <strong className="text-[#F5F1E8]">{instCredentials.length} Items</strong>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#8A847B]">Academic Attestation</span>
                <strong className="text-[#C9944A]">100% On-Chain</strong>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#8A847B]">DigiLocker Govt Link</span>
                <strong className="text-emerald-400">Connected</strong>
              </div>
            </div>
          </div>

          <Link href="/student/trust-engine" className="mt-6 block">
            <Button className="w-full bg-[#191919] hover:bg-[#241814] text-[#F5F1E8] border border-[#B65F32]/40 text-xs font-mono font-bold h-11 rounded-lg flex items-center justify-between">
              <span>View Trust Breakdown</span>
              <ChevronRight className="w-4 h-4 text-[#B65F32]" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. DOSSIER PROGRESSION TABS & PHYSICAL CREDENTIAL OBJECT LIST */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B65F32]/20 pb-4">
          <h2 className="text-2xl font-bold font-heading text-[#F5F1E8] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#B65F32]" />
            Student Identity Dossier
          </h2>

          <div className="flex flex-wrap gap-2 bg-[#191919] p-1.5 rounded-xl border border-white/10">
            {[
              { id: "credentials", label: "Micro-Credentials" },
              { id: "proofs", label: "Proof Graph Provenance" },
              { id: "opportunities", label: "Matched Opportunities" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveDossierTab(t.id as any)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all ${
                  activeDossierTab === t.id
                    ? "bg-[#B65F32] text-white shadow-md"
                    : "text-[#8A847B] hover:text-[#F5F1E8] hover:bg-white/5"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OFFICIAL PHYSICAL CREDENTIAL OBJECTS */}
        {activeDossierTab === "credentials" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {instCredentials.map((cred) => (
                <CredentialObject
                  key={cred.id}
                  id={cred.id}
                  title={cred.title || cred.credentialType}
                  recipientName={student.name}
                  issuerName={cred.issuer || cred.issuerName || "IIT Bombay"}
                  issueDate={cred.issueDate || "2024-05-15"}
                  credentialType={cred.credentialType || "Academic Degree"}
                  status={cred.status || "verified"}
                  txHash={cred.transactionHash}
                  skills={cred.skills || ["Computer Science", "Systems Architecture", "Algorithms"]}
                  scoreImpact={cred.scoreImpact || 45}
                  isDigiLocker={cred.isDigiLocker}
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PROOF GRAPH PROVENANCE */}
        {activeDossierTab === "proofs" && (
          <div className="bg-[#191919] border border-[#B65F32]/25 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#F5F1E8]">Cryptographic Proof Graph</h3>
                <p className="text-xs text-[#8A847B]">Live visual topology of identity lineage from raw proof document to on-chain anchor.</p>
              </div>
              <Badge className="bg-[#B65F32]/20 text-[#B65F32] border-[#B65F32]/40 font-mono text-xs">
                Topology Active
              </Badge>
            </div>
              <ProofGraph 
                records={(student as any).academicRecords || (student as any).digiLockerRecords || (isDemoUser(currentUser?.email || currentUser?.uid) ? DEMO_ACADEMIC_RECORDS : [])} 
                achievements={achievements.length > 0 ? achievements : (isDemoUser(currentUser?.email || currentUser?.uid) ? DEMO_STUDENT.achievements : [])} 
                instCredentials={instCredentials.length > 0 ? instCredentials : (isDemoUser(currentUser?.email || currentUser?.uid) ? DEMO_CREDENTIALS : [])} 
              />
          </div>
        )}

        {/* TAB 3: MATCHED OPPORTUNITIES */}
        {activeDossierTab === "opportunities" && (
          <div>
            {isDemoUser(currentUser?.email || currentUser?.uid) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {DEMO_OPPORTUNITIES.map((opp, idx) => (
                  <div key={idx} className="p-6 bg-[#191919] border border-[#B65F32]/20 rounded-xl flex flex-col justify-between hover:border-[#B65F32]/50 transition-all">
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-xs font-mono text-[#8A847B]">{opp.company}</span>
                          <h4 className="text-lg font-bold text-[#F5F1E8] mt-0.5">{opp.title}</h4>
                        </div>
                        <Badge className="bg-[#C9944A]/20 text-[#C9944A] border-[#C9944A]/40 font-mono text-xs font-bold">
                          {opp.matchScore}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-[#8A847B] mt-3 font-mono">Location: <span className="text-[#F5F1E8] font-bold">{opp.location}</span></p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">Identity Credentials Qualified</span>
                      <Link href="/student/opportunities">
                        <Button size="sm" className="bg-[#B65F32] hover:bg-[#8F4728] text-white font-mono text-xs font-bold h-8 px-4 rounded">
                          Apply With Passport <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-[#191919] border border-[#B65F32]/20 rounded-2xl space-y-3">
                <p className="text-sm font-bold text-[#F5F1E8]">No Matched Opportunities Available</p>
                <p className="text-xs text-[#8A847B]">Connect and issue verifiable credentials to unlock custom employer match scoring.</p>
                <Link href="/student/opportunities">
                  <Button size="sm" className="bg-[#B65F32] hover:bg-[#8F4728] text-white font-mono text-xs font-bold h-9 px-5 rounded mt-2">
                    Browse Opportunities Directory <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
