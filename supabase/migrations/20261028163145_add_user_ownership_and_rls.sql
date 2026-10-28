/*
# Add user ownership columns and owner-scoped RLS

## Overview
Converts the Binder app from a shared (anon-accessible) schema to a multi-user
schema where each user only sees and manages their own collections and cards.

## Changes

### 1. New columns
- `collections.user_id` — uuid, NOT NULL, defaults to `auth.uid()`. Links each
  collection to the authenticated user who created it. Added via a DO block
  so it is safe to re-run.
- `cards.user_id` — uuid, NOT NULL, defaults to `auth.uid()`. Links each card
  to the authenticated user who created it.

### 2. Existing-data backfill
Existing rows (created under the old open model) get `user_id` set to a
sentinel so the NOT NULL constraint succeeds; since there was no authenticated
session before, these rows are orphaned and effectively unreachable. This is
unavoidable when moving from no-auth to per-user auth.

### 3. Indexes
- `idx_collections_user_id` on `collections(user_id)` for per-user queries.
- `idx_cards_user_id` on `cards(user_id)` for per-user queries.

### 4. Security — RLS policy overhaul
Previous policies used `USING (true)` / `WITH CHECK (true)` for both `anon`
and `authenticated`, making all data world-readable/writable. These are all
dropped and replaced with owner-scoped policies scoped to `authenticated` only:

- collections: SELECT / INSERT / UPDATE / DELETE where `auth.uid() = user_id`
- cards: SELECT / INSERT / UPDATE / DELETE where `auth.uid() = user_id`

Grants are tightened to `authenticated` only (plus `service_role` which bypasses
RLS but still needs the grant for any future server-side use). The `anon` role
loses all access — the app now requires sign-in.

## Important notes
1. The frontend MUST build a sign-in / sign-up screen in the same change,
   because the anon-key client now has `auth.uid() = null` and every query
   returns zero rows. Without an authenticated session the app appears empty.
2. `DEFAULT auth.uid()` on both `user_id` columns means client inserts that
   omit `user_id` (e.g. `.insert({ name, icon, color })`) still satisfy the
   INSERT policy's `WITH CHECK (auth.uid() = user_id)`.
3. Cards also carry `user_id` directly (rather than deriving ownership through
   the parent collection) so that the per-user filter is a simple column
   equality check and does not require a join for every card read.
*/

-- 1a. Add user_id to collections (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'collections' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.collections ADD COLUMN user_id uuid;
    UPDATE public.collections SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
    ALTER TABLE public.collections ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE public.collections ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- 1b. Add user_id to cards (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cards' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.cards ADD COLUMN user_id uuid;
    UPDATE public.cards SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;
    ALTER TABLE public.cards ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE public.cards ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- 2. Indexes for per-user queries
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections (user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards (user_id);

-- 3. Grants: tighten to authenticated only
REVOKE ALL ON public.collections FROM anon;
REVOKE ALL ON public.cards FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO service_role;

-- 4. Drop old open policies and create owner-scoped ones

-- collections
DROP POLICY IF EXISTS "read_collections" ON public.collections;
DROP POLICY IF EXISTS "insert_collections" ON public.collections;
DROP POLICY IF EXISTS "update_collections" ON public.collections;
DROP POLICY IF EXISTS "delete_collections" ON public.collections;

CREATE POLICY "select_own_collections" ON public.collections
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_collections" ON public.collections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_collections" ON public.collections
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_collections" ON public.collections
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- cards
DROP POLICY IF EXISTS "read_cards" ON public.cards;
DROP POLICY IF EXISTS "insert_cards" ON public.cards;
DROP POLICY IF EXISTS "update_cards" ON public.cards;
DROP POLICY IF EXISTS "delete_cards" ON public.cards;

CREATE POLICY "select_own_cards" ON public.cards
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_cards" ON public.cards
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_cards" ON public.cards
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_cards" ON public.cards
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
