import { Book } from "@/types/reader";
import { FRONT_MATTER_CHAPTER_FA } from "./book_fa/frontMatter";
import { CHAPTER_0_FA } from "./book_fa/chapter0";
import { CHAPTER_1_FA } from "./book_fa/chapter1";
import { CHAPTER_2_FA } from "./book_fa/chapter2";
import { CHAPTER_3_FA } from "./book_fa/chapter3";
import { CHAPTER_4_FA } from "./book_fa/chapter4";
import { CHAPTER_5_FA } from "./book_fa/chapter5";
import { CHAPTER_6_FA } from "./book_fa/chapter6";
import { CHAPTER_7_FA } from "./book_fa/chapter7";
import { CHAPTER_8_FA } from "./book_fa/chapter8";
import { CHAPTER_9_FA } from "./book_fa/chapter9";
import { CHAPTER_10_FA } from "./book_fa/chapter10";
import { RESOURCES_CHAPTER_FA } from "./book_fa/resources";

export const FROM_DAY_ZERO_BOOK_FA: Book = {
  id: "from-day-zero-to-zero-day-fa",
  title: "از روز صفر تا صفر روز: راهنمای عملی پژوهش آسیب‌پذیری",
  author: "یوجین لیم (Eugene Lim / Spaceraccoon)",
  description: "ترجمه فارسی روان، دقیق و جامع کتاب مرجع کشف آسیب‌پذیری‌های زیرودی (Zero Day)، تحلیل جریان داده (Taint Analysis)، بازبینی کد با CodeQL و Semgrep، مهندسی معکوس با Ghidra، شبیه‌سازی فریمورک با Qiling، تحلیل نمادین با angr، و فازینگ پیشرفته با AFL++ و boofuzz بدون هیچ‌گونه خلاصه‌سازی و با حفظ کلیه اصطلاحات تخصصی استاندارد امنیت.",
  language: "fa",
  coverGradient: "from-emerald-950 via-teal-950 to-slate-900",
  chapters: [
    FRONT_MATTER_CHAPTER_FA,
    CHAPTER_0_FA,
    CHAPTER_1_FA,
    CHAPTER_2_FA,
    CHAPTER_3_FA,
    CHAPTER_4_FA,
    CHAPTER_5_FA,
    CHAPTER_6_FA,
    CHAPTER_7_FA,
    CHAPTER_8_FA,
    CHAPTER_9_FA,
    CHAPTER_10_FA,
    RESOURCES_CHAPTER_FA,
  ],
};
