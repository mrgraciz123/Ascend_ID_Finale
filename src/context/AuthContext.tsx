"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  User 
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { ShieldCheck } from "lucide-react";
import { TrustScoreService } from "@/services/trust-score";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role?: string, issuerType?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B1020] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <ShieldCheck className="w-5 h-5 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest animate-pulse">
          AscendID · Establishing Secure Session...
        </span>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, fullName: string, role = "student", issuerType = "") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      photoURL: user.photoURL || "",
      role: role,
      createdAt: serverTimestamp()
    });

    if (role === "student") {
      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        fullName: fullName,
        email: user.email,
        institution: "Pending Setup",
        degree: "Pending Setup",
        graduationYear: new Date().getFullYear().toString(),
        profileCompletion: 20,
        isDigiLockerConnected: false,
        createdAt: serverTimestamp()
      });
      try {
        const { CredentialService } = await import("@/services/credential");
        await CredentialService.linkStudentToCredential(user.uid, email);
      } catch (e) {
        console.error("Failed to link student credentials on signup:", e);
      }

      // Explicitly initialize Trust Score to 300
      await TrustScoreService.initializeScore(user.uid);
    } else if (role === "issuer") {
      await setDoc(doc(db, "issuers", user.uid), {
        uid: user.uid,
        name: fullName,
        email: email,
        issuerType: issuerType,
        website: "",
        logo: "",
        verified: true,
        createdAt: serverTimestamp()
      });
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "User",
        photoURL: user.photoURL || "",
        role: "student", // Google sign-in always creates student; role can be changed post-signup
        createdAt: serverTimestamp()
      });

      await setDoc(doc(db, "students", user.uid), {
        uid: user.uid,
        fullName: user.displayName || "User",
        email: user.email,
        institution: "Pending Setup",
        degree: "Pending Setup",
        graduationYear: new Date().getFullYear().toString(),
        profileCompletion: 20,
        isDigiLockerConnected: false,
        createdAt: serverTimestamp()
      });
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout
  };

  // Show a premium loading skeleton instead of blank white flash
  if (loading) {
    return <AuthLoadingSkeleton />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
