export type ThemeMode = 'light' | 'sepia' | 'dark' | 'oled';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'vazir';
export type ContentWidth = 'compact' | 'normal' | 'wide';

export interface Chapter {
  id: string;
  title: string;
  readingTimeMinutes: number;
  content: string; // Markdown / structured HTML with code blocks
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  language: 'en' | 'fa' | 'mixed';
  coverGradient: string;
  chapters: Chapter[];
  createdAt?: string;
  isCustom?: boolean;
}

export interface Highlight {
  id: string;
  bookId: string;
  chapterId: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  note?: string;
  createdAt: string;
}

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  explanation: string;
  phonetic?: string;
  partOfSpeech?: string;
  contextSentence?: string;
  bookTitle: string;
  savedAt: string;
}

export interface ReaderPreferences {
  fontSize: number; // 14 to 28
  fontFamily: FontFamily;
  lineHeight: number; // 1.4 to 2.2
  contentWidth: ContentWidth;
  theme: ThemeMode;
  tapToTranslate: boolean;
  codeTheme: 'dark' | 'light';
  autoPronounce: boolean;
}

export interface TranslationResult {
  text: string;
  persianTranslation: string;
  phonetic?: string;
  partOfSpeech?: string;
  explanation?: string;
  examples?: Array<{
    english: string;
    persian: string;
  }>;
  synonyms?: string[];
}
