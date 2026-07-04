"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, 
  Share2, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Download, 
  ExternalLink, 
  QrCode, 
  Loader2, 
  CheckCircle2, 
  User, 
  Building2, 
  Clock, 
  Eye, 
  Briefcase, 
  Copy, 
  Check, 
  X,
  Compass,
  Zap,
  TrendingUp,
  Award,
  BookOpen,
  GitBranch,
  FileText,
  Lock,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";
import { StudentService } from "@/services/student";
import { AchievementService } from "@/services/achievement";
import { TrustScoreService } from "@/services/trust-score";
import { CredentialService } from "@/services/credential";
import { useAuth } from "@/context/AuthContext";
import ProofGraph from "@/components/ProofGraph";
import { motion } from "framer-motion";
import { 
  DEMO_STUDENT, 
  DEMO_ACADEMIC_RECORDS, 
  DEMO_ACHIEVEMENTS, 
  DEMO_TRUST_SCORE,
  DEMO_CREDENTIALS,
  isDemoUser
} from "@/lib/demo-data";

export default function PassportPage() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<any>(null);
  const [instCredentials, setInstCredentials] = useState<any[]>([]);
  const [selectedCred, setSelectedCred] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<"skills" | "experiences" | "research" | "recommendations" | "projects">("skills");
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);

  // 3D Tilt Card Ref and values
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const middleX = rect.width / 2;
    const middleY = rect.height / 2;
    
    // Max rotation 12 degrees
    const rX = ((y - middleY) / middleY) * -12;
    const rY = ((x - middleX) / middleX) * 12;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const { currentUser } = useAuth();

  useEffect(() => {
    async function load() {
      // In DEMO_MODE, immediately load rich seeded data to guarantee a flawless presentation
      const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
      if (demoActive) {
        await new Promise(r => setTimeout(r, 600)); // Simulate brief load for WOW effect
        setStudent({
          id: DEMO_STUDENT.id,
          name: DEMO_STUDENT.name,
          avatar: DEMO_STUDENT.avatar,
          degree: DEMO_STUDENT.degree.split("—")[0]?.trim() || DEMO_STUDENT.degree,
          major: DEMO_STUDENT.degree.split("—")[1]?.trim() || "",
          institution: DEMO_STUDENT.institution,
          graduationYear: DEMO_STUDENT.graduationYear,
          skills: DEMO_STUDENT.skills || [],
          projects: DEMO_STUDENT.projects || [],
          interests: DEMO_STUDENT.interests || [],
          achievements: DEMO_STUDENT.achievements || [],
          academicRecords: []
        });
        setRecords(DEMO_ACADEMIC_RECORDS);
        setAchievements(DEMO_ACHIEVEMENTS);
        setTrustScore(DEMO_TRUST_SCORE);
        setInstCredentials(DEMO_CREDENTIALS);
        setLoading(false);
        return;
      }

      // Production path
      if (!currentUser) return;
      try {
        const uid = currentUser.uid;
        const email = currentUser.email || "";
        const [s, rec, ach, score, instCreds] = await Promise.all([
          StudentService.getProfile(uid),
          StudentService.getAcademicRecords(uid),
          AchievementService.getAchievements(uid),
          TrustScoreService.getScore(uid),
          CredentialService.getStudentCredentials(email)
        ]);
        setStudent(s);
        setRecords(rec);
        setAchievements(ach);
        setTrustScore(score);
        setInstCredentials(instCreds);
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
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Compiling Passport Ledger...</span>
        </div>
      </div>
    );
  }

  const copyDID = () => {
    navigator.clipboard.writeText(`did:ascendid:${student.id}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const generateSparkline = (history: any[]) => {
    if (!history || history.length === 0) return "";
    const minScore = 300;
    const maxScore = 850;
    const width = 320;
    const height = 80;
    const padding = 10;
    
    const points = history.map((h, i) => {
      const x = padding + (i / (history.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((h.score - minScore) / (maxScore - minScore)) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(" L ")}`;
  };

  const experiences = achievements.filter(a => a.category === "Internship" || a.category === "Experience");
  const research = achievements.filter(a => a.category === "Research" || a.category === "Paper");
  const recommendations = achievements.filter(a => a.category === "Recommendation" || a.category === "Endorsement");
  const awards = achievements.filter(a => a.category === "Hackathon" || a.category === "Achievement" || a.category === "Trophy");
  const customProjects = student.projects || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto font-sans">
      
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            Digital Passport
          </h1>
          <p className="text-gray-400 text-xs mt-1">Futuristic on-chain identity backed by cryptographical proofs.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" className="text-white border-white/10 bg-[#111827] hover:bg-white/5 shadow-lg flex items-center gap-1.5 h-10 text-xs font-bold rounded-xl">
            <Download className="w-4 h-4" />
            Save to Wallet
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 flex items-center gap-1.5 h-10 text-xs font-bold rounded-xl">
            <Share2 className="w-4 h-4" />
            Share Passport
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: IDENTITY TERMINAL & TRUST TELEMETRY */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Holographic Interactive 3D Tilt ID Card */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-400 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-700 pointer-events-none" />
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                transition: "transform 0.1s ease-out"
              }}
              className="relative border border-white/10 bg-gradient-to-br from-neutral-900/90 via-[#111827]/95 to-neutral-950/90 p-6 rounded-[20px] shadow-2xl flex flex-col justify-between overflow-hidden aspect-[1.58/1] min-h-[220px] cursor-pointer"
            >
              {/* Corner Watermarks & Reflection */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-[25px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-[20px] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none" />
              
              {/* Card Header */}
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] uppercase font-bold text-emerald-400 tracking-widest font-mono">Node Verified</span>
                </div>
                <span className="text-[8px] font-mono text-gray-500">did:ascendid:{student.id.substring(0, 8)}</span>
              </div>

              {/* Avatar + Basic Data */}
              <div className="flex items-center gap-4 my-4">
                <Avatar className="w-16 h-16 border border-white/15 shadow-xl shrink-0 rounded-xl">
                  <AvatarImage src={student.avatar} alt={student.name} className="object-cover" />
                  <AvatarFallback className="bg-[#1F2937] text-white text-lg rounded-xl">
                    {student.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white leading-none tracking-tight">{student.name}</h3>
                  <span className="text-[10px] text-blue-400 font-semibold mt-1.5 block truncate">{student.degree} • {student.major}</span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-400">
                    <Building2 className="w-3 h-3 shrink-0" /> <span className="truncate">{student.institution}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end pt-3 border-t border-white/5 text-[8px] font-mono text-gray-400">
                <div>
                  <span className="block text-[7px] text-gray-500 uppercase tracking-widest">Passport DID</span>
                  <div 
                    onClick={copyDID}
                    className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors mt-0.5 font-bold"
                  >
                    <span>did:ascendid:{student.id.substring(0, 10)}...</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-[7px] text-gray-500 uppercase tracking-widest">Graduation</span>
                  <span className="font-bold text-white mt-0.5 block">{student.graduationYear}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Trust Score circular gauge */}
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow-xl relative overflow-hidden">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2 font-mono">
                <Compass className="w-4 h-4 text-blue-500" />
                Trust Score Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke="url(#trustGradient)" 
                    strokeWidth="5" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - (trustScore?.total || 350) / 850)}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-bold text-white tracking-tight">{trustScore?.total || 350}</span>
                  <span className="text-[8px] text-emerald-400 block uppercase font-bold tracking-widest mt-0.5 font-mono">Exceptional</span>
                </div>
              </div>

              {/* Slider representation lists */}
              <div className="w-full text-xs space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center text-gray-400">
                  <span>Issuer Reputation:</span>
                  <span className="font-mono text-white font-bold">{trustScore?.factors?.issuerReputation || 50}/100</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Skill Consistency:</span>
                  <span className="font-mono text-white font-bold">{trustScore?.factors?.skillConsistency || 50}/100</span>
                </div>
                <div className="flex justify-between items-center text-gray-400">
                  <span>Experience Growth:</span>
                  <span className="font-mono text-white font-bold">{trustScore?.factors?.experienceGrowth || 50}/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Graph Sparkline */}
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow-xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2 font-mono">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                Trust Growth Sparkline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="relative w-full h-24 bg-[#0B1020]/40 border border-white/5 rounded-xl flex items-center justify-center p-2 overflow-hidden">
                
                {/* Visual grid watermark lines */}
                <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-5">
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-b border-white" />
                </div>

                <svg className="w-full h-full" viewBox="0 0 320 80">
                  <defs>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#2563EB" floodOpacity="0.6" />
                    </filter>
                  </defs>
                  
                  {/* Glowing Sparkline Path */}
                  <path 
                    d={generateSparkline(trustScore?.history || [])}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    filter="url(#glow)"
                    className="transition-all duration-1000"
                  />
                  
                  {/* Data Point Dot Indicators */}
                  {(trustScore?.history || []).map((h: any, i: number) => {
                    const width = 320;
                    const height = 80;
                    const padding = 10;
                    const x = padding + (i / (trustScore.history.length - 1)) * (width - 2 * padding);
                    const y = height - padding - ((h.score - 300) / (850 - 300)) * (height - 2 * padding);
                    
                    return (
                      <circle 
                        key={i}
                        cx={x}
                        cy={y}
                        r="4.5"
                        fill="#22C55E"
                        className="cursor-pointer hover:r-6 transition-all"
                      >
                        <title>{`Score: ${h.score}`}</title>
                      </circle>
                    );
                  })}
                </svg>

              </div>
              <div className="flex justify-between items-center text-[9px] text-gray-500 mt-2 px-1 font-mono">
                <span>30 Days Ago</span>
                <span className="font-bold text-white">Current Rating: {trustScore?.total || 350}</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: PROFESSIONAL PORTFOLIO & PROOF GRAPH */}
        <div className="lg:col-span-8 space-y-6">
          
          <Tabs defaultValue="graph" className="w-full">
            
            {/* Custom tabs header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <TabsList className="bg-[#111827]/50 border border-white/5 p-1 rounded-xl h-10 flex gap-1">
                <TabsTrigger value="graph" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs h-8 px-4 rounded-lg font-bold">
                  Proof Graph Map
                </TabsTrigger>
                <TabsTrigger value="dossier" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs h-8 px-4 rounded-lg font-bold">
                  Verified Dossier
                </TabsTrigger>
                <TabsTrigger value="milestones" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs h-8 px-4 rounded-lg font-bold">
                  Career Milestones
                </TabsTrigger>
                <TabsTrigger value="w3c" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs h-8 px-4 rounded-lg font-bold">
                  W3C Ledger Index
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: PROOF GRAPH */}
            <TabsContent value="graph" className="mt-4">
              <div className="relative border border-white/5 bg-neutral-950 rounded-[20px] p-4 overflow-hidden h-[500px] shadow-2xl flex flex-col justify-between">
                
                {/* Custom terminal top header bar */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-2.5 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Proof Path Graph Visualizer
                  </span>
                  <span>React Flow v11 Engine</span>
                </div>

                <div className="flex-1 w-full relative">
                  <ProofGraph 
                    records={records} 
                    achievements={achievements} 
                    instCredentials={instCredentials} 
                  />
                </div>

              </div>
            </TabsContent>

            {/* TAB 2: VERIFIED DOSSIER */}
            <TabsContent value="dossier" className="mt-4 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Sidebar category triggers */}
                <div className="md:col-span-1 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                  {[
                    { name: "Verified Skills", filter: "skills", icon: Zap },
                    { name: "Experiences", filter: "experiences", icon: Briefcase },
                    { name: "Research Papers", filter: "research", icon: BookOpen },
                    { name: "Custom Projects", filter: "projects", icon: GitBranch },
                    { name: "Recommendations", filter: "recommendations", icon: FileText }
                  ].map((tab) => {
                    const isActive = activeDossierTab === tab.filter;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.filter}
                        onClick={() => setActiveDossierTab(tab.filter as any)}
                        className={`text-left text-xs font-semibold h-9 px-3.5 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                          isActive 
                            ? "bg-blue-600 text-white shadow-md font-bold" 
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {/* Subcontent display panel */}
                <div className="md:col-span-3 space-y-4 min-h-[300px]">
                  
                  {/* Skills Grid */}
                  {activeDossierTab === "skills" && (
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-mono">Verified Skills Mapping</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {(student.skills || []).map((skill: string) => {
                          const isSkillVerified = instCredentials.some(c => c.title.toLowerCase().includes(skill.toLowerCase()) || c.description.toLowerCase().includes(skill.toLowerCase())) ||
                            achievements.some(a => a.verified && (a.title.toLowerCase().includes(skill.toLowerCase()) || a.impact.toLowerCase().includes(skill.toLowerCase())));
                          
                          return (
                            <div 
                              key={skill} 
                              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                                isSkillVerified 
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 font-bold" 
                                  : "bg-white/[0.01] border-white/5 text-gray-300"
                              }`}
                            >
                              <span className="text-xs font-mono">{skill}</span>
                              {isSkillVerified ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Badge variant="outline" className="text-[8px] py-0 px-1.5 border-white/10 text-gray-500 uppercase font-mono rounded">Claimed</Badge>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Experiences list */}
                  {activeDossierTab === "experiences" && (
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-mono">Verified Internships & Experience Logs</h4>
                      {(experiences || []).map((exp) => (
                        <div key={exp.id} className="bg-[#111827] border border-white/5 p-4 rounded-xl space-y-3 shadow">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{exp.title}</h4>
                              <span className="text-xs text-blue-400 font-semibold">{exp.issuer}</span>
                            </div>
                            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 hover:none rounded">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">{exp.impact}</p>
                          <div className="flex justify-between items-center text-[9px] text-gray-500 pt-2.5 border-t border-white/5 font-mono">
                            <span>Period: {new Date(exp.date).toLocaleDateString()}</span>
                            <a href={exp.proofUrl || "#"} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="ghost" className="h-7 text-[10px] hover:text-white p-0 flex items-center gap-1.5">
                                View Proof Document <ExternalLink className="w-3 h-3" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
                      {experiences.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No verified work experiences added.</p>
                      )}
                    </div>
                  )}

                  {/* Research Papers list */}
                  {activeDossierTab === "research" && (
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-mono">Academic Research Papers</h4>
                      {(research || []).map((paper) => {
                        const isExpanded = expandedPaper === paper.id;
                        return (
                          <div key={paper.id} className="bg-[#111827] border border-white/5 p-4 rounded-xl space-y-3 shadow">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{paper.title}</h4>
                                <span className="text-xs text-blue-400 font-semibold block mt-1">Publisher: {paper.issuer}</span>
                              </div>
                              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 hover:none rounded">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </Badge>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setExpandedPaper(isExpanded ? null : paper.id)}
                              className="text-[10px] text-gray-400 hover:text-white h-6 p-0 flex items-center gap-1"
                            >
                              {isExpanded ? "Hide Abstract" : "Show Abstract"}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </Button>

                            {isExpanded && (
                              <p className="text-xs text-gray-400 leading-relaxed bg-[#0B1020]/40 p-3 rounded-lg border border-white/5 animate-in slide-in-from-top-1 duration-200">
                                {paper.impact || "Detailed study exploring next-generation consensus performance, latency benchmarks, and algorithmic bottlenecks in smart contract databases."}
                              </p>
                            )}

                            <div className="flex justify-between items-center text-[9px] text-gray-500 pt-2.5 border-t border-white/5 font-mono">
                              <span>Published: {paper.date}</span>
                              <a href={paper.proofUrl || "#"} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] hover:text-white p-0 flex items-center gap-1.5">
                                  Access Publication <ExternalLink className="w-3 h-3" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                      {research.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No research publications registered.</p>
                      )}
                    </div>
                  )}

                  {/* Projects List */}
                  {activeDossierTab === "projects" && (
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-mono">Technical Projects List</h4>
                      {(customProjects || []).map((proj: any, idx: number) => (
                        <div key={idx} className="bg-[#111827] border border-white/5 p-4 rounded-xl space-y-3 shadow">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{proj.title}</h4>
                              <p className="text-xs text-gray-400 mt-1">{proj.description}</p>
                            </div>
                            {proj.verified ? (
                              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 hover:none rounded">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-white/10 text-gray-500 text-[9px] uppercase font-mono tracking-wider shrink-0 rounded">Unverified</Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                            {(proj.tags || []).map((t: string) => (
                              <Badge key={t} className="bg-white/5 text-gray-300 border-white/5 text-[9px] font-mono py-0.5 px-2 rounded">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                      {customProjects.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No projects registered.</p>
                      )}
                    </div>
                  )}

                  {/* Recommendations Endorsements */}
                  {activeDossierTab === "recommendations" && (
                    <div className="space-y-4">
                      <h4 className="text-xs uppercase font-bold tracking-widest text-gray-400 font-mono">On-Chain Peer Endorsements</h4>
                      {(recommendations || []).map((rec) => (
                        <div key={rec.id} className="bg-[#111827] border border-white/5 p-4 rounded-xl space-y-3 shadow">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-white">{rec.title}</h4>
                              <span className="text-xs text-emerald-400 font-semibold">Endorsed by {rec.issuer}</span>
                            </div>
                            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 hover:none rounded">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed italic bg-[#0B1020]/40 p-3 rounded-lg border border-white/5">
                            "{rec.impact || "Exceptional developer with strong work ethic and deep technical knowledge."}"
                          </p>
                          <div className="text-[9px] text-gray-500 pt-1 text-right font-mono">
                            <span>Signed On: {rec.date}</span>
                          </div>
                        </div>
                      ))}
                      {recommendations.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No recommendations registered.</p>
                      )}
                    </div>
                  )}

                </div>

              </div>

            </TabsContent>

            {/* TAB 3: CAREER TIMELINE */}
            <TabsContent value="milestones" className="mt-4">
              <Card className="bg-[#111827] border border-white/5 p-6 rounded-[20px] shadow-xl">
                <CardHeader className="px-0 pt-0 pb-6">
                  <CardTitle className="text-xs uppercase font-bold tracking-widest text-white flex items-center gap-2 font-mono">
                    <Calendar className="w-4.5 h-4.5 text-blue-500" />
                    Career Milestone Chronology
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                  <div className="relative pl-6 border-l border-white/5 space-y-6 ml-4">
                    
                    {/* Render DigiLocker marks */}
                    {(records || []).map(record => (
                      <div key={record.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#0B1020] border-2 border-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <div className="bg-[#0B1020]/30 border border-white/5 p-4 rounded-xl flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-emerald-400 font-bold block uppercase tracking-wider">Academic Record • {record.year}</span>
                            <h4 className="text-xs font-bold text-white mt-1">{record.type} ({record.board})</h4>
                            <span className="text-[10px] text-gray-400 mt-1 block">Scored: {record.score}</span>
                          </div>
                          <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider hover:none rounded">
                            DigiLocker Verified
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Render experiences/awards */}
                    {(experiences || []).map(exp => (
                      <div key={exp.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#0B1020] border-2 border-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
                        <div className="bg-[#0B1020]/30 border border-white/5 p-4 rounded-xl flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-blue-400 font-bold block uppercase tracking-wider">Experience Milestone</span>
                            <h4 className="text-xs font-bold text-white mt-1">{exp.title}</h4>
                            <span className="text-[10px] text-gray-400 mt-1 block">Issued by {exp.issuer}</span>
                          </div>
                          <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-wider hover:none rounded">
                            W3C Verified
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {(awards || []).map(aw => (
                      <div key={aw.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#0B1020] border-2 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <div className="bg-[#0B1020]/30 border border-white/5 p-4 rounded-xl flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[9px] font-mono text-amber-400 font-bold block uppercase tracking-wider">Accomplishment Award</span>
                            <h4 className="text-xs font-bold text-white mt-1">{aw.title}</h4>
                            <span className="text-[10px] text-gray-400 mt-1 block">Organized by {aw.issuer}</span>
                          </div>
                          <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider hover:none rounded">
                            Verified Achievement
                          </Badge>
                        </div>
                      </div>
                    ))}

                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: W3C BLOCKCHAIN CREDENTIALS */}
            <TabsContent value="w3c" className="mt-4 space-y-4">
              {instCredentials.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-[#111827]/50 rounded-2xl border border-white/5 border-dashed">
                  <Building2 className="w-8 h-8 mx-auto mb-3 text-gray-500 animate-pulse" />
                  <p className="font-bold text-white">No verified institutional credentials found</p>
                  <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto">Credentials issued by Universities, Companies or Hackathons to your email will appear here automatically.</p>
                </div>
              ) : (
                (instCredentials || []).map((cred) => {
                  const isCredRevoked = cred.verificationStatus === "revoked";
                  const isCredExpired = cred.expiryDate !== "Never" && new Date(cred.expiryDate) < new Date();
                  
                  return (
                    <Card key={cred.id} className="bg-[#111827] border border-white/5 rounded-[20px] hover:border-white/10 transition-all shadow">
                      <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1 space-y-2 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-sm font-bold text-white truncate leading-tight">{cred.title}</h3>
                              <Badge variant="outline" className="border-white/10 text-gray-400 text-[9px] py-0.5 px-2 uppercase font-mono tracking-wider rounded">{cred.credentialType}</Badge>
                            </div>
                            <div className="text-[10px] text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-bold text-white">{cred.issuerName}</span>
                              <span>•</span>
                              <span>Issued: {cred.issueDate}</span>
                            </div>
                          </div>
                          
                          <div className="shrink-0 flex items-center gap-3 border-t md:border-t-0 border-white/5 pt-3 md:pt-0 w-full md:w-auto justify-between md:justify-end">
                            {isCredRevoked ? (
                              <Badge className="bg-red-500/10 border-red-500/20 text-red-400 font-bold text-[9px] hover:none rounded">
                                Revoked
                              </Badge>
                            ) : isCredExpired ? (
                              <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold text-[9px] hover:none rounded">
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 gap-1 font-bold text-[9px] hover:none rounded">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </Badge>
                            )}
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-gray-400 hover:text-white h-8 text-[10px] px-2.5 rounded-lg border border-white/5 bg-white/5" 
                                onClick={() => setSelectedCred(cred)}
                              >
                                <QrCode className="w-3.5 h-3.5 mr-1" /> View QR
                              </Button>
                              <Link href={`/verify/${cred.id}`} target="_blank">
                                <Button variant="outline" size="sm" className="h-8 text-[10px] px-2.5 bg-[#0B1020]/50 hover:bg-white/5 text-white border-white/10 flex items-center gap-1 rounded-lg">
                                  Trace Ledger <ExternalLink className="w-3 h-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

          </Tabs>

        </div>

      </div>

      {/* VIEW QR MODAL */}
      {selectedCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-[20px] w-full max-w-sm overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors" 
              onClick={() => setSelectedCred(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 text-center space-y-6">
              <div className="space-y-1 pt-2">
                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 uppercase text-[8px] tracking-widest mb-1 hover:none rounded">
                  W3C Anchored QR Code
                </Badge>
                <h3 className="text-sm font-bold text-white truncate px-4">{selectedCred.title}</h3>
                <p className="text-xs text-gray-400">Issued by {selectedCred.issuerName}</p>
              </div>

              <div className="w-40 h-40 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-white/5">
                <img src={selectedCred.qrCodeUrl} alt="Verification QR Code" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-3 text-xs">
                <div className="text-left bg-[#0B1020]/85 border border-white/5 p-3 rounded-xl space-y-1 font-mono">
                  <span className="text-gray-500 block uppercase font-bold text-[8px] tracking-wider font-sans">Blockchain Ledger Hash</span>
                  <code className="block text-[9px] text-gray-300 break-all leading-normal select-all">{selectedCred.blockchainHash}</code>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-grow bg-[#0B1020] text-white hover:bg-white/5 text-xs h-9 rounded-xl border-white/10" 
                    onClick={() => {
                      const origin = window.location.origin;
                      navigator.clipboard.writeText(`${origin}/verify/${selectedCred.id}`);
                      setCopiedId(true);
                      setTimeout(() => setCopiedId(false), 2000);
                    }}
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedId ? "Copied Link!" : "Copy Link"}
                  </Button>
                  <Link href={`/verify/${selectedCred.id}`} target="_blank" className="flex-grow">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-bold rounded-xl shadow-md">
                      Verify Ledger
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
