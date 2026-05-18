"use client";

import { useState } from "react";
import { useAdmin } from "../../lib/AdminContext";
import type { Tenant } from "../../lib/types";

const FONTS = ["Inter", "Roboto", "Outfit", "Poppins", "Nunito"];
const LAYOUTS = ["modern", "minimal", "bold"] as const;
const COLORS = [
  "#D32F2F", "#B71C1C", "#E53935",
  "#1565C0", "#0D47A1", "#1976D2",
  "#2E7D32", "#1B5E20", "#388E3C",
  "#6A1B9A", "#4A148C", "#7B1FA2",
  "#E65100", "#BF360C", "#F57C00",
  "#00695C", "#004D40", "#00796B",
];

type TenantForm = Omit<Tenant, "id" | "createdAt">;

const EMPTY_FORM: TenantForm = {
  name: "",
  slug: "",
  primaryColor: "#D32F2F",
  logo: "",
  font: "Inter",
  layout: "modern",
  features: { reviews: false, chat: false, loyaltyProgram: false },
  status: "active",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function TenantsPage() {
  const { tenants, addTenant, updateTenant, deleteTenant, adminUsers } = useAdmin();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TenantForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal("add");
  }

  function openEdit(t: Tenant) {
    setForm({
      name: t.name,
      slug: t.slug,
      primaryColor: t.primaryColor,
      logo: t.logo,
      font: t.font,
      layout: t.layout,
      features: { ...t.features },
      status: t.status,
    });
    setEditId(t.id);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (modal === "add") {
      addTenant(form);
    } else if (modal === "edit" && editId) {
      updateTenant(editId, form);
    }
    closeModal();
  }

  function setField<K extends keyof TenantForm>(k: K, v: TenantForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Төслүүд</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            ikhNaydEcomm клиент сайтуудыг удирдах
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 bg-white"
            />
          </div>
          <button
            id="add-tenant-btn"
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Нэмэх
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const tenantAdmins = adminUsers.filter((u) => u.tenantId === t.id);
          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Color banner */}
              <div
                className="h-2"
                style={{ backgroundColor: t.primaryColor }}
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                      /{t.slug}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                      t.status === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {t.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-sm border border-black/10"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    <span className="font-mono">{t.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {tenantAdmins.length} админ
                  </div>
                  <span className="capitalize">{t.layout}</span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(t)}
                    className="flex-1 text-center text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors font-semibold"
                  >
                    Засах
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${t.name}" төслийг устгах уу?`))
                        deleteTenant(t.id);
                    }}
                    className="flex-1 text-center text-xs bg-red-50 hover:bg-red-100 text-[#D32F2F] py-2 rounded-lg transition-colors font-semibold"
                  >
                    Устгах
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 px-6 py-16 text-center text-slate-400 text-sm shadow-sm">
            Төсөл олдсонгүй
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {modal === "add" ? "Шинэ төсөл нэмэх" : "Төсөл засах"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Сайтын нэр *
                </label>
                <input
                  id="tenant-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    setField("slug", slugify(e.target.value));
                  }}
                  placeholder="ikhNaydEcomm Demo"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Slug
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setField("slug", slugify(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl pl-6 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                  />
                </div>
              </div>

              {/* Primary color */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Үндсэн өнгө
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setField("primaryColor", c)}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                        form.primaryColor === c
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
                    value={form.primaryColor}
                    onChange={(e) => setField("primaryColor", e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) => setField("primaryColor", e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono w-28 focus:outline-none"
                    placeholder="#D32F2F"
                  />
                </div>
              </div>

              {/* Font */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Фонт
                </label>
                <select
                  value={form.font}
                  onChange={(e) => setField("font", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 bg-white"
                >
                  {FONTS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Загвар
                </label>
                <div className="flex gap-2">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setField("layout", l)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize border-2 transition-all ${
                        form.layout === l
                          ? "border-[#D32F2F] text-[#D32F2F] bg-red-50"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Функц
                </label>
                <div className="space-y-2">
                  {(
                    [
                      ["reviews", "Үнэлгээ"],
                      ["chat", "Чат"],
                      ["loyaltyProgram", "Урамшуулал"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={form.features[key]}
                          onChange={(e) =>
                            setField("features", {
                              ...form.features,
                              [key]: e.target.checked,
                            })
                          }
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-checked:bg-[#D32F2F] rounded-full transition-colors" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Статус
                </label>
                <div className="flex gap-2">
                  {(["active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField("status", s)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.status === s
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  id="save-tenant-btn"
                  className="flex-1 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  {modal === "add" ? "Үүсгэх" : "Хадгалах"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
