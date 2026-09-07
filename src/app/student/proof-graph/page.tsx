"use client";

import { useEffect, useState } from "react";
import { Loader2, Network, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StudentService } from "@/services/student";
import { AchievementService } from "@/services/achievement";
import { CredentialService } from "@/services/credential";
import { ProofGraph } from "@/components/ProofGraph";

export default function StudentProofGraphPage() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);

  useEffect(() => {
    async function loadGraphData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const [academicRecords, studentAchievements, studentCredentials] = await Promise.all([
        StudentService.getAcademicRecords(currentUser.uid),
        AchievementService.getAchievements(currentUser.uid),
        CredentialService.getStudentCredentials(currentUser.email || "")
      ]);

      setRecords(academicRecords || []);
      setAchievements(studentAchievements || []);
      setCredentials(studentCredentials || []);
      setLoading(false);
    }

    loadGraphData().catch((error) => {
      console.error("Failed to load proof graph data:", error);
      setLoading(false);
    });
  }, [currentUser]);

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#B65F32]" /></div>;
  }

  const hasData = records.length > 0 || achievements.length > 0 || credentials.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16 font-sans text-[#F5F1E8]">
      <header className="border-b border-[#B65F32]/25 pb-6">
        <div className="flex items-center gap-3">
          <Network className="h-7 w-7 text-[#B65F32]" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Proof Graph</h1>
            <p className="mt-1 text-sm text-[#8A847B]">Evidence to achievement to credential to identity.</p>
          </div>
        </div>
      </header>

      {!hasData ? (
        <div className="border border-[#B65F32]/25 bg-[#191919] p-10 text-center rounded-lg">
          <ShieldAlert className="mx-auto h-10 w-10 text-[#B65F32]" />
          <h2 className="mt-4 text-lg font-bold">Provenance evidence unavailable</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#8A847B]">The graph will appear when this account has academic records, achievements, or issued credentials.</p>
        </div>
      ) : (
        <ProofGraph records={records} achievements={achievements} instCredentials={credentials} />
      )}
    </div>
  );
}