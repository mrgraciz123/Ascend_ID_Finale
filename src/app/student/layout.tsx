"use client";

import { LayoutDashboard, ShieldCheck, FileUp, TrendingUp, Sparkles, Settings, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import RoleSwitcher from "@/components/RoleSwitcher";

const navItems = [
 { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
 { name: "Digital Passport", href: "/student/passport", icon: ShieldCheck },
 { name: "Proof Vault", href: "/student/proof-vault", icon: FileUp },
 { name: "Trust Engine", href: "/student/trust-engine", icon: TrendingUp },
 { name: "Opportunity Hub", href: "/student/opportunities", icon: Sparkles },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const [isSidebarOpen, setSidebarOpen] = useState(false);
 const { currentUser, logout, loading } = useAuth();

 useEffect(() => {
   if (!loading && !currentUser) {
     router.push("/auth/login");
   }
 }, [currentUser, loading, router]);

 const handleLogout = async () => {
   try {
     await logout();
     router.push("/auth/login");
   } catch (error) {
     console.error("Logout failed:", error);
     alert("Failed to sign out. Please try again.");
   }
 };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F1E8] flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[#B65F32]/20 bg-[#0D0D0D] z-20">
        <Link href="/student/dashboard" className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="AscendID Logo" className="w-9 h-9 object-contain" />
          <span className="font-bold tracking-tight text-[#F5F1E8] text-lg">AscendID</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!isSidebarOpen)} className="hover:bg-[#191919]">
          <Menu className="w-5 h-5 text-[#F5F1E8]" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#0D0D0D] border-r border-[#B65F32]/20 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo Section */}
        <div className="p-6 pb-3 flex items-center gap-3">
          <img src="/assets/logo.png" alt="AscendID Logo" className="w-8 h-8 object-contain" />
          <span className="text-base font-bold tracking-tight text-[#F5F1E8]">AscendID</span>
        </div>

        {/* Workspace Switcher */}
        <RoleSwitcher currentWorkspace="student" />

        {/* User Info Badge */}
        {currentUser && (
          <div className="px-6 py-3 border-b border-[#B65F32]/20 mb-4 hidden md:block">
            <div className="flex items-center gap-3 bg-[#191919] border border-[#B65F32]/20 p-2.5 rounded-md">
              <div className="w-8 h-8 rounded-md bg-[#B65F32]/15 border border-[#B65F32]/30 flex items-center justify-center text-xs font-bold text-[#B65F32] shrink-0">
                {currentUser.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "ST"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#F5F1E8] truncate">{currentUser.displayName || "Student"}</p>
                <p className="text-[10px] text-[#8A847B] truncate mt-0.5">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <div className="px-6 pb-2 border-t border-[#B65F32]/15 pt-4">
          <span className="text-[9px] uppercase font-mono font-bold text-[#8A847B]/50 tracking-[0.15em]">Workspace</span>
        </div>
        <div className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-all text-xs font-medium relative group
                  ${isActive 
                    ? 'bg-[#191919] text-[#F5F1E8] border border-[#B65F32]/30' 
                    : 'text-[#8A847B] hover:text-[#F5F1E8] hover:bg-[#191919]/60'}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive && (
                  <span className="absolute left-0 w-1 h-4 bg-[#B65F32] rounded-r" />
                )}
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#B65F32]' : 'text-[#8A847B] group-hover:text-[#F5F1E8]'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#B65F32]/20 space-y-1">
          <Link
            href="/student/settings"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors text-xs font-medium text-[#8A847B] hover:text-[#F5F1E8] hover:bg-[#191919]"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md transition-colors text-xs font-medium text-[#E57373] hover:bg-[#9E2A2B]/15"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#0D0D0D]">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
