-- Security Fix M1: Explicit deny-write RLS policies
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- These policies prevent any client-side writes to billing/entitlement tables.
-- Only the stripe-webhook Edge Function (using service-role key) can write.

-- Deny client INSERT on user_billing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deny client writes on billing') THEN
    CREATE POLICY "deny client writes on billing"
      ON public.user_billing FOR INSERT
      WITH CHECK (false);
  END IF;
END $$;

-- Deny client UPDATE on user_billing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deny client updates on billing') THEN
    CREATE POLICY "deny client updates on billing"
      ON public.user_billing FOR UPDATE
      USING (false);
  END IF;
END $$;

-- Deny client DELETE on user_billing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deny client deletes on billing') THEN
    CREATE POLICY "deny client deletes on billing"
      ON public.user_billing FOR DELETE
      USING (false);
  END IF;
END $$;

-- Deny client INSERT on user_entitlements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deny client writes on entitlements') THEN
    CREATE POLICY "deny client writes on entitlements"
      ON public.user_entitlements FOR INSERT
      WITH CHECK (false);
  END IF;
END $$;

-- Deny client UPDATE on user_entitlements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deny client updates on entitlements') THEN
    CREATE POLICY "deny client updates on entitlements"
      ON public.user_entitlements FOR UPDATE
      USING (false);
  END IF;
END $$;

-- Deny client DELETE on user_entitlements
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'deny client deletes on entitlements') THEN
    CREATE POLICY "deny client deletes on entitlements"
      ON public.user_entitlements FOR DELETE
      USING (false);
  END IF;
END $$;
