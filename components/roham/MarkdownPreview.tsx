"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  AlertTriangle,
  Info,
  Terminal,
  ExternalLink,
} from "lucide-react";

interface MarkdownPreviewProps {
  markdown: string;
  className?: string;
  theme?: "dark" | "light";
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  markdown,
  className = "",
  theme = "dark",
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper to parse inline styles (bold, italic, code, link)
  const renderInline = (text: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        tokens.push(
          <code
            key={key++}
            dir="ltr"
            className="font-mono text-[12px] bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded border border-slate-700 mx-0.5"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Bold: **text**
      const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (boldMatch) {
        tokens.push(
          <strong key={key++} className="font-extrabold text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Italic: *text*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        tokens.push(
          <em key={key++} className="italic text-slate-300">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Link: [text](url)
      const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        tokens.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 inline-flex items-center gap-0.5"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 inline-block" />
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Normal text chunk up to next special char
      const nextSpecial = remaining.search(/[`*\[]/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        // Stray special char
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        tokens.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return tokens;
  };

  // Block parser
  const renderBlocks = () => {
    if (!markdown || markdown.trim().length === 0) {
      return (
        <div className="text-center py-12 text-slate-500 font-mono text-xs">
          متن Markdown هنوز وارد نشده است. در ویرایشگر بنویسید تا پیش‌نمایش در اینجا ظاهر شود.
        </div>
      );
    }

    const lines = markdown.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let elementKey = 0;
    let codeBlockCounter = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Empty line
      if (trimmed === "") {
        i++;
        continue;
      }

      // Code Block: ```lang
      if (trimmed.startsWith("```")) {
        const lang = trimmed.slice(3).trim() || "bash";
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }
        if (i < lines.length && lines[i].trim().startsWith("```")) {
          i++; // skip closing ```
        }
        const fullCode = codeLines.join("\n");
        const codeIndex = codeBlockCounter++;
        const isCopied = copiedCodeIdx === codeIndex;

        elements.push(
          <div
            key={`code-${elementKey++}`}
            dir="ltr"
            className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-lg text-left"
          >
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800/80 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider ml-1">
                  <Terminal className="w-3.5 h-3.5" />
                  {lang}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(fullCode, codeIndex)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
                title="کپی کردن کد"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>کپی</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        continue;
      }

      // Headings: #, ##, ###, ####
      if (trimmed.startsWith("#")) {
        const levelMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (levelMatch) {
          const level = levelMatch[1].length;
          const text = levelMatch[2];
          const headingContent = renderInline(text);

          if (level === 1) {
            elements.push(
              <h1
                key={`h1-${elementKey++}`}
                className="text-2xl font-black text-white mt-8 mb-4 pb-2 border-b border-slate-800"
              >
                {headingContent}
              </h1>
            );
          } else if (level === 2) {
            elements.push(
              <h2
                key={`h2-${elementKey++}`}
                className="text-xl font-extrabold text-white mt-7 mb-3 pb-1.5 border-b border-slate-800/60 flex items-center gap-2"
              >
                <span className="w-1.5 h-5 bg-emerald-500 rounded-full inline-block shrink-0" />
                <span>{headingContent}</span>
              </h2>
            );
          } else if (level === 3) {
            elements.push(
              <h3
                key={`h3-${elementKey++}`}
                className="text-lg font-bold text-slate-100 mt-5 mb-2"
              >
                {headingContent}
              </h3>
            );
          } else {
            elements.push(
              <h4
                key={`h4-${elementKey++}`}
                className="text-base font-semibold text-slate-200 mt-4 mb-2"
              >
                {headingContent}
              </h4>
            );
          }
          i++;
          continue;
        }
      }

      // Horizontal Rule: ---, ***, ___
      if (/^(---|\*\*\*|___)$/.test(trimmed)) {
        elements.push(
          <hr
            key={`hr-${elementKey++}`}
            className="my-6 border-t border-slate-800"
          />
        );
        i++;
        continue;
      }

      // Blockquote / Callout: >
      if (trimmed.startsWith(">")) {
        const quoteLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith(">")) {
          quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
          i++;
        }
        const quoteText = quoteLines.join("\n");
        const isWarning =
          quoteText.includes("⚠️") ||
          quoteText.includes("هشدار") ||
          quoteText.toLowerCase().includes("warning") ||
          quoteText.toLowerCase().includes("critical");
        const isTip =
          quoteText.includes("💡") ||
          quoteText.includes("نکته") ||
          quoteText.toLowerCase().includes("note") ||
          quoteText.toLowerCase().includes("tip");

        if (isWarning) {
          elements.push(
            <div
              key={`alert-${elementKey++}`}
              className="my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-line">
                {renderInline(quoteText)}
              </div>
            </div>
          );
        } else if (isTip) {
          elements.push(
            <div
              key={`tip-${elementKey++}`}
              className="my-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs leading-relaxed flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 whitespace-pre-line">
                {renderInline(quoteText)}
              </div>
            </div>
          );
        } else {
          elements.push(
            <blockquote
              key={`quote-${elementKey++}`}
              className="my-4 pr-4 border-r-4 border-emerald-500 bg-slate-900/60 p-3 rounded-l-xl text-slate-300 italic text-xs leading-relaxed"
            >
              <div className="whitespace-pre-line">{renderInline(quoteText)}</div>
            </blockquote>
          );
        }
        continue;
      }

      // Table: lines with |
      if (trimmed.includes("|") && trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        while (
          i < lines.length &&
          lines[i].trim().includes("|") &&
          lines[i].trim().startsWith("|")
        ) {
          tableLines.push(lines[i].trim());
          i++;
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0]
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());
          // Line 1 is typically delimiter |---|---|
          const bodyRows = tableLines.slice(2).map((r) =>
            r
              .split("|")
              .slice(1, -1)
              .map((c) => c.trim())
          );

          elements.push(
            <div
              key={`table-${elementKey++}`}
              className="my-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow"
            >
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900/90 text-slate-200 border-b border-slate-800 font-bold">
                  <tr>
                    {headerRow.map((cell, cIdx) => (
                      <th key={cIdx} className="px-3.5 py-2.5">
                        {renderInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {bodyRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx % 2 === 0
                          ? "bg-slate-950/40"
                          : "bg-slate-900/30 hover:bg-slate-900/60"
                      }
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 text-slate-300">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Unordered list: - or *
      if (/^[-*]\s+/.test(trimmed)) {
        const listItems: string[] = [];
        while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^[-*]\s+/, ""));
          i++;
        }
        elements.push(
          <ul
            key={`ul-${elementKey++}`}
            className="my-3 space-y-1.5 list-disc list-inside text-xs text-slate-300 leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="marker:text-emerald-400">
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Ordered list: 1. 2. 3.
      if (/^\d+\.\s+/.test(trimmed)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
          listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
          i++;
        }
        elements.push(
          <ol
            key={`ol-${elementKey++}`}
            className="my-3 space-y-1.5 list-decimal list-inside text-xs text-slate-300 leading-relaxed font-mono-marker"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="marker:text-emerald-400">
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Normal Paragraph: collect continuous text lines
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].trim().startsWith("#") &&
        !lines[i].trim().startsWith("```") &&
        !lines[i].trim().startsWith(">") &&
        !lines[i].trim().startsWith("|") &&
        !/^[-*]\s+/.test(lines[i].trim()) &&
        !/^\d+\.\s+/.test(lines[i].trim()) &&
        !/^(---|\*\*\*|___)$/.test(lines[i].trim())
      ) {
        paraLines.push(lines[i].trim());
        i++;
      }

      if (paraLines.length > 0) {
        elements.push(
          <p
            key={`p-${elementKey++}`}
            className="my-3 text-xs leading-relaxed text-slate-300"
          >
            {renderInline(paraLines.join(" "))}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div
      dir="rtl"
      className={`markdown-preview-container ${
        theme === "dark" ? "text-slate-200" : "text-slate-800"
      } ${className}`}
    >
      {renderBlocks()}
    </div>
  );
};
