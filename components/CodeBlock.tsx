"use client";

import React, { useState, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import { Check, Copy, Terminal } from "lucide-react";

// Disable automatic DOM modification by Prism to prevent React hydration mismatches
Prism.manual = true;

interface CodeBlockProps {
  code: string;
  language?: string;
  theme?: "dark" | "light" | "sepia" | "oled";
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "javascript", theme = "dark" }) => {
  const [copied, setCopied] = useState(false);

  const cleanLang = language.toLowerCase().trim() || "javascript";
  
  const highlightedCode = useMemo(() => {
    try {
      const grammar = Prism.languages[cleanLang] || Prism.languages.javascript;
      if (grammar) {
        return Prism.highlight(code, grammar, cleanLang);
      }
    } catch {
      // Fallback to basic HTML escape
    }
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }, [code, cleanLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const isLightMode = theme === "light";

  return (
    <div
      id={`code-block-${cleanLang}`}
      className={`my-6 rounded-xl border overflow-hidden text-left font-mono text-sm shadow-md transition-colors ${
        isLightMode
          ? "bg-slate-900 border-slate-700 text-slate-100"
          : theme === "oled"
          ? "bg-black border-zinc-800 text-zinc-100"
          : theme === "sepia"
          ? "bg-[#251c14] border-[#443322] text-[#ecd8be]"
          : "bg-slate-950 border-slate-800 text-slate-100"
      }`}
      style={{ direction: "ltr" }}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-semibold">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span className="uppercase tracking-wider text-blue-300">{cleanLang}</span>
        </div>
        <button
          id={`copy-btn-${cleanLang}`}
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs text-slate-200"
          title="کپی قطعه کد"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">کپی شد</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>کپی کد</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto">
        <pre
          tabIndex={0}
          suppressHydrationWarning
          className="!bg-transparent !p-0 !m-0"
        >
          <code
            className={`language-${cleanLang}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
};

