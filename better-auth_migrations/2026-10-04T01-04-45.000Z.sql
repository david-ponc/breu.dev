ALTER TABLE auth."user" ADD COLUMN IF NOT EXISTS "isAnonymous" boolean DEFAULT false;
