"use client";

import React, { useState } from "react";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";
import { useAuthStore } from "../../store/auth";
import { useToastStore } from "../../store/toast";
import { useThemeStore } from "../../store/theme";
import { Check, ShieldAlert, CreditCard, ArrowRight } from "lucide-react";

export default function PlansPage() {
  const { user, updateUser } = useAuthStore();
  const { theme } = useThemeStore();
  const addToast = useToastStore((state) => state.addToast);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const isLight = theme === "light";
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const isGuest = !token || user?.email === "guest@aicontentgenerator.ai" || user?.email === "guest@socialengage.ai" || user?.email === "admin@aicontentgenerator.ai";

  const plans = [
    {
      id: "Free",
      name: "Free Plan",
      price: "$0",
      description: "Perfect for testing capabilities and local experimentation.",
      features: [
        "Standard generation rate",
        "Access to basic content categories",
        "Local guest browser cache logging",
        "Community forum support",
      ],
      ctaText: "Current Plan",
      highlight: false,
      color: "zinc",
    },
    {
      id: "Pro",
      name: "Pro Plan",
      price: "$29",
      description: "Supercharge your copywriting with fast cloud-based intelligence.",
      features: [
        "Advanced Ollama & Groq high-speed pipeline",
        "Access to all 13 content generation objectives",
        "Persistent cloud history logging & analytics",
        "Custom tone matching & parameter control",
        "Priority queue processing",
      ],
      ctaText: "Upgrade to Pro",
      highlight: true,
      color: "indigo",
    },
    {
      id: "Go",
      name: "Go Plan",
      price: "$79",
      description: "Ultimate scale for businesses, marketers, and collaborative teams.",
      features: [
        "Unlimited generation volume",
        "Priority dedicated model queues",
        "Collaborative multi-user workspace logs",
        "Advanced customized brand personas API",
        "24/7 dedicated account support team",
      ],
      ctaText: "Go Unlimited",
      highlight: false,
      color: "purple",
    },
  ];

  const handleSelectPlan = async (planId: string) => {
    if (isGuest) {
      addToast("Please Sign In / Sign Up to upgrade your workspace to a paid plan!", "error");
      return;
    }

    if (user?.plan?.toLowerCase() === planId.toLowerCase()) {
      return;
    }

    setLoadingPlan(planId);
    try {
      await updateUser({ plan: planId });
      addToast(`Successfully switched to the ${planId} Plan!`, "success");
    } catch {
      addToast("Failed to change plan. Please try again.", "error");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-10 max-w-5xl mx-auto pb-12">
        {/* Header Block */}
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
            Choose Your Subscription Plan
          </h1>
          <p className={`${isLight ? "text-zinc-500" : "text-zinc-400"} text-sm mt-1.5 max-w-3xl leading-relaxed`}>
            Unlock premium features, faster generation speeds, persistent cloud archives, and advanced brand personas with our transparent pricing.
          </p>
        </div>

        {isGuest && (
          <div className={`flex items-start gap-3.5 p-4.5 rounded-2xl border transition-all ${
            isLight
              ? "bg-amber-50/50 border-amber-200/80 text-amber-900"
              : "bg-amber-950/15 border-amber-950/40 text-amber-250 backdrop-blur-md"
          }`}>
            <ShieldAlert className="w-5 h-5 mt-0.5 text-amber-500 flex-shrink-0 animate-pulse" />
            <div className="text-xs font-semibold leading-relaxed">
              <span className="font-extrabold uppercase tracking-wide mr-1.5">Guest Workspace Detected:</span>
              You are currently utilizing a temporary guest environment. To purchase subscriptions, sync history logs, and access advanced custom styles, please 
              <a href="/login" className="mx-1 font-black underline hover:text-indigo-400 transition-colors">Log In</a> 
              or 
              <a href="/register" className="ml-1 font-black underline hover:text-indigo-400 transition-colors">Sign Up</a>.
            </div>
          </div>
        )}

        {/* Pricing Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = user?.plan?.toLowerCase() === p.id.toLowerCase() || (isGuest && p.id === "Free");
            const highlightColor = p.color === "indigo" ? "border-indigo-500/80 ring-2 ring-indigo-500/10" : p.color === "purple" ? "border-purple-500/80 ring-2 ring-purple-500/10" : "border-zinc-800";
            
            return (
              <Card
                key={p.id}
                className={`relative flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:scale-[1.01] ${
                  isCurrent
                    ? highlightColor
                    : isLight
                    ? "bg-white border-zinc-200/90 shadow-sm hover:border-zinc-300"
                    : "bg-zinc-950/45 border-zinc-900/90 hover:border-zinc-800 backdrop-blur-md"
                }`}
              >
                {p.highlight && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
                )}

                <CardHeader className="pb-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className={`text-xl font-extrabold ${isLight ? "text-zinc-900" : "text-white"}`}>
                        {p.name}
                      </CardTitle>
                      <CardDescription className={`mt-1.5 text-xs ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                        {p.description}
                      </CardDescription>
                    </div>
                    {isCurrent && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        p.color === "indigo"
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                          : p.color === "purple"
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-500"
                          : isLight
                          ? "bg-zinc-100 border-zinc-200 text-zinc-600"
                          : "bg-zinc-900 border-zinc-850 text-zinc-400"
                      }`}>
                        Current Plan
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className={`text-4xl font-black tracking-tight ${isLight ? "text-zinc-950" : "text-white"}`}>
                      {p.price}
                    </span>
                    <span className={`text-xs font-semibold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                      / month
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between pt-0 pb-6">
                  {/* Features List */}
                  <ul className="flex flex-col gap-3.5 mb-8">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-semibold">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          p.color === "indigo" ? "text-indigo-500" : p.color === "purple" ? "text-purple-500" : "text-zinc-400"
                        }`} />
                        <span className={isLight ? "text-zinc-700" : "text-zinc-300"}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Action */}
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={isCurrent || loadingPlan !== null}
                    className={`w-full py-3.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrent
                        ? isLight
                          ? "bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : "bg-zinc-900/60 border border-zinc-850 text-zinc-500 cursor-not-allowed"
                        : p.color === "indigo"
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg hover:shadow-indigo-500/10"
                        : p.color === "purple"
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-purple-500/10"
                        : isLight
                        ? "bg-zinc-950 hover:bg-zinc-800 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-750"
                    }`}
                  >
                    {loadingPlan === p.id ? (
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <>
                        {p.ctaText}
                        {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                      </>
                    )}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pricing FAQs or Policy Banner */}
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
          isLight 
            ? "bg-gradient-to-r from-zinc-50 to-indigo-50/20 border-zinc-200/70" 
            : "bg-gradient-to-r from-zinc-950 to-zinc-900/20 border-zinc-900"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isLight ? "bg-indigo-50" : "bg-indigo-500/10"}`}>
              <CreditCard className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h4 className={`text-sm font-extrabold ${isLight ? "text-zinc-900" : "text-white"}`}>
                Need a customized plan for Enterprise API scale?
              </h4>
              <p className={`text-xs mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                Contact our accounts desk for volume generation licensing, dedicated clusters, and fine-tuning.
              </p>
            </div>
          </div>
          <button className={`px-5 py-3 rounded-xl text-xs font-black tracking-wide uppercase cursor-pointer border transition-all ${
            isLight
              ? "bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50"
              : "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800"
          }`}>
            Contact Accounts Desk
          </button>
        </div>

      </div>
    </SidebarLayout>
  );
}
