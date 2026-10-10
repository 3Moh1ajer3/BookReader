"use client";

import React, { useState } from "react";
import {
  RohamUser,
  loginUser,
  registerUser,
  updateUserProfile,
  clearAuthSession,
} from "@/lib/authSync";
import { Book, Highlight, ReaderPreferences, SavedWord } from "@/types/reader";
import {
  User,
  Lock,
  Mail,
  Cloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  BookOpen,
  Highlighter,
  Bookmark,
  X,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Settings,
} from "lucide-react";

interface AuthAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RohamUser | null;
  onAuthSuccess: (user: RohamUser) => void;
  onLogout: () => void;
  onTriggerManualSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  highlights: Highlight[];
  savedWords: SavedWord[];
  preferences: ReaderPreferences;
  books: Book[];
  onJumpToChapter?: (bookId: string, chapterId: string) => void;
  onOpenAdminPanel?: () => void;
}

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const AuthAccountModal: React.FC<AuthAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
  onTriggerManualSync,
  isSyncing,
  lastSyncedAt,
  highlights,
  savedWords,
  preferences,
  books,
  onJumpToChapter,
  onOpenAdminPanel,
}) => {
  const [guestTab, setGuestTab] = useState<"login" | "register">("login");
  const [accountTab, setAccountTab] = useState<"sync" | "profile">("sync");

  // Login / Register state
  const [identifier, setIdentifier] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile update state
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editEmail, setEditEmail] = useState(currentUser?.email || "");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await loginUser(identifier, password);
      if (!res.ok || !res.user) {
        setErrorMsg(res.error || "ورود ناموفق بود.");
      } else {
        setPassword("");
        onAuthSuccess(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password,
        syncData: {
          preferences,
          highlights,
          savedWords,
          readingProgress: [],
        },
      });
      if (!res.ok || !res.user) {
        setErrorMsg(res.error || "ثبت‌نام ناموفق بود.");
      } else {
        setPassword("");
        onAuthSuccess(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      const res = await updateUserProfile({
        name: editName || currentUser?.name,
        email: editEmail || currentUser?.email,
        currentPassword: currentPass || undefined,
        newPassword: newPass || undefined,
      });
      if (!res.ok || !res.user) {
        setErrorMsg(res.error || "خطا در بروزرسانی پروفایل.");
      } else {
        setCurrentPass("");
        setNewPass("");
        setSuccessMsg(res.message || "پروفایل با موفقیت بروزرسانی شد.");
        onAuthSuccess(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    clearAuthSession();
    onLogout();
    onClose();
  };

  const latestProgress = currentUser?.syncData?.readingProgress?.[0] || null;
  const matchedBook = latestProgress
    ? books.find((b) => b.id === latestProgress.bookId) || books[0]
    : null;
  const matchedChapter =
    matchedBook && latestProgress
      ? matchedBook.chapters.find((c) => c.id === latestProgress.chapterId)
      : null;

  return (
    <div
      id="auth-account-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      style={{ direction: "rtl" }}
    >
      <div
        id="auth-account-modal"
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              {currentUser ? <Cloud className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                {currentUser ? "حساب کاربری و همگام‌سازی ابری" : "ورود و عضویت در کتابخوان رهام"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {currentUser
                  ? "اطلاعات مطالعه شما بین تمام دستگاه‌ها همگام‌سازی می‌شود"
                  : "حفظ هایلایت‌ها، واژگان و پیشرفت مطالعه در موبایل و لپ‌تاپ"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!currentUser ? (
            <>
              {/* Guest Login / Register Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setGuestTab("login");
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    guestTab === "login"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  ورود به حساب کاربری
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGuestTab("register");
                    setErrorMsg(null);
                  }}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    guestTab === "register"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  ثبت‌نام کاربر جدید
                </button>
              </div>

              {/* Benefits Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>مزایای حساب کاربری ابری رهام:</span>
                </div>
                <ul className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 pr-5 list-disc leading-relaxed">
                  <li>همگام‌سازی خودکار هایلایت‌ها، یادداشت‌ها و واژگان ذخیره‌شده در تمام دستگاه‌ها</li>
                  <li>ادامه مطالعه دقیقاً از آخرین فصل و موقعیتی که در گوشی یا سیستم دیگر بوده‌اید</li>
                  <li>پشتیبان‌گیری دائمی روی سرور بدون نگرانی از پاک شدن حافظه مرورگر</li>
                </ul>
              </div>

              {guestTab === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      ایمیل یا نام کاربری
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="user@example.com یا admin"
                        className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        style={{ direction: "ltr", textAlign: "left" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">رمز عبور</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        style={{ direction: "ltr", textAlign: "left" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
                  >
                    <span>{loading ? "در حال بررسی..." : "ورود و همگام‌سازی اطلاعات"}</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Quick helper for site owner to test default admin credentials */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>دسترسی پیش‌فرض مدیر سایت:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifier("admin@roham.sec");
                        setPassword("Admin@1234");
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-mono cursor-pointer"
                    >
                      پر کردن خودکار (admin@roham.sec)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      نام و نام خانوادگی
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="مثلاً: علی محمدی"
                        className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">آدرس ایمیل</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        style={{ direction: "ltr", textAlign: "left" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      رمز عبور (حداقل ۶ کاراکتر)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="حداقل ۶ کاراکتر"
                        className="w-full pr-10 pl-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        style={{ direction: "ltr", textAlign: "left" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
                  >
                    <span>
                      {loading
                        ? "در حال ساخت حساب..."
                        : "ایجاد حساب و انتقال داده‌های فعلی به فضای ابری"}
                    </span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {/* Logged-in User Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-base shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          currentUser.role === "admin"
                            ? "bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30"
                            : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                        }`}
                      >
                        {currentUser.role === "admin" ? "مدیر ارشد سایت" : "کاربر رسمی"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/70 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>

              {/* Admin Panel Shortcut if User is Admin */}
              {currentUser.role === "admin" && onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-l from-amber-500/10 via-emerald-500/10 to-slate-100 dark:to-slate-900 border border-amber-300 dark:border-amber-500/40 hover:border-amber-500 text-slate-900 dark:text-white flex items-center justify-between transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-400/40 flex items-center justify-center text-amber-800 dark:text-amber-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-300">
                        ورود به پنل مدیریت جامع سایت (Admin Panel)
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300">
                        مدیریت کاربران، درخواست‌های مشاوره و دوره‌ها، پادکست‌ها و تنظیمات هاست
                      </div>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-amber-700 dark:text-amber-300 group-hover:-translate-x-1 transition-transform shrink-0" />
                </button>
              )}

              {/* Account Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAccountTab("sync");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    accountTab === "sync"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>وضعیت همگام‌سازی ابری</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountTab("profile");
                    setEditName(currentUser.name);
                    setEditEmail(currentUser.email);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    accountTab === "profile"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>ویرایش پروفایل و رمز</span>
                </button>
              </div>

              {accountTab === "sync" ? (
                <div className="space-y-4">
                  {/* Sync Stats Grid */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <Highlighter className="w-4 h-4 text-amber-500 dark:text-amber-400 mx-auto" />
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        {toPersianDigits(highlights.length)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">هایلایت و یادداشت</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <Bookmark className="w-4 h-4 text-blue-500 dark:text-blue-400 mx-auto" />
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">
                        {toPersianDigits(savedWords.length)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">واژه ذخیره‌شده</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                      <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      <div className="text-base font-extrabold text-slate-900 dark:text-white">فعال</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">ذخیره خودکار فصل</div>
                    </div>
                  </div>

                  {/* Last Reading Position Card */}
                  {matchedBook && matchedChapter && latestProgress && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                          آخرین موقعیت مطالعه ثبت‌شده در حساب شما:
                        </span>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {matchedChapter.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {matchedBook.title} ({toPersianDigits(Math.round(latestProgress.scrollProgress))}% فصل)
                        </div>
                      </div>
                      {onJumpToChapter && (
                        <button
                          type="button"
                          onClick={() => {
                            onJumpToChapter(matchedBook.id, matchedChapter.id);
                            onClose();
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 cursor-pointer"
                        >
                          ادامه مطالعه
                        </button>
                      )}
                    </div>
                  )}

                  {/* Manual Sync Trigger */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">همگام‌سازی ابری با سرور هاست</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lastSyncedAt
                          ? `آخرین همگام‌سازی: ${new Date(lastSyncedAt).toLocaleTimeString("fa-IR")}`
                          : "همگام‌سازی خودکار هنگام تغییر فصل و یادداشت‌ها فعال است"}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isSyncing}
                      onClick={onTriggerManualSync}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                      <span>{isSyncing ? "در حال ثبت..." : "همگام‌سازی اکنون"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfileSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">نام نمایشی</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">آدرس ایمیل</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                      style={{ direction: "ltr", textAlign: "left" }}
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>تغییر رمز عبور (اختیاری)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="رمز عبور فعلی"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        style={{ direction: "ltr", textAlign: "left" }}
                      />
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="رمز جدید (حداقل ۶ کاراکتر)"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                        style={{ direction: "ltr", textAlign: "left" }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {loading ? "در حال ذخیره..." : "ذخیره تغییرات پروفایل"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
