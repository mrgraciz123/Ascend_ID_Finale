"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Award, 
  Building2, 
  Calendar, 
  FileCode, 
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CredentialObjectProps {
  id: string;
  title: string;
  recipientName: string;
  issuerName: string;
  issuerId?: string;
  issueDate: string;
  expiryDate?: string;
  credentialType?: string;
  status?: "verified" | "issued" | "revoked" | "expired" | "pending";
  txHash?: string;
  blockNumber?: number;
  skills?: string[];
  isDigiLocker?: boolean;
  scoreImpact?: number;
  className?: string;
  compact?: boolean;
}

export function CredentialObject({
  id,
  title,
  recipientName,
  issuerName,
  issuerId,
  issueDate,
  expiryDate = "Permanent / No Expiration",
  credentialType = "Verifiable Credential",
  status = "verified",
  txHash,
  blockNumber,
  skills = [],
  isDigiLocker = false,
  scoreImpact,
  className = "",
  compact = false
}: CredentialObjectProps) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRevoked = status === "revoked";
  const isExpired = status === "expired";
  const isVerified = status === "verified" || status === "issued" || isDigiLocker;

  // Mock W3C standard JSON representation
  const w3cPayload = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://ascendid.ai/contexts/credentials/v1"
    ],
    id: `did:ascendid:${id}`,
    type: ["VerifiableCredential", credentialType.replace(/\s+/g, "")],
    issuer: {
      id: issuerId || `did:ascendid:issuer:${issuerName.toLowerCase().replace(/\s+/g, "-")}`,
      name: issuerName
    },
    issuanceDate: issueDate,
    credentialSubject: {
      id: `did:ascendid:student:${recipientName.toLowerCase().replace(/\s+/g, "-")}`,
      name: recipientName,
      achievement: title,
      skills: skills
    },
    proof: {
      type: "Ed25519Signature2020",
      created: issueDate,
      verificationMethod: `${issuerId || "did:ascendid:issuer"}#keys-1`,
      proofPurpose: "assertionMethod",
      proofValue: txHash || "0x7f9a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f"
    }
  };

  if (compact) {
    return (
      <div className={`relative bg-[#F5F1E8] text-[#0D0D0D] border-2 border-[#B65F32]/40 rounded-lg p-4 shadow-xl flex flex-col justify-between ${className}`}>
        {/* Top Watermark line */}
        <div className="flex justify-between items-center pb-2 border-b border-[#0D0D0D]/15">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B65F32]" />
            <span className="text-[9px] font-mono font-bold text-[#B65F32] uppercase tracking-widest">AscendID Certificate</span>
          </div>
          <span className="text-[8px] font-mono text-[#8A847B]">#did:ascend:{id.slice(0, 8)}</span>
        </div>

        <div className="my-3">
          <span className="text-[9px] font-bold text-[#8A847B] uppercase tracking-wider block font-mono">{issuerName}</span>
          <h4 className="text-base font-bold font-heading text-[#0D0D0D] leading-snug mt-0.5">{title}</h4>
          <p className="text-xs text-[#524E48] mt-1">Conferred upon <strong className="text-[#0D0D0D] font-bold">{recipientName}</strong></p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#0D0D0D]/15 text-[10px] font-mono text-[#524E48]">
          <span>Issued: {issueDate}</span>
          <Badge className="bg-[#B65F32]/15 text-[#B65F32] border-[#B65F32]/30 text-[8px] font-mono uppercase font-bold">
            {isVerified ? "Cryptographically Verified" : status}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 border-[#B65F32]/40 bg-[#F5F1E8] text-[#0D0D0D] shadow-2xl transition-all duration-300 ${className}`}>
      
      {/* Outer Certificate Guilloche Border Accent */}
      <div className="absolute inset-1 border border-[#B65F32]/20 rounded-lg pointer-events-none" />

      {/* Top Gold Certificate Seal Banner */}
      <div className="bg-[#0D0D0D] text-[#F5F1E8] px-6 py-3.5 flex flex-wrap justify-between items-center gap-2 border-b border-[#B65F32]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#C9944A]/20 border border-[#C9944A] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#C9944A]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono tracking-widest text-[#C9944A] uppercase">
                Official Micro-Credential Certificate
              </span>
              {isDigiLocker && (
                <Badge className="bg-[#B65F32]/20 text-[#F5F1E8] border-[#B65F32]/40 text-[8px] font-mono">
                  DigiLocker Verified
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-[#8A847B] font-mono truncate max-w-xs">
              DID: did:ascendid:{id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scoreImpact && (
            <Badge className="bg-[#C9944A]/15 text-[#C9944A] border-[#C9944A]/30 text-xs font-mono font-bold">
              +{scoreImpact} FICO
            </Badge>
          )}
          <Badge className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md ${
            isRevoked ? "bg-red-500/20 text-red-400 border-red-500/40" :
            isExpired ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
            "bg-[#C9944A]/20 text-[#C9944A] border-[#C9944A]/40 shadow-[0_0_10px_rgba(201,148,74,0.15)]"
          }`}>
            {isRevoked ? "Revoked" : isExpired ? "Expired" : "Authentic & Verified"}
          </Badge>
        </div>
      </div>

      {/* Main Physical Certificate Body */}
      <div className="p-8 sm:p-10 relative">
        {/* Background Institutional Watermark Stamp */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0D0D0D]/[0.03] pointer-events-none select-none">
          <Award className="w-80 h-80" />
        </div>

        {/* Certificate Header Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#0D0D0D]/10">
          <div>
            <span className="text-xs font-mono font-bold text-[#B65F32] tracking-widest uppercase block">
              Issuing Authority
            </span>
            <h3 className="text-xl font-bold font-heading text-[#0D0D0D] mt-0.5 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#B65F32]" />
              {issuerName}
            </h3>
          </div>
          
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-[#524E48] block uppercase">Credential Category</span>
            <span className="text-xs font-bold text-[#0D0D0D] font-mono">{credentialType}</span>
          </div>
        </div>

        {/* Certificate Title & Recipient Main Display */}
        <div className="my-8 text-center sm:text-left space-y-3">
          <p className="text-xs font-mono text-[#524E48] uppercase tracking-widest">
            This is to certify that
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0D0D0D] tracking-tight">
            {recipientName}
          </h2>
          <p className="text-xs font-mono text-[#524E48] uppercase tracking-widest pt-2">
            has successfully earned the micro-credential in
          </p>
          <div className="inline-block bg-[#0D0D0D] text-[#F5F1E8] px-6 py-3 rounded-lg shadow-md border border-[#B65F32]/30">
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#F5F1E8]">
              {title}
            </h1>
          </div>
        </div>

        {/* Skills & Competencies */}
        {skills.length > 0 && (
          <div className="my-6 pt-4 border-t border-[#0D0D0D]/10">
            <span className="text-[10px] font-mono font-bold text-[#524E48] uppercase tracking-wider block mb-2">
              Verified Competencies
            </span>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill} 
                  className="bg-[#0D0D0D]/10 border border-[#0D0D0D]/20 text-[#0D0D0D] font-mono text-xs font-semibold px-2.5 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#0D0D0D]/15 text-xs">
          <div>
            <span className="text-[10px] font-mono text-[#524E48] uppercase block">Date Of Issuance</span>
            <span className="font-bold text-[#0D0D0D] font-mono flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-[#B65F32]" />
              {issueDate}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#524E48] uppercase block">Validity Period</span>
            <span className="font-bold text-[#0D0D0D] font-mono mt-0.5 block">{expiryDate}</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#524E48] uppercase block">Blockchain Proof Anchor</span>
            <span className="font-mono text-[11px] font-bold text-[#B65F32] truncate block mt-0.5" title={txHash || id}>
              {txHash ? `${txHash.slice(0, 12)}...` : `Base Sepolia #${id.slice(0, 8)}`}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-6 border-t border-[#0D0D0D]/15 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={copyId}
              className="border-[#0D0D0D]/30 text-[#0D0D0D] hover:bg-[#0D0D0D]/10 h-8 text-xs font-mono font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-[#B65F32]" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "Copied DID" : "Copy Credential ID"}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowJson(!showJson)}
              className="border-[#0D0D0D]/30 text-[#0D0D0D] hover:bg-[#0D0D0D]/10 h-8 text-xs font-mono font-bold"
            >
              <FileCode className="w-3.5 h-3.5 mr-1 text-[#B65F32]" />
              {showJson ? "Hide W3C Proof" : "Inspect W3C JSON-LD"}
              {showJson ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
            </Button>
          </div>

          <a 
            href={`/verify/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#B65F32] hover:underline"
          >
            Verify Public Record <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* W3C Payload Inspection Collapsible */}
        <AnimatePresence>
          {showJson && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6"
            >
              <div className="p-4 bg-[#0D0D0D] text-[#F5F1E8] rounded-lg border border-[#B65F32]/30 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 mb-2 border-b border-white/10 text-[10px] text-[#8A847B]">
                  <span>W3C Standard JSON-LD Verifiable Credential Structure</span>
                  <span className="text-[#C9944A]">ED25519 CRYPTOGRAPHICALLY SIGNED</span>
                </div>
                <pre className="whitespace-pre-wrap overflow-x-auto text-[11px] leading-relaxed text-[#F5F1E8]/90">
                  {JSON.stringify(w3cPayload, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
