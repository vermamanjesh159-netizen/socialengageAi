"use client";

import React, { useState } from "react";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input } from "../../components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useToastStore } from "../../store/toast";
import { useThemeStore } from "../../store/theme";
import { Cpu, CheckCircle2, XCircle, Trash2, Download, AlertTriangle, RefreshCw, Key } from "lucide-react";

interface OllamaModel {
  name: string;
  size?: number;
  parameters?: string;
}

export default function OllamaHubPage() {
  const addToast = useToastStore((state) => state.addToast);
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const isLight = theme === "light";

  // Model to pull state
  const [modelToPull, setModelToPull] = useState("");

  // Load Status & Models list
  const { data: statusData, isLoading, refetch } = useQuery({
    queryKey: ["ollama-status"],
    queryFn: async () => {
      const resp = await api.get("/ollama/status");
      return resp.data;
    }
  });

  // Load Groq Key
  const { data: groqData, refetch: refetchGroq } = useQuery({
    queryKey: ["groq-key"],
    queryFn: async () => {
      const resp = await api.get("/ollama/groq-key");
      return resp.data;
    }
  });

  // Pull Model Mutation
  const pullMutation = useMutation({
    mutationFn: async () => {
      const resp = await api.post("/ollama/pull", { model_name: modelToPull });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ollama-status"] });
      setModelToPull("");
      addToast(`Model pulled successfully!`, "success");
    },
    onError: (err: unknown) => {
      const apiErr = err as { response?: { data?: { detail?: string } } };
      const msg = apiErr.response?.data?.detail || "Pulling model failed. Verify network connection.";
      addToast(msg, "error");
    }
  });

  // Delete Model Mutation
  const deleteMutation = useMutation({
    mutationFn: async (modelName: string) => {
      const resp = await api.delete("/ollama/delete", { data: { model_name: modelName } });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ollama-status"] });
      addToast("Model removed from local machine.", "info");
    },
    onError: () => {
      addToast("Failed to delete model.", "error");
    }
  });

  // Set Default Mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (modelName: string) => {
      const resp = await api.post("/ollama/default", { model_name: modelName });
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ollama-status"] });
      addToast("Default model updated.", "success");
    },
    onError: () => {
      addToast("Failed to set default model.", "error");
    }
  });

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
              Ollama & LLM Local Hub
            </h1>
            <p className={`${isLight ? "text-zinc-500" : "text-zinc-400"} text-sm mt-1`}>
              Manage local open-source LLM instances, monitor server status, and configure Groq Cloud API connections.
            </p>
          </div>
          <Button
            onClick={() => {
              refetch();
              refetchGroq();
            }}
            variant="outline"
            className={`font-bold flex items-center gap-2 ${
              isLight ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100" : "border-zinc-800 bg-zinc-950/40"
            }`}
          >
            <RefreshCw className="w-4 h-4" /> Refresh Connection
          </Button>
        </div>

        {/* Status indicator row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200/80 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
            <CardContent className="p-6 flex items-center gap-4">
              {statusData?.available ? (
                <>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-500">
                    <CheckCircle2 className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                      Local Ollama Status
                    </p>
                    <p className="text-lg font-black text-emerald-500 mt-0.5">Online & Active</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-500">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                      Local Ollama Status
                    </p>
                    <p className="text-lg font-black text-rose-550 mt-0.5">Offline / Inactive</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200/80 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-500 dark:text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                  Ollama Default Model
                </p>
                <p className={`text-sm font-black mt-1 truncate max-w-[180px] ${isLight ? "text-zinc-800" : "text-white"}`}>
                  {statusData?.default_model || "None Selected"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200/80 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl text-violet-500 dark:text-violet-400">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                  Groq Cloud Status
                </p>
                <p className={`text-sm font-black mt-1 ${groqData?.configured ? "text-emerald-500" : "text-amber-500"}`}>
                  {groqData?.configured ? "✓ Configured & Active" : "⚠️ Needs Key"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Pull Model Card */}
            <Card className={`border transition-colors duration-300 ${
              isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"
            }`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Pull Model
                </CardTitle>
                <CardDescription className={isLight ? "text-zinc-500" : "text-zinc-400"}>
                  Download model weights from the Ollama public library.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input
                  label="Model Library Tag"
                  placeholder="e.g. llama3:latest, phi3, gemma:2b"
                  value={modelToPull}
                  onChange={(e) => setModelToPull(e.target.value)}
                  className={isLight ? "bg-zinc-50 border-zinc-200 text-zinc-900" : ""}
                />

                <div className={`p-3.5 border rounded-xl text-[11px] font-medium leading-relaxed flex gap-2 ${
                  isLight ? "bg-indigo-50/50 border-indigo-100 text-indigo-900" : "bg-indigo-950/30 border-indigo-900/60 text-indigo-200"
                }`}>
                  <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    <strong>Recommendation:</strong> Larger model downloads (7B+) can take several minutes. Consider <strong>gemma:2b</strong> or <strong>phi3</strong> for faster local testing.
                  </span>
                </div>

                <Button
                  onClick={() => pullMutation.mutate()}
                  disabled={!modelToPull.trim() || pullMutation.isPending}
                  className="w-full font-bold flex items-center justify-center gap-2"
                >
                  {pullMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Fetching & Allocating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Start Model Pull
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Groq API Config Card */}
            <Card className={`border transition-colors duration-300 ${
              isLight ? "bg-white border-zinc-200/80 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"
            }`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Groq Cloud Integration
                </CardTitle>
                <CardDescription className={isLight ? "text-zinc-500" : "text-zinc-400"}>
                  Groq Cloud completions connection status and configuration.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 p-4 border rounded-xl bg-zinc-950/20 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-900/60">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? "text-zinc-500" : "text-zinc-500"}`}>
                    Active API Key Configuration
                  </span>
                  <p className="text-xs font-mono font-bold tracking-widest mt-0.5">
                    {groqData?.configured 
                      ? `gsk_••••••••••••${groqData?.key ? groqData.key : "••••"}`
                      : "Not Configured (Using Ollama)"}
                  </p>
                </div>

                <div className={`p-3.5 border rounded-xl text-[11px] font-medium leading-relaxed flex gap-2 ${
                  isLight ? "bg-indigo-50/50 border-indigo-100 text-indigo-900" : "bg-indigo-950/30 border-indigo-900/60 text-indigo-200"
                }`}>
                  <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    For security reasons, the Groq API key is read-only on the dashboard and must be configured via the server&apos;s `.env` environment file.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Local Library Models Card */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className={`text-xs font-black uppercase tracking-wider px-1 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>
              Downloaded Model Library
            </h2>
            
            {isLoading ? (
              <div className="h-32 bg-zinc-900/40 rounded-2xl animate-pulse" />
            ) : !statusData?.models || statusData.models.length === 0 ? (
              <div className={`border border-dashed py-24 text-center rounded-2xl flex flex-col items-center justify-center gap-2 ${
                isLight ? "border-zinc-200 bg-zinc-100/30 text-zinc-400" : "border-zinc-900 bg-zinc-950/10 text-zinc-500"
              }`}>
                <Cpu className={`w-9 h-9 ${isLight ? "text-zinc-300" : "text-zinc-800"}`} />
                <span className="text-xs font-semibold uppercase">No models downloaded yet. Pull a library tag to begin.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {statusData.models.map((modelObj: OllamaModel) => {
                  const isDefault = statusData.default_model === modelObj.name;
                  const formattedSize = modelObj.size
                    ? `${(modelObj.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
                    : "Unknown size";
                  return (
                    <Card key={modelObj.name} className={`border transition-all duration-300 ${
                      isDefault 
                        ? isLight 
                          ? "border-indigo-300 bg-white shadow-sm"
                          : "border-indigo-500/50 bg-zinc-950/40 shadow-lg shadow-indigo-500/5" 
                        : isLight
                        ? "border-zinc-200 bg-white"
                        : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"
                    }`}>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Cpu className={`w-5 h-5 ${isDefault ? "text-indigo-500 dark:text-indigo-400" : isLight ? "text-zinc-400" : "text-zinc-500"}`} />
                          <div>
                            <p className={`text-sm font-bold ${isLight ? "text-zinc-800" : "text-white"}`}>{modelObj.name}</p>
                            <p className={`text-[10px] font-semibold uppercase ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>
                              {formattedSize} · params: {modelObj.parameters}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDefault ? (
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded-full">
                              ✓ Active Default
                            </span>
                          ) : (
                            <Button
                              onClick={() => setDefaultMutation.mutate(modelObj.name)}
                              size="sm"
                              variant="outline"
                              className={`font-bold text-xs ${
                                isLight ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100" : ""
                              }`}
                            >
                              Set Default
                            </Button>
                          )}

                          <button
                            onClick={() => deleteMutation.mutate(modelObj.name)}
                            className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                              isLight
                                ? "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-500"
                                : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-500 hover:text-rose-400"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
