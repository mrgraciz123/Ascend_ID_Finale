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
  Info
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
  const [copiedId, setCopiedId] = useState(false);

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
    setSelectedCred(null); // Close view details if open
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
      // Reload list & reset modal
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
    setSelectedCred(null); // Close view details if open
  };

  // Submit Revocation
  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeCred) return;

    setActionLoading(true);
    const result = await CredentialService.revokeCredential(revokeCred.id, revokeReason);

    if (result.success) {
      await loadCredentials();
      setRevokeCred(null);
    } else {
      alert(result.error || "Failed to revoke credential");
    }
    setActionLoading(false);
  };

  // Helper copy link
  const copyLink = (id: string) => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(`${origin}/verify/${id}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filtered List calculation
  const filteredCredentials = credentials.filter((c) => {
    // 1. Search Query
    const nameMatch = c.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = c.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const titleMatch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const uuidMatch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const passesSearch = nameMatch || emailMatch || titleMatch || uuidMatch;

    // 2. Type Filter
    const passesType = filterType === "all" || c.credentialType === filterType;

    // 3. Status Filter
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
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Loading Directory...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-12 relative font-sans">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-display font-medium text-white tracking-tight">Credentials Directory</h1>
        <p className="text-gray-400 text-xs mt-1">Audit, edit, and manage all credentials issued by your organization.</p>
      </div>

      {/* Filters Bar */}
      <Card className="bg-[#111827] border border-white/5 shadow-lg rounded-[20px]">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
            <Input
              placeholder="Search candidate name, email, title, or UUID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0B1020]/50 border-white/10 pl-10 text-white w-full text-xs h-10 rounded-xl focus-visible:ring-blue-500"
            />
          </div>

          {/* Type Dropdown */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-[#0B1020]/50 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option className="bg-[#111827]" value="all">All Types</option>
              <option className="bg-[#111827]" value="degree">Degree</option>
              <option className="bg-[#111827]" value="diploma">Diploma</option>
              <option className="bg-[#111827]" value="experience">Experience</option>
              <option className="bg-[#111827]" value="internship">Internship</option>
              <option className="bg-[#111827]" value="achievement">Achievement</option>
              <option className="bg-[#111827]" value="certification">Certification</option>
              <option className="bg-[#111827]" value="badge">Badge</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-white/10 bg-[#0B1020]/50 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option className="bg-[#111827]" value="all">All Statuses</option>
              <option className="bg-[#111827]" value="active">Active / Valid</option>
              <option className="bg-[#111827]" value="revoked">Revoked</option>
              <option className="bg-[#111827]" value="expired">Expired</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Directory Table */}
      <Card className="bg-[#111827] border border-white/5 rounded-[20px] shadow overflow-hidden">
        <CardContent className="p-0">
          {filteredCredentials.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 text-white/10" />
              <p className="text-sm font-bold text-white">No credentials found</p>
              <p className="text-xs text-gray-500 mt-1">Try modifying your filters or search terms.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-gray-500 font-bold uppercase tracking-widest font-mono">
                    <th className="p-4 pl-6">Student</th>
                    <th className="p-4">Title / Type</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Issued On</th>
                    <th className="p-4">Expires On</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/90">
                  {filteredCredentials.map((cred) => {
                    const isCredRevoked = cred.verificationStatus === "revoked";
                    const isCredExpired = cred.expiryDate !== "Never" && new Date(cred.expiryDate) < new Date();
                    
                    return (
                      <tr key={cred.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-white">{cred.studentName}</p>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{cred.studentEmail}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-white">{cred.title}</p>
                          <Badge variant="outline" className="text-[9px] capitalize mt-1 border-white/10 text-gray-400 hover:none rounded">{cred.credentialType}</Badge>
                        </td>
                        <td className="p-4">
                          {isCredRevoked ? (
                            <Badge className="bg-red-500/10 border-red-500/20 text-red-400 font-bold text-[9px] hover:none rounded">Revoked</Badge>
                          ) : isCredExpired ? (
                            <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold text-[9px] hover:none rounded">Expired</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold text-[9px] hover:none rounded">Active</Badge>
                          )}
                        </td>
                        <td className="p-4 text-gray-400 font-mono text-[10px]">{cred.issueDate}</td>
                        <td className="p-4 text-gray-400 font-mono text-[10px]">{cred.expiryDate}</td>
                        <td className="p-4 text-right pr-6 space-x-1 whitespace-nowrap">
                          <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white" onClick={() => setSelectedCred(cred)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isCredRevoked && (
                            <>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/5 rounded-lg text-blue-400 hover:text-blue-300" onClick={() => handleOpenEdit(cred)}>
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/5 rounded-lg text-red-400 hover:text-red-300" onClick={() => handleOpenRevoke(cred)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-[20px] w-full max-w-xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors" onClick={() => setSelectedCred(null)}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 space-y-6">
              <div>
                <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 uppercase text-[9px] tracking-widest mb-1 hover:none rounded">
                  Verifiable Credential
                </Badge>
                <h3 className="text-lg font-bold text-white leading-tight">{selectedCred.title}</h3>
                <p className="text-xs text-gray-400 mt-1 capitalize">{selectedCred.credentialType} record</p>
              </div>

              {/* QR Panel */}
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 bg-white p-2 rounded-xl shrink-0 border border-white/5">
                  <img src={selectedCred.qrCodeUrl} alt="Verification QR Code" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-2 text-xs w-full">
                  <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider font-mono">Candidate details</span>
                  <p className="text-white font-bold text-sm leading-snug">{selectedCred.studentName}</p>
                  <p className="text-gray-400 text-xs font-mono">{selectedCred.studentEmail}</p>
                  <div className="flex gap-2 pt-1.5 w-full">
                    <Button size="sm" variant="outline" className="h-8 text-[10px] px-3 bg-[#0B1020]/50 border-white/10 text-white rounded-lg flex-1" onClick={() => copyLink(selectedCred.id)}>
                      {copiedId ? <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                      {copiedId ? "Copied!" : "Copy Link"}
                    </Button>
                    <Link href={`/verify/${selectedCred.id}`} target="_blank" className="flex-1">
                      <Button size="sm" className="w-full h-8 text-[10px] px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                        Inspect Ledger <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Info fields */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#0B1020]/60 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider font-mono">UUID</span>
                  <span className="font-mono text-white select-all break-all mt-1 block">{selectedCred.id}</span>
                </div>
                <div className="bg-[#0B1020]/60 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider font-mono">Status</span>
                  <span className="block mt-1">
                    {selectedCred.verificationStatus === "revoked" ? (
                      <span className="text-red-400 font-bold">Revoked</span>
                    ) : (selectedCred.expiryDate !== "Never" && new Date(selectedCred.expiryDate) < new Date()) ? (
                      <span className="text-amber-400 font-bold">Expired</span>
                    ) : (
                      <span className="text-emerald-400 font-bold">Valid</span>
                    )}
                  </span>
                </div>
                <div className="bg-[#0B1020]/60 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider font-mono">Issue Date</span>
                  <span className="text-white font-bold mt-1 block">{selectedCred.issueDate}</span>
                </div>
                <div className="bg-[#0B1020]/60 p-3 rounded-xl border border-white/5">
                  <span className="text-gray-500 block uppercase font-bold text-[9px] tracking-wider font-mono">Expiry Date</span>
                  <span className="text-white font-bold mt-1 block">{selectedCred.expiryDate}</span>
                </div>
              </div>

              {/* Digital Signature */}
              <div className="space-y-1.5 text-[10px] border-t border-white/5 pt-4">
                <span className="text-gray-500 block uppercase font-bold tracking-wider font-mono">Cryptographic Signature</span>
                <code className="block bg-[#0B1020]/60 border border-white/5 p-3 rounded-xl font-mono text-blue-400 break-all select-all leading-normal">
                  {selectedCred.digitalSignature}
                </code>
              </div>
            </div>
            
            <div className="bg-white/5 px-6 py-4 flex justify-end gap-2 border-t border-white/5">
              {selectedCred.verificationStatus !== "revoked" && (
                <>
                  <Button variant="outline" className="h-9 text-xs px-4 bg-[#0B1020]/50 border-white/10 text-white rounded-lg font-bold" onClick={() => handleOpenEdit(selectedCred)}>
                    Edit Metadata
                  </Button>
                  <Button className="h-9 text-xs px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold" onClick={() => handleOpenRevoke(selectedCred)}>
                    Revoke Certificate
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- EDIT MODAL -------------------- */}
      {editCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-[20px] w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors" onClick={() => setEditCred(null)}>
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleUpdate}>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Credential Metadata</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Modifying metadata will automatically re-sign the credential.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <Label htmlFor="editTitle" className="text-gray-300 font-semibold">Certificate Title</Label>
                    <Input
                      id="editTitle"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="bg-[#0B1020]/50 text-white border-white/10 h-10 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editDesc" className="text-gray-300 font-semibold">Description & Context</Label>
                    <textarea
                      id="editDesc"
                      required
                      rows={4}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-[#0B1020]/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <Label htmlFor="editExpiryDate" className="text-gray-300 font-semibold">Expiry Date</Label>
                      <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setEditNeverExpires(!editNeverExpires)}>
                        <input
                          type="checkbox"
                          id="edit-never"
                          checked={editNeverExpires}
                          onChange={() => {}}
                          className="rounded border-white/10 bg-neutral-900 text-blue-600 accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                        />
                        <label htmlFor="edit-never" className="text-xs text-gray-400 cursor-pointer">Never Expires</label>
                      </div>
                    </div>
                    <Input
                      id="editExpiryDate"
                      type="date"
                      disabled={editNeverExpires}
                      required={!editNeverExpires}
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="bg-[#0B1020]/50 text-white border-white/10 disabled:opacity-35 h-10 rounded-xl"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 px-6 py-4 flex justify-end gap-2 border-t border-white/5">
                <Button type="button" variant="ghost" className="h-9 text-xs px-4 text-gray-400 hover:text-white rounded-lg" onClick={() => setEditCred(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- REVOKE MODAL -------------------- */}
      {revokeCred && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111827] border border-white/10 rounded-[20px] w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors" onClick={() => setRevokeCred(null)}>
              <X className="w-5 h-5" />
            </button>
            <form onSubmit={handleRevoke}>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                    Revoke Credential
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Are you sure you want to revoke this credential? This action is permanent and will flag this credential as invalid publicly.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <Label htmlFor="revokeReason" className="text-gray-300 font-semibold">Reason for Revocation</Label>
                  <textarea
                    id="revokeReason"
                    required
                    placeholder="Provide a clear description for why this record is being revoked..."
                    rows={3}
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-xl border border-white/10 bg-[#0B1020]/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="bg-white/5 px-6 py-4 flex justify-end gap-2 border-t border-white/5">
                <Button type="button" variant="ghost" className="h-9 text-xs px-4 text-gray-400 hover:text-white rounded-lg" onClick={() => setRevokeCred(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Revoke Permanently"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
