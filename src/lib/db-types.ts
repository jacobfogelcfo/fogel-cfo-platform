/**
 * Database row types — only the columns M1 actually reads. Hand-curated from SCHEMA_LIVE.md.
 * Will be replaced by generated types in M2+ once we run `supabase gen types`.
 */

export type ClientConfigFeatures = {
  donor_crm?: boolean;
  donation_tracking?: boolean;
  income_entry?: boolean;
  us_checks?: boolean;
  hr_module?: boolean;
  bank_dashboard?: boolean;
  project_tracking?: boolean;
  supplier_registry?: boolean;
  quickbooks_sync?: boolean;
  bills_ap?: boolean;
  invoices_ar?: boolean;
  meetings?: boolean;
  ecommerce?: boolean;
  check_requests?: boolean;
  multi_invoice_per_request?: boolean;
  target_payment_date?: boolean;
  bank_detail_extraction?: boolean;
  nonprofit_module?: boolean;
};

export type ClientConfig = {
  features?: ClientConfigFeatures;
  project_label?: string;
  invoice_types?: Array<"AR" | "AP">;
  ref_number_prefix?: string;
  dashboard?: { widgets?: string[] };
  local_admin_dashboard?: { widgets?: string[] };
};

export type ClientRow = {
  id: string;
  slug: string;
  client_name: string;
  template_id: string;
  config: ClientConfig;
  base_currency: string;
  language: string;
  direction: "ltr" | "rtl";
  is_active: boolean;
  timezone: string;
  deleted_at: string | null;
};

export type ClientMemberRole = "local_admin" | "member" | "income_reporter";

export type ClientMemberRow = {
  client_id: string;
  user_id: string;
  user_email: string;
  role: ClientMemberRole;
  is_active: boolean;
  permissions: { pages?: string[] } | null;
  deleted_at: string | null;
};

export type ClientManagerRow = {
  client_id: string;
  manager_email: string;
  is_active: boolean;
  deleted_at: string | null;
};

export type ResolvedRole =
  | "super_admin"
  | "client_manager"
  | "local_admin"
  | "member"
  | "income_reporter";
