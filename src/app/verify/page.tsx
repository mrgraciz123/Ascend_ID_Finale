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
    name: "Aarav Sharma", 
    title: "B.Tech — Computer Science (IIT Bombay)", 
    id: "cred-demo-iitb-btech", 
    type: "valid",
    issuer: "IIT Bombay"
  },
  { 
    name: "Aarav Sharma", 
    title: "Google Software Engineering Intern", 
    id: "cred-demo-google-intern", 
    type: "valid",
    issuer: "Google LLC"
  },
  { 
    name: "Rohan Varma", 
    title: "AWS Cloud Practitioner (Expired)", 
    id: "cred-demo-expired", 
    type: "warning",
    issuer: "Amazon Web Services"
  },
  { 
    name: "Karan Malhotra", 
    title: "React Developer (Revoked — Signature Mismatch)", 
    id: "cred-demo-revoked", 
    type: "error",
    issuer: "Udemy (Revoked)"
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
    <div className="min-h-screen bg-[#0B1020] text-white font-sans">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <QrCode className="w-3 h-3" />
            Universal Credential Verifier
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Verify Any Credential
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Scan a QR code, paste a credential ID, or drag-and-drop a credential link to perform an instant cryptographic verification.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-20 space-y-6">
        {/* Search Box */}
        <Card className="bg-[#111827] border border-white/5 rounded-[24px] shadow-xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleVerify} className="space-y-4">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Credential ID or Verification URL
              </Label>
              <div className="flex gap-2">
                <div
                  className={`relative flex-1 transition-all ${dragActive ? "ring-2 ring-blue-500 ring-offset-0 ring-offset-transparent" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <Input
                    value={credentialId}
                    onChange={e => setCredentialId(e.target.value)}
                    placeholder="cred-uuid-xxxx or https://ascendid.app/verify/..."
                    className="pl-10 h-12 bg-white/[0.03] border-white/10 focus-visible:border-blue-500 text-white rounded-xl text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!credentialId.trim()}
                  className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
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
                className="w-full h-11 bg-white/[0.02] border-white/10 hover:bg-white/[0.05] text-white rounded-xl font-medium text-sm"
              >
                <Camera className="w-4 h-4 mr-2" />
                {cameraState === "requesting" ? "Requesting camera access..." :
                 cameraState === "active" ? "Camera active — scanning..." :
                 cameraState === "decoded" ? "QR Code detected! Redirecting..." :
                 "Scan QR Code with Camera"}
              </Button>

              {cameraError && (
                <div className="mt-2 flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Camera Modal */}
        <AnimatePresence>
          {(cameraState === "active" || cameraState === "decoded") && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#111827] border border-white/10 rounded-[24px] overflow-hidden max-w-sm w-full"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-bold text-white">
                      {cameraState === "decoded" ? "QR Code Detected!" : "Scanning for QR Code..."}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={closeCameraModal}
                    className="w-8 h-8 hover:bg-white/5 text-gray-400"
                    aria-label="Close camera"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    className="w-full aspect-square object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  {/* Scanner overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500 rounded-tl" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500 rounded-tr" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500 rounded-bl" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500 rounded-br" />
                      {/* Scanning line */}
                      <motion.div
                        animate={{ y: [0, 176, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-0.5 bg-blue-500/70"
                      />
                    </div>
                  </div>
                  {cameraState === "decoded" && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-20 h-20 text-emerald-400" />
                    </div>
                  )}
                </div>
                <p className="p-4 text-xs text-gray-400 text-center">
                  Point your camera at an AscendID QR code. It will be automatically detected.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demo Credentials Panel */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Demo Credentials</span>
            <span className="text-[10px] text-gray-500">— Click to verify live</span>
          </div>
          <div className="space-y-2">
            {DEMO_CREDENTIALS.map(cred => (
              <Link key={cred.id} href={`/verify/${cred.id}`}>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#111827] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      cred.type === "valid" ? "bg-emerald-500/10 border border-emerald-500/20" :
                      cred.type === "warning" ? "bg-amber-500/10 border border-amber-500/20" :
                      "bg-red-500/10 border border-red-500/20"
                    }`}>
                      {cred.type === "valid" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
                       cred.type === "warning" ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                       <ShieldAlert className="w-4 h-4 text-red-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {cred.title}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{cred.name} · {cred.issuer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <Badge className={`text-[9px] font-mono border rounded ${
                      cred.type === "valid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                      cred.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                      "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {cred.type === "valid" ? "VALID" : cred.type === "warning" ? "EXPIRED" : "REVOKED"}
                    </Badge>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-white transition-colors" />
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
