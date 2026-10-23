# SurakshaHub account signup update

## Signup behavior
- Student/User, Staff, and Administrator portals all offer email + password account creation.
- Full name is required; Institution ID is optional and can be added later.
- Signup saves `full_name`, `institution_id`, and `requested_portal` in Supabase Auth user metadata.
- Passwords are handled by Supabase Auth and are not stored by this application.
- Email confirmation may be required depending on Supabase Authentication settings.

## Important role security
Selecting Staff or Administrator during signup DOES NOT grant that role. The requested portal is untrusted user metadata. A trusted administrator must grant staff/admin permissions using the project's secure database role mechanism. Do not make a public signup form assign privileged roles. The current profile trigger/schema may assign new profiles the default `student` role until role assignment is implemented.

## Supabase and password reset
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel.
- In Supabase Authentication > URL Configuration, set Site URL to the deployed Vercel domain, not `http://localhost:3000`.
- Add the deployed domain and the recovery redirect path to Redirect URLs.
- Test a fresh recovery email after saving URL configuration.

## Build
Run `npm install` then `npm run build` before deploying. Check the Vercel build output after deployment.
