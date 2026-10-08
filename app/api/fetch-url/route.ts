import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30; // 30 seconds

/**
 * Server-side URL fetcher that bypasses browser CORS and client network blocks.
 * Uses Jina Reader, Chrome-mimicking direct fetch, and proxy fallbacks.
 */
export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ ok: false, error: "پارامتر URL ارسال نشده است." }, { status: 400 });
  }
  return processFetchUrl(urlParam);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const urlParam = body?.url;
    if (!urlParam) {
      return NextResponse.json({ ok: false, error: "پارامتر URL ارسال نشده است." }, { status: 400 });
    }
    return processFetchUrl(urlParam);
  } catch {
    return NextResponse.json({ ok: false, error: "فرمت درخواست نامعتبر است." }, { status: 400 });
  }
}

async function processFetchUrl(targetUrl: string) {
  const trimmedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(trimmedUrl)) {
    return NextResponse.json({ ok: false, error: "آدرس اینترنتی نامعتبر است." }, { status: 400 });
  }

  // 1. اولویت نخست: سرور پرسرعت Jina Reader
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const jinaUrl = `https://r.jina.ai/${trimmedUrl}`;
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "User-Agent": "curl/8.5.0",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      if (
        text.trim().length > 150 &&
        !text.includes("Cloudflare Ray ID") &&
        !text.includes("Just a moment...")
      ) {
        const titleMatch = text.match(/^Title:\s*(.+)$/m) || text.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : "";
        const cleaned = cleanWebScrapedMarkdown(text);

        // استخراج تمام تصاویر موجود
        const images: { url: string; alt: string }[] = [];
        const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
        let match;
        while ((match = imgRegex.exec(cleaned)) !== null) {
          images.push({ alt: match[1].trim() || title, url: match[2].trim() });
        }

        if (cleaned.length > 80) {
          return NextResponse.json({
            ok: true,
            title,
            markdown: cleaned,
            rawLength: text.length,
            candidateImages: images,
            methodUsed: "Jina Server Engine",
          });
        }
      }
    }
  } catch (err) {
    console.warn("Jina fetch warning:", err);
  }

  // 1.5. درگاه اختصاصی فید The Hacker News (در صورتی که لینک از thehackernews.com باشد)
  if (trimmedUrl.includes("thehackernews.com")) {
    try {
      const feedRes = await fetch("https://thehackernews.com/feeds/posts/default?alt=json", {
        headers: { "User-Agent": "curl/8.5.0", Accept: "application/json" },
      });
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        const entries = feedData?.feed?.entry || [];
        const matched = entries.find((e: any) => {
          const href = e.link?.find((l: any) => l.rel === "alternate")?.href || "";
          return href.includes(trimmedUrl.replace(/^https?:\/\/(www\.)?/, "")) || trimmedUrl.includes(href.replace(/^https?:\/\/(www\.)?/, ""));
        }) || entries[0];

        if (matched) {
          const title = matched.title?.$t || "";
          const summaryHtml = matched.summary?.$t || matched.content?.$t || "";
          const { markdown, images } = parseHtmlToMarkdown(summaryHtml);
          if (markdown.length > 100) {
            return NextResponse.json({
              ok: true,
              title,
              markdown,
              candidateImages: images,
              methodUsed: "The Hacker News Feed Gateway",
            });
          }
        }
      }
    } catch (feedErr) {
      console.warn("Feed parse warning:", feedErr);
    }
  }

  // ۲. اولویت دوم: دریافت مستقیم سورس از سرور با هدرهای استاندارد مرورگر
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const directRes = await fetch(trimmedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (directRes.ok) {
      const html = await directRes.text();
      if (
        html.length > 300 &&
        !html.includes("Just a moment...") &&
        !html.includes("Cloudflare") &&
        !html.includes("Attention Required")
      ) {
        const { title, markdown, images } = parseHtmlToMarkdown(html);
        if (markdown.length > 100) {
          return NextResponse.json({
            ok: true,
            title,
            markdown,
            rawLength: html.length,
            candidateImages: images,
            methodUsed: "Direct Server Fetch",
          });
        }
      }
    }
  } catch (err) {
    console.warn("Direct fetch warning:", err);
  }

  // ۳. اولویت سوم: درگاه کمکی AllOrigins
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(trimmedUrl)}`;
    const proxyRes = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      const html = data?.contents;
      if (typeof html === "string" && html.length > 200) {
        const { title, markdown, images } = parseHtmlToMarkdown(html);
        if (markdown.length > 100) {
          return NextResponse.json({
            ok: true,
            title,
            markdown,
            candidateImages: images,
            methodUsed: "AllOrigins Server Gateway",
          });
        }
      }
    }
  } catch (err) {
    console.warn("Proxy fetch warning:", err);
  }

  let host = "";
  try {
    host = new URL(trimmedUrl).hostname;
  } catch {}

  return NextResponse.json(
    {
      ok: false,
      error: `دسترسی به دامنه (${host || "سایت مبدأ"}) به علت فایروال WAF یا تایم‌اوت پاسخ سرور امکان‌پذیر نشد. می‌توانید متن مقاله را کپی کرده و در تب ویرایشگر Markdown قرار دهید تا فوراً ترجمه و منتشر شود.`,
    },
    { status: 502 }
  );
}

function cleanWebScrapedMarkdown(rawMd: string): string {
  let text = rawMd
    .replace(/^(Title|URL Source|Markdown Content|Published Time):.*$/gm, "")
    .trim();

  const lines = text.split("\n");
  const cleanedLines: string[] = [];
  let startedArticle = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!startedArticle) {
      if (
        /^#{1,3}\s+\S+/.test(trimmed) ||
        (trimmed.length > 40 && !trimmed.startsWith("* [") && !trimmed.startsWith("- [") && !trimmed.startsWith("!["))
      ) {
        startedArticle = true;
      } else {
        continue;
      }
    }

    if (
      /^#{1,4}\s*(Related Articles|More from|Leave a Reply|Comments|Subscribe to our Newsletter|Follow Us|Recommended for you)/i.test(
        trimmed
      ) ||
      /^Copyright\s*©/i.test(trimmed) ||
      /^All rights reserved\.?$/i.test(trimmed)
    ) {
      break;
    }

    if (/^(\*|-)?\s*\[(Share|Tweet|LinkedIn|Facebook|Email|Reddit)\]\(https?:\/\/[^)]+\)\s*$/i.test(trimmed)) {
      continue;
    }

    cleanedLines.push(line);
  }

  const result = cleanedLines.join("\n").trim();
  return result.length > 60 ? result : text;
}

function parseHtmlToMarkdown(html: string): { title: string; markdown: string; images: { url: string; alt: string }[] } {
  let title = "";
  const ogTitle = html.match(/<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);

  if (ogTitle) title = ogTitle[1].trim();
  else if (titleTag) title = titleTag[1].split(/[|\-–—]/)[0].trim();
  else if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, "").trim();

  const images: { url: string; alt: string }[] = [];
  const imgRegex = /<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    if (!src.includes("avatar") && !src.includes("icon") && !src.includes("logo")) {
      const altMatch = match[0].match(/alt=["']([^"']*)["']/i);
      images.push({ url: src, alt: altMatch ? altMatch[1] : title });
    }
  }

  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, "");

  const article = text.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article) text = article[1];

  let md = text
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n* $1")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { title: title || "گزارش فنی", markdown: md, images };
}
