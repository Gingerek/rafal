(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;

  const body = document.body;
  const project = data.projects.find(item => item.id === body.dataset.project);
  if (!project) return;

  const localCopy = {
    nl: { view: 'Bekijk foto’s' },
    en: { view: 'View photographs' },
    pl: { view: 'Zobacz fotografie' }
  };

  const state = { lang: 'nl', index: 0, touchX: 0, touchY: 0, uiTimer: 0 };
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
    $('.project-opening .text-link span').textContent = localCopy[state.lang]?.view || localCopy.en.view;

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
      button.className = 'gallery-card';
      button.type = 'button';
      button.dataset.photoIndex = String(index);
      button.dataset.cursor = 'View';
      button.setAttribute('aria-label', `${t('viewImage')} ${index + 1}`);
      const preload = index < 6;
      button.innerHTML = `<span class="gallery-media"><img class="gallery-image is-loading" src="${imagePath(photo.src)}" alt="${photo.alt}" loading="${preload ? 'eager' : 'lazy'}" fetchpriority="${index < 2 ? 'high' : 'auto'}" decoding="async"${preload ? ' data-preload' : ''}></span>`;
      gallery.appendChild(button);
    });

    prepareGalleryImages(gallery);
    bindCursorTargets(gallery);
  }

  function prepareGalleryImages(root) {
    $$('.gallery-image', root).forEach(image => {
      const ready = () => image.classList.remove('is-loading');
      if (image.complete && image.naturalWidth > 0) ready();
      else {
        image.addEventListener('load', ready, { once: true });
        image.addEventListener('error', ready, { once: true });
      }
    });
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
      image.decoding = 'async';
      image.src = imagePath(photo.src);
    });
  }

  function viewportSize() {
    const viewport = window.visualViewport;
    return {
      width: Math.max(1, Math.round(viewport?.width || document.documentElement.clientWidth || innerWidth)),
      height: Math.max(1, Math.round(viewport?.height || innerHeight))
    };
  }

  function fitLightboxImage(image, naturalWidth = image?.naturalWidth, naturalHeight = image?.naturalHeight) {
    if (!image || !naturalWidth || !naturalHeight) return;
    const viewport = viewportSize();
    const edge = viewport.width <= 760 ? 5 : 16;
    const availableWidth = Math.max(1, viewport.width - edge * 2);
    const availableHeight = Math.max(1, viewport.height - edge * 2);
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight);
    image.style.setProperty('width', `${Math.max(1, Math.floor(naturalWidth * scale))}px`, 'important');
    image.style.setProperty('height', `${Math.max(1, Math.floor(naturalHeight * scale))}px`, 'important');
    image.style.setProperty('max-width', 'none', 'important');
    image.style.setProperty('max-height', 'none', 'important');
    image.style.setProperty('object-fit', 'contain', 'important');
  }

  function fitCurrentLightboxImage() {
    const image = $('#lightboxImage');
    if ($('#projectLightbox')?.classList.contains('open') && image?.naturalWidth) fitLightboxImage(image);
  }

  function updateLightboxPhoto(animate = true) {
    const image = $('#lightboxImage');
    const photo = project.photos[state.index];
    if (animate) image.classList.add('is-changing');
    const next = new Image();
    next.decoding = 'async';
    next.onload = () => {
      image.src = next.src;
      image.alt = photo.alt;
      fitLightboxImage(image, next.naturalWidth, next.naturalHeight);
      requestAnimationFrame(() => image.classList.remove('is-changing'));
    };
    next.onerror = () => image.classList.remove('is-changing');
    next.src = imagePath(photo.src);
    $('#lightboxCounter').textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(project.photos.length).padStart(2, '0')}`;
    preloadAround(state.index);
  }

  function showLightboxUI() {
    const lightbox = $('#projectLightbox');
    lightbox.classList.remove('ui-hidden');
    clearTimeout(state.uiTimer);
    state.uiTimer = setTimeout(() => lightbox.classList.add('ui-hidden'), 2000);
  }

  function openLightbox(index) {
    state.index = index;
    const lightbox = $('#projectLightbox');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('overlay-open');
    document.documentElement.classList.add('overlay-open');
    updateLightboxPhoto(false);
    showLightboxUI();
    requestAnimationFrame(() => $('#closeLightbox').focus({ preventScroll: true }));
  }

  function closeLightbox() {
    const lightbox = $('#projectLightbox');
    lightbox.classList.remove('open', 'ui-hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('overlay-open');
    document.documentElement.classList.remove('overlay-open');
    const image = $('#lightboxImage');
    image.src = '';
    image.removeAttribute('style');
    clearTimeout(state.uiTimer);
  }

  function moveLightbox(direction) {
    state.index = (state.index + direction + project.photos.length) % project.photos.length;
    updateLightboxPhoto();
    showLightboxUI();
  }

  function preventViewportScroll(event) {
    if ($('#projectLightbox').classList.contains('open')) event.preventDefault();
  }

  function setupHero() {
    const hero = $('#projectHeroImage');
    hero.src = imagePath(project.cover);
    hero.alt = localized(project.title);
    body.dataset.theme = project.theme || 'warm';
    const stored = sessionStorage.getItem('fotodisogno-transition-project');
    if (stored === project.id) {
      hero.style.viewTransitionName = `project-${project.id}`;
      setTimeout(() => {
        hero.style.viewTransitionName = '';
        sessionStorage.removeItem('fotodisogno-transition-project');
      }, 1100);
    }
  }

  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  let cursorFrame = 0;
  function moveCursor(event) {
    if (!cursor || cursorFrame) return;
    cursorFrame = requestAnimationFrame(() => {
      cursor.style.transform = `translate(${event.clientX}px,${event.clientY}px) translate(-50%,-50%) scale(${cursor.classList.contains('active') ? 1 : .58})`;
      cursorFrame = 0;
    });
  }

  function bindCursorTargets(root = document) {
    if (!cursor || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('[data-cursor]', root).forEach(target => {
      if (target.dataset.cursorBound === 'true') return;
      target.dataset.cursorBound = 'true';
      target.addEventListener('mouseenter', () => {
        cursorLabel.textContent = target.dataset.cursor || 'View';
        cursor.classList.add('active');
      });
      target.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  function updateScrollState() {
    $('#projectHeader').classList.toggle('scrolled', scrollY > 18);
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = $('#scrollProgress');
    if (progress) progress.style.height = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
  }

  function waitForImage(image) {
    if (image.complete && image.naturalWidth > 0) return image.decode?.().catch(() => undefined) || Promise.resolve();
    return new Promise(resolve => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }

  async function releaseLoadingScreen() {
    const progress = $('#bootProgress');
    const images = $$('img[data-preload]');
    let completed = 0;
    const update = () => {
      completed += 1;
      if (progress) progress.textContent = `${Math.round(completed / Math.max(1, images.length) * 100)}%`;
    };
    if (progress) progress.textContent = images.length ? '0%' : '100%';
    await Promise.all(images.map(image => waitForImage(image).finally(update)));
    await document.fonts?.ready?.catch?.(() => undefined);
    if (progress) progress.textContent = '100%';
    setTimeout(() => body.classList.add('is-ready'), 320);
  }

  function markReturnHome() {
    sessionStorage.setItem('fotodisogno-return-home', '1');
  }

  function init() {
    const requested = new URL(location.href).searchParams.get('lang');
    state.lang = data.translations[requested] ? requested : 'nl';
    $('#projectYear').textContent = project.year;
    $('#year').textContent = new Date().getFullYear();
    setupHero();
    applyLanguage();
    renderGallery();
    $$('.project-navigation,.project-contact').forEach(node => node.classList.add('reveal'));
    observeReveals();
    bindCursorTargets();

    $$('[data-lang]').forEach(button => button.addEventListener('click', () => {
      state.lang = button.dataset.lang;
      applyLanguage();
    }));
    $('#backHome').addEventListener('click', markReturnHome);
    $('#brandHome').addEventListener('click', markReturnHome);
    $('#story').addEventListener('click', event => {
      const button = event.target.closest('[data-photo-index]');
      if (button) openLightbox(Number(button.dataset.photoIndex));
    });
    $('#closeLightbox').addEventListener('click', closeLightbox);
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

    const lightbox = $('#projectLightbox');
    lightbox.addEventListener('wheel', preventViewportScroll, { passive: false });
    lightbox.addEventListener('touchmove', preventViewportScroll, { passive: false });
    lightbox.addEventListener('click', event => {
      showLightboxUI();
      if (event.target === lightbox || event.target === stage || event.target.classList.contains('lightbox-image-wrap')) closeLightbox();
    });

    addEventListener('mousemove', moveCursor, { passive: true });
    addEventListener('scroll', updateScrollState, { passive: true });
    addEventListener('resize', () => { updateScrollState(); fitCurrentLightboxImage(); }, { passive: true });
    window.visualViewport?.addEventListener('resize', fitCurrentLightboxImage, { passive: true });
    document.addEventListener('keydown', event => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') moveLightbox(-1);
      if (event.key === 'ArrowRight') moveLightbox(1);
    });

    updateScrollState();
    releaseLoadingScreen();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
