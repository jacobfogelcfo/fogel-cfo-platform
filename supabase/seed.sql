-- ============================================================================
-- Fogel CFO Platform — Milestone 1 seed (data only)
--
-- Run AFTER `npx tsx supabase/seed.ts`. The TS script creates auth.users for
-- the 6 test users below; this SQL then references them via subqueries.
--
-- Idempotent: every insert uses ON CONFLICT DO NOTHING. Safe to re-run.
--
-- Suggested invocation:
--     npm run seed
--
-- which runs:
--     tsx supabase/seed.ts && psql "$DATABASE_URL" -f supabase/seed.sql
-- ============================================================================

-- Pre-flight: fail fast if seed.ts hasn't run yet.
do $$
begin
  if not exists (select 1 from auth.users where email = 'admin@fogelcfo.com') then
    raise exception
      'seed.ts has not been run yet — auth.users row for admin@fogelcfo.com is missing. Run: npx tsx supabase/seed.ts';
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 1. Client templates
-- ----------------------------------------------------------------------------
insert into public.client_templates (id, slug, name, description, default_config, created_by)
values
  ('11111111-1111-1111-1111-111111111101', 'nonprofit-il', 'Nonprofit (Israel)',
   'Hebrew/RTL nonprofit with donor CRM, donations, US checks, and AP.',
   '{}'::jsonb, 'seed'),
  ('11111111-1111-1111-1111-111111111102', 'forprofit-us', 'For-profit (US)',
   'English/LTR for-profit with AP, AR, and banking.',
   '{}'::jsonb, 'seed')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 2. Clients
-- ----------------------------------------------------------------------------
insert into public.clients (
  id, slug, client_name, template_id, config,
  base_currency, language, direction, timezone, is_active, created_by
) values
  (
    '22222222-2222-2222-2222-222222222201',
    'kge-nonprofit',
    'KGE Nonprofit (קרן ק.ג.ה.)',
    '11111111-1111-1111-1111-111111111101',
    '{
      "features": {
        "donor_crm": true,
        "donation_tracking": true,
        "income_entry": true,
        "us_checks": true,
        "bills_ap": true,
        "check_requests": true,
        "multi_invoice_per_request": true,
        "nonprofit_module": true,
        "supplier_registry": true,
        "project_tracking": true,
        "bank_dashboard": true
      },
      "project_label": "פרויקט",
      "invoice_types": ["AP"],
      "ref_number_prefix": "KGE",
      "dashboard": {
        "widgets": ["pending_approvals","donations_this_month","project_status","bank_balance"]
      },
      "local_admin_dashboard": {
        "widgets": ["approvals_queue","recent_donations","project_budgets","pending_check_requests"]
      }
    }'::jsonb,
    'ILS', 'he', 'rtl', 'Asia/Jerusalem', true, 'seed'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    'acme-profit',
    'Acme For-Profit Inc.',
    '11111111-1111-1111-1111-111111111102',
    '{
      "features": {
        "bills_ap": true,
        "invoices_ar": true,
        "bank_dashboard": true,
        "project_tracking": true,
        "supplier_registry": true,
        "hr_module": true,
        "meetings": true
      },
      "project_label": "Project",
      "invoice_types": ["AR","AP"],
      "ref_number_prefix": "INV",
      "dashboard": {
        "widgets": ["pending_approvals","bank_balance","invoice_queue","open_bills","project_status"]
      },
      "local_admin_dashboard": {
        "widgets": ["approvals_queue","bank_balance","timesheet_approvals","project_budgets"]
      }
    }'::jsonb,
    'USD', 'en', 'ltr', 'America/Chicago', true, 'seed'
  )
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 3. Entities (legal entities under each client)
-- ----------------------------------------------------------------------------
insert into public.entities (
  id, client_id, legal_name, entity_type, country, base_currency, timezone, is_active, created_by
) values
  ('33333333-3333-3333-3333-333333333301',
   '22222222-2222-2222-2222-222222222201',
   'KGE Nonprofit Ltd.', 'nonprofit', 'IL', 'ILS', 'Asia/Jerusalem', true, 'seed'),
  ('33333333-3333-3333-3333-333333333302',
   '22222222-2222-2222-2222-222222222202',
   'Acme For-Profit Inc.', 'corporation', 'US', 'USD', 'America/Chicago', true, 'seed')
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. Client managers
--    admin@fogelcfo.com is hardcoded SUPER_ADMIN in app code, but we also
--    grant them client_manager rows on both clients for completeness.
-- ----------------------------------------------------------------------------
insert into public.client_managers (client_id, manager_email, is_active, created_by)
values
  ('22222222-2222-2222-2222-222222222201', 'admin@fogelcfo.com', true, 'seed'),
  ('22222222-2222-2222-2222-222222222202', 'admin@fogelcfo.com', true, 'seed')
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 5. Client members
--    user_id is NOT NULL → resolve via subquery against auth.users (which
--    seed.ts has already populated).
-- ----------------------------------------------------------------------------
insert into public.client_members (client_id, user_id, user_email, role, is_active, created_by)
select '22222222-2222-2222-2222-222222222201', u.id, u.email, 'local_admin', true, 'seed'
from auth.users u where u.email = 'local_admin@kge.test'
on conflict do nothing;

insert into public.client_members (client_id, user_id, user_email, role, is_active, created_by)
select '22222222-2222-2222-2222-222222222201', u.id, u.email, 'member', true, 'seed'
from auth.users u where u.email = 'member@kge.test'
on conflict do nothing;

insert into public.client_members (client_id, user_id, user_email, role, is_active, created_by)
select '22222222-2222-2222-2222-222222222201', u.id, u.email, 'income_reporter', true, 'seed'
from auth.users u where u.email = 'reporter@kge.test'
on conflict do nothing;

insert into public.client_members (client_id, user_id, user_email, role, is_active, created_by)
select '22222222-2222-2222-2222-222222222202', u.id, u.email, 'local_admin', true, 'seed'
from auth.users u where u.email = 'local_admin@profit.test'
on conflict do nothing;

insert into public.client_members (client_id, user_id, user_email, role, is_active, created_by)
select '22222222-2222-2222-2222-222222222202', u.id, u.email, 'member', true, 'seed'
from auth.users u where u.email = 'member@profit.test'
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 6. FX rates — enough for currency conversion in M3+.
-- ----------------------------------------------------------------------------
insert into public.fx_rates
  (currency_pair, base_currency, quote_currency, rate, rate_date, rate_source, created_by)
values
  ('USD/ILS', 'USD', 'ILS', 3.7000, current_date - 30, 'seed', 'seed'),
  ('USD/ILS', 'USD', 'ILS', 3.7500, current_date - 7,  'seed', 'seed'),
  ('USD/ILS', 'USD', 'ILS', 3.7200, current_date,      'seed', 'seed'),
  ('ILS/USD', 'ILS', 'USD', 0.2700, current_date,      'seed', 'seed'),
  ('USD/EUR', 'USD', 'EUR', 0.9200, current_date,      'seed', 'seed'),
  ('EUR/USD', 'EUR', 'USD', 1.0870, current_date,      'seed', 'seed')
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- 7. Sample business data — minimal, just enough to click around.
-- ----------------------------------------------------------------------------

-- Donors (KGE only)
insert into public.donors (client_id, entity_id, full_name, donor_type, email, country, is_active, created_by)
values
  ('22222222-2222-2222-2222-222222222201',
   '33333333-3333-3333-3333-333333333301',
   'David Cohen', 'individual', 'david.cohen@example.com', 'IL', true, 'seed'),
  ('22222222-2222-2222-2222-222222222201',
   '33333333-3333-3333-3333-333333333301',
   'Sarah Levy', 'individual', 'sarah.levy@example.com', 'IL', true, 'seed')
on conflict do nothing;

-- Vendors (Acme only)
insert into public.vendors (client_id, entity_id, vendor_name, vendor_type, email, currency, created_by)
values
  ('22222222-2222-2222-2222-222222222202',
   '33333333-3333-3333-3333-333333333302',
   'Office Supplies Co.', 'supplier', 'billing@officesupplies.example', 'USD', 'seed'),
  ('22222222-2222-2222-2222-222222222202',
   '33333333-3333-3333-3333-333333333302',
   'Cloud Hosting LLC', 'service', 'ar@cloudhosting.example', 'USD', 'seed')
on conflict do nothing;

-- Customers (Acme only)
insert into public.customers (client_id, entity_id, customer_name, customer_type, email, currency, status, created_by)
values
  ('22222222-2222-2222-2222-222222222202',
   '33333333-3333-3333-3333-333333333302',
   'Beta Industries', 'business', 'ap@betaindustries.example', 'USD', 'active', 'seed'),
  ('22222222-2222-2222-2222-222222222202',
   '33333333-3333-3333-3333-333333333302',
   'Gamma Logistics', 'business', 'invoices@gammalogistics.example', 'USD', 'active', 'seed')
on conflict do nothing;

-- Projects (both clients)
insert into public.projects (
  client_id, entity_id, name, name_en, status, manager_email, created_by
) values
  ('22222222-2222-2222-2222-222222222201',
   '33333333-3333-3333-3333-333333333301',
   'בית הספר החדש', 'New School Building', 'active', 'member@kge.test', 'seed'),
  ('22222222-2222-2222-2222-222222222201',
   '33333333-3333-3333-3333-333333333301',
   'תמיכה בנזקקים', 'Community Aid', 'active', 'member@kge.test', 'seed'),
  ('22222222-2222-2222-2222-222222222202',
   '33333333-3333-3333-3333-333333333302',
   'Q4 Marketing Push', 'Q4 Marketing Push', 'active', 'member@profit.test', 'seed'),
  ('22222222-2222-2222-2222-222222222202',
   '33333333-3333-3333-3333-333333333302',
   'Platform Rebuild', 'Platform Rebuild', 'active', 'member@profit.test', 'seed')
on conflict do nothing;

-- Note on M1 scope: bills/invoices/intake_documents are intentionally omitted
-- here. They have NOT NULL FKs (intake_documents.source_doc_id requires a
-- source_documents row; bills/invoices need lines, currency, totals) that
-- belong with their respective milestones (M2 intake, M6 AP/AR). Add them
-- as part of those milestones.

select 'seed.sql complete' as status;
