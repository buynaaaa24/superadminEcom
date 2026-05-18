"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdmin } from "../lib/AdminContext";

const TITLES: Record<string, string> = {
  "/dashboard": "Хянах самбар",
  "/tenants": "Төслүүд",
  "/admins": "Админ хэрэглэгчид",
  "/site-settings": "Сайтын тохиргоо",
};

export default function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const { currentUser, logout, tenants, activeTenantId, setActiveTenantId } =
    useAdmin();

  const title = TITLES[path] ?? "";
  const [dropOpen, setDropOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeTenant = tenants.find((t) => t.id === activeTenantId);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="h-[60px] bg-white border-b border-slate-200 flex items-center px-4 md:px-6 sticky top-0 z-40 shadow-sm gap-3">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="mr-1 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors md:hidden"
        aria-label="Цэс нээх"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 bg-[#D32F2F] rounded-full hidden sm:block" />
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      </div>

      <div className="flex-1" />

      {/* ── Project Switcher ── */}
      <div className="relative" ref={dropRef}>
        <button
          id="project-switcher"
          onClick={() => setDropOpen((v) => !v)}
          className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all font-medium max-w-[180px]"
        >
          {/* Color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: activeTenant?.primaryColor ?? "#94a3b8",
            }}
          />
          <span className="truncate">
            {activeTenant ? activeTenant.name : "Төсөл сонгох"}
          </span>
          <svg
            className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
              dropOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-3 py-2 border-b border-slate-100">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                Нийт төслүүд
              </p>
            </div>
            <div className="py-1.5 max-h-64 overflow-y-auto">
              {/* All projects option */}
              <button
                onClick={() => {
                  setActiveTenantId(null);
                  setDropOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  activeTenantId === null
                    ? "bg-slate-50 text-slate-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 flex-shrink-0" />
                Бүх төслүүд
                {activeTenantId === null && (
                  <svg className="w-4 h-4 ml-auto text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {tenants.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveTenantId(t.id);
                    setDropOpen(false);
                  }}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    activeTenantId === t.id
                      ? "bg-slate-50 text-slate-800 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: t.primaryColor }}
                  />
                  <span className="truncate flex-1">{t.name}</span>
                  {t.status === "inactive" && (
                    <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                      Идэвхгүй
                    </span>
                  )}
                  {activeTenantId === t.id && (
                    <svg className="w-4 h-4 ml-auto text-[#D32F2F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="border-t border-slate-100 p-2">
              <a
                href="/tenants"
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#D32F2F] hover:bg-red-50 rounded-lg transition-colors font-medium"
                onClick={() => setDropOpen(false)}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Шинэ төсөл нэмэх
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── User menu ── */}
      <div className="relative" ref={userRef}>
        <button
          id="user-menu-btn"
          onClick={() => setUserMenuOpen((v) => !v)}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#D32F2F]/10 flex items-center justify-center">
            <span className="text-[#D32F2F] font-bold text-sm">
              {currentUser?.name?.[0]?.toUpperCase() ?? "S"}
            </span>
          </div>
          <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{currentUser?.email}</p>
              <span className="inline-block mt-1 text-[10px] bg-red-50 text-[#D32F2F] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                {currentUser?.role === "superadmin" ? "Супер Админ" : "Админ"}
              </span>
            </div>
            <div className="p-1.5">
              <button
                onClick={handleLogout}
                id="logout-btn"
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Гарах
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
