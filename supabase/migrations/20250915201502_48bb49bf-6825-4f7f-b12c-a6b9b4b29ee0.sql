-- Fix security issues: Add RLS policy for makeupstudioappschema table
CREATE POLICY "Enable read access for all users" ON "public"."makeupstudioappschema"
FOR SELECT USING (true);

-- Enable leaked password protection (Note: This needs to be done in Supabase Dashboard)
-- Go to Authentication > Settings and enable "Password strength and leaked password protection"