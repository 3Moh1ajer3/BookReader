import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ direction: "rtl" }}>
      <h1 className="text-4xl font-extrabold mb-4 text-slate-800 dark:text-slate-100">۴۰۴ - صفحه یافت نشد</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">صفحه‌ای که به دنبال آن بودید پیدا نشد.</p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow transition-all"
      >
        بازگشت به کتاب‌خوان
      </Link>
    </div>
  );
}
