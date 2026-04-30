/**
 * supabase/seed.ts — creates the 6 M1 test users in auth.users via the
 * Supabase admin API. LOCAL-ONLY developer tool.
 *
 * REQUIRES (in .env.local — never in Lovable secrets):
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: `npm run seed` (which also runs supabase/seed.sql afterwards).
 *
 * Idempotent: re-running re-applies the same dev password and skips users
 * that already exist.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";

loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local. See .env.local.example.",
  );
  process.exit(1);
}

// Hard refusal: if anyone ever puts the service role into Lovable env, this
// guard stops accidental browser-side execution. Service role bypasses RLS.
if (typeof window !== "undefined") {
  throw new Error("seed.ts must be run from Node, never in a browser context.");
}

const DEV_PASSWORD = "fogel-dev-2026"; // local-only, change in prod env

const TEST_USERS = [
  { email: "admin@fogelcfo.com", note: "Super admin (hardcoded in app)" },
  { email: "local_admin@kge.test", note: "Local admin — KGE nonprofit" },
  { email: "member@kge.test", note: "Member — KGE nonprofit" },
  { email: "reporter@kge.test", note: "Income reporter — KGE nonprofit" },
  { email: "local_admin@profit.test", note: "Local admin — Acme for-profit" },
  { email: "member@profit.test", note: "Member — Acme for-profit" },
];

async function main() {
  const admin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Seeding ${TEST_USERS.length} auth users…\n`);

  for (const u of TEST_USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: { seeded: true, note: u.note },
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        console.log(`  ⏭  ${u.email} — already exists, skipping`);
        continue;
      }
      console.error(`  ✗  ${u.email} — ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    console.log(`  ✓  ${u.email} — created (id: ${data.user?.id})`);
  }

  console.log(
    `\nDone. Dev password for all seeded users: ${DEV_PASSWORD}\n` +
      "Now run seed.sql to populate clients/entities/members/etc.\n" +
      "If using `npm run seed`, that happens automatically next.",
  );
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
