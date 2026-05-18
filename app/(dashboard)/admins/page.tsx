"use client";

import { useState } from "react";
import { useAdmin } from "../../lib/AdminContext";
import type { AdminUser } from "../../lib/types";

type UserForm = Omit<AdminUser, "id" | "createdAt" | "lastLogin"> & { password: string };

const EMPTY_FORM: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "admin",
  tenantId: null,
  status: "active",
};

export default function AdminsPage() {
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser, tenants, currentUser } =
    useAdmin();
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [showPw, setShowPw] = useState(false);

  const filtered = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowPw(false);
    setModal("add");
  }

  function openEdit(u: AdminUser) {
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      tenantId: u.tenantId,
      status: u.status,
    });
    setEditId(u.id);
    setShowPw(false);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    if (modal === "add" && !form.password.trim()) return;
    if (modal === "add") {
      await addAdminUser(form);
    } else if (modal === "edit" && editId) {
      const patch: Record<string, unknown> = {
        displayName: form.name, email: form.email,
        role: form.role, tenantId: form.tenantId, status: form.status,
      };
      if (form.password.trim()) patch.password = form.password;
      await updateAdminUser(editId, patch);
    }
    closeModal();
  }

  function setField<K extends keyof UserForm>(k: K, v: UserForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const tenantOf = (id: string | null) =>
    id ? (tenants.find((t) => t.id === id)?.name ?? id) : "Бүх төслүүд";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Админ хэрэглэгчид</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Контент оруулах эрхтэй хэрэглэгчдийг удирдах
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
            id="add-admin-btn"
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Нэмэх
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3">Хэрэглэгч</th>
                <th className="px-6 py-3">Эрх</th>
                <th className="px-6 py-3">Төсөл</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3">Нэвтэрсэн</th>
                <th className="px-6 py-3">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 font-bold text-sm">
                          {u.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === "superadmin"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {u.role === "superadmin" ? "Супер Админ" : "Админ"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {tenantOf(u.tenantId)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        u.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {u.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-400">
                    {u.lastLogin ?? "—"}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors font-semibold"
                      >
                        Засах
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => {
                            if (confirm(`"${u.name}" устгах уу?`))
                              deleteAdminUser(u.id);
                          }}
                          className="text-xs bg-red-50 hover:bg-red-100 text-[#D32F2F] px-3 py-1.5 rounded-lg transition-colors font-semibold"
                        >
                          Устгах
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Хэрэглэгч олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {modal === "add" ? "Шинэ Админ нэмэх" : "Админ засах"}
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
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нэр *</label>
                <input
                  id="admin-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Бат-Эрдэнэ"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">И-мэйл *</label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="admin@shop.mn"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Нууц үг *</label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPw ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPw ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Эрх</label>
                <div className="flex gap-2">
                  {(["admin", "superadmin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setField("role", r)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form.role === r
                          ? r === "superadmin"
                            ? "border-purple-500 text-purple-700 bg-purple-50"
                            : "border-blue-500 text-blue-700 bg-blue-50"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {r === "superadmin" ? "Супер Админ" : "Админ"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tenant */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Төсөл оноох
                </label>
                <select
                  value={form.tenantId ?? ""}
                  onChange={(e) =>
                    setField("tenantId", e.target.value === "" ? null : e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/30 bg-white"
                >
                  <option value="">Бүх төслүүд (Супер Админ)</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Статус</label>
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
                  id="save-admin-btn"
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
