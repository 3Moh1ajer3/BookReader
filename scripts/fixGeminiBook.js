const fs = require("fs");
let t = fs.readFileSync("data/fromDayZeroBookFaGemini.ts", "utf8");
t = t.split('from "./book_fa/').join('from "./book_fa_gemini/');
t = t.split('id: "from-day-zero-to-zero-day-fa"').join('id: "from-day-zero-to-zero-day-fa-gemini"');
t = t.split('title: "از روز صفر تا صفر روز: راهنمای عملی پژوهش آسیب‌پذیری"').join('title: "از روز صفر تا صفر روز — ترجمه استاد Gemini"');
fs.writeFileSync("data/fromDayZeroBookFaGemini.ts", t, "utf8");
console.log("fixed");
console.log(
  t.split("\n")
    .filter((l) => l.includes("book_fa_gemini") || l.includes("id:") || l.includes("title:"))
    .map((l) => l.trim())
    .join("\n")
);
