# SurakshaHub login screen update

## Replace
- `src/App.jsx` — replaces the login screen with two choices: Student/User and Staff.
- No Administrator portal is shown because no administrator account/data has been provisioned.

## Behavior
- Student/User: email + password; create-account and forgot-password options remain.
- Staff: staff email + password fields; no public staff signup.
- Important: the Staff ID form is UI-only until secure staff-ID-to-Supabase-account authentication is implemented. It deliberately shows a clear message rather than pretending the login worked. Do not place a Supabase service-role key in frontend code.

## Student auth
Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project. New public accounts must be assigned the least-privilege Student/User role by trusted database logic.

## Before deployment
Install dependencies and run `npm run build`. The package has not been verified by a successful production build.
