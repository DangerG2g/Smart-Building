# SurakshaHub username login and admin workflow

## What this update changes
- Login and account creation screens ask for a username and password, not an email address.
- Supabase Auth continues to securely hash and verify passwords. The app maps each username to a reserved internal address (`username@login.surakshahub.invalid`) because Supabase Auth does not natively support username-only identities.
- New accounts always start with the basic User role. Selecting Staff or Administrator on signup does **not** grant privileged access; an existing administrator must assign the role in **People & roles**.
- Admins can assign maintenance requests to staff, review requests marked **Awaiting verification**, then approve as **Completed** or return to **In progress**.

## Setup steps
1. In Supabase SQL Editor, run `supabase/schema.sql` if the database is not already set up.
2. Then run `supabase/username-auth-and-admin-workflow.sql`.
3. In Supabase Dashboard, open **Authentication → Providers → Email** and disable **Confirm email**. This is required because the UI does not collect a real email address and the internal address cannot receive mail. Password reset by email is therefore not available in this setup.
4. Keep `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured in Vercel. Never put a service-role key in frontend environment variables.
5. Existing email-based accounts may be backfilled with a username from their old email prefix, but their old Supabase identity still uses its old email. For a clean username login, create a new account using the username screen, or plan a controlled account migration. Do not delete existing accounts with linked maintenance records.
6. The first administrator must be assigned by the project owner in Supabase SQL Editor after creating their account. Replace the username below with the exact username:

```sql
update public.profiles
set role = 'admin'
where username = lower('your_admin_username');
```

Run this bootstrap step only for the trusted first administrator. After that, use the admin **People & roles** screen to assign roles.

## Workflow
- User reports a maintenance problem.
- Admin assigns it to a maintenance or security staff account.
- Staff updates status to **In progress**, then **Awaiting verification** after doing the work.
- Admin inspects the repair and clicks **Verify done** to mark it **Completed**, or **Return to staff** to send it back to **In progress**.

## Important security note
This removes email from the visible login experience, but it does not replace Supabase Auth with an unsafe plaintext SQL password table. Passwords are still verified by Supabase Auth. Usernames are not email addresses and must be unique. New staff/admin signups are not automatically privileged.
