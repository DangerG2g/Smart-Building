# SurakshaHub — replacement and setup notes

This ZIP uses **SurakshaHub** branding and adds a three-choice portal selector:
- Student / User
- Staff (shared entry point for staff operations)
- Administrator

## Replace / deploy
1. Extract this ZIP.
2. Replace the files in your existing repository with these project files.
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for this project.
4. Commit/push and redeploy. Install dependencies and run `npm run build` to test.

## Important authentication status
The portal selector is a user-interface choice, not an authorization mechanism. This package is based on the current project and does not automatically provision the requested `adm@123` / `staff@123` accounts. Supabase email/password sign-in expects valid email accounts; those IDs are not email addresses. A secure server-side username-to-account mapping or valid email login identifiers are needed to support them.

The existing schema also retains separate staff role values. This package does not yet migrate all staff into one database role or verify that RLS policies implement the desired shared-staff permissions. Do not treat this as production-ready until those changes are implemented and tested. Never put a Supabase service-role key in frontend code.
