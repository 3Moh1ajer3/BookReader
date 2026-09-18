import { Highlight, SavedWord } from "@/types/reader";

export const LIBRARY_EXPORT_TYPE = "reader-library";
export const LIBRARY_EXPORT_VERSION = 1;

export interface LibraryExportPayload {
  app: string;
  type: typeof LIBRARY_EXPORT_TYPE;
  version: number;
  exportedAt: string;
  highlights: Highlight[];
  savedWords: SavedWord[];
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isHighlight(v: unknown): v is Highlight {
  return (
    isRecord(v) &&
    typeof v.id === "string" &&
    typeof v.bookId === "string" &&
    typeof v.chapterId === "string" &&
    typeof v.text === "string" &&
    typeof v.createdAt === "string" &&
    typeof v.color === "string" &&
    ["yellow", "green", "blue", "pink", "purple"].includes(v.color as string)
  );
}

function isSavedWord(v: unknown): v is SavedWord {
  return (
    isRecord(v) &&
    typeof v.id === "string" &&
    typeof v.word === "string" &&
    typeof v.savedAt === "string"
  );
}

/** Build the portable JSON payload for a library export. */
export function buildExportPayload(highlights: Highlight[], savedWords: SavedWord[]): LibraryExportPayload {
  return {
    app: "interactive-smart-book-reader",
    type: LIBRARY_EXPORT_TYPE,
    version: LIBRARY_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    highlights,
    savedWords,
  };
}

/** Trigger a browser download of a JSON file. */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ParsedLibraryData {
  highlights: Highlight[];
  savedWords: SavedWord[];
  version: number;
}

/** Parse + hard-validate an imported library file. Throws on invalid input. */
export function parseImportPayload(text: string): ParsedLibraryData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("فایل انتخاب‌شده JSON معتبر نیست.");
  }
  if (!isRecord(raw) || raw.type !== LIBRARY_EXPORT_TYPE) {
    throw new Error("این فایل، فایل پشتیبان این کتابخوان نیست.");
  }

  const highlights = Array.isArray(raw.highlights) ? raw.highlights.filter(isHighlight) : [];
  const savedWords = Array.isArray(raw.savedWords) ? raw.savedWords.filter(isSavedWord) : [];
  const version = typeof raw.version === "number" ? raw.version : 0;

  return { highlights, savedWords, version };
}

/** Merge imported items with existing ones, keeping items whose id already exists. */
export function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const existingIds = new Set(existing.map((item) => item.id));
  const fresh = incoming.filter((item) => !existingIds.has(item.id));
  return [...fresh, ...existing];
}