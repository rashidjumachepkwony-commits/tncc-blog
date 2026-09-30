/* Login page logic. Externalised so the strict Content-Security-Policy
   (script-src 'self' https://cdn.jsdelivr.net) does not block inline scripts. */
document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('tnccLoginForm');
  if (!form) return;

  const googleBtn = document.getElementById('googleLoginBtn');
  const submitButton = form.querySelector('.login-primary-button');
  const submitLabel = form.querySelector('.login-submit-label');
  const passwordInput = document.getElementById('login-password');
  const passwordToggle = document.getElementById('togglePassword');
  const modeToggle = document.getElementById('login-mode-toggle');
  const modeText = document.getElementById('login-switch-text');
  const loginTitle = document.getElementById('login-title');
  const loginDescription = document.getElementById('login-description');
  const loginNotice = document.getElementById('loginNotice');
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let authMode = 'signin';

  const getClient = () => window.tnccSupabase || (window.TNCC_CONFIG && window.supabase ? window.supabase.createClient(window.TNCC_CONFIG.supabaseUrl, window.TNCC_CONFIG.supabaseAnonKey) : null);

  const setLoading = (loading) => {
    submitButton.disabled = loading;
    googleBtn.disabled = loading;
    submitButton.classList.toggle('is-loading', loading);
    submitLabel.textContent = loading
      ? (authMode === 'signup' ? 'Creating account...' : 'Signing in...')
      : (authMode === 'signup' ? 'Create account' : 'Sign in');
  };

  const setAuthMode = (mode) => {
    authMode = mode;
    const signingUp = mode === 'signup';
    loginTitle.textContent = signingUp ? 'Request access' : 'Welcome back';
    loginDescription.textContent = signingUp ? 'Create an account for developer approval.' : 'Sign in to continue to your account.';
    submitLabel.textContent = signingUp ? 'Create account' : 'Sign in';
    modeText.textContent = signingUp ? 'Already registered?' : 'Need an account?';
    modeToggle.textContent = signingUp ? 'Sign in' : 'Create one';
  };

  const showNotice = (message, type = 'info', withSignOut = false) => {
    loginNotice.dataset.type = type;
    loginNotice.innerHTML = message + (withSignOut ? ' <button type="button" data-login-signout>Sign out</button>' : '');
    loginNotice.hidden = false;
  };

  loginNotice.addEventListener('click', async (event) => {
    if (!event.target.matches('[data-login-signout]')) return;
    const client = getClient();
    if (client) await client.auth.signOut().catch(() => {});
    window.location.href = 'login.html';
  });

  const reason = new URLSearchParams(window.location.search).get('reason');
  if (reason === 'not-approved') showNotice('You have a session, but your account has not been approved for admin access yet. A developer will grant access after review.', 'info', true);
  else if (reason === 'session') showNotice('Your session could not be verified. Please sign in again.', 'danger');
  else if (reason === 'config') showNotice('Admin access is unavailable because Supabase is not configured on this site.', 'danger');

  modeToggle.addEventListener('click', () => setAuthMode(authMode === 'signin' ? 'signup' : 'signin'));

  passwordToggle.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    passwordToggle.setAttribute('aria-pressed', String(!showing));
    passwordToggle.textContent = showing ? '◉' : '◌';
  });

  const redirectIfSignedIn = async () => {
    const client = getClient();
    if (!client) return;
    const { data: { user } } = await client.auth.getUser();
    if (!user) return;
    const { data: profile, error: profileError } = await client.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'admin') { window.location.href = 'admin.html'; return; }
    if (profileError || !profile) {
      showNotice(`You're signed in as <strong>${escapeHtml(user.email)}</strong>, but your account profile is missing. Ask the developer to run supabase-schema.sql so profiles are created for new accounts.`, 'danger', true);
      return;
    }
    showNotice(`You're signed in as <strong>${escapeHtml(user.email)}</strong>, but your account has not been approved for admin access yet. The developer will be notified of your request.`, 'info', true);
  };

  await redirectIfSignedIn();
  document.body.classList.remove('login-auth-pending');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const client = getClient();
    if (!client) { showToast('Supabase config is not set. Add your project URL and anon key first.', 'error'); return; }
    setLoading(true);
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const result = authMode === 'signup'
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password });
    const { data, error } = result;
    if (error) { setLoading(false); showToast(error.message, 'error'); return; }
    if (authMode === 'signup') {
      const notificationEndpoint = window.TNCC_CONFIG?.notificationEndpoint;
      if (notificationEndpoint) {
        fetch(notificationEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'registration', payload: { email } }) }).catch(error => console.error('Access notification failed:', error));
      }
      setLoading(false);
      showToast('Account created. The developer will review your access request.', 'success');
      form.reset();
      setAuthMode('signin');
      return;
    }
    if (data.user) {
      const { data: profileData, error: profileError } = await client.from('profiles').select('role').eq('id', data.user.id).single();
      if (profileError || !profileData || profileData.role !== 'admin') {
        setLoading(false);
        showToast('This account is not authorized for admin access.', 'error');
        await client.auth.signOut();
        return;
      }
      window.location.href = 'admin.html';
    } else setLoading(false);
  });

  googleBtn.addEventListener('click', async () => {
    const client = getClient();
    if (!client) { showToast('Supabase config is not set. Add your project URL and anon key first.', 'error'); return; }
    googleBtn.disabled = true;
    googleBtn.classList.add('is-loading');
    const callbackUrl = new URL('auth-callback.html', window.location.href);
    callbackUrl.searchParams.set('next', 'admin.html');
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl.toString() } });
    if (error) {
      googleBtn.disabled = false;
      googleBtn.classList.remove('is-loading');
      showToast(error.message, 'error');
    }
  });
});
