"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Trophy, Sparkles, Building2, FileText, CheckCircle2, Loader2, ArrowRight, Flame, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StudentService } from "@/services/student";
import { OpportunityService } from "@/services/opportunity";
import { AchievementService } from "@/services/achievement";
import { TrustScoreService } from "@/services/trust-score";
import { DigiLockerConnect } from "@/components/DigiLockerConnect";
import { useCallback } from "react";
import { DEMO_STUDENT, DEMO_ACADEMIC_RECORDS, DEMO_ACHIEVEMENTS, DEMO_OPPORTUNITIES, DEMO_TRUST_SCORE, isDemoUser } from "@/lib/demo-data";
import { motion } from "framer-motion";

const FICO_CLASS = (score: number) => {
  if (score >= 800) return { label: "Exceptional", color: "text-[#C9944A]", bg: "bg-[#C9944A]/10", border: "border-[#C9944A]/30" };
  if (score >= 740) return { label: "Very Good", color: "text-[#B65F32]", bg: "bg-[#B65F32]/10", border: "border-[#B65F32]/30" };
  if (score >= 670) return { label: "Good", color: "text-[#F5F1E8]", bg: "bg-white/10", border: "border-white/20" };
  if (score >= 580) return { label: "Fair", color: "text-[#D97706]", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { label: "Needs Proofs", color: "text-[#E57373]", bg: "bg-[#9E2A2B]/10", border: "border-[#9E2A2B]/20" };
};

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [trustScoreData, setTrustScoreData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const { currentUser } = useAuth();

  const loadAuthenticatedData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uid = currentUser.uid;
      const [rec, ach, opps, score] = await Promise.all([
        StudentService.getAcademicRecords(uid),
        AchievementService.getAchievements(uid),
        OpportunityService.getRecommendations(uid),
        TrustScoreService.getScore(uid)
      ]);
      setRecords(rec || []);
      setAchievements(ach || []);
      setOpportunities(opps || []);
      setTrustScoreData(score || { total: 300 });
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err?.message || "Failed to load complete records from database.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    async function loadStudent() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      try {
        const s = await StudentService.getProfile(currentUser.uid);
        setStudent(s);
        await loadAuthenticatedData();
      } catch (err) {
        console.error("Failed to load student profile:", err);
        setLoading(false);
        setError("Failed to load profile from database.");
      }
    }

    loadStudent();
  }, [currentUser, loadAuthenticatedData]);

  const handleDigiLockerComplete = () => {
    loadAuthenticatedData();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#B65F32]/30 border-t-[#B65F32] animate-spin" />
            <ShieldCheck className="w-5 h-5 text-[#B65F32] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs font-mono text-[#8A847B] uppercase tracking-widest animate-pulse">
            Loading Identity Console...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4 font-sans border border-white/5 p-8 rounded-2xl bg-[#111827]">
        <ShieldCheck className="w-12 h-12 text-blue-500 mx-auto" />
        <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
        <p className="text-xs text-gray-400 leading-relaxed">Please log in or create an account to view your student identity dashboard and verified credentials.</p>
        <Link href="/auth/login" className="inline-block">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 rounded-xl">
            Log In to Portal
          </Button>
        </Link>
      </div>
    );
  }

  if (!student?.isDigiLockerConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in duration-500 font-sans">
        <div className="text-center mb-8 space-y-3">
          <div className="w-14 h-14 bg-[#B65F32]/10 border border-[#B65F32]/30 text-[#B65F32] rounded-md flex items-center justify-center mx-auto shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-[#F5F1E8] tracking-tight">
            Welcome, {student?.fullName?.split(" ")?.[0] || student?.name?.split(" ")?.[0] || "Student"}
          </h1>
          <p className="text-[#8A847B] text-sm max-w-sm mx-auto leading-relaxed">
            Connect your academic identity to establish a verified professional passport.
          </p>
        </div>

        <Card className="bg-[#111827] border border-white/5 shadow-2xl rounded-[20px] overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <DigiLockerConnect onComplete={handleDigiLockerComplete} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentName = student?.fullName || student?.name || currentUser?.displayName || "Student";
  const firstName = studentName.split(" ")?.[0] || "Student";
  const totalScore = trustScoreData?.total || 350;
  const ficoMeta = FICO_CLASS(totalScore);
  const verifiedCount = achievements.filter(a => a.verified).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto font-sans">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-white tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            {student?.institution || "Your Institution"} · {student?.degree || ""} · Class of {student?.graduationYear || ""}
          </p>
        </div>
        <Link href="/student/passport">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-5 h-11 transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            View Digital Passport
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Trust Score Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] relative overflow-hidden group shadow-lg hover:border-blue-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-600/5 rounded-full blur-[20px] pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Trust Score</CardTitle>
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-5xl font-bold text-white tracking-tight">{totalScore}</div>
                <div className="pb-1">
                  <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${ficoMeta.bg} ${ficoMeta.border} ${ficoMeta.color}`}>
                    {ficoMeta.label}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-emerald-400 mt-2.5 flex items-center gap-1 font-semibold uppercase tracking-wider font-mono">
                <Flame className="w-3.5 h-3.5" />
                Top 3% of verified candidates
              </p>
              <div className="mt-3 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(((totalScore - 300) / 550) * 100)}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-600 font-mono mt-1">
                <span>300</span>
                <span>850</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verified Proofs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] relative overflow-hidden group shadow-lg hover:border-indigo-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-600/5 rounded-full blur-[20px] pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">Verified Proofs</CardTitle>
              <Trophy className="h-5 w-5 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-white tracking-tight">{verifiedCount}</div>
              <p className="text-[11px] text-gray-400 mt-2.5 font-mono uppercase tracking-wider">
                Credentials on Base Sepolia
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {["Degree", "Internship", "Research", "Leadership"].slice(0, Math.min(verifiedCount, 4)).map(tag => (
                  <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded font-mono font-bold">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Matches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] relative overflow-hidden group shadow-lg hover:border-purple-500/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-600/5 rounded-full blur-[20px] pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">AI Matches</CardTitle>
              <Sparkles className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-white tracking-tight">{opportunities.length}</div>
              <p className="text-[11px] text-gray-400 mt-2.5 font-mono uppercase tracking-wider">
                Based on verified skills
              </p>
              {opportunities[0] && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-purple-400 font-mono">
                  <TrendingUp className="w-3 h-3" />
                  Top: {opportunities[0].matchScore}% match at {opportunities[0].company}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lists Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Academic Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow-lg h-full">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Academic Records
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-1">
                  Verified via DigiLocker
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold">
                {records.length} Records
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-2.5">
              {records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No academic records yet.</p>
                </div>
              ) : (
                records.map(record => (
                  <div key={record.id} className="flex justify-between items-center p-3.5 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-white">{record.type}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{record.board} · {record.year}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-500 font-mono">{record.score}</p>
                      <p className="text-[9px] text-emerald-400 flex items-center justify-end mt-1 uppercase tracking-widest font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
                        {record.verifiedBy}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Opportunities */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow-lg h-full">
            <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Opportunity Hub
                </CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-1">
                  AI-matched based on your Trust Score
                </CardDescription>
              </div>
              <Link href="/student/opportunities">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-white/5 text-xs font-bold rounded-lg px-2.5 h-7">
                  View All <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-2.5">
              {opportunities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Complete your profile for AI matches.</p>
                </div>
              ) : (
                opportunities.slice(0, 4).map(opp => (
                  <div key={opp.id} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 hover:border-white/10 transition-all group cursor-pointer bg-white/[0.01]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden border border-white/10">
                        <img
                          src={opp.logo || "/default-company.png"}
                          alt={opp.company || "Company"}
                          className="object-contain w-full h-full"
                          onError={(e) => { e.currentTarget.src = "/default-company.png"; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">{opp.title}</p>
                        <div className="flex items-center text-[10px] text-gray-400 gap-1.5 mt-0.5">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{opp.company}</span>
                          {opp.location && <span className="text-gray-600">· {opp.location}</span>}
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-bold font-mono px-2 py-0.5 rounded shrink-0 ml-2">
                      {opp.matchScore}%
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
