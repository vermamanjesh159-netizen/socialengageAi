"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/auth";
import { useToastStore } from "../../store/toast";
import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";
import { Zap, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const resp = await api.post("/auth/login", {
        username: data.email,
        password: data.password,
      });
      const { access_token, refresh_token } = resp.data;
      await login(access_token, refresh_token);
      addToast("Signed in successfully!", "success");
      router.push("/dashboard");
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || "Invalid credentials. Please try again.";
      addToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Decorative Glowing Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2.5 justify-center">
          <Zap className="w-9 h-9 text-indigo-500 fill-indigo-500/20 animate-pulse" />
          <span className="font-black text-3xl tracking-tight text-white">SocialEngage <span className="text-indigo-500">AI</span></span>
        </Link>

        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold">Welcome back</CardTitle>
            <CardDescription>Enter your email below to access your local engagement hub.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="relative">
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-9.5 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end mt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-zinc-400 hover:text-indigo-400 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="w-full mt-2 font-bold" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-sm text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
