/* Public browser configuration only. Never place Stripe or Resend secrets here. */
window.TNCC_CONFIG = {
  supabaseUrl: 'https://egbuwozvasromegnpnwu.supabase.co',
  supabaseAnonKey: 'sb_publishable_vvHCLKdR7sULONL1VKa36g_BstzE4bU',
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
