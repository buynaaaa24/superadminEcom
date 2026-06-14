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
  /** Custom domain for the tenant's storefront, e.g. "boldstore.mn" */
  domain: string;
  /**
   * MongoDB URI for the tenant's dedicated database.
   * Empty string = use the central shared database with tenantId isolation.
   */
  databaseUri: string;
  // Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  font: string;
  layout: TenantThemeLayout;
  // Store info
  description: string;
  bannerTitle: string;
  bannerSubtitle: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  // Feature flags
  features: TenantFeatures;
  // Integration
  register?: string;
  registerTurul?: "Байгууллага" | "Хувь хүн";
  posDbUri?: string;
  posBranchId?: string;
  posOrgId?: string;
  emDbUri?: string;
  emBranchId?: string;
  emOrgId?: string;
  qpayUsername?: string;
  qpayPassword?: string;
  qpayInvoiceCode?: string;
  qpayMerchantId?: string;
  createdAt: string;
  status: "active" | "inactive";
};

// ─── Admin Users ──────────────────────────────────────────────────────────────

export type AdminRole = "superadmin" | "admin";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  /** null means super admin – can see all tenants */
  tenantId: string | null;
  createdAt: string;
  lastLogin: string | null;
  status: "active" | "inactive";
};
