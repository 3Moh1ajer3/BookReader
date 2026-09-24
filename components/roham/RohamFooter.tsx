"use client";

import React from "react";
import { Shield, BookOpen, Lock, Terminal, Globe, Mail, Phone, ExternalLink } from "lucide-react";

interface RohamFooterProps {
  onOpenReader: () => void;
  onOpenConsultation: () => void;
  onOpenEarlyAccess: () => void;
}

export const RohamFooter: React.FC<RohamFooterProps> = ({
  onOpenReader,
  onOpenConsultation,
  onOpenEarlyAccess,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>ROHAM SECURITY</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono">
                رهام
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              گروه امنیتی رهام؛ فعال در حوزه تحقیق و توسعه ابزارهای نوین دفاع سایبری، محافظت پیشرفته در برابر بدافزارهای استیلر، هاردنینگ سازمانی و نشر پژوهش‌های آسیب‌پذیری روز صفر.
            </p>

            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-500">
              <span>roham.org</span>
              <span aria-hidden="true">·</span>
              <span>rohamsecurity.com</span>
              <span aria-hidden="true">·</span>
              <span>rohamsec.com</span>
            </div>
          </div>

          {/* Quick Links: Products & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              محصولات و ابزارها
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo("anti-stealer")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  آنتی‌استیلر هوشمند رهام
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenEarlyAccess}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  پیش‌ثبت‌نام نسخه بتا
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("assessment")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  سنجش آنلاین سطح ریسک
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("radar")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  رادار اخبار و هوش تهدیدات
                </button>
              </li>
            </ul>
          </div>

          {/* Education & Academy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              آموزش و آکادمی
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo("courses")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  دوره‌های تحلیل بدافزار و استیلر
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("courses")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  امن‌سازی سشن‌ها و احراز هویت
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("courses")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  بوت‌کمپ تحقیقات روز صفر (Zero-Day)
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("blog")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  وبلاگ و مقالات تخصصی
                </button>
              </li>
            </ul>
          </div>

          {/* Research & Library */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
              کتابخانه و پژوهش
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={onOpenReader}
                  className="hover:text-emerald-400 transition-colors text-right flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ورود مستقیم به کتابخوان</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("library")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  کتاب از روز صفر تا روز صفر
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo("services")}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  خدمات و مشاوره سازمانی
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenConsultation}
                  className="hover:text-emerald-400 transition-colors text-right cursor-pointer"
                >
                  درخواست ارزیابی محرمانه
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            تمام حقوق برای گروه امنیتی رهام (Roham Security Group) محفوظ است. © 2026
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Privacy-First</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Local Defense Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
