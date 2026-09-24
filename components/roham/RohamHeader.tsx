"use client";

import React, { useState } from "react";
import { Shield, BookOpen, Menu, X, ArrowLeft } from "lucide-react";

interface RohamHeaderProps {
  onOpenReader: () => void;
  onOpenConsultation: () => void;
  onOpenEarlyAccess: () => void;
}

export const RohamHeader: React.FC<RohamHeaderProps> = ({
  onOpenReader,
  onOpenConsultation,
  onOpenEarlyAccess,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("hero");
          }}
          className="text-xl sm:text-2xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Shield className="w-5 h-5 text-emerald-500 inline-block" />
          <span>ROHAM SECURITY</span>
        </a>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollTo("anti-stealer")}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            آنتی‌استیلر هوشمند
          </button>
          <button
            onClick={() => scrollTo("services")}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            خدمات و مشاوره
          </button>
          <button
            onClick={() => scrollTo("courses")}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            دوره‌های آموزشی
          </button>
          <button
            onClick={() => scrollTo("blog")}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            وبلاگ و مقالات
          </button>
          <button
            onClick={() => scrollTo("library")}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            کتابخانه تخصصی
          </button>
          <button
            onClick={() => scrollTo("radar")}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer"
          >
            رادار تهدیدات
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReader}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-emerald-500/50 hover:bg-slate-800 transition-all whitespace-nowrap cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>ورود به کتابخوان</span>
          </button>
          <button
            onClick={onOpenEarlyAccess}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors whitespace-nowrap shadow-sm shadow-emerald-950 cursor-pointer"
          >
            <span>پیش‌ثبت‌نام بتا</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onOpenReader}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400 bg-slate-900 border border-slate-800 rounded-lg"
          >
            کتابخوان
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg focus-visible:outline-none"
            aria-label="منو"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-3 animate-in fade-in duration-150">
          <button
            onClick={() => scrollTo("anti-stealer")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            آنتی‌استیلر هوشمند (Roham Anti-Stealer)
          </button>
          <button
            onClick={() => scrollTo("services")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            خدمات و مشاوره سازمانی
          </button>
          <button
            onClick={() => scrollTo("courses")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            دوره‌های آموزشی تخصصی (Roham Academy)
          </button>
          <button
            onClick={() => scrollTo("blog")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            وبلاگ و مقالات تحلیلی دفاع سایبری
          </button>
          <button
            onClick={() => scrollTo("library")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            کتابخانه و مرکز دانش
          </button>
          <button
            onClick={() => scrollTo("radar")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            رادار اخبار و تهدیدات
          </button>
          <button
            onClick={() => scrollTo("assessment")}
            className="block w-full text-right py-2 text-sm text-slate-200 hover:text-emerald-400"
          >
            ارزیابی ریسک امنیتی
          </button>
          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEarlyAccess();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
            >
              درخواست دسترسی زودهنگام به آنتی‌استیلر
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 rounded-lg"
            >
              درخواست مشاوره تخصصی
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
