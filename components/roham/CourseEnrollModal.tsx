"use client";

import React, { useState, useEffect } from "react";
import { Course, ROHAM_COURSES } from "./CoursesSection";
import { X, CheckCircle, GraduationCap, Clock, Award, Shield, ArrowLeft } from "lucide-react";

interface CourseEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourse: Course | null;
}

export const CourseEnrollModal: React.FC<CourseEnrollModalProps> = ({
  isOpen,
  onClose,
  selectedCourse,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [enrollType, setEnrollType] = useState<"individual" | "corporate">("individual");
  const [organization, setOrganization] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");

  if (!isOpen) return null;

  const effectiveCourseId = selectedCourseId || selectedCourse?.id || ROHAM_COURSES[0]?.id || "";
  const currentCourse = ROHAM_COURSES.find((c) => c.id === effectiveCourseId) || selectedCourse || ROHAM_COURSES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const generatedCode = `RH-ENR-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingCode(generatedCode);

    try {
      const records = JSON.parse(localStorage.getItem("roham_course_enrollments") || "[]");
      records.push({
        courseId: effectiveCourseId,
        courseTitle: currentCourse?.title,
        fullName,
        email,
        phone,
        enrollType,
        organization,
        notes,
        trackingCode: generatedCode,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem("roham_course_enrollments", JSON.stringify(records));
    } catch {}

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName("");
    setEmail("");
    setPhone("");
    setOrganization("");
    setNotes("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      style={{ direction: "rtl" }}
    >
      <div
        className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                ثبت‌نام و مشاوره دوره‌های آموزشی
              </h3>
              <p className="text-xs text-slate-400">آکادمی امنیت دفاعی رهام (Roham Academy)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">درخواست شما با موفقیت ثبت شد</h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
              اطلاعات دوره «{currentCourse?.title}» و برنامه زمان‌بندی آزمایشگاه ابری برای ایمیل{" "}
              <strong className="text-slate-200 font-mono">{email}</strong> ارسال خواهد شد.
            </p>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-right space-y-1 font-mono">
              <div>کد رهگیری ثبت‌نام: {trackingCode}</div>
              <div>وضعیت: در انتظار تایید و ارسال سرفصل تفصیلی</div>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              متوجه شدم و بستن پنجره
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Course Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">دوره انتخابی</label>
              <select
                value={effectiveCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {ROHAM_COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title} ({c.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Course mini preview */}
            {currentCourse && (
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    مدت: {currentCourse.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    سطح: {currentCourse.level}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {currentCourse.description}
                </div>
              </div>
            )}

            {/* Registration Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">نوع ثبت‌نام</label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setEnrollType("individual")}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    enrollType === "individual"
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  فردی / کارشناس مستقل
                </button>
                <button
                  type="button"
                  onClick={() => setEnrollType("corporate")}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    enrollType === "corporate"
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  سازمانی / تیمی
                </button>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: آرش کیانی"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">ایمیل کاری یا شخصی *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-left font-mono"
                  style={{ direction: "ltr" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">شماره تماس (اختیاری)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-left font-mono"
                  style={{ direction: "ltr" }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">
                  {enrollType === "corporate" ? "نام شرکت یا سازمان *" : "سمت شغلی یا زمینه فعالیت"}
                </label>
                <input
                  type="text"
                  required={enrollType === "corporate"}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={enrollType === "corporate" ? "نام شرکت / سازمان" : "تحلیل‌گر امنیت / برنامه‌نویس"}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400">
                اهداف آموزشی، سوالات یا نیازهای ویژه
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات کوتاه درباره تجربیات قبلی یا نیازهای خاص تیم شما..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950"
              >
                <span>ارسال درخواست ثبت‌نام و دریافت سرفصل کامل</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>اطلاعات شما با اصل Zero-Telemetry و کاملاً محرمانه نگهداری می‌شود.</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
