import { Highlight, ReaderPreferences, SavedWord } from "@/types/reader";

export interface BookReadingProgress {
  bookId: string;
  chapterId: string;
  scrollProgress: number;
  updatedAt: string;
}

export interface UserSyncData {
  preferences: ReaderPreferences | null;
  highlights: Highlight[];
  savedWords: SavedWord[];
  readingProgress: BookReadingProgress[];
  updatedAt: string;
}

export interface RohamUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string;
  syncData: UserSyncData;
}

export interface PortalLead {
  id: string;
  type: "early_access" | "consultation" | "course_enroll" | "general";
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  organization?: string;
  subject?: string;
  details?: string;
  trackingCode?: string;
  meta?: Record<string, unknown>;
  status: "new" | "reviewing" | "contacted" | "archived";
  adminNote: string;
  createdAt: string;
}

export interface SiteSettings {
  announcementEnabled: boolean;
  announcementText: string;
  announcementBadge: string;
  announcementLink: string;
  allowRegistration: boolean;
  defaultTheme: "light" | "sepia" | "dark" | "oled";
  defaultFontSize: number;
  geminiApiKey?: string;
  podcastOverrides: Record<string, string>;
  updatedAt: string;
}

export interface AdminDashboardData {
  users: RohamUser[];
  leads: PortalLead[];
  settings: SiteSettings;
  serverInfo: {
    phpVersion: string;
    storageEngine: string;
    hasGeminiKey: boolean;
    podcastFilesStatus: Record<string, boolean>;
    serverTime: string;
    isPreviewFallback?: boolean;
  };
}

const TOKEN_STORAGE_KEY = "roham_auth_token";
const USER_CACHE_KEY = "roham_auth_user_cache";

export function getDefaultSettings(): SiteSettings {
  return {
    announcementEnabled: false,
    announcementText: "نسخه جدید کتابخوان دوزبانه رهام به همراه پادکست صوتی فصل‌ها منتشر شد.",
    announcementBadge: "اطلاعیه",
    announcementLink: "/from-day-zero-to-zero-day",
    allowRegistration: true,
    defaultTheme: "sepia",
    defaultFontSize: 18,
    geminiApiKey: "",
    podcastOverrides: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getCachedUser(): RohamUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token: string, user: RohamUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {}
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

/**
 * برقراری ارتباط مستقیم با اندپوینت‌های PHP سرور و هاست
 */
async function callPhpApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(path, {
      ...options,
      headers,
    });

    const text = await res.text();
    const trimmed = text.trim();
    if (trimmed.startsWith("<?php") || trimmed.startsWith("<!DOCTYPE") || !trimmed.startsWith("{")) {
      return {
        ok: false,
        status: res.status,
        error: "سرور PHP پاسخ معتبر بازنگرداند.",
      };
    }

    const data = JSON.parse(trimmed) as T & { ok?: boolean; error?: string };
    const isOk = res.ok && data.ok !== false;
    return {
      ok: isOk,
      status: res.status,
      data,
      error: data.error,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "خطای نامشخص";
    return {
      ok: false,
      status: 0,
      error: `خطا در ارتباط با سرور PHP: ${message}`,
    };
  }
}

// ==================== AUTHENTICATION (PHP) ====================

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ ok: boolean; user?: RohamUser; token?: string; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; user?: RohamUser; token?: string; error?: string }>(
    "/api/auth.php?action=login",
    {
      method: "POST",
      body: JSON.stringify({ action: "login", identifier, password }),
    }
  );

  if (res.ok && res.data?.token && res.data?.user) {
    setAuthSession(res.data.token, res.data.user);
    return { ok: true, user: res.data.user, token: res.data.token };
  }

  return {
    ok: false,
    error: res.error || res.data?.error || "نام کاربری یا رمز عبور اشتباه است.",
  };
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  syncData?: Partial<UserSyncData>;
}): Promise<{ ok: boolean; user?: RohamUser; token?: string; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; user?: RohamUser; token?: string; error?: string }>(
    "/api/auth.php?action=register",
    {
      method: "POST",
      body: JSON.stringify({ action: "register", ...params }),
    }
  );

  if (res.ok && res.data?.token && res.data?.user) {
    setAuthSession(res.data.token, res.data.user);
    return { ok: true, user: res.data.user, token: res.data.token };
  }

  return {
    ok: false,
    error: res.error || res.data?.error || "خطا در ثبت‌نام کاربر در سیستم.",
  };
}

export async function fetchCurrentUser(): Promise<RohamUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  const res = await callPhpApi<{ ok: boolean; user?: RohamUser }>("/api/auth.php?action=me", {
    method: "GET",
  });

  if (res.ok && res.data?.user) {
    setAuthSession(token, res.data.user);
    return res.data.user;
  }

  if (res.status === 401 || res.status === 403) {
    clearAuthSession();
    return null;
  }

  // در صورت بروز قطعی موقت شبکه، از کش مرورگر استفاده می‌کنیم تا کاربر بی‌دلیل لاگ‌اوت نشود
  return getCachedUser();
}

export async function updateUserProfile(params: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; user?: RohamUser; message?: string; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; user?: RohamUser; message?: string; error?: string }>(
    "/api/auth.php?action=update_profile",
    {
      method: "POST",
      body: JSON.stringify({ action: "update_profile", ...params }),
    }
  );

  if (res.ok && res.data?.user) {
    const token = getStoredToken();
    if (token) setAuthSession(token, res.data.user);
    return {
      ok: true,
      user: res.data.user,
      message: res.data.message || "اطلاعات حساب با موفقیت بروزرسانی شد.",
    };
  }

  return {
    ok: false,
    error: res.error || res.data?.error || "خطا در بروزرسانی پروفایل کاربر.",
  };
}

// ==================== CLOUD READING SYNC (PHP) ====================

export async function pushCloudSync(payload: {
  mode?: "merge" | "overwrite";
  preferences?: ReaderPreferences;
  highlights?: Highlight[];
  savedWords?: SavedWord[];
  readingProgress?: BookReadingProgress[];
}): Promise<{ ok: boolean; syncData?: UserSyncData; message?: string }> {
  const token = getStoredToken();
  if (!token) return { ok: false };

  const res = await callPhpApi<{ ok: boolean; syncData?: UserSyncData; message?: string }>(
    "/api/sync.php",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (res.ok && res.data?.syncData) {
    const cached = getCachedUser();
    if (cached) {
      setAuthSession(token, { ...cached, syncData: res.data.syncData });
    }
    return {
      ok: true,
      syncData: res.data.syncData,
      message: res.data.message || "همگام‌سازی ابری انجام شد.",
    };
  }

  return { ok: false };
}

// ==================== PORTAL LEADS (PHP) ====================

export async function submitPortalLead(params: {
  type: "early_access" | "consultation" | "course_enroll";
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  organization?: string;
  subject?: string;
  details?: string;
  trackingCode?: string;
  meta?: Record<string, unknown>;
}): Promise<{ ok: boolean; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; error?: string }>("/api/leads.php", {
    method: "POST",
    body: JSON.stringify(params),
  });

  return {
    ok: res.ok,
    error: res.error || res.data?.error,
  };
}

// ==================== PUBLIC SITE CONFIG (PHP) ====================

export async function fetchPublicSiteConfig(): Promise<SiteSettings> {
  const res = await callPhpApi<{ ok: boolean; config?: SiteSettings }>("/api/public-config.php", {
    method: "GET",
  });

  if (res.ok && res.data?.config) {
    return res.data.config;
  }

  return getDefaultSettings();
}

// ==================== ADMIN PANEL (PHP) ====================

export async function fetchAdminDashboard(): Promise<{
  ok: boolean;
  data?: AdminDashboardData;
  error?: string;
}> {
  const res = await callPhpApi<{ ok: boolean; error?: string } & AdminDashboardData>(
    "/api/admin.php?action=dashboard",
    { method: "GET" }
  );

  if (res.ok && res.data) {
    return {
      ok: true,
      data: {
        users: res.data.users || [],
        leads: res.data.leads || [],
        settings: res.data.settings || getDefaultSettings(),
        serverInfo: res.data.serverInfo || {
          phpVersion: "PHP 8.x",
          storageEngine: "MySQL (cPanel)",
          hasGeminiKey: false,
          podcastFilesStatus: {},
          serverTime: new Date().toISOString(),
        },
      },
    };
  }

  return {
    ok: false,
    error: res.error || res.data?.error || "خطا در دریافت اطلاعات داشبورد از سرور PHP.",
  };
}

export async function adminCreateUser(params: {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}): Promise<{ ok: boolean; user?: RohamUser; message?: string; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; user?: RohamUser; message?: string; error?: string }>(
    "/api/admin.php?action=create_user",
    {
      method: "POST",
      body: JSON.stringify({ action: "create_user", ...params }),
    }
  );

  return {
    ok: res.ok,
    user: res.data?.user,
    message: res.data?.message || "کاربر با موفقیت ایجاد شد.",
    error: res.error || res.data?.error,
  };
}

export async function adminUpdateUser(params: {
  userId: string;
  role?: "user" | "admin";
  status?: "active" | "suspended";
  name?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; user?: RohamUser; message?: string; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; user?: RohamUser; message?: string; error?: string }>(
    "/api/admin.php?action=update_user",
    {
      method: "POST",
      body: JSON.stringify({ action: "update_user", ...params }),
    }
  );

  return {
    ok: res.ok,
    user: res.data?.user,
    message: res.data?.message || "مشخصات کاربر بروزرسانی شد.",
    error: res.error || res.data?.error,
  };
}

export async function adminDeleteUser(
  userId: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; message?: string; error?: string }>(
    "/api/admin.php?action=delete_user",
    {
      method: "POST",
      body: JSON.stringify({ action: "delete_user", userId }),
    }
  );

  return {
    ok: res.ok,
    message: res.data?.message || "کاربر با موفقیت حذف شد.",
    error: res.error || res.data?.error,
  };
}

export async function adminUpdateLead(params: {
  leadId: string;
  status?: PortalLead["status"];
  adminNote?: string;
}): Promise<{ ok: boolean; lead?: PortalLead; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; lead?: PortalLead; error?: string }>(
    "/api/admin.php?action=update_lead",
    {
      method: "POST",
      body: JSON.stringify({ action: "update_lead", ...params }),
    }
  );

  return {
    ok: res.ok,
    lead: res.data?.lead,
    error: res.error || res.data?.error,
  };
}

export async function adminDeleteLead(leadId: string): Promise<{ ok: boolean; error?: string }> {
  const res = await callPhpApi<{ ok: boolean; error?: string }>("/api/admin.php?action=delete_lead", {
    method: "POST",
    body: JSON.stringify({ action: "delete_lead", leadId }),
  });

  return {
    ok: res.ok,
    error: res.error || res.data?.error,
  };
}

export async function adminUpdateSettings(
  settings: Partial<SiteSettings>
): Promise<{ ok: boolean; settings?: SiteSettings; message?: string; error?: string }> {
  const res = await callPhpApi<{
    ok: boolean;
    settings?: SiteSettings;
    message?: string;
    error?: string;
  }>("/api/admin.php?action=update_settings", {
    method: "POST",
    body: JSON.stringify({ action: "update_settings", settings }),
  });

  return {
    ok: res.ok,
    settings: res.data?.settings,
    message: res.data?.message || "تنظیمات سایت با موفقیت در دیتابیس ذخیره شد.",
    error: res.error || res.data?.error,
  };
}
