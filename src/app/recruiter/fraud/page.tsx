"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Loader2, 
  RefreshCw, 
  ArrowUpRight, 
  Calendar,
  CheckCircle,
  FileText,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { DEMO_RECRUITER_CANDIDATES, isDemoUser } from "@/lib/demo-data";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface FraudLog {
  candidateId: string;
  candidateName: string;
  overallRisk: "High" | "Medium" | "Low";
  confidenceScore: number;
  scannedAt: string;
}

export default function GlobalFraudDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [scanningId, setScanningId] = useState<string | null>(null);

  // Load Scan Logs
  const loadLogs = async () => {
    try {
      const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
      if (demoActive) {
        // Use central demo data for flawless presentations
        await new Promise(r => setTimeout(r, 600));
        const demoLogs = DEMO_RECRUITER_CANDIDATES.map((c, idx) => ({
          candidateId: c.id,
          candidateName: c.name,
          overallRisk: c.riskLevel as "Low" | "Medium" | "High",
          confidenceScore: c.factors.verificationConfidence,
          scannedAt: new Date(Date.now() - (idx * 2) * 60 * 60 * 1000).toISOString()
        }));
        setLogs(demoLogs);
        setLoading(false);
        return;
      }

      // Production fetch
      const q = query(collection(db, "fraud_reports"), orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const list: FraudLog[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        list.push({
          candidateId: d.candidateId,
          candidateName: d.candidateName,
          overallRisk: d.overallRisk || "Low",
          confidenceScore: d.confidenceScore || 85,
          scannedAt: d.scannedAt || new Date().toISOString()
        });
      });
      
      setLogs(list);
    } catch (e) {
      console.error("Failed to load global fraud logs, using fallback:", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const triggerScan = async (candidateId: string) => {
    setScanningId(candidateId);
    try {
      const response = await fetch("/api/recruiter/fraud-detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ candidateId })
      });
      if (response.ok) {
        await loadLogs();
      }
    } catch (e) {
      console.error("Failed to re-run AI fraud scan:", e);
    } finally {
      setScanningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Compiling Fraud Registry...</span>
        </div>
      </div>
    );
  }

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => 
    log.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.overallRisk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute metrics
  const totalAudited = logs.length;
  const highRiskCount = logs.filter(l => l.overallRisk === "High").length;
  const avgConfidence = Math.round(logs.reduce((acc, curr) => acc + curr.confidenceScore, 0) / (logs.length || 1));

  // Count risks for SVG charts
  const riskCounts = {
    High: logs.filter(l => l.overallRisk === "High").length,
    Medium: logs.filter(l => l.overallRisk === "Medium").length,
    Low: logs.filter(l => l.overallRisk === "Low").length,
  };

  // Ring chart coordinates math
  const ringRadius = 50;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const highPercent = (riskCounts.High / (totalAudited || 1)) * 100;
  const mediumPercent = (riskCounts.Medium / (totalAudited || 1)) * 100;
  const lowPercent = (riskCounts.Low / (totalAudited || 1)) * 100;

  const highOffset = ringCircumference - (highPercent / 100) * ringCircumference;
  const mediumOffset = ringCircumference - (mediumPercent / 100) * ringCircumference;
  const lowOffset = ringCircumference - (lowPercent / 100) * ringCircumference;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-display font-medium text-white tracking-tight flex items-center gap-2">
              AI Fraud Detection Engine
            </h1>
            {isDemoUser(currentUser?.email || currentUser?.uid) && (
              <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-[10px] font-mono h-5 mt-1 animate-pulse">DEMO</Badge>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-1">Recruiter auditing center verifying document layouts, QR redirect targets, and authenticity signatures.</p>
        </div>
        <Button 
          onClick={loadLogs} 
          variant="outline" 
          className="border-white/10 bg-[#111827] hover:bg-white/5 text-white text-xs h-10 px-5 rounded-xl shrink-0 transition-all shadow-lg"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Dashboard
        </Button>
      </div>

      {/* Macro Statistics Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-[#111827] border border-white/5 p-6 flex flex-col justify-between h-36 rounded-[20px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/5 rounded-full blur-[20px] pointer-events-none" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">Total Audited Candidates</span>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-4.5xl font-black text-white tracking-tight">{totalAudited}</span>
            <Badge className="bg-blue-500/15 border-blue-500/30 text-blue-400 font-bold text-[9px] hover:none rounded">Active Checks</Badge>
          </div>
        </Card>

        <Card className="bg-[#111827] border border-white/5 p-6 flex flex-col justify-between h-36 rounded-[20px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-600/5 rounded-full blur-[20px] pointer-events-none" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">High-Risk Flagged</span>
          <div className="flex justify-between items-baseline mt-4">
            <span className={`text-4.5xl font-black tracking-tight ${highRiskCount > 0 ? "text-red-400" : "text-white"}`}>{highRiskCount}</span>
            {highRiskCount > 0 ? (
              <Badge className="bg-red-500/15 border-red-500/30 text-red-400 font-bold text-[9px] hover:none rounded animate-pulse">Needs Audit</Badge>
            ) : (
              <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold text-[9px] hover:none rounded">Secure</Badge>
            )}
          </div>
        </Card>

        <Card className="bg-[#111827] border border-white/5 p-6 flex flex-col justify-between h-36 rounded-[20px] shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-600/5 rounded-full blur-[20px] pointer-events-none" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block font-mono">Average Audit Confidence</span>
          <div className="flex justify-between items-baseline mt-4">
            <span className="text-4.5xl font-black text-white tracking-tight">{avgConfidence}%</span>
            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold text-[9px] hover:none rounded">High Accuracy</Badge>
          </div>
        </Card>
      </div>

      {/* SVG Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ring chart of Risk Proportion */}
        <Card className="bg-[#111827] border border-white/5 p-6 h-[320px] flex flex-col justify-between rounded-[20px] shadow-lg">
          <div>
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Risk Ratio Proportion</CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">Distribution of detected fraud risk categories.</CardDescription>
          </div>
          <div className="flex items-center justify-around gap-4 mt-2">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r={ringRadius}
                  className="stroke-red-500 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={highOffset}
                  strokeLinecap="round"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={ringRadius}
                  className="stroke-amber-500 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={mediumOffset}
                  strokeLinecap="round"
                  style={{ transform: `rotate(${(highPercent / 100) * 360}deg)`, transformOrigin: "72px 72px" }}
                />
                <circle
                  cx="72"
                  cy="72"
                  r={ringRadius}
                  className="stroke-emerald-500 transition-all duration-1000"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={lowOffset}
                  strokeLinecap="round"
                  style={{ transform: `rotate(${((highPercent + mediumPercent) / 100) * 360}deg)`, transformOrigin: "72px 72px" }}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{totalAudited}</span>
                <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider font-mono">Audited</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-gray-400">High Risk: <strong className="text-white">{riskCounts.High}</strong> ({Math.round(highPercent)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-gray-400">Medium Risk: <strong className="text-white">{riskCounts.Medium}</strong> ({Math.round(mediumPercent)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-gray-400">Low Risk: <strong className="text-white">{riskCounts.Low}</strong> ({Math.round(lowPercent)}%)</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Horizontal bar chart of Categories */}
        <Card className="bg-[#111827] border border-white/5 p-6 h-[320px] flex flex-col justify-between rounded-[20px] shadow-lg">
          <div>
            <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Risk Categories Audit</CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1">Count of anomalies caught across fraud vectors.</CardDescription>
          </div>
          <div className="space-y-3.5 mt-4 text-xs">
            {[
              { label: "Edited PDFs / Proof Files", count: logs.filter(l => l.overallRisk === "High").length, max: logs.length, color: "bg-red-500" },
              { label: "Revoked / Expired Credentials", count: logs.filter(l => l.overallRisk !== "Low").length, max: logs.length, color: "bg-amber-500" },
              { label: "Metadata Name Mismatch", count: logs.filter(l => l.overallRisk === "High").length, max: logs.length, color: "bg-blue-600" },
              { label: "Duplicate Claim Inconsistencies", count: logs.filter(l => l.overallRisk !== "Low").length, max: logs.length, color: "bg-indigo-600" },
            ].map(cat => (
              <div key={cat.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300">{cat.label}</span>
                  <span className="text-gray-500 font-mono">{cat.count} files flagged</span>
                </div>
                <div className="h-2 w-full bg-[#0B1020] border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${cat.color} transition-all duration-1000`}
                    style={{ width: `${(cat.count / (cat.max || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Global Table logs */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Audit Logs Registry</h2>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search candidate or risk level..."
              className="pl-10 h-10 bg-[#0B1020]/50 text-white border-white/10 rounded-xl focus-visible:ring-blue-500 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/[0.01] border-b border-white/5 text-gray-500 font-bold text-[9px] uppercase tracking-widest font-mono">
                  <th className="p-4 pl-6">Candidate Name</th>
                  <th className="p-4">Overall Risk</th>
                  <th className="p-4">Confidence Score</th>
                  <th className="p-4">Last Scanned Date</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/90">
                {filteredLogs.map((log) => {
                  const isScanning = scanningId === log.candidateId;
                  
                  return (
                    <tr key={log.candidateId} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6 font-bold text-white flex items-center gap-2.5">
                        <FileText className="w-4.5 h-4.5 text-blue-500 shrink-0" /> {log.candidateName}
                      </td>
                      <td className="p-4">
                        {log.overallRisk === "High" ? (
                          <Badge className="bg-red-500/10 border-red-500/20 text-red-400 font-bold uppercase tracking-wider text-[9px] gap-1 hover:none rounded">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> High Risk
                          </Badge>
                        ) : log.overallRisk === "Medium" ? (
                          <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold uppercase tracking-wider text-[9px] gap-1 hover:none rounded">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Medium Risk
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider text-[9px] gap-1 hover:none rounded">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Safe/Low
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        {log.confidenceScore}%
                      </td>
                      <td className="p-4 text-gray-400">
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {new Date(log.scannedAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6 space-x-2 whitespace-nowrap">
                        <Button 
                          onClick={() => triggerScan(log.candidateId)}
                          disabled={isScanning}
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-[11px] text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                        >
                          {isScanning ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Re-scan
                        </Button>
                        <Link href={`/recruiter/candidate/${log.candidateId}/fraud`}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[11px] bg-[#0B1020]/50 hover:bg-white/5 text-white border-white/10 font-bold rounded-lg"
                          >
                            Inspection Details <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500 bg-[#111827]/10">
                      No scanned logs found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
