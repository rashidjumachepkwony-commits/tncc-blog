/* Google OAuth callback handling. Externalised so the strict
   Content-Security-Policy does not block inline scripts. */
document.addEventListener('DOMContentLoaded', async () => {
  const card = document.getElementById('authStatusCard');
  if (!card) return;

  const kicker = card.querySelector('.login-kicker');
  const titleNode = card.querySelector('h1');
  const bodyNode = card.querySelector('.auth-status-body');
  const actionsNode = document.getElementById('authStatusActions');
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const client = window.tnccSupabase || (window.TNCC_CONFIG && window.TNCC_CONFIG.supabaseUrl && window.TNCC_CONFIG.supabaseAnonKey && window.supabase
    ? window.supabase.createClient(window.TNCC_CONFIG.supabaseUrl, window.TNCC_CONFIG.supabaseAnonKey)
    : null);

  const render = ({ state = 'ok', title, body, actions = '' }) => {
    card.classList.remove('auth-status-ok', 'auth-status-err');
    card.classList.add(state === 'err' ? 'auth-status-err' : 'auth-status-ok');
    kicker.textContent = state === 'err' ? 'Action needed' : 'Staff access';
    titleNode.textContent = title;
    bodyNode.innerHTML = body;
    actionsNode.innerHTML = actions;
    actionsNode.hidden = !actions;
    const signOutButton = document.getElementById('authSignOutBtn');
    if (signOutButton) signOutButton.addEventListener('click', async () => {
      signOutButton.disabled = true;
      signOutButton.textContent = 'Signing out…';
      try { await client.auth.signOut(); } catch (e) { /* session already gone */ }
      window.location.href = 'login.html';
    });
  };

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  const oauthErrorDescription = params.get('error_description') || params.get('error');

  if (!client) {
    render({
      state: 'err',
      title: 'Supabase is not configured',
      body: '<p>Add the Supabase project URL and anon key to <code>supabase-config.js</code> and redeploy the site before using Google sign-in.</p>',
      actions: '<a class="login-google-button" href="login.html">Back to sign-in</a>'
    });
    return;
  }

  if (oauthError) {
    render({
      state: 'err',
      title: 'Google sign-in could not be completed',
      body: `<p>${escapeHtml(oauthErrorDescription)}</p><div class="auth-status-hint">This happens inside Supabase before this page loads. Ask the developer to confirm this site&#39;s address is authorised under <strong>Authentication → URL Configuration → Redirect URLs</strong>, then try again.</div>`,
      actions: '<a class="login-google-button" href="login.html">Try again</a>'
    });
    return;
  }

  let user = null;
  let getUserError = null;
  try {
    const { data, error } = await client.auth.getUser();
    user = data?.user || null;
    getUserError = error || null;
  } catch (error) { getUserError = error; }

  if (!user) {
    render({
      state: 'err',
      title: 'No active session found',
      body: `<p>We could not find a signed-in session after the redirect${getUserError ? ` — ${escapeHtml(getUserError.message)}` : '.'}</p><div class="auth-status-hint">Check that: this page&#39;s address is listed under <strong>Authentication → URL Configuration → Redirect URLs</strong> in Supabase; the Google provider is enabled; and you completed the Google page instead of cancelling it.</div>`,
      actions: '<a class="login-google-button" href="login.html">Go to sign-in</a>'
    });
    return;
  }

  let role = null;
  try {
    const { data, error } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (error) console.error('profiles lookup failed:', error.message);
    role = data?.role ?? null;
  } catch (error) { console.error(error); }

  if (role === 'admin') {
    render({
      state: 'ok',
      title: 'Welcome back!',
      body: `<p>You&#39;re signed in as <strong>${escapeHtml(user.email || 'staff member')}</strong>. Opening your admin workspace…</p>`,
      actions: '<a class="login-primary-button" href="admin.html">Open admin workspace</a>'
    });
    setTimeout(() => { window.location.replace('admin.html'); }, 1200);
    return;
  }

  if (role === null) {
    render({
      state: 'err',
      title: 'Account created, but profile missing',
      body: `<p>You&#39;re signed in as <strong>${escapeHtml(user.email || 'unrecognised')}</strong>, but the account profile could not be loaded.</p><div class="auth-status-hint">Ask the developer to run <code>supabase-schema.sql</code> in the Supabase SQL editor so new accounts get a <code>profiles</code> row (the <code>handle_new_user</code> trigger).</div>`,
      actions: '<a class="login-google-button" href="index.html">Back to the site</a>'
    });
    return;
  }

  // Reader: a new (or existing) account waiting for developer approval.
  const notifiedFlag = `tncc_google_approval_notified_${user.id}`;
  if (!localStorage.getItem(notifiedFlag)) {
    const notificationEndpoint = window.TNCC_CONFIG?.notificationEndpoint;
    if (notificationEndpoint) {
      fetch(notificationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'registration', payload: { email: user.email, name: user.user_metadata?.full_name || '' } })
      }).catch(() => {});
    }
    localStorage.setItem(notifiedFlag, '1');
  }

  render({
    state: 'ok',
    title: 'Your access request is in review',
    body: `<p>Thanks for signing up as <strong>${escapeHtml(user.email || 'a TNCC supporter')}</strong>. Your account has been created, and the developer has been notified. You&#39;ll be able to use the admin workspace once your access is approved.</p>`,
    actions: '<a class="login-primary-button" href="index.html">Back to the site</a><button class="login-google-button" type="button" id="authSignOutBtn">Sign out</button>'
  });
});
