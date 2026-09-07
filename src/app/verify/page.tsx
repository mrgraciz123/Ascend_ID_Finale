"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  QrCode, 
  Search, 
  Camera,
  Loader2, 
  ShieldAlert,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_CREDENTIALS = [
  { 
    name: "Phase 4.1 Verification Student", 
    title: "B.S. Cryptographic Engineering", 
    id: "2d7XJ3xzdH5kZKKfZLs6", 
    type: "error", // The status is revoked
    issuer: "AscendChain Phase 4.1 University"
  }
];

export default function QRScannerPortal() {
  const router = useRouter();
  const [credentialId, setCredentialId] = useState("");
  const [cameraState, setCameraState] = useState<"idle" | "requesting" | "active" | "scanning" | "decoded" | "error">("idle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCameraScan = async () => {
    setCameraError(null);
    setCameraState("requesting");

    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("active");

      // Try to use BarcodeDetector API (Chrome 83+)
      if ("BarcodeDetector" in window) {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });

        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || cameraState === "decoded") return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const rawValue: string = barcodes[0].rawValue;
              setCameraState("decoded");
              stopCamera();
              // Extract credential ID from URL or use raw value
              const urlMatch = rawValue.match(/\/verify\/([a-zA-Z0-9_-]+)/);
              const credId = urlMatch?.[1] || rawValue.trim();
              setTimeout(() => router.push(`/verify/${credId}`), 600);
            }
          } catch {
            // Continue scanning
          }
        }, 300);
      } else {
        // Fallback: canvas-based ZXing scanning is heavy to bundle — show manual entry prompt
        setCameraError("Your browser doesn't support QR detection. Please enter the credential ID manually or use Chrome/Edge.");
        stopCamera();
        setCameraState("error");
      }
    } catch (err: any) {
      stopCamera();
      if (err?.name === "NotAllowedError") {
        setCameraError("Camera access was denied. Please allow camera permission in your browser settings.");
      } else if (err?.name === "NotFoundError") {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Failed to access camera. Please enter the credential ID manually.");
      }
      setCameraState("error");
    }
  };

  const closeCameraModal = () => {
    stopCamera();
    setCameraState("idle");
    setCameraError(null);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const id = credentialId.trim();
    if (id) router.push(`/verify/${id}`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const text = e.dataTransfer.getData("text");
    if (text?.trim()) setCredentialId(text.trim());
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F1E8] font-sans">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#C9944A]/10 border border-[#C9944A]/30 text-[#C9944A] text-[10px] font-mono font-bold uppercase tracking-widest mb-6">
            <QrCode className="w-3.5 h-3.5" />
            W3C Universal Credential Checkpoint
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#F5F1E8] tracking-tight mb-4">
            Official Credential Verification
          </h1>
          <p className="text-[#8A847B] text-base max-w-xl mx-auto leading-relaxed">
            Scan a QR code, paste a credential DID identifier, or drag-and-drop a credential link to perform instant cryptographic verification.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-6">
        {/* Search Box */}
        <Card className="bg-[#191919] border border-[#B65F32]/20 rounded-md shadow-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <Label className="text-[10px] font-mono font-bold text-[#8A847B] uppercase tracking-widest">
                Credential Identifier or Verification URL
              </Label>
              <div className="flex gap-2">
                <div
                  className={`relative flex-1 transition-all ${dragActive ? "border-[#B65F32]" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A847B] pointer-events-none" />
                  <Input
                    value={credentialId}
                    onChange={e => setCredentialId(e.target.value)}
                    placeholder="cred-uuid-xxxx or https://ascendid.app/verify/..."
                    className="pl-10 h-11 bg-[#0D0D0D] border-[#B65F32]/20 focus-visible:border-[#B65F32] text-[#F5F1E8] rounded-md text-xs font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!credentialId.trim()}
                  className="h-11 px-6 bg-[#B65F32] hover:bg-[#8F4728] text-[#F5F1E8] font-bold rounded-md shrink-0"
                >
                  Verify <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>

            {/* Camera Scan Button */}
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={startCameraScan}
                disabled={cameraState === "requesting" || cameraState === "active"}
                className="w-full h-10 bg-[#0D0D0D] border-[#B65F32]/20 hover:bg-[#241814] text-[#F5F1E8] rounded-md font-medium text-xs"
              >
                <Camera className="w-4 h-4 mr-2 text-[#B65F32]" />
                {cameraState === "requesting" ? "Requesting camera access..." :
                 cameraState === "active" ? "Camera active — scanning..." :
                 cameraState === "decoded" ? "QR Code detected! Redirecting..." :
                 "Scan QR Code with Camera"}
              </Button>

              {cameraError && (
                <div className="mt-2 flex items-start gap-2 p-3 rounded-md bg-[#9E2A2B]/15 border border-[#9E2A2B]/30 text-[#E57373] text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Panel */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#C9944A] animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-[#C9944A] uppercase tracking-widest">Sample Verification Records</span>
            <span className="text-[10px] text-[#8A847B]">— Click to test verification</span>
          </div>
          <div className="space-y-2">
            {DEMO_CREDENTIALS.map(cred => (
              <Link key={cred.id} href={`/verify/${cred.id}`}>
                <div className="flex items-center justify-between p-4 rounded-md bg-[#191919] border border-[#B65F32]/20 hover:border-[#B65F32]/40 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      cred.type === "valid" ? "bg-[#C9944A]/10 border border-[#C9944A]/30" :
                      cred.type === "warning" ? "bg-amber-500/10 border border-amber-500/20" :
                      "bg-[#9E2A2B]/10 border border-[#9E2A2B]/20"
                    }`}>
                      {cred.type === "valid" ? <CheckCircle2 className="w-4 h-4 text-[#C9944A]" /> :
                       cred.type === "warning" ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                       <ShieldAlert className="w-4 h-4 text-[#E57373]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#F5F1E8] group-hover:text-[#B65F32] transition-colors truncate">
                        {cred.title}
                      </p>
                      <p className="text-[10px] text-[#8A847B] font-mono mt-0.5">{cred.name} · {cred.issuer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <Badge className={`text-[9px] font-mono border rounded ${
                      cred.type === "valid" ? "bg-[#C9944A]/15 border-[#C9944A]/40 text-[#C9944A]" :
                      cred.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-[#9E2A2B]/15 border-[#9E2A2B]/40 text-[#E57373]"
                    }`}>
                      {cred.type === "valid" ? "VERIFIED" : cred.type === "warning" ? "EXPIRED" : "REVOKED"}
                    </Badge>
                    <ExternalLink className="w-3.5 h-3.5 text-[#8A847B] group-hover:text-[#F5F1E8] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
