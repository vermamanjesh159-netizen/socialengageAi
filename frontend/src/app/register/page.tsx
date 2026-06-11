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
import { Sparkles } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Password confirmation is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      // 1. Signup
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.fullName
      });
      
      // 2. Login
      const loginResp = await api.post("/auth/login", {
        username: data.email,
        password: data.password,
      });
      const { access_token, refresh_token } = loginResp.data;
      await login(access_token, refresh_token);
      
      addToast("Account created successfully!", "success");
      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { detail?: string } } };
      const errMsg = axiosError.response?.data?.detail || "Registration failed. Email might be in use.";
      addToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col gap-6">
        <Link href="/" className="flex items-center gap-2.5 justify-center">
          <Sparkles className="w-9 h-9 text-indigo-500 fill-indigo-500/20 animate-pulse" />
          <span className="font-black text-3xl tracking-tight text-white">
            AI Content <span className="text-indigo-500">Generator</span>
          </span>
        </Link>

        <Card className="border-zinc-800 bg-zinc-950/70">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-extrabold">Create your account</CardTitle>
            <CardDescription>Join today and start generating authentic copy.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                type="text"
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <Input
                label="Email Address"
                placeholder="you@example.com"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                error={errors.password?.message}
                {...register("password")}
              />

              <Input
                label="Confirm Password"
                placeholder="••••••••"
                type="password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button type="submit" className="w-full mt-2 font-bold" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-sm text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                  Sign in
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
