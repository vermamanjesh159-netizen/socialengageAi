"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";
import { useThemeStore } from "../../store/theme";
import { useAuthStore } from "../../store/auth";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  Target, 
  TrendingUp, 
  PenTool,
  CheckCircle
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();
  const isLight = theme === "light";

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const isGuest = !token || user?.email === "guest@aicontentgenerator.ai" || user?.email === "guest@socialengage.ai" || user?.email === "admin@aicontentgenerator.ai";

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-12">
        
        {/* Hero Banner Section */}
        <div className={`relative rounded-3xl p-8 md:p-12 overflow-hidden border transition-all duration-300 ${
          isLight 
            ? "bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/50 border-zinc-200/80 shadow-md" 
            : "bg-gradient-to-r from-zinc-950 via-zinc-900/60 to-zinc-950 border-zinc-900 shadow-2xl shadow-indigo-950/10"
        }`}>
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[250px] h-[250px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border ${
                isLight ? "bg-indigo-100/50 border-indigo-200 text-indigo-700" : "bg-indigo-950/60 border-indigo-900 text-indigo-400"
              }`}>
                <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Production Ready Playground
              </span>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight leading-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
                AI Content Studio <br />
                <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent text-2xl md:text-3xl font-bold block mt-1.5">
                  Create, Optimize, and Scale Content with AI
                </span>
              </h1>
              <p className={`text-sm md:text-base mt-4 max-w-xl leading-relaxed ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                AI Content Generator is a high-performance SaaS utility helping businesses, marketers, and content creators bypass the friction of writing copy. Powered by local LLMs via Ollama & cloud-based Groq.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => router.push("/playground")}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm tracking-wider uppercase rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2 group"
                >
                  Go to Playground
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                {isGuest && (
                  <button
                    onClick={() => router.push("/login")}
                    className={`px-8 py-4 border font-extrabold text-sm tracking-wider uppercase rounded-2xl transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                      isLight 
                        ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    Log In / Sign Up
                  </button>
                )}
              </div>
            </div>
            
            {/* Visual Telemetry Card Mockup */}
            <div className={`w-full max-w-[340px] border rounded-2xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden backdrop-blur-md hidden lg:block ${
              isLight ? "bg-white/80 border-zinc-200" : "bg-zinc-950/80 border-zinc-900"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>Quality Scorecard</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
              </div>
              <div className="flex flex-col gap-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className={isLight ? "text-zinc-550" : "text-zinc-400"}>Human Likeness Score</span>
                  <span className="font-extrabold text-emerald-500">98% Passed</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "98%" }}></div>
                </div>
                <div className="flex items-center justify-between border-t pt-3 border-zinc-200 dark:border-zinc-900">
                  <span className={isLight ? "text-zinc-550" : "text-zinc-400"}>Spam Filters</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1">🛡️ Safe</span>
                </div>
                <div className="flex items-center justify-between border-t pt-3 border-zinc-200 dark:border-zinc-900">
                  <span className={isLight ? "text-zinc-550" : "text-zinc-400"}>Uniqueness Check</span>
                  <span className="font-bold text-emerald-500 flex items-center gap-1">🛡️ 100% Unique</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Audience / Value Props */}
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight mb-6 flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}>
            <Target className="w-5 h-5 text-indigo-500" /> Tailored Value Props
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Businesses Card */}
            <Card className={`border transition-all duration-300 hover:scale-[1.01] ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/40 border-zinc-900"
            }`}>
              <CardHeader className="pb-2">
                <span className="p-2.5 w-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2 block">
                  <Layers className="w-5 h-5" />
                </span>
                <CardTitle className="text-base font-extrabold">For Businesses</CardTitle>
                <CardDescription>Scale conversions and marketing assets.</CardDescription>
              </CardHeader>
              <CardContent className={`text-xs leading-relaxed flex flex-col gap-2.5 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                <p>Ensure maximum brand consistency across multiple channels with custom style rules.</p>
                <ul className="flex flex-col gap-1.5 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Generate Ad copy templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Product descriptions & specs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Professional email templates</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Marketers Card */}
            <Card className={`border transition-all duration-300 hover:scale-[1.01] ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/40 border-zinc-900"
            }`}>
              <CardHeader className="pb-2">
                <span className="p-2.5 w-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2 block">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <CardTitle className="text-base font-extrabold">For Marketers</CardTitle>
                <CardDescription>Automate complex campaign outline tasks.</CardDescription>
              </CardHeader>
              <CardContent className={`text-xs leading-relaxed flex flex-col gap-2.5 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                <p>Run quick rewrites, optimize drafts for search keywords, and enhance text layouts.</p>
                <ul className="flex flex-col gap-1.5 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Generate organic Hashtags</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Rewrite & Summarize drafts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Optimize for SEO targets</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Content Creators Card */}
            <Card className={`border transition-all duration-300 hover:scale-[1.01] ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/40 border-zinc-900"
            }`}>
              <CardHeader className="pb-2">
                <span className="p-2.5 w-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-2 block">
                  <PenTool className="w-5 h-5" />
                </span>
                <CardTitle className="text-base font-extrabold">For Creators</CardTitle>
                <CardDescription>Maintain active channels and audience feed.</CardDescription>
              </CardHeader>
              <CardContent className={`text-xs leading-relaxed flex flex-col gap-2.5 ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>
                <p>Craft catchy headlines, draft comprehensive blog articles, and customize profile bios.</p>
                <ul className="flex flex-col gap-1.5 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Post Captions with smart emojis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Elevate profile bio pitches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                    <span>Write complete articles & blogs</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div>
          <h2 className={`text-xl font-extrabold tracking-tight mb-6 flex items-center gap-2 ${isLight ? "text-zinc-900" : "text-white"}`}>
            <Zap className="w-5 h-5 text-indigo-500" /> Platform Architecture Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1 */}
            <div className={`p-6 border rounded-2xl flex gap-4 transition-all duration-300 ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/30 border-zinc-900"
            }`}>
              <span className="p-3 w-fit h-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h3 className={`font-extrabold text-sm mb-1 ${isLight ? "text-zinc-900" : "text-zinc-200"}`}>Local LLM & Cloud Hybrid Hub</h3>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>
                  Swap open-source models (like Llama 3, Mistral) locally using Ollama for ultimate privacy, or leverage cloud-accelerated Groq endpoints for lightning-fast generations.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className={`p-6 border rounded-2xl flex gap-4 transition-all duration-300 ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/30 border-zinc-900"
            }`}>
              <span className="p-3 w-fit h-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h3 className={`font-extrabold text-sm mb-1 ${isLight ? "text-zinc-900" : "text-zinc-200"}`}>Real-Time Telemetry scorecards</h3>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>
                  Evaluate the quality of every output against a score evaluating human resemblance (1-100%), spam and promotional triggers, and unique local history repeat verification.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className={`p-6 border rounded-2xl flex gap-4 transition-all duration-300 ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/30 border-zinc-900"
            }`}>
              <span className="p-3 w-fit h-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className={`font-extrabold text-sm mb-1 ${isLight ? "text-zinc-900" : "text-zinc-200"}`}>Zero-Authentication Friction</h3>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>
                  Get straight to generating. By defaulting to a secure, locally managed session state, you can immediately use the playground generator without signing up or dealing with paywalls.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className={`p-6 border rounded-2xl flex gap-4 transition-all duration-300 ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/30 border-zinc-900"
            }`}>
              <span className="p-3 w-fit h-fit rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
                <Layers className="w-5 h-5" />
              </span>
              <div>
                <h3 className={`font-extrabold text-sm mb-1 ${isLight ? "text-zinc-900" : "text-zinc-200"}`}>Channel Specific Optimization</h3>
                <p className={`text-xs leading-relaxed ${isLight ? "text-zinc-550" : "text-zinc-400"}`}>
                  Tailor posts, articles, and descriptions to match character constraints, formatting style guidelines, and tone rules for LinkedIn, Twitter, Facebook, YouTube, TikTok, and Instagram.
                </p>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
