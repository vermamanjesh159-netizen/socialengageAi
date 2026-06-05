"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../../lib/api";
import { useToastStore } from "../../store/toast";
import { Input, Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui";
import { Zap } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const addToast = useToastStore((state) => state.addToast);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mockToken, setMockToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setLoading(true);
    try {
      const resp = await api.post("/auth/forgot-password", {
        email: data.email,
      });
      setSubmitted(true);
      if (resp.data.reset_token) {
        setMockToken(resp.data.reset_token);
      }
      addToast("Password reset request submitted!", "success");
    } catch (err: any) {
      addToast("Failed to request password reset.", "error");
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl font-extrabold">Reset your password</CardTitle>
            <CardDescription>
              We will send you a simulated link to reset your account credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button type="submit" className="w-full mt-2 font-bold" disabled={loading}>
                  {loading ? "Submitting request..." : "Request Reset Link"}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-5 text-center">
                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300">
                  Password reset request submitted successfully.
                </div>
                
                {mockToken && (
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/60 text-left">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-2">Simulated Developer Flow:</p>
                    <p className="text-xs text-zinc-300 mb-3">Since emails are simulated, click below to reset your password:</p>
                    <Link
                      href={`/reset-password?token=${mockToken}`}
                      className="inline-block w-full text-center text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-lg shadow-md transition-colors"
                    >
                      Reset Password Now
                    </Link>
                  </div>
                )}

                <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white mt-2">
                  Return to sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
