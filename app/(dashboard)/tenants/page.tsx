"use client";

import { useState } from "react";
import { useAdmin } from "../../lib/AdminContext";
import type { Tenant } from "../../lib/types";

const FONTS = ["Inter", "Roboto", "Outfit", "Poppins", "Nunito"];
const LAYOUTS = ["modern", "minimal", "bold"] as const;
const PALETTE = [
  "#D32F2F", "#B71C1C", "#E53935",
  "#1565C0", "#0D47A1", "#1976D2",
  "#2E7D32", "#1B5E20", "#388E3C",
  "#6A1B9A", "#4A148C", "#7B1FA2",
  "#E65100", "#BF360C", "#F57C00",
  "#00695C", "#004D40", "#00796B",
];

type TenantForm = Omit<Tenant, "id" | "createdAt">;
type Section = "identity" | "theme" | "store" | "features";

const EMPTY_FORM: TenantForm = {
  name: "", slug: "", domain: "", databaseUri: "",
  primaryColor: "#D32F2F", secondaryColor: "#0f172a", accentColor: "#FFC107",
  logo: "", font: "Inter", layout: "modern",
  description: "", bannerTitle: "", bannerSubtitle: "",
  contactEmail: "", contactPhone: "", address: "",
  features: { reviews: false, chat: false, loyaltyProgram: false },
  status: "active",
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function TenantsPage() {
  const { tenants, addTenant, updateTenant, deleteTenant, adminUsers, loading } = useAdmin();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TenantForm>(EMPTY_FORM);
  const [section, setSection] = useState<Section>("identity");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(EMPTY_FORM); setEditId(null); setSection("identity"); setErr(null); setModal("add");
  }

  function openEdit(t: Tenant) {
    setForm({
      name: t.name, slug: t.slug, domain: t.domain, databaseUri: t.databaseUri,
      primaryColor: t.primaryColor, secondaryColor: t.secondaryColor, accentColor: t.accentColor,
      logo: t.logo, font: t.font, layout: t.layout,
      description: t.description, bannerTitle: t.bannerTitle, bannerSubtitle: t.bannerSubtitle,
      contactEmail: t.contactEmail, contactPhone: t.contactPhone, address: t.address,
      features: { ...t.features }, status: t.status,
    });
    setEditId(t.id); setSection("identity"); setErr(null); setModal("edit");
  }

  function closeModal() { setModal(null); setEditId(null); setErr(null); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setErr(null);
    try {
      if (modal === "add") await addTenant(form);
      else if (modal === "edit" && editId) await updateTenant(editId, form);
      closeModal();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  }

  function setField<K extends keyof TenantForm>(k: K, v: TenantForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const SECTIONS: { id: Section; label: string }[] = [
    { id: "identity", label: "Мэдээлэл" },
    { id: "theme", label: "Загвар" },
    { id: "store", label: "Дэлгүүр" },
    { id: "features", label: "Функц" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Төслүүд</h2>
          <p className="text-sm text-slate-400 mt-0.5">ikhNayd дэлгүүрийн сайтуудыг удирдах</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Хайх..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 bg-white"
            />
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Нэмэх
          </button>
        </div>
      </div>

      {loading && tenants.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#D32F2F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Уншиж байна...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const tenantAdmins = adminUsers.filter((u) => u.tenantId === t.id);
          const hasDedicatedDb = Boolean(t.databaseUri);
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${t.primaryColor}, ${t.secondaryColor})` }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">/{t.slug}</p>
                    {t.domain && (
                      <p className="text-xs text-blue-500 font-mono mt-0.5 truncate flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        {t.domain}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${t.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                    {t.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>
                {t.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{t.description}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-sm border border-black/10" style={{ backgroundColor: t.primaryColor }} />
                    <span className="w-3.5 h-3.5 rounded-sm border border-black/10" style={{ backgroundColor: t.secondaryColor }} />
                    <span className="w-3.5 h-3.5 rounded-sm border border-black/10" style={{ backgroundColor: t.accentColor }} />
                    <span className="font-mono ml-1">{t.primaryColor}</span>
                  </div>
                  <span>{t.font}</span>
                  <span className="capitalize">{t.layout}</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {tenantAdmins.length} админ
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg mb-4 w-fit ${hasDedicatedDb ? "bg-violet-50 text-violet-700" : "bg-slate-50 text-slate-500"}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  {hasDedicatedDb ? "Тусгай мэдээллийн сан" : "Хуваалцсан мэдээллийн сан"}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(t)}
                    className="flex-1 text-center text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg transition-colors font-semibold"
                  >Засах</button>
                  <button
                    onClick={async () => { if (confirm(`"${t.name}" төслийг устгах уу?`)) await deleteTenant(t.id); }}
                    className="flex-1 text-center text-xs bg-red-50 hover:bg-red-100 text-[#D32F2F] py-2 rounded-lg transition-colors font-semibold"
                  >Устгах</button>
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 px-6 py-16 text-center text-slate-400 text-sm shadow-sm">
            Төсөл олдсонгүй
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-fade-in flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-800 text-lg">
                {modal === "add" ? "Шинэ төсөл нэмэх" : "Төсөл засах"}
              </h3>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Section tabs */}
            <div className="flex border-b border-slate-100 px-6 flex-shrink-0 overflow-x-auto">
              {SECTIONS.map((s) => (
                <button key={s.id} type="button" onClick={() => setSection(s.id)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    section === s.id ? "border-[#D32F2F] text-[#D32F2F]" : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Identity tab */}
                {section === "identity" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Сайтын нэр *</label>
                        <input required type="text" value={form.name}
                          onChange={(e) => { setField("name", e.target.value); setField("slug", slugify(e.target.value)); }}
                          placeholder="Их наяд плаза"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Slug</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">/</span>
                          <input type="text" value={form.slug} onChange={(e) => setField("slug", slugify(e.target.value))}
                            className="w-full border border-slate-200 rounded-xl pl-6 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Домэйн
                        <span className="ml-1 text-xs font-normal text-slate-400">(жишээ: boldstore.mn)</span>
                      </label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <input type="text" value={form.domain}
                          onChange={(e) => setField("domain", e.target.value.toLowerCase().trim())}
                          placeholder="boldstore.mn"
                          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Мэдээллийн сангийн URI
                        <span className="ml-1 text-xs font-normal text-slate-400">(хоосон = хуваалцсан)</span>
                      </label>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                        <input type="text" value={form.databaseUri}
                          onChange={(e) => setField("databaseUri", e.target.value.trim())}
                          placeholder="mongodb://127.0.0.1:27017/tenant_bold"
                          className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                      {form.databaseUri && (
                        <p className="mt-1.5 text-xs text-violet-600 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Тусгай мэдээллийн сан ашиглана
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Статус</label>
                      <div className="flex gap-2">
                        {(["active", "inactive"] as const).map((s) => (
                          <button key={s} type="button" onClick={() => setField("status", s)}
                            className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                              form.status === s
                                ? s === "active" ? "border-emerald-500 text-emerald-700 bg-emerald-50" : "border-slate-400 text-slate-600 bg-slate-100"
                                : "border-slate-200 text-slate-400 hover:border-slate-300"
                            }`}
                          >
                            {s === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Theme tab */}
                {section === "theme" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Үндсэн өнгө</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {PALETTE.map((c) => (
                          <button key={c} type="button" onClick={() => setField("primaryColor", c)}
                            className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${form.primaryColor === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                            style={{ backgroundColor: c }} title={c}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="color" value={form.primaryColor} onChange={(e) => setField("primaryColor", e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <input type="text" value={form.primaryColor} onChange={(e) => setField("primaryColor", e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono w-28 focus:outline-none" placeholder="#D32F2F"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Хоёрдогч өнгө</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={form.secondaryColor} onChange={(e) => setField("secondaryColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                          />
                          <input type="text" value={form.secondaryColor} onChange={(e) => setField("secondaryColor", e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono w-28 focus:outline-none" placeholder="#0f172a"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Акцент өнгө</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={form.accentColor} onChange={(e) => setField("accentColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                          />
                          <input type="text" value={form.accentColor} onChange={(e) => setField("accentColor", e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-mono w-28 focus:outline-none" placeholder="#FFC107"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Live preview */}
                    <div className="rounded-xl overflow-hidden border border-slate-200 text-xs">
                      <div className="h-10 flex items-center px-4 gap-2" style={{ backgroundColor: form.secondaryColor }}>
                        <div className="w-2 h-7 rounded-full flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${form.primaryColor}, ${form.accentColor})` }} />
                        <span className="text-white font-bold truncate">{form.name || "Дэлгүүрийн нэр"}</span>
                      </div>
                      <div className="h-7 flex items-center px-4 gap-4" style={{ backgroundColor: form.primaryColor }}>
                        {["Нүүр", "Бараа", "Холбоо"].map((l) => (
                          <span key={l} className="text-white/80">{l}</span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logo URL</label>
                      <input type="text" value={form.logo} onChange={(e) => setField("logo", e.target.value)}
                        placeholder="https://..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Фонт</label>
                        <select value={form.font} onChange={(e) => setField("font", e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 bg-white"
                        >
                          {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Загвар</label>
                        <div className="flex gap-1.5">
                          {LAYOUTS.map((l) => (
                            <button key={l} type="button" onClick={() => setField("layout", l)}
                              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border-2 transition-all ${
                                form.layout === l ? "border-[#D32F2F] text-[#D32F2F] bg-red-50" : "border-slate-200 text-slate-500 hover:border-slate-300"
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Store tab */}
                {section === "store" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Тайлбар</label>
                      <textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)}
                        placeholder="Дэлгүүрийн товч танилцуулга..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Баннер гарчиг</label>
                        <input type="text" value={form.bannerTitle} onChange={(e) => setField("bannerTitle", e.target.value)}
                          placeholder="Хамгийн шилдэг бараанууд"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Баннер дэд гарчиг</label>
                        <input type="text" value={form.bannerSubtitle} onChange={(e) => setField("bannerSubtitle", e.target.value)}
                          placeholder="Хямдрал, шинэ бараа, хүргэлт"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">И-мэйл</label>
                        <input type="email" value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)}
                          placeholder="info@store.mn"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Утасны дугаар</label>
                        <input type="text" value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)}
                          placeholder="7700-0000"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Хаяг</label>
                      <input type="text" value={form.address} onChange={(e) => setField("address", e.target.value)}
                        placeholder="Улаанбаатар хот, ..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                      />
                    </div>
                  </>
                )}

                {/* Features tab */}
                {section === "features" && (
                  <div className="space-y-3">
                    {([
                      ["reviews", "Үнэлгээ", "Хэрэглэгч бүтээгдэхүүн дээр үнэлгээ үлдээх боломж"],
                      ["chat", "Чат", "Онлайн чат дэмжлэг"],
                      ["loyaltyProgram", "Урамшуулал", "Оноо хуримтлуулах програм"],
                    ] as const).map(([key, label, desc]) => (
                      <label key={key} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 cursor-pointer transition-colors">
                        <div className="relative flex-shrink-0 mt-0.5">
                          <input type="checkbox" className="sr-only peer"
                            checked={form.features[key]}
                            onChange={(e) => setField("features", { ...form.features, [key]: e.target.checked })}
                          />
                          <div className="w-10 h-5 bg-slate-200 peer-checked:bg-[#D32F2F] rounded-full transition-colors" />
                          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {err && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {err}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-slate-100 flex-shrink-0">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >Болих</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] disabled:opacity-60 text-white text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
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
