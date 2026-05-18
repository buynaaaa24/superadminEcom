"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "../lib/AdminContext";

const NAV_SUPERADMIN = [
  {
    group: "Ерөнхий",
    items: [
      {
        href: "/dashboard",
        label: "Хянах самбар",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Менежмент",
    items: [
      {
        href: "/tenants",
        label: "Төслүүд",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      },
      {
        href: "/admins",
        label: "Админ хэрэглэгчид",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
    ],
  },
  {
    group: "Тохиргоо",
    items: [
      {
        href: "/site-settings",
        label: "Сайтын тохиргоо",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const path = usePathname();
  const { currentUser } = useAdmin();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] bg-[#0f172a] flex flex-col z-50 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Close (mobile) */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 md:hidden transition-colors"
          aria-label="Хаах"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-8 bg-gradient-to-b from-[#EF5350] to-[#B71C1C] rounded-full" />
            <div>
           
              <p className="text-[#D32F2F] text-xs font-semibold mt-0.5 tracking-wide uppercase">
                Super Admin
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 overflow-y-auto space-y-5">
          {NAV_SUPERADMIN.map((group) => (
            <div key={group.group}>
              <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest mb-1.5 px-3">
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ href, label, icon }) => {
                  const active =
                    href === "/dashboard" ? path === "/dashboard" : path.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-[#D32F2F] text-white shadow-lg shadow-red-900/40"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      {icon}
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D32F2F]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#D32F2F] font-bold text-sm">
                {currentUser?.name?.[0]?.toUpperCase() ?? "S"}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-sm font-medium truncate">
                {currentUser?.name ?? "Super Admin"}
              </p>
              <p className="text-slate-500 text-xs truncate">
                {currentUser?.email ?? ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
