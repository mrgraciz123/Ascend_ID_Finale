"use client";

import { LayoutDashboard, Award, ShieldCheck, TrendingUp, Settings, LogOut, Menu, FileText, CheckSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const navItems = [
  { name: "Dashboard", href: "/issuer/dashboard", icon: LayoutDashboard },
  { name: "Issue Credential", href: "/issuer/issue", icon: Award },
  { name: "Issued Credentials", href: "/issuer/credentials", icon: FileText },
  { name: "Analytics", href: "/issuer/analytics", icon: TrendingUp },
];

export default function IssuerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { currentUser, logout, loading } = useAuth();

  useEffect(() => {
    async function checkAuthorization() {
      if (loading) return;
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "issuer") {
          setIsAuthorized(true);
        } else {
          console.warn("Unauthorized access: user is not an issuer");
          setIsAuthorized(false);
          router.push("/student/dashboard"); // Redirect students back
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthorized(false);
        router.push("/auth/login");
      }
    }
    checkAuthorization();
  }, [currentUser, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#0B1020] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-xl border border-blue-500 animate-ping opacity-25" />
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-widest animate-pulse">Authorizing secure portal...</span>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null; // Page will redirect
  }

  return (
    <div className="min-h-screen bg-[#0B1020] text-white flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#111827]/80 backdrop-blur-md z-20">
        <Link href="/issuer/dashboard" className="flex items-center gap-2.5">
          <img src="/assets/logo.png" alt="AscendID Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold tracking-tight text-white text-sm">
            AscendID <span className="text-[10px] text-gray-400 font-normal border border-white/10 rounded px-1 py-0.5 ml-1 bg-white/5">Issuer</span>
          </span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="hover:bg-white/5">
          <Menu className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#111827]/60 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 hidden md:flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <img src="/assets/logo.png" alt="AscendID Logo" className="w-10 h-10 object-contain" />
            <span className="text-base font-bold tracking-tight text-white">AscendID</span>
          </div>
          <span className="text-[9px] text-blue-400 ml-9 font-bold tracking-widest uppercase">Issuer Console</span>
        </div>

        {/* User Info Badge */}
        {currentUser && (
          <div className="px-6 py-3 border-b border-white/5 mb-4 hidden md:block">
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-2.5 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                {currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "IS"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.displayName || "Issuer"}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 px-4 py-4 md:py-0 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-medium relative group
                  ${isActive 
                    ? 'bg-white/5 text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive && (
                  <span className="absolute left-0 w-1 h-4 bg-blue-500 rounded-r" />
                )}
                <Icon className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/5 space-y-1">
          <button
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-xs font-medium text-red-400 hover:bg-red-500/15"
            onClick={handleLogout}
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Premium Ambient Glows */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/[0.03] blur-[150px] rounded-full pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
