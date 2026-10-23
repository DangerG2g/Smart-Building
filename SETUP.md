# Quick setup checklist

1. Create a Supabase project at https://supabase.com/.
2. Supabase SQL Editor → run `supabase/schema.sql` in full.
3. Copy `.env.example` to `.env.local`; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings. Use the publishable/anon key only, never the service-role secret.
4. Run `npm install` then `npm run dev`.
5. Use any portal selection to create an account with a real email address and password. Institution ID is optional. Public signups always receive the Student role until a trusted project owner assigns staff/admin permissions. If email confirmation is enabled, confirm your email before signing in. New accounts receive the User (`student`) role. Use **Forgot password?** to request a reset link.
6. Promote verified staff accounts using Supabase SQL Editor, for example:
   `update public.profiles set role = 'maintenance' where id = 'VERIFIED-USER-UUID';`
   Valid roles: `student`, `maintenance`, `security`, `admin`.
7. For Vercel, set the same two environment variables in the SurakshaHub project’s Settings → Environment Variables (not just an unattached shared variable group), apply them to Production and Preview as needed, then redeploy. Build command `npm run build`; output folder `dist`.

Role changes must be made only by a trusted project owner. Do not let users choose their own role at signup. Read README.md for complete setup and troubleshooting.

## Update an existing Supabase project

If you already ran an earlier version of `supabase/schema.sql`, run this updated schema again in the SQL Editor. It adds the alert audience column and alert audit trail. The script uses `IF NOT EXISTS` and replaces its policies/triggers so it can be re-run. If Supabase reports an error, stop and resolve it before testing the app.

## Alert and complaint permissions

All authenticated users can read shared alerts. Only administrator and security roles can create/update alerts. Users submit complaints as maintenance requests; they cannot edit official alerts. Role permissions are enforced by Row Level Security, not just by hiding controls. New signups default to the user/student role. Assign staff roles only from a trusted Supabase project-owner account.

The alert audience defaults to `All users`. Current UI publishes all-user alerts; the schema reserves `Staff only` for future targeted announcements. Real-time push/email notifications are not configured.

## How real login works

- A person registers with an email and password; Supabase Auth creates and verifies the account.
- The database trigger creates a `profiles` row with the default `student` role.
- After sign-in, the app reads that profile and shows the role-appropriate workspace.
- Staff roles are assigned only by a trusted project owner in Supabase SQL Editor, after verifying the account UUID. Never make admin/staff role selection available on public signup.
- Forgot-password requests are sent by Supabase. Configure the deployed site URL and allowed redirect URLs under Supabase Authentication → URL Configuration.
- If the Supabase environment variables are missing, real sign-in/sign-up is disabled; there is no demo bypass.
