# SurakshaHub: all-portal email/password account setup

- Student/User, Staff, and Administrator portal selections all allow email/password account creation.
- Institution ID is optional and can be supplied during signup or left blank for later.
- **Security:** every public signup receives the default `student` role. Selecting Staff or Administrator does not grant elevated access. A trusted project owner must approve and assign the appropriate role in `public.profiles`.
- Staff use email/password for now; the older staff-ID Edge Function is not required by this login UI.
- Password reset uses Supabase Auth. Set Authentication → URL Configuration Site URL and Redirect URLs to the deployed Vercel URL, not just localhost.
- Run `supabase/schema.sql` in Supabase SQL Editor to add the optional profile institution_id column and the signup trigger update. The schema is designed to be re-runnable; review errors before proceeding.
- Configure Vercel with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only. Never put a service-role/secret key in frontend variables.
