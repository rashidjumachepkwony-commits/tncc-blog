# TNCC admin Edge Function

This function is the secure backend for admin-only operations.

## Environment variables required

Set these in the Supabase function environment:

- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Security rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code or GitHub Pages.
- Only authenticated users with `profiles.role = 'admin'` can access the function.
- All protected admin actions should be handled through this function.
