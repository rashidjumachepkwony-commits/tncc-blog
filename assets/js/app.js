const TNCC_STORIES = [
  {
    id: 1,
    tag: 'Community',
    title: 'Running for a stronger, safer community',
    image: '../../hero-event.jpg.jpeg',
    date: 'May 12, 2026',
    author: 'TNCC Team',
    excerpt: 'Every stride brings people together around health, dignity, and shared responsibility for safer communities.',
    body: [
      'Across Teso North, community sport is becoming a powerful platform for connection, participation, and practical action. Each event creates a space where families, youth, leaders, and partners can come together around a common goal.',
      'This work is not just about running. It is about creating safer spaces, strengthening relationships, and proving that collective responsibility can drive positive change. That is why each training session and community gathering brings renewed momentum to local action.',
      'The TNCC story is rooted in the belief that shared effort matters. When communities show up for one another, normal routines can shift and long-term opportunities grow.'
    ]
  },
  {
    id: 2,
    tag: 'Dialogue',
    title: 'Let us talk, listen and act',
    image: '../../community-talk.jpg.jpeg',
    date: 'April 08, 2026',
    author: 'TNCC Team',
    excerpt: 'Listening sessions help communities surface challenges, build trust, and shape practical responses together.',
    body: [
      'Open conversations help people see the issues affecting daily life more clearly. They also help people understand that progress is often built through listening, reflection, and steady action.',
      'TNCC creates spaces where community members can speak honestly about challenges, share experiences, and identify where support is most needed. These conversations inform the way the movement responds and grows.',
      'When communities learn to listen to one another with respect and courage, they become better equipped to act together.'
    ]
  },
  {
    id: 3,
    tag: 'Sport',
    title: 'Every step counts',
    image: '../../runners.jpg.jpeg',
    date: 'March 19, 2026',
    author: 'TNCC Team',
    excerpt: 'Participation is not only about event-day energy; it is about building healthy routines and community confidence.',
    body: [
      'On course, people discover more than physical endurance. They build consistency, confidence, and a stronger sense of belonging. Community events give people an opportunity to work together toward something positive.',
      'Every step counts because participation matters. It creates momentum, motivates others, and reminds the community that progress is possible when people are supported and encouraged.',
      'That is why TNCC continues to center sport as a practical pathway for wellness, unity, and local transformation.'
    ]
  },
  {
    id: 4,
    tag: 'Youth',
    title: 'Making room for the next generation',
    image: '../../community.jpg.jpeg',
    date: 'February 26, 2026',
    author: 'TNCC Team',
    excerpt: 'Young people bring energy and ideas and deserve meaningful opportunities to contribute and lead.',
    body: [
      'The future of strong communities is shaped by the next generation. Youth engagement is at the center of TNCC because young people carry ideas, courage, and possibility.',
      'When mentorship, leadership, and participation are available, youth are more likely to become active contributors to local change. This creates ripple effects across families and wider community systems.',
      'Building those pathways requires intentional support, trusted relationship-building, and opportunities to participate without barriers.'
    ]
  },
  {
    id: 5,
    tag: 'Partnerships',
    title: 'When local partners move together',
    image: '../../partners2.jpg.jpeg',
    date: 'January 15, 2026',
    author: 'TNCC Team',
    excerpt: 'Partnerships help turn local energy into sustainable, community-led action.',
    body: [
      'Community impact grows when people and institutions work together. Local partnerships strengthen planning, broaden reach, and ensure that initiatives remain grounded in community needs.',
      'TNCC values collaboration with families, leaders, and organizations who can contribute time, expertise, and practical support. These relationships create better outcomes for everyone involved.',
      'Working together is not only helpful; it is necessary when the goal is lasting social change.'
    ]
  }
];

const TNCC_GALLERY = [
  { image: '../../hero-event.jpg.jpeg', caption: 'Community gathers for the event' },
  { image: '../../community-talk.jpg.jpeg', caption: 'After the talk, the action begins' },
  { image: '../../runners.jpg.jpeg', caption: 'On the course together' },
  { image: '../../runners (1).jpeg', caption: 'Ready at the starting line' },
  { image: '../../runners (2).jpeg', caption: 'Running towards a shared goal' },
  { image: '../../runners (3).jpeg', caption: 'Community in motion' },
  { image: '../../runners (4).jpeg', caption: 'Race day energy' },
  { image: '../../runners (5).jpeg', caption: 'Focus, purpose and courage' },
  { image: '../../runners (6).jpeg', caption: 'Strength in participation' },
  { image: '../../runners (7).jpeg', caption: 'Young runners leading the way' },
  { image: '../../runners (8).jpeg', caption: 'Together on the course' },
  { image: '../../runners (9).jpeg', caption: 'A shared finish line' }
];

function getSupabaseClient() {
  if (window.tnccSupabase) return window.tnccSupabase;
  if (window.TNCC_CONFIG?.supabaseUrl && window.TNCC_CONFIG?.supabaseAnonKey && window.supabase) {
    window.tnccSupabase = window.supabase.createClient(window.TNCC_CONFIG.supabaseUrl, window.TNCC_CONFIG.supabaseAnonKey);
    return window.tnccSupabase;
  }
  return null;
}

function setPageTheme() {
  const saved = localStorage.getItem('tncc-theme');
  if (saved === 'dark') {
    document.body.classList.add('dark');
  }
}

function updateActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const current = path === '' ? 'index.html' : path;
  document.querySelectorAll('.site-nav a').forEach(link => {
    const href = link.getAttribute('href');
    const match = href && (href === current || href === '/' && current === 'index.html');
    if (match) link.classList.add('active');
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
}

function initThemeToggle() {
  const toggle = document.querySelector('[data-theme-toggle]');
  if (!toggle) return;

  const apply = () => {
    const dark = document.body.classList.contains('dark');
    toggle.textContent = dark ? '☀️' : '🌙';
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('tncc-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    apply();
  });

  apply();
}

function initReveal() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!revealItems.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach(item => observer.observe(item));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

let currentStoryId = null;

async function initStoryPage() {
  const storyList = document.querySelector('[data-story-list]');
  const storyFilter = document.querySelector('[data-story-filter]');
  const storySearch = document.querySelector('[data-story-search]');
  const storyDetail = document.querySelector('[data-story-detail]');
  let stories = TNCC_STORIES;

  const client = getSupabaseClient();
  if (client) {
    const { data: contentItems } = await client.from('content_items').select('*').eq('published', true).order('created_at', { ascending: false });
    if (contentItems?.length) {
      stories = contentItems.map(item => ({
        id: item.id,
        tag: item.category,
        title: item.title,
        image: item.image_url || 'hero-event.jpg.jpeg',
        date: new Date(item.created_at).toLocaleDateString(),
        author: 'TNCC Team',
        excerpt: item.excerpt,
        body: item.body.split('\n').filter(Boolean)
      }));
    }
  }

  if (storyList) {
    const filterValue = storyFilter ? storyFilter.value : 'all';
    const query = storySearch ? storySearch.value.trim().toLowerCase() : '';
    const filtered = stories.filter(story => {
      const matchFilter = filterValue === 'all' || story.tag === filterValue;
      const matchText = !query || `${story.title} ${story.excerpt}`.toLowerCase().includes(query);
      return matchFilter && matchText;
    });

    storyList.innerHTML = filtered.map(story => `
      <article class="story-card reveal">
        <img src="${story.image}" alt="${story.title}" loading="lazy" />
        <div class="content">
          <div class="story-meta">
            <span class="card-tag">${story.tag}</span>
            <span>${story.date}</span>
          </div>
          <h3>${story.title}</h3>
          <p>${story.excerpt}</p>
          <div class="button-row">
            <a class="btn btn-primary btn-small" href="story.html?id=${story.id}">Read story</a>
          </div>
        </div>
      </article>
    `).join('') || '<p class="section-heading"><strong>No stories match your search.</strong></p>';

    initReveal();
  }

  if (storySearch && storyList) {
    storySearch.addEventListener('input', () => initStoryPage());
  }

  if (storyFilter && storyList) {
    storyFilter.addEventListener('change', () => initStoryPage());
  }

  if (storyDetail) {
    const params = new URLSearchParams(window.location.search);
    const storyId = params.get('id') || '1';
    const story = stories.find(item => String(item.id) === String(storyId)) || stories[0];
    currentStoryId = String(story.id);

    storyDetail.innerHTML = `
      <img src="${story.image}" alt="${story.title}" />
      <div class="story-detail-body">
        <div class="story-meta">
          <span class="card-tag">${story.tag}</span>
          <span>${story.date} • ${story.author}</span>
        </div>
        <h1>${story.title}</h1>
        <div class="article">
          ${story.body.map(paragraph => `<p>${paragraph}</p>`).join('')}
        </div>
        <div class="share-row">
          <a class="share-link" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noreferrer">Share on Facebook</a>
          <a class="share-link" href="https://twitter.com/intent/tweet?text=${encodeURIComponent(story.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noreferrer">Share on Twitter</a>
        </div>
        <div class="button-row">
          <a class="btn btn-secondary" href="stories.html">← Back to stories</a>
        </div>
      </div>
    `;

    await renderStoryComments(currentStoryId);
    wireStoryCommentForm(currentStoryId);
  }
}

async function renderStoryComments(storyId) {
  const list = document.querySelector('[data-story-comment-list]');
  const countNode = document.querySelector('[data-story-comment-count]');
  if (!list) return;
  const client = getSupabaseClient();
  if (!client) { list.innerHTML = '<p class="story-comments-empty">Comments are available when the site is connected to Supabase.</p>'; return; }
  try {
    const { data, error } = await client.from('comments').select('*').eq('article_id', String(storyId)).eq('approved', true).order('created_at', { ascending: false });
    if (error) throw error;
    const comments = data || [];
    if (countNode) countNode.textContent = `${comments.length} comment${comments.length === 1 ? '' : 's'}`;
    const formatCommentDate = value => { if (!value) return ''; const date = new Date(value); return isNaN(date) ? '' : date.toLocaleDateString(); };
    list.innerHTML = comments.length
      ? comments.map(comment => `<div class="story-comment"><div class="story-comment-meta"><strong>${escapeHtml(comment.author_name)}</strong><small>${escapeHtml(formatCommentDate(comment.created_at))}</small></div><p>${escapeHtml(comment.body)}</p></div>`).join('')
      : '<p class="story-comments-empty">No comments yet. Be the first to share a thought.</p>';
  } catch (error) {
    console.error(error);
    list.innerHTML = '<p class="story-comments-empty">Comments could not be loaded.</p>';
  }
}

function wireStoryCommentForm(storyId) {
  const input = document.querySelector('[data-story-comment-input]');
  const button = document.querySelector('[data-story-comment-submit]');
  const hint = document.querySelector('[data-story-comment-hint]');
  const loginLink = document.querySelector('[data-story-comment-login]');
  const client = getSupabaseClient();
  const list = document.querySelector('[data-story-comment-list]');
  if (!input || !button || !client) return;

  const refreshSignedInState = async () => {
    const { data: { user } } = await client.auth.getUser();
    const signedIn = Boolean(user);
    if (loginLink) loginLink.hidden = signedIn;
    button.hidden = !signedIn;
    input.disabled = !signedIn;
    if (signedIn && hint) hint.textContent = '';
  };

  refreshSignedInState();

  button.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) { if (hint) hint.textContent = 'Please write a comment first.'; return; }
    const { data: { user } } = await client.auth.getUser();
    if (!user) { if (hint) hint.textContent = 'Sign in to post a comment.'; return; }
    button.disabled = true;
    const { error } = await client.from('comments').insert({ article_id: String(storyId), user_id: user.id, author_name: user.user_metadata?.full_name || user.email, body: text });
    button.disabled = false;
    if (error) { console.error(error); if (hint) hint.textContent = 'Your comment could not be posted.'; return; }
    input.value = '';
    if (hint) hint.textContent = 'Thanks! Your comment has been submitted for review.';
    if (list) list.insertAdjacentHTML('beforeend', `<div class="story-comment"><div class="story-comment-meta"><strong>${escapeHtml(user.user_metadata?.full_name || user.email)}</strong><small>awaiting approval</small></div><p>${escapeHtml(text)}</p></div>`);
  });

  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); button.click(); } });
}

function initGalleryPage() {
  const galleryRoot = document.querySelector('[data-gallery-grid]');
  const modal = document.querySelector('[data-gallery-modal]');
  if (!galleryRoot) return;

  galleryRoot.innerHTML = TNCC_GALLERY.map((item, index) => `
    <button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="Open gallery image: ${item.caption}">
      <img src="${item.image}" alt="${item.caption}" loading="lazy" />
      <div class="gallery-caption">${item.caption}</div>
    </button>
  `).join('');

  const buttons = galleryRoot.querySelectorAll('.gallery-item');
  let currentIndex = 0;

  const openModal = (index) => {
    currentIndex = index;
    const item = TNCC_GALLERY[currentIndex];
    const modalImage = modal.querySelector('img');
    const modalCaption = modal.querySelector('[data-gallery-caption]');
    modalImage.src = item.image;
    modalImage.alt = item.caption;
    modalCaption.textContent = `${item.caption} (${currentIndex + 1} of ${TNCC_GALLERY.length})`;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => openModal(Number(button.dataset.galleryIndex)));
  });

  modal.querySelector('[data-gallery-close]').addEventListener('click', closeModal);
  modal.querySelector('[data-gallery-prev]').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + TNCC_GALLERY.length) % TNCC_GALLERY.length;
    openModal(currentIndex);
  });
  modal.querySelector('[data-gallery-next]').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % TNCC_GALLERY.length;
    openModal(currentIndex);
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') {
      currentIndex = (currentIndex - 1 + TNCC_GALLERY.length) % TNCC_GALLERY.length;
      openModal(currentIndex);
    }
    if (event.key === 'ArrowRight') {
      currentIndex = (currentIndex + 1) % TNCC_GALLERY.length;
      openModal(currentIndex);
    }
  });
}

function initDonationPage() {
  const amountButtons = document.querySelectorAll('[data-amount]');
  const customInput = document.querySelector('[data-custom-amount]');
  const donationForm = document.querySelector('[data-donation-form]');

  if (!amountButtons.length) return;

  amountButtons.forEach(button => {
    button.addEventListener('click', () => {
      amountButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      customInput.value = '';
    });
  });

  donationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const selected = document.querySelector('[data-amount].selected');
    const customValue = Number(customInput.value);
    const total = customValue > 0 ? customValue : selected ? Number(selected.dataset.amount) : 0;

    if (!total || total <= 0) {
      showToast('Please select or enter a valid donation amount.', 'error');
      return;
    }

    const name = document.querySelector('[data-donor-name]')?.value || 'Anonymous donor';
    const email = document.querySelector('[data-donor-email]')?.value || 'supporter@example.com';
    const payload = { amount: total, name, email };
    const client = getSupabaseClient();
    let donationId = null;

    if (client) {
      const { data, error } = await client.from('donations').insert({ donor_name: name, email, amount_kes: total, status: 'pending' }).select('id').single();
      if (error) {
        console.error(error);
        showToast('We could not record your donation. Please try again.', 'error');
        return;
      }
      donationId = data?.id || null;
    }

    const endpoint = window.TNCC_CONFIG?.stripeCheckoutEndpoint || '';
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountKes: total, donorName: name, donorEmail: email, donationId })
      }).then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.url) throw new Error(data.error || 'Checkout unavailable');
        window.location.href = data.url;
      }).catch(error => {
        console.error(error);
        showToast('Checkout is currently unavailable. Please try again shortly.', 'error');
      });
      return;
    }

    console.log('Donation payload:', payload);
    showToast(`Thank you, ${name}. Your pledge of KES ${total} has been noted.`, 'success');
    donationForm.reset();
    amountButtons.forEach(btn => btn.classList.remove('selected'));
  });
}

function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  toast.dataset.type = type;
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove('show'), 3500);
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.querySelector('[data-contact-name]')?.value || 'Guest';
    const email = form.querySelector('input[type="email"]')?.value.trim() || '';
    const message = form.querySelector('textarea')?.value.trim() || '';
    const client = getSupabaseClient();
    if (!client) {
      showToast('Supabase is not configured yet.', 'error');
      return;
    }
    const { error } = await client.from('contact_messages').insert({ name, email, message });
    if (error) {
      console.error(error);
      showToast('Your message could not be sent. Please try again.', 'error');
      return;
    }
    showToast(`Thank you, ${name}. Your message has been received.`, 'success');
    form.reset();
  });
}

function initVolunteerForm() {
  const form = document.querySelector('[data-volunteer-form]');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.querySelector('[data-volunteer-name]')?.value || 'Volunteer';
    const email = form.querySelector('input[type="email"]')?.value.trim() || '';
    const phone = form.querySelector('input[type="tel"]')?.value.trim() || null;
    const role = form.querySelector('select')?.value || 'Other';
    const message = form.querySelector('textarea')?.value.trim() || null;
    const client = getSupabaseClient();
    if (!client) {
      showToast('Supabase is not configured yet.', 'error');
      return;
    }
    const { error } = await client.from('volunteers').insert({ name, email, phone, role, message });
    if (error) {
      console.error(error);
      showToast('Your volunteer interest could not be sent. Please try again.', 'error');
      return;
    }
    showToast(`Thanks, ${name}. Your volunteer interest has been registered.`, 'success');
    form.reset();
  });
}

function initYear() {
  const yearNode = document.querySelector('[data-year]');
  if (yearNode) yearNode.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', () => {
  setPageTheme();
  updateActiveNav();
  initMobileMenu();
  initThemeToggle();
  initReveal();
  initStoryPage();
  initGalleryPage();
  initDonationPage();
  initContactForm();
  initVolunteerForm();
  initYear();
});
