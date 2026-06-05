"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth";
import { useThemeStore } from "../store/theme";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  Zap,
  History,
  Cpu,
  Sun,
  Moon,
  Info
} from "lucide-react";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, checkAuth, loading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);



  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${theme === "light" ? "bg-zinc-50" : "bg-zinc-950"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className={`text-sm font-semibold tracking-wide uppercase ${theme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
            Initializing Platform...
          </span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "History Log", href: "/history", icon: History },
    { name: "Ollama Hub", href: "/ollama", icon: Cpu },
  ];

  if (user?.is_admin) {
    links.push({ name: "Admin Panel", href: "/admin", icon: ShieldCheck });
  }

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case "pro":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-500 dark:text-indigo-300";
      case "business":
        return "bg-violet-500/10 border-violet-500/30 text-violet-500 dark:text-violet-300 font-bold";
      default:
        return theme === "light" ? "bg-zinc-100 border-zinc-200 text-zinc-650" : "bg-zinc-900 border-zinc-800 text-zinc-400";
    }
  };

  const isLight = theme === "light";

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 relative ${isLight ? "bg-zinc-50" : "bg-zinc-950"}`}>
      {/* Platform Theme Color Radial Blobs in Light Mode */}
      {isLight && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#0A66C2]/7 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#E1306C]/7 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-15%] left-[15%] w-[45%] h-[45%] bg-[#00F2FE]/9 rounded-full blur-[110px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[35%] h-[35%] bg-[#FF0000]/5 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Mobile Header Banner */}
      <header className={`md:hidden flex items-center justify-between px-6 py-4 border-b z-40 transition-colors duration-300 relative ${
        isLight ? "bg-white/95 border-zinc-200 text-zinc-900 backdrop-blur-md" : "bg-zinc-900 border-zinc-850 text-white"
      }`}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500/20" />
          <span className={`font-extrabold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
            SocialEngage <span className="text-indigo-500">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLight ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200" : "bg-zinc-800 border-zinc-700 text-zinc-350 hover:bg-zinc-750"
            }`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${isLight ? "hover:bg-zinc-100 text-zinc-650 hover:text-zinc-900" : "hover:bg-zinc-800 text-zinc-400 hover:text-white"}`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-30 w-72 border-r flex flex-col justify-between py-6 px-4 transform transition-all duration-350 md:transform-none relative ${
          isLight ? "bg-white/95 border-zinc-200 backdrop-blur-md" : "bg-zinc-950 border-zinc-900"
        } ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo Branding */}
          <div className="flex items-center justify-between px-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <Zap className="w-7 h-7 text-indigo-500 fill-indigo-500/20" />
              <span className={`font-extrabold text-xl tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
                SocialEngage <span className="text-indigo-500">AI</span>
              </span>
            </Link>
            
            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`hidden md:block p-2 rounded-xl border transition-all cursor-pointer ${
                isLight 
                  ? "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white"
              }`}
              title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? isLight
                        ? "bg-zinc-100 text-zinc-950 shadow-sm border border-zinc-200"
                        : "bg-zinc-900 text-white shadow-lg border border-zinc-800/60"
                      : isLight
                      ? "text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100/50"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-indigo-550 dark:text-indigo-400" : isLight ? "text-zinc-500" : "text-zinc-400"}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Card */}
        <div className={`flex flex-col gap-4 border-t pt-6 ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-extrabold text-indigo-600 dark:text-indigo-400 uppercase shadow-md shadow-indigo-500/5">
              {user?.email ? user.email.substring(0, 2) : "US"}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${isLight ? "text-zinc-900" : "text-white"}`}>
                {user?.full_name || "Active User"}
              </p>
              <p className={`text-xs truncate mb-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{user?.email || ""}</p>
              <span className={`inline-flex items-center text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${getPlanBadgeStyle(user?.plan || "Free")}`}>
                {user?.plan || "Free"} Plan
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              isLight 
                ? "text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100/50" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Screen Backdrop for Mobile Navigation Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
        />
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 px-6 py-8 md:px-12 md:py-10 max-w-7xl mx-auto w-full overflow-x-hidden relative z-10">
        {children}
      </main>

      {/* Floating Info Button */}
      <button
        onClick={() => setShowInfo(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all cursor-pointer group flex items-center gap-2"
        title="Platform Information"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-extrabold text-xs tracking-wider uppercase whitespace-nowrap">
          Quick Guide
        </span>
        <Info className="w-5 h-5 animate-pulse" />
      </button>

      {/* Platform Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
          <div 
            className={`w-full max-w-xl rounded-2xl border p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto ${
              isLight 
                ? "bg-white border-zinc-200 text-zinc-850" 
                : "bg-zinc-950 border-zinc-900 text-zinc-100"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowInfo(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isLight
                  ? "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:text-white"
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-xl">SocialEngage AI Center</h3>
                <p className={`text-xs ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                  Understand the platform's generation tools and metrics.
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="flex flex-col gap-5 text-sm">
              <div className={`border-b pb-3 ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                  💬 AI Comments & Engagement
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-650" : "text-zinc-400"}`}>
                  Generates authentic, contextual comments matching a post or thread text. Choose between friendly, professional, expert, or contrarian tone styles. Includes real-time validation for platform rules.
                </p>
              </div>

              <div className={`border-b pb-3 ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                  📝 Catchy Captions
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-655" : "text-zinc-400"}`}>
                  Crafts engaging, punchy social media post captions from your topic ideas or article outlines. Automatically formats the body copy with platform-fit emojis and brand spacing.
                </p>
              </div>

              <div className={`border-b pb-3 ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                  👤 Professional Bios
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-655" : "text-zinc-400"}`}>
                  Generates profile summaries, bios, and elevator pitches based on your career achievements. Tailored to represent you professionally on networks like LinkedIn or X/Twitter.
                </p>
              </div>

              <div className={`border-b pb-3 ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                  #️⃣ Hashtags Pack
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-655" : "text-zinc-400"}`}>
                  Extracts and targets relevant keywords from your post contents to output a copy-pasteable pack of 5 to 12 hashtags, optimizing your organic reach.
                </p>
              </div>

              <div className={`border-b pb-3 ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                  🛡️ Quality Telemetry scorecard
                </h4>
                <ul className={`text-xs list-disc pl-5 flex flex-col gap-1.5 ${isLight ? "text-zinc-655" : "text-zinc-400"}`}>
                  <li>
                    <strong>Human Likeness:</strong> Rating how natural the generated phrasing is, avoiding generic AI boilerplate flags.
                  </li>
                  <li>
                    <strong>Spam Detector:</strong> Automatically flags typical promotional, link-farming, or bot keywords.
                  </li>
                  <li>
                    <strong>Duplicate Check:</strong> Double checks prior local generations to ensure content is completely fresh.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-1">
                  💻 Privacy & Ollama LLMs
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-655" : "text-zinc-400"}`}>
                  Every generation runs locally on your machine via <strong>Ollama</strong>. None of your inputs or target profiles are uploaded to external servers, keeping your digital footprint 100% private.
                </p>
              </div>
            </div>

            {/* Footer Action */}
            <div className={`mt-6 pt-4 border-t flex justify-end ${isLight ? "border-zinc-100" : "border-zinc-900"}`}>
              <button
                onClick={() => setShowInfo(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
