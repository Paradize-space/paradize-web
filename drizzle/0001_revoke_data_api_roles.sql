-- Custom SQL migration file, put your code below! --
-- The site connects as the table's owner and never through Supabase's Data
-- API. Supabase still grants every privilege on new public tables (and their
-- sequences) to its API roles on projects made before its 2026 default
-- change, and tables keep those grants after the change reaches them.
-- Row-level security already gives these roles no rows; this takes the
-- privileges away as well, so the table stays closed even if RLS is ever
-- turned off. The checks let the same file run on plain Postgres, where
-- these roles do not exist.
DO $$
DECLARE
  api_role text;
BEGIN
  FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
      EXECUTE format('REVOKE ALL ON TABLE public.waitlist FROM %I', api_role);
      EXECUTE format('REVOKE ALL ON SEQUENCE public.waitlist_id_seq FROM %I', api_role);
    END IF;
  END LOOP;
END $$;
