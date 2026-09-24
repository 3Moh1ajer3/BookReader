"use client";

import React, { useState } from "react";
import { Shield, BookOpen, Menu, X, ArrowLeft } from "lucide-react";

export type RohamTab = "home" | "anti-stealer" | "courses" | "blog" | "radar" | "services";

interface RohamHeaderProps {
  activeTab: RohamTab;
  onSelectTab: (tab: RohamTab) => void;
  onOpenReader: () => void;
  onOpenConsultation: () => void;
  onOpenEarlyAccess: () => void;
}

export const RohamHeader: React.FC<RohamHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenReader,
  onOpenConsultation,
  onOpenEarlyAccess,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: RohamTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNav("home")}
          className="text-lg sm:text-xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-mono font-black tracking-wider">ROHAM</span>
          <span className="text-xs font-normal text-slate-400 font-sans hidden sm:inline">
            | گروه امنیتی رهام
          </span>
        </button>

        {/* Zone 2: Clean tab navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs lg:text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNav("home")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "home"
                ? "bg-slate-800 text-emerald-400 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            صفحه اصلی
          </button>
          <button
            onClick={() => handleNav("anti-stealer")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "anti-stealer"
                ? "bg-slate-800 text-emerald-400 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            آنتی‌استیلر هوشمند
          </button>
          <button
            onClick={() => handleNav("courses")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "courses"
                ? "bg-slate-800 text-emerald-400 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            دوره‌های آموزشی
          </button>
          <button
            onClick={() => handleNav("blog")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "blog"
                ? "bg-slate-800 text-emerald-400 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            وبلاگ و مقالات
          </button>
          <button
            onClick={() => handleNav("radar")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "radar"
                ? "bg-slate-800 text-emerald-400 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            رادار تهدیدات
          </button>
          <button
            onClick={() => handleNav("services")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "services"
                ? "bg-slate-800 text-emerald-400 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-900"
            }`}
          >
            خدمات سازمانی
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReader}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 rounded-lg hover:border-emerald-500/50 hover:bg-slate-800 transition-all whitespace-nowrap cursor-pointer shadow-xs"
            title="ورود به کتابخوان تخصصی رهام"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>ورود به کتابخوان</span>
          </button>
          <button
            onClick={onOpenEarlyAccess}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-colors whitespace-nowrap shadow-sm shadow-emerald-950 cursor-pointer"
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
        <div className="sm:hidden border-b border-slate-800 bg-slate-950 px-4 py-4 space-y-2 animate-in fade-in duration-150">
          <button
            onClick={() => handleNav("home")}
            className={`block w-full text-right py-2 px-3 rounded-lg text-sm ${
              activeTab === "home" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
            }`}
          >
            صفحه اصلی رهام
          </button>
          <button
            onClick={() => handleNav("anti-stealer")}
            className={`block w-full text-right py-2 px-3 rounded-lg text-sm ${
              activeTab === "anti-stealer" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
            }`}
          >
            آنتی‌استیلر هوشمند رهام
          </button>
          <button
            onClick={() => handleNav("courses")}
            className={`block w-full text-right py-2 px-3 rounded-lg text-sm ${
              activeTab === "courses" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
            }`}
          >
            دوره‌های آموزشی (Roham Academy)
          </button>
          <button
            onClick={() => handleNav("blog")}
            className={`block w-full text-right py-2 px-3 rounded-lg text-sm ${
              activeTab === "blog" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
            }`}
          >
            وبلاگ و مقالات تحلیلی
          </button>
          <button
            onClick={() => handleNav("radar")}
            className={`block w-full text-right py-2 px-3 rounded-lg text-sm ${
              activeTab === "radar" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
            }`}
          >
            رادار اخبار و هوش تهدیدات
          </button>
          <button
            onClick={() => handleNav("services")}
            className={`block w-full text-right py-2 px-3 rounded-lg text-sm ${
              activeTab === "services" ? "bg-slate-800 text-emerald-400 font-bold" : "text-slate-300"
            }`}
          >
            خدمات و مشاوره سازمانی
          </button>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEarlyAccess();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
            >
              درخواست پیش‌ثبت‌نام بتای آنتی‌استیلر
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
