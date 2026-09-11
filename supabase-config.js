/* Public browser configuration only. Never place Stripe or Resend secrets here. */
window.TNCC_CONFIG = {
  supabaseUrl: 'https://eadrlxpgxcgdhftkqwqa.supabase.co',
  supabaseAnonKey: 'sb_publishable_m4cUHyUVJV-WqWn8ot7ATQ_9YD3zDnJ',
  stripeCheckoutEndpoint: 'https://eadrlxpgxcgdhftkqwqa.supabase.co/functions/v1/create-checkout-session',
  notificationEndpoint: 'https://eadrlxpgxcgdhftkqwqa.supabase.co/functions/v1/send-notification',
  utterancesRepo: 'your-github-username/your-comments-repo'
};

window.addEventListener('load', () => {
  const config = window.TNCC_CONFIG || {};
  const hasValidSupabaseConfig = config.supabaseUrl
    && config.supabaseAnonKey
    && !config.supabaseUrl.includes('YOUR-')
    && !config.supabaseAnonKey.includes('YOUR_')
    && window.supabase;

  if (hasValidSupabaseConfig) {
    window.tnccSupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
});
