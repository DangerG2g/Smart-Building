# SurakshaHub: email/password login setup

## Login behavior
- Student/User: email + password; public signup and forgot-password are available.
- Staff: email + password for a staff account created in Supabase Authentication. Institute/staff ID is intentionally postponed and can be added to the profile later.
- Administrator: email + password for an administrator account created and provisioned by the project owner. Selecting the Administrator portal does not grant admin permissions.

## Supabase setup
1. Ensure the project's schema has been run using `supabase/schema.sql`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting provider and redeploy. Never put a service-role/secret key in frontend environment variables.
3. Create staff and administrator accounts through Supabase Authentication → Users (or use the student signup flow for student accounts). Use real email addresses and strong passwords.
4. Add trusted role assignment and database Row Level Security policies before giving staff/admin accounts access to restricted data. Portal selection is only a UI choice and is not authorization.
5. Institute ID can be added later as an optional profile field and linked to the appropriate account.

## Important
This project uses Supabase email/password authentication for all three portals. It no longer depends on the `staff-login` Edge Function or `staff_login_aliases` mapping table. Existing deployments of that function may be removed later if no longer used.
