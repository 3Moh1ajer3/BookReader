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
const EMULATED_DB_KEY = "roham_cpanel_db_emulation_v1";

interface EmulatedUserRecord extends RohamUser {
  passwordPlain: string;
}

interface EmulatedDb {
  users: EmulatedUserRecord[];
  leads: PortalLead[];
  settings: SiteSettings;
}

function getDefaultSettings(): SiteSettings {
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

function loadEmulatedDb(): EmulatedDb {
  if (typeof window === "undefined") {
    return { users: [], leads: [], settings: getDefaultSettings() };
  }
  try {
    const raw = localStorage.getItem(EMULATED_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.users)) {
        return parsed;
      }
    }
  } catch {}

  const now = new Date().toISOString();
  const initialDb: EmulatedDb = {
    users: [
      {
        id: "usr_admin_1",
        username: "admin",
        email: "admin@roham.sec",
        name: "مدیر ارشد رهام",
        passwordPlain: "Admin@1234",
        role: "admin",
        status: "active",
        createdAt: now,
        lastLoginAt: now,
        syncData: {
          preferences: null,
          highlights: [],
          savedWords: [],
          readingProgress: [],
          updatedAt: now,
        },
      },
    ],
    leads: [],
    settings: getDefaultSettings(),
  };

  try {
    // Migrate any existing local waitlist/consultations/enrollments into leads so Admin sees them immediately
    const betaWaitlist = JSON.parse(localStorage.getItem("roham_beta_waitlist") || "[]");
    for (const item of betaWaitlist) {
      initialDb.leads.push({
        id: `lead_beta_${Math.random().toString(36).slice(2, 9)}`,
        type: "early_access",
        name: item.name || "کاربر بتا",
        contact: item.email || "",
        email: item.email || "",
        organization: item.organization || "",
        subject: `بتای آنتی‌استیلر (${item.os || "windows"})`,
        details: `سیستم‌عامل: ${item.os || "windows"}`,
        trackingCode: item.code || "",
        status: "new",
        adminNote: "",
        createdAt: item.date || now,
      });
    }

    const consultations = JSON.parse(localStorage.getItem("roham_consultation_requests") || "[]");
    for (const item of consultations) {
      initialDb.leads.push({
        id: `lead_cons_${Math.random().toString(36).slice(2, 9)}`,
        type: "consultation",
        name: item.name || "متقاضی مشاوره",
        contact: item.contact || "",
        organization: item.organization || "",
        subject: `مشاوره سازمانی (${item.service || "hardening"})`,
        details: item.details || "",
        trackingCode: item.ticketId || "",
        status: "new",
        adminNote: "",
        createdAt: item.date || now,
      });
    }

    const enrollments = JSON.parse(localStorage.getItem("roham_course_enrollments") || "[]");
    for (const item of enrollments) {
      initialDb.leads.push({
        id: `lead_crs_${Math.random().toString(36).slice(2, 9)}`,
        type: "course_enroll",
        name: item.fullName || "متقاضی دوره",
        contact: item.email || item.phone || "",
        email: item.email || "",
        phone: item.phone || "",
        organization: item.organization || "",
        subject: item.courseTitle || item.courseId || "دوره آموزشی",
        details: item.notes || `نوع ثبت‌نام: ${item.enrollType === "corporate" ? "سازمانی" : "فردی"}`,
        trackingCode: item.trackingCode || "",
        status: "new",
        adminNote: "",
        createdAt: item.submittedAt || now,
      });
    }

    localStorage.setItem(EMULATED_DB_KEY, JSON.stringify(initialDb));
  } catch {}

  return initialDb;
}

function saveEmulatedDb(db: EmulatedDb): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EMULATED_DB_KEY, JSON.stringify(db));
  } catch {}
}

function sanitizeEmulatedUser(u: EmulatedUserRecord): RohamUser {
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    syncData: u.syncData,
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
 * فراخوانی اندپوینت PHP روی هاست سی‌پنل.
 * اگر پاسخ JSON معتبر نباشد (مثلاً در محیط پیش‌نمایش استاتیک که مفسر PHP فعال نیست)، `null` برمی‌گرداند تا موتور شبیه‌ساز اجرا شود.
 */
async function tryCallPhp<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T } | null> {
  try {
    const token = getStoredToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
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
    // اگر فایل PHP خام برگشته باشد یا HTML خطا باشد، یعنی روی هاست PHP نیستیم
    if (!trimmed.startsWith("{") || trimmed.startsWith("<?php")) {
      return null;
    }

    const parsed = JSON.parse(trimmed) as T;
    return { status: res.status, data: parsed };
  } catch {
    return null;
  }
}

// ==================== AUTHENTICATION ====================

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ ok: boolean; user?: RohamUser; token?: string; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; user?: RohamUser; token?: string; error?: string }>(
    "/api/auth.php?action=login",
    {
      method: "POST",
      body: JSON.stringify({ action: "login", identifier, password }),
    }
  );

  if (phpRes) {
    if (phpRes.data.ok && phpRes.data.token && phpRes.data.user) {
      setAuthSession(phpRes.data.token, phpRes.data.user);
    }
    return phpRes.data;
  }

  // Fallback for preview / non-PHP dev server
  const db = loadEmulatedDb();
  const cleanId = identifier.trim().toLowerCase();
  const foundIdx = db.users.findIndex(
    (u) => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
  );

  if (foundIdx === -1) {
    return { ok: false, error: "حساب کاربری با این ایمیل یا نام کاربری یافت نشد." };
  }

  const user = db.users[foundIdx];
  if (user.passwordPlain !== password) {
    return { ok: false, error: "ایمیل/نام کاربری یا رمز عبور اشتباه است." };
  }

  if (user.status === "suspended") {
    return { ok: false, error: "این حساب کاربری توسط مدیریت مسدود شده است." };
  }

  user.lastLoginAt = new Date().toISOString();
  saveEmulatedDb(db);

  const sanitized = sanitizeEmulatedUser(user);
  const token = `emu_tok_${user.id}_${Date.now()}`;
  setAuthSession(token, sanitized);
  return { ok: true, token, user: sanitized };
}

export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  syncData?: Partial<UserSyncData>;
}): Promise<{ ok: boolean; user?: RohamUser; token?: string; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; user?: RohamUser; token?: string; error?: string }>(
    "/api/auth.php?action=register",
    {
      method: "POST",
      body: JSON.stringify({ action: "register", ...params }),
    }
  );

  if (phpRes) {
    if (phpRes.data.ok && phpRes.data.token && phpRes.data.user) {
      setAuthSession(phpRes.data.token, phpRes.data.user);
    }
    return phpRes.data;
  }

  const db = loadEmulatedDb();
  if (!db.settings.allowRegistration) {
    return { ok: false, error: "ثبت‌نام کاربران جدید در حال حاضر توسط مدیر سایت غیرفعال شده است." };
  }

  const cleanEmail = params.email.trim().toLowerCase();
  if (!params.name.trim() || !cleanEmail || params.password.length < 6) {
    return { ok: false, error: "لطفاً نام، ایمیل معتبر و رمز عبور (حداقل ۶ کاراکتر) را وارد کنید." };
  }

  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: "این آدرس ایمیل قبلاً ثبت شده است. لطفاً وارد شوید." };
  }

  const now = new Date().toISOString();
  const newUser: EmulatedUserRecord = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    username: cleanEmail.split("@")[0],
    email: cleanEmail,
    name: params.name.trim(),
    passwordPlain: params.password,
    role: "user",
    status: "active",
    createdAt: now,
    lastLoginAt: now,
    syncData: {
      preferences: params.syncData?.preferences || null,
      highlights: params.syncData?.highlights || [],
      savedWords: params.syncData?.savedWords || [],
      readingProgress: params.syncData?.readingProgress || [],
      updatedAt: now,
    },
  };

  db.users.push(newUser);
  saveEmulatedDb(db);

  const sanitized = sanitizeEmulatedUser(newUser);
  const token = `emu_tok_${newUser.id}_${Date.now()}`;
  setAuthSession(token, sanitized);
  return { ok: true, token, user: sanitized };
}

export async function fetchCurrentUser(): Promise<RohamUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  const phpRes = await tryCallPhp<{ ok: boolean; user?: RohamUser }>("/api/auth.php?action=me", {
    method: "GET",
  });

  if (phpRes) {
    if (phpRes.data.ok && phpRes.data.user) {
      setAuthSession(token, phpRes.data.user);
      return phpRes.data.user;
    }
    if (phpRes.status === 401 || phpRes.status === 403) {
      clearAuthSession();
      return null;
    }
  }

  const db = loadEmulatedDb();
  const cached = getCachedUser();
  if (!cached) return null;
  const found = db.users.find((u) => u.id === cached.id);
  if (!found || found.status === "suspended") {
    clearAuthSession();
    return null;
  }
  const sanitized = sanitizeEmulatedUser(found);
  setAuthSession(token, sanitized);
  return sanitized;
}

export async function updateUserProfile(params: {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; user?: RohamUser; message?: string; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; user?: RohamUser; message?: string; error?: string }>(
    "/api/auth.php?action=update_profile",
    {
      method: "POST",
      body: JSON.stringify({ action: "update_profile", ...params }),
    }
  );

  if (phpRes) {
    if (phpRes.data.ok && phpRes.data.user) {
      const tok = getStoredToken();
      if (tok) setAuthSession(tok, phpRes.data.user);
    }
    return phpRes.data;
  }

  const db = loadEmulatedDb();
  const cached = getCachedUser();
  if (!cached) return { ok: false, error: "ابتدا وارد حساب کاربری شوید." };

  const idx = db.users.findIndex((u) => u.id === cached.id);
  if (idx === -1) return { ok: false, error: "کاربر یافت نشد." };

  if (params.name && params.name.trim()) {
    db.users[idx].name = params.name.trim();
  }
  if (params.email && params.email.trim()) {
    const cleanEmail = params.email.trim().toLowerCase();
    if (db.users.some((u, i) => i !== idx && u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: "این ایمیل متعلق به کاربر دیگری است." };
    }
    db.users[idx].email = cleanEmail;
  }
  if (params.newPassword) {
    if (params.newPassword.length < 6) {
      return { ok: false, error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد." };
    }
    if (params.currentPassword && db.users[idx].passwordPlain !== params.currentPassword) {
      return { ok: false, error: "رمز عبور فعلی اشتباه است." };
    }
    db.users[idx].passwordPlain = params.newPassword;
  }

  saveEmulatedDb(db);
  const sanitized = sanitizeEmulatedUser(db.users[idx]);
  const tok = getStoredToken();
  if (tok) setAuthSession(tok, sanitized);
  return { ok: true, user: sanitized, message: "اطلاعات حساب کاربری با موفقیت بروزرسانی شد." };
}

// ==================== CLOUD READING SYNC ====================

export async function pushCloudSync(payload: {
  mode?: "merge" | "overwrite";
  preferences?: ReaderPreferences;
  highlights?: Highlight[];
  savedWords?: SavedWord[];
  readingProgress?: BookReadingProgress[];
}): Promise<{ ok: boolean; syncData?: UserSyncData; message?: string }> {
  const token = getStoredToken();
  if (!token) return { ok: false };

  const phpRes = await tryCallPhp<{ ok: boolean; syncData?: UserSyncData; message?: string }>(
    "/api/sync.php",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (phpRes) {
    if (phpRes.data.ok && phpRes.data.syncData) {
      const cached = getCachedUser();
      if (cached) {
        setAuthSession(token, { ...cached, syncData: phpRes.data.syncData });
      }
    }
    return phpRes.data;
  }

  const db = loadEmulatedDb();
  const cached = getCachedUser();
  if (!cached) return { ok: false };

  const idx = db.users.findIndex((u) => u.id === cached.id);
  if (idx === -1) return { ok: false };

  const current = db.users[idx].syncData || {
    preferences: null,
    highlights: [],
    savedWords: [],
    readingProgress: [],
    updatedAt: new Date().toISOString(),
  };

  const mode = payload.mode || "merge";

  if (payload.preferences) {
    current.preferences = payload.preferences;
  }
  if (payload.readingProgress) {
    current.readingProgress = payload.readingProgress;
  }
  if (payload.highlights) {
    if (mode === "overwrite") {
      current.highlights = payload.highlights;
    } else {
      const map = new Map<string, Highlight>();
      for (const h of current.highlights || []) map.set(h.id, h);
      for (const h of payload.highlights) map.set(h.id, h);
      current.highlights = Array.from(map.values());
    }
  }
  if (payload.savedWords) {
    if (mode === "overwrite") {
      current.savedWords = payload.savedWords;
    } else {
      const map = new Map<string, SavedWord>();
      for (const w of current.savedWords || []) map.set(w.word.toLowerCase(), w);
      for (const w of payload.savedWords) map.set(w.word.toLowerCase(), w);
      current.savedWords = Array.from(map.values());
    }
  }

  current.updatedAt = new Date().toISOString();
  db.users[idx].syncData = current;
  saveEmulatedDb(db);

  const sanitized = sanitizeEmulatedUser(db.users[idx]);
  setAuthSession(token, sanitized);

  return {
    ok: true,
    syncData: current,
    message: "اطلاعات مطالعه شما با موفقیت همگام‌سازی شد.",
  };
}

// ==================== PORTAL LEADS SUBMISSION ====================

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
}): Promise<{ ok: boolean }> {
  const phpRes = await tryCallPhp<{ ok: boolean }>("/api/leads.php", {
    method: "POST",
    body: JSON.stringify(params),
  });

  if (phpRes && phpRes.data.ok) {
    return { ok: true };
  }

  const db = loadEmulatedDb();
  db.leads.unshift({
    id: `lead_${Math.random().toString(36).slice(2, 10)}`,
    type: params.type,
    name: params.name,
    contact: params.contact,
    email: params.email,
    phone: params.phone,
    organization: params.organization,
    subject: params.subject,
    details: params.details,
    trackingCode: params.trackingCode,
    meta: params.meta,
    status: "new",
    adminNote: "",
    createdAt: new Date().toISOString(),
  });
  saveEmulatedDb(db);
  return { ok: true };
}

// ==================== PUBLIC SITE CONFIG ====================

export async function fetchPublicSiteConfig(): Promise<SiteSettings> {
  const phpRes = await tryCallPhp<{ ok: boolean; config?: SiteSettings }>("/api/public-config.php", {
    method: "GET",
  });

  if (phpRes && phpRes.data.ok && phpRes.data.config) {
    return phpRes.data.config;
  }

  const db = loadEmulatedDb();
  return db.settings || getDefaultSettings();
}

// ==================== ADMIN PANEL API ====================

export async function fetchAdminDashboard(): Promise<{
  ok: boolean;
  data?: AdminDashboardData;
  error?: string;
}> {
  const phpRes = await tryCallPhp<{ ok: boolean; error?: string } & AdminDashboardData>(
    "/api/admin.php?action=dashboard",
    { method: "GET" }
  );

  if (phpRes) {
    if (!phpRes.data.ok) return { ok: false, error: phpRes.data.error };
    return {
      ok: true,
      data: {
        users: phpRes.data.users,
        leads: phpRes.data.leads,
        settings: phpRes.data.settings,
        serverInfo: phpRes.data.serverInfo,
      },
    };
  }

  const db = loadEmulatedDb();
  const cached = getCachedUser();
  if (!cached || cached.role !== "admin") {
    return { ok: false, error: "دسترسی غیرمجاز: فقط مدیر ارشد به این بخش دسترسی دارد." };
  }

  return {
    ok: true,
    data: {
      users: db.users.map(sanitizeEmulatedUser),
      leads: db.leads,
      settings: db.settings,
      serverInfo: {
        phpVersion: "PHP 8.2 (cPanel Ready)",
        storageEngine: "SQLite3 / JSON Hybrid Store",
        hasGeminiKey: Boolean(db.settings.geminiApiKey),
        podcastFilesStatus: {},
        serverTime: new Date().toISOString(),
        isPreviewFallback: true,
      },
    },
  };
}

export async function adminCreateUser(params: {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
}): Promise<{ ok: boolean; user?: RohamUser; message?: string; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; user?: RohamUser; message?: string; error?: string }>(
    "/api/admin.php?action=create_user",
    {
      method: "POST",
      body: JSON.stringify({ action: "create_user", ...params }),
    }
  );
  if (phpRes) return phpRes.data;

  const db = loadEmulatedDb();
  const cleanEmail = params.email.trim().toLowerCase();
  if (!params.name.trim() || !cleanEmail || params.password.length < 6) {
    return { ok: false, error: "نام، ایمیل و رمز عبور (حداقل ۶ کاراکتر) الزامی است." };
  }
  if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: "کاربری با این ایمیل از قبل وجود دارد." };
  }

  const now = new Date().toISOString();
  const newUser: EmulatedUserRecord = {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    username: cleanEmail.split("@")[0],
    email: cleanEmail,
    name: params.name.trim(),
    passwordPlain: params.password,
    role: params.role,
    status: "active",
    createdAt: now,
    lastLoginAt: now,
    syncData: {
      preferences: null,
      highlights: [],
      savedWords: [],
      readingProgress: [],
      updatedAt: now,
    },
  };
  db.users.push(newUser);
  saveEmulatedDb(db);
  return {
    ok: true,
    user: sanitizeEmulatedUser(newUser),
    message: "کاربر جدید با موفقیت ایجاد شد.",
  };
}

export async function adminUpdateUser(params: {
  userId: string;
  role?: "user" | "admin";
  status?: "active" | "suspended";
  name?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; user?: RohamUser; message?: string; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; user?: RohamUser; message?: string; error?: string }>(
    "/api/admin.php?action=update_user",
    {
      method: "POST",
      body: JSON.stringify({ action: "update_user", ...params }),
    }
  );
  if (phpRes) return phpRes.data;

  const db = loadEmulatedDb();
  const cached = getCachedUser();
  const idx = db.users.findIndex((u) => u.id === params.userId);
  if (idx === -1) return { ok: false, error: "کاربر یافت نشد." };

  if (cached && cached.id === params.userId) {
    if (params.role && params.role !== "admin") {
      return { ok: false, error: "نمی‌توانید نقش مدیریت حساب فعلی خودتان را لغو کنید." };
    }
    if (params.status === "suspended") {
      return { ok: false, error: "نمی‌توانید حساب خودتان را مسدود کنید." };
    }
  }

  if (params.role) db.users[idx].role = params.role;
  if (params.status) db.users[idx].status = params.status;
  if (params.name && params.name.trim()) db.users[idx].name = params.name.trim();
  if (params.newPassword && params.newPassword.length >= 6) {
    db.users[idx].passwordPlain = params.newPassword;
  }

  saveEmulatedDb(db);
  return {
    ok: true,
    user: sanitizeEmulatedUser(db.users[idx]),
    message: "مشخصات کاربر بروزرسانی شد.",
  };
}

export async function adminDeleteUser(
  userId: string
): Promise<{ ok: boolean; message?: string; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; message?: string; error?: string }>(
    "/api/admin.php?action=delete_user",
    {
      method: "POST",
      body: JSON.stringify({ action: "delete_user", userId }),
    }
  );
  if (phpRes) return phpRes.data;

  const db = loadEmulatedDb();
  const cached = getCachedUser();
  if (cached && cached.id === userId) {
    return { ok: false, error: "حذف حساب کاربری فعلی خودتان مجاز نیست." };
  }
  db.users = db.users.filter((u) => u.id !== userId);
  saveEmulatedDb(db);
  return { ok: true, message: "کاربر با موفقیت حذف شد." };
}

export async function adminUpdateLead(params: {
  leadId: string;
  status?: PortalLead["status"];
  adminNote?: string;
}): Promise<{ ok: boolean; lead?: PortalLead; error?: string }> {
  const phpRes = await tryCallPhp<{ ok: boolean; lead?: PortalLead; error?: string }>(
    "/api/admin.php?action=update_lead",
    {
      method: "POST",
      body: JSON.stringify({ action: "update_lead", ...params }),
    }
  );
  if (phpRes) return phpRes.data;

  const db = loadEmulatedDb();
  const idx = db.leads.findIndex((l) => l.id === params.leadId);
  if (idx === -1) return { ok: false, error: "درخواست یافت نشد." };
  if (params.status) db.leads[idx].status = params.status;
  if (typeof params.adminNote === "string") db.leads[idx].adminNote = params.adminNote;
  saveEmulatedDb(db);
  return { ok: true, lead: db.leads[idx] };
}

export async function adminDeleteLead(leadId: string): Promise<{ ok: boolean }> {
  const phpRes = await tryCallPhp<{ ok: boolean }>("/api/admin.php?action=delete_lead", {
    method: "POST",
    body: JSON.stringify({ action: "delete_lead", leadId }),
  });
  if (phpRes) return phpRes.data;

  const db = loadEmulatedDb();
  db.leads = db.leads.filter((l) => l.id !== leadId);
  saveEmulatedDb(db);
  return { ok: true };
}

export async function adminUpdateSettings(
  settings: Partial<SiteSettings>
): Promise<{ ok: boolean; settings?: SiteSettings; message?: string; error?: string }> {
  const phpRes = await tryCallPhp<{
    ok: boolean;
    settings?: SiteSettings;
    message?: string;
    error?: string;
  }>("/api/admin.php?action=update_settings", {
    method: "POST",
    body: JSON.stringify({ action: "update_settings", settings }),
  });
  if (phpRes) return phpRes.data;

  const db = loadEmulatedDb();
  db.settings = {
    ...db.settings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  saveEmulatedDb(db);
  return {
    ok: true,
    settings: db.settings,
    message: "تنظیمات سایت با موفقیت ذخیره شد.",
  };
}
