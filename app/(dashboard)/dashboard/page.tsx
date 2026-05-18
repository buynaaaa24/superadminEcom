"use client";

import Link from "next/link";
import { useAdmin } from "../../lib/AdminContext";

export default function DashboardPage() {
  const { tenants, adminUsers, activeTenantId } = useAdmin();

  const activeTenants = tenants.filter((t) => t.status === "active").length;
  const totalAdmins = adminUsers.filter((u) => u.role === "admin").length;
  const activeAdmins = adminUsers.filter(
    (u) => u.role === "admin" && u.status === "active"
  ).length;

  const filteredTenants =
    activeTenantId ? tenants.filter((t) => t.id === activeTenantId) : tenants;

  const stats = [
    {
      label: "Нийт төсөл",
      value: tenants.length,
      sub: `${activeTenants} идэвхтэй`,
      color: "text-[#D32F2F]",
      bg: "bg-red-50",
      border: "border-red-100",
      icon: (
        <svg className="w-6 h-6 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      href: "/tenants",
    },
    {
      label: "Нийт Админ",
      value: totalAdmins,
      sub: `${activeAdmins} идэвхтэй`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      href: "/admins",
    },
    {
      label: "Идэвхтэй Сайт",
      value: activeTenants,
      sub: `${tenants.length - activeTenants} идэвхгүй`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      icon: (
        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: "/tenants",
    },
    {
      label: "Тохиргоо",
      value: tenants.length,
      sub: "Сайтын тохиргоо",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: "/site-settings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`bg-white rounded-2xl p-5 shadow-sm border ${s.border} hover:shadow-md transition-all group`}
          >
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${s.bg} mb-4 group-hover:scale-110 transition-transform`}>
              {s.icon}
            </div>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-700 text-sm font-medium mt-0.5">{s.label}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      {/* Projects table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {activeTenantId ? "Сонгосон төсөл" : "Бүх төслүүд"}
          </h2>
          <Link href="/tenants" className="text-[#D32F2F] text-sm font-medium hover:underline">
            Бүгдийг харах →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-3">Нэр</th>
                <th className="px-6 py-3">Өнгө</th>
                <th className="px-6 py-3">Загвар</th>
                <th className="px-6 py-3">Админ</th>
                <th className="px-6 py-3">Статус</th>
                <th className="px-6 py-3">Огноо</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((t) => {
                const tenantAdmins = adminUsers.filter((u) => u.tenantId === t.id);
                return (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-sm font-semibold text-slate-800">{t.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md shadow-sm border border-black/10" style={{ backgroundColor: t.primaryColor }} />
                        <span className="text-xs text-slate-500 font-mono">{t.primaryColor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500 capitalize">{t.layout}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{tenantAdmins.length} админ</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${t.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                        {t.status === "active" ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-400">{t.createdAt}</td>
                  </tr>
                );
              })}
              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                    Төсөл олдсонгүй
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/tenants", label: "Шинэ төсөл нэмэх", desc: "Клиент сайт үүсгэх", color: "#D32F2F",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
          { href: "/admins", label: "Админ нэмэх", desc: "Шинэ админ хэрэглэгч үүсгэх", color: "#2563eb",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> },
          { href: "/site-settings", label: "Сайт тохируулах", desc: "Өнгө, нэр, тохиргоо засах", color: "#7c3aed",
            icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white group-hover:scale-110 transition-transform" style={{ backgroundColor: a.color }}>
              {a.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{a.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
