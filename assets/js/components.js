const TNCC_NAVIGATION = [
  ['Home', 'index.html'],
  ['About', 'about.html'],
  ['Programs', 'programs.html'],
  ['Impact', 'impact.html'],
  ['Stories', 'stories.html'],
  ['Gallery', 'gallery.html'],
  ['Get Involved', 'get-involved.html'],
  ['Donate', 'donate.html'],
  ['Contact', 'contact.html']
];

function tnccCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return path;
}

function tnccHeaderMarkup() {
  const currentPage = tnccCurrentPage();
  const links = TNCC_NAVIGATION.map(([label, href]) => {
    const isActive = currentPage === href || (currentPage === 'story.html' && href === 'stories.html');
    const donate = href === 'donate.html' ? ' tn-nav-donate' : '';
    return `<a href="${href}"${isActive ? ` class="active${donate}" aria-current="page"` : donate}>${label}</a>`;
  }).join('');

  return `
    <header class="site-header">
    <div class="container navbar">
      <a class="brand" href="index.html" aria-label="Teso North Cross Country CBO home">
        <img class="brand-logo" src="logo.jpeg" alt="TNCC logo" width="48" height="48" />
        <span class="brand-copy"><strong>Teso North</strong><small>Cross Country CBO</small></span>
      </a>
      <button class="icon-btn mobile-toggle" type="button" data-nav-toggle aria-label="Open navigation" aria-expanded="false" aria-controls="primary-navigation">
        <span class="menu-icon" aria-hidden="true"></span>
      </button>
      <nav class="site-nav" id="primary-navigation" aria-label="Main navigation">${links}
        <a class="btn btn-secondary btn-small login-link" href="login.html">Login</a>
      </nav>
      <div class="nav-actions">
        <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode">
          <span aria-hidden="true" data-theme-icon>◐</span>
        </button>
        <a class="btn btn-primary btn-small header-cta" href="donate.html">Donate</a>
      </div>
    </div>
    </header>`;
}

function tnccFooterMarkup() {
  return `
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="footer-logo-link" href="index.html" aria-label="TNCC home">
          <img src="logo.jpeg" alt="TNCC logo" width="52" height="52" />
        </a>
        <div>
          <h3>Teso North Cross Country CBO</h3>
          <p>Run. Unite. Transform. A community movement using sport, participation and collective action to build healthier, safer and more connected communities.</p>
        </div>
      </div>
      <div class="footer-column">
        <h4>Explore</h4>
        <a href="about.html">About TNCC</a>
        <a href="programs.html">Programs</a>
        <a href="impact.html">Our impact</a>
        <a href="stories.html">Stories &amp; news</a>
        <a href="gallery.html">Gallery</a>
      </div>
      <div class="footer-column">
        <h4>Take action</h4>
        <a href="get-involved.html">Get involved</a>
        <a href="donate.html">Donate</a>
        <a href="contact.html">Contact us</a>
        <a href="login.html">Staff login</a>
      </div>
      <div class="footer-column footer-contact">
        <h4>Connect</h4>
        <a href="mailto:hello@tncc.org">hello@tncc.org</a>
        <a href="tel:+254182095270">+254 182 095 270</a>
        <p>Teso North, Kenya</p>
        <p class="footer-tagline">Community through sport.</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© <span data-year>2026</span> Teso North Cross Country CBO. All rights reserved.</span>
      <span>Run. Unite. Transform.</span>
    </div>`;
}

function tnccSetTheme(theme) {
  const dark = theme === 'dark';
  document.body.classList.toggle('dark', dark);
  localStorage.setItem('tncc-theme', dark ? 'dark' : 'light');
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    const icon = button.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = dark ? '☀' : '◐';
  });
}

function tnccInitTheme() {
  const saved = localStorage.getItem('tncc-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  tnccSetTheme(saved || (prefersDark ? 'dark' : 'light'));
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
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
}

function tnccInitYear() {
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
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
  tnccInitTheme();
  tnccInitNavigation();
  tnccInitReveal();
  tnccInitYear();
  tnccInitServiceWorker();
}

document.addEventListener('DOMContentLoaded', tnccInitSharedComponents);
