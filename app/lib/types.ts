// ─── Tenant / Project ─────────────────────────────────────────────────────────

export type TenantThemeLayout = "modern" | "minimal" | "bold";

export type TenantFeatures = {
  reviews: boolean;
  chat: boolean;
  loyaltyProgram: boolean;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  /** Hex – e.g. "#D32F2F" */
  primaryColor: string;
  logo: string;
  font: string;
  layout: TenantThemeLayout;
  features: TenantFeatures;
  createdAt: string;
  status: "active" | "inactive";
};

// ─── Admin Users ──────────────────────────────────────────────────────────────

export type AdminRole = "superadmin" | "admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  /** Stored as plaintext for this demo – hash in production */
  password: string;
  role: AdminRole;
  /** null means super admin – can see all tenants */
  tenantId: string | null;
  createdAt: string;
  lastLogin: string | null;
  status: "active" | "inactive";
};
