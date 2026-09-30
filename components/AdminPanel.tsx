"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AdminDashboardData,
  PortalLead,
  RohamUser,
  SiteSettings,
  fetchAdminDashboard,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminUpdateLead,
  adminDeleteLead,
  adminUpdateSettings,
} from "@/lib/authSync";
import { Book } from "@/types/reader";
import {
  ShieldCheck,
  Users,
  Inbox,
  Settings,
  Headphones,
  LayoutDashboard,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Search,
  UserPlus,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Download,
  Megaphone,
  Server,
  Sparkles,
  Highlighter,
  Bookmark,
  Ban,
  Check,
  Save,
  FileText,
} from "lucide-react";
import { AdminContentManager } from "./roham/AdminContentManager";

interface AdminPanelProps {
  currentUser: RohamUser | null;
  books: Book[];
  onBackToPortal: () => void;
  onOpenReader: () => void;
  onOpenAuthModal: () => void;
  onSettingsUpdated: (settings: SiteSettings) => void;
  initialTab?: AdminTab;
  onOpenBlogPost?: (slug: string) => void;
  onOpenNewsArticle?: (slug: string) => void;
}

export type AdminTab = "overview" | "cms" | "leads" | "users" | "podcasts" | "settings";

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  books,
  onBackToPortal,
  onOpenReader,
  onOpenAuthModal,
  onSettingsUpdated,
  initialTab,
  onOpenBlogPost,
  onOpenNewsArticle,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || "overview");
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Leads filter state
  const [leadTypeFilter, setLeadTypeFilter] = useState<string>("all");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");

  // Users search & create state
  const [userSearch, setUserSearch] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPass, setNewUserPass] = useState("");
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
  const [resetPassUserId, setResetPassUserId] = useState<string | null>(null);
  const [resetPassValue, setResetPassValue] = useState("");

  // Settings draft state
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const showNotice = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminDashboard();
      if (res.ok && res.data) {
        setDashboard(res.data);
        setSettingsDraft(res.data.settings);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      return;
    }
    let cancelled = false;
    fetchAdminDashboard()
      .then((res) => {
        if (!cancelled && res.ok && res.data) {
          setDashboard(res.data);
          setSettingsDraft(res.data.settings);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // If not logged in or not admin, show access gate
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div
        className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6"
        style={{ direction: "rtl" }}
      >
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-white">پنل مدیریت ارشد رهام</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            برای دسترسی به پنل مدیریت سایت، کنترل کاربران، درخواست‌های سازمانی و تنظیمات هاست، ابتدا با حساب مدیر ارشد وارد شوید.
          </p>
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1 font-mono text-left" style={{ direction: "ltr" }}>
            <div className="text-slate-500 font-sans text-right mb-1">مشخصات پیش‌فرض مدیر (قابل تغییر در پنل):</div>
            <div>Email: <span className="text-emerald-400">admin@roham.sec</span></div>
            <div>Pass: <span className="text-emerald-400">Admin@1234</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={onOpenAuthModal}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              ورود به حساب مدیریت
            </button>
            <button
              onClick={onBackToPortal}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
            >
              بازگشت به سایت
            </button>
          </div>
        </div>
      </div>
    );
  }

  const users = dashboard?.users || [];
  const leads = dashboard?.leads || [];
  const totalHighlights = users.reduce((acc, u) => acc + (u.syncData?.highlights?.length || 0), 0);
  const totalVocab = users.reduce((acc, u) => acc + (u.syncData?.savedWords?.length || 0), 0);
  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await adminCreateUser({
      name: newUserName,
      email: newUserEmail,
      password: newUserPass,
      role: newUserRole,
    });
    if (!res.ok) {
      showNotice("err", res.error || "خطا در ایجاد کاربر");
    } else {
      showNotice("ok", res.message || "کاربر ایجاد شد.");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPass("");
      loadDashboard();
    }
  };

  const handleToggleUserRole = async (u: RohamUser) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    const res = await adminUpdateUser({ userId: u.id, role: nextRole });
    if (!res.ok) {
      showNotice("err", res.error || "خطا در تغییر سطح دسترسی");
    } else {
      showNotice("ok", `نقش «${u.name}» به ${nextRole === "admin" ? "مدیر ارشد" : "کاربر عادی"} تغییر یافت.`);
      loadDashboard();
    }
  };

  const handleToggleUserStatus = async (u: RohamUser) => {
    const nextStatus = u.status === "suspended" ? "active" : "suspended";
    const res = await adminUpdateUser({ userId: u.id, status: nextStatus });
    if (!res.ok) {
      showNotice("err", res.error || "خطا در تغییر وضعیت کاربر");
    } else {
      showNotice("ok", `وضعیت حساب «${u.name}» بروزرسانی شد.`);
      loadDashboard();
    }
  };

  const handleResetUserPassword = async (userId: string) => {
    if (resetPassValue.length < 6) {
      showNotice("err", "رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }
    const res = await adminUpdateUser({ userId, newPassword: resetPassValue });
    if (!res.ok) {
      showNotice("err", res.error || "خطا در تغییر رمز عبور");
    } else {
      showNotice("ok", "رمز عبور کاربر با موفقیت تغییر یافت.");
      setResetPassUserId(null);
      setResetPassValue("");
    }
  };

  const handleDeleteUser = async (u: RohamUser) => {
    const res = await adminDeleteUser(u.id);
    if (!res.ok) {
      showNotice("err", res.error || "خطا در حذف کاربر");
    } else {
      showNotice("ok", "کاربر حذف شد.");
      loadDashboard();
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: PortalLead["status"]) => {
    const res = await adminUpdateLead({ leadId, status });
    if (res.ok) {
      showNotice("ok", "وضعیت درخواست بروزرسانی شد.");
      loadDashboard();
    }
  };

  const handleUpdateLeadNote = async (leadId: string, adminNote: string) => {
    const res = await adminUpdateLead({ leadId, adminNote });
    if (res.ok) {
      showNotice("ok", "یادداشت مدیریتی ذخیره شد.");
      loadDashboard();
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const res = await adminDeleteLead(leadId);
    if (res.ok) {
      showNotice("ok", "درخواست حذف شد.");
      loadDashboard();
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settingsDraft) return;
    setSavingSettings(true);
    try {
      const res = await adminUpdateSettings(settingsDraft);
      if (!res.ok || !res.settings) {
        showNotice("err", res.error || "خطا در ذخیره تنظیمات");
      } else {
        setSettingsDraft(res.settings);
        onSettingsUpdated(res.settings);
        showNotice("ok", res.message || "تنظیمات با موفقیت در سرور ذخیره شد.");
        loadDashboard();
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDownloadFullBackup = () => {
    if (!dashboard) return;
    const blob = new Blob([JSON.stringify(dashboard, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `roham-cpanel-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("ok", "فایل پشتیبان کامل دیتابیس دانلود شد.");
  };

  const handleExportLeadsCsv = () => {
    if (!leads.length) return;
    const headers = ["ID", "Type", "Name", "Contact", "Organization", "Subject", "TrackingCode", "Status", "CreatedAt"];
    const rows = leads.map((l) => [
      l.id,
      l.type,
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.contact || "").replace(/"/g, '""')}"`,
      `"${(l.organization || "").replace(/"/g, '""')}"`,
      `"${(l.subject || "").replace(/"/g, '""')}"`,
      l.trackingCode || "",
      l.status,
      l.createdAt,
    ]);
    const csv = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roham-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads = leads.filter((l) => {
    if (leadTypeFilter !== "all" && l.type !== leadTypeFilter) return false;
    if (leadStatusFilter !== "all" && l.status !== leadStatusFilter) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const mainBook = books[0];
  const chaptersForPodcasts = mainBook.chapters.filter((c) => c.id !== "front-matter");

  return (
    <div
      id="roham-admin-panel"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"
      style={{ direction: "rtl" }}
    >
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-slate-200 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>سایت اصلی</span>
            </button>
            <button
              onClick={onOpenReader}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-slate-200 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>کتابخوان</span>
            </button>
            <div className="h-5 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-extrabold text-white">
                  پنل مدیریت جامع رهام (cPanel PHP)
                </h1>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  مدیریت کاربران، همگام‌سازی ابری، درخواست‌های سازمانی و تنظیمات کتابخوان
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboard}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
              title="بروزرسانی اطلاعات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={handleDownloadFullBackup}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پشتیبان کامل دیتابیس</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-4">
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-lg ${
              toast.type === "ok"
                ? "bg-emerald-950/80 border-emerald-700/70 text-emerald-200"
                : "bg-rose-950/80 border-rose-700/70 text-rose-200"
            }`}
          >
            {toast.type === "ok" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0 space-y-2">
          <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 flex lg:flex-col gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "داشبورد و آمار کلی", icon: LayoutDashboard },
              {
                id: "cms",
                label: "مدیریت وبلاگ و اخبار (CMS)",
                icon: FileText,
              },
              {
                id: "leads",
                label: "درخواست‌ها و ثبت‌نام‌ها",
                icon: Inbox,
                badge: newLeadsCount > 0 ? toPersianDigits(newLeadsCount) : undefined,
              },
              {
                id: "users",
                label: "مدیریت کاربران و مطالعه",
                icon: Users,
                badge: toPersianDigits(users.length),
              },
              { id: "podcasts", label: "مدیریت کتاب و پادکست‌ها", icon: Headphones },
              { id: "settings", label: "تنظیمات سایت و اطلاعیه", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-800 text-emerald-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Server Status Card */}
          <div className="hidden lg:block p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <Server className="w-4 h-4" />
              <span>وضعیت بک‌اند هاست PHP</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>موتور ذخیره‌سازی:</span>
                <span className="text-slate-200 font-mono">
                  {dashboard?.serverInfo?.storageEngine || "SQLite / JSON"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>محافظت فایل‌ها:</span>
                <span className="text-emerald-400">.htaccess Active</span>
              </div>
              <div className="flex justify-between">
                <span>کلید Gemini AI:</span>
                <span className={dashboard?.serverInfo?.hasGeminiKey ? "text-emerald-400" : "text-amber-400"}>
                  {dashboard?.serverInfo?.hasGeminiKey ? "تنظیم شده" : "پیش‌فرض (گوگل)"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Tab Content Area */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>کاربران ثبت‌نامی</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {toPersianDigits(users.length)}
                  </div>
                  <div className="text-[11px] text-emerald-400">همگام‌سازی ابری فعال</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>درخواست‌های سازمانی و دوره‌ها</span>
                    <Inbox className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {toPersianDigits(leads.length)}
                  </div>
                  <div className="text-[11px] text-amber-400">
                    {toPersianDigits(newLeadsCount)} درخواست جدید
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>هایلایت‌های ابری کاربران</span>
                    <Highlighter className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {toPersianDigits(totalHighlights)}
                  </div>
                  <div className="text-[11px] text-slate-400">ذخیره‌شده در سرور</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>واژگان ذخیره‌شده کاربران</span>
                    <Bookmark className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {toPersianDigits(totalVocab)}
                  </div>
                  <div className="text-[11px] text-slate-400">در بانک واژگان ابری</div>
                </div>
              </div>

              {/* Quick Guide for cPanel Hosting */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>معماری یکپارچه بدون نیاز به کانفیگ روی هاست cPanel PHP</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تمامی اطلاعات کاربران، رمزهای عبور هش‌شده (Bcrypt)، هایلایت‌ها، واژگان، پیشرفت فصل‌ها و فرم‌های ثبت‌نامی سایت به‌صورت خودکار توسط فایل‌های PHP داخل پوشه{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-950 text-emerald-400 font-mono">
                    public/api/
                  </code>{" "}
                  در دیتابیس SQLite/JSON هاست شما ذخیره می‌شوند و پوشه دیتابیس با{" "}
                  <code className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono">
                    .htaccess (Deny from all)
                  </code>{" "}
                  در برابر دسترسی مستقیم محافظت شده است.
                </p>
              </div>

              {/* Recent Leads & Recent Users */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">آخرین درخواست‌های ثبت‌شده در پورتال</h3>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="text-xs text-emerald-400 hover:underline cursor-pointer"
                    >
                      مشاهده همه
                    </button>
                  </div>
                  {leads.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">
                      هنوز درخواستی در فرم‌های مشاوره، دوره‌ها یا بتا ثبت نشده است.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {leads.slice(0, 4).map((l) => (
                        <div
                          key={l.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{l.name}</div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {l.subject || l.type} — {l.contact}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] shrink-0">
                            {l.status === "new" ? "جدید" : l.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">کاربران و وضعیت همگام‌سازی</h3>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-xs text-emerald-400 hover:underline cursor-pointer"
                    >
                      مدیریت کاربران
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {users.slice(0, 4).map((u) => (
                      <div
                        key={u.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">{u.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {u.role === "admin" ? "مدیر" : "کاربر"}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">
                            {u.email}
                          </div>
                        </div>
                        <div className="text-left text-[11px] text-slate-400 shrink-0">
                          <div>{toPersianDigits(u.syncData?.highlights?.length || 0)} هایلایت</div>
                          <div>{toPersianDigits(u.syncData?.savedWords?.length || 0)} واژه</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. LEADS & SUBMISSIONS CRM TAB */}
          {activeTab === "leads" && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    مدیریت درخواست‌های مشاوره، ثبت‌نام دوره‌ها و بتای آنتی‌استیلر
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تمامی فرم‌هایی که بازدیدکنندگان در سایت پر می‌کنند مستقیماً در این بخش ثبت می‌شوند.
                  </p>
                </div>
                {leads.length > 0 && (
                  <button
                    onClick={handleExportLeadsCsv}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>خروجی اکسل (CSV)</span>
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  { id: "all", label: "همه فرم‌ها" },
                  { id: "consultation", label: "مشاوره سازمانی" },
                  { id: "course_enroll", label: "ثبت‌نام دوره‌ها" },
                  { id: "early_access", label: "بتای آنتی‌استیلر" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setLeadTypeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl border font-semibold cursor-pointer ${
                      leadTypeFilter === f.id
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}

                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="new">جدید</option>
                  <option value="reviewing">در حال بررسی</option>
                  <option value="contacted">تماس گرفته شد</option>
                  <option value="archived">بایگانی شده</option>
                </select>
              </div>

              {filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  درخواستی مطابق با فیلتر انتخابی یافت نشد.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLeads.map((lead) => {
                    const typeLabels: Record<string, string> = {
                      consultation: "مشاوره سازمانی",
                      course_enroll: "ثبت‌نام دوره آموزشی",
                      early_access: "پیش‌ثبت‌نام بتای آنتی‌استیلر",
                      general: "عمومی",
                    };
                    return (
                      <div
                        key={lead.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-white">{lead.name}</span>
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                {typeLabels[lead.type] || lead.type}
                              </span>
                              {lead.trackingCode && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px]">
                                  {lead.trackingCode}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-300">
                              تماس:{" "}
                              <span className="font-mono text-emerald-400">{lead.contact}</span>
                              {lead.organization ? ` | سازمان: ${lead.organization}` : ""}
                              {lead.subject ? ` | موضوع: ${lead.subject}` : ""}
                            </div>
                            {lead.details && (
                              <p className="text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 mt-1">
                                {lead.details}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleUpdateLeadStatus(
                                  lead.id,
                                  e.target.value as PortalLead["status"]
                                )
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                            >
                              <option value="new">جدید</option>
                              <option value="reviewing">در حال بررسی</option>
                              <option value="contacted">تماس گرفته شد</option>
                              <option value="archived">بایگانی شده</option>
                            </select>
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 cursor-pointer"
                              title="حذف درخواست"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Admin Note Input */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                          <input
                            type="text"
                            defaultValue={lead.adminNote || ""}
                            placeholder="یادداشت پیگیری مدیر برای این درخواست..."
                            onBlur={(e) => {
                              if (e.target.value !== (lead.adminNote || "")) {
                                handleUpdateLeadNote(lead.id, e.target.value);
                              }
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {new Date(lead.createdAt).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. USERS MANAGEMENT TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* Create New User Form */}
              <form
                onSubmit={handleCreateUser}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>افزودن کاربر یا مدیر جدید</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="نام و نام خانوادگی"
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="ایمیل کاربر"
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserPass}
                    onChange={(e) => setNewUserPass(e.target.value)}
                    placeholder="رمز عبور (حداقل ۶ کاراکتر)"
                    className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    style={{ direction: "ltr", textAlign: "left" }}
                  />
                  <div className="flex gap-2">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as "user" | "admin")}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      <option value="user">کاربر عادی</option>
                      <option value="admin">مدیر ارشد</option>
                    </select>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                    >
                      ایجاد
                    </button>
                  </div>
                </div>
              </form>

              {/* Users List */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-white">
                    فهرست کاربران ثبت‌نام‌شده ({toPersianDigits(filteredUsers.length)})
                  </h2>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="جستجوی نام یا ایمیل..."
                      className="w-full pr-9 pl-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUsers.map((u) => {
                    const lastProg = u.syncData?.readingProgress?.[0];
                    return (
                      <div
                        key={u.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{u.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  u.role === "admin"
                                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                }`}
                              >
                                {u.role === "admin" ? "مدیر ارشد" : "کاربر"}
                              </span>
                              {u.status === "suspended" && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                  مسدود شده
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                              <span>
                                هایلایت‌ها:{" "}
                                <strong className="text-slate-200">
                                  {toPersianDigits(u.syncData?.highlights?.length || 0)}
                                </strong>
                              </span>
                              <span>
                                واژگان:{" "}
                                <strong className="text-slate-200">
                                  {toPersianDigits(u.syncData?.savedWords?.length || 0)}
                                </strong>
                              </span>
                              {lastProg && (
                                <span className="text-emerald-400">
                                  آخرین فصل مطالعه: {lastProg.chapterId} ({toPersianDigits(Math.round(lastProg.scrollProgress))}%)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <button
                              onClick={() => handleToggleUserRole(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 cursor-pointer"
                            >
                              {u.role === "admin" ? "تغییر به کاربر" : "ارتقا به مدیر"}
                            </button>
                            <button
                              onClick={() =>
                                setResetPassUserId(resetPassUserId === u.id ? null : u.id)
                              }
                              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 flex items-center gap-1 cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>رمز جدید</span>
                            </button>
                            {u.id !== currentUser.id && (
                              <>
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
                                  title={u.status === "suspended" ? "فعال‌سازی حساب" : "مسدود کردن"}
                                >
                                  {u.status === "suspended" ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Ban className="w-4 h-4 text-amber-400" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/60 text-rose-300 cursor-pointer"
                                  title="حذف کاربر"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {resetPassUserId === u.id && (
                          <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                            <input
                              type="password"
                              value={resetPassValue}
                              onChange={(e) => setResetPassValue(e.target.value)}
                              placeholder="رمز عبور جدید برای این کاربر (حداقل ۶ کاراکتر)"
                              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                              style={{ direction: "ltr", textAlign: "left" }}
                            />
                            <button
                              type="button"
                              onClick={() => handleResetUserPassword(u.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                            >
                              ثبت رمز جدید
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. PODCASTS & BOOKS MANAGEMENT TAB */}
          {activeTab === "podcasts" && settingsDraft && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    مدیریت پادکست فصل‌ها و مسیر فایل‌های صوتی روی هاست
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    به‌صورت پیش‌فرض، پلیر فایل‌های داخل پوشه{" "}
                    <code className="text-emerald-400 font-mono">
                      public/podcasts/from-day-zero-to-zero-day/
                    </code>{" "}
                    را پخش می‌کند. در صورت تمایل می‌توانید برای هر فصل لینک مستقیم یا CDN سفارشی نیز وارد کنید.
                  </p>
                </div>
                <button
                  onClick={() => handleSaveSettings()}
                  disabled={savingSettings}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSettings ? "در حال ذخیره..." : "ذخیره تنظیمات پادکست"}</span>
                </button>
              </div>

              <div className="space-y-3">
                {chaptersForPodcasts.map((ch) => {
                  const overrideKey = `from-day-zero-to-zero-day:${ch.id}`;
                  const currentOverride = settingsDraft.podcastOverrides?.[overrideKey] || "";
                  const defaultPath = `/podcasts/from-day-zero-to-zero-day/${ch.id}.m4a`;
                  return (
                    <div
                      key={ch.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="text-xs font-bold text-white">{ch.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono" style={{ direction: "ltr", textAlign: "right" }}>
                          مسیر پیش‌فرض هاست: {defaultPath}
                        </div>
                      </div>
                      <div className="w-full sm:w-80">
                        <input
                          type="text"
                          value={currentOverride}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSettingsDraft((prev) => {
                              if (!prev) return prev;
                              const nextOverrides = { ...(prev.podcastOverrides || {}) };
                              if (val.trim()) {
                                nextOverrides[overrideKey] = val.trim();
                              } else {
                                delete nextOverrides[overrideKey];
                              }
                              return { ...prev, podcastOverrides: nextOverrides };
                            });
                          }}
                          placeholder="لینک سفارشی اختیاری (خالی = مسیر پیش‌فرض هاست)"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                          style={{ direction: "ltr", textAlign: "left" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. SITE SETTINGS & AI CONFIG TAB */}
          {activeTab === "settings" && settingsDraft && (
            <form
              onSubmit={handleSaveSettings}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    تنظیمات کلی سایت، بنر اطلاعیه و کلید هوش مصنوعی
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    تغییرات این بخش بلافاصله برای تمام بازدیدکنندگان سایت اعمال می‌گردد.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingSettings ? "در حال ذخیره..." : "ذخیره تنظیمات"}</span>
                </button>
              </div>

              {/* Global Announcement Banner Config */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400">
                    <Megaphone className="w-4 h-4" />
                    <span>بنر اطلاعیه سراسری بالای سایت</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsDraft.announcementEnabled}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          announcementEnabled: e.target.checked,
                        })
                      }
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-200">نمایش فعال باشد</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">برچسب اطلاعیه</label>
                    <input
                      type="text"
                      value={settingsDraft.announcementBadge}
                      onChange={(e) =>
                        setSettingsDraft({ ...settingsDraft, announcementBadge: e.target.value })
                      }
                      placeholder="مثلاً: خبر ویژه"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">متن اطلاعیه</label>
                    <input
                      type="text"
                      value={settingsDraft.announcementText}
                      onChange={(e) =>
                        setSettingsDraft({ ...settingsDraft, announcementText: e.target.value })
                      }
                      placeholder="متن اطلاعیه بالای هدر..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Registration & Default Reader Preferences */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="text-xs sm:text-sm font-bold text-emerald-400">
                  تنظیمات عضویت کاربران و پیش‌فرض‌های کتابخوان
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-900">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      امکان ثبت‌نام کاربران جدید
                    </div>
                    <div className="text-[11px] text-slate-400">
                      در صورت غیرفعال کردن، فقط کاربران قبلی و مدیر می‌توانند وارد شوند.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.allowRegistration}
                    onChange={(e) =>
                      setSettingsDraft({ ...settingsDraft, allowRegistration: e.target.checked })
                    }
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">
                      تم پیش‌فرض کتابخوان برای مراجعین جدید
                    </label>
                    <select
                      value={settingsDraft.defaultTheme}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          defaultTheme: e.target.value as SiteSettings["defaultTheme"],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value="sepia">کاغذی گرم (Sepia)</option>
                      <option value="light">روشن (Light)</option>
                      <option value="dark">تیره (Dark)</option>
                      <option value="oled">مشکی مطلق (OLED)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1.5">
                      اندازه قلم پیش‌فرض کتابخوان ({toPersianDigits(settingsDraft.defaultFontSize)} پیکسل)
                    </label>
                    <input
                      type="range"
                      min={14}
                      max={24}
                      value={settingsDraft.defaultFontSize}
                      onChange={(e) =>
                        setSettingsDraft({
                          ...settingsDraft,
                          defaultFontSize: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Gemini API Key on Host */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="text-xs sm:text-sm font-bold text-blue-400">
                  کلید هوش مصنوعی Gemini برای ترجمه پیشرفته روی هاست (اختیاری)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  فایل <code className="font-mono text-slate-300">api/translate.php</code> به‌صورت پیش‌فرض از دیکشنری تخصصی امنیت + مترجم گوگل استفاده می‌کند. اگر کلید Gemini را در اینجا وارد کنید، در دیتابیس امن سرور ذخیره شده و برای ترجمه‌های هوش مصنوعی استفاده می‌شود.
                </p>
                <input
                  type="password"
                  value={settingsDraft.geminiApiKey || ""}
                  onChange={(e) =>
                    setSettingsDraft({ ...settingsDraft, geminiApiKey: e.target.value })
                  }
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                  style={{ direction: "ltr", textAlign: "left" }}
                />
              </div>
            </form>
          )}

          {/* 6. DYNAMIC BLOG & SECURITY NEWS CMS TAB */}
          {activeTab === "cms" && (
            <AdminContentManager
              onOpenBlogPost={onOpenBlogPost}
              onOpenNewsArticle={onOpenNewsArticle}
            />
          )}
        </main>
      </div>
    </div>
  );
};
