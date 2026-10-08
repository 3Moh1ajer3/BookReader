import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang = "fa", context = "cybersecurity" } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ ok: false, error: "متنی برای ترجمه ارسال نشده است." }, { status: 400 });
    }

    const trimmed = text.trim();

    // ۱. تلاش با Gemini API اگر کلید موجود باشد
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `You are an expert technical translator specializing in cybersecurity, vulnerability research, and systems engineering.
Translate the following English technical text into natural, fluent, and highly professional Persian (Farsi).
Keep technical identifiers, CVE numbers, tool names, programming commands, and code snippets in original English.
Do NOT summarize, omit, or add your own commentary. Output ONLY the Persian translation.

Context: ${context}
Text to translate:
${trimmed}`,
        });

        if (response.text && response.text.trim()) {
          return NextResponse.json({
            ok: true,
            text: response.text.trim(),
            provider: "gemini-3.8-flash",
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini translation fallback triggered:", geminiError?.message || geminiError);
      }
    }

    // ۲. فال‌بک شفاف و سریع با Google Translate GTX (بدون نیاز به کلید و سهمیه)
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        targetLang
      )}&dt=t&q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(gtxUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const out = data[0]
            .map((part: unknown[]) => (typeof part[0] === "string" ? part[0] : ""))
            .join("");
          if (out.trim()) {
            return NextResponse.json({
              ok: true,
              text: out.trim(),
              provider: "google-translate-engine",
            });
          }
        }
      }
    } catch (gtxError) {
      console.warn("GTX translation fallback warning:", gtxError);
    }

    // در صورت بروز هرگونه خطای شبکه، متن اصلی را برگردان
    return NextResponse.json({
      ok: true,
      text: trimmed,
      provider: "original-fallback",
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "خطا در پردازش درخواست ترجمه" },
      { status: 500 }
    );
  }
}
