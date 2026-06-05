"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { useToastStore } from "../store/toast";
import { useThemeStore } from "../store/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);
  const { theme } = useThemeStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const body = window.document.body;
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    if (theme === "light") {
      body.classList.remove("bg-zinc-950", "text-zinc-50");
      body.classList.add("bg-zinc-50", "text-zinc-950");
    } else {
      body.classList.remove("bg-zinc-50", "text-zinc-950");
      body.classList.add("bg-zinc-950", "text-zinc-50");
    }
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`p-4 rounded-xl shadow-2xl border text-sm font-medium backdrop-blur-md cursor-pointer transition-all duration-300 transform translate-y-0 scale-100 hover:scale-102 flex items-center justify-between animate-in slide-in-from-bottom-5 duration-200 ${
              t.type === "success"
                ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
                : t.type === "error"
                ? "bg-rose-950/80 border-rose-800 text-rose-200"
                : "bg-zinc-900/90 border-zinc-800 text-zinc-200"
            }`}
          >
            <span>{t.message}</span>
            <span className="text-xs opacity-50 ml-2">✕</span>
          </div>
        ))}
      </div>
    </QueryClientProvider>
  );
}
