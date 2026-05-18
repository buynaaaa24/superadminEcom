"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AdminUser, Tenant } from "./types";

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_TENANTS: Tenant[] = [
  {
    id: "t1",
    name: "ikhNaydEcomm Demo",
    slug: "ikhnaydecomm-demo",
    primaryColor: "#D32F2F",
    logo: "",
    font: "Inter",
    layout: "modern",
    features: { reviews: false, chat: false, loyaltyProgram: false },
    createdAt: "2026-05-01",
    status: "active",
  },
];

const SEED_ADMINS: AdminUser[] = [
  {
    id: "sa1",
    name: "Super Admin",
    email: "superadmin@ikhnayd.mn",
    password: "admin1234",
    role: "superadmin",
    tenantId: null,
    createdAt: "2026-05-01",
    lastLogin: null,
    status: "active",
  },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEYS = {
  tenants: "ikna_tenants",
  admins: "ikna_admins",
  session: "ikna_session",
  activeTenant: "ikna_active_tenant",
};

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Context shape ────────────────────────────────────────────────────────────

type AdminCtx = {
  // Auth
  currentUser: AdminUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;

  // Tenants
  tenants: Tenant[];
  activeTenantId: string | null;
  setActiveTenantId: (id: string | null) => void;
  addTenant: (t: Omit<Tenant, "id" | "createdAt">) => void;
  updateTenant: (id: string, patch: Partial<Omit<Tenant, "id">>) => void;
  deleteTenant: (id: string) => void;

  // Admin Users
  adminUsers: AdminUser[];
  addAdminUser: (u: Omit<AdminUser, "id" | "createdAt" | "lastLogin">) => void;
  updateAdminUser: (id: string, patch: Partial<Omit<AdminUser, "id">>) => void;
  deleteAdminUser: (id: string) => void;
};

const AdminContext = createContext<AdminCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activeTenantId, setActiveTenantIdState] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedTenants = load<Tenant[]>(KEYS.tenants, SEED_TENANTS);
    const storedAdmins = load<AdminUser[]>(KEYS.admins, SEED_ADMINS);
    const sessionId = load<string | null>(KEYS.session, null);
    const storedActiveTenant = load<string | null>(KEYS.activeTenant, null);

    // Seed if empty
    if (!localStorage.getItem(KEYS.tenants)) save(KEYS.tenants, SEED_TENANTS);
    if (!localStorage.getItem(KEYS.admins)) save(KEYS.admins, SEED_ADMINS);

    setTenants(storedTenants);
    setAdminUsers(storedAdmins);
    setActiveTenantIdState(storedActiveTenant);

    if (sessionId) {
      const user = storedAdmins.find((u) => u.id === sessionId) ?? null;
      setCurrentUser(user);
    }

    setReady(true);
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────────

  const login = useCallback(
    (email: string, password: string): boolean => {
      const user = adminUsers.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password &&
          u.status === "active"
      );
      if (!user) return false;

      const updated = adminUsers.map((u) =>
        u.id === user.id
          ? { ...u, lastLogin: new Date().toISOString().slice(0, 10) }
          : u
      );
      setAdminUsers(updated);
      save(KEYS.admins, updated);
      save(KEYS.session, user.id);
      setCurrentUser({ ...user, lastLogin: new Date().toISOString().slice(0, 10) });
      return true;
    },
    [adminUsers]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(KEYS.session);
    setCurrentUser(null);
  }, []);

  // ── Active Tenant ──────────────────────────────────────────────────────────

  const setActiveTenantId = useCallback((id: string | null) => {
    setActiveTenantIdState(id);
    save(KEYS.activeTenant, id);
  }, []);

  // ── Tenants CRUD ───────────────────────────────────────────────────────────

  const addTenant = useCallback(
    (t: Omit<Tenant, "id" | "createdAt">) => {
      const next = [
        ...tenants,
        { ...t, id: `t${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) },
      ];
      setTenants(next);
      save(KEYS.tenants, next);
    },
    [tenants]
  );

  const updateTenant = useCallback(
    (id: string, patch: Partial<Omit<Tenant, "id">>) => {
      const next = tenants.map((t) => (t.id === id ? { ...t, ...patch } : t));
      setTenants(next);
      save(KEYS.tenants, next);
    },
    [tenants]
  );

  const deleteTenant = useCallback(
    (id: string) => {
      const next = tenants.filter((t) => t.id !== id);
      setTenants(next);
      save(KEYS.tenants, next);
    },
    [tenants]
  );

  // ── Admin Users CRUD ───────────────────────────────────────────────────────

  const addAdminUser = useCallback(
    (u: Omit<AdminUser, "id" | "createdAt" | "lastLogin">) => {
      const next = [
        ...adminUsers,
        {
          ...u,
          id: `u${Date.now()}`,
          createdAt: new Date().toISOString().slice(0, 10),
          lastLogin: null,
        },
      ];
      setAdminUsers(next);
      save(KEYS.admins, next);
    },
    [adminUsers]
  );

  const updateAdminUser = useCallback(
    (id: string, patch: Partial<Omit<AdminUser, "id">>) => {
      const next = adminUsers.map((u) => (u.id === id ? { ...u, ...patch } : u));
      setAdminUsers(next);
      save(KEYS.admins, next);
    },
    [adminUsers]
  );

  const deleteAdminUser = useCallback(
    (id: string) => {
      const next = adminUsers.filter((u) => u.id !== id);
      setAdminUsers(next);
      save(KEYS.admins, next);
    },
    [adminUsers]
  );

  if (!ready) return null;

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        login,
        logout,
        tenants,
        activeTenantId,
        setActiveTenantId,
        addTenant,
        updateTenant,
        deleteTenant,
        adminUsers,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
