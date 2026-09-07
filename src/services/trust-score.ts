import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { DEMO_MODE, DEMO_TRUST_SCORE, isDemoUser } from "@/lib/demo-data";
import { setDoc, serverTimestamp } from "firebase/firestore";

const DEFAULT_FACTORS = {
  issuerReputation: 50,
  credentialFreshness: 50,
  credentialImportance: 50,
  fraudProbability: 90,
  skillConsistency: 50,
  experienceGrowth: 50,
  peerValidation: 30,
  verificationConfidence: 50,
  openSourceActivity: 30,
  researchActivity: 30,
  hackathonPerformance: 40,
  internshipQuality: 45
};

export class TrustScoreService {
  static async getScore(studentId: string) {
    if (isDemoUser(studentId)) {
      return DEMO_TRUST_SCORE;
    }

    try {
      let apiData: any = null;

      // 1. Try server-side Trust Engine API with proper auth token
      try {
        const { auth } = await import("@/lib/firebase");
        const token = await auth.currentUser?.getIdToken();
        
        if (token) {
          const response = await fetch("/api/student/trust-score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ studentId })
          });
          if (response.ok) {
            const res = await response.json();
            if (res.success) apiData = res;
          }
        }
      } catch (e) {
        console.warn("TrustScoreService: Trust Engine API unavailable, using Firestore fallback:", e);
      }

      // 2. Firestore fallback (only if authenticated)
      let profileSnap: any = null;
      try {
        const { auth } = await import("@/lib/firebase");
        if (auth.currentUser) {
          const profileRef = doc(db, "students", studentId);
          profileSnap = await getDoc(profileRef);
        }
      } catch {
        // Fallback silently if current user is not authorized to read this student
      }

      let total = 350;
      let factors = { ...DEFAULT_FACTORS };
      let lastUpdated = new Date().toISOString();
      let explanation = "Verify your credentials to start building your Trust Score.";

      if (apiData) {
        total = apiData.total;
        factors = apiData.factors;
        explanation = apiData.explanation;
        lastUpdated = apiData.lastUpdated;
      } else if (profileSnap?.exists?.()) {
        const data = profileSnap.data();
        if (typeof data.trustScore === "number") total = data.trustScore;
        if (data.trustFactors) factors = { ...factors, ...data.trustFactors };
        if (data.trustLastUpdated) lastUpdated = data.trustLastUpdated;
        if (data.trustBreakdown?.length > 0) explanation = data.trustBreakdown[0]?.description || explanation;
      }

      // 3. Fetch trust history subcollection
      const historyList: any[] = [];
      try {
        const { auth } = await import("@/lib/firebase");
        if (auth.currentUser) {
          const historySnap = await getDocs(collection(db, "students", studentId, "trust_history"));
          historySnap.forEach(docSnap => {
            const h = docSnap.data();
            historyList.push({
              id: docSnap.id,
              score: h.score || 350,
              timestamp: h.timestamp || "",
              explanation: h.explanation || "",
              factors: h.factors || factors
            });
          });
          historyList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
      } catch {
        // Ignore if trust_history is empty or not permitted for non-student
      }

      // Add baseline entries if history is empty (so charts always have data to display)
      if (historyList.length === 0) {
        historyList.push({
          id: "baseline",
          score: 350,
          timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          explanation: "Account created.",
          factors: DEFAULT_FACTORS
        });
        if (total !== 350) {
          historyList.push({
            id: "current",
            score: total,
            timestamp: lastUpdated,
            explanation,
            factors
          });
        }
      }

      const profileData = profileSnap.exists() ? profileSnap.data() : null;

      return {
        total,
        explanation,
        factors,
        lastUpdated,
        history: historyList,
        contributingFactors: apiData?.contributingFactors || profileData?.trustBreakdown || [],
        breakdown: {
          projects: Math.round((factors.openSourceActivity || 0) * 0.25),
          internships: Math.round((factors.internshipQuality || 0) * 0.25),
          certificates: Math.round((factors.issuerReputation || 0) * 0.20),
          hackathons: Math.round((factors.hackathonPerformance || 0) * 0.15),
          recommendations: Math.round((factors.peerValidation || 0) * 0.10),
          profile: 5
        }
      };

    } catch (error) {
      console.error("Error in TrustScoreService.getScore:", error);
      return {
        total: 350,
        explanation: "Trust Engine temporarily unavailable.",
        factors: { ...DEFAULT_FACTORS },
        lastUpdated: new Date().toISOString(),
        history: [],
        contributingFactors: [],
        breakdown: { projects: 0, internships: 0, certificates: 0, hackathons: 0, recommendations: 0, profile: 0 }
      };
    }
  }

  static async initializeScore(studentId: string): Promise<void> {
    try {
      const scoreRef = doc(db, "students", studentId, "metrics", "trustScore");
      await setDoc(scoreRef, {
        score: 300,
        factors: DEFAULT_FACTORS,
        explanation: "Account created. Verify your credentials to start building your Trust Score.",
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("TrustScoreService: Failed to initialize Trust Score", e);
    }
  }
}
