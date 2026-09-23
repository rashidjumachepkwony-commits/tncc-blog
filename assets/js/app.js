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
  eventName: 'Teso North Cross Country Run',
  organizer: 'Teso North Cross Country CBO',
  location: 'Chelelemuk grounds',
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
        .select('race_categories')
        .eq('event_id', TNCC_RUN_CONFIG.eventId);
      if (error || !Array.isArray(data)) return;
      const countsByCategory = {};
      data.forEach(row => {
        const labels = Array.isArray(row.race_categories) ? row.race_categories : [];
        labels.forEach(label => {
          const cat = TNCC_RUN_CATEGORIES.find(c => c.label === label);
          if (cat) countsByCategory[cat.value] = (countsByCategory[cat.value] || 0) + 1;
        });
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

    const registrationUuid = (window.crypto && typeof window.crypto.randomUUID === 'function')
      ? window.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
          const r = Math.random() * 16 | 0;
          const v = char === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

    const payload = {
      id: registrationUuid,
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
      submitBtn.textContent = 'Register for the event';
      showToast('Registration is not connected yet. Please contact us directly.', 'error');
      return;
    }

    let data = { id: registrationUuid };
    let error = null;
    const { error: insertError } = await client.from('submissions').insert(payload);
    error = insertError;

    if (error) {
      console.error(error);
      // Retry with core columns only if the schema hasn't been fully migrated
      const corePayload = {
        id: registrationUuid,
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
        event_id: TNCC_RUN_CONFIG.eventId,
        event_name: TNCC_RUN_CONFIG.eventName,
        selected_category: selectedCategory.label,
        race_distance: selectedCategory.distance
      };
      const retry = await client.from('submissions').insert(corePayload);
      if (retry.error) {
        // Final compatibility fallback for older Supabase schemas that do not yet
        // have the newer event/category columns. The registration is still saved
        // using the original submissions columns, while event details remain in
        // race_categories/message for admin review.
        const legacyPayload = {
          id: registrationUuid,
          name,
          email,
          phone,
          age,
          county,
          sub_county: subCounty,
          ward,
          guardian: guardian || null,
          interest: 'event-participant',
          message: [
            message || '',
            `Event: ${TNCC_RUN_CONFIG.eventName}`,
            `Date: ${TNCC_RUN_CONFIG.eventDate}`,
            `Category: ${selectedCategory.label}`,
            `Distance: ${selectedCategory.distance}`
          ].filter(Boolean).join('\n'),
          race_categories: [selectedCategory.label]
        };
        const legacyRetry = await client.from('submissions').insert(legacyPayload);
        if (legacyRetry.error) {
          console.error('Event registration failed:', legacyRetry.error);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Register for the event';
          showToast('Your registration could not be submitted. Please try again.', 'error');
          return;
        }
      }
      data = { id: registrationUuid };
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Register for the event';

    const registrationId = 'TNCC-CR-' + data.id.substring(0, 8).toUpperCase();

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
           phone,
            event_name: TNCC_RUN_CONFIG.eventName,
            event_id: TNCC_RUN_CONFIG.eventId,
            selected_category: selectedCategory.label,
            race_distance: selectedCategory.distance,
            registration_fee: TNCC_RUN_CONFIG.fee,
            registration_id: registrationId,
            age,
            gender: gender || '',
            county,
            sub_county: subCounty,
            ward,
            guardian: guardian || '',
            guardian_phone: guardianPhone || '',
            message: message || ''
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
    const provisionalBib = String(Number(data.id.substring(0, 8).replace(/[^0-9]/g, '') || Date.now())).slice(-4);
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
    const printBtn = document.getElementById('printConfirmationBtn');
    const downloadPdfBtn = document.getElementById('downloadConfirmationBtn');
    const printAndDownload = (btn, action) => {
      if (!btn) return;
      btn.addEventListener('click', () => {
        const confSection = document.getElementById('eventConfirmation');
        const originalContent = document.body.innerHTML;
        const printContent = confSection ? confSection.innerHTML : '';
        document.body.innerHTML = `
          <!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Registration Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .card { max-width: 640px; margin: 0 auto; }
            .event-confirm-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .event-confirm-row span { color: #666; }
            .event-confirm-row strong { font-weight: bold; }
            .qr-placeholder canvas { border: 2px solid #073b2b; padding: 10px; background: #fff; }
          </style>
          </head><body><div class="card">${printContent}</div></body></html>
        `;
        if (action === 'print') {
          window.print();
          document.body.innerHTML = originalContent;
          window.location.reload();
        } else {
          window.print();
          document.body.innerHTML = originalContent;
          window.location.reload();
        }
      });
    };
    printAndDownload(printBtn, 'print');
    printAndDownload(downloadPdfBtn, 'download');
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
          .eq('event_id', TNCC_RUN_CONFIG.eventId)
          .limit(1);
        if (err) { error = err; }
        else {
          data = result.find(row => String(row.id).substring(0, 8).toLowerCase() === shortId) || null;
        }
      } else if (query.includes('@')) {
        const { data: result, error: err } = await client
          .from('submissions')
          .select('*')
          .eq('event_id', TNCC_RUN_CONFIG.eventId)
          .eq('email', query);
        if (err) { error = err; }
        else { data = result?.[0] || null; }
      } else {
        const { data: result, error: err } = await client
          .from('submissions')
          .select('*')
          .eq('event_id', TNCC_RUN_CONFIG.eventId)
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
  const customInput = donationForm.querySelector('[data-custom-amount]');
  const summary = donationForm.querySelector('[data-donation-summary]');
  const summaryAmount = donationForm.querySelector('[data-donation-summary-amount]');
  let selectedAmount = null;

  function updateSummary(amount) {
    if (!summary || !summaryAmount) return;
    if (amount > 0) {
      summary.hidden = false;
      summaryAmount.textContent = 'KES ' + Number(amount).toLocaleString('en-US');
    } else {
      summary.hidden = true;
    }
  }

  amountButtons.forEach(button => {
    button.addEventListener('click', () => {
      amountButtons.forEach(node => node.classList.remove('selected'));
      button.classList.add('selected');
      selectedAmount = Number(button.dataset.amount);
      if (customInput) customInput.value = '';
      updateSummary(selectedAmount);
    });
  });

  customInput?.addEventListener('input', () => {
    const value = Number(customInput.value || 0);
    if (value > 0) {
      amountButtons.forEach(node => node.classList.remove('selected'));
      selectedAmount = null;
      updateSummary(value);
    } else {
      updateSummary(0);
    }
  });

  donationForm.addEventListener('submit', async event => {
    event.preventDefault();
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
        body: JSON.stringify({
          type: 'registration-submission',
          payload: {
            name,
            email,
            phone,
            age,
            county,
            sub_county: subCounty,
            ward,
            guardian: guardian || '',
            education: education || '',
            interest,
            race_categories: raceCategories,
            message
          }
        })
      }).catch(error => console.error('Registration notification failed:', error));
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
   applySiteContent();
   initInlineEditor();
   initThemeToggleFallback();
   initYear();
 });

/* ---------- 13. Editable site content (CMS) ---------- */

let cmsOriginals = {};
let cmsOriginalsCaptured = false;
let cmsPending = {};

function cmsGetKind(el) {
  if (el.tagName === 'IMG') return 'image';
  return el.dataset.ceKind || 'text';
}

function cmsSnapshotOriginals() {
  if (cmsOriginalsCaptured) return;
  document.querySelectorAll('[data-ce]').forEach(el => {
    const kind = cmsGetKind(el);
    cmsOriginals[el.dataset.ce] = kind === 'image' ? (el.getAttribute('src') || '') : el.innerHTML;
  });
  cmsOriginalsCaptured = true;
}

async function applySiteContent() {
  if (!document.querySelector('[data-ce]')) return;
  cmsSnapshotOriginals();
  const client = getSupabaseClient();
  if (!client) return;
  try {
    const { data, error } = await client.from('site_content').select('id,kind,value');
    if (error || !Array.isArray(data)) return;
    data.forEach(row => {
      const el = document.querySelector(`[data-ce="${row.id}"]`);
      if (!el) return;
      if (row.kind === 'image') { if (row.value) el.setAttribute('src', row.value); }
      else if (row.kind === 'html') { el.innerHTML = row.value || ''; }
      else if (row.value != null) { el.textContent = row.value; }
    });
  } catch (error) { /* silent - fallback content stays */ }
}

async function cmsCallAdmin(action, payload = {}) {
  const client = getSupabaseClient();
  const { data: { session } } = await client.auth.getSession();
  if (!session) throw new Error('Sign in required');
  const response = await fetch(`${window.TNCC_CONFIG.supabaseUrl}/functions/v1/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ action, ...payload })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Admin request failed');
  return result;
}

async function cmsUploadFile(file) {
  const client = getSupabaseClient();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80);
  const path = `${Date.now()}-${safe}`;
  const { error } = await client.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;
  const { data } = client.storage.from('media').getPublicUrl(path);
  return { path, url: data.publicUrl };
}

function cmsFileKind(mimetype) {
  const type = (mimetype || '').toLowerCase();
  if (type.indexOf('audio/') === 0) return 'audio';
  if (type.indexOf('video/') === 0) return 'video';
  return 'image';
}

function cmsInjectStyles() {
  if (document.getElementById('cms-editor-styles')) return;
  const style = document.createElement('style');
  style.id = 'cms-editor-styles';
  style.textContent = [
    'body.cms-editing [data-ce]{outline:2px dashed rgba(7,59,43,.5);outline-offset:3px;border-radius:2px;cursor:pointer;}',
    'body.cms-editing [data-ce]:hover{outline-color:#0b7a54;background:rgba(11,122,84,.07);}',
    '.ce-toolbar{position:fixed;z-index:99990;right:16px;bottom:16px;background:#0b2b20;color:#fff;border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:0 10px 34px rgba(0,0,0,.35);font-family:system-ui,sans-serif;font-size:13px;}',
    '.ce-toolbar .ce-count{opacity:.85;}',
    '.ce-toolbar button,.ce-panel button,.ce-media-modal button{cursor:pointer;border:0;border-radius:8px;padding:8px 14px;font:inherit;font-size:13px;}',
    '.ce-btn-primary{background:#12a06b;color:#fff;}.ce-btn-primary:disabled{opacity:.5;cursor:default;}',
    '.ce-btn-ghost{background:rgba(255,255,255,.16);color:#fff;}',
    '.ce-btn-danger{background:#b3261e;color:#fff;}',
    '.ce-panel{position:fixed;z-index:99991;top:0;right:0;height:100%;width:min(440px,100%);background:#fff;color:#1b1b1b;box-shadow:-12px 0 44px rgba(0,0,0,.28);display:none;flex-direction:column;font-family:system-ui,sans-serif;font-size:14px;}',
    '.ce-panel.open{display:flex;}',
    '.ce-panel-head{padding:14px 16px;background:#0b2b20;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:10px;}',
    '.ce-panel-head strong{font-size:14px;word-break:break-all;}',
    '.ce-panel-body{padding:16px;overflow:auto;flex:1;}',
    '.ce-panel .ce-label{font-weight:600;margin:14px 0 6px;display:block;}',
    '.ce-panel textarea,.ce-panel input[type=text]{width:100%;min-height:120px;padding:10px;font:inherit;border:1px solid #ccc;border-radius:8px;box-sizing:border-box;}',
    '.ce-panel input[type=text]{min-height:0;}',
    '.ce-editor-content{min-height:200px;border:1px solid #ccc;border-radius:8px;padding:12px;overflow:auto;background:#fff;outline:none;}',
    '.ce-editor-content img,.ce-editor-content video,.ce-editor-content audio{max-width:100%;}',
    '.ce-panel img.ce-preview{max-width:100%;border-radius:8px;margin-bottom:10px;display:block;}',
    '.ce-html-toolbar{display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap;}',
    '.ce-html-toolbar button{background:#eee;color:#111;padding:6px 10px;}',
    '.ce-hint{color:#666;font-size:12px;margin-top:8px;}',
    '.ce-panel-foot{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap;padding:0 16px 16px;}',
    '.ce-panel-foot .ce-btn-danger{margin-right:auto;}',
    '.ce-media-modal{position:fixed;inset:0;z-index:99992;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;font-family:system-ui,sans-serif;}',
    '.ce-media-modal.open{display:flex;}',
    '.ce-media-inner{background:#fff;border-radius:14px;padding:18px;width:min(640px,92vw);max-height:86vh;overflow:auto;}',
    '.ce-media-inner h3{margin:0 0 12px;font-size:16px;}',
    '.ce-media-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:12px;}',
    '.ce-media-item{border:1px solid #ddd;border-radius:10px;padding:8px;cursor:pointer;font-size:11px;word-break:break-all;text-align:center;background:#fafafa;}',
    '.ce-media-item img{width:100%;height:76px;object-fit:cover;border-radius:6px;margin-bottom:6px;}',
    '.ce-media-item audio,.ce-media-item video{width:100%;margin-bottom:6px;}',
    '.ce-empty{color:#777;font-size:13px;}'
  ].join('\n');
  document.head.appendChild(style);
}

function cmsBuildToolbar() {
  const bar = document.createElement('div');
  bar.className = 'ce-toolbar';
  bar.innerHTML = '<span>Edit mode</span><span class="ce-count">0 changes</span>';
  const save = document.createElement('button');
  save.className = 'ce-btn-primary';
  save.textContent = 'Save changes';
  save.disabled = true;
  save.addEventListener('click', async () => {
    save.disabled = true;
    save.textContent = 'Saving...';
    try {
      await cmsCallAdmin('saveSiteContent', { items: Object.values(cmsPending) });
      cmsPending = {};
      showToast('Changes saved and published.', 'success');
    } catch (error) {
      showToast(error.message || 'Could not save changes.', 'error');
    }
    save.textContent = 'Save changes';
    cmsUpdateToolbar();
  });
  const exit = document.createElement('button');
  exit.className = 'ce-btn-ghost';
  exit.textContent = 'Exit editing';
  exit.addEventListener('click', () => { window.location.href = window.location.pathname; });
  bar.appendChild(save);
  bar.appendChild(exit);
  document.body.appendChild(bar);
  return bar;
}

function cmsUpdateToolbar() {
  const count = document.querySelector('.ce-toolbar .ce-count');
  const save = document.querySelector('.ce-toolbar .ce-btn-primary');
  const n = Object.keys(cmsPending).length;
  if (count) count.textContent = n === 1 ? '1 change' : `${n} changes`;
  if (save) save.disabled = n === 0;
}

function cmsMarkPending(el) {
  const id = el.dataset.ce;
  const kind = cmsGetKind(el);
  const value = kind === 'image' ? (el.getAttribute('src') || '') : el.innerHTML;
  cmsPending[id] = { id, page: id.split(':')[0], kind, value };
  cmsUpdateToolbar();
}

async function cmsOpenMediaModal(onPick) {
  cmsInjectStyles();
  let modal = document.querySelector('.ce-media-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'ce-media-modal';
    modal.innerHTML = '<div class="ce-media-inner"><h3>Media library</h3><button class="ce-btn-primary ce-media-upload-btn" type="button">Upload image / audio / video</button><input type="file" class="ce-media-file" accept="image/*,audio/*,video/*" multiple hidden /><div class="ce-media-grid"><span class="ce-empty">Loading...</span></div><div style="margin-top:12px;text-align:right;"><button class="ce-media-close" type="button" style="background:#eee;color:#111;">Close</button></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
    modal.querySelector('.ce-media-close').addEventListener('click', () => modal.classList.remove('open'));
    const fileInput = modal.querySelector('.ce-media-file');
    modal.querySelector('.ce-media-upload-btn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
      if (!fileInput.files || !fileInput.files.length) return;
      try {
        for (const file of Array.from(fileInput.files)) await cmsUploadFile(file);
        showToast('Upload complete.', 'success');
        await cmsRefreshMediaGrid(modal);
      } catch (error) {
        showToast(error.message || 'Upload failed.', 'error');
      }
      fileInput.value = '';
    });
  }
  modal.dataset.pickKind = onPick.kind || 'any';
  modal.classList.add('open');
  await cmsRefreshMediaGrid(modal);
  const grid = modal.querySelector('.ce-media-grid');
  grid.onclick = event => {
    const item = event.target.closest('.ce-media-item');
    if (!item || !item.dataset.url) return;
    const pickKind = modal.dataset.pickKind;
    if (pickKind !== 'any' && item.dataset.mediaKind !== pickKind) {
      showToast(`Pick an ${pickKind} for this block.`, 'error');
      return;
    }
    modal.classList.remove('open');
    onPick.callback(item.dataset.url, item.dataset.path, item.dataset.mediaKind);
  };
}

async function cmsRefreshMediaGrid(modal) {
  const grid = modal.querySelector('.ce-media-grid');
  grid.innerHTML = '<span class="ce-empty">Loading...</span>';
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.storage.from('media').list('', { limit: 200, sortBy: { column: 'created_at', order: 'descending' } });
    if (error) throw error;
    const files = (data || []).filter(f => f.id);
    if (!files.length) { grid.innerHTML = '<span class="ce-empty">No media uploaded yet. Use the upload button above.</span>'; return; }
    grid.innerHTML = '';
    files.forEach(file => {
      const { data: urlData } = client.storage.from('media').getPublicUrl(file.name);
      const url = urlData.publicUrl;
      const kind = cmsFileKind((file.metadata && file.metadata.mimetype) || '');
      const div = document.createElement('div');
      div.className = 'ce-media-item';
      div.dataset.url = url;
      div.dataset.path = file.name;
      div.dataset.mediaKind = kind;
      if (kind === 'image') {
        const img = document.createElement('img');
        img.src = url;
        img.loading = 'lazy';
        div.appendChild(img);
      } else if (kind === 'audio') {
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;
        div.appendChild(audio);
      } else {
        const video = document.createElement('video');
        video.src = url;
        video.muted = true;
        div.appendChild(video);
      }
      const label = document.createElement('div');
      label.textContent = file.name;
      div.appendChild(label);
      grid.appendChild(div);
    });
  } catch (error) {
    grid.innerHTML = `<span class="ce-empty">Could not load media: ${error.message}</span>`;
  }
}

function cmsOpenPanel(el) {
  cmsInjectStyles();
  let panel = document.querySelector('.ce-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'ce-panel';
    document.body.appendChild(panel);
  }
  const id = el.dataset.ce;
  const kind = cmsGetKind(el);
  const original = cmsOriginals[id] || '';
  panel.innerHTML = `<div class="ce-panel-head"><strong>${id}</strong><button type="button" class="ce-btn-ghost ce-close">Close</button></div><div class="ce-panel-body"></div><div class="ce-panel-foot"><button type="button" class="ce-btn-danger ce-reset">Reset to original</button><button type="button" class="ce-cancel" style="background:#eee;color:#111;">Cancel</button><button type="button" class="ce-btn-primary ce-apply">Apply</button></div>`;
  const body = panel.querySelector('.ce-panel-body');

  if (kind === 'image') {
    body.innerHTML = '<label class="ce-label">Current image</label>';
    const preview = document.createElement('img');
    preview.className = 'ce-preview';
    preview.src = el.getAttribute('src') || '';
    body.appendChild(preview);
    const urlLabel = document.createElement('label');
    urlLabel.className = 'ce-label';
    urlLabel.textContent = 'Image URL';
    body.appendChild(urlLabel);
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.value = el.getAttribute('src') || '';
    body.appendChild(urlInput);
    const pick = document.createElement('button');
    pick.type = 'button';
    pick.className = 'ce-btn-primary';
    pick.style.marginTop = '10px';
    pick.textContent = 'Choose / upload image';
    pick.addEventListener('click', () => {
      cmsOpenMediaModal({ kind: 'image', callback: url => { urlInput.value = url; preview.src = url; } });
    });
    body.appendChild(pick);
    panel.querySelector('.ce-apply').addEventListener('click', () => {
      el.setAttribute('src', urlInput.value.trim());
      cmsMarkPending(el);
      panel.classList.remove('open');
    });
  } else if (kind === 'html') {
    body.innerHTML = '<label class="ce-label">Rich content</label><div class="ce-html-toolbar"><button type="button" data-cmd="bold"><b>B</b></button><button type="button" data-cmd="italic"><i>I</i></button><button type="button" data-cmd="underline"><u>U</u></button><button type="button" data-cmd="insertUnorderedList">Bullet list</button><button type="button" data-cmd="insertOrderedList">Numbered list</button><button type="button" data-cmd="createLink">Link</button><button type="button" class="ce-insert-media">Insert media</button></div><div class="ce-editor-content" contenteditable="true"></div><p class="ce-hint">Tip: Insert media lets you upload and embed images, audio and video.</p>';
    const editor = body.querySelector('.ce-editor-content');
    editor.innerHTML = el.innerHTML;
    body.querySelectorAll('.ce-html-toolbar button[data-cmd]').forEach(button => {
      button.addEventListener('mousedown', event => event.preventDefault());
      button.addEventListener('click', () => {
        editor.focus();
        if (button.dataset.cmd === 'createLink') {
          const url = window.prompt('Link URL:');
          if (url) document.execCommand('createLink', false, url);
        } else {
          document.execCommand(button.dataset.cmd, false, null);
        }
      });
    });
    body.querySelector('.ce-insert-media').addEventListener('click', () => {
      cmsOpenMediaModal({
        kind: 'any',
        callback: (url, path, mediaKind) => {
          editor.focus();
          const tag = mediaKind === 'audio'
            ? `<audio controls src="${url}"></audio>`
            : mediaKind === 'video'
              ? `<video controls src="${url}" style="max-width:100%;"></video>`
              : `<img src="${url}" style="max-width:100%;" />`;
          document.execCommand('insertHTML', false, tag);
        }
      });
    });
    panel.querySelector('.ce-apply').addEventListener('click', () => {
      el.innerHTML = editor.innerHTML;
      cmsMarkPending(el);
      panel.classList.remove('open');
    });
  } else {
    body.innerHTML = '<label class="ce-label">Text</label>';
    const area = document.createElement('textarea');
    area.value = el.textContent || '';
    body.appendChild(area);
    panel.querySelector('.ce-apply').addEventListener('click', () => {
      el.textContent = area.value;
      cmsMarkPending(el);
      panel.classList.remove('open');
    });
  }

  panel.querySelector('.ce-close').addEventListener('click', () => panel.classList.remove('open'));
  panel.querySelector('.ce-cancel').addEventListener('click', () => panel.classList.remove('open'));
  panel.querySelector('.ce-reset').addEventListener('click', async () => {
    try {
      await cmsCallAdmin('deleteSiteContent', { id });
      delete cmsPending[id];
      cmsUpdateToolbar();
      if (kind === 'image') el.setAttribute('src', original); else el.innerHTML = original;
      panel.classList.remove('open');
      showToast('Block reset to the original content.', 'success');
    } catch (error) {
      showToast(error.message || 'Could not reset block.', 'error');
    }
  });
  panel.classList.add('open');
}

async function initInlineEditor() {
  if (!new URLSearchParams(window.location.search).has('edit')) return;
  if (!document.querySelector('[data-ce]')) return;
  const client = getSupabaseClient();
  if (!client) return;
  let isAdmin = false;
  try {
    const { data: { user } } = await client.auth.getUser();
    if (user) {
      const { data: profile } = await client.from('profiles').select('role').eq('id', user.id).single();
      isAdmin = Boolean(profile && profile.role === 'admin');
    }
  } catch (error) { isAdmin = false; }
  if (!isAdmin) {
    showToast('Sign in with an admin account, then reopen this page with ?edit=1 to edit the site.', 'info');
    return;
  }
  cmsInjectStyles();
  document.body.classList.add('cms-editing');
  cmsSnapshotOriginals();
  cmsBuildToolbar();
  document.addEventListener('click', event => {
    if (event.target.closest('.ce-panel, .ce-toolbar, .ce-media-modal')) return;
    const target = event.target.closest('[data-ce]');
    if (!target) return;
    event.preventDefault();
    cmsOpenPanel(target);
  }, true);
  showToast('Edit mode: click any outlined block to edit it. Save changes when done.', 'info');
}
