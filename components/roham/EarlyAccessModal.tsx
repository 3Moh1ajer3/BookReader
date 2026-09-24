"use client";

import React, { useState } from "react";
import { ShieldCheck, X, CheckCircle2, ArrowLeft, Lock } from "lucide-react";

interface EarlyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EarlyAccessModal: React.FC<EarlyAccessModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [os, setOs] = useState("windows");
  const [submitted, setSubmitted] = useState(false);
  const [reservationCode, setReservationCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const code = `ROHAM-BETA-${Math.floor(1000 + Math.random() * 9000)}-${os.toUpperCase().slice(0, 3)}`;
    setReservationCode(code);
    setSubmitted(true);

    try {
      const waitlist = JSON.parse(localStorage.getItem("roham_beta_waitlist") || "[]");
      waitlist.push({ name, email, organization, os, code, date: new Date().toISOString() });
      localStorage.setItem("roham_beta_waitlist", JSON.stringify(waitlist));
    } catch {}
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setOrganization("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-200 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">پیش‌ثبت‌نام بتای خصوصی آنتی‌استیلر رهام</h3>
              <p className="text-[11px] text-slate-400">Early Access & Private Beta Program</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">درخواست شما با موفقیت ثبت شد</h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              مشخصات شما در اولویت صف دسترسی نسخه آزمایشگاهی قرار گرفت. لینک فعال‌سازی پیش از انتشار عمومی به ایمیل ثبت‌شده ارسال خواهد شد.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 block mb-1 font-sans">کد پیگیری رزرواسیون شما:</span>
              <span className="text-emerald-400 font-bold text-sm tracking-widest">{reservationCode}</span>
            </div>

            <button
              onClick={handleReset}
              className="mt-2 w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              آنتی‌استیلر رهام برای جلوگیری از به سرقت رفتن سشن‌ها، کوکی‌های مرورگر و رمزهای عبور توسط بدافزارهای استیلر طراحی شده است. لطفاً فرم زیر را تکمیل کنید:
            </p>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">نام و نام خانوادگی *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: محمد امینی"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">آدرس ایمیل سازمانی یا کاری *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dir-ltr text-left"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">سازمان، استارتاپ یا سمت (اختیاری)</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="مثلاً: مدیر ارشد فناوری / کارشناس امنیت / تریدر"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">سیستم‌عامل هدف شما</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "windows", label: "Windows 10/11" },
                  { id: "linux", label: "Linux (Deb/Arch)" },
                  { id: "macos", label: "macOS (Apple)" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOs(item.id)}
                    className={`py-2 px-2 text-center text-xs rounded-xl border transition-all cursor-pointer ${
                      os === item.id
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-medium"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ثبت نام در فهرست دسترسی زودهنگام</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="block text-[11px] text-slate-500 text-center mt-2">
                اطلاعات شما کاملاً محرمانه بوده و هرگز به اشخاص ثالث ارائه نخواهد شد.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
