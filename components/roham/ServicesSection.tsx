"use client";

import React from "react";
import Image from "next/image";
import {
  Users,
  GraduationCap,
  ShieldAlert,
  CheckCircle2,
  Building2,
  UserCheck,
  FileCheck,
  ArrowLeft,
} from "lucide-react";

interface ServicesSectionProps {
  onOpenConsultation: () => void;
  onBackToHome?: () => void;
  portalTheme?: "light" | "dark";
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenConsultation,
  onBackToHome,
  portalTheme = "light",
}) => {
  const isDark = portalTheme === "dark";
  const servicesList = [
    {
      index: "01",
      icon: ShieldAlert,
      title: "مشاوره اختصاصی امنیت و هاردنینگ زیرساخت",
      audience: "اشخاص کلیدی، استارتاپ‌ها، شرکت‌ها و سازمان‌های بزرگ",
      description:
        "بررسی جامع معماری شبکه‌های سازمانی، بستن آسیب‌پذیری‌های فعال، امن‌سازی نقاط پایانی (Endpoints) پرسنل، پیاده‌سازی الگوهای Zero-Trust و کاهش ریسک نشت داده‌های حیاتی کسب‌وکار.",
      deliverables: [
        "سند راهبردی هاردنینگ سیستم‌عامل‌ها و سرورها",
        "پالیسی‌های مدیریت دسترسی با حداقل امتیاز (Least Privilege)",
        "پیکربندی سپر دفاعی در برابر بدافزارهای سارق هویت",
      ],
    },
    {
      index: "02",
      icon: GraduationCap,
      title: "آموزش‌های سازمانی و کارگاه‌های تخصصی تیمی",
      audience: "تیم‌های توسعه، مدیران DevOps، تحلیل‌گران امنیت و مدیران IT",
      description:
        "برگزاری کارگاه‌های کاربردی با سرفصل‌های اختصاصی مهندسی معکوس، کشف آسیب‌پذیری‌های روز صفر (Zero-Day Research)، تحلیل باینری بدافزارها و ارتقای فرهنگ امنیتی پرسنل سازمان.",
      deliverables: [
        "کارگاه عملی شبیه‌سازی حملات استیلر و تحلیل رفتار بدافزار",
        "دوره‌های اختصاصی کدنویسی امن و ممیزی کد منبع",
        "گواهی‌نامه سازمانی و جلسات پرسش‌وپاسخ فنی با منتورها",
      ],
    },
    {
      index: "03",
      icon: FileCheck,
      title: "ممیزی امنیتی و آزمون مقاومت در برابر استیلرها",
      audience: "موسسات مالی، شرکت‌های فناوری، پلتفرم‌های ابری و سازمان‌های داده‌محور",
      description:
        "اجرای تست‌های نفوذ هدفمند و شبیه‌سازی سناریوهای سرقت نشست و تزریق حافظه جهت سنجش میزان تاب‌آوری ابزارها و فرآیندهای امنیتی فعلی سازمان شما پیش از وقوع رخداد واقعی.",
      deliverables: [
        "گزارش آسیب‌پذیری‌های بحرانی با درجه‌بندی CVSS",
        "سند ماتریس ریسک و راهنمای فوری اقدام اصلاحی",
        "تست مجدد پس از اصلاح (Remediation Re-test)",
      ],
    },
  ];

  return (
    <section
      id="services"
      className={`py-12 sm:py-20 border-b transition-colors ${
        isDark ? "bg-slate-950 border-slate-900 text-slate-100" : "bg-[#fbfbf9] border-slate-200 text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Breadcrumb */}
        {onBackToHome && (
          <div className={`mb-8 flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            <button
              onClick={onBackToHome}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <span>صفحه اصلی رهام</span>
            </button>
            <span>/</span>
            <span className={isDark ? "text-slate-300" : "text-slate-800 font-semibold"}>
              خدمات و مشاوره سازمانی
            </span>
          </div>
        )}

        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-3">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">خدمات حرفه‌ای گروه رهام</span>
            <span aria-hidden="true" className={isDark ? "text-slate-600" : "text-slate-300"}>·</span>
            <span className={isDark ? "text-slate-400" : "text-slate-600"}>Corporate & Personal Security</span>
            <span aria-hidden="true" className={isDark ? "text-slate-600" : "text-slate-300"}>·</span>
            <span className={isDark ? "text-slate-400" : "text-slate-600"}>راهکارهای اختصاصی و سفارشی</span>
          </div>

          <h2
            className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
            style={{ textWrap: "balance" }}
          >
            مشاوره راهبردی، آموزش سازمانی و ارزیابی عمیق امنیت سایبری
          </h2>

          <p className={`mt-4 text-base sm:text-lg leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            امنیت فراتر از یک نرم‌افزار است؛ امنیت نیازمند فرآیندهای اصولی، مهارت فنی بالای کارکنان و معماری غیرقابل‌نفوذ است. گروه امنیتی رهام با اتکا به تجربه پژوهش در لایه‌های پایین‌دستی سیستم‌ها، سازمان شما را در برابر پیچیده‌ترین تهدیدات بیمه می‌کند.
          </p>
        </div>

        {/* Top Image Banner: Enterprise SOC / Advisory Atmosphere */}
        <div
          className={`relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border mb-12 shadow-sm ${
            isDark ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <Image
            src="/images/roham_consulting_soc_1790289445511.jpg"
            alt="جلسه مشاوره و تحلیل استراتژیک امنیت سازمان رهام"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
          <div className="absolute bottom-6 right-6 left-6 max-w-xl text-slate-200">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-2">
              <Building2 className="w-4 h-4 inline" />
              <span>ROHAM ADVISORY SUITE</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              مشاوره رودررو و اختصاصی برای مدیران و تیم‌های فنی
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed hidden sm:block">
              از استارتاپ‌های نوپا تا نهادهای حساس؛ ما متناسب با سطح ریسک و منابع شما، برنامه عملیاتی ارتقای امنیت را تدوین می‌کنیم.
            </p>
          </div>
        </div>

        {/* 3 Core Services Editorial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {servicesList.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.index}
                className={`p-6 sm:p-7 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 hover:border-emerald-500/50"
                    : "bg-white border-slate-200/90 hover:border-emerald-500/60 shadow-2xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                        isDark
                          ? "bg-slate-950 border-slate-800 text-emerald-400"
                          : "bg-emerald-50 border-emerald-200 text-emerald-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-sm text-slate-400 font-bold">{svc.index}</span>
                  </div>

                  <h3 className={`text-lg font-bold mb-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {svc.title}
                  </h3>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400/90 mb-3 font-semibold">
                    {svc.audience}
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {svc.description}
                  </p>
                </div>

                <div className={`pt-4 border-t space-y-2 ${isDark ? "border-slate-800/80" : "border-slate-100"}`}>
                  <span className={`text-[11px] font-bold block mb-1 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    خروجی‌ها و دستاوردهای کلیدی:
                  </span>
                  {svc.deliverables.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Box */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="space-y-1.5 text-center sm:text-right">
            <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              نیاز به مشاوره محرمانه برای سازمان خود دارید؟
            </h4>
            <p className={`text-xs sm:text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              مشاوران ارشد گروه رهام آماده بررسی نیازهای دفاعی شما و ارائه نقشه راه اختصاصی هستند.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>درخواست جلسه مشاوره و ارزیابی</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
