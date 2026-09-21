/* Marks that JS is running: CSS only hides .reveal elements when this is set,
   so content is always visible if scripts fail to load. */
document.documentElement.classList.add('js');

const TNCC_NAVIGATION = [
  ['Home', 'index.html'],
  ['About', 'about.html'],
  ['Programs', 'programs.html'],
  ['Impact', 'impact.html'],
  ['Stories', 'stories.html'],
  ['Gallery', 'gallery.html'],
  ['Get Involved', 'get-involved.html'],
  ['Teso North Cross Country', 'teso-north-cross-country.html'],
  ['Donate', 'donate.html'],
  ['Contact', 'contact.html'],
  ['Registration lookup', 'lookup.html']
];

/* Pages that should highlight a parent nav item (e.g. story pages highlight Stories). */
const TNCC_ACTIVE_OVERRIDES = {
  'story.html': 'stories.html',
  'register.html': 'get-involved.html'
};

function tnccCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function tnccActiveHref() {
  const currentPage = tnccCurrentPage();
  return TNCC_ACTIVE_OVERRIDES[currentPage] || currentPage;
}

function tnccHeaderMarkup() {
  const activeHref = tnccActiveHref();
  const links = TNCC_NAVIGATION.map(([label, href]) => {
    const isActive = activeHref === href;
    const donate = href === 'donate.html' ? ' tn-nav-donate' : '';
    return `<a href="${href}"${isActive ? ` class="active${donate}" aria-current="page"` : donate}>${label}</a>`;
  }).join('');

  return `
    <a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
    <div class="container navbar">
      <a class="brand" href="index.html" aria-label="Teso North Cross Country CBO home">
        <img class="brand-logo" src="logo.jpeg" alt="TNCC logo" width="48" height="48" />
        <span class="brand-copy"><strong>Teso North</strong><small>Cross Country CBO</small></span>
      </a>
      <button class="icon-btn mobile-toggle" type="button" data-nav-toggle aria-label="Open navigation" aria-expanded="false" aria-controls="primary-navigation">
        <span class="menu-bar"></span>
        <span class="menu-bar"></span>
        <span class="menu-bar"></span>
      </button>
      <nav class="site-nav" id="primary-navigation" aria-label="Main navigation">${links}
        <a class="btn btn-secondary btn-small login-link" href="login.html">Login</a>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode">
          <span aria-hidden="true" data-theme-icon>🌙</span>
        </button>
        <a class="btn btn-primary btn-small header-cta" href="donate.html">Donate</a>
      </div>
    </div>
    </header>
    <div class="scroll-progress" aria-hidden="true"><span data-scroll-progress-bar></span></div>`;
}

function tnccFooterMarkup() {
  return `
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="footer-logo-link" href="index.html" aria-label="TNCC home">
          <img src="logo.jpeg" alt="TNCC logo" width="52" height="52" loading="lazy" />
        </a>
        <div>
          <h3>Teso North Cross Country CBO</h3>
          <p>Run. Unite. Transform. A community movement using sport, participation and collective action to build healthier, safer and more connected communities in Teso North, Kenya.</p>
        </div>
      </div>
      <div class="footer-column footer-links">
        <h4>Explore</h4>
        <a href="about.html">About TNCC</a>
        <a href="programs.html">Programs</a>
        <a href="impact.html">Our impact</a>
        <a href="stories.html">Stories &amp; news</a>
        <a href="gallery.html">Gallery</a>
      </div>
      <div class="footer-column footer-links">
        <h4>Take action</h4>
        <a href="register.html">Register for an event</a>
        <a href="get-involved.html">Get involved</a>
        <a href="donate.html">Donate</a>
        <a href="contact.html">Contact us</a>
      </div>
      <div class="footer-column footer-contact footer-meta">
        <h4>Connect</h4>
        <a href="mailto:info@tesonorthcrosscountry.org">info@tesonorthcrosscountry.org</a>
        <a href="tel:+254182095270">0182 095 270</a>
        <p>Teso North, Busia County, Kenya</p>
        <p class="footer-tagline">Community through sport.</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© <span data-year>2026</span> Teso North Cross Country CBO</span>
      <span class="footer-legal">
        <span aria-hidden="true">Run. Unite. Transform.</span>
        <a href="privacy.html">Privacy</a>
        <a href="privacy.html#terms">Terms</a>
      </span>
    </div>`;
}

function tnccSetTheme(theme) {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark', dark);
  try { localStorage.setItem('tncc-theme', dark ? 'dark' : 'light'); } catch (error) { /* storage unavailable */ }
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    const icon = button.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = dark ? '☀' : '🌙';
  });
}

function tnccInitTheme() {
  let saved = null;
  try { saved = localStorage.getItem('tncc-theme'); } catch (error) { /* ignore */ }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  tnccSetTheme(saved || (prefersDark ? 'dark' : 'light'));
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.dataset.tnccThemeBound = '1';
    button.addEventListener('click', () => tnccSetTheme(document.body.classList.contains('dark') ? 'light' : 'dark'));
  });
}

function tnccInitNavigation() {
  const header = document.querySelector('[data-site-header]');
  const toggle = header?.querySelector('[data-nav-toggle]');
  const nav = header?.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const setOpen = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('nav-open', open);
    if (open) nav.querySelector('a')?.focus();
  };

  toggle.addEventListener('click', event => {
    event.stopPropagation();
    setOpen(!nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('click', event => {
    if (nav.classList.contains('open') && !header.contains(event.target)) setOpen(false);
  });

  document.addEventListener('keydown', event => {
    if (!nav.classList.contains('open')) return;
    if (event.key === 'Escape') { setOpen(false); toggle.focus(); }
    if (event.key === 'Tab') {
      const focusable = [...nav.querySelectorAll('a, button')].filter(element => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}

function tnccInitReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(item => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -24px' });
  items.forEach(item => observer.observe(item));
  // Safety net: never leave content hidden if the observer misfires
  // (slow devices, buried lazy frames, or an interrupted load).
  setTimeout(() => {
    items.forEach(item => item.classList.add('visible'));
    observer.disconnect();
  }, 2500);
}

function tnccInitYear() {
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
}

function tnccInitScrollWidgets() {
  const bar = document.querySelector('[data-scroll-progress-bar]');
  let topButton = document.querySelector('.back-to-top');
  if (!topButton) {
    topButton = document.createElement('button');
    topButton.className = 'back-to-top';
    topButton.type = 'button';
    topButton.setAttribute('aria-label', 'Back to top');
    topButton.textContent = '↑';
    document.body.appendChild(topButton);
  }
  topButton.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    topButton.blur();
  });

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    if (bar) bar.style.width = (ratio * 100).toFixed(2) + '%';
    topButton.classList.toggle('visible', y > 600);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

function tnccInitServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

function tnccInitSharedComponents() {
  document.querySelectorAll('[data-site-header]').forEach(node => { node.innerHTML = tnccHeaderMarkup(); });
  document.querySelectorAll('[data-site-footer]').forEach(node => { node.innerHTML = tnccFooterMarkup(); });
  [tnccInitTheme, tnccInitNavigation, tnccInitReveal, tnccInitYear, tnccInitScrollWidgets, tnccInitServiceWorker].forEach(init => {
    try { init(); } catch (error) { console.error('TNCC init failure:', error); }
  });
}

document.addEventListener('DOMContentLoaded', tnccInitSharedComponents);
