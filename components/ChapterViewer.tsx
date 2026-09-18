"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Chapter, Highlight, ReaderPreferences } from "@/types/reader";
import { CodeBlock } from "./CodeBlock";
import { Sparkles, Highlighter, MessageSquare, BookOpen, Clock, Maximize2, X } from "lucide-react";

interface ChapterViewerProps {
  chapter: Chapter;
  preferences: ReaderPreferences;
  highlights: Highlight[];
  onWordClick: (word: string, surroundingSentence: string) => void;
  onSelectionAction: (selectedText: string, action: "translate" | "highlight" | "note") => void;
  onHighlightClick?: (highlight: Highlight) => void;
}

interface ContentPart {
  type: "text" | "code";
  content: string;
  language?: string;
}

type LineGroupType = "text" | "list" | "quote" | "table" | "image";

const isImageLine = (line: string) => /^!\[(.*?)\]\((.*?)\)/.test(line.trim());
const isHeadingLine = (line: string) => /^#{1,6}\s/.test(line.trimStart());
const isHrLine = (line: string) => /^(---|\*\*\*|___)\s*$/.test(line.trim());
const isListItemLine = (line: string) => /^(\*|-|•|\d+\.)\s+/.test(line.trimStart());
const isQuoteLine = (line: string) => /^>/.test(line.trimStart());
const isTableLine = (line: string) => line.includes("|") && line.trim().length > 1;

const lineGroupType = (line: string): LineGroupType | "heading" | "hr" => {
  if (isImageLine(line)) return "image";
  if (isHeadingLine(line)) return "heading";
  if (isHrLine(line)) return "hr";
  if (isListItemLine(line)) return "list";
  if (isQuoteLine(line)) return "quote";
  if (isTableLine(line)) return "table";
  return "text";
};

/**
 * Splits a block (already separated by blank lines) into sub-blocks by line
 * type, so Markdown structures (headings, lists, quotes, tables, rules, images) that
 * are only separated by single newlines are rendered correctly instead of
 * showing raw markers like "##" or "-" glued inside a paragraph.
 */
const splitMarkdownBlocks = (block: string): string[] => {
  const lines = block.split("\n");
  const out: string[] = [];
  let buffer: string[] = [];
  let bufferType: LineGroupType = "text";

  const flush = () => {
    if (buffer.length > 0) {
      out.push(buffer.join("\n"));
      buffer = [];
    }
  };

  for (const line of lines) {
    if (line.trim().length === 0) continue;

    const type = lineGroupType(line);

    if (type === "heading" || type === "hr" || type === "image") {
      flush();
      bufferType = "text";
      out.push(line.trim());
      continue;
    }

    if (type !== bufferType) {
      flush();
      bufferType = type;
    }
    buffer.push(line);
  }
  flush();

  return out;
};

export const ChapterViewer: React.FC<ChapterViewerProps> = ({
  chapter,
  preferences,
  highlights,
  onWordClick,
  onSelectionAction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingMenu, setFloatingMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: "" });
  const [activeModalImage, setActiveModalImage] = useState<{ src: string; alt: string } | null>(null);

  // Parse markdown into text chunks and code blocks
  const contentParts: ContentPart[] = useMemo(() => {
    const raw = chapter.content;
    const parts: ContentPart[] = [];
    const codeRegex = /```([a-zA-Z0-9_\-#+]*)\n([\s\S]*?)```/g;
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = codeRegex.exec(raw)) !== null) {
      if (match.index > lastIdx) {
        parts.push({
          type: "text",
          content: raw.substring(lastIdx, match.index),
        });
      }
      parts.push({
        type: "code",
        language: match[1] || "text",
        content: match[2].trimEnd(),
      });
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < raw.length) {
      parts.push({
        type: "text",
        content: raw.substring(lastIdx),
      });
    }

    return parts;
  }, [chapter.content]);

  // Handle text selection (desktop & mobile)
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setFloatingMenu((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 1 && text.length < 500) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && rect.top > 0) {
          setFloatingMenu({
            visible: true,
            x: Math.max(10, Math.min(window.innerWidth - 220, rect.left + rect.width / 2 - 100)),
            y: Math.max(10, rect.top - 50),
            text,
          });
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Filter highlights for this chapter
  const chapterHighlights = useMemo(() => {
    return highlights.filter((h) => h.chapterId === chapter.id);
  }, [highlights, chapter.id]);

  /**
   * Parse inline Markdown formatting:
   * **bold**, *italic*, `inline code`, [link](url)
   * while keeping individual words interactive for tap-to-translate.
   */
  const renderFormattedInline = (inlineText: string, keyPrefix: string): React.ReactNode => {
    // Regex matching inline markdown:
    // 1: `code`
    // 2: **bold** or __bold__
    // 3: *italic* or _italic_
    // 4: [text](url)
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
    const parts = inlineText.split(inlineRegex);

    return parts.map((part, index) => {
      const partKey = `${keyPrefix}-sub-${index}`;

      if (!part) return null;

      // Inline code: `...`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        const codeText = part.slice(1, -1);
        return (
          <code
            key={partKey}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-sm border border-slate-200 dark:border-slate-700/60 inline-block align-baseline"
          >
            {renderInteractiveTokens(codeText, `${partKey}-c`)}
          </code>
        );
      }

      // Bold: **...** or __...__
      if (
        (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
        (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
      ) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={partKey} className="font-bold text-slate-900 dark:text-slate-100">
            {renderFormattedInline(boldText, `${partKey}-b`)}
          </strong>
        );
      }

      // Italic: *...* or _..._
      if (
        (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
        (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
      ) {
        const italicText = part.slice(1, -1);
        return (
          <em key={partKey} className="italic text-slate-800 dark:text-slate-200">
            {renderFormattedInline(italicText, `${partKey}-i`)}
          </em>
        );
      }

      // Link: [text](url)
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkHref = linkMatch[2];
        return (
          <a
            key={partKey}
            href={linkHref}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline font-medium"
          >
            {renderInteractiveTokens(linkText, `${partKey}-a`)}
          </a>
        );
      }

      // Plain text: auto-detect bare URLs and isolate them for correct
      // bidirectional rendering inside RTL paragraphs, then split the
      // remaining text into interactive word tokens
      return renderWithBareUrls(part, partKey);
    });
  };

  /**
   * Splits plain text on bare URLs (https://... or www.) and renders each
   * URL as an isolated LTR anchor so the bidirectional algorithm cannot
   * visually reorder it inside RTL (Persian) paragraphs.
   */
  const renderWithBareUrls = (text: string, keyPrefix: string): React.ReactNode => {
    if (!/\b(?:https?:\/\/|www\.)/.test(text)) {
      return renderInteractiveTokens(text, keyPrefix);
    }

    const segments = text.split(/(https?:\/\/[^\s<>"،؛]+|www\.[^\s<>"،؛]+)/g);

    return segments.map((segment, sIdx) => {
      if (!segment) return null;
      const segKey = `${keyPrefix}-url-${sIdx}`;

      if (!/^(https?:\/\/|www\.)/.test(segment)) {
        return <React.Fragment key={segKey}>{renderInteractiveTokens(segment, `${segKey}-t`)}</React.Fragment>;
      }

      // Strip trailing sentence punctuation (., ), etc.) out of the link
      const urlMatch = /^(.*?)([.)\]]+)$/.exec(segment);
      const url = urlMatch && urlMatch[1] ? urlMatch[1] : segment;
      const trailing = urlMatch && urlMatch[1] ? urlMatch[2] : "";

      const href = url.startsWith("www.") ? `https://${url}` : url;

      return (
        <React.Fragment key={segKey}>
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="text-blue-600 dark:text-blue-400 hover:underline break-all font-medium"
            style={{ unicodeBidi: "isolate" }}
          >
            {url}
          </a>
          {trailing && <React.Fragment>{trailing}</React.Fragment>}
        </React.Fragment>
      );
    });
  };

  /**
   * Convert plain text string into interactive word tokens or highlight spans.
   *
   * Consecutive tokens of the same script (English vs Persian) are grouped into
   * directional runs and each run is wrapped with `dir` + `unicode-bidi: isolate`.
   * This keeps the Unicode bidi algorithm from visually reordering a multi-word
   * English phrase ("the book is" -> "is book the") when it sits inside an RTL
   * (Persian) paragraph, while individual words stay clickable for translation.
   */
  const renderInteractiveTokens = (text: string, keyPrefix: string): React.ReactNode => {
    const tokens = text.split(/([A-Za-z0-9_\-]+|[^\sA-Za-z0-9_\-]+|\s+)/).filter(Boolean);

    // Group tokens into directional runs (en / fa / neutral follows its neighbors).
    // Neutral punctuation (quotes, parens, etc.) is buffered and attached to the
    // NEXT strong run, so `("why")` stays a single LTR-isolated unit instead of
    // letting the leading `("` wander to the far end of the paragraph (bidi bug).
    const runs: { dir: "en" | "fa"; tokens: string[] }[] = [];
    const pending: string[] = [];
    for (const token of tokens) {
      const isEn = /^[A-Za-z0-9_\-]+$/.test(token);
      const isFa = /[\u0600-\u06FF]/.test(token);
      const kind: "en" | "fa" | "neutral" = isEn ? "en" : isFa ? "fa" : "neutral";

      if (kind === "neutral") {
        pending.push(token);
        continue;
      }

      const last = runs[runs.length - 1];
      if (last && last.dir === kind) {
        last.tokens.push(...pending, token);
        pending.length = 0;
      } else {
        runs.push({ dir: kind, tokens: [...pending, token] });
        pending.length = 0;
      }
    }

    // Trailing neutrals (e.g. closing quotes / period) follow the last strong run.
    const lastRun = runs[runs.length - 1];
    if (pending.length > 0 && lastRun) lastRun.tokens.push(...pending);

    // A purely-punctuational fragment (no strong chars at all): render raw.
    if (runs.length === 0 && pending.length > 0) return pending.join("");

    let globalIdx = 0;

    // Precompute the exact character ranges of each highlight phrase
    // (case-insensitive) within this text. Highlights are matched by
    // position only, so selecting "the book is" never highlights a lone
    // "the" or "book" somewhere else in the chapter.
    const textLower = text.toLowerCase();
    const highlightRanges: { start: number; end: number; color: string }[] = [];
    for (const h of chapterHighlights) {
      const needle = h.text.trim().toLowerCase();
      if (needle.length < 2) continue;
      let idx = textLower.indexOf(needle);
      while (idx !== -1) {
        highlightRanges.push({ start: idx, end: idx + needle.length, color: h.color });
        idx = textLower.indexOf(needle, idx + needle.length);
      }
    }

    return runs.map((run, rIdx) => {
      const isStrongRun = run.tokens.some((t) => /[\u0600-\u06FFA-Za-z]/.test(t));
      const runDir = run.dir === "fa" ? "rtl" : "ltr";

      let charOffset = 0;
      const inner = run.tokens.map((token, tIdx) => {
        const tokenStart = charOffset;
        const tokenEnd = charOffset + token.length;
        charOffset = tokenEnd;

        const isWord = /^[A-Za-z]{2,}$/.test(token);
        const activeHighlight = highlightRanges.find(
          (r) => r.start <= tokenStart && tokenEnd <= r.end
        );
        const tokenKey = `${keyPrefix}-r${rIdx}-t${globalIdx++}`;

        if (isWord && preferences.tapToTranslate) {
          return (
            <span
              key={tokenKey}
              id={`word-${token.toLowerCase()}-${globalIdx}`}
              className={`interactive-word ${activeHighlight ? `hl-${activeHighlight.color}` : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onWordClick(token, text);
              }}
              title="برای ترجمه و تلفظ ضربه بزنید"
            >
              {token}
            </span>
          );
        }

        if (activeHighlight && token.trim().length > 0) {
          return (
            <mark key={tokenKey} className={`hl-${activeHighlight.color} rounded px-0.5`}>
              {token}
            </mark>
          );
        }

        return <React.Fragment key={tokenKey}>{token}</React.Fragment>;
      });

      // Spaces / pure punctuation: render raw so whitespace collapion is unaffected.
      if (!isStrongRun) return <React.Fragment key={`${keyPrefix}-r${rIdx}`}>{inner}</React.Fragment>;

      // Directional run: isolate so the bidi algorithm cannot reorder it (see above).
      return (
        <span key={`${keyPrefix}-r${rIdx}`} dir={runDir} style={{ unicodeBidi: "isolate" }}>
          {inner}
        </span>
      );
    });
  };

  // Render markdown blocks (headers, blockquotes, lists, tables, horizontal lines, paragraphs)
  const renderBlockContent = (blockText: string, bIdx: number) => {
    const trimmed = blockText.trim();

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      return <hr key={`hr-${bIdx}`} className="my-8 border-slate-200 dark:border-slate-800" />;
    }

    const isRtl = /[\u0600-\u06FF]/.test(trimmed);
    const blockDir: "rtl" | "ltr" = isRtl ? "rtl" : "ltr";
    const blockAlign: "right" | "left" = isRtl ? "right" : "left";

    // Headings
    if (trimmed.startsWith("#### ")) {
      return (
        <h4
          key={`h4-${bIdx}`}
          className={`text-lg sm:text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-100 font-sans ${
            isRtl ? "border-r-2 border-indigo-400 pr-2" : "border-l-2 border-indigo-400 pl-2"
          }`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {renderFormattedInline(trimmed.replace("#### ", ""), `h4-${bIdx}`)}
        </h4>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={`h3-${bIdx}`}
          className={`text-xl sm:text-2xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-100 font-sans ${
            isRtl ? "border-r-4 border-blue-500 pr-3" : "border-l-4 border-blue-500 pl-3"
          }`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {renderFormattedInline(trimmed.replace("### ", ""), `h3-${bIdx}`)}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={`h2-${bIdx}`}
          className={`text-2xl sm:text-3xl font-extrabold mt-10 mb-5 text-slate-900 dark:text-slate-100 font-sans ${
            isRtl ? "border-r-4 border-indigo-500 pr-3" : "border-l-4 border-indigo-500 pl-3"
          }`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {renderFormattedInline(trimmed.replace("## ", ""), `h2-${bIdx}`)}
        </h2>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h1
          key={`h1-${bIdx}`}
          className={`text-3xl sm:text-4xl font-black mt-12 mb-6 text-slate-900 dark:text-white font-sans ${
            isRtl ? "border-r-4 border-blue-600 pr-3" : "border-l-4 border-blue-600 pl-3"
          }`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {renderFormattedInline(trimmed.replace("# ", ""), `h1-${bIdx}`)}
        </h1>
      );
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines = trimmed
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join("\n");
      return (
        <blockquote
          key={`quote-${bIdx}`}
          className={`${
            isRtl
              ? "border-r-4 border-blue-500 rounded-l-lg"
              : "border-l-4 border-blue-500 rounded-r-lg"
          } bg-blue-50/60 dark:bg-blue-950/20 text-slate-700 dark:text-slate-300 p-4 my-6 shadow-xs`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {renderFormattedInline(quoteLines, `quote-${bIdx}`)}
        </blockquote>
      );
    }

    // Unordered list
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      const items = trimmed
        .split(/\n(?=[*•\-]\s+)/)
        .map((it) => it.replace(/^[*•\-]\s+/, "").trim())
        .filter(Boolean);

      return (
        <ul
          key={`ul-${bIdx}`}
          className={`list-disc list-inside space-y-2.5 my-5 ${isRtl ? "pr-3" : "pl-3"}`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {items.map((item, i) => (
            <li key={`li-${bIdx}-${i}`} className="leading-relaxed">
              {renderFormattedInline(item, `ul-${bIdx}-${i}`)}
            </li>
          ))}
        </ul>
      );
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed
        .split(/\n(?=\d+\.\s+)/)
        .map((it) => it.replace(/^\d+\.\s+/, "").trim())
        .filter(Boolean);

      return (
        <ol
          key={`ol-${bIdx}`}
          className={`list-decimal list-inside space-y-2.5 my-5 ${isRtl ? "pr-3" : "pl-3"}`}
          style={{ direction: blockDir, textAlign: blockAlign }}
        >
          {items.map((item, i) => (
            <li key={`ol-${bIdx}-${i}`} className="leading-relaxed">
              {renderFormattedInline(item, `ol-${bIdx}-${i}`)}
            </li>
          ))}
        </ol>
      );
    }

    // Markdown Table
    if (trimmed.includes("|") && trimmed.split("\n").length >= 2) {
      const lines = trimmed.split("\n").filter((l) => l.includes("|"));
      if (lines.length >= 2) {
        const headerCols = lines[0]
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        const dataRows = lines
          .slice(1)
          .filter((line) => !line.match(/^\|?\s*[-:]+[-| :]*$/))
          .map((line) =>
            line
              .split("|")
              .map((c) => c.trim())
              .filter(Boolean)
          );

        return (
          <div key={`table-wrap-${bIdx}`} className="overflow-x-auto my-6 border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 dark:border-slate-800 text-sm font-sans" style={{ direction: blockDir, textAlign: blockAlign }}>
              <thead className="bg-slate-50 dark:bg-slate-900/80">
                <tr>
                  {headerCols.map((col, cIdx) => (
                    <th key={`th-${cIdx}`} className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {renderFormattedInline(col, `th-${bIdx}-${cIdx}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                {dataRows.map((row, rIdx) => (
                  <tr key={`tr-${rIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    {row.map((cell, cIdx) => (
                      <td key={`td-${rIdx}-${cIdx}`} className="px-4 py-2 text-slate-700 dark:text-slate-300">
                        {renderFormattedInline(cell, `td-${bIdx}-${rIdx}-${cIdx}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Markdown Image: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const srcUrl = imgMatch[2];
      const isFa = /[\u0600-\u06FF]/.test(altText);
      const isFigure = /figure|شکل/i.test(altText);

      return (
        <figure
          key={`fig-${bIdx}`}
          id={`figure-${bIdx}`}
          className="my-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shadow-md transition-all hover:shadow-lg"
        >
          <div
            className="relative cursor-pointer group bg-slate-100/80 dark:bg-slate-950 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
            onClick={() => setActiveModalImage({ src: srcUrl, alt: altText })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={srcUrl}
              alt={altText}
              className="max-h-[500px] w-auto max-w-full object-contain rounded transition-transform duration-200 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/25 transition-colors flex items-center justify-center pointer-events-none">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-lg border border-slate-700/60">
                <Maximize2 className="w-3.5 h-3.5" />
                {isFa ? "مشاهده تصویر در اندازه کامل" : "Click to view full image"}
              </span>
            </div>
          </div>
          {altText && (
            <figcaption
              className={`px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium flex items-center gap-2 ${
                isFa ? "flex-row-reverse text-right" : "text-left"
              }`}
              style={{ direction: isFa ? "rtl" : "ltr" }}
            >
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                {isFigure ? (isFa ? "شکل راهنما" : "Figure") : (isFa ? "تصویر" : "Image")}
              </span>
              <span className="text-slate-700 dark:text-slate-300 leading-snug">
                {altText}
              </span>
            </figcaption>
          )}
        </figure>
      );
    }

    // Regular Paragraph
    return (
      <p
        key={`p-${bIdx}`}
        className="mb-5 leading-relaxed tracking-normal text-slate-800 dark:text-slate-200"
        style={{ direction: blockDir, textAlign: blockAlign }}
      >
        {renderFormattedInline(trimmed, `p-${bIdx}`)}
      </p>
    );
  };

  const getFontFamilyClass = () => {
    switch (preferences.fontFamily) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      case "vazir":
        return "font-sans";
      default:
        return "font-sans";
    }
  };

  const getContentWidthClass = () => {
    switch (preferences.contentWidth) {
      case "compact":
        return "max-w-xl";
      case "wide":
        return "max-w-5xl";
      default:
        return "max-w-3xl";
    }
  };

  return (
    <div
      ref={containerRef}
      id="chapter-viewer-container"
      className={`mx-auto px-4 sm:px-8 py-6 transition-all ${getContentWidthClass()}`}
    >
      {/* Chapter Meta Header */}
      <div className="mb-8 pb-4 border-b border-slate-200 dark:border-slate-800" style={{ direction: "rtl" }}>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            مطالعه بهینه کتاب
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {chapter.readingTimeMinutes} دقیقه زمان مطالعه
          </span>
        </div>
        <h1
          id="active-chapter-title"
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight font-sans"
          style={{
            direction: /[\u0600-\u06FF]/.test(chapter.title) ? "rtl" : "ltr",
            textAlign: /[\u0600-\u06FF]/.test(chapter.title) ? "right" : "left",
          }}
        >
          {chapter.title}
        </h1>
      </div>

      {/* Chapter Body */}
      <article
        id="chapter-article-body"
        className={`${getFontFamilyClass()} select-text`}
        style={{
          fontSize: `${preferences.fontSize}px`,
          lineHeight: preferences.lineHeight,
        }}
      >
        {contentParts.map((part, index) => {
          if (part.type === "code") {
            return (
              <CodeBlock
                key={`code-${index}`}
                code={part.content}
                language={part.language}
                theme={preferences.theme}
              />
            );
          } else {
            const blocks = part.content
              .split(/\n\n+/)
              .filter((b) => b.trim().length > 0)
              .flatMap(splitMarkdownBlocks);
            return (
              <div key={`text-section-${index}`}>
                {blocks.map((block, bIdx) => renderBlockContent(block, bIdx))}
              </div>
            );
          }
        })}
      </article>

      {/* Floating Selection Toolbar for Drag/Select */}
      {floatingMenu.visible && (
        <div
          id="selection-floating-toolbar"
          className="fixed z-50 flex items-center gap-1.5 p-1.5 bg-slate-900/95 text-white backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${floatingMenu.x}px`,
            top: `${floatingMenu.y}px`,
            direction: "rtl",
          }}
        >
          <button
            id="selection-translate-btn"
            onClick={() => {
              onSelectionAction(floatingMenu.text, "translate");
              setFloatingMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>ترجمه انتخاب</span>
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <button
            id="selection-highlight-btn"
            onClick={() => {
              onSelectionAction(floatingMenu.text, "highlight");
              setFloatingMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-amber-600 transition-colors"
            title="هایلایت"
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-300" />
            <span>هایلایت</span>
          </button>

          <button
            id="selection-note-btn"
            onClick={() => {
              onSelectionAction(floatingMenu.text, "note");
              setFloatingMenu((prev) => ({ ...prev, visible: false }));
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg hover:bg-purple-600 transition-colors"
            title="یادداشت"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
            <span>یادداشت</span>
          </button>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {activeModalImage && (
        <div
          id="image-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveModalImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close image modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image */}
            <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl max-h-[80vh] w-auto max-w-full flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeModalImage.src}
                alt={activeModalImage.alt}
                className="max-h-[76vh] w-auto max-w-full object-contain rounded"
              />
            </div>

            {/* Caption */}
            {activeModalImage.alt && (
              <p
                className="mt-4 text-center text-sm text-slate-200 font-medium px-4 max-w-3xl"
                style={{ direction: /[\u0600-\u06FF]/.test(activeModalImage.alt) ? "rtl" : "ltr" }}
              >
                {activeModalImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
