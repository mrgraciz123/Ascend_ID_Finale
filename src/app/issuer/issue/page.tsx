"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CredentialService } from "@/services/credential";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ArrowLeft, 
  Copy, 
  Check,
  UploadCloud,
  FileText,
  ShieldAlert,
  BrainCircuit,
  Maximize2,
  ExternalLink,
  Sparkles,
  Database
} from "lucide-react";
import Link from "next/link";

export default function IssueCredentialPage() {
  const { currentUser } = useAuth();
  const [issuerProfile, setIssuerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [issueStatus, setIssueStatus] = useState<"idle" | "issuing" | "anchoring" | "confirming" | "anchored" | "failed">("idle");
  const [success, setSuccess] = useState<boolean>(false);
  const [issuedId, setIssuedId] = useState<string>("");
  const [issuedTxHash, setIssuedTxHash] = useState<string>("");
  const [issuedBlock, setIssuedBlock] = useState<number | null>(null);
  const [issuedHash, setIssuedHash] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Upload and AI state
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [documentFraudReport, setDocumentFraudReport] = useState<any>(null);

  // Form Fields
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credentialType, setCredentialType] = useState<any>("degree");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [isNeverExpired, setIsNeverExpired] = useState(true);
  const [issuerWallet, setIssuerWallet] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) return;
      const profileSnap = await getDoc(doc(db, "issuers", currentUser.uid));
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setIssuerProfile(data);
        if (data.walletAddress) {
          setIssuerWallet(data.walletAddress);
        }
        
        if (data.issuerType === "university") {
          setCredentialType("degree");
        } else if (data.issuerType === "company") {
          setCredentialType("internship");
        } else if (data.issuerType === "hackathon") {
          setCredentialType("achievement");
        } else if (data.issuerType === "certifier") {
          setCredentialType("certification");
        }
      } else {
        // Fallback profile if user document in issuers collection is empty
        setIssuerProfile({
          name: currentUser.displayName || "IIT Bombay",
          issuerType: "university",
          walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        });
        setIssuerWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      }
    }
    loadProfile();
  }, [currentUser]);

  // Quick Auto-Fill for Judge 60-second Demo
  const fillSampleData = () => {
    setStudentName("Aarav Sharma");
    setStudentEmail(`aarav.${Date.now().toString().slice(-4)}@alumni.iitb.ac.in`);
    setTitle("Bachelor of Technology in Computer Science & Engineering");
    setDescription("Conferred for distinguished completion of distributed systems, applied cryptography, and decentralized ledger protocols.");
    setCredentialType("degree");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setIsNeverExpired(true);
    setExpiryDate("");
    if (!issuerWallet) {
      setIssuerWallet("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus("Uploading document to secure CDN...");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setUploadStatus("Running AI OCR Metadata Extraction & Fraud Audit...");
      const response = await fetch("/api/credentials/extract-metadata", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to process certificate document");
      }

      setDocumentUrl(data.documentUrl);
      setDocumentFraudReport(data.fraudAnalysis);

      const meta = data.extractedMetadata;
      if (meta.studentName) setStudentName(meta.studentName);
      if (meta.studentEmail) setStudentEmail(meta.studentEmail);
      if (meta.title) setTitle(meta.title);
      if (meta.description) setDescription(meta.description);
      if (meta.credentialType) setCredentialType(meta.credentialType);
      if (meta.issueDate) setIssueDate(meta.issueDate);
      if (meta.expiryDate) {
        if (meta.expiryDate.toLowerCase() === "never") {
          setIsNeverExpired(true);
          setExpiryDate("");
        } else {
          setIsNeverExpired(false);
          setExpiryDate(meta.expiryDate);
        }
      }
      setUploadStatus("");
    } catch (err: any) {
      console.error("AI document upload error:", err);
      setErrorMsg(err.message || "Failed to analyze document file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    setIssueStatus("issuing");
    setErrorMsg("");

    try {
      setIssueStatus("anchoring");
      const result = await CredentialService.issueCredential({
        issuerId: currentUser.uid,
        issuerName: issuerProfile?.name || "IIT Bombay",
        issuerType: issuerProfile?.issuerType || "university",
        studentName,
        studentEmail,
        title,
        description,
        credentialType,
        issueDate,
        expiryDate: isNeverExpired ? "Never" : expiryDate,
        issuerWallet: issuerWallet || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        documentUrl,
        documentFraudReport
      });

      if (result.success && result.id) {
        setIssueStatus("confirming");
        setSuccess(true);
        setIssuedId(result.id);
        setIssuedTxHash(result.anchorTransactionHash || result.transactionHash || "");
        setIssuedBlock(result.blockNumber || null);
        setIssuedHash(result.metadataHash || "");
        setIssueStatus("anchored");
        
        // Reset form
        setStudentName("");
        setStudentEmail("");
        setTitle("");
        setDescription("");
        setExpiryDate("");
        setIsNeverExpired(true);
        setDocumentUrl("");
        setDocumentFraudReport(null);
      } else {
        setIssueStatus("failed");
        setErrorMsg(result.error || "An error occurred while issuing and anchoring credential.");
      }
    } catch (err: any) {
      setIssueStatus("failed");
      setErrorMsg(err.message || "An unexpected error occurred during issuance.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text: string, type: "link" | "hash" | "tx" | "id") => {
    navigator.clipboard.writeText(text);
    if (type === "link") {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else if (type === "tx") {
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } else if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-16 font-sans text-[#F5F1E8]">
      {/* Top Breadcrumb & Judge Journey Quick Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#B65F32]/20 pb-4">
        <Link href="/issuer/dashboard" className="text-xs text-[#8A847B] hover:text-[#F5F1E8] flex items-center gap-1.5 transition-colors font-mono">
          <ArrowLeft className="w-4 h-4" /> Back to Issuer Dashboard
        </Link>
        <div className="flex items-center gap-2 bg-[#191919] border border-[#B65F32]/30 px-3 py-1.5 rounded-lg text-[11px] font-mono">
          <span className="text-[#B65F32] font-bold">Judge Demo Flow:</span>
          <span className="text-[#F5F1E8]">1. Issue & Anchor</span>
          <span className="text-[#8A847B]">→</span>
          <span className="text-[#8A847B]">2. Public Verify</span>
          <span className="text-[#8A847B]">→</span>
          <span className="text-[#8A847B]">3. Revoke</span>
          <span className="text-[#8A847B]">→</span>
          <span className="text-[#8A847B]">4. Public Revoked</span>
        </div>
      </div>

      {!success ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-[#191919] border border-[#B65F32]/30 relative rounded-xl shadow-2xl overflow-hidden">
              <CardHeader className="p-6 md:p-8 pb-4 border-b border-[#B65F32]/20">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-[#B65F32] font-bold">Step 1 of 4</span>
                    <CardTitle className="text-2xl font-bold text-[#F5F1E8] mt-0.5">Create & Anchor Credential</CardTitle>
                    <CardDescription className="text-xs text-[#8A847B] mt-1">
                      Confer credential and immutably anchor the SHA-256 metadata hash onto AscendChain Devnet.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillSampleData}
                    className="border-[#B65F32]/40 bg-[#0D0D0D] hover:bg-[#B65F32]/15 text-[#C9944A] text-xs font-mono font-bold h-8 px-3 rounded shrink-0 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C9944A]" />
                    Auto-Fill Demo
                  </Button>
                </div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 md:p-8 space-y-6">
                  {/* Error Alert */}
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg flex items-center gap-3 text-xs">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* 1. Recipient Information */}
                  <div className="space-y-4 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B65F32] font-bold block">
                      1. Recipient Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="studentName" className="text-[#F5F1E8] font-bold">Recipient Full Name</Label>
                        <Input
                          id="studentName"
                          placeholder="e.g. Aarav Sharma"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="bg-[#0D0D0D] border-[#B65F32]/25 text-[#F5F1E8] h-10 rounded focus-visible:ring-[#B65F32]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="studentEmail" className="text-[#F5F1E8] font-bold">Recipient Email</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          placeholder="student@university.edu"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          className="bg-[#0D0D0D] border-[#B65F32]/25 text-[#F5F1E8] h-10 rounded focus-visible:ring-[#B65F32]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Credential Parameters */}
                  <div className="space-y-4 pt-4 border-t border-[#B65F32]/15 text-xs">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B65F32] font-bold block">
                      2. Credential Parameters
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="credentialType" className="text-[#F5F1E8] font-bold">Credential Type</Label>
                        <select
                          id="credentialType"
                          value={credentialType}
                          onChange={(e) => setCredentialType(e.target.value as any)}
                          className="flex h-10 w-full rounded border border-[#B65F32]/25 bg-[#0D0D0D] px-3 py-2 text-xs text-[#F5F1E8] focus:outline-none focus:ring-1 focus:ring-[#B65F32] cursor-pointer font-sans"
                        >
                          <option value="degree">Graduation Degree</option>
                          <option value="diploma">Diploma</option>
                          <option value="internship">Internship Certificate</option>
                          <option value="experience">Experience Letter</option>
                          <option value="achievement">Hackathon / Award</option>
                          <option value="certification">Course Certification</option>
                          <option value="badge">Merit Badge</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-[#F5F1E8] font-bold">Credential Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Bachelor of Technology in Computer Science"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-[#0D0D0D] border-[#B65F32]/25 text-[#F5F1E8] h-10 rounded focus-visible:ring-[#B65F32]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-[#F5F1E8] font-bold">Description / Conferred Honors</Label>
                      <textarea
                        id="description"
                        required
                        placeholder="Detail conferring institution, honors, or specializations..."
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex w-full rounded border border-[#B65F32]/25 bg-[#0D0D0D] p-3 text-xs text-[#F5F1E8] focus:outline-none focus:ring-1 focus:ring-[#B65F32] font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="issueDate" className="text-[#F5F1E8] font-bold">Issue Date</Label>
                        <Input
                          id="issueDate"
                          type="date"
                          required
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="bg-[#0D0D0D] border-[#B65F32]/25 text-[#F5F1E8] h-10 rounded focus-visible:ring-[#B65F32]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="expiryDate" className="text-[#F5F1E8] font-bold">Expiration Date</Label>
                          <label className="text-[10px] text-[#8A847B] flex items-center gap-1.5 cursor-pointer font-mono">
                            <input
                              type="checkbox"
                              checked={isNeverExpired}
                              onChange={(e) => setIsNeverExpired(e.target.checked)}
                              className="rounded border-[#B65F32]/40 bg-[#0D0D0D]"
                            />
                            Never Expires
                          </label>
                        </div>
                        <Input
                          id="expiryDate"
                          type="date"
                          disabled={isNeverExpired}
                          required={!isNeverExpired}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="bg-[#0D0D0D] border-[#B65F32]/25 text-[#F5F1E8] disabled:opacity-30 h-10 rounded focus-visible:ring-[#B65F32]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Signatory Authority & Ledger Proof Info */}
                  <div className="space-y-3 pt-4 border-t border-[#B65F32]/15 text-xs font-mono">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#B65F32] font-bold block">
                      3. Signatory Authority & AscendChain Anchor
                    </span>
                    <div className="bg-[#0D0D0D] border border-[#B65F32]/20 p-3.5 rounded-lg space-y-2">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#8A847B]">Issuing Authority:</span>
                        <span className="text-[#F5F1E8] font-bold">{issuerProfile?.name || "IIT Bombay"}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#8A847B]">Network:</span>
                        <span className="text-[#C9944A] font-bold">AscendChain Devnet (Chain ID: 13370)</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-[#8A847B]">Authorized Signer Wallet:</span>
                        <span className="text-[#F5F1E8] truncate max-w-[200px]" title={issuerWallet}>
                          {issuerWallet || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Document Upload */}
                  <div className="space-y-2 pt-4 border-t border-[#B65F32]/15 text-xs">
                    <Label className="text-[#8A847B] font-mono text-[10px] uppercase font-bold">Optional: Attach Certificate Document (PDF/PNG/JPG)</Label>
                    <div className="border border-dashed border-[#B65F32]/30 rounded-lg p-4 bg-[#0D0D0D] text-center hover:border-[#B65F32]/60 transition-all">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 className="w-6 h-6 text-[#B65F32] animate-spin" />
                          <span className="text-xs text-[#8A847B] font-mono animate-pulse">{uploadStatus}</span>
                        </div>
                      ) : documentUrl ? (
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-[#C9944A] font-mono truncate">Attached: {documentUrl.slice(-25)}</span>
                          <label className="text-xs text-[#B65F32] hover:underline cursor-pointer font-bold">
                            Replace File
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex items-center justify-center gap-2 py-2">
                          <UploadCloud className="w-5 h-5 text-[#B65F32]" />
                          <span className="text-xs text-[#8A847B]">Browse file for AI OCR & Fraud Analysis (Optional)</span>
                          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between items-center p-6 md:p-8 pt-4 border-t border-[#B65F32]/20">
                  <span className="text-[10px] font-mono text-[#8A847B]">AscendChain EVM State Mutation</span>
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="bg-[#B65F32] hover:bg-[#8F4728] text-white h-11 px-8 text-xs font-bold rounded font-mono shadow-lg transition-transform hover:scale-[1.01]"
                  >
                    {issueStatus === "issuing" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> ISSUING: Creating Cryptographic Signature...
                      </>
                    ) : issueStatus === "anchoring" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> ANCHORING: Submitting to AscendChain...
                      </>
                    ) : issueStatus === "confirming" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> CONFIRMING: Awaiting Receipt Status (0x1)...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" /> Issue & Anchor to AscendChain
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* AI Document Analysis Sidecard (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {documentFraudReport ? (
              <Card className="bg-[#191919] border border-[#B65F32]/30 rounded-xl shadow-lg overflow-hidden">
                <CardHeader className="p-6 pb-3 border-b border-[#B65F32]/20">
                  <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-[#F5F1E8] flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-[#B65F32]" />
                    AI Document Fraud Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs font-mono">
                  <div className="flex justify-between items-center p-3 bg-[#0D0D0D] border border-[#B65F32]/20 rounded">
                    <span className="text-[#8A847B]">Risk Assessment:</span>
                    <Badge className="bg-[#C9944A]/15 text-[#C9944A] border-[#C9944A]/30">
                      {documentFraudReport.overallRisk} Risk
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[#8A847B]">
                      <span>OCR Confidence:</span>
                      <span className="text-[#F5F1E8] font-bold">{documentFraudReport.ocrConfidence}%</span>
                    </div>
                    <div className="flex justify-between text-[#8A847B]">
                      <span>Altered Text Detection:</span>
                      <span className="text-[#F5F1E8] font-bold">{documentFraudReport.alteredText}%</span>
                    </div>
                  </div>
                  <p className="text-[#8A847B] bg-[#0D0D0D] p-3 rounded border border-[#B65F32]/10 font-sans leading-relaxed text-xs">
                    {documentFraudReport.explanation}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#191919] border border-[#B65F32]/20 p-6 rounded-xl text-center space-y-3">
                <Database className="w-8 h-8 text-[#B65F32] mx-auto opacity-70" />
                <h3 className="text-sm font-bold text-[#F5F1E8]">Direct AscendChain Anchoring</h3>
                <p className="text-xs text-[#8A847B] leading-relaxed">
                  Upon issuance, the credential payload is canonically normalized, hashed with SHA-256, and submitted via smart contract transaction to the <code className="text-[#C9944A]">CredentialRegistry</code>.
                </p>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* POST-ISSUANCE CONFIRMATION SCREEN (PROMPT 4 SECTION 3 REQUIREMENT) */
        <Card className="bg-[#191919] border-2 border-[#C9944A]/50 max-w-2xl mx-auto p-8 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden rounded-xl">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-[#C9944A]/10 border border-[#C9944A]/30 text-[#C9944A] rounded-xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <Badge className="bg-[#C9944A]/15 text-[#C9944A] border-[#C9944A]/30 text-xs font-mono font-bold px-3 py-0.5">
                ON-CHAIN CONFIRMED (0x1)
              </Badge>
              <h1 className="text-3xl font-extrabold text-[#F5F1E8] tracking-tight">CREDENTIAL ANCHORED</h1>
              <p className="text-xs text-[#8A847B] max-w-md mx-auto leading-relaxed">
                The cryptographic metadata SHA-256 hash has been immutably registered on AscendChain Devnet with confirmed block receipt.
              </p>
            </div>
          </div>

          {/* Full Proof Grid */}
          <div className="bg-[#0D0D0D] border border-[#B65F32]/30 p-5 rounded-lg text-xs font-mono space-y-3.5">
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-[#B65F32]/15">
              <span className="text-[#8A847B] uppercase font-bold text-[10px] tracking-wider">Credential ID</span>
              <div className="flex items-center gap-2">
                <span className="text-[#F5F1E8] font-bold truncate max-w-[240px] select-all">{issuedId}</span>
                <button onClick={() => copyText(issuedId, "id")} className="text-[#8A847B] hover:text-[#F5F1E8] p-1">
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {issuedHash && (
              <div className="space-y-1 pb-2 border-b border-[#B65F32]/15">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A847B] uppercase font-bold text-[10px] tracking-wider">Metadata SHA-256 Hash</span>
                  <button onClick={() => copyText(issuedHash, "hash")} className="text-[#8A847B] hover:text-[#C9944A] text-[10px] flex items-center gap-1">
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedHash ? "Copied" : "Copy Hash"}
                  </button>
                </div>
                <div className="text-[#C9944A] break-all select-all text-[11px] bg-[#191919] p-2 rounded border border-[#B65F32]/20">
                  {issuedHash}
                </div>
              </div>
            )}

            {issuedTxHash && (
              <div className="space-y-1 pb-2 border-b border-[#B65F32]/15">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A847B] uppercase font-bold text-[10px] tracking-wider">Anchor Transaction Hash</span>
                  <button onClick={() => copyText(issuedTxHash, "tx")} className="text-[#8A847B] hover:text-[#B65F32] text-[10px] flex items-center gap-1">
                    {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedTx ? "Copied" : "Copy TX"}
                  </button>
                </div>
                <div className="text-[#B65F32] break-all select-all text-[11px] bg-[#191919] p-2 rounded border border-[#B65F32]/20">
                  {issuedTxHash}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[#8A847B] uppercase font-bold text-[10px] block">Anchor Block</span>
                <span className="text-[#F5F1E8] font-bold text-sm block mt-0.5">#{issuedBlock || "Confirmed"}</span>
              </div>
              <div>
                <span className="text-[#8A847B] uppercase font-bold text-[10px] block">Network</span>
                <span className="text-[#C9944A] font-bold text-xs block mt-0.5">AscendChain (Chain 13370)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#B65F32]/15">
              <div>
                <span className="text-[#8A847B] uppercase font-bold text-[10px] block">Issuer Authority</span>
                <span className="text-[#F5F1E8] font-bold block mt-0.5">{issuerProfile?.name || "IIT Bombay"}</span>
              </div>
              <div>
                <span className="text-[#8A847B] uppercase font-bold text-[10px] block">Verification Status</span>
                <span className="text-emerald-400 font-bold block mt-0.5">ACTIVE (100% Verified)</span>
              </div>
            </div>
          </div>

          {/* Prominent Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href={`/verify/${issuedId}`} className="flex-1">
              <Button className="w-full bg-[#B65F32] hover:bg-[#8F4728] text-white h-12 text-sm font-mono font-bold rounded shadow-xl flex items-center justify-center gap-2">
                <span>View Public Verification</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => copyText(`${window.location.origin}/verify/${issuedId}`, "link")}
              className="border-[#B65F32]/40 bg-[#0D0D0D] hover:bg-[#191919] text-[#F5F1E8] h-12 px-5 text-xs font-mono font-bold rounded"
            >
              {copiedLink ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Copy className="w-4 h-4 mr-1.5 text-[#B65F32]" />}
              {copiedLink ? "Link Copied!" : "Copy Public Link"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setSuccess(false); setIssueStatus("idle"); }}
              className="hover:bg-white/5 text-[#8A847B] hover:text-[#F5F1E8] h-12 px-4 text-xs font-mono rounded"
            >
              Issue Another
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
