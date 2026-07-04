import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class OpportunityService {
  /**
   * Fetches AI-powered opportunities recommended specifically for a candidate.
   * Leverages server-side Gemini analysis or high-fidelity local match heuristics.
   */
  static async getRecommendations(studentId: string) {
    try {
      const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
      const response = await fetch(`${baseUrl}/api/student/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
      }

      const res = await response.json();
      if (res.success && Array.isArray(res.data)) {
        return res.data;
      }
      throw new Error(res.error || "Malformed recommendations response");
    } catch (error) {
      console.error("OpportunityService.getRecommendations error:", error);
      // Return an empty array instead of a fake mock job
      return [];
    }
  }

  /**
   * Triggers a fresh AI analysis and returns recommendations.
   */
  static async generateAIMatches(studentId: string) {
    return this.getRecommendations(studentId);
  }
}
