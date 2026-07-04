"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CredentialService, Credential } from "@/services/credential";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Award, ShieldCheck, FileText, ArrowUpRight, Plus, Eye, 
  Loader2, RefreshCw, Layers, TrendingUp, Database, Hash
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { isDemoUser } from "@/lib/demo-data";

const DEMO_ISSUER = {
  name: "IIT Bombay",
  email: "university@iitb.ac.in",
  issuerType: "university",
  uid: "demo-issuer-001"
};

const DEMO_CREDENTIALS: Credential[] = [
  {
    id: "cred-demo-iitb-btech",
    issuerId: "demo-issuer-001",
    issuerName: "IIT Bombay",
    issuerType: "university",
    studentName: "Aarav Sharma",
    studentEmail: "student@university.edu",
    studentId: "demo-student-001",
    title: "B.Tech — Computer Science & Engineering",
    description: "Bachelor of Technology with specialization in AI and Data Science.",
    credentialType: "degree",
    issueDate: "2026-05-15",
    expiryDate: "Never",
    verificationStatus: "issued",
    digitalSignature: "0x4a7b9c2d...server-signed",
    blockchainHash: "0x7f3a91bc2e4d56f8a0123456789abcdef01234567890abcdef0123456789abcd",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://ascendid.app/verify/cred-demo-iitb-btech",
    blockchain: {
      chainId: 84532,
      contractAddress: "0xC9a43158891282A2B1475592D5719c001986926b",
      transactionHash: "0x89e13b29ceee72df292a8fc2e87b901a4c2d8f56e3197b45a298cd71e4f3082a",
      blockNumber: 18947231,
      issuerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      verificationStatus: "anchored",
      anchoredAt: "2026-05-15T10:30:00Z"
    },
    createdAt: { seconds: 1747299000, nanoseconds: 0 },
    updatedAt: { seconds: 1747299000, nanoseconds: 0 }
  },
  {
    id: "cred-demo-priya-degree",
    issuerId: "demo-issuer-001",
    issuerName: "IIT Bombay",
    issuerType: "university",
    studentName: "Priya Menon",
    studentEmail: "priya.menon@iitb.ac.in",
    studentId: "demo-student-002",
    title: "M.Tech — Artificial Intelligence",
    description: "Master of Technology in Artificial Intelligence and Machine Learning.",
    credentialType: "degree",
    issueDate: "2025-11-20",
    expiryDate: "Never",
    verificationStatus: "issued",
    digitalSignature: "0x8c2a15f7...server-signed",
    blockchainHash: "0x2f8d4e1a9b7c63e50987654321fedcba98765432109876543210fedcba987654",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://ascendid.app/verify/cred-demo-priya-degree",
    blockchain: {
      chainId: 84532,
      contractAddress: "0xC9a43158891282A2B1475592D5719c001986926b",
      transactionHash: "0x3d4e5f60a7b8c90d1e2f3a4b5c6d7e8f90a1b2c3d4e5f60a7b8c90d1e2f3a4b",
      blockNumber: 18821044,
      issuerWallet: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      verificationStatus: "anchored",
      anchoredAt: "2025-11-20T14:00:00Z"
    },
    createdAt: { seconds: 1732108800, nanoseconds: 0 },
    updatedAt: { seconds: 1732108800, nanoseconds: 0 }
  },
  {
    id: "cred-demo-rahul-cert",
    issuerId: "demo-issuer-001",
    issuerName: "IIT Bombay",
    issuerType: "university",
    studentName: "Rahul Joshi",
    studentEmail: "rahul.joshi@student.iitb.ac.in",
    studentId: "demo-student-003",
    title: "Advanced Certificate — Data Science & Analytics",
    description: "Professional certificate in data science methodologies and applied analytics.",
    credentialType: "certification",
    issueDate: "2025-08-01",
    expiryDate: "2027-08-01",
    verificationStatus: "issued",
    digitalSignature: "0x1b3f9e8d...server-signed",
    blockchainHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://ascendid.app/verify/cred-demo-rahul-cert",
    createdAt: { seconds: 1722470400, nanoseconds: 0 },
    updatedAt: { seconds: 1722470400, nanoseconds: 0 }
  }
];

export default function IssuerDashboard() {
  const { currentUser } = useAuth();
  const [issuerProfile, setIssuerProfile] = useState<any>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const demoActive = isDemoUser(currentUser?.email || currentUser?.uid);
    if (demoActive) {
      await new Promise(r => setTimeout(r, 400));
      setIssuerProfile(DEMO_ISSUER);
      setCredentials(DEMO_CREDENTIALS);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!currentUser) return;
    try {
      const profileDoc = await getDoc(doc(db, "issuers", currentUser.uid));
      if (profileDoc.exists()) setIssuerProfile(profileDoc.data());
      const list = await CredentialService.getIssuerCredentials(currentUser.uid);
      setCredentials(list);
    } catch (error) {
      console.error("Dashboard failed to load:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            <Layers className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest animate-pulse">
            Loading Issuer Console...
          </span>
        </div>
      </div>
    );
  }

  const totalIssued = credentials.length;
  const activeCount = credentials.filter(c => 
    c.verificationStatus !== "revoked" && 
    (c.expiryDate === "Never" || new Date(c.expiryDate) >= new Date())
  ).length;
  const revokedCount = credentials.filter(c => c.verificationStatus === "revoked").length;
  const expiredCount = credentials.filter(c => 
    c.verificationStatus !== "revoked" && 
    c.expiryDate !== "Never" && 
    new Date(c.expiryDate) < new Date()
  ).length;
  const blockchainAnchoredCount = credentials.filter(c => c.blockchain?.contractAddress && c.blockchain.contractAddress !== "0x0000000000000000000000000000000000000000").length;

  const formatIssuerType = (type: string) => {
    const map: Record<string, string> = {
      university: "University", 
      company: "Company / Employer",
      hackathon: "Hackathon Organizer",
      certifier: "Certification Provider"
    };
    return map[type] || type;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12 font-sans">
      
      {/* Demo Mode Banner */}
      {isDemoUser(currentUser?.email || currentUser?.uid) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600/5 border border-blue-500/20"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Demo Mode</span>
            <span className="text-xs text-gray-400">— IIT Bombay Admin Console</span>
          </div>
          <Badge className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-[10px] font-mono">DEMO</Badge>
        </motion.div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-medium text-white tracking-tight">Issuer Console</h1>
          <p className="text-gray-400 text-xs mt-1">
            Issue, manage, and anchor official credentials on Base Sepolia.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 bg-[#111827] hover:bg-white/5 text-white text-xs h-9 px-4 rounded-xl"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh credential list"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/issuer/issue">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.2)]">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Issue New Credential
            </Button>
          </Link>
        </div>
      </div>

      {/* Institution Profile */}
      <Card className="bg-[#111827] overflow-hidden border border-white/5 relative shadow-xl rounded-[20px]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none bg-blue-600/5 -translate-y-1/2 translate-x-1/3" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {issuerProfile?.name || currentUser?.displayName || "Institution"}
                </h2>
                <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 gap-1 hover:none rounded text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Verified Issuer
                </Badge>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1.5 font-normal">
                <span>{issuerProfile?.email || currentUser?.email}</span>
                <span>·</span>
                <span className="capitalize">{formatIssuerType(issuerProfile?.issuerType || "Institution")}</span>
              </p>
            </div>
            <div className="text-xs bg-[#0B1020]/60 border border-white/5 px-4 py-3 rounded-xl min-w-[220px]">
              <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider font-mono">Issuer DID</span>
              <span className="font-mono text-white/80 mt-1 block select-all break-all text-[10px]">
                did:ascendid:{isDemoUser(currentUser?.email || currentUser?.uid) ? "demo-issuer-001" : (currentUser?.uid || "")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Issued", value: totalIssued, color: "text-white", icon: Layers },
          { label: "Active Valid", value: activeCount, color: "text-emerald-400", icon: ShieldCheck },
          { label: "On-Chain", value: blockchainAnchoredCount, color: "text-blue-400", icon: Database },
          { label: "Revoked", value: revokedCount, color: "text-red-400", icon: FileText },
          { label: "Expired", value: expiredCount, color: "text-amber-400", icon: TrendingUp },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-wider font-mono ${m.color}`}>
                    {m.label}
                  </span>
                  <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                </div>
                <span className="text-3xl font-bold text-white block font-mono">{m.value}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Credentials Table */}
        <Card className="bg-[#111827] border border-white/5 lg:col-span-2 rounded-[20px] shadow overflow-hidden">
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Recent Credentials</CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">
                Recently issued and anchored records.
              </CardDescription>
            </div>
            <Link href="/issuer/credentials">
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-white/5 text-xs font-bold rounded-lg px-2.5 h-8">
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {credentials.length === 0 ? (
              <div className="text-center py-16 text-gray-400 border-t border-white/5">
                <Award className="w-10 h-10 mx-auto mb-3 text-white/10" />
                <p className="text-sm font-bold text-white">No credentials issued yet.</p>
                <p className="text-xs text-gray-500 mt-1">Issue your first credential to get started.</p>
                <Link href="/issuer/issue" className="mt-4 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl mt-3">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Issue First Credential
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-t border-b border-white/5 bg-white/[0.01] text-gray-500 font-bold uppercase tracking-widest font-mono">
                      <th className="p-4">Student</th>
                      <th className="p-4">Credential</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 hidden md:table-cell">Issued</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/90">
                    {credentials.slice(0, 5).map(cred => {
                      const isRevoked = cred.verificationStatus === "revoked";
                      const isExpired = cred.expiryDate !== "Never" && new Date(cred.expiryDate) < new Date();
                      const isAnchored = cred.blockchain?.contractAddress &&
                        cred.blockchain.contractAddress !== "0x0000000000000000000000000000000000000000";

                      return (
                        <tr key={cred.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-white">{cred.studentName}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{cred.studentEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{cred.title}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="outline" className="text-[9px] capitalize border-white/10 text-gray-400 hover:none rounded">
                                {cred.credentialType}
                              </Badge>
                              {isAnchored && (
                                <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-400 font-mono">
                                  <Hash className="w-2.5 h-2.5" /> On-Chain
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {isRevoked ? (
                              <Badge className="bg-red-500/10 border-red-500/20 text-red-400 font-bold text-[9px] hover:none rounded">Revoked</Badge>
                            ) : isExpired ? (
                              <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold text-[9px] hover:none rounded">Expired</Badge>
                            ) : (
                              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold text-[9px] hover:none rounded">Valid</Badge>
                            )}
                          </td>
                          <td className="p-4 text-gray-400 font-mono text-[10px] hidden md:table-cell">{cred.issueDate}</td>
                          <td className="p-4 text-right pr-6">
                            <Link href={`/verify/${cred.id}`} target="_blank">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
                                aria-label={`Verify credential for ${cred.studentName}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How It Works */}
        <div className="space-y-4">
          <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Dual Cryptographic Verification</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-xs text-gray-400 space-y-4">
              <p className="leading-relaxed">
                Every credential you issue is cryptographically sealed using two independent mechanisms:
              </p>
              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "SHA-256 Metadata Hash",
                    desc: "Normalized credential fields are deterministically serialized (alphabetically sorted JSON) and hashed with SHA-256. Any tampering changes the hash."
                  },
                  {
                    step: "2",
                    title: "viem Server Signature",
                    desc: "The metadata hash is signed with your institution's private key using secp256k1 — the same cryptographic standard as Ethereum wallets."
                  },
                  {
                    step: "3",
                    title: "Base Sepolia Anchoring",
                    desc: "The hash is submitted to CredentialRegistry.sol on Base Sepolia. The transaction hash provides a permanent, immutable timestamp."
                  }
                ].map(item => (
                  <div key={item.step} className="flex gap-2.5">
                    <div className="w-5 h-5 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] text-blue-400 font-mono">
                      {item.step}
                    </div>
                    <p className="leading-relaxed">
                      <strong className="text-white">{item.title}</strong>: {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {blockchainAnchoredCount > 0 && (
            <Card className="bg-blue-600/5 border border-blue-500/20 rounded-[20px] shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 font-mono uppercase tracking-widest">Base Sepolia</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {blockchainAnchoredCount} credential{blockchainAnchoredCount !== 1 ? "s" : ""} permanently anchored on Base Sepolia testnet.
                  Every transaction hash is publicly verifiable.
                </p>
                <a
                  href="https://sepolia.basescan.org/address/0xC9a43158891282A2B1475592D5719c001986926b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  View Contract on BaseScan
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
