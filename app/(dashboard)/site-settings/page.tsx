"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "../../lib/AdminContext";
import type { Tenant } from "../../lib/types";

const COLORS = [
  "#D32F2F", "#B71C1C", "#E53935",
  "#1565C0", "#0D47A1", "#1976D2",
  "#2E7D32", "#1B5E20", "#388E3C",
  "#6A1B9A", "#4A148C", "#7B1FA2",
  "#E65100", "#BF360C", "#F57C00",
  "#00695C", "#004D40", "#00796B",
];

const FONTS = ["Inter", "Roboto", "Outfit", "Poppins", "Nunito"];
const LAYOUTS = ["modern", "minimal", "bold"] as const;

export default function SiteSettingsPage() {
  const { tenants, activeTenantId, setActiveTenantId, updateTenant } = useAdmin();

  // Which tenant we're editing in this settings page
  const [selectedId, setSelectedId] = useState<string>(
    activeTenantId ?? tenants[0]?.id ?? ""
  );

  const tenant: Tenant | undefined = tenants.find((t) => t.id === selectedId);

  // Local draft state for editing
  const [draft, setDraft] = useState<Partial<Tenant>>({});
  const [saved, setSaved] = useState(false);

  // Sync draft when tenant selection changes
  useEffect(() => {
    if (tenant) {
      setDraft({
        name: tenant.name,
        slug: tenant.slug,
        primaryColor: tenant.primaryColor,
        logo: tenant.logo,
        font: tenant.font,
        layout: tenant.layout,
        features: { ...tenant.features },
        status: tenant.status,
      });
      setSaved(false);
    }
  }, [selectedId, tenant]);

  // Sync global activeTenantId when user picks here
  useEffect(() => {
    if (selectedId) setActiveTenantId(selectedId);
  }, [selectedId, setActiveTenantId]);

  function setDraftField<K extends keyof Tenant>(k: K, v: Tenant[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    updateTenant(selectedId, draft as Partial<Omit<Tenant, "id">>);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (tenants.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
        <p className="text-lg font-semibold mb-2">Төсөл байхгүй байна</p>
        <p className="text-sm">Эхлээд Төслүүд хуудаснаас шинэ төсөл нэмнэ үү.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header + tenant picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Сайтын тохиргоо</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Сонгосон клиент сайтын нэр, өнгө, загварыг тохируул
          </p>
        </div>

        {/* Project selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-600 whitespace-nowrap">
            Төсөл:
          </label>
          <select
            id="settings-project-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 font-medium"
          >
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {tenant && (
        <form onSubmit={handleSave} className="space-y-4">
          {/* Preview banner */}
          <div
            className="rounded-2xl p-5 text-white flex items-center gap-4 transition-colors duration-300"
            style={{ backgroundColor: draft.primaryColor ?? tenant.primaryColor }}
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {(draft.name ?? tenant.name)?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{draft.name ?? tenant.name}</p>
              <p className="text-white/70 text-sm">/{draft.slug ?? tenant.slug}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-white/60 text-xs">Үндсэн өнгө</p>
              <p className="font-mono font-bold">{draft.primaryColor ?? tenant.primaryColor}</p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Site identity */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Сайтын мэдээлэл
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Сайтын нэр
                  </label>
                  <input
                    id="settings-site-name"
                    type="text"
                    value={draft.name ?? ""}
                    onChange={(e) => setDraftField("name", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={draft.logo ?? ""}
                    onChange={(e) => setDraftField("logo", e.target.value)}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Статус
                </label>
                <div className="flex gap-2">
                  {(["active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraftField("status", s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        (draft.status ?? tenant.status) === s
                          ? s === "active"
                            ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                            : "border-slate-400 text-slate-600 bg-slate-100"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {s === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Дизайн & Загвар
              </h3>

              {/* Color palette */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Үндсэн өнгө
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDraftField("primaryColor", c)}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110 ${
                        (draft.primaryColor ?? tenant.primaryColor) === c
                          ? "border-slate-800 scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="settings-color-picker"
                    value={draft.primaryColor ?? tenant.primaryColor}
                    onChange={(e) => setDraftField("primaryColor", e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={draft.primaryColor ?? tenant.primaryColor}
                    onChange={(e) => setDraftField("primaryColor", e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono w-28 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                  />
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Фонт
                </label>
                <div className="flex flex-wrap gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setDraftField("font", f)}
                      className={`px-4 py-2 rounded-xl text-sm border-2 font-medium transition-all ${
                        (draft.font ?? tenant.font) === f
                          ? "border-[#D32F2F] text-[#D32F2F] bg-red-50"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                      style={{ fontFamily: f }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Хуудасны загвар
                </label>
                <div className="flex gap-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setDraftField("layout", l)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                        (draft.layout ?? tenant.layout) === l
                          ? "border-[#D32F2F] text-[#D32F2F] bg-red-50"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Функцууд
              </h3>
              {(
                [
                  ["reviews", "Үнэлгээ & Сэтгэгдэл", "Хэрэглэгчдэд бараанд үнэлгээ бичих боломж"],
                  ["chat", "Live Chat", "Онлайн чат дэмжлэг"],
                  ["loyaltyProgram", "Урамшуулалын программ", "Оноо цуглуулах систем"],
                ] as const
              ).map(([key, label, desc]) => {
                const checked = (draft.features ?? tenant.features)?.[key] ?? false;
                return (
                  <label key={key} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        id={`feature-${key}`}
                        checked={checked}
                        onChange={(e) =>
                          setDraftField("features", {
                            ...(draft.features ?? tenant.features),
                            [key]: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-checked:bg-[#D32F2F] rounded-full transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
            {saved ? (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Амжилттай хадгалагдлаа!
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Өөрчлөлт хадгалагдаагүй байна
              </p>
            )}
            <button
              type="submit"
              id="save-settings-btn"
              className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Хадгалах
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
