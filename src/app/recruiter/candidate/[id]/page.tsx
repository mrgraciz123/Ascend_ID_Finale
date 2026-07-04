"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  ArrowLeft, 
  Mail, 
  Bookmark, 
  CheckCircle2,
  ChevronRight,
  BrainCircuit,
  Sparkles,
  Award,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingUp,
  Loader2,
  Info,
  Search,
  Check,
  X
} from "lucide-react";
import Link from "next/link";
import { DEMO_RECRUITER_CANDIDATES, isDemoUser } from "@/lib/demo-data";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function CandidateProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<any>(null);

  // AI Recruiter Copilot States
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [copilotReport, setCopilotReport] = useState<any | null>(null);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    async function load() {
      // In demo mode or fallback, find candidate from local seeded data
      let found = DEMO_RECRUITER_CANDIDATES.find(c => c.id === id);
      
      // If user typed some random ID, just fallback to Aarav for demo robustness
      const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
      if (!found && demoActive) found = DEMO_RECRUITER_CANDIDATES[0];

      if (found) {
        setCandidate(found);
      } else {
        // Here you would do the real Firestore lookup in a full production app
        // StudentService.getProfile(id)...
        setCandidate(null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (candidate && !copilotReport) {
      triggerAiAudit(candidate.id, selectedRole);
    }
  }, [candidate, selectedRole]);

  const triggerAiAudit = async (candidateId: string, roleName: string) => {
    setAiLoading(true);
    setAiError("");
    try {
      const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
      if (demoActive) {
        await new Promise(r => setTimeout(r, 1500));
        setCopilotReport({
          matchScore: candidate.jobFit || 92,
          recommendation: "Strong Hire",
          summary: `The candidate has an exceptionally strong profile for the ${roleName} role. Verified credentials from ${candidate.university} and on-chain records provide high confidence in their technical capabilities.`,
          strengths: [
            "Cryptographically verified degree",
            "High Trust Score driven by consistent peer validation",
            "Direct skill overlap with role requirements"
          ],
          risks: [
            "Lacks verified Cloud deployment credentials"
          ],
          verificationConfidence: 96
        });
      } else {
        const { auth } = await import("@/lib/firebase");
        const token = await auth.currentUser?.getIdToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/recruiter/copilot", {
          method: "POST",
          headers,
          body: JSON.stringify({ studentId: candidateId, jobRole: roleName })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCopilotReport(data.report || data);
        } else {
          throw new Error(data.error || "Failed to generate AI Audit");
        }
      }
    } catch (e: any) {
      console.error("AI Copilot Audit failed:", e);
      setAiError(e.message || "Failed to contact AI Recruiter Copilot.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            <Search className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest animate-pulse">
            Loading Candidate Profile...
          </span>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-4 font-sans">
        <h2 className="text-xl font-bold text-white">Candidate Not Found</h2>
        <p className="text-gray-400 text-xs">The requested student ID is not registered in the AscendID index.</p>
        <Link href="/recruiter/dashboard">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6 h-10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Talent Hub
          </Button>
        </Link>
      </div>
    );
  }

  const verifiedCount = candidate.timeline.filter((t: any) => t.status === "verified").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12 font-sans">
      
      {/* Demo Mode Banner */}
      {isDemoUser(currentUser?.email || currentUser?.uid) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600/5 border border-blue-500/20 mb-4"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Demo Mode</span>
            <span className="text-xs text-gray-400">— Talent Search Console</span>
          </div>
          <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-[10px] font-mono">DEMO</Badge>
        </motion.div>
      )}

      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/recruiter/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-white bg-[#111827] hover:bg-white/5 border-white/10 rounded-xl h-10 text-xs font-bold px-4">
            <Bookmark className="w-3.5 h-3.5 mr-2 text-gray-400" />
            Shortlist
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 text-xs font-bold px-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
            <Mail className="w-3.5 h-3.5 mr-2" />
            Contact
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-[#111827] border border-white/5 rounded-[24px] shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none bg-blue-600/5 -translate-y-1/2 translate-x-1/3" />
        
        <CardContent className="p-6 sm:p-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-[#0B1020] shadow-xl rounded-2xl">
              <AvatarImage src={candidate.avatar} alt={candidate.name} className="object-cover rounded-2xl" />
              <AvatarFallback className="text-3xl font-bold bg-[#1F2937] text-white rounded-2xl">
                {candidate.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3 min-w-0">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight truncate">{candidate.name}</h2>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:none rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shrink-0">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Identity Verified
                  </Badge>
                </div>
                <p className="text-base sm:text-lg text-blue-400 font-medium mt-1 truncate">{candidate.degree}</p>
              </div>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5 shrink-0">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>{candidate.university}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Class of {candidate.graduationYear}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>Verified Demographics</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 overflow-x-auto pb-1 hide-scrollbar">
                {candidate.skills.verified.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="bg-white/[0.03] hover:bg-white/[0.05] border-white/5 text-gray-300 rounded-lg px-3 py-1 font-mono text-[10px] whitespace-nowrap">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Trust Score Summary Box */}
            <div className="w-full md:w-auto bg-[#0B1020]/60 border border-white/5 rounded-2xl p-5 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">Trust Score</span>
                <span className="text-4xl font-bold text-white block leading-none">{candidate.trustScore}</span>
              </div>
              <div className="flex flex-col items-end md:items-center">
                <Badge className={`text-[10px] uppercase font-bold tracking-widest rounded px-2.5 py-1 ${
                  candidate.trustScore >= 740 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  candidate.trustScore >= 670 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  candidate.trustScore >= 580 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {candidate.ficoClass}
                </Badge>
                <span className="text-[9px] text-gray-500 mt-2 font-mono">{verifiedCount} Verified Records</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: AI Copilot & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Recruiter Copilot */}
          <Card className="bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-blue-900/20 border border-indigo-500/20 shadow-xl rounded-[24px] overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20">
              <Sparkles className="w-24 h-24 text-indigo-400" />
            </div>
            <CardHeader className="pb-4 relative z-10 border-b border-indigo-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" />
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-widest font-mono">Gemini AI Copilot</CardTitle>
                </div>
                {copilotReport && (
                  <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 rounded px-2 text-[10px] font-bold font-mono">
                    {copilotReport.matchScore}% Match
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-indigo-300/70 mt-1">
                Cryptographic audit & role suitability analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 relative z-10">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  <span className="text-xs font-mono text-indigo-300 uppercase tracking-widest animate-pulse">Running smart contract audit...</span>
                </div>
              ) : aiError ? (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-red-400">Copilot Error</p>
                    <p className="text-xs text-red-300 mt-1">{aiError}</p>
                  </div>
                </div>
              ) : copilotReport ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                      <TrendingUp className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {copilotReport.recommendation}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </h4>
                      <p className="text-xs text-indigo-200 mt-1.5 leading-relaxed">{copilotReport.summary}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#0B1020]/40 rounded-xl p-4 border border-indigo-500/10">
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Strengths
                      </h5>
                      <ul className="space-y-2">
                        {copilotReport.strengths.map((str: string, i: number) => (
                          <li key={i} className="text-xs text-indigo-100 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" /> {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#0B1020]/40 rounded-xl p-4 border border-indigo-500/10">
                      <h5 className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Potential Risks
                      </h5>
                      <ul className="space-y-2">
                        {copilotReport.risks.map((risk: string, i: number) => (
                          <li key={i} className="text-xs text-indigo-100 flex items-start gap-2 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" /> {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button onClick={() => triggerAiAudit(candidate.id, selectedRole)} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold">
                    Generate AI Report
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline / Proof Graph */}
          <Card className="bg-[#111827] border border-white/5 rounded-[24px] shadow-xl">
            <CardHeader className="p-6 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Cryptographic Ledger
                </CardTitle>
                <Badge className="bg-white/[0.05] text-gray-400 border-white/10 rounded px-2 font-mono text-[10px]">
                  {candidate.timeline.length} Records
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {candidate.timeline.map((item: any, i: number) => (
                  <div key={i} className="p-6 flex items-start gap-4 hover:bg-white/[0.01] transition-colors group">
                    <div className="flex flex-col items-center gap-2 pt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                        item.status === "verified" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        item.status === "expired" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        item.status === "revoked" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                        "bg-white/5 border-white/10 text-gray-400"
                      }`}>
                        {item.status === "verified" ? <ShieldCheck className="w-4 h-4" /> :
                         item.status === "expired" ? <Calendar className="w-4 h-4" /> :
                         item.status === "revoked" ? <AlertTriangle className="w-4 h-4" /> :
                         <UserCheck className="w-4 h-4" />}
                      </div>
                      {i !== candidate.timeline.length - 1 && (
                        <div className="w-0.5 h-10 bg-white/5 group-hover:bg-white/10 transition-colors" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-white text-sm">{item.title}</h4>
                        <span className="text-[10px] text-gray-500 font-mono bg-[#0B1020] px-2 py-0.5 rounded border border-white/5 w-fit">
                          {item.year}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                        Issued by <strong className="text-gray-300">{item.issuer}</strong>
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] capitalize border-white/10 text-gray-400 rounded">
                          {item.type}
                        </Badge>
                        <Badge className={`text-[9px] uppercase font-bold tracking-widest rounded ${
                          item.status === "verified" ? "bg-emerald-500/10 text-emerald-400 border-none" :
                          item.status === "expired" ? "bg-amber-500/10 text-amber-400 border-none" :
                          item.status === "revoked" ? "bg-red-500/10 text-red-400 border-none" :
                          "bg-gray-500/10 text-gray-400 border-none"
                        }`}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Skills & Risk Assessment */}
        <div className="space-y-6">
          
          {/* Skill Validation Radar */}
          <Card className="bg-[#111827] border border-white/5 rounded-[24px] shadow-xl">
            <CardHeader className="p-6 pb-4 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Validated Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              
              <div>
                <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Cryptographically Backed</h5>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.verified.map((skill: string) => (
                    <Badge key={skill} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg px-2.5 py-1">
                      <ShieldCheck className="w-3 h-3 mr-1.5" />
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {candidate.skills.unverified.length > 0 && (
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2 mt-4">Self-Reported (Unverified)</h5>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.unverified.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="border-gray-600 text-gray-400 text-xs font-medium rounded-lg px-2.5 py-1 border-dashed">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {candidate.skills.missing.length > 0 && (
                <div>
                  <h5 className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2 mt-4">Missing for Role</h5>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.missing.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="bg-red-500/5 border-red-500/20 text-red-400 text-xs font-medium rounded-lg px-2.5 py-1">
                        <X className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Risk Factors */}
          <Card className="bg-[#111827] border border-white/5 rounded-[24px] shadow-xl">
            <CardHeader className="p-6 pb-4 border-b border-white/5">
              <CardTitle className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${candidate.riskLevel === 'Low' ? 'text-emerald-400' : candidate.riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'}`} />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Fraud Probability</span>
                <Badge className={`text-[10px] font-bold font-mono rounded ${
                  candidate.riskLevel === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-none' : 
                  candidate.riskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-none' : 
                  'bg-red-500/10 text-red-400 border-none'
                }`}>
                  {candidate.riskScore}%
                </Badge>
              </div>
              <div className="w-full h-2 bg-[#0B1020] rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${candidate.riskScore}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    candidate.riskLevel === 'Low' ? 'bg-emerald-500' : 
                    candidate.riskLevel === 'Medium' ? 'bg-amber-500' : 
                    'bg-red-500'
                  }`}
                />
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Credential Consistency</span>
                  <span className="font-mono text-white">{candidate.factors.skillConsistency}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Issuer Reputation</span>
                  <span className="font-mono text-white">{candidate.factors.issuerReputation}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Verification Confidence</span>
                  <span className="font-mono text-white">{candidate.factors.verificationConfidence}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
