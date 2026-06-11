import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI Content Generator | Local LLM Content Generation SaaS",
  description: "Automate and personalize your social media comments, articles, emails, marketing copy and more using local Ollama LLMs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen bg-zinc-950 text-zinc-50 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
