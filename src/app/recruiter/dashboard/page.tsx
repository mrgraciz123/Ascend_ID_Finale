"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  GraduationCap, 
  ArrowUpRight, 
  Bookmark, 
  SlidersHorizontal,
  Info,
  Loader2, 
  TrendingUp, 
  AlertTriangle,
  Briefcase,
  GitBranch,
  Layers,
  Users,
  Calendar,
  X,
  Check,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  CheckCircle,
  Building2,
  Sliders,
  Sparkles,
  Award
} from "lucide-react";
import Link from "next/link";
import { DEMO_RECRUITER_CANDIDATES, isDemoUser } from "@/lib/demo-data";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

// Recruiter dashboard uses centralized demo data from @/lib/demo-data
// This ensures all candidate data, trust scores, and skill breakdowns are consistent across the app


export default function RecruiterDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"search" | "heatmap" | "compare" | "analytics">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Frontend Engineer");
  
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<any[]>(DEMO_RECRUITER_CANDIDATES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // In demo mode, use central demo data directly without any Firestore calls
      const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
      if (demoActive) {
        await new Promise(r => setTimeout(r, 500));
        setCandidates(DEMO_RECRUITER_CANDIDATES);
        setLoading(false);
        return;
      }

      // In production mode, try to load from Firestore with demo data fallback
      try {
        // Future: implement real candidate listing with permissions
        setCandidates(DEMO_RECRUITER_CANDIDATES);
      } catch (e) {
        console.warn("Could not load candidates from Firestore, using seeded data:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCompareSelect = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(x => x !== id));
    } else {
      if (compareIds.length < 2) {
        setCompareIds([...compareIds, id]);
      } else {
        // Replace oldest
        setCompareIds([compareIds[1], id]);
      }
    }
  };

  const clearComparisons = () => {
    setCompareIds([]);
  };

  // Filter candidates based on search
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.verified.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sorting: Rank by Trust Score desc
  const rankedCandidates = [...filteredCandidates].sort((a, b) => b.trustScore - a.trustScore);

  // Compare candidates values
  const comp1 = compareIds[0] ? candidates.find(c => c.id === compareIds[0]) : null;
  const comp2 = compareIds[1] ? candidates.find(c => c.id === compareIds[1]) : null;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Loading Recruiter Console...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto font-sans">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-display font-medium text-white tracking-tight">Recruiter Suite</h1>
          <p className="text-gray-400 text-xs mt-1">Verify talent, trace credential histories, and detect portfolio risks.</p>
        </div>

        {/* Global tab selector */}
        <div className="flex gap-1 bg-[#111827]/50 border border-white/5 p-1 rounded-xl shrink-0 select-none">
          <Button 
            variant={activeTab === "search" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("search")}
            className={`text-xs h-8 px-4 rounded-lg font-bold transition-all ${
              activeTab === "search" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            AI Search & Rank
          </Button>
          <Button 
            variant={activeTab === "heatmap" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("heatmap")}
            className={`text-xs h-8 px-4 rounded-lg font-bold transition-all ${
              activeTab === "heatmap" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Trust Heatmap & Timelines
          </Button>
          <Button 
            variant={activeTab === "analytics" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("analytics")}
            className={`text-xs h-8 px-4 rounded-lg font-bold transition-all ${
              activeTab === "analytics" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            Talent Analytics & Trends
          </Button>
          <Button 
            variant={activeTab === "compare" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("compare")}
            className={`text-xs h-8 px-4 rounded-lg font-bold transition-all ${
              activeTab === "compare" ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
            disabled={compareIds.length < 2}
          >
            Compare View ({compareIds.length}/2)
          </Button>
        </div>
      </div>

      {/* Floating comparison badge notification */}
      {compareIds.length > 0 && activeTab !== "compare" && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#111827]/95 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between gap-6 animate-in slide-in-from-bottom duration-300">
          <div className="text-xs text-gray-400">
            <strong className="text-white">{compareIds.length} candidate{compareIds.length > 1 ? "s" : ""}</strong> selected for side-by-side audit.
          </div>
          <div className="flex gap-2.5">
            <Button size="sm" variant="ghost" onClick={clearComparisons} className="text-xs h-8 text-red-400 hover:bg-red-500/10 rounded-lg">
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={() => setActiveTab("compare")} 
              disabled={compareIds.length < 2}
              className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md"
            >
              Launch Comparison <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* TAB 1: AI SEARCH & RANK */}
      {activeTab === "search" && (
        <div className="space-y-6">
          
          {/* Search bar controls */}
          <Card className="bg-[#111827] border border-white/5 p-4 md:p-6 rounded-[20px] shadow-lg">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                  placeholder="Query candidate skills, institutions, or trust score filters..." 
                  className="pl-11 h-12 bg-[#0B1020]/50 text-white border-white/10 rounded-xl focus-visible:ring-blue-500 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center bg-[#0B1020]/50 border border-white/10 rounded-xl px-3.5 gap-2 h-12 shrink-0">
                  <span className="text-[9px] uppercase font-bold text-gray-500 font-mono">Role Fit:</span>
                  <select 
                    className="bg-transparent border-0 text-xs font-bold text-white outline-none cursor-pointer pr-4 focus:ring-0"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="Frontend Engineer" className="bg-[#111827] text-white">Frontend Engineer</option>
                    <option value="ML Engineer" className="bg-[#111827] text-white">ML Engineer</option>
                    <option value="DevOps Lead" className="bg-[#111827] text-white">DevOps Lead</option>
                  </select>
                </div>
                <Button type="submit" className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-8 text-xs font-bold rounded-xl shadow-md">
                  AI Shortlist
                </Button>
              </div>
            </form>
          </Card>

          {/* Search results candidates ranked by AI Fit */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-gray-400 px-1">
              <span>AI candidate ranking sorted by Trust Score</span>
              <span>Showing {rankedCandidates.length} matched profiles</span>
            </div>

            {rankedCandidates.map((candidate) => {
              const isSelected = compareIds.includes(candidate.id);
              
              // SVG Risk circle percentage calculations
              const riskPercent = candidate.riskScore;
              const r = 24;
              const circ = 2 * Math.PI * r;
              const offset = circ - (riskPercent / 100) * circ;

              return (
                <Card 
                  key={candidate.id} 
                  className={`bg-[#111827] border hover:border-white/10 transition-all duration-300 rounded-[20px] shadow-lg overflow-hidden ${
                    candidate.riskLevel === "High" ? "border-red-500/20" : "border-white/5"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                      
                      {/* Left Block: Profile Info + Selector */}
                      <div className="shrink-0 flex items-start gap-4 w-full lg:w-auto">
                        <div className="flex items-center justify-center pt-2.5">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded accent-blue-600 bg-[#0B1020] border-white/10 cursor-pointer"
                            checked={isSelected}
                            onChange={() => handleCompareSelect(candidate.id)}
                          />
                        </div>
                        <Avatar className="w-16 h-16 border border-white/10 shadow-lg rounded-xl">
                          <AvatarImage src={candidate.avatar} alt={candidate.name} className="object-cover" />
                          <AvatarFallback className="bg-[#1F2937] text-white text-lg rounded-xl">
                            {candidate.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-lg font-bold text-white leading-none tracking-tight">{candidate.name}</h3>
                            {candidate.riskLevel === "High" && (
                              <Badge className="bg-red-500/10 border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-wider gap-0.5 animate-pulse rounded hover:none">
                                <ShieldAlert className="w-3 h-3" /> Risk Flagged
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-blue-400 font-semibold mt-1.5">{candidate.degree}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-3">
                            <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-gray-500" /> {candidate.university}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-500" /> India</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle Block: Skills Check list (Skill Gap Analysis) */}
                      <div className="flex-1 space-y-3 w-full lg:border-l lg:border-r lg:border-white/5 lg:px-6">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Verified Capability</span>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.verified.map((s: string) => (
                              <Badge key={s} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono text-[9px] hover:none rounded">
                                <Check className="w-2.5 h-2.5 mr-0.5 shrink-0" /> {s}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {candidate.skills.unverified.length > 0 && (
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Self-Claimed (Unverified)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.unverified.map((s: string) => (
                                <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px] hover:none rounded">
                                  <AlertTriangle className="w-2.5 h-2.5 mr-0.5 shrink-0" /> {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Gap for {selectedRole}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {candidate.skills.missing.map((s: string) => (
                              <Badge key={s} className="bg-red-500/10 border-red-500/20 text-red-400 font-mono text-[9px] hover:none rounded">
                                <X className="w-2.5 h-2.5 mr-0.5 shrink-0" /> {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Scores and telemetry */}
                      <div className="shrink-0 flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/5 w-full lg:w-auto">
                        
                        {/* Trust Score */}
                        <div className="text-center min-w-[70px]">
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block font-mono">Trust Score</span>
                          <div className="text-2xl font-black text-white mt-1">{candidate.trustScore}</div>
                          <span className="text-[9px] text-gray-400 block font-mono mt-0.5">{candidate.ficoClass}</span>
                        </div>

                        {/* Job Fit rating */}
                        <div className="text-center min-w-[70px]">
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block font-mono">Job Fit</span>
                          <div className="text-2xl font-black text-sky-400 mt-1">{candidate.jobFit}%</div>
                          <span className="text-[9px] text-gray-400 block mt-0.5 max-w-[80px] truncate">{selectedRole}</span>
                        </div>

                        {/* Risk Meter circle */}
                        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r={r} stroke="rgba(255,255,255,0.03)" strokeWidth="4.5" fill="transparent" />
                            <circle 
                              cx="28" 
                              cy="28" 
                              r={r} 
                              stroke={candidate.riskLevel === "High" ? "#ef4444" : candidate.riskLevel === "Medium" ? "#f59e0b" : "#22c55e"} 
                              strokeWidth="4.5" 
                              fill="transparent" 
                              strokeDasharray={circ} 
                              strokeDashoffset={offset} 
                              strokeLinecap="round" 
                            />
                          </svg>
                          <div className="absolute text-[10px] font-bold text-white font-mono">{candidate.riskScore}%</div>
                        </div>

                        {/* CTA button */}
                        <div className="flex flex-col gap-2 shrink-0">
                          <Link href={`/recruiter/candidate/${candidate.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-28 text-[11px] h-8 font-bold rounded-lg shadow-md">
                              View Passport <ArrowUpRight className="w-3.5 h-3.5 ml-1 shrink-0" />
                            </Button>
                          </Link>
                          <Link href={`/recruiter/candidate/${candidate.id}/fraud`}>
                            <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-white w-28 text-[11px] h-8 font-bold rounded-lg">
                              Fraud Report
                            </Button>
                          </Link>
                        </div>

                      </div>

                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: TRUST HEATMAP & TIMELINE */}
      {activeTab === "heatmap" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Trust Factors Heatmap */}
          <Card className="bg-[#111827] border border-white/5 p-6 rounded-[20px] shadow-lg">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-base text-white font-mono uppercase tracking-wider">Trust Factor Heatmap</CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">Comparative matrix of candidates across key trust factors (rated 0-100).</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 overflow-x-auto">
              <div className="min-w-[650px] space-y-3">
                
                {/* Headers */}
                <div className="grid grid-cols-6 gap-3 text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  <div className="text-left pl-4">Candidate</div>
                  <div>Reputation</div>
                  <div>Freshness</div>
                  <div>Importance</div>
                  <div>Consistency</div>
                  <div>Confidence</div>
                </div>

                {/* Candidate Rows */}
                {candidates.map(candidate => {
                  const getHeatGlow = (val: number) => {
                    if (val >= 85) return "bg-emerald-500/5 border-emerald-500/20 text-emerald-400";
                    if (val >= 70) return "bg-blue-500/5 border-blue-500/20 text-blue-400";
                    if (val >= 50) return "bg-amber-500/5 border-amber-500/20 text-amber-400";
                    return "bg-red-500/5 border-red-500/20 text-red-400";
                  };

                  return (
                    <div key={candidate.id} className="grid grid-cols-6 gap-3 items-center bg-[#0B1020]/30 border border-white/5 p-3.5 rounded-xl hover:bg-[#0B1020]/50 transition-colors">
                      <div className="text-left font-bold text-white flex items-center gap-2.5 pl-2 truncate">
                        <Avatar className="w-7 h-7 border border-white/10 shrink-0 rounded-lg">
                          <AvatarImage src={candidate.avatar} className="object-cover" />
                          <AvatarFallback className="text-[10px] bg-[#1F2937] rounded-lg">{candidate.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs truncate font-bold text-white">{candidate.name}</span>
                      </div>
                      <div className={`py-2 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.issuerReputation)}`}>
                        {candidate.factors.issuerReputation}
                      </div>
                      <div className={`py-2 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.credentialFreshness)}`}>
                        {candidate.factors.credentialFreshness}
                      </div>
                      <div className={`py-2 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.credentialImportance)}`}>
                        {candidate.factors.credentialImportance}
                      </div>
                      <div className={`py-2 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.skillConsistency)}`}>
                        {candidate.factors.skillConsistency}
                      </div>
                      <div className={`py-2 rounded-lg border text-center font-mono font-bold text-xs ${getHeatGlow(candidate.factors.verificationConfidence)}`}>
                        {candidate.factors.verificationConfidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Unified Verification Timelines */}
          <Card className="bg-[#111827] border border-white/5 p-6 rounded-[20px] shadow-lg">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-white flex items-center gap-2 font-mono">
                <Calendar className="w-5 h-5 text-blue-500" />
                Unified Verification Timeline
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">Chronological timeline of cryptographically verified milestones across candidates.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
              <div className="relative pl-6 border-l border-white/5 space-y-8 ml-4 font-sans">
                
                {/* Compile all timeline points chronologically */}
                {candidates.flatMap((c: any) => c.timeline.map((t: any) => ({ ...t, candidate: c.name }))).sort((a: any, b: any) => b.year.localeCompare(a.year)).map((t: any, idx: number) => {
                  let badgeStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  if (t.status === "unverified") badgeStyle = "bg-amber-500/10 border-amber-500/20 text-amber-400";
                  if (t.status === "expired" || t.status === "revoked") badgeStyle = "bg-red-500/10 border-red-500/20 text-red-400";

                  return (
                    <div key={idx} className="relative animate-in fade-in duration-300">
                      {/* Left timeline dot indicator */}
                      <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#0B1020] border-2 border-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 bg-[#0B1020]/30 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                        <div>
                          <span className="text-[10px] font-bold text-blue-400 font-mono">{t.year}</span>
                          <h4 className="text-xs font-bold text-white mt-1">{t.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">Issued by {t.issuer} for {t.candidate}</p>
                        </div>
                        <Badge className={`text-[9px] uppercase tracking-wider font-bold ${badgeStyle} hover:none rounded shrink-0`}>
                          {t.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}

              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* TAB 3: CANDIDATE COMPARISON VIEW */}
      {activeTab === "compare" && comp1 && comp2 && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="bg-[#111827] border border-white/5 p-6 rounded-[20px] shadow-lg">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-base text-white font-mono uppercase tracking-wider">Side-by-Side Audit</CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">Direct trust comparison and skill gap validation.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
              
              {/* Candidate 1 */}
              <div className="space-y-6 pb-6 md:pb-0">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-white/10 shadow-lg rounded-xl">
                    <AvatarImage src={comp1.avatar} className="object-cover" />
                    <AvatarFallback className="text-lg bg-[#1F2937] rounded-xl">{comp1.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-md font-bold text-white">{comp1.name}</h3>
                    <p className="text-xs text-blue-400 font-semibold">{comp1.degree}</p>
                  </div>
                </div>

                {/* Score and Fit comparisons */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl text-center">
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider font-mono block">Trust Score</span>
                    <div className="text-xl font-black text-white mt-1">{comp1.trustScore}</div>
                  </div>
                  <div className="bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl text-center">
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider font-mono block">Job Fit</span>
                    <div className="text-xl font-black text-sky-400 mt-1">{comp1.jobFit}%</div>
                  </div>
                  <div className="bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl text-center">
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider font-mono block">Fraud Risk</span>
                    <div className={`text-xs font-bold mt-2.5 ${comp1.riskLevel === "High" ? "text-red-400" : comp1.riskLevel === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {comp1.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Skills analysis */}
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Verified Capability</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp1.skills.verified.map((s: string) => (
                        <Badge key={s} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono text-[9px] hover:none rounded">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Self-Claimed / Expired</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp1.skills.unverified.map((s: string) => (
                        <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px] hover:none rounded">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Missing required skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp1.skills.missing.map((s: string) => (
                        <Badge key={s} className="bg-red-500/10 border-red-500/20 text-red-400 font-mono text-[9px] hover:none rounded">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Factors Details list */}
                <div className="space-y-2.5 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Issuer Reputation:</span>
                    <span className="text-white font-mono font-bold">{comp1.factors.issuerReputation}/100</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Credential Freshness:</span>
                    <span className="text-white font-mono font-bold">{comp1.factors.credentialFreshness}/100</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Verification Confidence:</span>
                    <span className="text-white font-mono font-bold">{comp1.factors.verificationConfidence}/100</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/recruiter/candidate/${comp1.id}/fraud`}>
                    <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white text-xs h-9 font-bold rounded-xl">
                      Inspect {comp1.name}'s Fraud Report <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Candidate 2 */}
              <div className="space-y-6 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border border-white/10 shadow-lg rounded-xl">
                    <AvatarImage src={comp2.avatar} className="object-cover" />
                    <AvatarFallback className="text-lg bg-[#1F2937] rounded-xl">{comp2.name.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-md font-bold text-white">{comp2.name}</h3>
                    <p className="text-xs text-blue-400 font-semibold">{comp2.degree}</p>
                  </div>
                </div>

                {/* Score and Fit comparisons */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl text-center">
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider font-mono block">Trust Score</span>
                    <div className="text-xl font-black text-white mt-1">{comp2.trustScore}</div>
                  </div>
                  <div className="bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl text-center">
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider font-mono block">Job Fit</span>
                    <div className="text-xl font-black text-sky-400 mt-1">{comp2.jobFit}%</div>
                  </div>
                  <div className="bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl text-center">
                    <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider font-mono block">Fraud Risk</span>
                    <div className={`text-xs font-bold mt-2.5 ${comp2.riskLevel === "High" ? "text-red-400" : comp2.riskLevel === "Medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {comp2.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Skills analysis */}
                <div className="space-y-3.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Verified Capability</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp2.skills.verified.map((s: string) => (
                        <Badge key={s} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-mono text-[9px] hover:none rounded">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Self-Claimed / Expired</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp2.skills.unverified.map((s: string) => (
                        <Badge key={s} className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-mono text-[9px] hover:none rounded">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-widest block mb-1.5 font-mono">Missing required skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp2.skills.missing.map((s: string) => (
                        <Badge key={s} className="bg-red-500/10 border-red-500/20 text-red-400 font-mono text-[9px] hover:none rounded">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Factors Details list */}
                <div className="space-y-2.5 border-t border-white/5 pt-4 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Issuer Reputation:</span>
                    <span className="text-white font-mono font-bold">{comp2.factors.issuerReputation}/100</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Credential Freshness:</span>
                    <span className="text-white font-mono font-bold">{comp2.factors.credentialFreshness}/100</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Verification Confidence:</span>
                    <span className="text-white font-mono font-bold">{comp2.factors.verificationConfidence}/100</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/recruiter/candidate/${comp2.id}/fraud`}>
                    <Button size="sm" variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white text-xs h-9 font-bold rounded-xl">
                      Inspect {comp2.name}'s Fraud Report <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: TALENT ANALYTICS & TRENDS */}
      {activeTab === "analytics" && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Verification Rate</span>
                  <span className="text-3xl font-black text-emerald-400 block">91.2%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Blocked Forgeries</span>
                  <span className="text-3xl font-black text-red-400 block">14 Scans</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Placed Talent Index</span>
                  <span className="text-3xl font-black text-white block">72% Rate</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">Top Sourced School</span>
                  <span className="text-xl font-black text-white block truncate max-w-[140px]">IIT Bombay</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hiring trends line chart */}
            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Sourcing & Pipeline Velocity</CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-1">Monthly growth of processed candidates vs successful hires.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative h-44 bg-[#0B1020]/40 border border-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 460 120">
                    <defs>
                      <filter id="glow-teal-rec" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#14b8a6" floodOpacity="0.8" />
                      </filter>
                      <filter id="glow-indigo-rec" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Pipelines line */}
                    <path d="M 20,90 L 108,82 L 196,75 L 284,60 L 372,42 L 440,25" fill="none" stroke="#6366f1" strokeWidth="3" filter="url(#glow-indigo-rec)" />
                    {/* Hires line */}
                    <path d="M 20,110 L 108,102 L 196,90 L 284,80 L 372,60 L 440,48" fill="none" stroke="#14b8a6" strokeWidth="3" filter="url(#glow-teal-rec)" />

                    <circle cx="20" cy="90" r="3" fill="#6366f1" /><circle cx="108" cy="82" r="3" fill="#6366f1" />
                    <circle cx="196" cy="75" r="3" fill="#6366f1" /><circle cx="284" cy="60" r="3" fill="#6366f1" />
                    <circle cx="372" cy="42" r="3" fill="#6366f1" /><circle cx="440" cy="25" r="3" fill="#6366f1" />

                    <circle cx="20" cy="110" r="3" fill="#14b8a6" /><circle cx="108" cy="102" r="3" fill="#14b8a6" />
                    <circle cx="196" cy="90" r="3" fill="#14b8a6" /><circle cx="284" cy="80" r="3" fill="#14b8a6" />
                    <circle cx="372" cy="60" r="3" fill="#14b8a6" /><circle cx="440" cy="48" r="3" fill="#14b8a6" />
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-indigo-500 rounded" /> Active Pipeline</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-teal-500 rounded" /> Hirings Clicked</span>
                  </div>
                  <div className="flex gap-3">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sourced Skill distribution */}
            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Sourced Talent Skills</CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-1">Verified competencies found across candidate resumes.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[
                  { skill: "React / Frontend Dev", count: 45, pct: 90, color: "bg-blue-600" },
                  { skill: "Python / ML / AI", count: 32, pct: 64, color: "bg-sky-500" },
                  { skill: "TypeScript / APIs", count: 28, pct: 56, color: "bg-emerald-500" },
                  { skill: "Solidity / Cryptography", count: 15, pct: 30, color: "bg-purple-500" }
                ].map((sk) => (
                  <div key={sk.skill} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-mono">{sk.skill}</span>
                      <span className="text-gray-400">{sk.count} candidates ({sk.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#0B1020] border border-white/5 rounded-full overflow-hidden">
                      <div style={{ width: `${sk.pct}%` }} className={`h-full rounded-full ${sk.color}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Institutional Rank mapping */}
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Talent Sourcing Registry Leaderboard</CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">Top whitelisted universities ranked by average candidate trust scores.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-white/[0.01] border-b border-white/5 font-mono">
                  <tr>
                    <th className="p-4 pl-6">Rank</th>
                    <th className="p-4">Institution Name</th>
                    <th className="p-4 text-center">Avg Candidate Trust</th>
                    <th className="p-4 text-center">Placement Success</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/95">
                  {[
                    { rank: 1, name: "IIT Bombay", score: 785, placement: 94 },
                    { rank: 2, name: "IIT Delhi", score: 778, placement: 92 },
                    { rank: 3, name: "BITS Pilani", score: 755, placement: 89 },
                    { rank: 4, name: "IIIT Hyderabad", score: 742, placement: 91 }
                  ].map((row) => (
                    <tr key={row.rank} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6 font-mono text-blue-400">#0{row.rank}</td>
                      <td className="p-4 font-bold">{row.name}</td>
                      <td className="p-4 text-center font-mono font-bold">{row.score} FICO</td>
                      <td className="p-4 text-center font-mono text-emerald-400 font-semibold">{row.placement}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
