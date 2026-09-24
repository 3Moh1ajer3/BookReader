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
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenConsultation,
  onBackToHome,
}) => {
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
    <section id="services" className="py-12 sm:py-20 bg-slate-950 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Breadcrumb */}
        {onBackToHome && (
          <div className="mb-8 flex items-center gap-2 text-xs text-slate-400">
            <button
              onClick={onBackToHome}
              className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <span>صفحه اصلی رهام</span>
            </button>
            <span>/</span>
            <span className="text-slate-300">خدمات و مشاوره سازمانی</span>
          </div>
        )}

        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-3">
            <span className="text-emerald-400 font-semibold">خدمات حرفه‌ای گروه رهام</span>
            <span aria-hidden="true">·</span>
            <span>Corporate & Personal Security</span>
            <span aria-hidden="true">·</span>
            <span>راهکارهای اختصاصی و سفارشی</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight" style={{ textWrap: "balance" }}>
            مشاوره راهبردی، آموزش سازمانی و ارزیابی عمیق امنیت سایبری
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            امنیت فراتر از یک نرم‌افزار است؛ امنیت نیازمند فرآیندهای اصولی، مهارت فنی بالای کارکنان و معماری غیرقابل‌نفوذ است. گروه امنیتی رهام با اتکا به تجربه پژوهش در لایه‌های پایین‌دستی سیستم‌ها، سازمان شما را در برابر پیچیده‌ترین تهدیدات بیمه می‌کند.
          </p>
        </div>

        {/* Top Image Banner: Enterprise SOC / Advisory Atmosphere */}
        <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-800 mb-12 shadow-xl">
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
                className="p-6 sm:p-7 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-sm text-slate-500 font-bold">{svc.index}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1.5">{svc.title}</h3>
                  <div className="text-xs text-emerald-400/90 mb-3 font-medium">{svc.audience}</div>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                    خروجی‌ها و دستاوردهای کلیدی:
                  </span>
                  {svc.deliverables.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout Box */}
        <div className="rounded-2xl bg-gradient-to-l from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-right">
            <h4 className="text-lg font-bold text-white">نیاز به مشاوره محرمانه برای سازمان خود دارید؟</h4>
            <p className="text-xs sm:text-sm text-slate-300">
              مشاوران ارشد گروه رهام آماده بررسی نیازهای دفاعی شما و ارائه نقشه راه اختصاصی هستند.
            </p>
          </div>
          <button
            onClick={onOpenConsultation}
            className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>درخواست جلسه مشاوره و ارزیابی</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
