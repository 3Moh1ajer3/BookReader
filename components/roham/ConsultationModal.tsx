"use client";

import React, { useState } from "react";
import { Building2, X, CheckCircle2, ArrowLeft, Shield } from "lucide-react";
import { submitPortalLead } from "@/lib/authSync";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [organization, setOrganization] = useState("");
  const [service, setService] = useState("hardening");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    const id = `ROHAM-ADVISORY-${Math.floor(10000 + Math.random() * 90000)}`;
    setTicketId(id);
    setSubmitted(true);

    try {
      const requests = JSON.parse(localStorage.getItem("roham_consultation_requests") || "[]");
      requests.push({
        name,
        contact,
        organization,
        service,
        details,
        ticketId: id,
        date: new Date().toISOString(),
      });
      localStorage.setItem("roham_consultation_requests", JSON.stringify(requests));
    } catch {}

    submitPortalLead({
      type: "consultation",
      name,
      contact,
      organization,
      subject: `مشاوره سازمانی (${service})`,
      details,
      trackingCode: id,
    }).catch(() => {});
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setContact("");
    setOrganization("");
    setDetails("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-200 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        style={{ direction: "rtl" }}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">درخواست مشاوره و خدمات سازمانی رهام</h3>
              <p className="text-[11px] text-slate-400">Roham Advisory & Security Services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">درخواست جلسه با موفقیت ثبت شد</h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              تیم مشاوره راهبردی رهام ظرف حداکثر ۲۴ ساعت کاری جهت هماهنگی جلسه محرمانه و بررسی جزئیات با شما تماس خواهد گرفت.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <span className="text-slate-500 block mb-1 font-sans">شماره پیگیری درخواست:</span>
              <span className="text-emerald-400 font-bold text-sm tracking-widest">{ticketId}</span>
            </div>

            <button
              onClick={handleReset}
              className="mt-2 w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              بستن پنجره
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">نام و نام خانوادگی / سمت سازمانی *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً: علی رضایی - مدیر امنیت اطلاعات"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 text-right">
                <label className="text-xs font-medium text-slate-300">شماره تماس یا آیدی تلگرام *</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="0912xxxxxxx یا @username"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 dir-ltr text-left"
                />
              </div>

              <div className="space-y-1 text-right">
                <label className="text-xs font-medium text-slate-300">نام شرکت / سازمان</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="نام شرکت یا کسب‌وکار"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">نوع خدمت مورد نظر</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="hardening">مشاوره و معماری هاردنینگ زیرساخت</option>
                <option value="training">آموزش‌های سازمانی، Zero-Day و تحلیل بدافزار</option>
                <option value="audit">تست نفوذ و سنجش مقاومت در برابر استیلرها</option>
                <option value="personal">مشاوره اختصاصی امنیتی برای اشخاص کلیدی</option>
              </select>
            </div>

            <div className="space-y-1 text-right">
              <label className="text-xs font-medium text-slate-300">توضیحات یا نیازهای ویژه (اختیاری)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="توضیح مختصری درباره چالش‌های امنیتی یا بازه زمانی مد نظر..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ارسال درخواست محرمانه</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="block text-[11px] text-slate-500 text-center mt-2">
                تمامی جلسات و مکاتبات تحت توافق‌نامه عدم افشا (NDA) برگزار می‌گردد.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
