# TNCC send-notification Edge Function (Resend)

Sends `registration | contact | volunteer` emails via Resend to `TNCC_ADMIN_EMAIL`.
Frontend callers: `index.html` (`notifyRemote`) and `login.html` (registration).

## How the key is wired (secure)

- Browser (`supabase-config.js`) contains ONLY public Supabase URL + anon key + function URL.
  NEVER put `RESEND_API_KEY` in any frontend file.
- Edge Function reads `RESEND_API_KEY` from server env: `Deno.env.get("RESEND_API_KEY")`.
  Your provided key was validated against `https://api.resend.com/domains` (200 OK, no domains yet).
- Local dev mirrors cloud secrets via gitignored `.env` at repo root (already created).

## 1. Set secrets in Supabase Cloud (required)

Option A — Dashboard (recommended on Windows, CLI npm wrapper is broken for win32-x64):
1. Go to Supabase Dashboard > your project `eadrlxpgxcgdhftkqwqa` > Project Settings > Edge Functions > Secrets (or Vault / Functions > Secrets).
2. Add:
   - `RESEND_API_KEY` = `<paste-your-Resend-key-here>`
   - `TNCC_ADMIN_EMAIL` = `rashidjumachepkwony@gmail.com`
   - `TNCC_SENDER_EMAIL` = `TNCC website <onboarding@resend.dev>`
3. Save. Redeploy the function (step 2).

Option B — CLI (macOS/Linux or working CLI):
```bash
supabase login
supabase link --project-ref eadrlxpgxcgdhftkqwqa
supabase secrets set RESEND_API_KEY=your-resend-api-key TNCC_ADMIN_EMAIL=rashidjumachepkwony@gmail.com "TNCC_SENDER_EMAIL=TNCC website <onboarding@resend.dev>"
supabase secrets list
```

> Do NOT commit the real key. `.env` is gitignored. Only `.env.example` (placeholder) is committed.

## 2. Deploy

```bash
supabase functions deploy send-notification
```

## 3. Test

```bash
curl.exe -X POST https://eadrlxpgxcgdhftkqwqa.supabase.co/functions/v1/send-notification ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"registration\",\"payload\":{\"email\":\"test@example.com\"}}"
```

Expected: `{"ok":true,"id":"..."}`. If `503 Notification service is not configured`, secrets are missing. If `502`, check Resend dashboard logs.

Frontend sends:
- `{type:"registration", payload:{email}}` (login.html + index.html)
- `{type:"contact", payload:{name,email,message}}` (index.html)
- `{type:"volunteer", payload:{name,email,role,message}}` (index.html)

All three are now handled. Old code only handled `registration` (400 for others) — fixed.

## 4. Resend notes (important)

- Validated: key works, but account has 0 verified domains.
- `onboarding@resend.dev` (test sender) can ONLY send to the Resend account owner's email. Make sure `TNCC_ADMIN_EMAIL` equals your Resend login email, otherwise Resend returns 403.
- For production: Resend Dashboard > Domains > Add domain > verify DNS > then set `TNCC_SENDER_EMAIL` to `TNCC website <no-reply@your-verified-domain.com>` and update secret + redeploy.
- Supabase keys untouched: `supabase-config.js` still uses `sb_publishable_...` anon key only. Service-role key stays server-side in `admin` function only.

## 5. Local dev

```bash
# uses gitignored .env at repo root
supabase functions serve send-notification --env-file .env --no-verify-jwt