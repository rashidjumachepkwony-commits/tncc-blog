/* ============================================================
   TNCC front-end application
   1. Utilities
   2. Seed content (stories + gallery)
   3. Content loading (Supabase content_items + seed fallback)
   4. Stories page
   5. Story article page (share, related, comments)
   6. Gallery page (filters + lightbox)
   7. Homepage previews + impact counters
   8. Event registration (teso-north-cross-country.html)
   9. Registration lookup (lookup.html)
   10. Event registration (register.html)
   11. Forms (contact, volunteer, registration, donation)
   ============================================================ */

/* ---------- 1. Utilities ---------- */

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSupabaseClient() {
  return window.tnccSupabase || null;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

function formatStoryDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date)) return String(value);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ---------- 2. Seed content ---------- */

const TNCC_STORIES = [
  {
    id: 1,
    tag: 'Community',
    title: 'Running for a stronger, safer community',
    image: 'hero-event.jpg.jpeg',
    date: '2026-05-12',
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
    image: 'community-talk.jpg.jpeg',
    date: '2026-04-08',
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
    image: 'runners.jpg.jpeg',
    date: '2026-03-19',
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
    image: 'community.jpg.jpeg',
    date: '2026-02-26',
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
    image: 'partners2.jpg.jpeg',
    date: '2026-01-15',
    author: 'TNCC Team',
    excerpt: 'Strong community events are built through shared responsibility between partners, leaders, and volunteers.',
    body: [
      'Strong community events are built through shared responsibility. Partners contribute time, resources, and local knowledge to make participation possible for everyone.',
      'TNCC works alongside local leaders, community organizations, and supporters who believe that healthier, safer communities are worth investing in.',
      'When local partners move together, the impact reaches further than any single event: trust grows, opportunities multiply, and the movement becomes part of everyday community life.'
    ]
  }
];

const TNCC_GALLERY = [
  { image: 'hero-event.jpg.jpeg', caption: 'Community gathers for the event', category: 'Events' },
  { image: 'community-talk.jpg.jpeg', caption: 'Let us talk', category: 'Community' },
  { image: 'runners.jpg.jpeg', caption: 'On the course', category: 'Events' },
  { image: 'runners (1).jpeg', caption: 'Ready for the starting line', category: 'Events' },
  { image: 'runners (2).jpeg', caption: 'Running together', category: 'Events' },
  { image: 'runners (3).jpeg', caption: 'Community in motion', category: 'Community' },
  { image: 'runners (4).jpeg', caption: 'Race day energy', category: 'Events' },
  { image: 'runners (5).jpeg', caption: 'Every step counts', category: 'Events' },
  { image: 'runners (6).jpeg', caption: 'Strength in participation', category: 'Events' },
  { image: 'runners (7).jpeg', caption: 'Young runners leading the way', category: 'Youth' },
  { image: 'runners (8).jpeg', caption: 'Together on the course', category: 'Events' },
  { image: 'runners (9).jpeg', caption: 'A shared finish line', category: 'Events' },
  { image: 'runners (10).jpeg', caption: 'Celebrating the movement', category: 'Community' },
  { image: 'runners (11).jpeg', caption: 'The joy of running', category: 'Youth' },
  { image: 'runners (12).jpeg', caption: 'Focused and fearless', category: 'Events' },
  { image: 'runners (13).jpeg', caption: 'Support & solidarity', category: 'Community' },
  { image: 'run.jpg.jpeg', caption: 'Run. Unite. Transform.', category: 'Events' },
  { image: 'running.jpg.jpeg', caption: 'On the road together', category: 'Events' },
  { image: 'community.jpg.jpeg', caption: 'Building community through sport', category: 'Community' },
  { image: 'partners.jpg.jpeg', caption: 'Partners making it possible', category: 'Partnerships' },
  { image: 'partners2.jpg.jpeg', caption: 'Working together for impact', category: 'Partnerships' },
  { image: 'images.jpg.jpeg', caption: 'Moments that connect us', category: 'Community' },
  { image: 'images2.jpg.jpeg', caption: 'Participation for everyone', category: 'Community' },
  { image: 'images3.jpg.jpeg', caption: 'A movement with purpose', category: 'Events' }
];

/* ---------- 3. Content loading ---------- */

function normalizeContentItem(row) {
  const bodyText = String(row.body || '').trim();
  return {
    id: 'db-' + row.id,
    tag: row.category || 'Community',
    title: row.title || 'Untitled story',
    image: row.image_url || 'hero-event.jpg.jpeg',
    date: row.created_at || row.updated_at || null,
    author: 'TNCC Team',
    excerpt: row.excerpt || (bodyText ? bodyText.slice(0, 180) : ''),
    body: bodyText ? bodyText.split(/\n+/).map(p => p.trim()).filter(Boolean) : []
  };
}

let contentStoriesPromise = null;

function loadContentStories() {
  if (contentStoriesPromise) return contentStoriesPromise;
  contentStoriesPromise = (async () => {
    let remote = [];
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('content_items')
          .select('id, slug, title, category, excerpt, body, image_url, created_at, updated_at')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(24);
        if (!error && Array.isArray(data)) remote = data.map(normalizeContentItem);
        else if (error) console.warn('Story loading failed, using seed content.', error.message);
      } catch (error) {
        console.warn('Story loading failed, using seed content.', error);
      }
    }
    const seen = new Set(remote.map(story => story.title.trim().toLowerCase()));
    const seeds = TNCC_STORIES.filter(story => !seen.has(story.title.trim().toLowerCase()));
    return remote.concat(seeds);
  })();
  return contentStoriesPromise;
}

function storyHref(story) {
  return 'story.html?id=' + encodeURIComponent(story.id);
}

function storyMatchesQuery(story, query, category) {
  const haystack = ((story.title || '') + ' ' + (story.excerpt || '') + ' ' + (story.body || []).join(' ')).toLowerCase();
  const matchesQuery = !query || haystack.includes(query);
  const matchesCategory = category === 'all' || story.tag === category;
  return matchesQuery && matchesCategory;
}

function storyCard(story) {
  const image = escapeHtml(story.image || 'hero-event.jpg.jpeg');
  return `<article class="story-card">
    <img src="${image}" alt="${escapeHtml(story.title)}" loading="lazy" width="400" height="250" />
    <div class="content">
      <div class="story-meta">
        <span class="card-tag">${escapeHtml(story.tag || 'Community')}</span>
        <span>${escapeHtml(formatStoryDate(story.date))}</span>
      </div>
      <h3>${escapeHtml(story.title)}</h3>
      <p>${escapeHtml(story.excerpt || '')}</p>
      <a class="btn btn-secondary btn-small" href="${storyHref(story)}">Read story</a>
    </div>
  </article>`;
}

/* ---------- 4. Stories page ---------- */

async function initStoryPage() {
  const storyList = document.querySelector('[data-story-list]');
  if (!storyList) return;
  const search = document.querySelector('[data-story-search]');
  const filter = document.querySelector('[data-story-filter]');
  const featuredWrap = document.querySelector('[data-story-featured]');
  const countNode = document.querySelector('[data-story-count]');
  const loadMoreWrap = document.querySelector('[data-load-more]');

  const stories = await loadContentStories();
  const PAGE_SIZE = 6;
  let visibleCount = PAGE_SIZE;

  if (filter) {
    const categories = [...new Set(stories.map(story => story.tag).filter(Boolean))];
    filter.innerHTML = '<option value="all">All categories</option>' +
      categories.map(category => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  }

  function featuredMarkup(story) {
    return `<article class="story-featured reveal visible">
      <img src="${escapeHtml(story.image || 'hero-event.jpg.jpeg')}" alt="${escapeHtml(story.title)}" width="640" height="420" />
      <div class="content">
        <div class="story-meta">
          <span class="card-tag">${escapeHtml(story.tag || 'Community')}</span>
          <span>${escapeHtml(formatStoryDate(story.date))}</span>
        </div>
        <h2>${escapeHtml(story.title)}</h2>
        <p>${escapeHtml(story.excerpt || '')}</p>
        <div class="button-row">
          <a class="btn btn-primary" href="${storyHref(story)}">Read featured story</a>
        </div>
      </div>
    </article>`;
  }

  function render() {
    const query = (search?.value || '').trim().toLowerCase();
    const category = filter?.value || 'all';
    const filtered = stories.filter(story => storyMatchesQuery(story, query, category));

    if (!filtered.length) {
      if (featuredWrap) featuredWrap.innerHTML = '';
      storyList.innerHTML = '<div class="story-empty"><strong>No stories match your search.</strong><br />Try a different keyword or category.</div>';
      if (countNode) countNode.textContent = '';
      if (loadMoreWrap) loadMoreWrap.hidden = true;
      return;
    }

    const withFeatured = featuredWrap && !query && category === 'all';
    const remainder = withFeatured ? filtered.slice(1) : filtered;
    const visible = remainder.slice(0, visibleCount);

    if (featuredWrap) featuredWrap.innerHTML = withFeatured ? featuredMarkup(filtered[0]) : '';
    storyList.innerHTML = visible.map(storyCard).join('');
    if (countNode) countNode.textContent = `Showing ${remainder.length ? visible.length : 0} of ${remainder.length} stories`;

    if (loadMoreWrap) {
      loadMoreWrap.hidden = remainder.length <= visibleCount;
      const button = loadMoreWrap.querySelector('button');
      if (button) button.textContent = `Load more stories (${remainder.length - visible.length} remaining)`;
    }
  }

  search?.addEventListener('input', () => { visibleCount = PAGE_SIZE; render(); });
  filter?.addEventListener('change', () => { visibleCount = PAGE_SIZE; render(); });
  loadMoreWrap?.querySelector('button')?.addEventListener('click', () => { visibleCount += PAGE_SIZE; render(); });

  render();
}

/* ---------- 5. Story article page ---------- */

async function initStoryArticle() {
  const detail = document.querySelector('[data-story-detail]');
  if (!detail) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const stories = await loadContentStories();
  const story = stories.find(entry => String(entry.id) === String(id)) || stories[0];

  if (!story) {
    detail.innerHTML = '<div class="story-empty"><strong>Story not found.</strong><br /><a href="stories.html">Back to all stories</a></div>';
    return;
  }

  document.title = `${story.title} | Teso North Cross Country CBO`;
  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta && story.excerpt) descriptionMeta.setAttribute('content', story.excerpt);

  const bodyParagraphs = (story.body && story.body.length)
    ? story.body.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')
    : `<p>${escapeHtml(story.excerpt || '')}</p>`;

  detail.innerHTML = `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span>
      <a href="stories.html">Stories</a><span aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(story.title)}</span>
    </nav>
    <img src="${escapeHtml(story.image || 'hero-event.jpg.jpeg')}" alt="${escapeHtml(story.title)}" width="1080" height="560" />
    <div class="story-detail-body">
      <div class="story-meta">
        <span class="card-tag">${escapeHtml(story.tag || 'Community')}</span>
        <span>${escapeHtml(formatStoryDate(story.date))}</span>
        <span>${escapeHtml(story.author || 'TNCC Team')}</span>
      </div>
      <h1>${escapeHtml(story.title)}</h1>
      <div class="article">${bodyParagraphs}</div>
      <div class="share-row">
        <span>Share this story</span>
        <a class="share-btn" data-share="whatsapp" href="#" target="_blank" rel="noopener">WhatsApp</a>
        <a class="share-btn" data-share="facebook" href="#" target="_blank" rel="noopener">Facebook</a>
        <a class="share-btn" data-share="x" href="#" target="_blank" rel="noopener">X</a>
        <button class="share-btn" type="button" data-share="copy">Copy link</button>
      </div>
    </div>`;

  const pageUrl = window.location.href;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(story.title);
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
  };
  detail.querySelectorAll('[data-share]').forEach(node => {
    const key = node.dataset.share;
    if (key === 'copy') {
      node.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pageUrl);
          showToast('Link copied to clipboard.');
        } catch (error) {
          showToast('Could not copy the link.', 'error');
        }
      });
    } else if (shareLinks[key]) {
      node.setAttribute('href', shareLinks[key]);
    }
  });

  const jsonld = document.createElement('script');
  jsonld.type = 'application/ld+json';
  jsonld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt || '',
    image: new URL(story.image || 'hero-event.jpg.jpeg', window.location.href).toString(),
    datePublished: story.date || undefined,
    author: { '@type': 'Organization', name: 'Teso North Cross Country CBO' },
    publisher: { '@type': 'Organization', name: 'Teso North Cross Country CBO' }
  });
  document.head.appendChild(jsonld);

  const related = stories.filter(entry => entry !== story && entry.tag === story.tag).slice(0, 3);
  const relatedWrap = document.querySelector('[data-related-list]');
  if (relatedWrap) {
    if (related.length) {
      relatedWrap.innerHTML = related.map(storyCard).join('');
      relatedWrap.previousElementSibling?.removeAttribute('hidden');
    } else {
      relatedWrap.closest('section')?.setAttribute('hidden', '');
    }
  }

  initStoryComments(story);
}

async function initStoryComments(story) {
  const section = document.querySelector('[data-story-comments]');
  if (!section) return;
  const list = section.querySelector('[data-story-comment-list]');
  const countNode = section.querySelector('[data-story-comment-count]');
  const input = section.querySelector('[data-story-comment-input]');
  const submit = section.querySelector('[data-story-comment-submit]');
  const loginLink = section.querySelector('[data-story-comment-login]');
  const hint = section.querySelector('[data-story-comment-hint]');
  const client = getSupabaseClient();

  async function loadComments() {
    if (!client) {
      if (hint) hint.textContent = 'Comments are unavailable right now.';
      return;
    }
    const { data, error } = await client
      .from('comments')
      .select('id, author_name, body, created_at')
      .eq('article_id', String(story.id))
      .eq('approved', true)
      .order('created_at', { ascending: false });
    if (error) { console.warn(error); return; }
    const comments = data || [];
    if (countNode) countNode.textContent = comments.length ? `${comments.length} comment${comments.length === 1 ? '' : 's'}` : '';
    list.innerHTML = comments.length
      ? comments.map(comment => `
        <div class="story-comment">
          <strong>${escapeHtml(comment.author_name || 'Community member')}</strong>
          <time datetime="${escapeHtml(comment.created_at)}">${escapeHtml(formatStoryDate(comment.created_at))}</time>
          <p>${escapeHtml(comment.body)}</p>
        </div>`).join('')
      : '<p class="story-comments-empty">No comments yet. Be the first to share a thought.</p>';
  }

  let user = null;
  if (client) {
    try {
      const result = await client.auth.getUser();
      user = result?.data?.user || null;
    } catch (error) {
      console.warn('Auth check failed.', error);
    }
  }
  if (loginLink && user) loginLink.hidden = true;
  if (!user && hint) hint.textContent = 'Sign in with your TNCC account to post a comment. Comments appear after moderation.';

  submit?.addEventListener('click', async () => {
    if (!client || !user) { window.location.href = 'login.html'; return; }
    const body = (input?.value || '').trim();
    if (!body) { showToast('Write a comment first.', 'error'); return; }
    submit.disabled = true;
    const authorName = user.user_metadata?.full_name || user.email || 'Community member';
    const { error } = await client.from('comments').insert({
      article_id: String(story.id),
      user_id: user.id,
      author_name: authorName,
      body: body.slice(0, 2000)
    });
    submit.disabled = false;
    if (error) { console.error(error); showToast('Your comment could not be posted.', 'error'); return; }
    if (input) input.value = '';
    if (hint) hint.textContent = 'Thank you! Your comment will appear once it has been approved.';
    showToast('Comment submitted for review.');
  });

  await loadComments();
}

/* ---------- 6. Gallery page ---------- */

function initGalleryPage() {
  const grid = document.querySelector('[data-gallery-grid]');
  if (!grid) return;
  const filtersWrap = document.querySelector('[data-gallery-filters]');
  const modal = document.querySelector('[data-gallery-modal]');
  const modalImage = modal?.querySelector('img');
  const modalCaption = modal?.querySelector('[data-gallery-caption]');
  const closeButton = modal?.querySelector('[data-gallery-close]');
  const prevButton = modal?.querySelector('[data-gallery-prev]');
  const nextButton = modal?.querySelector('[data-gallery-next]');
  let activeItems = TNCC_GALLERY.slice();
  let currentIndex = 0;
  let lastFocused = null;

  function renderGrid() {
    grid.innerHTML = activeItems.map((item, index) => `
      <button class="gallery-item" type="button" data-index="${index}" aria-label="Open photo: ${escapeHtml(item.caption)}">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" loading="lazy" width="400" height="300" />
        <div class="gallery-caption">${escapeHtml(item.caption)}</div>
      </button>`).join('');
  }

  function openModal(index) {
    if (!modal || !activeItems.length) return;
    currentIndex = (index + activeItems.length) % activeItems.length;
    const item = activeItems[currentIndex];
    if (modalImage) {
      modalImage.src = item.image;
      modalImage.alt = item.caption;
    }
    if (modalCaption) modalCaption.textContent = item.caption;
    lastFocused = document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton?.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  }

  function step(direction) {
    openModal(currentIndex + direction);
  }

  grid.addEventListener('click', event => {
    const item = event.target.closest('.gallery-item');
    if (!item) return;
    openModal(Number(item.dataset.index));
  });

  filtersWrap?.addEventListener('click', event => {
    const chip = event.target.closest('.chip');
    if (!chip) return;
    filtersWrap.querySelectorAll('.chip').forEach(node => node.classList.remove('active'));
    chip.classList.add('active');
    const category = chip.dataset.category;
    activeItems = category === 'all' ? TNCC_GALLERY.slice() : TNCC_GALLERY.filter(item => item.category === category);
    renderGrid();
  });

  closeButton?.addEventListener('click', closeModal);
  prevButton?.addEventListener('click', () => step(-1));
  nextButton?.addEventListener('click', () => step(1));
  modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', event => {
    if (!modal?.classList.contains('open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });

  if (filtersWrap) {
    const categories = ['all', ...new Set(TNCC_GALLERY.map(item => item.category))];
    filtersWrap.innerHTML = categories.map((category, index) => `
      <button class="chip${index === 0 ? ' active' : ''}" type="button" data-category="${escapeHtml(category)}">
        ${category === 'all' ? 'All photos' : escapeHtml(category)}
      </button>`).join('');
  }

  renderGrid();
}

/* ---------- 7. Homepage previews + impact counters ---------- */

async function initHomePreviews() {
  const previewList = document.querySelector('[data-home-stories]');
  if (previewList) {
    const stories = await loadContentStories();
    previewList.innerHTML = stories.slice(0, 3).map(storyCard).join('');
  }

  const galleryStrip = document.querySelector('[data-home-gallery]');
  if (galleryStrip) {
    galleryStrip.innerHTML = TNCC_GALLERY.slice(0, 6).map(item => `
      <a href="gallery.html" aria-label="View gallery photo: ${escapeHtml(item.caption)}">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.caption)}" loading="lazy" width="300" height="300" />
      </a>`).join('');
  }
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const animate = node => {
    const target = Number(node.dataset.counter || '0');
    const prefix = node.dataset.prefix || '';
    const suffix = node.dataset.suffix || '';
    if (prefersReducedMotion() || !window.IntersectionObserver) {
      node.textContent = prefix + target.toLocaleString('en-US') + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const frame = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = prefix + Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  counters.forEach(node => observer.observe(node));
}

/* ---------- 8. Event registration (teso-north-cross-country.html) ---------- */

const TNCC_RUN_CATEGORIES = [
  { value: '5-7-years', label: '5–7 years', distance: '500m', fee: 0, ageMin: 5, ageMax: 7, requiresGender: false },
  { value: '8-10-years', label: '8–10 years', distance: '1km', fee: 0, ageMin: 8, ageMax: 10, requiresGender: false },
  { value: '11-13-years', label: '11–13 years', distance: '2km', fee: 0, ageMin: 11, ageMax: 13, requiresGender: false },
  { value: '14-15-years', label: '14–15 years', distance: '4km', fee: 0, ageMin: 14, ageMax: 15, requiresGender: false },
  { value: 'u20-women', label: 'U20 Women', distance: '6km', fee: 0, ageMax: 19, requiresGender: 'female' },
  { value: 'u20-men', label: 'U20 Men', distance: '8km', fee: 0, ageMax: 19, requiresGender: 'male' },
  { value: 'elite', label: 'Elite', distance: '10km', fee: 0, ageMin: null, ageMax: null, requiresGender: false }
];

const TNCC_RUN_CONFIG = {
  eventName: 'The Teso North Cross Country',
  organizer: 'Teso North Cross Country CBO',
  location: 'Eldoret, Kenya',
  eventDate: '2026-11-21',
  deadline: new Date('2026-11-15T23:59:59+03:00'),
  eventId: 'teso-north-cross-country',
  fee: 0,
  currency: 'KES'
};

function isRegistrationOpen() {
  return new Date() < TNCC_RUN_CONFIG.deadline;
}

function findCategory(value) {
  return TNCC_RUN_CATEGORIES.find(category => category.value === value);
}

function validateAgeForCategory(age, category) {
  if (category.ageMin !== null && age < category.ageMin) return false;
  if (category.ageMax !== null && age > category.ageMax) return false;
  return true;
}

async function initTesoNorthCrossCountryForm() {
  const form = document.querySelector('[data-teso-north-cross-country-form]');
  if (!form) return;

  const deadlineBanner = document.getElementById('eventDeadlineBanner');
  const eventSection = document.getElementById('eventRegistrationSection');
  const confirmationSection = document.getElementById('eventConfirmation');
  const countySelect = form.querySelector('[data-reg-county]');
  const subCountySelect = form.querySelector('[data-reg-sub-county]');
  const wardSelect = form.querySelector('[data-reg-ward]');
  const status = form.querySelector('[data-reg-location-status]');
  const ageError = form.querySelector('[data-age-error]');
  const categoryError = form.querySelector('[data-category-error]');
  const genderField = form.querySelector('[data-reg-gender]').closest('.field');
  const minorFields = document.getElementById('tnccMinorFields');
  const guardianInput = form.querySelector('[data-reg-guardian]');
  const guardianPhoneInput = form.querySelector('[data-reg-guardian-phone]');
  const feeDisplay = form.querySelector('[data-reg-fee-display]');
  const paymentMethodDisplay = form.querySelector('[data-reg-payment-method]');
  const mpesaDetails = form.querySelector('[data-reg-mpesa-details]');
  const submitBtn = form.querySelector('[data-reg-submit-btn]');
  const categoryInputs = form.querySelectorAll('[data-reg-category]');
  const categoryCountSpans = {};

  async function loadCategoryCounts() {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      categoryInputs.forEach(input => {
        const categoryValue = input.value;
        const countSpan = input.closest('.race-category-card').querySelector('.race-cat-count');
        if (countSpan) categoryCountSpans[categoryValue] = countSpan;
      });
      const { data, error } = await client
        .from('submissions')
        .select('selected_category', { count: 'exact' })
        .eq('event_id', TNCC_RUN_CONFIG.eventId)
        .not('selected_category', 'is', null);
      if (error) return;
      const countsByCategory = {};
      data.forEach(row => {
        const cat = TNCC_RUN_CATEGORIES.find(c => c.label === row.selected_category);
        if (cat) countsByCategory[cat.value] = (countsByCategory[cat.value] || 0) + 1;
      });
      Object.entries(countsByCategory).forEach(([catValue, count]) => {
        if (categoryCountSpans[catValue]) {
          categoryCountSpans[catValue].textContent = `${count} registered`;
          categoryCountSpans[catValue].style.display = 'inline-block';
        }
      });
    } catch (error) { /* silent fail */ }
  }

  let locations = {};

  if (!isRegistrationOpen()) {
    if (deadlineBanner) deadlineBanner.hidden = false;
    if (eventSection) eventSection.hidden = true;
    return;
  }

  if (deadlineBanner) deadlineBanner.hidden = true;
  if (eventSection) eventSection.hidden = false;

  setSelectOptions(countySelect, KENYA_COUNTIES.slice().sort((a, b) => a.localeCompare(b)), 'Select county', false);

  function populateSubCounties() {
    const county = countySelect.value;
    const subCounties = Object.keys(locations[county]?.Constituencies || {});
    setSelectOptions(subCountySelect, subCounties, county ? 'Select sub-county' : 'Select county first', !county || !subCounties.length);
    setSelectOptions(wardSelect, [], 'Select sub-county first', true);
  }

  function populateWards() {
    const county = countySelect.value;
    const subCounty = subCountySelect.value;
    const wards = locations[county]?.Constituencies?.[subCounty]?.Ward || [];
    setSelectOptions(wardSelect, wards, subCounty ? 'Select ward' : 'Select sub-county first', !subCounty || !wards.length);
  }

  countySelect?.addEventListener('change', populateSubCounties);
  subCountySelect?.addEventListener('change', populateWards);

  try {
    const urls = [
      'https://cdn.jsdelivr.net/gh/mbithuka/Counties@main/restructured_data.json',
      'https://raw.githubusercontent.com/mbithuka/Counties/main/restructured_data.json'
    ];
    let response = null;
    for (const url of urls) {
      try {
        const candidate = await fetch(url);
        if (candidate.ok) { response = candidate; break; }
      } catch (error) { /* try next */ }
    }
    if (!response) throw new Error('Location data unavailable');
    locations = await response.json();
    const remoteCounties = Object.keys(locations);
    if (remoteCounties.length) {
      setSelectOptions(countySelect, remoteCounties.sort((a, b) => a.localeCompare(b)), 'Select county', false);
    }
    if (status) status.textContent = 'Select your county, then sub-county and ward.';
  } catch (error) {
    locations = KENYA_FALLBACK_LOCATIONS;
    if (status) status.textContent = 'Select your county, sub-county and ward. Busia locations are available offline.';
  }
  populateSubCounties();
  loadCategoryCounts();

  categoryInputs.forEach(input => {
    input.addEventListener('change', () => {
      const selectedCategory = findCategory(input.value);
      if (!selectedCategory) return;

      if (feeDisplay) feeDisplay.textContent = selectedCategory.fee > 0
        ? `${TNCC_RUN_CONFIG.currency} ${selectedCategory.fee.toLocaleString('en-US')}`
        : 'FREE';

      const genderRequired = selectedCategory.requiresGender;
      if (genderField) {
        const genderLabel = genderField.querySelector('label');
        genderField.style.display = genderRequired ? 'block' : 'none';
        if (genderRequired && genderLabel) {
          genderLabel.textContent = genderRequired === 'female'
            ? 'Gender * (U20 Women)'
            : 'Gender * (U20 Men)';
        }
      }

      if (categoryError) categoryError.textContent = '';
    });
  });

  function updateGuardianVisibility() {
    const age = Number(form.querySelector('[data-reg-age]')?.value.trim() || 0);
    const show = age > 0 && age < 18;
    if (minorFields) minorFields.hidden = !show;
    if (guardianInput) guardianInput.required = show;
    if (guardianPhoneInput) guardianPhoneInput.required = show;
  }

  const ageInput = form.querySelector('[data-reg-age]');
  ageInput?.addEventListener('input', updateGuardianVisibility);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!isRegistrationOpen()) {
      showToast('Registration is closed. The deadline was 15 November 2026 at 23:59 Kenya time.', 'error');
      return;
    }

    const name = form.querySelector('[data-reg-name]')?.value.trim() || '';
    const email = form.querySelector('[data-reg-email]')?.value.trim() || '';
    const phone = form.querySelector('[data-reg-phone]')?.value.trim() || '';
    const age = Number(form.querySelector('[data-reg-age]')?.value.trim() || 0);
    const gender = form.querySelector('[data-reg-gender]')?.value || '';
    const county = countySelect?.value || '';
    const subCounty = subCountySelect?.value || '';
    const ward = wardSelect?.value || '';
    const guardian = form.querySelector('[data-reg-guardian]')?.value.trim() || '';
    const guardianPhone = form.querySelector('[data-reg-guardian-phone]')?.value.trim() || '';
    const message = form.querySelector('[data-reg-message]')?.value.trim() || '';
    const selectedCategoryValue = form.querySelector('[data-reg-category]:checked')?.value || '';
    const selectedCategory = findCategory(selectedCategoryValue);

    let isValid = true;

    if (!name || !email || !phone || !age || !county || !subCounty || !ward || !selectedCategoryValue) {
      showToast('Please complete all required fields, including your race category.', 'error');
      return;
    }

    if (!selectedCategory) {
      if (categoryError) categoryError.textContent = 'Please select a valid race category.';
      isValid = false;
    }

    if (age < 5 || age > 120) {
      if (ageError) ageError.textContent = 'Please enter a valid age between 5 and 120.';
      isValid = false;
    } else {
      if (!validateAgeForCategory(age, selectedCategory)) {
        const range = selectedCategory.ageMin !== null && selectedCategory.ageMax !== null
          ? `ages ${selectedCategory.ageMin}-${selectedCategory.ageMax}`
          : selectedCategory.ageMax !== null
            ? `under ${selectedCategory.ageMax + 1}`
            : selectedCategory.ageMin !== null
              ? `18 and above`
              : 'eligible';
        if (ageError) ageError.textContent = `Selected category requires ${range}. Your age (${age}) does not qualify.`;
        isValid = false;
        if (ageInput) ageInput.focus();
      } else {
        if (ageError) ageError.textContent = '';
      }
    }

    if (selectedCategory.requiresGender && !gender) {
      showToast(`Gender is required for the ${selectedCategory.label} category.`, 'error');
      isValid = false;
    }

    if (age < 18 && (!guardian || !guardianPhone)) {
      showToast('Please provide a parent/guardian name and phone for participants under 18.', 'error');
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    const payload = {
      name,
      email,
      phone,
      age,
      gender: gender || null,
      county,
      sub_county: subCounty,
      ward,
      guardian: (guardian || null),
      guardian_phone: guardianPhone || null,
      interest: 'event-participant',
      message: message || null,
      race_categories: [selectedCategory.label],
      selected_category: selectedCategory.label,
      race_distance: selectedCategory.distance,
      event_id: TNCC_RUN_CONFIG.eventId,
      event_name: TNCC_RUN_CONFIG.eventName,
      event_date: TNCC_RUN_CONFIG.eventDate,
      registration_fee: TNCC_RUN_CONFIG.fee,
      payment_method: 'mpesa',
      payment_status: 'pending'
    };

    const client = getSupabaseClient();
    if (!client) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register for The Teso North Cross Country';
      showToast('Registration is not connected yet. Please contact us directly.', 'error');
      return;
    }

    const registrationUuid = crypto.randomUUID();
    payload.id = registrationUuid;
    const { error } = await client.from('submissions').insert(payload);

    submitBtn.disabled = false;
    submitBtn.textContent = 'Register for The Teso North Cross Country';

    if (error) {
      console.error(error);
      showToast('Your registration could not be submitted. Please try again.', 'error');
      return;
    }

    const registrationId = 'TNCC-CR-' + registrationUuid.substring(0, 8).toUpperCase();

    const endpoint = window.TNCC_CONFIG?.notificationEndpoint;
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'event-registration',
          payload: {
            name,
            participant_email: email,
            event_name: TNCC_RUN_CONFIG.eventName,
            event_id: TNCC_RUN_CONFIG.eventId,
            selected_category: selectedCategory.label,
            race_distance: selectedCategory.distance,
            registration_fee: TNCC_RUN_CONFIG.fee,
            registration_id: registrationId
          }
        })
      }).catch(() => {});
    }

    if (eventSection) eventSection.hidden = true;
    if (deadlineBanner) deadlineBanner.hidden = true;

    const confirmName = document.querySelector('[data-confirm-name]');
    const confirmCategory = document.querySelector('[data-confirm-category]');
    const confirmDistance = document.querySelector('[data-confirm-distance]');
    const confirmId = document.querySelector('[data-confirm-id]');
    if (confirmName) confirmName.textContent = name;
    if (confirmCategory) confirmCategory.textContent = selectedCategory.label;
    if (confirmDistance) confirmDistance.textContent = selectedCategory.distance;
    if (confirmId) confirmId.textContent = registrationId;
    const provisionalBib = String(Number(registrationUuid.substring(0, 8).replace(/[^0-9]/g, '') || Date.now())).slice(-4);
    const confirmBib = document.querySelector('[data-confirm-bib]');
    if (confirmBib) confirmBib.textContent = provisionalBib;

    const qrContainer = document.querySelector('[data-confirm-qr]');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 160, 160);
        ctx.strokeStyle = '#073b2b';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 160, 160);
        ctx.fillStyle = '#073b2b';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(registrationId, 80, 14);
        ctx.font = 'bold 10px monospace';
        ctx.fillText('TNCC', 80, 156);
      }
      qrContainer.appendChild(canvas);
    }

    if (confirmationSection) confirmationSection.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- 11. Registration lookup (lookup.html) ---------- */

async function initLookupForm() {
  const form = document.querySelector('[data-lookup-form]');
  if (!form) return;
  const queryInput = form.querySelector('[data-lookup-query]');
  const resultSection = document.querySelector('[data-lookup-result]');
  const notFoundSection = document.querySelector('[data-lookup-not-found]');
  const fields = {
    id: document.querySelector('[data-lookup-id]'),
    name: document.querySelector('[data-lookup-name]'),
    phone: document.querySelector('[data-lookup-phone]'),
    email: document.querySelector('[data-lookup-email]'),
    age: document.querySelector('[data-lookup-age]'),
    gender: document.querySelector('[data-lookup-gender]'),
    county: document.querySelector('[data-lookup-county]'),
    subCounty: document.querySelector('[data-lookup-sub-county]'),
    ward: document.querySelector('[data-lookup-ward]'),
    category: document.querySelector('[data-lookup-category]'),
    distance: document.querySelector('[data-lookup-distance]'),
    guardian: document.querySelector('[data-lookup-guardian]'),
    guardianPhone: document.querySelector('[data-lookup-guardian-phone]'),
    status: document.querySelector('[data-lookup-status]'),
    date: document.querySelector('[data-lookup-date]')
  };

  function clearFields() {
    Object.values(fields).forEach(el => { if (el) el.textContent = ''; });
  }

  function showResult(item) {
    const regId = 'TNCC-CR-' + String(item.id || '').substring(0, 8).toUpperCase();
    if (fields.id) fields.id.textContent = regId;
    if (fields.name) fields.name.textContent = item.name || '—';
    if (fields.phone) fields.phone.textContent = item.phone || '—';
    if (fields.email) fields.email.textContent = item.email || '—';
    if (fields.age) fields.age.textContent = item.age || '—';
    if (fields.gender) fields.gender.textContent = item.gender || 'Prefer not to say';
    if (fields.county) fields.county.textContent = item.county || '—';
    if (fields.subCounty) fields.subCounty.textContent = item.sub_county || '—';
    if (fields.ward) fields.ward.textContent = item.ward || '—';
    if (fields.category) fields.category.textContent = item.selected_category || '—';
    if (fields.distance) fields.distance.textContent = item.race_distance || '—';
    if (fields.guardian) fields.guardian.textContent = item.guardian || '—';
    if (fields.guardianPhone) fields.guardianPhone.textContent = item.guardian_phone || '—';
    if (fields.status) fields.status.textContent = item.status || 'pending';
    if (fields.date) fields.date.textContent = item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
    clearFields();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = queryInput?.value?.trim() || '';
    if (!query) {
      showToast('Please enter a registration ID, email, or phone number.', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    resultSection.hidden = true;
    notFoundSection.hidden = true;
    clearFields();

    const client = getSupabaseClient();
    if (!client) {
      if (submitBtn) submitBtn.disabled = false;
      showToast('Search is not connected yet. Please contact us directly.', 'error');
      return;
    }

    try {
      let data = null;
      let error = null;

      if (query.toUpperCase().startsWith('TNCC-CR-')) {
        const shortId = query.replace('TNCC-CR-', '').substring(0, 8).toLowerCase();
        const { data: result, error: err } = await client
          .from('submissions')
          .select('*')
          .eq('event_id', 'teso-north-cross-country')
          .limit(1);
        if (err) { error = err; }
        else {
          data = result.find(row => String(row.id).substring(0, 8).toLowerCase() === shortId) || null;
        }
      } else if (query.includes('@')) {
        const { data: result, error: err } = await client
          .from('submissions')
          .select('*')
          .eq('event_id', 'teso-north-cross-country')
          .eq('email', query);
        if (err) { error = err; }
        else { data = result?.[0] || null; }
      } else {
        const { data: result, error: err } = await client
          .from('submissions')
          .select('*')
          .eq('event_id', 'teso-north-cross-country')
          .eq('phone', query);
        if (err) { error = err; }
        else { data = result?.[0] || null; }
      }

      if (error) {
        console.error(error);
        showToast('Could not look up registration. Please try again.', 'error');
      } else if (data) {
        showResult(data);
        resultSection.hidden = false;
        window.scrollTo({ top: resultSection.offsetTop - 80, behavior: 'smooth' });
      } else {
        notFoundSection.hidden = false;
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* ---------- 12. Forms ---------- */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = form.querySelector('[data-contact-name]')?.value.trim() || 'Guest';
    const email = form.querySelector('[data-contact-email]')?.value.trim() || '';
    const phone = form.querySelector('[data-contact-phone]')?.value.trim() || null;
    const subject = form.querySelector('[data-contact-subject]')?.value.trim() || null;
    const message = form.querySelector('[data-contact-message]')?.value.trim() || '';
    const submit = form.querySelector('button[type="submit"]');
    const client = getSupabaseClient();
    if (!client) { showToast('Messaging is not connected yet. Please email us directly.', 'error'); return; }

    submit?.setAttribute('disabled', '');
    const submitLabel = submit?.textContent;
    if (submit) submit.textContent = 'Sending…';

    const { error } = await client.from('contact_messages').insert({ name, email, phone, subject, message });
    let insertError = error;
    if (insertError) {
      // Older schema without phone/subject columns: retry with the core fields.
      const retry = await client.from('contact_messages').insert({ name, email, message });
      insertError = retry.error;
    }

    submit?.removeAttribute('disabled');
    if (submit && submitLabel) submit.textContent = submitLabel;

    if (insertError) {
      console.error(insertError);
      showToast('Your message could not be sent. Please try again.', 'error');
      return;
    }
    showToast(`Thank you, ${name}. Your message has been received.`);
    form.reset();
  });
}

function initVolunteerForm() {
  const form = document.querySelector('[data-volunteer-form]');
  if (!form) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const name = form.querySelector('[data-volunteer-name]')?.value.trim() || 'Volunteer';
    const email = form.querySelector('input[type="email"]')?.value.trim() || '';
    const phone = form.querySelector('input[type="tel"]')?.value.trim() || null;
    const role = form.querySelector('select')?.value || 'Other';
    const message = form.querySelector('textarea')?.value.trim() || null;
    const client = getSupabaseClient();
    if (!client) { showToast('Volunteer sign-up is not connected yet. Please contact us directly.', 'error'); return; }

    const { error } = await client.from('volunteers').insert({ name, email, phone, role, message });
    if (error) {
      console.error(error);
      showToast('Your volunteer interest could not be sent. Please try again.', 'error');
      return;
    }
    const endpoint = window.TNCC_CONFIG?.notificationEndpoint;
    if (endpoint) {
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'volunteer', payload: { name, email, phone, role, message } }) }).catch(() => {});
    }
    showToast(`Thanks, ${name}. Your volunteer interest has been registered.`);
    form.reset();
  });
}

function initDonationPage() {
  const donationForm = document.querySelector('[data-donation-form]');
  if (!donationForm) return;

  const amountButtons = [...donationForm.querySelectorAll('.donation-amount')];
  let selectedAmount = null;

  amountButtons.forEach(button => {
    button.addEventListener('click', () => {
      amountButtons.forEach(node => node.classList.remove('selected'));
      button.classList.add('selected');
      selectedAmount = Number(button.dataset.amount);
      const custom = donationForm.querySelector('[data-custom-amount]');
      if (custom) custom.value = '';
    });
  });

  donationForm.addEventListener('submit', async event => {
    event.preventDefault();
    const customInput = donationForm.querySelector('[data-custom-amount]');
    const customAmount = Number(customInput?.value || 0);
    const total = customAmount > 0 ? customAmount : selectedAmount;
    const name = donationForm.querySelector('[data-donor-name]')?.value.trim() || '';
    const email = donationForm.querySelector('[data-donor-email]')?.value.trim() || '';

    if (!total || total < 100) { showToast('Please choose or enter an amount of at least KES 100.', 'error'); return; }

    const endpoint = window.TNCC_CONFIG?.stripeCheckoutEndpoint;
    const hasRealEndpoint = endpoint && !endpoint.includes('YOUR-');
    if (hasRealEndpoint) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: total, currency: 'kes', name, email })
        });
        const data = await response.json();
        if (!response.ok || !data.url) throw new Error(data.error || 'Checkout unavailable');
        window.location.href = data.url;
        return;
      } catch (error) {
        console.error(error);
        showToast('Card checkout is currently unavailable. Please use the M-Pesa details instead.', 'error');
        return;
      }
    }
    showToast(`Thank you${name ? ', ' + name : ''}. Please complete your KES ${total.toLocaleString('en-US')} gift via M-Pesa using the details on this page.`, 'success');
  });
}

/* ---------- 10. Event registration (register.html) ---------- */

const KENYA_COUNTIES = ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'];

const KENYA_FALLBACK_LOCATIONS = {
  Busia: {
    Constituencies: {
      'Teso North': { Ward: ['Malaba Central', 'Malaba North', 'Malaba South', 'Angurai North', 'Angurai South', 'Angurai East'] },
      'Teso South': { Ward: ['Amukura Central', 'Amukura East', 'Amukura West', 'Angorom', 'Chakol North', 'Chakol South'] },
      'Matayos': { Ward: ['Bukhayo West', 'Mayenje', 'Matayos South', 'Busibwabo'] },
      'Nambale': { Ward: ['Nambale Township', 'Bukhayo North/Waltsi', 'Bukhayo Central', 'Bukhayo East'] },
      'Butula': { Ward: ['Marachi West', 'Kingandole', 'Marachi Central', 'Marachi East', 'Elugulu'] },
      'Funyula': { Ward: ['Bwiri', 'Namboboto Namboboto', 'Nangina', "Ageng'a Nanguba"] },
      'Budalangi': { Ward: ['Bunyala Central', 'Bunyala North', 'Bunyala West', 'Bunyala South'] }
    }
  }
};

function setSelectOptions(select, options, placeholder, disabled) {
  select.innerHTML = `<option value="">${escapeHtml(placeholder)}</option>` +
    options.map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('');
  select.disabled = disabled;
}

async function initRegistrationForm() {
  const form = document.querySelector('[data-registration-form]');
  if (!form) return;

  const countySelect = form.querySelector('[data-reg-county]');
  const subCountySelect = form.querySelector('[data-reg-sub-county]');
  const wardSelect = form.querySelector('[data-reg-ward]');
  const status = form.querySelector('[data-reg-location-status]');
  let locations = {};

  setSelectOptions(countySelect, KENYA_COUNTIES.slice().sort((a, b) => a.localeCompare(b)), 'Select county', false);

  function populateSubCounties() {
    const county = countySelect.value;
    const subCounties = Object.keys(locations[county]?.Constituencies || {});
    setSelectOptions(subCountySelect, subCounties, county ? 'Select sub-county' : 'Select county first', !county || !subCounties.length);
    setSelectOptions(wardSelect, [], 'Select sub-county first', true);
  }

  function populateWards() {
    const county = countySelect.value;
    const subCounty = subCountySelect.value;
    const wards = locations[county]?.Constituencies?.[subCounty]?.Ward || [];
    setSelectOptions(wardSelect, wards, subCounty ? 'Select ward' : 'Select sub-county first', !subCounty || !wards.length);
  }

  countySelect.addEventListener('change', populateSubCounties);
  subCountySelect.addEventListener('change', populateWards);

  try {
    const urls = [
      'https://cdn.jsdelivr.net/gh/mbithuka/Counties@main/restructured_data.json',
      'https://raw.githubusercontent.com/mbithuka/Counties/main/restructured_data.json'
    ];
    let response = null;
    for (const url of urls) {
      try {
        const candidate = await fetch(url);
        if (candidate.ok) { response = candidate; break; }
      } catch (error) { /* try next */ }
    }
    if (!response) throw new Error('Location data unavailable');
    locations = await response.json();
    const remoteCounties = Object.keys(locations);
    if (remoteCounties.length) {
      setSelectOptions(countySelect, remoteCounties.sort((a, b) => a.localeCompare(b)), 'Select county', false);
    }
    if (status) status.textContent = 'Select your county, then sub-county and ward.';
  } catch (error) {
    locations = KENYA_FALLBACK_LOCATIONS;
    if (status) status.textContent = 'Select your county, sub-county and ward. Busia locations are available offline.';
  }
  populateSubCounties();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const value = name => form.querySelector(`[data-reg-${name}]`)?.value.trim() || '';
    const name = value('name');
    const email = value('email');
    const phone = value('phone');
    const interest = value('interest');
    const county = countySelect.value;
    const subCounty = subCountySelect.value;
    const ward = wardSelect.value;
    const guardian = value('guardian');
    const education = value('education');
    const age = Number(value('age'));
    const raceCategories = [...form.querySelectorAll('[data-reg-race]:checked')].map(input => input.value);
    const message = form.querySelector('[data-reg-message]')?.value.trim() || '';

    if (!name || !email || !phone || !interest || !county || !subCounty || !ward || !age || !raceCategories.length) {
      showToast('Please complete all required fields, including at least one race.', 'error');
      return;
    }
    if (age < 5 || age > 120) { showToast('Please enter a valid age between 5 and 120.', 'error'); return; }

    const submit = form.querySelector('button[type="submit"]');
    const submitLabel = submit?.textContent;
    submit?.setAttribute('disabled', '');
    if (submit) submit.textContent = 'Submitting…';

    const payload = {
      name, email, phone, interest, message,
      county, sub_county: subCounty, ward,
      guardian: guardian || null,
      education: education || null,
      age,
      race_categories: raceCategories
    };

    const client = getSupabaseClient();
    if (!client) {
      submit?.removeAttribute('disabled');
      if (submit && submitLabel) submit.textContent = submitLabel;
      showToast('Registration is not connected yet. Please contact us directly.', 'error');
      return;
    }

    const { error } = await client.from('submissions').insert(payload);
    submit?.removeAttribute('disabled');
    if (submit && submitLabel) submit.textContent = submitLabel;

    if (error) {
      console.error(error);
      showToast('Your registration could not be submitted. Please try again.', 'error');
      return;
    }

    const endpoint = window.TNCC_CONFIG?.notificationEndpoint;
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', payload: { name, email, phone, message: `New event registration: ${name} (${raceCategories.join(', ')}) from ${county}, ${subCounty}, ${ward}.` } })
      }).catch(() => {});
    }

    form.reset();
    populateSubCounties();
    showToast(`Thank you, ${name}! Your registration has been received. We will contact you soon.`);
  });
}

/* ---------- Bootstrap ---------- */

function initThemeToggleFallback() {
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    if (button.dataset.tnccThemeBound) return;
    button.dataset.tnccThemeBound = '1';
    button.addEventListener('click', () => {
      const dark = !document.body.classList.contains('dark');
      document.body.classList.toggle('dark', dark);
      try { localStorage.setItem('tncc-theme', dark ? 'dark' : 'light'); } catch (error) { /* ignore */ }
       button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const icon = button.querySelector('[data-theme-icon]');
      if (icon) icon.textContent = dark ? '☀' : '🌙';
    });
  });
}

function initYear() {
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
}

document.addEventListener('DOMContentLoaded', () => {
  initStoryPage();
  initStoryArticle();
  initGalleryPage();
  initHomePreviews();
  initCounters();
  initDonationPage();
  initContactForm();
  initVolunteerForm();
   initRegistrationForm();
   initTesoNorthCrossCountryForm();
   initLookupForm();
   initThemeToggleFallback();
   initYear();
 });