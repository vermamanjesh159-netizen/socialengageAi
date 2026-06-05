"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../lib/api";
import { useToastStore } from "../../store/toast";
import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";
import { Zap } from "lucide-react";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Password confirmation is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(searchParams.get("token"));
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormValues) => {
    if (!token) {
      addToast("Invalid or missing reset token.", "error");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token: token,
        new_password: data.password,
      });
      addToast("Password reset successfully! Please log in.", "success");
      router.push("/login");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Failed to reset password. Link may have expired.";
      addToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-400 mb-4">No password reset token was provided.</p>
        <Link href="/login" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="New Password"
        placeholder="••••••••"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Confirm New Password"
        placeholder="••••••••"
        type="password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button type="submit" className="w-full mt-2 font-bold" disabled={loading}>
        {loading ? "Resetting password..." : "Confirm New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2.5 justify-center">
          <Zap className="w-9 h-9 text-indigo-500 fill-indigo-500/20" />
          <span className="font-black text-3xl tracking-tight text-white">InterviewPilot</span>
        </Link>

        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold">Set new password</CardTitle>
            <CardDescription>Enter your new password to restore account access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="text-center text-sm text-zinc-400">Loading token details...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
