# Auth/RLS Owner Bootstrap Plan

> **Status:** PLAN ONLY — No SQL executed. No RLS applied. No production touched.
> **Date:** 2026-05-07
> **Environment:** `nexartwo-staging` ONLY

---

## 1. Purpose

This document defines the controlled, manual bootstrap procedure for creating the first `owner` record in `user_roles` on `nexartwo-staging`. This is **Step 1 of 2** in the Auth/RLS activation sequence. Step 2 (applying `004b` table policies) must not run until this step is fully verified.

The bootstrap must be executed by the owner using the **Supabase SQL Editor** with the **service_role key** context, which bypasses RLS and is the only way to INSERT into `user_roles` before policies are in place.

---

## 2. Current Gate Status

| Gate | Status |
|---|---|
| Staging DB QA | ✅ PASS |
| Phase 1 Financial Smoke Test | ✅ PASS |
| Investor Hub Smoke Test | ✅ PASS |
| project_expenses.created_by | ✅ Confirmed — applied to staging |
| Owner Auth user in staging | ✅ Confirmed |
| user_roles table created | ❌ NOT YET (pending 004a execution) |
| is_owner() / auth_role() created | ❌ NOT YET (pending 004a execution) |
| Owner row in user_roles | ❌ NOT YET (pending bootstrap INSERT) |
| Auth/RLS policies (004b–009) applied | ❌ NOT APPLIED |
| Investor Hub activated | ❌ NO |
| INVESTOR_HUB_ENABLED | ❌ `false` — unchanged |
| Production touched | ❌ NO |

---

## 3. Confirmed Owner Identity

| Field | Value |
|---|---|
| **Email** | `racinllerf@gmail.com` |
| **owner_auth_uid** | `1953318e-ff95-4073-abb5-e418f241b7e5` |
| **Environment** | `nexartwo-staging` ONLY |
| **Source** | Confirmed from `auth.users` in Supabase staging SQL Editor |

> [!CAUTION]
> The UUID `1953318e-ff95-4073-abb5-e418f241b7e5` is valid **only for `nexartwo-staging`**. Do NOT use this UUID in production. Production has a separate Auth project with different UUIDs.

---

## 4. What 004a Does

`supabase/drafts/auth-rls/004a_user_roles_bootstrap.sql` performs the following operations:

| Operation | Description |
|---|---|
| `CREATE TABLE IF NOT EXISTS user_roles` | Creates the role mapping table. `user_id` references `auth.users(id) ON DELETE CASCADE`. Roles constrained to `owner`, `admin`, `field_user`, `viewer`. |
| `ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY` | Enables RLS on `user_roles`. **Important:** With no policies yet, the table is effectively locked for all `authenticated` users. Only `service_role` can access it. |
| `CREATE OR REPLACE FUNCTION is_owner()` | `SECURITY DEFINER` function that bypasses RLS to check if the calling user is an owner. Used by table policies to prevent self-recursion. |
| `CREATE OR REPLACE FUNCTION auth_role()` | `SECURITY DEFINER` function that returns the role of the calling user. Used by all financial table policies (005–009). |
| **Does NOT create policies** | `user_roles` policies are in `004b`. They MUST NOT run until the owner row is confirmed. |
| **Does NOT touch application tables** | No changes to `projects`, `project_expenses`, `investors`, etc. |

> [!IMPORTANT]
> `004b` must NOT run until:
> 1. `user_roles` table exists.
> 2. Owner row is inserted and verified.
> 3. `is_owner()` returns `TRUE` for an authenticated owner session.

---

## 5. Manual Bootstrap SQL

The owner must execute the following SQL blocks **in order** in the **Supabase SQL Editor** for `nexartwo-staging`.

> [!CAUTION]
> **STAGING ONLY. DO NOT RUN AGAINST PRODUCTION.**
> Use the **service_role key** context in the SQL Editor. The anon key cannot bypass RLS.

---

### A. Create user_roles Table

```sql
-- STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- STEP A: Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'field_user', 'viewer')),
  PRIMARY KEY (user_id)
);
```

---

### B. Enable RLS on user_roles

```sql
-- STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- STEP B: Enable RLS on user_roles
-- NOTE: Table will be locked (no access) for authenticated users until owner is inserted and 004b runs.
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

---

### C. Create is_owner() Function

```sql
-- STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- STEP C: Create is_owner() — SECURITY DEFINER to bypass RLS (no self-recursion)
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'owner'
  );
$$;
```

---

### D. Create auth_role() Function

```sql
-- STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- STEP D: Create auth_role() — SECURITY DEFINER for financial table policies (005-009)
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM user_roles WHERE user_id = auth.uid();
$$;
```

---

### E. Insert Owner Role

```sql
-- STAGING ONLY — DO NOT RUN AGAINST PRODUCTION
-- STEP E: Insert confirmed staging owner into user_roles
-- owner_auth_uid: 1953318e-ff95-4073-abb5-e418f241b7e5
-- email: racinllerf@gmail.com
INSERT INTO user_roles (user_id, role)
VALUES ('1953318e-ff95-4073-abb5-e418f241b7e5', 'owner')
ON CONFLICT (user_id) DO NOTHING;
```

---

### F. Verify user_roles Record

```sql
-- STAGING ONLY — Verify owner row exists
SELECT user_id, role FROM user_roles;
-- Expected: 1 row with user_id = '1953318e-ff95-4073-abb5-e418f241b7e5', role = 'owner'
```

---

### G. Verify Functions Exist

```sql
-- STAGING ONLY — Verify is_owner() and auth_role() were created
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_owner', 'auth_role')
ORDER BY routine_name;
-- Expected: 2 rows — auth_role, is_owner
```

---

## 6. Verification Queries

Run after completing all steps A–G to confirm bootstrap state:

```sql
-- 1. Confirm user_roles table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'user_roles';

-- 2. Confirm owner row
SELECT * FROM user_roles;

-- 3. Confirm functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_owner', 'auth_role')
ORDER BY routine_name;

-- 4. Confirm RLS is enabled on user_roles
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'user_roles';
```

---

## 7. Expected Results After Bootstrap

| Check | Expected |
|---|---|
| `user_roles` table exists | ✅ YES |
| One owner row exists in `user_roles` | ✅ 1 row with `role = 'owner'` |
| `is_owner()` function exists | ✅ YES |
| `auth_role()` function exists | ✅ YES |
| RLS enabled on `user_roles` | ✅ YES |
| Table policies on `user_roles` | ❌ NOT YET — `004b` not applied |
| Application table policies (005–009) | ❌ NOT YET |
| `004b` applied | ❌ BLOCKED until owner row verified |

> [!IMPORTANT]
> After verifying all checks above, the next authorized step is to prepare and review the **004b user_roles policies plan**. Do NOT apply 005–009 before 004b is verified.

---

## 8. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Wrong owner UUID used | 🔴 Critical | UUID `1953318e-ff95-4073-abb5-e418f241b7e5` confirmed from `auth.users` in staging. Verify before executing. |
| Running against production | 🔴 Critical | SQL Editor must target `nexartwo-staging`. Production Supabase project has different URL and keys. |
| Applying 004b before owner verification | 🔴 Critical | With RLS enabled and no policies, any non-SECURITY DEFINER SELECT on `user_roles` by an authenticated user returns 0 rows. The app would not recognize any user as owner. `is_owner()` would always return `false`. |
| Incomplete bootstrap (A–D only, no E) | 🔴 Critical | `user_roles` exists with RLS enabled but no owner row. Even service_role INSERT works, but the table would be effectively inert. |
| Authenticated session not using service_role | 🔴 Critical | Bootstrap INSERT requires service_role context. Anon key or JWT-auth context will be blocked by RLS before policies exist. |
| User deleted from auth.users | 🟡 Medium | `ON DELETE CASCADE` on `user_id` would auto-remove the owner row from `user_roles`. Always verify row exists before proceeding to 004b. |

---

## 9. Next Step After PASS

Once all verifications in Section 7 pass:

1. **Prepare 004b policies plan** — Document and review the policies that will govern `user_roles` access (owner self-read, owner-only write).
2. **Do not apply 005–009 yet** — Application table policies depend on `is_owner()` and `auth_role()` working correctly with an authenticated session. Validate 004b first.
3. **Test is_owner() with authenticated session** — Sign in as the owner in staging and run `SELECT is_owner();` — it must return `TRUE` before any other policy step proceeds.

---

## 10. Non-Authorization Clause

> [!CAUTION]
> **This document does not authorize applying 004b.**
>
> **This document does not authorize applying RLS policies to application tables (005–009).**
>
> **This document does not authorize touching production.**
>
> **This document does not authorize enabling Investor Hub.**
>
> **`INVESTOR_HUB_ENABLED` must remain `false`.**
>
> This document authorizes only:
> - The owner reading and reviewing this plan.
> - The owner executing the SQL in Section 5 manually in the Supabase SQL Editor for `nexartwo-staging`.
> - The owner reporting verification results from Section 6 back to the team.

---

*Document created: 2026-05-07*
*Branch: docs/auth-rls-owner-bootstrap-plan*
*Source draft: supabase/drafts/auth-rls/004a_user_roles_bootstrap.sql*
*Author: Antigravity Senior Security Engineer*
