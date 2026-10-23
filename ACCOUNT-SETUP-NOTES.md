# Account setup notes

- Student/User, Staff, and Administrator portal selections support email/password account creation.
- Institution ID is optional; leave it blank to add it later.
- For security, public signup always creates a `student` role. A staff/admin portal choice is only a request and never grants elevated permissions.
- To approve staff/admin access, verify the person first, then update `public.profiles.role` from the Supabase SQL Editor using that user's Auth UUID.
- Password recovery links must use the deployed Vercel URL in Supabase Authentication → URL Configuration.
- Never put a Supabase service-role/secret key in frontend code or Vercel `VITE_` variables.
