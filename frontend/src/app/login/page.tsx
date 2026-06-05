"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
      <div className="animate-pulse font-bold">Redirecting to Dashboard...</div>
    </div>
  );
}
