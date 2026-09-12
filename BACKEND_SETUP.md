# TNCC backend setup

The browser app remains deployable as static HTML, while production services are configured through `supabase-config.js`.

## Supabase

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the SQL Editor.
3. Enable Email and Google providers under Authentication > Providers.
4. Put the project URL and public anon key in `supabase-config.js`.
5. Set the production site URL and OAuth redirect URL to the deployed site.
6. Promote the first admin by changing that user's `profiles.role` to `admin` in the dashboard.

### Admin and user access

There is intentionally no default username or password in this project. A shared default credential would expose the admin workspace to anyone who finds the site. Create the first account through the normal login page, then promote it in Supabase:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'your-admin-email@example.com');
```

After the first admin is promoted:

1. A chosen user signs in with email/password or Google on `login.html`.
2. Supabase creates their `profiles` row with the default `reader` role.
3. An existing admin opens **Admin > User access** and changes that user to `admin`.
4. The user signs out and signs in again; the protected admin page then allows access.

Deploy the admin Edge Function after adding the user-management actions in `supabase/functions/admin/index.ts`:

```bash
supabase functions deploy admin
```

Only the Edge Function uses the service-role key. It must never be added to browser files or committed to GitHub.

Only the Supabase anon key belongs in the browser. Never publish a service-role key.

## Stripe and Resend

Use server-side or Supabase Edge Functions for Stripe Checkout and Resend. The browser should call the configured `stripeCheckoutEndpoint`; Stripe secret keys, webhook signing secrets, and Resend API keys must remain in server environment variables.

Recommended environment variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `TNCC_ADMIN_EMAIL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The payment endpoint should create a Checkout Session in KES, insert a pending donation, and return its hosted URL. A Stripe webhook must mark the donation paid before any receipt is trusted. The notification endpoint should send registration, volunteer, contact, and payment emails through Resend after validating input.

## Utterances

Create a public GitHub repository for comments, install the Utterances GitHub App, and set `utterancesRepo` to `owner/repository` in `supabase-config.js`. For private content or moderated comments, use the Supabase comments table instead.

## Production checklist

Replace the placeholder Google Analytics ID, configure a real domain in `sitemap.xml` and metadata, deploy over HTTPS, enable Supabase email confirmation, and test Stripe webhooks in test mode before accepting live payments.
