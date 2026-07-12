(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;
  const body = document.body;
  const project = data.projects.find(item => item.id === body.dataset.project);
  if (!project) return;

  const state = { lang: 'nl', index: 0, touchX: 0, touchY: 0, uiTimer: 0, zoomed: false, view: 'grid' };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = key => data.translations[state.lang]?.[key] || data.translations.en[key] || key;
  const localized = value => value?.[state.lang] || value?.en || '';
  const imagePath = file => `../../images/${file.split('/').map(encodeURIComponent).join('/')}`;

  function setMeta() {
    const title = localized(project.title);
    const description = localized(project.description);
    document.title = `${title} — FotodiSogno`;
    $('meta[name="description"]')?.setAttribute('content', description);
    $('meta[property="og:title"]')?.setAttribute('content', `${title} — FotodiSogno`);
    $('meta[property="og:description"]')?.setAttribute('content', description);
    $('meta[property="og:image"]')?.setAttribute('content', `https://fotodisogno.com/images/${encodeURIComponent(project.cover)}`);
    $('link[rel="canonical"]')?.setAttribute('href', `https://fotodisogno.com/projects/${project.id}/`);
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(node => {
      const value = t(node.dataset.i18n);
      if (value) node.textContent = value;
    });
    $$('[data-lang]').forEach(button => {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('#projectTitle').textContent = localized(project.title);
    $('#projectDescription').textContent = localized(project.description);
    $('#projectLocation').textContent = localized(project.location);
    $('#lightboxProjectTitle').textContent = localized(project.title);
    const home = `../../?lang=${state.lang}#work`;
    $('#backHome').href = home;
    $('#brandHome').href = home;

    const index = data.projects.findIndex(item => item.id === project.id);
    const previous = data.projects[(index - 1 + data.projects.length) % data.projects.length];
    const next = data.projects[(index + 1) % data.projects.length];
    const previousLink = $('#previousProject');
    const nextLink = $('#nextProject');
    previousLink.href = `../${previous.id}/?lang=${state.lang}`;
    nextLink.href = `../${next.id}/?lang=${state.lang}`;
    previousLink.querySelector('strong').textContent = localized(previous.title);
    nextLink.querySelector('strong').textContent = localized(next.title);

    const url = new URL(location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setMeta();
  }

  function renderGallery() {
    const gallery = $('#story');
    gallery.innerHTML = '';
    project.photos.forEach((photo, index) => {
      const button = document.createElement('button');
      button.className = 'gallery-card reveal';
      button.type = 'button';
      button.dataset.photoIndex = String(index);
      button.dataset.cursor = `OPEN ${String(index + 1).padStart(2, '0')}`;
      button.setAttribute('aria-label', `${t('viewImage')} ${index + 1}`);
      const src = imagePath(photo.src);
      button.innerHTML = `
        <span class="gallery-media">
          <img class="gallery-backdrop" src="${src}" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <img class="gallery-image" src="${src}" alt="${photo.alt}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async">
        </span>
        <span class="gallery-label"><span>${String(index + 1).padStart(2, '0')} / ${String(project.photos.length).padStart(2, '0')}</span><b>${photo.alt}</b></span>`;
      gallery.appendChild(button);
    });
    gallery.classList.toggle('focus-mode', state.view === 'focus');
    observeReveals();
    bindCursorTargets(gallery);
  }

  function setView(view) {
    state.view = view === 'focus' ? 'focus' : 'grid';
    $('#story').classList.toggle('focus-mode', state.view === 'focus');
    $$('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === state.view));
    sessionStorage.setItem('fotodisogno-gallery-view', state.view);
  }

  let revealObserver;
  function observeReveals() {
    const items = $$('.reveal:not(.reveal-observed)');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -7% 0px', threshold: .06 });
    }
    items.forEach(item => {
      item.classList.add('reveal-observed');
      revealObserver.observe(item);
    });
  }

  function preloadAround(index) {
    [-1, 1].forEach(offset => {
      const photo = project.photos[(index + offset + project.photos.length) % project.photos.length];
      const image = new Image();
      image.src = imagePath(photo.src);
    });
  }

  function updateLightboxPhoto(animate = true) {
    const image = $('#lightboxImage');
    const photo = project.photos[state.index];
    if (animate) image.classList.add('is-changing');
    state.zoomed = false;
    image.classList.remove('is-zoomed');
    const next = new Image();
    next.onload = () => {
      image.src = next.src;
      image.alt = photo.alt;
      requestAnimationFrame(() => image.classList.remove('is-changing'));
    };
    next.src = imagePath(photo.src);
    $('#lightboxCounter').textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(project.photos.length).padStart(2, '0')}`;
    $('#lightboxProgressBar').style.width = `${((state.index + 1) / project.photos.length) * 100}%`;
    preloadAround(state.index);
  }

  function showLightboxUI() {
    const lightbox = $('#projectLightbox');
    lightbox.classList.remove('ui-hidden');
    clearTimeout(state.uiTimer);
    state.uiTimer = setTimeout(() => lightbox.classList.add('ui-hidden'), 2400);
  }

  function openLightbox(index) {
    state.index = index;
    updateLightboxPhoto(false);
    const lightbox = $('#projectLightbox');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('overlay-open');
    showLightboxUI();
    requestAnimationFrame(() => $('#closeLightbox').focus({ preventScroll: true }));
  }

  function closeLightbox() {
    const lightbox = $('#projectLightbox');
    lightbox.classList.remove('open', 'ui-hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('overlay-open');
    $('#lightboxImage').src = '';
    clearTimeout(state.uiTimer);
  }

  function moveLightbox(direction) {
    state.index = (state.index + direction + project.photos.length) % project.photos.length;
    updateLightboxPhoto();
    showLightboxUI();
  }

  function toggleZoom() {
    state.zoomed = !state.zoomed;
    $('#lightboxImage').classList.toggle('is-zoomed', state.zoomed);
    showLightboxUI();
  }

  function setupHero() {
    const hero = $('#projectHeroImage');
    const backdrop = $('.project-hero-backdrop');
    hero.src = imagePath(project.cover);
    hero.alt = localized(project.title);
    backdrop.src = imagePath(project.cover);
    body.dataset.theme = project.theme || 'warm';
    const stored = sessionStorage.getItem('fotodisogno-transition-project');
    if (stored === project.id) {
      hero.style.viewTransitionName = `project-${project.id}`;
      setTimeout(() => {
        hero.style.viewTransitionName = '';
        sessionStorage.removeItem('fotodisogno-transition-project');
      }, 1500);
    }
  }

  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  let cursorFrame = 0;
  function moveCursor(event) {
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
    if (!cursor || cursorFrame) return;
    cursorFrame = requestAnimationFrame(() => {
      cursor.style.transform = `translate(${event.clientX}px,${event.clientY}px) translate(-50%,-50%) scale(${cursor.classList.contains('active') ? 1 : .55})`;
      cursorFrame = 0;
    });
  }

  function bindCursorTargets(root = document) {
    if (!cursor || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('[data-cursor]', root).forEach(target => {
      if (target.dataset.cursorBound === 'true') return;
      target.dataset.cursorBound = 'true';
      target.addEventListener('mouseenter', () => {
        cursorLabel.textContent = target.dataset.cursor || 'OPEN';
        cursor.classList.add('active');
      });
      target.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  function updateScrollState() {
    $('#projectHeader').classList.toggle('scrolled', scrollY > 18);
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#scrollProgress').style.height = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
    const backdrop = $('.project-hero-backdrop');
    if (backdrop && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      backdrop.style.transform = `translate3d(0,${Math.min(scrollY * .025, 22)}px,0) scale(1.06)`;
    }
  }

  function init() {
    const requested = new URL(location.href).searchParams.get('lang');
    state.lang = data.translations[requested] ? requested : 'nl';
    state.view = sessionStorage.getItem('fotodisogno-gallery-view') === 'focus' ? 'focus' : 'grid';
    $('#projectYear').textContent = project.year;
    $('#projectCount').textContent = `${String(project.photos.length).padStart(2, '0')} IMAGES`;
    $('#year').textContent = new Date().getFullYear();
    setupHero();
    applyLanguage();
    renderGallery();
    setView(state.view);
    $$('.gallery-header,.project-navigation,.project-contact').forEach(node => node.classList.add('reveal'));
    observeReveals();
    bindCursorTargets();

    $$('[data-lang]').forEach(button => button.addEventListener('click', () => {
      state.lang = button.dataset.lang;
      applyLanguage();
    }));
    $$('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
    $('#story').addEventListener('click', event => {
      const button = event.target.closest('[data-photo-index]');
      if (button) openLightbox(Number(button.dataset.photoIndex));
    });
    $('#closeLightbox').addEventListener('click', closeLightbox);
    $('#zoomLightbox').addEventListener('click', toggleZoom);
    $('#lightboxImage').addEventListener('dblclick', toggleZoom);
    $('#previousPhoto').addEventListener('click', () => moveLightbox(-1));
    $('#nextPhoto').addEventListener('click', () => moveLightbox(1));
    const stage = $('#lightboxStage');
    stage.addEventListener('pointerdown', event => { state.touchX = event.clientX; state.touchY = event.clientY; });
    stage.addEventListener('pointerup', event => {
      const dx = event.clientX - state.touchX;
      const dy = event.clientY - state.touchY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) moveLightbox(dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointermove', showLightboxUI, { passive: true });
    $('#projectLightbox').addEventListener('click', event => {
      showLightboxUI();
      if (event.target === $('#projectLightbox')) closeLightbox();
    });
    addEventListener('mousemove', moveCursor, { passive: true });
    addEventListener('scroll', updateScrollState, { passive: true });
    addEventListener('resize', updateScrollState, { passive: true });
    document.addEventListener('keydown', event => {
      if (!$('#projectLightbox').classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') moveLightbox(-1);
      if (event.key === 'ArrowRight') moveLightbox(1);
      if (event.key.toLowerCase() === 'z') toggleZoom();
    });
    updateScrollState();

    const ready = () => body.classList.add('is-ready');
    addEventListener('load', () => setTimeout(ready, 420), { once: true });
    if (document.readyState === 'complete') setTimeout(ready, 420);
    setTimeout(ready, 1800);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
