"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft, RotateCcw, HelpCircle } from "lucide-react";

interface RiskAssessmentToolProps {
  onOpenConsultation: () => void;
  onOpenEarlyAccess: () => void;
  portalTheme?: "light" | "dark";
}

export const RiskAssessmentTool: React.FC<RiskAssessmentToolProps> = ({
  onOpenConsultation,
  onOpenEarlyAccess,
  portalTheme = "light",
}) => {
  const isDark = portalTheme === "dark";
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      title: "رمزهای عبور حساب‌های حساس شما یا تیم کاری‌تان چگونه نگهداری می‌شوند؟",
      options: [
        { label: "در مرورگرهای کروم/فایرفاکس بدون قفل اختصاصی", score: 1 },
        { label: "در فایل متنی، اکسل یا نوت‌های سیستم", score: 0 },
        { label: "در یک نرم‌افزار مدیریت پسورد معتبر (Password Manager)", score: 3 },
      ],
    },
    {
      id: 2,
      title: "روش تایید دو مرحله‌ای (2FA) برای دسترسی به پنل‌های سازمانی چیست؟",
      options: [
        { label: "پیامک (SMS) یا تاییدیه ایمیلی", score: 1 },
        { label: "برنامه‌های احراز هویت مثل Google Authenticator", score: 2 },
        { label: "کلید سخت‌افزاری ضد فیشینگ (FIDO2 / YubiKey)", score: 3 },
        { label: "در بسیاری از حساب‌ها هنوز فعال نیست", score: 0 },
      ],
    },
    {
      id: 3,
      title: "اگر یک کارمند فایلی آلوده به استیلر را باز کند، چه سدی مانع سرقت نشست‌هاست؟",
      options: [
        { label: "آنتی‌ویروس سنتی ویندوز (Windows Defender)", score: 1 },
        { label: "هیچ مکانیزم محافظت اختصاصی از حافظه و سشن‌ها نداریم", score: 0 },
        { label: "سیستم‌های EDR و محدودسازی کامل اجرای پروسس‌ها", score: 2 },
      ],
    },
    {
      id: 4,
      title: "آیا در سازمان شما آموزش‌های عملی مقابله با بدافزارها و فیشینگ نوین برگزار شده است؟",
      options: [
        { label: "خیر، تاکنون کارگاه یا شبیه‌سازی برگزار نشده است", score: 0 },
        { label: "فقط به صورت تئوری یا دستورالعمل متنی", score: 1 },
        { label: "بله، شبیه‌سازی سناریوهای نفوذ و تست مقاومت تیمی انجام شده است", score: 3 },
      ],
    },
  ];

  const handleSelectOption = (qId: number, score: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: score }));
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const maxScore = 12;
    const ratio = totalScore / maxScore;

    if (ratio < 0.4) {
      return {
        level: "بحرانی و آسیب‌پذیر در برابر استیلرها",
        color: "text-rose-400",
        bgColor: "bg-rose-950/40 border-rose-800/60",
        description:
          "زیرساخت شما در صورت آلودگی یکی از نقاط پایانی، در کمتر از ۳۰ ثانیه تمام کوکی‌های نشست و پسوردها را از دست خواهد داد. سارقان اطلاعات معمولاً این نوع محیط‌ها را هدف اصلی خود قرار می‌دهند.",
        action: "نیاز فوری به مشاوره هاردنینگ و فعال‌سازی آنتی‌استیلر هوشمند",
      };
    } else if (ratio < 0.75) {
      return {
        level: "متوسط؛ نیازمند بستن رخنه‌های نشست و هوک‌ها",
        color: "text-amber-400",
        bgColor: "bg-amber-950/40 border-amber-800/60",
        description:
          "بخشی از اقدامات پایه‌ای امنیتی اعمال شده است، اما مکانیزم محافظت از کوکی‌های فعال مرورگر در برابر بدافزارهای مدرن همچون LummaC2 کافی نیست.",
        action: "پیشنهاد می‌شود از آموزش‌های تیمی و نسخه پیش‌نمایش آنتی‌استیلر بهره ببرید",
      };
    } else {
      return {
        level: "بهینه و تاب‌آور در برابر تهدیدات رایج",
        color: "text-emerald-400",
        bgColor: "bg-emerald-950/40 border-emerald-800/60",
        description:
          "بلوغ امنیتی مطلوبی دارید. برای تثبیت این سطح، ممیزی‌های دوره‌ای Red Teaming و مانیتورینگ تهدیدات روز صفر را فراموش نکنید.",
        action: "بررسی کتاب‌ها و پژوهش‌های عمیق Zero-Day در کتابخانه رهام",
      };
    }
  };

  const isComplete = Object.keys(answers).length === questions.length;
  const result = isComplete ? calculateResult() : null;

  return (
    <section id="assessment" className={`py-16 sm:py-24 border-b transition-colors ${
      isDark ? "bg-slate-950 border-slate-900 text-slate-100" : "bg-slate-100/70 border-slate-200 text-slate-800"
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>ابزار سنجش ریسک امنیتی رهام</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
            isDark ? "text-white" : "text-slate-900"
          }`} style={{ textWrap: "balance" }}>
            آیا دارایی‌های شما در برابر سرقت سشن و بدافزارهای استیلر ایمن است؟
          </h2>
          <p className={`mt-3 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            با پاسخ به ۴ سوال کوتاه، وضعیت تاب‌آوری سیستم‌ها و تیم خود را بسنجید و توصیه‌های فنی ویژه را دریافت نمایید.
          </p>
        </div>

        {/* Questions Box */}
        <div className={`rounded-2xl border p-6 sm:p-8 space-y-6 shadow-xl ${
          isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {questions.map((q, idx) => (
            <div key={q.id} className={`space-y-3 pb-5 border-b last:border-0 last:pb-0 ${
              isDark ? "border-slate-800/80" : "border-slate-200"
            }`}>
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 mt-0.5">
                  Q0{q.id}
                </span>
                <h3 className={`text-sm sm:text-base font-semibold leading-snug ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {q.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[q.id] === opt.score;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(q.id, opt.score)}
                      className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-white font-medium shadow-xs"
                          : isDark
                          ? "bg-slate-950/50 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-slate-500 font-mono">گزینه {oIdx + 1}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Result Box */}
          {result && (
            <div className={`p-6 rounded-xl border ${result.bgColor} space-y-4 animate-in fade-in duration-200`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  نتیجه ارزیابی تاب‌آوری:
                </span>
                <span className={`text-sm sm:text-base font-bold ${result.color}`}>
                  {result.level}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {result.description}
              </p>

              <div className={`pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? "border-slate-800/80" : "border-slate-200"
              }`}>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {result.action}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenEarlyAccess}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                  >
                    پیش‌ثبت‌نام آنتی‌استیلر
                  </button>
                  <button
                    onClick={onOpenConsultation}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                  >
                    جلسه مشاوره
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isComplete && (
            <div className="text-center pt-2 text-xs text-slate-500">
              لطفاً به تمامی سوالات پاسخ دهید تا نتیجه و تحلیل اختصاصی نمایش داده شود ({Object.keys(answers).length}/4 پاسخ داده شده)
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
