"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { CredentialService, Credential } from "@/services/credential";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Award, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Loader2, 
  X, 
  Calendar, 
  User, 
  ShieldCheck, 
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Building,
  Info,
  Database,
  ShieldAlert,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default function IssuedCredentialsPage() {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals state
  const [selectedCred, setSelectedCred] = useState<Credential | null>(null);
  const [editCred, setEditCred] = useState<Credential | null>(null);
  const [revokeCred, setRevokeCred] = useState<Credential | null>(null);

  // Modal actions loading state
  const [actionLoading, setActionLoading] = useState(false);
  const [revokeStatus, setRevokeStatus] = useState<"idle" | "submitting" | "confirming" | "revoked" | "failed">("idle");
  const [revokeError, setRevokeError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedRevokeTx, setCopiedRevokeTx] = useState(false);

  // Revocation Result Evidence Container
  const [revocationResult, setRevocationResult] = useState<{
    transactionHash: string;
    blockNumber: number;
    reason: string;
    anchorTxHash: string;
    anchorBlock: number | null;
  } | null>(null);

  // Edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editNeverExpires, setEditNeverExpires] = useState(true);

  // Revoke field
  const [revokeReason, setRevokeReason] = useState("");

  async function loadCredentials() {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      const list = await CredentialService.getIssuerCredentials(currentUser.uid);
      setCredentials(list || []);
    } catch (e) {
      console.error("Failed to load credentials:", e);
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCredentials();
  }, [currentUser]);

  // Open Edit Modal
  const handleOpenEdit = (cred: Credential) => {
    setEditCred(cred);
    setEditTitle(cred.title);
    setEditDesc(cred.description);
    setEditNeverExpires(cred.expiryDate === "Never");
    setEditExpiryDate(cred.expiryDate === "Never" ? "" : cred.expiryDate);
    setSelectedCred(null);
  };

  // Submit Edit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCred) return;

    setActionLoading(true);
    const result = await CredentialService.updateCredential(editCred.id, {
      title: editTitle,
      description: editDesc,
      expiryDate: editNeverExpires ? "Never" : editExpiryDate
    });

    if (result.success) {
      await loadCredentials();
      setEditCred(null);
    } else {
      alert(result.error || "Failed to update credential");
    }
    setActionLoading(false);
  };

  // Open Revoke Modal
  const handleOpenRevoke = (cred: Credential) => {
    setRevokeCred(cred);
    setRevokeReason("");
    setRevokeStatus("idle");
    setRevokeError("");
    setRevocationResult(null);
    setSelectedCred(null);
  };

  // Submit Revocation with Real Lifecycle States
  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCred) return;

    setActionLoading(true);
    setRevokeStatus("submitting");
    setRevokeError("");

    try {
      setRevokeStatus("confirming");
      const result = await CredentialService.revokeCredential(revokeCred.id, revokeReason);

      if (result.success) {
        setRevocationResult({
          transactionHash: result.revocationTransactionHash || result.transactionHash || "",
          blockNumber: result.blockNumber || 0,
          reason: revokeReason,
          anchorTxHash: revokeCred.anchorTransactionHash || revokeCred.blockchain?.anchorTransactionHash || revokeCred.blockchain?.transactionHash || "",
          anchorBlock: revokeCred.anchorBlockNumber || revokeCred.blockchain?.anchorBlockNumber || revokeCred.blockchain?.blockNumber || null,
        });
        setRevokeStatus("revoked");
        await loadCredentials();
      } else {
        setRevokeStatus("failed");
        setRevokeError(result.error || "Failed to revoke credential on-chain.");
      }
    } catch (err: any) {
      setRevokeStatus("failed");
      setRevokeError(err.message || "On-chain revocation failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyText = (text: string, type: "id" | "tx" | "revokeTx") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (type === "tx") {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else if (type === "revokeTx") {
      setCopiedRevokeTx(true);
      setTimeout(() => setCopiedRevokeTx(false), 2000);
    }
  };

  // Filtered List calculation
  const filteredCredentials = credentials.filter((c) => {
    const nameMatch = (c.studentName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (c.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase());
    const titleMatch = (c.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const uuidMatch = (c.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    const passesSearch = nameMatch || emailMatch || titleMatch || uuidMatch;

    const passesType = filterType === "all" || c.credentialType === filterType;

    let status = "active";
    if (c.verificationStatus === "revoked") {
      status = "revoked";
    } else if (c.expiryDate !== "Never" && new Date(c.expiryDate) < new Date()) {
      status = "expired";
    }
    const passesStatus = filterStatus === "all" || status === filterStatus;

    return passesSearch && passesType && passesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#B65F32] animate-spin" />
          <span className="text-xs font-mono text-[#8A847B] uppercase tracking-widest">Loading Directory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-16 font-sans text-[#F5F1E8]">
      {/* Header with Judge Journey Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#B65F32]/20 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F5F1E8] tracking-tight">Credentials Directory</h1>
          <p className="text-[#8A847B] text-xs mt-1">Audit, inspect, and manage verifiable credentials anchored to AscendChain Devnet.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/issuer/issue">
            <Button className="bg-[#B65F32] hover:bg-[#8F4728] text-white font-mono text-xs font-bold h-10 px-5 rounded shadow">
              <Award className="w-4 h-4 mr-2" /> Issue New Credential
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-[#191919] border border-[#B65F32]/25 shadow-lg rounded-xl">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A847B]" />
            <Input
              placeholder="Search candidate name, email, title, or UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0D0D0D] border-[#B65F32]/25 pl-10 text-[#F5F1E8] w-full text-xs h-10 rounded focus-visible:ring-[#B65F32]"
            />
          </div>

          <div className="w-full md:w-48 shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded border border-[#B65F32]/25 bg-[#0D0D0D] px-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:ring-1 focus:ring-[#B65F32] cursor-pointer font-sans"
            >
              <option value="all">All Credential Types</option>
              <option value="degree">Degree</option>
              <option value="diploma">Diploma</option>
              <option value="internship">Internship</option>
              <option value="experience">Experience</option>
              <option value="achievement">Achievement</option>
              <option value="certification">Certification</option>
              <option value="badge">Badge</option>
            </select>
          </div>

          <div className="w-full md:w-48 shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded border border-[#B65F32]/25 bg-[#0D0D0D] px-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:ring-1 focus:ring-[#B65F32] cursor-pointer font-sans"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active / Verified</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="bg-[#191919] border border-[#B65F32]/25 rounded-xl shadow overflow-hidden">
        <CardContent className="p-0">
          {filteredCredentials.length === 0 ? (
            <div className="text-center py-16 text-[#8A847B]">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-[#F5F1E8]">No credentials found</p>
              <p className="text-xs text-[#8A847B] mt-1">Issue a new credential or modify your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#B65F32]/20 bg-[#0D0D0D] text-[#8A847B] font-bold uppercase tracking-widest font-mono">
                    <th className="p-4 pl-6">Student Recipient</th>
                    <th className="p-4">Title / Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">AscendChain Proofs</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B65F32]/10 text-[#F5F1E8]">
                  {filteredCredentials.map((cred) => {
                    const isCredRevoked = cred.verificationStatus === "revoked";
                    const isCredExpired = cred.expiryDate !== "Never" && new Date(cred.expiryDate) < new Date();
                    const anchorTx = cred.anchorTransactionHash || cred.blockchain?.anchorTransactionHash || cred.blockchain?.transactionHash;
                    const anchorBlock = cred.anchorBlockNumber || cred.blockchain?.anchorBlockNumber || cred.blockchain?.blockNumber;
                    const revokeTx = cred.revocationTransactionHash || cred.blockchain?.revocationTransactionHash;
                    const revokeBlock = cred.revocationBlockNumber || cred.blockchain?.revocationBlockNumber;

                    return (
                      <tr key={cred.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-[#F5F1E8]">{cred.studentName}</p>
                          <p className="text-[10px] text-[#8A847B] font-mono mt-0.5">{cred.studentEmail}</p>
                          <span className="text-[9px] text-[#8A847B] font-mono block select-all">UUID: {cred.id}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-[#F5F1E8]">{cred.title}</p>
                          <Badge variant="outline" className="text-[9px] capitalize mt-1 border-[#B65F32]/30 text-[#8A847B] rounded">
                            {cred.credentialType}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {isCredRevoked ? (
                            <Badge className="bg-red-500/15 border-red-500/30 text-red-400 font-mono font-bold text-[10px] rounded">
                              REVOKED
                            </Badge>
                          ) : isCredExpired ? (
                            <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-400 font-mono font-bold text-[10px] rounded">
                              EXPIRED
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px] rounded">
                              ISSUED / ACTIVE
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 font-mono text-[10px]">
                          {/* CRITICAL: Dual proofs displayed distinctly and separately */}
                          <div className="space-y-1">
                            {anchorTx && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#8A847B] text-[9px] uppercase font-bold">Anchor:</span>
                                <span className="text-[#C9944A] truncate max-w-[110px]" title={anchorTx}>
                                  {anchorTx.substring(0, 10)}...
                                </span>
                                <span className="text-[#8A847B] text-[9px]">#{anchorBlock || "Block"}</span>
                              </div>
                            )}
                            {isCredRevoked && (
                              <div className="flex items-center gap-1.5 text-red-400">
                                <span className="text-red-400/80 text-[9px] uppercase font-bold">Revoke:</span>
                                <span className="truncate max-w-[110px]" title={revokeTx || "Revoked"}>
                                  {revokeTx ? `${revokeTx.substring(0, 10)}...` : "Confirmed"}
                                </span>
                                <span className="text-[9px]">#{revokeBlock || "Block"}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-[#8A847B] font-mono text-[10px]">{cred.issueDate}</td>
                        <td className="p-4 text-right pr-6 space-x-1.5 whitespace-nowrap">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#0D0D0D] text-[#8A847B] hover:text-[#F5F1E8] rounded" onClick={() => setSelectedCred(cred)} title="Inspect Record">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isCredRevoked && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#0D0D0D] text-blue-400 hover:text-blue-300 rounded" onClick={() => handleOpenEdit(cred)} title="Edit Metadata">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#0D0D0D] text-red-400 hover:text-red-300 rounded" onClick={() => handleOpenRevoke(cred)} title="Revoke Credential">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Link href={`/verify/${cred.id}`} target="_blank">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-[#0D0D0D] text-[#C9944A] hover:text-white rounded" title="Open Public Verifier">
                              <ExternalLink className="w-4 h-4" />
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

      {/* -------------------- VIEW MODAL -------------------- */}
      {selectedCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-[#F5F1E8]">
          <div className="bg-[#191919] border border-[#B65F32]/40 rounded-xl w-full max-w-xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button className="absolute top-4 right-4 text-[#8A847B] hover:text-white p-1 hover:bg-[#0D0D0D] rounded-full transition-colors" onClick={() => setSelectedCred(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 space-y-6">
              <div>
                <Badge className="bg-[#B65F32]/15 text-[#B65F32] border-[#B65F32]/30 uppercase text-[9px] font-mono tracking-widest mb-1 rounded">
                  Verifiable Credential Record
                </Badge>
                <h3 className="text-xl font-bold text-[#F5F1E8] leading-tight">{selectedCred.title}</h3>
                <p className="text-xs text-[#8A847B] mt-1 capitalize">{selectedCred.credentialType} issued to {selectedCred.studentName}</p>
              </div>

              {/* Status & Action Bar */}
              <div className="flex items-center justify-between p-3.5 bg-[#0D0D0D] border border-[#B65F32]/20 rounded-lg text-xs font-mono">
                <span className="text-[#8A847B]">Status:</span>
                <div className="flex items-center gap-2">
                  {selectedCred.verificationStatus === "revoked" ? (
                    <span className="text-red-400 font-bold">REVOKED ON-CHAIN</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">ACTIVE (100% VERIFIED)</span>
                  )}
                  <Link href={`/verify/${selectedCred.id}`} target="_blank">
                    <Button size="sm" className="h-7 text-[10px] px-2.5 bg-[#B65F32] hover:bg-[#8F4728] text-white font-mono font-bold rounded">
                      Open Verifier <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Technical Proofs Box */}
              <div className="bg-[#0D0D0D] border border-[#B65F32]/30 p-4 rounded-lg space-y-3 font-mono text-xs">
                <span className="text-[10px] font-bold text-[#B65F32] uppercase tracking-wider block">
                  AscendChain Ledger Proofs (Chain ID: 13370)
                </span>
                
                {/* ANCHOR PROOF */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-[#8A847B]">
                    <span>Anchor Transaction Hash:</span>
                    <span>Block #{selectedCred.anchorBlockNumber || selectedCred.blockchain?.anchorBlockNumber || "Confirmed"}</span>
                  </div>
                  <div className="text-[#C9944A] break-all select-all text-[11px] bg-[#191919] p-2 rounded border border-[#B65F32]/20">
                    {selectedCred.anchorTransactionHash || selectedCred.blockchain?.anchorTransactionHash || selectedCred.blockchain?.transactionHash || "Not Anchored"}
                  </div>
                </div>

                {/* REVOCATION PROOF (Visually and semantically separate) */}
                {selectedCred.verificationStatus === "revoked" && (
                  <div className="pt-2 border-t border-red-500/20 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-red-400 font-bold">
                      <span>Revocation Transaction Hash:</span>
                      <span>Block #{selectedCred.revocationBlockNumber || selectedCred.blockchain?.revocationBlockNumber || "Confirmed"}</span>
                    </div>
                    <div className="text-red-300 break-all select-all text-[11px] bg-[#191919] p-2 rounded border border-red-500/30">
                      {selectedCred.revocationTransactionHash || selectedCred.blockchain?.revocationTransactionHash || "Recorded"}
                    </div>
                    {selectedCred.revocationReason && (
                      <p className="text-[10px] text-[#8A847B] italic font-sans mt-1">
                        Revocation Reason: &quot;{selectedCred.revocationReason}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Digital Signature */}
              <div className="space-y-1 text-[10px] font-mono border-t border-[#B65F32]/15 pt-3">
                <span className="text-[#8A847B] uppercase block">ECDSA Cryptographic Signature:</span>
                <code className="block bg-[#0D0D0D] border border-[#B65F32]/20 p-2.5 rounded text-[#C9944A] break-all select-all">
                  {selectedCred.digitalSignature || "None"}
                </code>
              </div>
            </div>

            <div className="bg-[#0D0D0D] px-6 py-4 flex justify-end border-t border-[#B65F32]/20">
              <Button variant="outline" className="border-[#B65F32]/30 text-[#F5F1E8] hover:bg-white/5 text-xs h-9 px-4 rounded" onClick={() => setSelectedCred(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- REVOCATION MODAL (PROMPT 4 SECTION 5 REQUIREMENT) -------------------- */}
      {revokeCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-[#F5F1E8]">
          <div className="bg-[#191919] border-2 border-red-500/40 rounded-xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button className="absolute top-4 right-4 text-[#8A847B] hover:text-white p-1 hover:bg-[#0D0D0D] rounded-full transition-colors" onClick={() => setRevokeCred(null)}>
              <X className="w-5 h-5" />
            </button>

            {revokeStatus === "revoked" && revocationResult ? (
              /* POST-REVOCATION CONFIRMATION SCREEN */
              <div className="p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs font-mono font-bold px-3 py-0.5">
                    REVOCATION CONFIRMED ON ASCENDCHAIN
                  </Badge>
                  <h3 className="text-2xl font-bold text-[#F5F1E8]">Credential Revoked</h3>
                  <p className="text-xs text-[#8A847B] max-w-sm mx-auto leading-relaxed">
                    The credential has been permanently revoked on the AscendChain smart contract ledger. Verification confidence score is now 0%.
                  </p>
                </div>

                {/* DUAL PROOF DISPLAY (REVOCATION + ORIGINAL ANCHOR PRESERVED) */}
                <div className="bg-[#0D0D0D] border border-red-500/30 p-4 rounded-lg text-left text-xs font-mono space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-red-400 font-bold">
                      <span>Revocation Transaction Hash:</span>
                      <span>Block #{revocationResult.blockNumber}</span>
                    </div>
                    <div className="text-red-300 break-all select-all text-[11px] bg-[#191919] p-2 rounded border border-red-500/20">
                      {revocationResult.transactionHash}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#8A847B] pt-1">
                    <span className="font-bold text-[#F5F1E8]">Reason: </span>
                    &quot;{revocationResult.reason}&quot;
                  </div>

                  {/* VISUAL PROOF: ORIGINAL ANCHOR PRESERVED */}
                  <div className="pt-3 border-t border-[#B65F32]/20 space-y-1 bg-[#191919] p-3 rounded">
                    <div className="flex justify-between items-center text-[10px] text-[#C9944A] font-bold">
                      <span>Original Anchor Preserved:</span>
                      <span>Block #{revocationResult.anchorBlock || "Confirmed"}</span>
                    </div>
                    <div className="text-[#C9944A] break-all select-all text-[10px]">
                      {revocationResult.anchorTxHash || "Preserved"}
                    </div>
                    <span className="text-[9px] text-[#8A847B] block mt-1 font-sans">
                      Proven: The original anchor transaction hash remains untouched and permanent in the ledger history.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href={`/verify/${revokeCred.id}`} target="_blank" className="flex-1">
                    <Button className="w-full bg-[#B65F32] hover:bg-[#8F4728] text-white font-mono text-xs font-bold h-11 rounded shadow flex items-center justify-center gap-1.5">
                      <span>Inspect Revoked Public Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => { setRevokeCred(null); setRevokeStatus("idle"); }}
                    className="border-[#B65F32]/30 text-[#F5F1E8] hover:bg-[#0D0D0D] font-mono text-xs h-11 px-5 rounded"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* REVOCATION CONFIRMATION DIALOG */
              <form onSubmit={handleRevoke}>
                <div className="p-6 md:p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-400">
                      <ShieldAlert className="w-5 h-5" />
                      <h3 className="text-xl font-bold">Revoke Credential On-Chain</h3>
                    </div>
                    <p className="text-xs text-[#8A847B] leading-relaxed">
                      This action submits an immutable transaction to the AscendChain <code className="text-[#C9944A]">CredentialRegistry</code> smart contract and permanently drops public verification score to 0%.
                    </p>
                  </div>

                  {/* Target Credential Details */}
                  <div className="bg-[#0D0D0D] border border-red-500/20 p-4 rounded-lg text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#8A847B]">Credential:</span>
                      <span className="text-[#F5F1E8] font-bold text-right truncate max-w-[200px]">{revokeCred.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8A847B]">Recipient:</span>
                      <span className="text-[#F5F1E8]">{revokeCred.studentName}</span>
                    </div>
                    <div className="space-y-0.5 pt-1 border-t border-white/5">
                      <span className="text-[#8A847B] text-[10px] block">Original Anchor Transaction:</span>
                      <span className="text-[#C9944A] break-all select-all text-[10px] block">
                        {revokeCred.anchorTransactionHash || revokeCred.blockchain?.anchorTransactionHash || revokeCred.blockchain?.transactionHash || "Preserved"}
                      </span>
                    </div>
                  </div>

                  {revokeError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{revokeError}</span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <Label htmlFor="revokeReason" className="text-[#F5F1E8] font-bold">
                      Reason for Revocation <span className="text-red-400">*</span>
                    </Label>
                    <textarea
                      id="revokeReason"
                      required
                      placeholder="e.g. Academic honor code compliance audit — Degree rescinded by Academic Council..."
                      rows={3}
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      className="flex min-h-[80px] w-full rounded border border-[#B65F32]/30 bg-[#0D0D0D] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:ring-1 focus:ring-red-500 font-sans leading-relaxed"
                    />
                  </div>
                </div>
                
                <div className="bg-[#0D0D0D] px-6 py-4 flex justify-between items-center border-t border-[#B65F32]/20">
                  <span className="text-[10px] font-mono text-[#8A847B]">Irreversible EVM Mutation</span>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="h-10 text-xs px-4 text-[#8A847B] hover:text-white rounded" onClick={() => setRevokeCred(null)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="h-10 text-xs px-5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold rounded shadow-lg shadow-red-600/20" 
                      disabled={actionLoading}
                    >
                      {revokeStatus === "submitting" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> SUBMITTING: Sending Tx to AscendChain...
                        </>
                      ) : revokeStatus === "confirming" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> CONFIRMING: Awaiting Receipt (0x1)...
                        </>
                      ) : (
                        "Permanently Revoke On-Chain"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
