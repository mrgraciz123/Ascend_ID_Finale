"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Globe, 
  ShieldAlert,
  Loader2,
  Lock,
  Search,
  ArrowUpRight
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function GovernmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 100,
    totalCredentials: 1200,
    verificationRate: 88.5,
    fraudPrevented: 54,
    placedStudentsPct: 74,
    averageTrustScore: 684
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentSnap, credSnap] = await Promise.all([
          getDocs(collection(db, "students")),
          getDocs(collection(db, "credentials"))
        ]);

        const stdCount = studentSnap.size;
        const credCount = credSnap.size;

        let fraudCount = 0;
        let verifiedCount = 0;
        let totalScoreSum = 0;
        const instMap: Record<string, { totalScore: number; count: number; verifiedCreds: number }> = {};

        credSnap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d.verificationStatus === "revoked" || d.digitalSignature?.includes("mismatched")) {
            fraudCount++;
          } else if (d.verificationStatus === "issued") {
            verifiedCount++;
          }
        });

        studentSnap.forEach((docSnap) => {
          const d = docSnap.data();
          const score = d.trustScore || 300;
          totalScoreSum += score;
          const inst = d.institution || d.university || "Independent Candidate";
          if (!instMap[inst]) {
            instMap[inst] = { totalScore: 0, count: 0, verifiedCreds: 0 };
          }
          instMap[inst].totalScore += score;
          instMap[inst].count += 1;
        });

        const computedAvgScore = stdCount > 0 ? Math.round(totalScoreSum / stdCount) : 0;
        const computedVerificationRate = credCount > 0 ? Math.round((verifiedCount / credCount) * 1000) / 10 : 0;

        setStats({
          totalStudents: stdCount,
          totalCredentials: credCount,
          verificationRate: computedVerificationRate,
          fraudPrevented: fraudCount,
          placedStudentsPct: 0,
          averageTrustScore: computedAvgScore
        });

        const computedLeaderboard = Object.entries(instMap).map(([name, data], idx) => ({
          rank: idx + 1,
          name,
          avgScore: Math.round(data.totalScore / data.count),
          placement: 0,
          verified: data.count
        })).sort((a, b) => b.avgScore - a.avgScore);

        setLeaderboard(computedLeaderboard);
      } catch (e) {
        console.error("Error querying Firestore for government dashboard:", e);
        setStats({
          totalStudents: 0,
          totalCredentials: 0,
          verificationRate: 0,
          fraudPrevented: 0,
          placedStudentsPct: 0,
          averageTrustScore: 0
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Loading Government Node...</span>
        </div>
      </div>
    );
  }

  const hiringTrends = [
    { month: "Jan", hires: 12, volume: 45 },
    { month: "Feb", hires: 24, volume: 60 },
    { month: "Mar", hires: 38, volume: 75 },
    { month: "Apr", hires: 52, volume: 90 },
    { month: "May", hires: 70, volume: 110 },
    { month: "Jun", hires: 95, volume: 130 }
  ];

  const skillDistribution = [
    { skill: "React / Frontend Engineering", count: stats.totalCredentials ? Math.round(stats.totalCredentials * 0.4) : 0, pct: stats.totalCredentials ? 40 : 0, color: "bg-blue-600" },
    { skill: "Python & Machine Learning", count: stats.totalCredentials ? Math.round(stats.totalCredentials * 0.3) : 0, pct: stats.totalCredentials ? 30 : 0, color: "bg-sky-500" },
    { skill: "Blockchain & Cryptography", count: stats.totalCredentials ? Math.round(stats.totalCredentials * 0.15) : 0, pct: stats.totalCredentials ? 15 : 0, color: "bg-emerald-500" },
  ];

  const universityLeaderboard = leaderboard;

  // Helper to generate coordinates for SVG Line Chart (Hiring Trends)
  const maxVal = 130;
  const chartHeight = 120;
  const chartWidth = 460;
  const pointsHires = hiringTrends.map((t, idx) => {
    const x = (idx / (hiringTrends.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (t.hires / maxVal) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  const pointsVolume = hiringTrends.map((t, idx) => {
    const x = (idx / (hiringTrends.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (t.volume / maxVal) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-16 font-sans">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-display font-medium text-[#F5F1E8] tracking-tight flex items-center gap-2.5">
            <Globe className="w-8 h-8 text-[#B65F32]" />
            National Talent Registry Intelligence
          </h1>
          <p className="text-[#8A847B] text-xs mt-1">Macroscopic analysis of verification rates, skill distributions, and institutional leaderboards.</p>
        </div>
        <Badge className="bg-[#B65F32]/10 border-[#B65F32]/20 text-[#B65F32] font-bold px-3.5 py-1.5 text-xs hover:none rounded-lg font-mono">
          Gov Node Authority Active
        </Badge>
      </div>

      {/* Grid summary statistics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total students */}
        <Card className="bg-[#191919] border border-[#B65F32]/20 shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block font-mono">Registered Candidates</span>
              <span className="text-3xl font-black text-[#F5F1E8] block tracking-tight">{stats.totalStudents}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#B65F32]/10 border border-[#B65F32]/20 flex items-center justify-center text-[#B65F32] shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Verification rate */}
        <Card className="bg-[#111827] border border-white/5 shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block font-mono">National Verification Rate</span>
              <span className="text-3xl font-black text-emerald-400 block tracking-tight">{stats.verificationRate}%</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Fraud attempts blocked */}
        <Card className="bg-[#111827] border border-white/5 shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block font-mono">Fraud Claims Terminated</span>
              <span className="text-3xl font-black text-red-400 block tracking-tight">{stats.fraudPrevented} Cases</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Average Trust Score */}
        <Card className="bg-[#191919] border border-[#B65F32]/20 shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block font-mono">National Trust Index</span>
              <span className="text-3xl font-black text-[#F5F1E8] block tracking-tight">{stats.averageTrustScore} Ascend Trust Score</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#B65F32]/10 border border-[#B65F32]/20 flex items-center justify-center text-[#B65F32] shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Row 2: Charts - Skill Distribution & Hiring/Verification trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hiring & Verification Trends (SVG Line Chart) */}
        <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Employment & Anchoring Velocity</CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">Monthly growth of active hirings vs cryptographic credential issuances.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="relative h-44 bg-[#0B1020]/40 border border-white/5 rounded-xl p-4 overflow-hidden flex items-center justify-center">
              
              {/* Grid lines watermark */}
              <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-5 pointer-events-none">
                <div className="border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-b border-white" />
              </div>

              <svg className="w-full h-full" viewBox="0 0 460 120">
                <defs>
                  <filter id="glow-indigo" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.8" />
                  </filter>
                  <filter id="glow-teal" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#0d9488" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Line 1: Volume */}
                <path d={`M ${pointsVolume}`} fill="none" stroke="#6366f1" strokeWidth="3" filter="url(#glow-indigo)" />
                {/* Line 2: Hires */}
                <path d={`M ${pointsHires}`} fill="none" stroke="#0d9488" strokeWidth="3" filter="url(#glow-teal)" />

                {/* Dots for volume */}
                {hiringTrends.map((t, idx) => {
                  const x = (idx / (hiringTrends.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - (t.volume / maxVal) * (chartHeight - 20) - 10;
                  return <circle key={`v-${idx}`} cx={x} cy={y} r="3.5" fill="#6366f1" />;
                })}

                {/* Dots for hires */}
                {hiringTrends.map((t, idx) => {
                  const x = (idx / (hiringTrends.length - 1)) * (chartWidth - 40) + 20;
                  const y = chartHeight - (t.hires / maxVal) * (chartHeight - 20) - 10;
                  return <circle key={`h-${idx}`} cx={x} cy={y} r="3.5" fill="#0d9488" />;
                })}
              </svg>
            </div>
            
            {/* Legend & Labels */}
            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-indigo-500 rounded" /> Credential Vol</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-teal-500 rounded" /> Hirings Click</span>
              </div>
              <div className="flex gap-4">
                {hiringTrends.map(t => <span key={t.month}>{t.month}</span>)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Competency Distribution */}
        <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">National Skill Competency Distribution</CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">Frequency of validated digital certifications across key technologies.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {skillDistribution.map((skill) => (
              <div key={skill.skill} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white font-mono">{skill.skill}</span>
                  <span className="text-gray-400 font-semibold">{skill.count} Certs ({skill.pct}%)</span>
                </div>
                <div className="w-full h-2 bg-[#0B1020] border border-white/5 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${skill.pct}%` }}
                    className={`h-full rounded-full ${skill.color}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>

      {/* Row 3: Leaderboard (Institution Ranking) & Macro Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* National Leaderboard */}
        <Card className="bg-[#111827] border border-white/5 lg:col-span-8 rounded-[20px] shadow overflow-hidden">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">National Institutional Leaderboard</CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">Top universities ranked by average student trust scores and placement efficiency.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left border-t border-white/5">
              <thead className="text-[9px] uppercase font-bold text-gray-500 tracking-widest bg-white/[0.01] font-mono">
                <tr>
                  <th className="p-4 pl-6">Rank</th>
                  <th className="p-4">Institution</th>
                  <th className="p-4 text-center">Avg Ascend Trust Score</th>
                  <th className="p-4 text-center">Verification Volume</th>
                  <th className="p-4 text-center">Placement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/95">
                {universityLeaderboard.map((row) => (
                  <tr key={row.rank} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-[#C9944A]">#0{row.rank}</td>
                    <td className="p-4 font-bold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
                      {row.name}
                    </td>
                    <td className="p-4 text-center font-mono font-bold">{row.avgScore}</td>
                    <td className="p-4 text-center font-mono text-gray-400">{row.verified} Anchors</td>
                    <td className="p-4 text-center font-mono text-emerald-400 font-semibold">{row.placement}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Global Security Audit Log */}
        <Card className="bg-[#111827] border border-white/5 lg:col-span-4 rounded-[20px] shadow">
          <CardHeader className="p-6 pb-3">
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-white flex items-center gap-2 font-mono">
              <Lock className="w-4.5 h-4.5 text-red-400 animate-pulse" />
              Real-Time Registry Auditor
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">Ledger validation events flagged across national nodes.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="border border-white/10 rounded-xl bg-[#0B1020]/60 font-mono text-[9px] text-gray-400 p-3.5 space-y-2 max-h-60 overflow-y-auto leading-relaxed select-none">
              <p className="text-emerald-400 font-bold">[INFO] Node authorized: Government verifier initialized.</p>
              <p className="text-red-400 font-bold">[BLOCKED] Scan warning: Mismatched signature on node 0x72ba...</p>
              <p className="text-white/50">[LEDGER] Anchor confirmation: B.Tech certificate verified for student-12.</p>
              <p className="text-red-400 font-bold">[BLOCKED] Blocked 1 fake certificate from unregistered issuer wallet.</p>
              <p className="text-white/50">[EVENT] Traversed blockchain ledger audit on 12 credentials.</p>
              <p className="text-white/30">[AUDIT] Cryptographic signatures matching whitelisted registries.</p>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
