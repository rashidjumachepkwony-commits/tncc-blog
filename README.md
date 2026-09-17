# Teso North Cross Country CBO (TNCC)

Static multi-page website for TNCC — Run. Unite. Transform.

## Pages

- `index.html` — homepage (overview + conversions)
- `about.html`, `programs.html`, `impact.html`
- `stories.html` + `story.html?id=...` (stories load from Supabase `content_items` with a built-in seed fallback)
- `gallery.html` (category filters + keyboard lightbox)
- `get-involved.html` (volunteer form) and `register.html` (event registration with Kenya county/sub-county/ward lookup)
- `donate.html` (M-Pesa Paybill 522522 / Till 8130580 + optional Stripe checkout)
- `contact.html`, `privacy.html`, `404.html`
- `login.html` / `auth-callback.html` / `admin.html` — staff authentication and admin workspace (noindex, not in public navigation)

## Shared components

`assets/js/components.js` injects the header, navigation, footer, theme toggle and small UI widgets on every public page. `assets/css/site.css` is the single design system. `assets/js/app.js` handles stories, gallery, forms and the event registration flow.

## Backend

See `BACKEND_SETUP.md` and `supabase-schema.sql`. Supabase Edge Functions live in `supabase/functions/` (admin + send-notification). Only public (anon) keys belong in browser files; service-role keys stay in Edge Function secrets.

