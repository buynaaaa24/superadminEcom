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

// ─── API config ───────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "ikna_admin_token";
const USER_KEY = "ikna_admin_user";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json();
  if (!res.ok) {
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

// ─── Context shape ────────────────────────────────────────────────────────────

type AdminCtx = {
  // Auth
  currentUser: AdminUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Tenants
  tenants: Tenant[];
  activeTenantId: string | null;
  setActiveTenantId: (id: string | null) => void;
  addTenant: (t: Omit<Tenant, "id" | "createdAt">) => Promise<void>;
  updateTenant: (id: string, patch: Partial<Omit<Tenant, "id">>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  refreshTenants: () => Promise<void>;

  // Admin Users
  adminUsers: AdminUser[];
  addAdminUser: (u: { name: string; email: string; password: string; role: string; tenantId: string | null; status: string }) => Promise<void>;
  updateAdminUser: (id: string, patch: Record<string, unknown>) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  refreshAdminUsers: () => Promise<void>;
};

const AdminContext = createContext<AdminCtx | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activeTenantId, setActiveTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setReady(true);
  }, []);

  // Fetch data once we have a logged-in user
  useEffect(() => {
    if (!ready || !currentUser) return;
    fetchTenants();
    fetchAdminUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, currentUser?.id]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const body = await apiFetch<{
        data: { token: string; user: { id: string; name: string; email: string; role: string; tenantId: string | null } };
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const { token, user } = body.data;
      saveToken(token);

      const adminUser: AdminUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as "superadmin" | "admin",
        tenantId: user.tenantId,
        createdAt: new Date().toISOString().slice(0, 10),
        lastLogin: new Date().toISOString().slice(0, 10),
        status: "active",
      };
      localStorage.setItem(USER_KEY, JSON.stringify(adminUser));
      setCurrentUser(adminUser);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setCurrentUser(null);
    setTenants([]);
    setAdminUsers([]);
  }, []);

  // ── Active Tenant ─────────────────────────────────────────────────────────

  const setActiveTenantId = useCallback((id: string | null) => {
    setActiveTenantIdState(id);
  }, []);

  // ── Tenants ───────────────────────────────────────────────────────────────

  async function fetchTenants() {
    try {
      const body = await apiFetch<{ data: Record<string, unknown>[] }>("/api/tenants");
      setTenants(body.data.map(normalizeTenant));
    } catch (e) {
      console.error("Failed to fetch tenants:", e);
    }
  }

  const refreshTenants = useCallback(() => fetchTenants(), []);

  const addTenant = useCallback(async (t: Omit<Tenant, "id" | "createdAt">) => {
    const body = await apiFetch<{ data: Record<string, unknown> }>("/api/tenants", {
      method: "POST",
      body: JSON.stringify(t),
    });
    setTenants((prev) => [normalizeTenant(body.data), ...prev]);
  }, []);

  const updateTenant = useCallback(async (id: string, patch: Partial<Omit<Tenant, "id">>) => {
    const body = await apiFetch<{ data: Record<string, unknown> }>(`/api/tenants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? normalizeTenant(body.data) : t))
    );
  }, []);

  const deleteTenant = useCallback(async (id: string) => {
    await apiFetch(`/api/tenants/${id}`, { method: "DELETE" });
    setTenants((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Admin Users ───────────────────────────────────────────────────────────

  async function fetchAdminUsers() {
    try {
      const body = await apiFetch<{ data: Record<string, unknown>[] }>("/api/admin-users");
      setAdminUsers(body.data.map(normalizeAdminUser));
    } catch (e) {
      console.error("Failed to fetch admin users:", e);
    }
  }

  const refreshAdminUsers = useCallback(() => fetchAdminUsers(), []);

  const addAdminUser = useCallback(async (u: {
    name: string; email: string; password: string;
    role: string; tenantId: string | null; status: string;
  }) => {
    const body = await apiFetch<{ data: Record<string, unknown> }>("/api/admin-users", {
      method: "POST",
      body: JSON.stringify({
        username: u.email.split("@")[0].toLowerCase(),
        email: u.email,
        password: u.password,
        displayName: u.name,
        role: u.role,
        tenantId: u.tenantId ?? null,
        status: u.status,
      }),
    });
    setAdminUsers((prev) => [normalizeAdminUser(body.data), ...prev]);
  }, []);

  const updateAdminUser = useCallback(async (id: string, patch: Record<string, unknown>) => {
    const body = await apiFetch<{ data: Record<string, unknown> }>(`/api/admin-users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? normalizeAdminUser(body.data) : u))
    );
  }, []);

  const deleteAdminUser = useCallback(async (id: string) => {
    await apiFetch(`/api/admin-users/${id}`, { method: "DELETE" });
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  if (!ready) return null;

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        logout,
        tenants,
        activeTenantId,
        setActiveTenantId,
        addTenant,
        updateTenant,
        deleteTenant,
        refreshTenants,
        adminUsers,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        refreshAdminUsers,
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

// ─── Normalizers (API response → local type) ──────────────────────────────────

function normalizeTenant(raw: Record<string, unknown>): Tenant {
  const f = (raw.features ?? {}) as Record<string, boolean>;
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    domain: String(raw.domain ?? ""),
    databaseUri: String(raw.databaseUri ?? ""),
    primaryColor: String(raw.primaryColor ?? "#D32F2F"),
    secondaryColor: String(raw.secondaryColor ?? "#0f172a"),
    accentColor: String(raw.accentColor ?? "#FFC107"),
    logo: String(raw.logo ?? ""),
    font: String(raw.font ?? "Inter"),
    layout: (raw.layout as Tenant["layout"]) ?? "modern",
    description: String(raw.description ?? ""),
    bannerTitle: String(raw.bannerTitle ?? ""),
    bannerSubtitle: String(raw.bannerSubtitle ?? ""),
    contactEmail: String(raw.contactEmail ?? ""),
    contactPhone: String(raw.contactPhone ?? ""),
    address: String(raw.address ?? ""),
    features: {
      reviews: Boolean(f.reviews),
      chat: Boolean(f.chat),
      loyaltyProgram: Boolean(f.loyaltyProgram),
    },
    register: raw.register ? String(raw.register) : "",
    registerTurul: (raw.registerTurul as Tenant["registerTurul"]) ?? "Байгууллага",
    posDbUri: raw.posDbUri ? String(raw.posDbUri) : "",
    posBranchId: raw.posBranchId ? String(raw.posBranchId) : "",
    posOrgId: raw.posOrgId ? String(raw.posOrgId) : "",
    emDbUri: raw.emDbUri ? String(raw.emDbUri) : "",
    emBranchId: raw.emBranchId ? String(raw.emBranchId) : "",
    emOrgId: raw.emOrgId ? String(raw.emOrgId) : "",
    qpayUsername: raw.qpayUsername ? String(raw.qpayUsername) : "",
    qpayPassword: raw.qpayPassword ? String(raw.qpayPassword) : "",
    qpayInvoiceCode: raw.qpayInvoiceCode ? String(raw.qpayInvoiceCode) : "",
    qpayFeeType: (raw.qpayFeeType as Tenant["qpayFeeType"]) ?? "CHARGE_PAYER",
    qpayMerchantName: raw.qpayMerchantName ? String(raw.qpayMerchantName) : "",
    qpayRegister: raw.qpayRegister ? String(raw.qpayRegister) : "",
    qpayPhone: raw.qpayPhone ? String(raw.qpayPhone) : "",
    qpayEmail: raw.qpayEmail ? String(raw.qpayEmail) : "",
    qpayAddress: raw.qpayAddress ? String(raw.qpayAddress) : "",
    qpayCity: raw.qpayCity ? String(raw.qpayCity) : "",
    qpayDistrict: raw.qpayDistrict ? String(raw.qpayDistrict) : "",
    qpayMccCode: raw.qpayMccCode ? String(raw.qpayMccCode) : "",
    qpayBankName: raw.qpayBankName ? String(raw.qpayBankName) : "",
    qpayBankAccount: raw.qpayBankAccount ? String(raw.qpayBankAccount) : "",
    qpayBankAccountName: raw.qpayBankAccountName ? String(raw.qpayBankAccountName) : "",
    createdAt: raw.createdAt ? String(raw.createdAt).slice(0, 10) : "",
    status: (raw.status as "active" | "inactive") ?? "active",
  };
}

function normalizeAdminUser(raw: Record<string, unknown>): AdminUser {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.displayName ?? raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: (raw.role as AdminRole) ?? "admin",
    tenantId: raw.tenantId ? String(raw.tenantId) : null,
    createdAt: raw.createdAt ? String(raw.createdAt).slice(0, 10) : "",
    lastLogin: raw.lastLogin ? String(raw.lastLogin).slice(0, 10) : null,
    status: (raw.status as "active" | "inactive") ?? "active",
  };
}

type AdminRole = "superadmin" | "admin";
