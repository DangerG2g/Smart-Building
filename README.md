# SurakshaHub — TechTrix'26

Campus safety, maintenance and building operations prototype built with React + Vite + Supabase.

## Features
- Supabase email/password authentication and profile lookup.
- Four role-aware workspaces: Student, Maintenance, Security and Administrator.
- Student maintenance requests; staff assignment/status workflow.
- Building Pulse schematic map and explainable building-health heuristic.
- Alert register with role-aware create/update controls; seeded/sample sensor alerts are labelled simulated.
- Visitor check-in/out register for security/admin.
- Asset directory with generated QR codes.
- Insights, responsive UI, Vite production build and Vercel deployment support.
- Real-account-only sign-in/sign-up screen with password-reset email flow. No demo credentials or bypass login are presented.

## Important limitations
- No physical sensors, CCTV, access-control hardware, SMS/email notifications, live GPS, or emergency dispatch integration is included.
- The map is a schematic illustration, not a live geographic map.
- The building health score is a simple demonstration heuristic, not a certified safety rating.
- QR codes identify assets within the site; QR scanning does not itself authenticate the user.
- This prototype does not include a production file upload bucket. Do not enter real sensitive personal or visitor information until your institution has reviewed privacy, retention and access requirements.
- Never expose a Supabase `service_role` key in frontend code. Only use the publishable/anon key in `VITE_SUPABASE_ANON_KEY` and rely on RLS policies.

## Setup: real Supabase authentication and database

### 1. Create a Supabase project
1. Open https://supabase.com/ and create a project.
2. Wait for the database to finish provisioning.
3. In **Project Settings → API** (or **Connect**), copy the Project URL and the publishable/anon key. Do **not** use the `service_role` secret.

### 2. Create database tables and security policies
1. In Supabase, open **SQL Editor → New query**.
2. Paste all of `supabase/schema.sql` and click **Run**.
3. Confirm the `profiles`, `maintenance_requests`, `alerts`, `assets`, and `visitors` tables exist in **Table Editor**.
4. The SQL enables Row Level Security (RLS). Do not disable RLS to work around a permission error.

### 3. Configure local environment
1. Copy `.env.example` to a new file named `.env.local` in the project root.
2. Replace the placeholders:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

3. Install and run:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Register an account with email/password. If email confirmation is enabled, confirm the email before signing in.

### 4. Assign roles safely
Every self-registered user receives the `student` role. A user must never be able to choose their own administrator role from the public signup screen.

To promote a trusted account, find that user's UUID in **Authentication → Users**, then run this query in SQL Editor, replacing the UUID and role with a verified account and one of `maintenance`, `security`, or `admin`:

```sql
update public.profiles
set role = 'maintenance'
where id = 'REPLACE-WITH-VERIFIED-AUTH-USER-UUID';
```

Repeat for the appropriate staff role. Only a trusted project owner should run role changes. Sign out and back in after changing a role so the UI reloads the profile. The database policies enforce important permissions; hiding a page in the UI is not the security boundary.

### 5. Password recovery and email auth
The sign-in page includes **Forgot password?** and sends a reset link through Supabase. In **Authentication → URL Configuration**, add your local URL (e.g. `http://localhost:5173`) and deployed Vercel URL to the allowed redirect URLs/site URL as needed by your project settings. Review your institution's password and email-confirmation policies before real use.

## Deploy to Vercel
1. Upload the contents of this project folder to your GitHub repository. `package.json` and `index.html` must be in the repository root.
2. In Vercel, import that repository.
3. Framework preset: **Vite**; Build command: `npm run build`; Output directory: `dist`; install command: `npm install`.
4. In Vercel → Project → Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase publishable/anon key
5. Add them to Production (and Preview if desired), save, then redeploy.
6. Add the deployed Vercel URL to Supabase's allowed redirect URLs.

## Troubleshooting
- **White screen / `React is not defined`:** this version imports React explicitly in `src/main.jsx` and uses `@vitejs/plugin-react`. Commit all files, then trigger a new Vercel deployment. Check browser Console for the first red error.
- **`Invalid API key` or network error:** verify both Vercel environment variables and redeploy; don't include quotes or spaces around the values.
- **Profile not found:** confirm `supabase/schema.sql` ran successfully and the profile trigger exists.
- **Permission denied / RLS error:** confirm you used the correct role and ran the complete schema. Don't disable RLS as a shortcut.
- **New account can't access staff pages:** expected. The default role is Student. Assign staff roles using the SQL procedure above.
- **Vercel changes don't appear:** check that the newest deployment finished and hard-refresh the browser.

## Build verification
The source is configured for `npm run build`, but the authoring environment may not have network access to install dependencies. Run `npm install` and `npm run build` locally or inspect Vercel build logs before presenting it as verified.

## Shared alerts, complaints, and permissions

- All signed-in users can read published alerts; user/student accounts have read-only access and cannot publish, edit, resolve, or delete official alerts.
- Security and administrator roles can publish official alerts and update alert status. Alerts are labelled with their audience (default: `All users`).
- Users submit complaints through the maintenance request form and can track their own requests. Maintenance/admin roles manage the work-order workflow; security can review reports under the database policies.
- The Supabase schema includes an alert audit trail recording who published or updated an alert and the status change. Only security/admin roles can read the audit trail.
- The login screen intentionally has no demo bypass. Real login and signup require the Supabase URL/key to be configured in the deployed Vercel project.

After replacing the project files, run the updated `supabase/schema.sql` in the Supabase SQL Editor again. It is designed to be re-runnable and adds the alert audience/audit-trail objects to an existing project. Review any SQL error before proceeding.
