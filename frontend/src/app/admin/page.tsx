"use client";

import React, { useState } from "react";
import { SidebarLayout } from "../../components/SidebarLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from "../../components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useToastStore } from "../../store/toast";
import { useAuthStore } from "../../store/auth";
import { useThemeStore } from "../../store/theme";
import { ShieldCheck, Users, TrendingUp, Cpu, Trash2, ShieldAlert, BadgeDollarSign } from "lucide-react";

export default function AdminPage() {
  const addToast = useToastStore((state) => state.addToast);
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuthStore();
  const isLight = theme === "light";

  // Load Admin Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const resp = await api.get("/admin/stats");
      return resp.data;
    }
  });

  // Load Users List
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const resp = await api.get("/admin/users");
      return resp.data;
    }
  });

  // Change Plan Mutation
  const changePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: number, plan: string }) => {
      const resp = await api.put(`/admin/users/${userId}/plan?plan=${plan}`);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      addToast("User plan updated successfully!", "success");
    },
    onError: () => {
      addToast("Failed to modify user plan.", "error");
    }
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      addToast("User deleted.", "info");
    },
    onError: () => {
      addToast("Could not remove user.", "error");
    }
  });

  if (!currentAdmin?.is_admin) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center text-center p-6 gap-3 ${isLight ? "bg-zinc-50" : "bg-zinc-950"}`}>
        <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
        <h2 className={`text-xl font-extrabold ${isLight ? "text-zinc-900" : "text-white"}`}>Access Denied</h2>
        <p className={`${isLight ? "text-zinc-500" : "text-zinc-500"} text-sm max-w-sm`}>
          Only registered platform administrators can view this console.
        </p>
      </div>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? "text-zinc-900" : "text-white"}`}>
            Admin Console
          </h1>
          <p className={`${isLight ? "text-zinc-550" : "text-zinc-400"} text-sm mt-1`}>
            Supervise user registrations, adjust subscription states, and review platform MRR telemetry.
          </p>
        </div>

        {/* Telemetry Widgets */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            <div className={`h-28 rounded-2xl ${isLight ? "bg-zinc-200" : "bg-zinc-900/40"}`} />
            <div className={`h-28 rounded-2xl ${isLight ? "bg-zinc-200" : "bg-zinc-900/40"}`} />
            <div className={`h-28 rounded-2xl ${isLight ? "bg-zinc-200" : "bg-zinc-900/40"}`} />
            <div className={`h-28 rounded-2xl ${isLight ? "bg-zinc-200" : "bg-zinc-900/40"}`} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-indigo-500 dark:text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? "text-zinc-450" : "text-zinc-400"}`}>
                    Total Users
                  </p>
                  <p className={`text-2xl font-black mt-0.5 ${isLight ? "text-zinc-900" : "text-white"}`}>
                    {stats?.users?.total || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-500">
                  <BadgeDollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? "text-zinc-450" : "text-zinc-400"}`}>
                    Estimated MRR
                  </p>
                  <p className="text-2xl font-black text-emerald-500 mt-0.5">
                    ${stats?.revenue?.estimated_monthly_recurring || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-violet-500/10 border border-violet-500/25 rounded-xl text-violet-500 dark:text-violet-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? "text-zinc-450" : "text-zinc-400"}`}>
                    Global Generations
                  </p>
                  <p className={`text-2xl font-black mt-0.5 ${isLight ? "text-zinc-900" : "text-white"}`}>
                    {stats?.usage?.total_comments_generated || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-500">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? "text-zinc-450" : "text-zinc-400"}`}>
                    Ollama State
                  </p>
                  <p className={`text-sm font-black mt-1 truncate max-w-[130px] ${isLight ? "text-zinc-850" : "text-white"}`}>
                    {stats?.health?.ollama_server || "Offline"} · {stats?.health?.ollama_default_model || "None"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management Grid */}
        <Card className={`border transition-colors duration-300 ${isLight ? "bg-white border-zinc-200 shadow-sm" : "border-zinc-900 bg-zinc-950/40 backdrop-blur-md"}`}>
          <CardHeader>
            <CardTitle>System Accounts Registry</CardTitle>
            <CardDescription className={isLight ? "text-zinc-500" : "text-zinc-400"}>
              Review usage levels, alter plans, or perform account purges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="h-40 bg-zinc-900/40 rounded-xl animate-pulse" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b font-bold uppercase tracking-wider ${isLight ? "border-zinc-200 text-zinc-450" : "border-zinc-900 text-zinc-500"}`}>
                      <th className="pb-3 px-4">User ID</th>
                      <th className="pb-3 px-4">Full Name</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4">Active Plan</th>
                      <th className="pb-3 px-4">Comments Used</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((usr: any) => (
                      <tr key={usr.id} className={`border-b transition-colors ${
                        isLight 
                          ? "border-zinc-100 hover:bg-zinc-50/50" 
                          : "border-zinc-900/60 hover:bg-zinc-950/40"
                      }`}>
                        <td className={`py-3.5 px-4 font-bold ${isLight ? "text-zinc-400" : "text-zinc-500"}`}>#{usr.id}</td>
                        <td className={`py-3.5 px-4 font-black ${isLight ? "text-zinc-850" : "text-zinc-200"}`}>{usr.full_name || "N/A"}</td>
                        <td className={`py-3.5 px-4 font-semibold ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{usr.email}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={usr.plan}
                            onChange={(e) => changePlanMutation.mutate({ userId: usr.id, plan: e.target.value })}
                            className={`border rounded-lg px-2 py-1 text-[11px] text-indigo-600 dark:text-indigo-300 focus:outline-none cursor-pointer ${
                              isLight ? "bg-zinc-50 border-zinc-200" : "bg-zinc-950 border-zinc-900"
                            }`}
                          >
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                            <option value="Business">Business</option>
                          </select>
                        </td>
                        <td className={`py-3.5 px-4 font-extrabold ${isLight ? "text-zinc-700" : "text-zinc-300"}`}>
                          {usr.comments_used_this_month}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {usr.id !== currentAdmin.id ? (
                            <button
                              onClick={() => {
                                if (confirm("Are you sure you want to permanently delete this user?")) {
                                  deleteUserMutation.mutate(usr.id);
                                }
                              }}
                              className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                                isLight
                                  ? "bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-rose-500"
                                  : "bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-550 hover:text-rose-400"
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className={`text-[10px] uppercase font-bold px-2 ${isLight ? "text-zinc-400" : "text-zinc-600"}`}>
                              Self
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
