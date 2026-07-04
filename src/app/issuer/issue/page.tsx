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
  QrCode, 
  Copy, 
  Check,
  UploadCloud,
  FileText,
  ShieldAlert,
  BrainCircuit,
  Maximize2,
  Calendar,
  Sparkles,
  Info
} from "lucide-react";
import Link from "next/link";

export default function IssueCredentialPage() {
  const { currentUser } = useAuth();
  const [issuerProfile, setIssuerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [issuedId, setIssuedId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [copied, setCopied] = useState(false);

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
        
        // Auto select a smart credential type based on issuer type
        if (data.issuerType === "university") {
          setCredentialType("degree");
        } else if (data.issuerType === "company") {
          setCredentialType("internship");
        } else if (data.issuerType === "hackathon") {
          setCredentialType("achievement");
        } else if (data.issuerType === "certifier") {
          setCredentialType("certification");
        }
      }
    }
    loadProfile();
  }, [currentUser]);

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

      // Populate Form Fields from AI OCR extraction
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
    if (!currentUser || !issuerProfile) return;

    setLoading(true);
    setErrorMsg("");

    const result = await CredentialService.issueCredential({
      issuerId: currentUser.uid,
      issuerName: issuerProfile.name,
      issuerType: issuerProfile.issuerType,
      studentName,
      studentEmail,
      title,
      description,
      credentialType,
      issueDate,
      expiryDate: isNeverExpired ? "Never" : expiryDate,
      issuerWallet,
      documentUrl,
      documentFraudReport
    });

    if (result.success && result.id) {
      setSuccess(true);
      setIssuedId(result.id);
      
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
      setErrorMsg(result.error || "An unknown error occurred while issuing credential.");
    }
    setLoading(false);
  };

  const copyVerificationLink = () => {
    const origin = window.location.origin;
    const link = `${origin}/verify/${issuedId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12 font-sans">
      {/* Back button */}
      <div>
        <Link href="/issuer/dashboard" className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors w-fit font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {!success ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-[#111827] border border-white/5 relative rounded-[20px] shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[20px] pointer-events-none" />
              <CardHeader className="p-6 md:p-8 pb-4">
                <CardTitle className="text-xl font-bold text-white">Issue Digital Credential</CardTitle>
                <CardDescription className="text-xs text-gray-400 mt-1">
                  Upload a certificate document or enter the metadata to cryptographically anchor it.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="p-6 md:p-8 pt-0 space-y-6">
                  {/* Error Alert */}
                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-xs">
                      <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Document Upload Area */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 font-semibold text-xs">Original Document Upload (PDF, PNG, JPG)</Label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-6 bg-[#0B1020]/40 hover:bg-[#0B1020]/60 hover:border-blue-500/30 transition-all text-center relative flex flex-col items-center justify-center min-h-[140px]">
                      {uploading ? (
                        <div className="space-y-3 flex flex-col items-center justify-center">
                          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                          <span className="text-xs text-gray-400 font-mono animate-pulse">{uploadStatus}</span>
                        </div>
                      ) : documentUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-white">Document Uploaded Successfully</span>
                          <span className="text-[10px] text-gray-400 truncate max-w-[200px] font-mono">Url: {documentUrl.substring(0, 30)}...</span>
                          <label className="text-[10px] text-blue-400 hover:underline cursor-pointer mt-2.5 font-bold">
                            Replace File
                            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2.5 w-full">
                          <UploadCloud className="w-8 h-8 text-white/40" />
                          <div>
                            <span className="text-xs font-bold text-white block">Drop certificate file or browse</span>
                            <span className="text-[10px] text-gray-500 mt-0.5 block">Supports PDF, PNG, JPG up to 10MB</span>
                          </div>
                          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Student Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName" className="text-gray-300 font-semibold">Full Name</Label>
                        <Input
                          id="studentName"
                          placeholder="e.g. Sarah Connor"
                          required
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="bg-[#0B1020]/50 text-white border-white/10 h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentEmail" className="text-gray-300 font-semibold">Email Address</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          placeholder="student@university.edu"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          className="bg-[#0B1020]/50 text-white border-white/10 h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Settings */}
                  <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Blockchain Verification</h3>
                    <div className="space-y-2">
                      <Label htmlFor="issuerWallet" className="text-gray-300 font-semibold">Authorized Signatory Wallet Address</Label>
                      <Input
                        id="issuerWallet"
                        placeholder="e.g. 0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
                        required
                        value={issuerWallet}
                        onChange={(e) => setIssuerWallet(e.target.value)}
                        className="bg-[#0B1020]/50 text-white border-white/10 h-10 rounded-xl font-mono"
                      />
                      <p className="text-[9px] text-gray-500 font-normal">This wallet will anchor the cryptographic transaction on the Base Sepolia ledger.</p>
                    </div>
                  </div>

                  {/* Credential Details */}
                  <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Credential Metadata</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-gray-300 font-semibold">Credential Type</Label>
                        <select
                          id="type"
                          value={credentialType}
                          onChange={(e) => setCredentialType(e.target.value as any)}
                          className="flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-[#0B1020]/50 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option className="bg-[#111827] text-white" value="degree">Graduation Degree</option>
                          <option className="bg-[#111827] text-white" value="diploma">Diploma</option>
                          <option className="bg-[#111827] text-white" value="experience">Experience Letter</option>
                          <option className="bg-[#111827] text-white" value="internship">Internship Certificate</option>
                          <option className="bg-[#111827] text-white" value="achievement">Hackathon Winner</option>
                          <option className="bg-[#111827] text-white" value="certification">Course Certification</option>
                          <option className="bg-[#111827] text-white" value="badge">Merit Badge</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-300 font-semibold">Certificate Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Master of Science in AI"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-[#0B1020]/50 text-white border-white/10 h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-gray-300 font-semibold">Description & Context</Label>
                      <textarea
                        id="description"
                        placeholder="Specify the syllabus, grades, responsibilities, or criteria for earning this award..."
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-[#0B1020]/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Validity Dates */}
                  <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Validity Period</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="issueDate" className="text-gray-300 font-semibold">Issue Date</Label>
                        <Input
                          id="issueDate"
                          type="date"
                          required
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="bg-[#0B1020]/50 text-white border-white/10 h-10 rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="expiryDate" className="text-gray-300 font-semibold">Expiry Date</Label>
                          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setIsNeverExpired(!isNeverExpired)}>
                            <input
                              type="checkbox"
                              id="isNeverExpired"
                              checked={isNeverExpired}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 accent-blue-600 rounded border-white/10 bg-[#0B1020] cursor-pointer"
                            />
                            <label htmlFor="isNeverExpired" className="text-[10px] text-gray-400 cursor-pointer">No Expiry</label>
                          </div>
                        </div>
                        <Input
                          id="expiryDate"
                          type="date"
                          disabled={isNeverExpired}
                          required={!isNeverExpired}
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="bg-[#0B1020]/50 text-white border-white/10 disabled:opacity-35 h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3 p-6 md:p-8 pt-4 border-t border-white/5">
                  <Link href="/issuer/dashboard">
                    <Button type="button" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-10 px-6 text-xs rounded-xl font-bold">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-8 text-xs font-bold shadow-lg shadow-blue-600/20 rounded-xl transition-transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Anchoring on Base...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" /> Issue Credential
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* AI Audit Sidebar Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {documentFraudReport ? (
              <Card className="bg-[#111827] border border-white/5 overflow-hidden rounded-[20px] shadow-lg">
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-xs uppercase font-bold tracking-widest text-white flex items-center gap-2 font-mono">
                    <BrainCircuit className="w-5 h-5 text-blue-500" />
                    AI Document Analysis
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-400 mt-1">
                    OCR extraction confidence and structural fraud diagnostics.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4 text-xs">
                  {/* Overall Risk Level */}
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${
                    documentFraudReport.overallRisk === "High" 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : documentFraudReport.overallRisk === "Medium"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-60 block font-mono">Document Risk Level</span>
                      <span className="text-base font-bold uppercase mt-0.5 block tracking-wide">{documentFraudReport.overallRisk} Risk</span>
                    </div>
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 border-current">
                      {documentFraudReport.overallRisk === "High" ? (
                        <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
                      ) : (
                        <ShieldCheck className="w-4.5 h-4.5" />
                      )}
                    </div>
                  </div>

                  {/* AI Indicators List */}
                  <div className="space-y-3 border-t border-white/5 pt-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>OCR Confidence:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.ocrConfidence}%</span>
                      </div>
                      <div className="w-full bg-[#0B1020] rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${documentFraudReport.ocrConfidence}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Altered Text probability:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.alteredText}%</span>
                      </div>
                      <div className="w-full bg-[#0B1020] rounded-full h-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${documentFraudReport.alteredText}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Logo Consistency:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.logoConsistency}%</span>
                      </div>
                      <div className="w-full bg-[#0B1020] rounded-full h-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${documentFraudReport.logoConsistency}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Layout Anomalies:</span>
                        <span className="font-mono font-bold text-white">{documentFraudReport.layoutAnomalies}%</span>
                      </div>
                      <div className="w-full bg-[#0B1020] rounded-full h-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${documentFraudReport.layoutAnomalies}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation and Anomalies */}
                  <div className="space-y-3.5 border-t border-white/5 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block font-mono">AI Audit Explanation</span>
                      <p className="text-gray-400 mt-1.5 leading-relaxed bg-[#0B1020]/50 border border-white/5 p-3 rounded-xl">
                        {documentFraudReport.explanation}
                      </p>
                    </div>

                    {documentFraudReport.highlightedAnomalies?.length > 0 && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block font-mono">Flagged Anomalies</span>
                        <ul className="list-disc pl-4 text-red-400 mt-1.5 space-y-1">
                          {documentFraudReport.highlightedAnomalies.map((anom: string, idx: number) => (
                            <li key={idx}>{anom}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-[#111827] border border-white/5 border-dashed relative min-h-[300px] flex flex-col justify-center items-center p-6 text-center text-gray-500 text-xs rounded-[20px]">
                <BrainCircuit className="w-8 h-8 text-white/10 mb-3" />
                <span className="max-w-[240px] leading-relaxed">Upload a document to invoke AI OCR metadata extraction and visual fraud diagnostics analysis here automatically.</span>
              </Card>
            )}

            {/* Document Preview Card if available */}
            {documentUrl && (
              <Card className="bg-[#111827] border border-white/5 overflow-hidden rounded-[20px] shadow-lg">
                <CardHeader className="p-6 pb-3 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-xs uppercase font-bold tracking-widest text-white font-mono">Document Preview</CardTitle>
                    <CardDescription className="text-[9px] text-gray-500 mt-1">Cloudinary CDN Secure Asset</CardDescription>
                  </div>
                  <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="w-8 h-8 border-white/10 hover:bg-white/5 rounded-lg">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </Button>
                  </a>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {documentUrl.toLowerCase().endsWith(".pdf") ? (
                    <div className="w-full aspect-[1/1.3] bg-neutral-950 border border-white/10 rounded-xl flex items-center justify-center text-[10px] text-gray-500 flex-col gap-2 p-4">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <span>PDF Document Embedded</span>
                      <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        Open PDF in New Tab
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={documentUrl} 
                      alt="Certificate Preview" 
                      className="w-full rounded-xl border border-white/10 object-contain max-h-[400px] bg-neutral-950 shadow-inner"
                    />
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Success Screen */
        <Card className="bg-[#111827] border border-emerald-500/20 max-w-xl mx-auto text-center p-8 space-y-6 shadow-2xl relative overflow-hidden rounded-[20px]">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-medium text-white">Credential Anchored Successfully</h1>
            <p className="text-gray-400 text-xs">
              The digital credential has been registered on the Base Sepolia ledger.
            </p>
          </div>

          <div className="bg-[#0B1020]/60 border border-white/5 p-4 rounded-xl text-left space-y-3 font-mono text-xs text-gray-400">
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-gray-500 uppercase font-bold text-[9px] tracking-wider font-sans">Credential UUID</span>
              <span className="text-white truncate select-all">{issuedId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-gray-500 uppercase font-bold text-[9px] tracking-wider font-sans">Verification Link</span>
              <span className="text-blue-400 hover:underline truncate select-all">{`${window.location.origin}/verify/${issuedId}`}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="sm" variant="outline" className="border-white/10 bg-[#0B1020]/50 hover:bg-white/5 text-white h-10 px-5 rounded-xl font-bold text-xs" onClick={copyVerificationLink}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? "Verification Link Copied!" : "Copy Verifier URL"}
            </Button>
            <Button size="sm" onClick={() => setSuccess(false)} className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-xl font-bold text-xs shadow-md">
              Issue Another Certificate
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
