"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, Sparkles, ShieldCheck, ArrowRight, MessageSquare, ChevronDown, Check } from "lucide-react";
import { useAuthStore } from "../store/auth";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const user = useAuthStore((state) => state.user);

  const features = [
    {
      title: "Smart Replier Engine",
      desc: "Instantly draft context-aware reply variations to engage with commenters on your social feed.",
      icon: MessageSquare,
    },
    {
      title: "Local Ollama LLM Support",
      desc: "Fully containerized LLM support running locally (Llama 3, Mistral, etc.). No external API charges, total privacy.",
      icon: ShieldCheck,
    },
    {
      title: "Multi-platform Comment Automation",
      desc: "Instant customized engagement templates optimized for LinkedIn, Twitter/X, Instagram, YouTube, and more.",
      icon: Zap,
    },
    {
      title: "Advanced Safety & Quality Checks",
      desc: "Real-time AI evaluation scorecards measuring humanization percentage, spam triggers, duplicate detections, and grammatical flow.",
      icon: Sparkles,
    },
  ];

  const pricing = [
    {
      name: "Free Trial",
      price: "$0",
      desc: "Perfect for testing local generation capabilities.",
      features: [
        "100 Comments/Replies per month",
        "Ollama Local Model list",
        "Basic Safety & Quality ratings",
        "Multiple tone styles supported",
      ],
      cta: "Start Free",
      link: "/register",
      popular: false,
    },
    {
      name: "Professional Plan",
      price: "$15",
      desc: "Ideal for growth hackers and content developers.",
      features: [
        "5,000 Comments/Replies per month",
        "All Platform Tone Styles unlocked",
        "Bulk comment variation generator (up to 5)",
        "CSV & JSON History export",
      ],
      cta: "Upgrade to Pro",
      link: "/register",
      popular: true,
    },
    {
      name: "Business Unlimited",
      price: "$49",
      desc: "Perfect for agencies and multi-account managers.",
      features: [
        "Unlimited generation logs",
        "Advanced Quality checks (Spam/Duplicate)",
        "Priority local model pulling support",
        "Direct Admin telemetry tools",
      ],
      cta: "Go Unlimited",
      link: "/register",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "What is SocialEngage AI?",
      a: "SocialEngage AI is a secure, local-first comment and reply generation platform. It connects directly with Ollama to let you leverage state-of-the-art open-source LLMs locally on your machine, eliminating high API subscription bills.",
    },
    {
      q: "How does local Ollama generation work?",
      a: "The platform runs an internal Ollama container which manages open-source models (like llama3, mistral, or phi3). Our backend queries your local Ollama port directly to generate highly customized and human-like social media comments.",
    },
    {
      q: "What are the Quality and Safety checks?",
      a: "Every comment goes through a safety pipeline verifying human likeness (Humanization Score), detecting potential platform spam keywords (Spam Check), confirming it doesn't repeat past comments (Duplicate Check), and matching platform length constraints (Quality Rating).",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-zinc-950/75 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500/10 animate-pulse" />
          <span className="font-extrabold text-xl text-white tracking-tight">SocialEngage <span className="text-indigo-500">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-4 py-2 rounded-xl transition-all shadow-lg shadow-indigo-600/20">
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm px-4 py-2 rounded-xl border border-zinc-700 transition-all">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 text-center max-w-4xl mx-auto flex flex-col items-center gap-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-400 tracking-wide uppercase shadow-inner">
          <Sparkles className="w-3.5 h-3.5" /> Local-first LLM Social Automation
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
          Personalize Your <br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Social Engagement
          </span>
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          Generate organic, authentic comments and replies using local open-source LLMs. Scale your LinkedIn, X, and Instagram presence securely.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Link href={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
            <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-indigo-600/25 cursor-pointer">
              Launch Local Hub <ArrowRight className="w-5 h-5" />
            </span>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <span className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-lg px-8 py-3.5 rounded-xl border border-zinc-800 transition-all cursor-pointer">
              Explore Tech Stack
            </span>
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white">Advanced Engagement Platform</h2>
          <p className="text-zinc-400 mt-3 font-medium">Everything required to automate your organic growth safely.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur hover:border-zinc-700 transition-all duration-300 flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="py-24 px-6 max-w-6xl mx-auto w-full border-t border-zinc-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white">Simple Pricing, No API markups</h2>
          <p className="text-zinc-400 mt-3 font-medium">Connect your local Ollama runtime and start generating immediately.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricing.map((p, i) => (
            <div
              key={i}
              className={`p-8 rounded-2xl border flex flex-col justify-between relative bg-zinc-950/60 backdrop-blur ${
                p.popular
                  ? "border-indigo-500 shadow-2xl shadow-indigo-500/5 scale-102 z-10"
                  : "border-zinc-800"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full shadow">
                  Recommended
                </span>
              )}
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs text-zinc-400 mb-6">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">{p.price}</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                <ul className="flex flex-col gap-3.5 mb-8">
                  {p.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={p.link} className={`w-full text-center inline-flex items-center justify-center font-bold px-4 py-2.5 rounded-xl transition-all ${
                p.popular 
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg" 
                  : "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300"
              }`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-24 px-6 max-w-4xl mx-auto w-full border-t border-zinc-900">
        <h2 className="text-3xl font-extrabold text-white text-center mb-16">Frequently Asked Queries</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div key={i} className="border border-zinc-900 rounded-xl bg-zinc-950 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : i)}
                  className="flex items-center justify-between w-full p-5 text-left font-bold text-white hover:bg-zinc-900/20 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-zinc-900 bg-zinc-900/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 px-6 text-center text-sm text-zinc-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
            <span className="font-extrabold text-lg text-white tracking-tight">SocialEngage AI</span>
          </Link>
          <p>© {new Date().getFullYear()} SocialEngage AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
