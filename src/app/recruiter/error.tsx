"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function RecruiterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Recruiter Portal Exception Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-full mb-4">
        <AlertCircle className="w-8 h-8 text-purple-400" />
      </div>
      <h2 className="text-xl font-bold text-white tracking-tight">Recruiter Portal Temporary Exception</h2>
      <p className="text-xs text-gray-400 max-w-md mt-2 leading-relaxed">
        An unhandled component error occurred in the recruiter module. The exception details have been logged to the browser console.
      </p>
      {error.message && (
        <div className="mt-4 p-3 bg-neutral-900 border border-white/5 rounded-xl font-mono text-[11px] text-purple-300 max-w-lg overflow-x-auto">
          {error.message}
        </div>
      )}
      <Button
        onClick={() => reset()}
        className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-9 px-5 rounded-lg flex items-center gap-2"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Re-render Portal View
      </Button>
    </div>
  );
}
