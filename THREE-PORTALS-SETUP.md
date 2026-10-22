# SurakshaHub — three portals and staff-ID authentication setup

## Portals
- Student/User: email + password; public signup.
- Staff: staff ID + password, through `supabase/functions/staff-login`.
- Administrator: email + password, only for a real provisioned administrator account. The UI does not create an administrator account.

## Set up Staff ID login
1. Run `supabase/staff-login-aliases.sql` in Supabase SQL Editor.
2. Create each staff member as a real user in Supabase Authentication (use a valid email and a strong password).
3. Assign the appropriate staff role in the project's profiles/role table using a trusted admin process.
4. Add the staff alias and the Auth user UUID in `public.staff_login_aliases`, e.g. `staff@123` mapped to that staff user's UUID. Do not store passwords in this table.
5. Deploy the Edge Function from the project root: `supabase functions deploy staff-login`.
6. Set the Edge Function's server-side secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` using Supabase's function secrets tooling. The service role key must never go in Vite env variables or frontend files.

## Administrator
The Administrator portal is restored. It requires a real Supabase Auth user and an administrator role in the database. No administrator account is created automatically. Avoid short password `12345`; Supabase password policies may reject it and it is not safe for real use.

## Important
- The staff login function returns a normal Supabase Auth session after verifying the password through Supabase Auth. Add rate limiting/monitoring for a public-facing deployment.
- Portal selection is not authorization. Database RLS policies must enforce permissions.
- The app and Edge Function are prepared, but this ZIP has not been built or tested against your live Supabase project. Run `npm install` and `npm run build`, deploy the function, then test using provisioned accounts.
