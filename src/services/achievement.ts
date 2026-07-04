import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { UploadService } from "./upload";

export interface Achievement {
 id: string;
 studentId: string;
 title: string;
 category: string;
 issuer: string;
 impact: string;
 date: string;
 verified: boolean;
 proofUrl: string;
 createdAt: unknown;
}

export class AchievementService {
 static async getAchievements(studentId: string): Promise<Achievement[]> {
 try {
 const q = query(collection(db, "achievements"), where("studentId", "==", studentId));
 const querySnapshot = await getDocs(q);
 
 const achievements: Achievement[] = [];
 querySnapshot.forEach((doc) => {
 achievements.push({ id: doc.id, ...doc.data() } as Achievement);
 });
 return achievements;
 } catch (error) {
 console.error("Error fetching achievements:", error);
 return [];
 }
 }

 static async uploadProof(studentId: string, data: { file: File; title: string; type: string; issuer: string; impact: string }) {
 try {
 if (!data.file) {
 throw new Error("No file provided");
 }

 // Upload file via secure UploadService (Cloudinary API Route)
 const downloadURL = await UploadService.uploadFile(data.file);

 // Create achievement document
 const achievementRef = doc(collection(db, "achievements"));
 await setDoc(achievementRef, {
 studentId,
 title: data.title,
 category: data.type, // Map 'type' from UI to 'category' in DB
 issuer: data.issuer,
 impact: data.impact,
 date: new Date().toISOString().split('T')[0],
 verified: false,
 proofUrl: downloadURL,
 createdAt: serverTimestamp()
 });

 return { success: true, id: achievementRef.id, proofUrl: downloadURL };
 } catch (error) {
 console.error("Error uploading proof:", error);
 return { success: false, error };
 }
 }
}
