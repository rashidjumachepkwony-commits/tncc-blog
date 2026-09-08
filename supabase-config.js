/* Public browser configuration only. Never place Stripe or Resend secrets here. */
window.TNCC_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  stripeCheckoutEndpoint: '',
  notificationEndpoint: '',
  utterancesRepo: ''
};

window.addEventListener('load', () => {
  const config = window.TNCC_CONFIG;
  if (config.supabaseUrl && config.supabaseAnonKey && window.supabase) {
    window.tnccSupabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
});
