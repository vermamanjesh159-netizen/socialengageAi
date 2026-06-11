import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into lines
  const lines = content.split("\n");

  // Inline formatting parser for bold (**text**)
  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="font-black text-zinc-950 dark:text-white">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 text-left">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Headings (e.g., ### Header)
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-xs font-black uppercase tracking-wider mt-4 mb-2 text-zinc-900 dark:text-zinc-100">
              {parseInlineMarkdown(trimmed.substring(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-sm font-black uppercase tracking-wide mt-5 mb-2 text-zinc-900 dark:text-zinc-100">
              {parseInlineMarkdown(trimmed.substring(3))}
            </h2>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h1 key={idx} className="text-base font-black mt-6 mb-3 text-zinc-900 dark:text-zinc-100">
              {parseInlineMarkdown(trimmed.substring(2))}
            </h1>
          );
        }

        // 2. Unordered List Items (e.g., * Item or - Item)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2.5 ml-1.5 my-1 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="text-indigo-500 dark:text-indigo-400 mt-1 select-none font-bold text-xs">•</span>
              <span className="flex-1">{parseInlineMarkdown(trimmed.substring(2))}</span>
            </div>
          );
        }

        // 3. Empty lines
        if (trimmed === "") {
          return <div key={idx} className="h-1" />;
        }

        // 4. Regular Paragraphs
        return (
          <p key={idx} className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {parseInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}
