"use client";

import React, { useState } from "react";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Card, CardContent, Button } from "../../components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useToastStore } from "../../store/toast";
import { useThemeStore } from "../../store/theme";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { 
  Search, 
  Trash2, 
  FileJson, 
  FileSpreadsheet, 
  Clock
} from "lucide-react";

interface HistoryLog {
  id: number;
  platform: string;
  comment_type?: string;
  style?: string;
  input_content: string;
  output_content: string;
  humanization_score?: number;
  spam_detected?: boolean;
  duplicate_detected?: boolean;
  quality_rating?: number;
  generation_time_ms?: number;
  created_at: string;
}

export default function HistoryPage() {
  const addToast = useToastStore((state) => state.addToast);
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const isLight = theme === "light";

  // Filter States
  const [platform, setPlatform] = useState("");
  const [search, setSearch] = useState("");

  // Load History Logs
  const { data: logs, isLoading } = useQuery<HistoryLog[]>({
    queryKey: ["history", platform, search],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (platform) params.platform = platform;
      if (search) params.search = search;
      const resp = await api.get("/history", { params });
      return resp.data;
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      addToast("Log record cleared.", "info");
    },
    onError: () => {
      addToast("Failed to delete record.", "error");
    }
  });

  // Export Download Helper
  const downloadExport = async (format: "csv" | "json") => {
    try {
      const endpoint = `/history/export/${format}`;
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${API_URL}/api${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `socialengage_history_${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        addToast(`Successfully exported history as ${format.toUpperCase()}!`, "success");
      } else {
        addToast("Export failed.", "error");
      }
    } catch {
      addToast("Failed to execute export download.", "error");
    }
  };

  // Dynamic Brand Colors helper
  const getPlatformColors = (plat: string) => {
    switch (plat) {
      case "LinkedIn":
        return {
          bg: "bg-[#0A66C2]",
          text: "text-[#0A66C2]",
          border: "border-[#0A66C2]",
          badge: "bg-[#0A66C2]/10 border-[#0A66C2]/20 text-[#0A66C2]"
        };
      case "Twitter/X":
        return {
          bg: isLight ? "bg-zinc-900" : "bg-[#1DA1F2]",
          text: isLight ? "text-zinc-900" : "text-[#1DA1F2]",
          border: isLight ? "border-zinc-300" : "border-[#1DA1F2]",
          badge: isLight ? "bg-zinc-100 border-zinc-200 text-zinc-800" : "bg-[#1DA1F2]/10 border-[#1DA1F2]/20 text-[#1DA1F2]"
        };
      case "Instagram":
        return {
          bg: "bg-gradient-to-r from-[#FCAF45] via-[#E1306C] to-[#C13584]",
          text: "text-[#E1306C]",
          border: "border-[#E1306C]",
          badge: "bg-[#E1306C]/10 border-[#E1306C]/20 text-[#E1306C]"
        };
      case "Facebook":
        return {
          bg: "bg-[#1877F2]",
          text: "text-[#1877F2]",
          border: "border-[#1877F2]",
          badge: "bg-[#1877F2]/10 border-[#1877F2]/20 text-[#1877F2]"
        };
      case "YouTube":
        return {
          bg: "bg-[#FF0000]",
          text: "text-[#FF0000]",
          border: "border-[#FF0000]",
          badge: "bg-[#FF0000]/10 border-[#FF0000]/20 text-[#FF0000]"
        };
      case "TikTok":
        return {
          bg: "bg-gradient-to-r from-[#00F2FE] to-[#FE0979]",
          text: isLight ? "text-rose-600" : "text-[#FE0979]",
          border: isLight ? "border-[#00F2FE]" : "border-[#FE0979]",
          badge: "bg-[#00F2FE]/10 dark:bg-[#FE0979]/10 border-[#00F2FE]/20 dark:border-[#FE0979]/20 text-indigo-900 dark:text-[#FE0979]"
        };
      default:
        return {
          bg: "bg-indigo-600",
          text: "text-indigo-600",
          border: "border-indigo-500",
          badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        };
    }
  };

  // Custom Inline SVGs for brand compliance and component safety
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

  // Reddit is removed
  const platforms = ["LinkedIn", "Twitter/X", "Instagram", "Facebook", "YouTube", "TikTok"];

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-8">
        {/* Banner Greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
              Generation History
            </h1>
            <p className={`${isLight ? "text-zinc-500" : "text-zinc-400"} text-sm mt-1`}>
              Review, filter, and export all generated comments, replies, and quality metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => downloadExport("csv")}
              variant="outline"
              className={`font-bold text-xs flex items-center gap-2 ${
                isLight ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export CSV
            </Button>
            <Button
              onClick={() => downloadExport("json")}
              variant="outline"
              className={`font-bold text-xs flex items-center gap-2 ${
                isLight ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100" : "border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900"
              }`}
            >
              <FileJson className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Export JSON
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 w-full gap-4 items-center">
              <div className="relative flex-1">
                <Search className={`absolute left-3.5 top-3 w-4 h-4 ${isLight ? "text-zinc-400" : "text-zinc-500"}`} />
                <input
                  type="text"
                  placeholder="Search generated comments by input topic text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none ${
                    isLight 
                      ? "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:bg-white"
                      : "bg-zinc-950 border-zinc-900 text-zinc-100 placeholder-zinc-700 focus:border-zinc-700"
                  }`}
                />
              </div>

              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={`border rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-pointer ${
                  isLight
                    ? "bg-zinc-50 border-zinc-200 text-zinc-800"
                    : "bg-zinc-950 border-zinc-900 text-zinc-400 focus:border-zinc-700"
                }`}
              >
                <option value="" className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>All Platforms</option>
                {platforms.map((p) => (
                  <option key={p} value={p} className={isLight ? "text-zinc-900 bg-white" : "text-zinc-300 bg-zinc-950"}>{p}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* History Table List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="h-48 bg-zinc-900/40 rounded-2xl animate-pulse" />
          ) : logs?.length === 0 ? (
            <div className={`border border-dashed py-24 text-center rounded-2xl flex flex-col items-center justify-center gap-3 ${
              isLight ? "border-zinc-200 bg-zinc-100/30" : "border-zinc-900 bg-zinc-950/10"
            }`}>
              <Clock className={`w-9 h-9 ${isLight ? "text-zinc-400" : "text-zinc-800"}`} />
              <div>
                <p className={`text-sm font-bold ${isLight ? "text-zinc-600" : "text-zinc-400"}`}>No Logs Recorded</p>
                <p className={`text-xs mt-1 ${isLight ? "text-zinc-500" : "text-zinc-600"}`}>
                  Generate new comments or replies in the dashboard workspace to populate this audit table.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {logs?.map((log: HistoryLog) => {
                const logPlatColors = getPlatformColors(log.platform);
                return (
                  <Card key={log.id} className={`border transition-all duration-300 relative overflow-hidden ${
                    isLight 
                      ? "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm" 
                      : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md hover:border-zinc-800"
                  }`}>
                    {/* Top Brand Color Border Strip */}
                    <div className={`h-1 w-full absolute top-0 left-0 right-0 ${logPlatColors.bg}`} />
                    
                    <CardContent className="p-5 flex flex-col gap-4 pt-6.5">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`border text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                              isLight
                                ? logPlatColors.badge
                                : "bg-indigo-500/10 border-indigo-500/25 text-indigo-400"
                            }`}>
                              {getPlatformIcon(log.platform, "w-3 h-3")}
                              {log.platform}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isLight ? "bg-zinc-50 border-zinc-200 text-zinc-600" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}>
                              {log.style} Tone
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isLight ? "bg-zinc-50 border-zinc-200 text-zinc-500" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                            }`}>
                              {log.comment_type}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-1.5 font-semibold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                            Generated on {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteMutation.mutate(log.id)}
                          className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                            isLight
                              ? "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-500"
                              : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-500 hover:text-rose-400"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Inputs and Output details */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-5 flex flex-col gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                            Target Post Topic Input
                          </span>
                          <div className={`text-xs p-3 rounded-lg border line-clamp-3 ${
                            isLight ? "bg-zinc-50/50 border-zinc-200 text-zinc-700" : "bg-zinc-950/50 border-zinc-900/50 text-zinc-300"
                          }`}>
                            {log.input_content}
                          </div>
                        </div>

                        <div className="md:col-span-7 flex flex-col gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
                            AI Generated Response Output
                          </span>
                          <div className={`text-xs p-3 rounded-lg border select-all ${
                            isLight ? "bg-zinc-50/50 border-zinc-200 text-zinc-800" : "bg-zinc-950/50 border-zinc-900/50 text-zinc-200"
                          }`}>
                            <MarkdownRenderer content={log.output_content} />
                          </div>
                        </div>
                      </div>

                      {/* Telemetry stats */}
                      <div className={`flex flex-wrap gap-4 items-center justify-between border-t pt-3 text-[10px] uppercase font-bold ${
                        isLight ? "border-zinc-100 text-zinc-400" : "border-zinc-900/60 text-zinc-500"
                      }`}>
                        <div className="flex gap-4">
                          <span>Human Likeness: <span className="text-indigo-500 dark:text-indigo-400">{log.humanization_score}%</span></span>
                          <span>Spam: <span className={log.spam_detected ? "text-amber-500" : "text-emerald-500"}>{log.spam_detected ? "Detected" : "Clean"}</span></span>
                          <span>Duplicate: <span className={log.duplicate_detected ? "text-amber-500" : "text-emerald-500"}>{log.duplicate_detected ? "Detected" : "Clean"}</span></span>
                          <span>Quality: <span className="text-indigo-600 dark:text-indigo-400">{log.quality_rating}/5</span></span>
                        </div>
                        <div>
                          <span>Speed: <span className={isLight ? "text-zinc-500" : "text-zinc-400"}>{log.generation_time_ms}ms</span></span>
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
    </SidebarLayout>
  );
}
