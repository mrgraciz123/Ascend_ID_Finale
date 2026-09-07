"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Briefcase,
  Landmark,
  ShieldCheck,
  Play,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type Workspace = "student" | "issuer" | "recruiter" | "gov";

interface RoleSwitcherProps {
  currentWorkspace: Workspace;
}

const WORKSPACES: {
  key: Workspace;
  label: string;
  description: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "student",
    label: "Student",
    description: "Digital Identity & Proof",
    href: "/student/passport",
    Icon: GraduationCap,
  },
  {
    key: "issuer",
    label: "Issuer",
    description: "Credential Issuance",
    href: "/issuer/dashboard",
    Icon: Building2,
  },
  {
    key: "recruiter",
    label: "Recruiter",
    description: "Talent Verification",
    href: "/recruiter/dashboard",
    Icon: Briefcase,
  },
  {
    key: "gov",
    label: "Government",
    description: "National Oversight",
    href: "/gov/dashboard",
    Icon: Landmark,
  },
];

const WORKSPACE_LABELS: Record<Workspace, string> = {
  student: "Student Workspace",
  issuer: "Issuer Console",
  recruiter: "Recruiter Suite",
  gov: "National Oversight",
};

export default function RoleSwitcher({ currentWorkspace }: RoleSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  // Fetch the authenticated user's role from Firestore (same pattern as issuer layout)
  useEffect(() => {
    async function fetchRole() {
      if (!currentUser) return;
      try {
        // Force token refresh to ensure Firestore SDK has valid auth state
        await currentUser.getIdToken(true);
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role ?? "student");
        }
      } catch (e) {
        console.error("RoleSwitcher: failed to fetch user role", e);
      }
    }
    fetchRole();
  }, [currentUser]);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  /**
   * Determines whether the current user can navigate to a given workspace.
   * Authorization rules match the existing portal layout protections exactly:
   *   - Student:    any authenticated user
   *   - Issuer:     role === "issuer" in Firestore
   *   - Recruiter:  any authenticated user (preserving existing behavior)
   *   - Government: any authenticated user (preserving existing behavior)
   */
  function isAccessible(workspace: Workspace): boolean {
    if (!currentUser) return false;
    if (workspace === "student") return true;
    if (workspace === "issuer") return userRole === "issuer";
    if (workspace === "recruiter") return true;
    if (workspace === "gov") return true;
    return false;
  }

  return (
    <div className="relative px-4 pt-1 pb-4" ref={panelRef}>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-md border border-[#B65F32]/20 bg-[#0D0D0D] hover:border-[#B65F32]/40 hover:bg-[#141414] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#B65F32]/50"
      >
        <div className="flex flex-col items-start gap-0.5 text-left">
          <span className="text-[8px] uppercase font-mono font-bold text-[#8A847B]/60 tracking-[0.14em]">
            AscendID
          </span>
          <span className="text-[11px] font-bold text-[#F5F1E8] leading-none tracking-tight">
            {WORKSPACE_LABELS[currentWorkspace]}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8A847B] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Workspace panel ── */}
      {isOpen && (
        <div
          role="menu"
          className="absolute left-4 right-4 top-full mt-1.5 z-50 bg-[#0D0D0D] border border-[#B65F32]/25 rounded-md shadow-[0_12px_40px_rgba(0,0,0,0.7)] overflow-hidden"
        >
          {/* Workspaces */}
          <div className="py-1.5 space-y-px">
            {WORKSPACES.map(({ key, label, description, href, Icon }) => {
              const isCurrent = key === currentWorkspace;
              const accessible = isAccessible(key);

              if (isCurrent) {
                return (
                  <div
                    key={key}
                    role="menuitem"
                    aria-current="true"
                    className="flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-md bg-[#191919] border border-[#B65F32]/20"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#B65F32] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#F5F1E8] leading-none">
                        {label}
                      </p>
                      <p className="text-[9px] text-[#8A847B] mt-0.5 leading-none">
                        {description}
                      </p>
                    </div>
                    {/* Active indicator dot */}
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B65F32] shrink-0" />
                  </div>
                );
              }

              if (accessible) {
                return (
                  <Link
                    key={key}
                    href={href}
                    role="menuitem"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-md hover:bg-[#191919]/80 transition-colors duration-150 group/ws"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#8A847B] group-hover/ws:text-[#F5F1E8] transition-colors shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#8A847B] group-hover/ws:text-[#F5F1E8] transition-colors leading-none">
                        {label}
                      </p>
                      <p className="text-[9px] text-[#8A847B]/60 mt-0.5 leading-none">
                        {description}
                      </p>
                    </div>
                  </Link>
                );
              }

              // Locked / informational — shown but not navigable
              return (
                <div
                  key={key}
                  role="menuitem"
                  aria-disabled="true"
                  className="flex items-center gap-3 mx-1.5 px-3 py-2.5 rounded-md opacity-30 cursor-not-allowed select-none"
                >
                  <Icon className="w-3.5 h-3.5 text-[#8A847B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-[#8A847B] leading-none">{label}</p>
                    <p className="text-[9px] text-[#8A847B]/60 mt-0.5 leading-none">{description}</p>
                  </div>
                  <Lock className="w-3 h-3 text-[#8A847B] shrink-0" />
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mx-3 border-t border-[#B65F32]/10" />

          {/* Public section */}
          <div className="py-1.5">
            <div className="mx-1.5 px-3 pt-1 pb-1">
              <span className="text-[8px] uppercase font-mono font-bold text-[#8A847B]/40 tracking-[0.14em]">
                Public
              </span>
            </div>
            <Link
              href="/verify"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 mx-1.5 px-3 py-2 rounded-md hover:bg-[#191919]/80 transition-colors duration-150 group/pub"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#8A847B] group-hover/pub:text-[#F5F1E8] transition-colors shrink-0" />
              <span className="text-[11px] text-[#8A847B] group-hover/pub:text-[#F5F1E8] transition-colors">
                Verify Credential
              </span>
            </Link>
            <Link
              href="/demo"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 mx-1.5 px-3 py-2 rounded-md hover:bg-[#191919]/80 transition-colors duration-150 group/demo"
            >
              <Play className="w-3.5 h-3.5 text-[#8A847B] group-hover/demo:text-[#F5F1E8] transition-colors shrink-0" />
              <span className="text-[11px] text-[#8A847B] group-hover/demo:text-[#F5F1E8] transition-colors">
                Sandbox Simulation
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
