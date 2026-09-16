import { Book } from "@/types/reader";
import { FRONT_MATTER_CHAPTER } from "./book/frontMatter";
import { CHAPTER_0 } from "./book/chapter0";
import { CHAPTER_1 } from "./book/chapter1";
import { CHAPTER_2 } from "./book/chapter2";
import { CHAPTER_3 } from "./book/chapter3";
import { CHAPTER_4 } from "./book/chapter4";
import { CHAPTER_5 } from "./book/chapter5";
import { CHAPTER_6 } from "./book/chapter6";
import { CHAPTER_7 } from "./book/chapter7";
import { CHAPTER_8 } from "./book/chapter8";
import { CHAPTER_9 } from "./book/chapter9";
import { CHAPTER_10 } from "./book/chapter10";
import { RESOURCES_CHAPTER } from "./book/resources";

export const FROM_DAY_ZERO_BOOK: Book = {
  id: "from-day-zero-to-zero-day",
  title: "From Day Zero to Zero Day: A Hands-On Guide to Vulnerability Research",
  author: "Eugene Lim (\"Spaceraccoon\")",
  description: "متن کامل و بدون حذفیات کتاب مرجع کشف آسیب‌پذیری‌های روز صفر، تحلیل جریان داده (Taint Analysis)، مهندسی معکوس با Ghidra، شبیه‌سازی با Qiling، تحلیل نمادین با angr، و فازینگ پیشرفته با boofuzz و AFL++ بر اساس نسخه رسمی انتشارات No Starch Press (2025).",
  language: "en",
  coverGradient: "from-slate-900 via-indigo-950 to-blue-900",
  chapters: [
    FRONT_MATTER_CHAPTER,
    CHAPTER_0,
    CHAPTER_1,
    CHAPTER_2,
    CHAPTER_3,
    CHAPTER_4,
    CHAPTER_5,
    CHAPTER_6,
    CHAPTER_7,
    CHAPTER_8,
    CHAPTER_9,
    CHAPTER_10,
    RESOURCES_CHAPTER,
  ],
};
