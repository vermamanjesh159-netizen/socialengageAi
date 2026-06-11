"use client";

import React, { useState } from "react";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useToastStore } from "../../store/toast";
import { useThemeStore } from "../../store/theme";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  MessageSquare,
  Globe
} from "lucide-react";

interface GeneratedComment {
  id?: string | number;
  text: string;
  platform: string;
  style?: string;
  comment_type?: string;
  generation_time_ms?: number;
  humanization_score?: number;
  quality_rating?: number;
  spam_detected?: boolean;
  duplicate_detected?: boolean;
}

export default function PlaygroundPage() {
  const addToast = useToastStore((state) => state.addToast);
  const { theme } = useThemeStore();
  const isLight = theme === "light";

  // Selected Platform (Reddit is removed)
  const [platform, setPlatform] = useState("LinkedIn");
  const platforms = ["LinkedIn", "Twitter/X", "Instagram", "Facebook", "YouTube", "TikTok"];

  // Form states
  const [commentType, setCommentType] = useState("comment"); // "comment", "caption", "bio", "hashtags"
  const [contentText, setContentText] = useState("");
  const [activeCategory, setActiveCategory] = useState("Social & Engagement");

  const categories = [
    {
      name: "Social & Engagement",
      options: [
        { id: "comment", label: "Comment Generator" },
        { id: "caption", label: "Post Caption" },
        { id: "bio", label: "Profile Bio" },
        { id: "hashtags", label: "# Hashtag" },
        { id: "social_media_creator", label: "Social Media Content" }
      ]
    },
    {
      name: "Long-form & Blogs",
      options: [
        { id: "blog_article", label: "Blog & Article" },
        { id: "website_content", label: "Website Copy" },
        { id: "seo_content", label: "SEO Article" }
      ]
    },
    {
      name: "Marketing & Copy",
      options: [
        { id: "marketing_ad", label: "Marketing & Ads" },
        { id: "email", label: "Cold & Marketing Email" },
        { id: "newsletter", label: "Newsletter Edition" },
        { id: "product_description", label: "Product Description" }
      ]
    },
    {
      name: "Editing & Optimization",
      options: [
        { id: "rewriter_summarizer", label: "Rewrite & Summarize" },
        { id: "text_enhancer", label: "Text Enhancement" }
      ]
    }
  ];
  const [style, setStyle] = useState("Professional");
  const [temperature, setTemperature] = useState<number>(0.8);
  const [length, setLength] = useState("medium");
  const [generateCount, setGenerateCount] = useState<number>(3); // Default to 3 variations
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [webSearch, setWebSearch] = useState(false);


  // Load Platform Details for guidelines
  const { data: platDetails } = useQuery({
    queryKey: ["platform-details", platform],
    queryFn: async () => {
      const resp = await api.get(`/platforms/${platform}`);
      return resp.data;
    }
  });

  // Dynamic Brand Colors helper
  const getPlatformColors = (plat: string) => {
    switch (plat) {
      case "LinkedIn":
        return {
          bg: "bg-[#0A66C2]",
          hover: "hover:bg-[#0A529C]",
          text: "text-[#0A66C2]",
          border: "border-[#0A66C2]",
          badge: "bg-[#0A66C2]/10 border-[#0A66C2]/20 text-[#0A66C2]",
          shadow: "shadow-[#0A66C2]/15"
        };
      case "Twitter/X":
        return {
          bg: isLight ? "bg-zinc-900" : "bg-[#1DA1F2]",
          hover: isLight ? "hover:bg-zinc-800" : "hover:bg-[#1A91DA]",
          text: isLight ? "text-zinc-900" : "text-[#1DA1F2]",
          border: isLight ? "border-zinc-300" : "border-[#1DA1F2]",
          badge: isLight ? "bg-zinc-100 border-zinc-200 text-zinc-800" : "bg-[#1DA1F2]/10 border-[#1DA1F2]/20 text-[#1DA1F2]",
          shadow: "shadow-zinc-900/15"
        };
      case "Instagram":
        return {
          bg: "bg-gradient-to-r from-[#FCAF45] via-[#E1306C] to-[#C13584]",
          hover: "hover:opacity-90",
          text: "text-[#E1306C]",
          border: "border-[#E1306C]",
          badge: "bg-[#E1306C]/10 border-[#E1306C]/20 text-[#E1306C]",
          shadow: "shadow-[#E1306C]/15"
        };
      case "Facebook":
        return {
          bg: "bg-[#1877F2]",
          hover: "hover:bg-[#1565D8]",
          text: "text-[#1877F2]",
          border: "border-[#1877F2]",
          badge: "bg-[#1877F2]/10 border-[#1877F2]/20 text-[#1877F2]",
          shadow: "shadow-[#1877F2]/15"
        };
      case "YouTube":
        return {
          bg: "bg-[#FF0000]",
          hover: "hover:bg-[#CC0000]",
          text: "text-[#FF0000]",
          border: "border-[#FF0000]",
          badge: "bg-[#FF0000]/10 border-[#FF0000]/20 text-[#FF0000]",
          shadow: "shadow-[#FF0000]/15"
        };
      case "TikTok":
        return {
          bg: "bg-gradient-to-r from-[#00F2FE] to-[#FE0979]",
          hover: "hover:opacity-90",
          text: "text-[#00F2FE] dark:text-[#FE0979]",
          border: "border-[#00F2FE] dark:border-[#FE0979]",
          badge: "bg-[#00F2FE]/10 dark:bg-[#FE0979]/10 border-[#00F2FE]/20 dark:border-[#FE0979]/20 text-[#00F2FE] dark:text-[#FE0979]",
          shadow: "shadow-[#00F2FE]/15"
        };
      default:
        return {
          bg: "bg-indigo-600",
          hover: "hover:bg-indigo-500",
          text: "text-indigo-650",
          border: "border-indigo-500",
          badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-555",
          shadow: "shadow-indigo-600/15"
        };
    }
  };

  // Get Platform Brand Icon (Custom SVGs for compatibility)
  const getPlatformIcon = (plat: string, className = "w-4 h-4") => {
    switch (plat) {
      case "LinkedIn":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0A66C2"/>
          </svg>
        );
      case "Twitter/X":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case "Instagram":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        );
      case "Facebook":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" fill="#1877F2"/>
          </svg>
        );
      case "YouTube":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000"/>
          </svg>
        );
      case "TikTok":
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.52-4.06-1.39-.4-.3-.76-.64-1.09-1.02v6.62c.04 1.83-.53 3.73-1.8 5.02-1.39 1.46-3.48 2.12-5.5 1.95-2.03-.12-4.04-1.22-5.07-2.99-1.16-1.92-1.25-4.51-.23-6.52 1.05-2.1 3.33-3.42 5.67-3.41v4.01c-1.21-.06-2.52.54-3.09 1.63-.58 1.05-.41 2.48.42 3.38.8.89 2.15 1.16 3.19.64.91-.42 1.42-1.39 1.41-2.39V.02z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  // Copy Clipboard Helper
  const copyToClipboard = (text: string, id: string | number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Generation response list
  const [results, setResults] = useState<GeneratedComment[]>([]);

  // Generation Mutation (Bulk generation)
  const generateMutation = useMutation({
    mutationFn: async () => {
      const endpoint = "/comments/generate-bulk";
      const payload = {
        platform,
        content_text: contentText,
        comment_style: style,
        persona_id: null,
        temperature,
        generate_count: generateCount,
        comment_length: length,
        comment_type: commentType,
        web_search: webSearch
      };
      const resp = await api.post(endpoint, payload);
      return resp.data;
    },
    onSuccess: (data: { comments?: GeneratedComment[] }) => {
      const newComments = data.comments || [];
      setResults((prev) => [...newComments, ...prev]);
      addToast(`Generated ${newComments.length} items successfully!`, "success");
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const msg = axiosError.response?.data?.detail || "Generation failed. Please verify Ollama is active.";
      addToast(msg, "error");
    }
  });

  const getMetricColor = (val: number) => {
    if (val >= 80) return "text-emerald-500 dark:text-emerald-400";
    if (val >= 60) return "text-indigo-500 dark:text-indigo-400";
    return "text-amber-500 dark:text-amber-400";
  };

  const getQualityLabel = (rating: number) => {
    switch (rating) {
      case 5: return "Premium Fit";
      case 4: return "High Quality";
      case 3: return "Satisfactory";
      default: return "Basic Fit";
    }
  };

  // Dynamic Text area label and placeholder helpers
  const getTextAreaDetails = () => {
    switch (commentType) {
      case "caption":
        return {
          label: "Topic Idea / Article Outline",
          placeholder: "Enter a brief topic idea or post outline to generate a catchy caption..."
        };
      case "bio":
        return {
          label: "Your profile details / Career background",
          placeholder: "Describe your current role, key accomplishments, and target audience..."
        };
      case "hashtags":
        return {
          label: "Target post text / Content",
          placeholder: "Paste your social media post body to extract hashtags for..."
        };
      case "blog_article":
        return {
          label: "Article Topic / Detailed Outline",
          placeholder: "Enter the subject, key headings, or bullet points for the blog post/article..."
        };
      case "social_media_creator":
        return {
          label: "Post Topic / Ideas",
          placeholder: "Describe what you want the social media post to be about..."
        };
      case "marketing_ad":
        return {
          label: "Product or Service details",
          placeholder: "Describe the product/service, target audience, and main unique selling points..."
        };
      case "email":
        return {
          label: "Email Topic & Target Audience",
          placeholder: "Describe the goal of the email, target recipient, and key points to cover..."
        };
      case "newsletter":
        return {
          label: "Newsletter Topic & Outline",
          placeholder: "Specify the main updates, news articles, or topics for the newsletter edition..."
        };
      case "product_description":
        return {
          label: "Product Features / Specifications",
          placeholder: "List features, size, material, or specifications of the product..."
        };
      case "website_content":
        return {
          label: "Page Purpose / Branding guidelines",
          placeholder: "Describe the page/section goal (e.g. Landing Page Hero, About Us) and key messaging..."
        };
      case "seo_content":
        return {
          label: "Target Keywords & Topic",
          placeholder: "Specify the main keywords to target and the article context..."
        };
      case "rewriter_summarizer":
        return {
          label: "Original text to Summarize/Rewrite",
          placeholder: "Paste the text you want summarized and polished..."
        };
      case "text_enhancer":
        return {
          label: "Draft text to Enhance",
          placeholder: "Paste your raw copy here to optimize its grammar, flow, and clarity..."
        };
      default:
        return {
          label: "Post Content / Video Description",
          placeholder: "Paste the post contents or target description to engage with..."
        };
    }
  };

  const getGenerateButtonText = () => {
    if (generateMutation.isPending) return "Analyzing & Generating...";
    switch (commentType) {
      case "caption":
        return "Generate Catchy Captions";
      case "bio":
        return "Generate Bio Ideas";
      case "hashtags":
        return "Generate Hashtag Pack";
      case "blog_article":
        return "Generate Blog Article";
      case "social_media_creator":
        return "Generate Social Update";
      case "marketing_ad":
        return "Generate Ad Copy";
      case "email":
        return "Generate Email Template";
      case "newsletter":
        return "Generate Newsletter Edition";
      case "product_description":
        return "Generate Product Copy";
      case "website_content":
        return "Generate Page Content";
      case "seo_content":
        return "Generate SEO Article";
      case "rewriter_summarizer":
        return "Summarize & Rewrite";
      case "text_enhancer":
        return "Optimize & Enhance";
      default:
        return "Generate Comments Set";
    }
  };

  const currentPlatColors = getPlatformColors(platform);
  const textDetails = getTextAreaDetails();

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
            AI Content Generator Playground
          </h1>
          <p className={`${isLight ? "text-zinc-500" : "text-zinc-400"} text-sm mt-1.5 max-w-3xl leading-relaxed`}>
            Experiment and generate high-quality copy instantly. Select your category, set your custom parameters, and preview generated output alongside quality scorecard checks.
          </p>
        </div>

        {/* Platform Selector Tabs with brand colors */}
        <div className={`flex gap-2 overflow-x-auto pb-2 border-b scrollbar-none ${isLight ? "border-zinc-200" : "border-zinc-900"}`}>
          {platforms.map((p) => {
            const isSelected = platform === p;
            const itemColors = getPlatformColors(p);
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? `${itemColors.bg} text-white border-transparent shadow-lg ${itemColors.shadow}`
                    : isLight
                    ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                    : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {getPlatformIcon(p, "w-3.5 h-3.5")}
                {p}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Input Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200/80 shadow-sm" : "bg-zinc-950/40 border-zinc-900 backdrop-blur-md"}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className={`w-5 h-5 ${currentPlatColors.text}`} /> Generator Setup
                </CardTitle>
                <CardDescription className={isLight ? "text-zinc-500" : "text-zinc-400"}>
                  Configure target topic contents and style guides.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {/* Generation Objective Selector - Compact Tabbed Grid */}
                <div className="flex flex-col gap-3">
                  <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                    Generation Objective
                  </label>
                  
                  {/* Category Pill Tabs */}
                  <div className={`flex gap-1 p-1 rounded-xl border ${isLight ? "bg-zinc-100/80 border-zinc-200" : "bg-zinc-950/80 border-zinc-900"}`}>
                    {categories.map((cat) => {
                      const isCatActive = activeCategory === cat.name;
                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setActiveCategory(cat.name)}
                          className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isCatActive
                              ? isLight
                                ? "bg-white text-zinc-950 shadow-sm"
                                : "bg-zinc-900 text-white shadow-md border border-zinc-800"
                              : isLight
                              ? "text-zinc-500 hover:text-zinc-900"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          {cat.name.split(" & ")[0]}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Category Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5">
                    {categories
                      .find((cat) => cat.name === activeCategory)
                      ?.options.map((opt) => {
                        const isSelected = opt.id === commentType;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setCommentType(opt.id);
                              setContentText("");
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                              isSelected
                                ? `${currentPlatColors.bg} border-transparent text-white font-extrabold shadow-md`
                                : isLight
                                ? "bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100/60 hover:text-zinc-950"
                                : "bg-zinc-950/80 border-zinc-900 text-zinc-350 hover:bg-zinc-900/60 hover:text-white"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Topic / Post Content */}
                <div className="flex flex-col gap-2">
                  <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                    {textDetails.label}
                  </label>
                  <textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder={textDetails.placeholder}
                    rows={4}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all ${
                      isLight 
                        ? "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-350 focus:bg-white" 
                        : "bg-zinc-950/80 border-zinc-900 text-zinc-100 placeholder-zinc-600 focus:border-zinc-700"
                    }`}
                  />
                  <div className={`flex justify-between items-center text-[10px] font-semibold uppercase ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                    <span>Platform Rules: {platDetails?.rules || "Standard length"}</span>
                    <span>{contentText.length} chars</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Comment Tone */}
                  <div className="flex flex-col gap-2">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                      Tone / Style
                    </label>
                    <select
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      className={`border rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? "bg-zinc-50 border-zinc-200 text-zinc-800"
                          : "bg-zinc-950/80 border-zinc-900 text-zinc-300"
                      }`}
                    >
                      <option value="Friendly" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Friendly</option>
                      <option value="Professional" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Professional</option>
                      <option value="Expert" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Expert / Thought Leader</option>
                      <option value="Curious" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Curious Question</option>
                      <option value="Funny" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Funny / Witty</option>
                      <option value="Contrarian" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Contrarian Perspective</option>
                    </select>
                  </div>

                  {/* Variation Count */}
                  <div className="flex flex-col gap-2">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                      Variation Options
                    </label>
                    <select
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                      className={`border rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? "bg-zinc-50 border-zinc-200 text-zinc-800"
                          : "bg-zinc-950/80 border-zinc-900 text-zinc-300"
                      }`}
                    >
                      <option value="3" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>3 Variations</option>
                      <option value="4" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>4 Variations</option>
                      <option value="5" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>5 Variations</option>
                    </select>
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                      Output Length
                    </label>
                    <select
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className={`border rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer ${
                        isLight
                          ? "bg-zinc-50 border-zinc-200 text-zinc-800"
                          : "bg-zinc-950/80 border-zinc-900 text-zinc-300"
                      }`}
                    >
                      <option value="short" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Short (1-2 sentences)</option>
                      <option value="medium" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Medium (2-3 sentences)</option>
                      <option value="long" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>Long (Detailed context)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                      Creativity (Temp)
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="0.2"
                        max="1.2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                      <span className={`text-xs font-bold w-8 text-right ${isLight ? "text-zinc-700" : "text-zinc-400"}`}>
                        {temperature}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Real-time Web Search Toggle */}
                <div className={`p-4 border rounded-xl flex items-center justify-between transition-colors ${
                  isLight ? "bg-zinc-50 border-zinc-200/80" : "bg-zinc-950/40 border-zinc-900"
                }`}>
                  <div className="flex gap-2.5 items-start max-w-[80%]">
                    <Globe className="w-4.5 h-4.5 mt-0.5 text-indigo-500 shrink-0" />
                    <div>
                      <h4 className={`text-xs font-bold ${isLight ? "text-zinc-800" : "text-white"}`}>Real-Time Web Search</h4>
                      <p className={`text-[10px] mt-0.5 leading-normal ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                        Gather and analyze the latest news and web info before generating.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWebSearch(!webSearch)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      webSearch ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        webSearch ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Dynamic Brand Styled Generate Button */}
                <button
                  onClick={() => generateMutation.mutate()}
                  disabled={!contentText.trim() || generateMutation.isPending}
                  className={`w-full py-3.5 mt-2 font-black tracking-wider uppercase text-xs flex items-center justify-center gap-2 rounded-xl border border-transparent text-white transition-all cursor-pointer ${currentPlatColors.bg} ${currentPlatColors.hover} ${currentPlatColors.shadow}`}
                >
                  {generateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white fill-white/10" />
                  )}
                  {getGenerateButtonText()}
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Output Dashboard Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <h2 className={`text-xs font-black uppercase tracking-wider px-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              Generated Output & Quality Telemetry
            </h2>

            {results.length === 0 ? (
              <div className={`border border-dashed rounded-2xl py-24 flex flex-col items-center justify-center text-center px-6 gap-3 ${
                isLight ? "border-zinc-200 bg-zinc-100/30" : "border-zinc-900 bg-zinc-950/10"
              }`}>
                <MessageSquare className={`w-10 h-10 animate-bounce ${isLight ? "text-zinc-300" : "text-zinc-800"}`} />
                <div>
                  <p className={`text-sm font-bold ${isLight ? "text-zinc-600" : "text-zinc-500"}`}>
                    Playground Workspace is Empty
                  </p>
                  <p className={`text-xs mt-1 max-w-sm ${isLight ? "text-zinc-500" : "text-zinc-600"}`}>
                    Provide details in the generator panel on the left and hit generate to initiate AI comments.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {results.map((res: GeneratedComment, index: number) => {
                  const cardPlatColors = getPlatformColors(res.platform);
                  return (
                    <Card key={res.id || index} className={`border transition-all duration-300 relative overflow-hidden ${
                      isLight 
                        ? "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm" 
                        : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 backdrop-blur-md"
                    }`}>
                      {/* Top Brand Color Border Strip */}
                      <div className={`h-1 w-full absolute top-0 left-0 right-0 ${cardPlatColors.bg}`} />
                      
                      <CardHeader className={`pb-3 border-b flex flex-row items-center justify-between gap-4 pt-5.5 ${isLight ? "border-zinc-100" : "border-zinc-900/60"}`}>
                        <div>
                          <CardTitle className={`text-xs font-black tracking-wider uppercase flex items-center gap-2 ${isLight ? "text-zinc-700" : "text-zinc-400"}`}>
                            {getPlatformIcon(res.platform, "w-4 h-4")}
                            {res.platform} · <span className={cardPlatColors.text}>{res.style || "Standard"} Style</span>
                          </CardTitle>
                          <CardDescription className={`text-[10px] uppercase font-semibold mt-0.5 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                            Type: {res.comment_type || "Comment"} · Generated in {res.generation_time_ms || 320}ms
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(res.text, res.id || index)}
                            className={`p-2 border rounded-xl transition-all cursor-pointer ${
                              isLight
                                ? "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900"
                                : "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {copiedId === (res.id || index) ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-4 flex flex-col gap-5">
                        {/* Generated Text */}
                        <div className={`p-4 border rounded-xl select-all ${
                          isLight
                            ? "text-zinc-800 bg-zinc-50/50 border-zinc-100"
                            : "text-zinc-100 bg-zinc-950/40 border-zinc-900/60"
                        }`}>
                          <MarkdownRenderer content={res.text} />
                        </div>

                        {/* Quality Scorecard Grid */}
                        <div className={`grid grid-cols-4 gap-4 border rounded-xl p-3.5 text-center items-center ${
                          isLight ? "bg-zinc-50/50 border-zinc-200" : "bg-zinc-950/60 border-zinc-900/80"
                        }`}>
                          <div className={`flex flex-col gap-1 border-r ${isLight ? "border-zinc-200" : "border-zinc-900"}`}>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                              Human Likeness
                            </span>
                            <span className={`text-sm font-black ${getMetricColor(res.humanization_score || 85)}`}>
                              {res.humanization_score || 85}%
                            </span>
                          </div>

                          <div className={`flex flex-col gap-1 border-r ${isLight ? "border-zinc-200" : "border-zinc-900"}`}>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                              Quality Fit
                            </span>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-300">
                              {getQualityLabel(res.quality_rating || 4)}
                            </span>
                          </div>

                          <div className={`flex flex-col gap-1 border-r ${isLight ? "border-zinc-200" : "border-zinc-900"}`}>
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                              Spam Trigger
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${res.spam_detected ? "text-rose-500" : "text-emerald-500"}`}>
                              {res.spam_detected ? "⚠️ Spam Alert" : "🛡️ Clean"}
                            </span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                              Duplicate
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider ${res.duplicate_detected ? "text-rose-500" : "text-emerald-500"}`}>
                              {res.duplicate_detected ? "⚠️ Repeated" : "🛡️ Unique"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
