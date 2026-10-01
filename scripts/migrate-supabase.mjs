#!/usr/bin/env node
/**
 * Supabase Data Migration Script
 * Migrates expenses, EMIs, and receivables from old project to new project.
 *
 * Usage:
 *   node scripts/migrate-supabase.mjs
 *
 * It will prompt for your email and password interactively.
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

// ─── OLD PROJECT (anon key — we'll authenticate as the user) ────────────────
const OLD_URL = "https://mmyoficnchzfqwjefamq.supabase.co";
const OLD_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1teW9maWNuY2h6ZnF3amVmYW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwODcxNTIsImV4cCI6MjEwNTY2MzE1Mn0.CjP9opgiPg7nPOZPPeihZ9cT6tYzTbqCKnYylR6TjMs";

// ─── NEW PROJECT (service role key — full access to write data) ──────────────
const NEW_URL = "https://paephuydixjtrhyrkdun.supabase.co";
const NEW_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZXBodXlkaXhqdHJoeXJrZHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzgzMTQsImV4cCI6MjEwNjQ1NDMxNH0.n0Edz8UAP9tUN7vCUqO4VVEuiv0ebitu25kKhZbMkgw";
const NEW_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhZXBodXlkaXhqdHJoeXJrZHVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg3ODMxNCwiZXhwIjoyMTA2NDU0MzE0fQ.pX8g5Te_VwdLfPEal86_LbBe2JV-7XJd2pj6R6YcGeM";

// ────────────────────────────────────────────────────────────────────────────

const rl = readline.createInterface({ input, output });

function log(msg) { console.log(`\n  ${msg}`); }
function ok(msg)  { console.log(`  ✅ ${msg}`); }
function err(msg) { console.error(`  ❌ ${msg}`); }
function info(msg){ console.log(`  ℹ️  ${msg}`); }

async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   Supabase Migration: Old → New Project  ");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const email    = await rl.question("  Enter your email:    ");
  const password = await rl.question("  Enter your password: ");
  rl.close();

  // ── STEP 1: Sign into OLD project & fetch data ──────────────────────────
  log("Step 1/4 — Signing into OLD project…");
  const oldClient = createClient(OLD_URL, OLD_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data: oldSession, error: oldSignInErr } =
    await oldClient.auth.signInWithPassword({ email, password });

  if (oldSignInErr || !oldSession?.user) {
    err(`Could not sign into old project: ${oldSignInErr?.message}`);
    process.exit(1);
  }
  ok(`Signed in as ${oldSession.user.email} (old user_id: ${oldSession.user.id})`);

  // Fetch all tables
  log("Step 2/4 — Fetching your data from OLD project…");

  const [emisRes, expensesRes, receivablesRes] = await Promise.all([
    oldClient.from("emis").select("*"),
    oldClient.from("expenses").select("*"),
    oldClient.from("receivables").select("*"),
  ]);

  if (emisRes.error)       { err(`EMIs fetch: ${emisRes.error.message}`); process.exit(1); }
  if (expensesRes.error)   { err(`Expenses fetch: ${expensesRes.error.message}`); process.exit(1); }
  if (receivablesRes.error){ err(`Receivables fetch: ${receivablesRes.error.message}`); process.exit(1); }

  const emis        = emisRes.data        ?? [];
  const expenses    = expensesRes.data    ?? [];
  const receivables = receivablesRes.data ?? [];

  ok(`Fetched: ${emis.length} EMIs, ${expenses.length} Expenses, ${receivables.length} Receivables`);

  if (emis.length + expenses.length + receivables.length === 0) {
    info("Nothing to migrate. Exiting.");
    process.exit(0);
  }

  // ── STEP 2: Sign into NEW project to get the new user_id ────────────────
  log("Step 3/4 — Signing into NEW project (creating account if needed)…");
  const newAuthClient = createClient(NEW_URL, NEW_ANON_KEY, {
    auth: { persistSession: false },
  });

  // Try sign-in first, fall back to sign-up
  let newUser;
  const { data: newSession, error: newSignInErr } =
    await newAuthClient.auth.signInWithPassword({ email, password });

  if (newSignInErr) {
    info("No account found in new project — creating one…");
    const { data: signUpData, error: signUpErr } =
      await newAuthClient.auth.signUp({ email, password });
    if (signUpErr || !signUpData?.user) {
      err(`Could not create account in new project: ${signUpErr?.message}`);
      process.exit(1);
    }
    newUser = signUpData.user;
    info("Account created! (check your email to confirm if required)");
  } else {
    newUser = newSession?.user;
  }

  if (!newUser?.id) {
    err("Could not determine new user ID.");
    process.exit(1);
  }
  ok(`New user_id: ${newUser.id}`);

  // ── STEP 3: Insert data into NEW project (using service role key) ────────
  log("Step 4/4 — Inserting data into NEW project…");
  const newAdminClient = createClient(NEW_URL, NEW_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const newId = newUser.id;

  // Remap user_id to new user; keep all other fields except the old id
  // (UUIDs are regenerated so there are no conflicts)
  function remapRows(rows) {
    return rows.map(({ id: _id, user_id: _uid, ...rest }) => ({
      ...rest,
      user_id: newId,
    }));
  }

  let migrated = 0;

  if (emis.length > 0) {
    const { error } = await newAdminClient.from("emis").insert(remapRows(emis));
    if (error) { err(`EMI insert failed: ${error.message}`); process.exit(1); }
    ok(`Inserted ${emis.length} EMI(s)`);
    migrated += emis.length;
  }

  if (expenses.length > 0) {
    const { error } = await newAdminClient.from("expenses").insert(remapRows(expenses));
    if (error) { err(`Expenses insert failed: ${error.message}`); process.exit(1); }
    ok(`Inserted ${expenses.length} expense(s)`);
    migrated += expenses.length;
  }

  if (receivables.length > 0) {
    const { error } = await newAdminClient.from("receivables").insert(remapRows(receivables));
    if (error) { err(`Receivables insert failed: ${error.message}`); process.exit(1); }
    ok(`Inserted ${receivables.length} receivable(s)`);
    migrated += receivables.length;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  🎉 Migration complete! ${migrated} rows moved.`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
