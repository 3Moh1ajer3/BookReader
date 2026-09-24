"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ShieldAlert,
  KeyRound,
  EyeOff,
  Cpu,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

interface AntiStealerSectionProps {
  onOpenEarlyAccess: () => void;
}

export const AntiStealerSection: React.FC<AntiStealerSectionProps> = ({ onOpenEarlyAccess }) => {
  const [selectedScenario, setSelectedScenario] = useState<"cookies" | "keylogger" | "wallets">("cookies");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLog, setSimulationLog] = useState<string[]>([
    "[SYSTEM] موتور محافظتی رهام در حالت آماده‌باش فعال (Active Hook Shield)...",
  ]);

  const runSimulation = (scenario: "cookies" | "keylogger" | "wallets") => {
    setSelectedScenario(scenario);
    setIsSimulating(true);
    setSimulationLog(["[START] شبیه‌سازی شروع شد..."]);

    const logsMap = {
      cookies: [
        "[0.02s] پروسس ناشناس تلاش می‌کند به مسیر %LocalAppData%/Google/Chrome/User Data/Default/Network دسترسی پیدا کند.",
        "[0.04s] درخواست خواندن جدول Cookies از دیتابیس SQLite رهگیری شد.",
        "[0.06s] تلاش برای فراخوانی CryptUnprotectData جهت رمزگشایی App-Bound کلید مستر شناسایی شد.",
        "[0.08s] [سپر رهام] دسترسی پروسس مخرب مسدود گردید (ERROR_ACCESS_DENIED).",
        "[0.10s] کوکی‌های احراز هویت امن ماندند. پروسس متخلف در قرنطینه حافظه قرار گرفت.",
      ],
      keylogger: [
        "[0.01s] درخواست نصب قلاب سراسری کیبورد (SetWindowsHookExW با WH_KEYBOARD_LL) شناسایی شد.",
        "[0.03s] امضای ساختار قلاب با روش‌های سنتی تزریق کی‌لاگر مطابقت دارد.",
        "[0.05s] [سپر رهام] بافر ورودی کلیدها برای این پروسس مغشوش (Scrambled) شد و هوک منقضی گردید.",
        "[0.07s] هیچ‌یک از پسوردها یا کلیدهای فشرده‌شده به مهاجم منتقل نخواهد شد.",
      ],
      wallets: [
        "[0.02s] بدافزار استیلر به دنبال افزونه‌های Metamask, Phantom و فایل‌های Wallet.dat است.",
        "[0.05s] تلاش برای اسکن رجیستری و واکشی سشن دسکتاپ تلگرام رهگیری شد.",
        "[0.07s] [سپر رهام] لایه Sandbox مجازی فعال شد؛ پاسخ‌های پوچ (Dummy Data) به مهاجم داده شد.",
        "[0.09s] دارایی‌ها و عبارات بازیابی (Seed Phrases) کاملاً ایزوله و محافظت شدند.",
      ],
    };

    const targetLogs = logsMap[scenario];
    let step = 0;
    const interval = setInterval(() => {
      if (step < targetLogs.length) {
        setSimulationLog((prev) => [...prev, targetLogs[step]]);
        step++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 280);
  };

  return (
    <section id="anti-stealer" className="py-16 sm:py-24 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-3">
            <span className="text-emerald-400 font-semibold">محصول پرچمدار رهام</span>
            <span aria-hidden="true">·</span>
            <span>در حال توسعه فعال</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-medium">عرضه نسخه بتا به‌زودی</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight" style={{ textWrap: "balance" }}>
            آنتی‌استیلر هوشمند رهام؛ پایانی بر تهدید سارقان کوکی، پسورد و کی‌لاگرها
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            بدافزارهای سرقت اطلاعات (مانند Lumma, RedLine, Vidar, Medusa, Stealc) رایج‌ترین سلاح هکرها برای نفوذ به سازمان‌ها و سرقت هویت کاربران هستند. آنها پیش از آنکه آنتی‌ویروس‌های سنتی متوجه شوند، در عرض ۱۰ ثانیه تمام سشن‌ها و رمزهای عبور را به سرورهای مهاجم می‌فرستند. محصول جدید رهام این زنجیره حمله را در ریشه خنثی می‌کند.
          </p>
        </div>

        {/* Bento Grid: 4 Core Defensive Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {/* Card 1: Browser Vault Guard */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-4">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">محافظت از انبار مرورگرها</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                مسدودسازی تکنیک‌های استخراج کلید مستر و دیتابیس‌های Login Data و Web Data مرورگرهای مبتنی بر کرومیوم و فایرفاکس.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              DPAPI & App-Bound Shield
            </div>
          </div>

          {/* Card 2: Keystroke & Clipboard Trap */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-800/40 flex items-center justify-center text-teal-400 mb-4">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">خنثی‌ساز کی‌لاگر و کلیپ‌بورد</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                مغشوش‌سازی هوشمند کلیدهای فشرده‌شده و پیشگیری از سرقت متن‌های کپی‌شده (مثل آدرس کیف‌پول‌ها و پسوردهای عبوری).
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              Keystroke Scrambling Engine
            </div>
          </div>

          {/* Card 3: In-Memory Process Interception */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">رهگیری در سطح مموری</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                شناسایی رفتاری فرآیندهای مشکوک، تزریق DLL و تکنیک‌های Process Hollowing بدون نیاز به دیتابیس حجیم امضاهای قدیمی.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              Memory Heuristics Core
            </div>
          </div>

          {/* Card 4: Zero-Telemetry & Local Security */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-4">
                <Fingerprint className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">حریم خصوصی ۱۰۰٪ لوکال</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                بدون ارسال فایل یا دیتای کاربر به کلود؛ توسعه‌یافته با زبان‌های سیستمی سریع (Rust/C++) با مصرف کمتر از ۲۰ مگابایت رم.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              Zero-Telemetry Architecture
            </div>
          </div>
        </div>

        {/* Interactive Attack & Defense Sandbox */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-2xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8">
          {/* Left Column: Visual graphic */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-800">
              <Image
                src="/images/roham_anti_stealer_1790289435180.jpg"
                alt="معماری ایزولاسیون آنتی‌استیلر رهام"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-3 right-3 left-3 text-xs text-slate-300">
                <span className="font-semibold text-white block">محیط قرنطینه حافظه رهام</span>
                <span className="text-[11px] text-slate-400">سپر بلافاصله قبل از خواندن توکن‌ها مداخله می‌کند</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-xs font-semibold text-emerald-400 block mb-1">
                دسترسی زودهنگام (Private Beta)
              </span>
              <p className="text-xs text-slate-400">
                این محصول در مراحل پایانی تست‌های آزمایشگاهی است. سازمان‌ها و متخصصان امنیتی می‌توانند برای تست نسخه بتای خصوصی پیش‌ثبت‌نام کنند.
              </p>
              <button
                onClick={onOpenEarlyAccess}
                className="mt-3 w-full py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>رزرو نوبت در لیست انتظار</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Simulator Console */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">آزمایشگاه شبیه‌سازی دفاع در برابر استیلر</h4>
                <p className="text-xs text-slate-400">یک سناریوی حمله را انتخاب کنید تا رفتار دفاعی رهام را مشاهده نمایید:</p>
              </div>
            </div>

            {/* Scenario Selector Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => runSimulation("cookies")}
                disabled={isSimulating}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  selectedScenario === "cookies"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                    : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                ۱. سرقت کوکی‌های مرورگر
              </button>

              <button
                onClick={() => runSimulation("keylogger")}
                disabled={isSimulating}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  selectedScenario === "keylogger"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                    : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                ۲. هوک کی‌لاگر پسورد
              </button>

              <button
                onClick={() => runSimulation("wallets")}
                disabled={isSimulating}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                  selectedScenario === "wallets"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                    : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                ۳. نفوذ به توکن‌های سشن
              </button>
            </div>

            {/* Log Output Console */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs space-y-2 min-h-[180px] max-h-[220px] overflow-y-auto dir-ltr text-left">
              {simulationLog.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    log.includes("[سپر رهام]") || log.includes("امن ماندند")
                      ? "text-emerald-400 font-semibold"
                      : log.includes("مسدود") || log.includes("تلاش غیرمجاز") || log.includes("بدافزار")
                      ? "text-cyan-300"
                      : "text-slate-400"
                  }`}
                >
                  {log}
                </div>
              ))}
              {isSimulating && (
                <div className="flex items-center gap-2 text-slate-500 italic">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  در حال رهگیری پاسخ‌های سیستمی...
                </div>
              )}
            </div>

            {/* Run Again Button */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">پایش بی‌درنگ رفتار پروسس‌ها در سطح ویندوز و لینوکس</span>
              <button
                onClick={() => runSimulation(selectedScenario)}
                disabled={isSimulating}
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>تکرار تست شبیه‌سازی</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
