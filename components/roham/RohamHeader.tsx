"use client";

import React, { useState } from "react";
import { Shield, BookOpen, Menu, X, ArrowLeft, User, ShieldCheck, Sun, Moon, Send } from "lucide-react";
import { RohamUser } from "@/lib/authSync";

export type RohamTab = "home" | "anti-stealer" | "courses" | "blog" | "radar" | "services";

interface RohamHeaderProps {
  activeTab: RohamTab;
  onSelectTab: (tab: RohamTab) => void;
  onOpenReader: () => void;
  onOpenConsultation: () => void;
  onOpenEarlyAccess: () => void;
  currentUser?: RohamUser | null;
  onOpenAuth?: () => void;
  onOpenAdmin?: () => void;
  portalTheme?: "light" | "dark";
  onTogglePortalTheme?: () => void;
}

export const RohamHeader: React.FC<RohamHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenReader,
  onOpenConsultation,
  onOpenEarlyAccess,
  currentUser,
  onOpenAuth,
  onOpenAdmin,
  portalTheme = "light",
  onTogglePortalTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = portalTheme === "dark";

  const handleNav = (tab: RohamTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navItems: { id: RohamTab; label: string }[] = [
    { id: "home", label: "صفحه اصلی" },
    { id: "radar", label: "اخبار امنیت" },
    { id: "blog", label: "وبلاگ و تحقیقات" },
    { id: "anti-stealer", label: "آنتی‌استیلر هوشمند" },
    { id: "courses", label: "دوره‌های آموزشی" },
    { id: "services", label: "خدمات سازمانی" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-200 ${
        isDark
          ? "border-slate-800/90 bg-slate-950/90 backdrop-blur-md text-white"
          : "border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-800 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Roham Wordmark & Insignia */}
        <button
          onClick={() => handleNav("home")}
          className="text-lg sm:text-xl font-bold tracking-tight transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer group"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isDark
                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700 group-hover:bg-emerald-100/80"
            }`}
          >
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-right">
            <span
              className={`font-mono font-black tracking-wider text-base sm:text-lg leading-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              ROHAM
            </span>
            <span
              className={`text-[10px] font-sans font-medium leading-none ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              پرتال پژوهشی امنیت سایبری
            </span>
          </div>
        </button>

        {/* Zone 2: Editorial Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 text-xs lg:text-[13px] font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? isDark
                      ? "bg-slate-800 text-emerald-400 font-bold"
                      : "bg-emerald-50/90 text-emerald-800 font-extrabold border border-emerald-200/60 shadow-2xs"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions, Theme Toggle, Reader & Auth */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* Light / Dark Mode Switcher */}
          {onTogglePortalTheme && (
            <button
              onClick={onTogglePortalTheme}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-amber-300 hover:text-amber-200 hover:bg-slate-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
              }`}
              title={isDark ? "تغییر به تم روشن و خوانا" : "تغییر به تم تاریک"}
              aria-label="تغییر تم"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {currentUser?.role === "admin" && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isDark
                  ? "text-amber-300 bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25"
                  : "text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100"
              }`}
              title="ورود به پنل مدیریت سایت"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>پنل ادمین</span>
            </button>
          )}

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
                isDark
                  ? "text-slate-200 bg-slate-900 border-slate-800 hover:bg-slate-800"
                  : "text-slate-700 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
              title={currentUser ? "حساب کاربری و همگام‌سازی ابری" : "ورود / ثبت‌نام کاربران"}
            >
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{currentUser ? currentUser.name : "ورود / عضویت"}</span>
            </button>
          )}

          {/* Telegram Channel Button */}
          <a
            href="https://t.me/RohamSec"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              isDark
                ? "bg-sky-950/60 border-sky-800/60 text-sky-300 hover:bg-sky-900/60 hover:text-white"
                : "bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 hover:text-sky-900"
            }`}
            title="عضویت در کانال تلگرام امنیت رهام (@RohamSec)"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">کانال تلگرام</span>
          </a>

          <button
            onClick={onOpenReader}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap cursor-pointer ${
              isDark
                ? "text-slate-200 bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50"
                : "text-slate-800 bg-white border-slate-300 hover:bg-slate-50 shadow-2xs"
            }`}
            title="ورود به کتابخوان تخصصی رهام"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>کتابخوان تخصصی</span>
          </button>

          <button
            onClick={onOpenEarlyAccess}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <span>آنتی‌استیلر</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex sm:hidden items-center gap-1.5">
          {onTogglePortalTheme && (
            <button
              onClick={onTogglePortalTheme}
              className={`p-1.5 rounded-lg border ${
                isDark ? "bg-slate-900 border-slate-800 text-amber-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={onOpenReader}
            className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border ${
              isDark ? "text-emerald-400 bg-slate-900 border-slate-800" : "text-emerald-700 bg-emerald-50 border-emerald-200"
            }`}
          >
            کتابخوان
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg ${
              isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
            aria-label="منو"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`sm:hidden border-b px-4 py-4 space-y-2 animate-in fade-in duration-150 ${
            isDark ? "border-slate-800 bg-slate-950 text-slate-100" : "border-slate-200 bg-white text-slate-900 shadow-lg"
          }`}
        >
          {currentUser?.role === "admin" && onOpenAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>ورود به پنل مدیریت سایت</span>
              </span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenAuth && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-xs font-bold border ${
                isDark ? "bg-slate-900 border-slate-800 text-emerald-400" : "bg-slate-50 border-slate-200 text-emerald-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{currentUser ? `حساب (${currentUser.name})` : "ورود / عضویت"}</span>
              </span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`block w-full text-right py-2 px-3 rounded-lg text-sm font-medium ${
                activeTab === item.id
                  ? isDark
                    ? "bg-slate-800 text-emerald-400 font-bold"
                    : "bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200/60"
                  : isDark
                  ? "text-slate-300"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <a
              href="https://t.me/RohamSec"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl text-center text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>کانال تلگرام رهام (@RohamSec)</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenEarlyAccess();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700"
            >
              پیش‌ثبت‌نام بتای آنتی‌استیلر
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConsultation();
              }}
              className={`w-full py-2.5 text-center text-xs font-semibold rounded-xl border ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-300 text-slate-700"
              }`}
            >
              درخواست مشاوره تخصصی
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
