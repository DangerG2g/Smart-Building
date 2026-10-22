# Quick setup checklist

1. Create a Supabase project at https://supabase.com/.
2. Supabase SQL Editor → run `supabase/schema.sql` in full.
3. Copy `.env.example` to `.env.local`; set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project settings. Use the publishable/anon key only, never the service-role secret.
4. Run `npm install` then `npm run dev`.
5. Sign up. All new users are Students by default.
6. Promote verified staff accounts using Supabase SQL Editor, for example:
   `update public.profiles set role = 'maintenance' where id = 'VERIFIED-USER-UUID';`
   Valid roles: `student`, `maintenance`, `security`, `admin`.
7. For Vercel, set the same two environment variables in Project Settings → Environment Variables, then redeploy. Build command `npm run build`; output folder `dist`.

Role changes must be made only by a trusted project owner. Do not let users choose their own role at signup. Read README.md for complete setup and troubleshooting.
