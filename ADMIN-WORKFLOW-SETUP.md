# SurakshaHub admin role and repair verification

## What changed
- Administrators get a **People & roles** section to assign User, Maintenance staff, Security staff, or Administrator roles.
- Work orders can be assigned to listed maintenance/security profiles.
- Staff can move work to **Awaiting verification** after finishing it.
- An administrator can choose **Verify done** to mark the task **Completed**, or return it to **In progress**.
- A database trigger blocks non-admin users from setting a task to `Completed` directly.

## Apply the database update
1. Open Supabase Dashboard → SQL Editor.
2. Open `supabase/admin-workflow-migration.sql` from this project.
3. Paste the entire file and run it.
4. Ensure at least one trusted account already has `role = 'admin'` in `public.profiles`. Do not grant admin access to unverified users.
5. Redeploy the project on Vercel after pushing the updated files.

## Important authentication note
This update adds the admin and work-verification workflow. The current project still uses Supabase email/password authentication. A true username/password-only system needs a server-side username-to-account authentication design and matching account recovery/provisioning; do not store raw passwords in SQL or put the Supabase service-role key in frontend/Vercel `VITE_` variables. This package does not silently replace authentication with an insecure plain-text password table.

## Build status
The production build was not verified in this environment because dependency installation did not finish in time. Run `npm install` and `npm run build` locally or in your CI before deployment.
