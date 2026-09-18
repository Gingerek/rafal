(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;

  const body = document.body;
  const project = data.projects.find(item => item.id === body.dataset.project);
  if (!project) return;

  const imageManifest = window.FOTODISOGNO_IMAGES || {};
  const localCopy = {
    nl: { view: 'Bekijk foto’s', loading: 'Foto laden…', failed: 'De foto kon niet worden geladen. Probeer de volgende foto.' },
    en: { view: 'View photographs', loading: 'Loading photograph…', failed: 'This photograph could not load. Try the next photograph.' },
    pl: { view: 'Zobacz fotografie', loading: 'Wczytywanie zdjęcia…', failed: 'Nie udało się wczytać zdjęcia. Spróbuj przejść do następnego.' }
  };
  const mobile = matchMedia('(max-width:820px), (max-width:1000px) and (max-height:520px) and (pointer:coarse)');
  const state = { lang: 'nl', index: 0, touch: null, uiTimer: 0 };
  let lightboxTrigger = null;
  let lightboxRequest = 0;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = key => data.translations[state.lang]?.[key] || data.translations.en[key] || key;
  const localized = value => value?.[state.lang] || value?.en || '';
  const imagePath = file => `../../images/${file.split('/').map(encodeURIComponent).join('/')}`;
  const escapeHtml = value => String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

  function responsivePicture(file, alt, options = {}) {
    const {
      className = '', sizes = '100vw', loading = 'lazy', fetchpriority = 'auto', preload = false
    } = options;
    const meta = imageManifest[file];
    const fallback = imagePath(file);
    const common = `class="${className}" alt="${escapeHtml(alt)}" loading="${loading}" fetchpriority="${fetchpriority}" decoding="async"${preload ? ' data-preload' : ''}`;
    if (!meta?.variants?.length) return `<img src="${fallback}" ${common}>`;
    const avif = meta.variants.map(item => `../../${item.avif} ${item.width}w`).join(',');
    const webp = meta.variants.map(item => `../../${item.webp} ${item.width}w`).join(',');
    const fallbackVariant = `../../${meta.variants[meta.variants.length - 1].webp}`;
    return `<picture class="responsive-picture">
      <source type="image/avif" srcset="${avif}" sizes="${sizes}">
      <source type="image/webp" srcset="${webp}" sizes="${sizes}">
      <img src="${fallbackVariant}" width="${meta.width}" height="${meta.height}" sizes="${sizes}" ${common}>
    </picture>`;
  }

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

  function projectNeighbours() {
    const index = data.projects.findIndex(item => item.id === project.id);
    return {
      previous: data.projects[(index - 1 + data.projects.length) % data.projects.length],
      next: data.projects[(index + 1) % data.projects.length]
    };
  }

  function renderContinuation(next) {
    const media = $('#nextProjectMedia');
    if (!media) return;
    media.innerHTML = responsivePicture(next.preview || next.cover, localized(next.title), {
      className: 'next-project-image',
      sizes: '(max-width:760px) 100vw, 86vw',
      loading: 'lazy', fetchpriority: 'low'
    });

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
    $('#projectLightbox').setAttribute('aria-label', localized(project.title));
    $('#projectLightboxTitle').textContent = localized(project.title);
    $('#backHome').setAttribute('aria-label', t('backHome'));
    [['closeLightbox', 'close'], ['previousPhoto', 'previous'], ['nextPhoto', 'next']].forEach(([id, key]) => {
      $(`#${id}`).setAttribute('aria-label', t(key));
      $(`#${id}`).setAttribute('title', t(key));
    });
    $('#projectDescription').textContent = localized(project.description);
    $('#projectLocation').textContent = localized(project.location);
    $('.project-opening .text-link span').textContent = localCopy[state.lang]?.view || localCopy.en.view;

    const home = `../../?lang=${state.lang}#work`;
    $('#backHome').href = home;
    $('#brandHome').href = home;

    const { previous, next } = projectNeighbours();
    const previousLink = $('#previousProject');
    const nextLink = $('#nextProject');
    previousLink.href = `../${previous.id}/?lang=${state.lang}`;
    previousLink.querySelector('strong').textContent = localized(previous.title);
    nextLink.href = `../${next.id}/?lang=${state.lang}&frame=${encodeURIComponent(next.preview || next.cover)}`;
    nextLink.dataset.projectLink = next.id;
    nextLink.querySelector('strong').textContent = localized(next.title);
    renderContinuation(next);

    const url = new URL(location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setMeta();
  }

  function renderGallery() {
    const gallery = $('#story');
    gallery.innerHTML = '';

    project.photos.forEach((photo, index) => {
      const item = document.createElement('figure');
      item.className = `gallery-item reveal${photo.note ? ' has-note' : ''}`;
      const span = window.FOTODISOGNO_EXHIBITION?.[project.id]?.spans[index] || 6;
      item.dataset.frameSpan = String(span);
      item.style.setProperty('--frame-span', String(span));
      const preload = index < (mobile.matches ? 1 : 4);
      const note = localized(photo.note);
      item.innerHTML = `
        <button class="gallery-card" type="button" data-photo-index="${index}" data-cursor="View" aria-label="${escapeHtml(t('viewImage'))} ${index + 1}">
          <span class="gallery-media">${responsivePicture(photo.src, photo.alt, {
            className: 'gallery-image is-loading',
            sizes: span === 12 ? '(max-width:820px) 92vw, 90vw' : `(max-width:820px) 92vw, ${Math.ceil(span / 12 * 90)}vw`,
            loading: preload ? 'eager' : 'lazy', fetchpriority: 'auto', preload
          })}</span>
        </button>
        <figcaption class="gallery-caption"><span class="frame-number">${String(index+1).padStart(2,'0')} / ${String(project.photos.length).padStart(2,'0')}</span><span class="gallery-note">${escapeHtml(note)}</span></figcaption>
        ${localized(photo.story) ? `<details class="photo-story"><summary>${({nl:'Achter het beeld',en:'Behind the photograph',pl:'Historia zdjęcia'})[state.lang]}</summary><p>${escapeHtml(localized(photo.story))}</p></details>` : ''}`;
      gallery.appendChild(item);
    });

    prepareGalleryImages(gallery);
    bindCursorTargets(gallery);
    observeReveals();
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

  function lightboxSource(file) {
    const meta = imageManifest[file];
    if (!meta?.variants?.length) return imagePath(file);
    const bounds = $('.lightbox-image-wrap').getBoundingClientRect();
    const style = getComputedStyle($('.lightbox-image-wrap'));
    const width = bounds.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = bounds.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const displayedWidth = Math.min(width, height * meta.width / meta.height);
    const requestedWidth = Math.min(2400, Math.ceil(displayedWidth * Math.min(window.devicePixelRatio || 1, 3)));
    const variant = meta.variants.find(item => item.width >= requestedWidth) || meta.variants.at(-1);
    return `../../${variant.webp}`;
  }

  function preloadAround(index) {
    if (navigator.connection?.saveData) return;
    [-1, 1].forEach(offset => {
      const photo = project.photos[(index + offset + project.photos.length) % project.photos.length];
      const image = new Image();
      image.decoding = 'async';
      image.src = lightboxSource(photo.src);
    });
  }

  function fitLightboxImage(image, naturalWidth = image?.naturalWidth, naturalHeight = image?.naturalHeight) {
    if (!image || !naturalWidth || !naturalHeight) return;
    const wrap = $('.lightbox-image-wrap');
    const bounds = wrap.getBoundingClientRect();
    const style = getComputedStyle(wrap);
    const availableWidth = Math.max(1, bounds.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    const availableHeight = Math.max(1, bounds.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
    const scale = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1.6);
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
    const request = ++lightboxRequest;
    const image = $('#lightboxImage');
    const photo = project.photos[state.index];
    if (animate) image.classList.add('is-changing');
    $('#lightboxStatus').textContent = localCopy[state.lang].loading;
    const next = new Image();
    next.decoding = 'async';
    next.onload = () => {
      if (request !== lightboxRequest || !$('#projectLightbox').classList.contains('open')) return;
      $('#lightboxStatus').textContent = '';
      image.src = next.src;
      image.alt = photo.alt;
      fitLightboxImage(image, next.naturalWidth, next.naturalHeight);
      requestAnimationFrame(() => image.classList.remove('is-changing'));
    };
    next.onerror = () => {
      if (request !== lightboxRequest || !$('#projectLightbox').classList.contains('open')) return;
      image.removeAttribute('src'); image.alt = '';
      image.classList.remove('is-changing');
      $('#lightboxStatus').textContent = localCopy[state.lang].failed;
    };
    next.src = lightboxSource(photo.src);
    $('#lightboxCounter').textContent = `${String(state.index + 1).padStart(2, '0')} / ${String(project.photos.length).padStart(2, '0')}`;
    preloadAround(state.index);
  }

  function showLightboxUI() {
    const lightbox = $('#projectLightbox');
    lightbox.classList.remove('ui-hidden');
    clearTimeout(state.uiTimer);
    if (!(mobile.matches || matchMedia('(pointer:coarse)').matches)) state.uiTimer = setTimeout(() => lightbox.classList.add('ui-hidden'), 2000);
  }

  function openLightbox(index) {
    lightboxTrigger = document.activeElement;
    state.index = index;
    const lightbox = $('#projectLightbox');
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('overlay-open');
    document.documentElement.classList.add('overlay-open');
    $$('#projectMain, .project-header, .site-footer').forEach(node => { node.inert = true; });
    updateLightboxPhoto(false);
    showLightboxUI();
    requestAnimationFrame(() => $('#closeLightbox').focus({ preventScroll: true }));
  }

  function closeLightbox() {
    lightboxRequest += 1;
    state.touch = null;
    $('#lightboxStatus').textContent = '';
    const lightbox = $('#projectLightbox');
    lightbox.classList.remove('open', 'ui-hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('overlay-open');
    document.documentElement.classList.remove('overlay-open');
    const image = $('#lightboxImage');
    image.removeAttribute('src');
    image.removeAttribute('style');
    clearTimeout(state.uiTimer);
    $$('#projectMain, .project-header, .site-footer').forEach(node => { node.inert = false; });
    lightboxTrigger?.focus({ preventScroll: true });
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
    if (!hero) return;
    hero.alt = localized(project.title);
    body.dataset.theme = project.theme || 'warm';
    const exhibition = window.FOTODISOGNO_EXHIBITION?.[project.id];
    if(exhibition){body.style.setProperty('--series-accent',exhibition.accent);body.style.setProperty('--series-tint',exhibition.tint)}
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
    setTimeout(() => body.classList.add('is-ready'), 260);
  }


  function init() {
    const requested = new URL(location.href).searchParams.get('lang');
    state.lang = data.translations[requested] ? requested : 'nl';
    $('#projectYear').textContent = project.year;
    $('#year').textContent = new Date().getFullYear();
    setupHero();
    applyLanguage();
    renderGallery();
    $$('.project-continuation,.project-contact').forEach(node => node.classList.add('reveal'));
    observeReveals();
    bindCursorTargets();

    $$('[data-lang]').forEach(button => button.addEventListener('click', () => {
      state.lang = button.dataset.lang;
      applyLanguage();
      renderGallery();
    }));
    $('#story').addEventListener('click', event => {
      const button = event.target.closest('[data-photo-index]');
      if (button) openLightbox(Number(button.dataset.photoIndex));
    });
    $('#closeLightbox').addEventListener('click', closeLightbox);
    $('#previousPhoto').addEventListener('click', () => moveLightbox(-1));
    $('#nextPhoto').addEventListener('click', () => moveLightbox(1));

    const stage = $('#lightboxStage');
    let suppressBackdropClick = false;
    stage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.target.closest('button')) { state.touch = null; return; }
      state.touch = { x: event.clientX, y: event.clientY, id: event.pointerId };
    });
    stage.addEventListener('pointerup', event => {
      if (!state.touch || state.touch.id !== event.pointerId) return;
      const dx = event.clientX - state.touch.x;
      const dy = event.clientY - state.touch.y;
      state.touch = null;
      if ((window.visualViewport?.scale || 1) > 1.05) return;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) {
        suppressBackdropClick = true;
        moveLightbox(dx < 0 ? 1 : -1);
        setTimeout(() => { suppressBackdropClick = false; }, 350);
      }
    });
    stage.addEventListener('pointercancel', () => { state.touch = null; });
    stage.addEventListener('pointermove', showLightboxUI, { passive: true });

    const lightbox = $('#projectLightbox');
    lightbox.addEventListener('wheel', preventViewportScroll, { passive: false });
    lightbox.addEventListener('click', event => {
      showLightboxUI();
      if (suppressBackdropClick || (mobile.matches || matchMedia('(pointer:coarse)').matches)) return;
      if (event.target === lightbox || event.target === stage || event.target.classList.contains('lightbox-image-wrap')) closeLightbox();
    });

    addEventListener('mousemove', moveCursor, { passive: true });
    addEventListener('scroll', updateScrollState, { passive: true });
    addEventListener('resize', () => { updateScrollState(); fitCurrentLightboxImage(); }, { passive: true });
    window.visualViewport?.addEventListener('resize', () => { if ((window.visualViewport?.scale || 1) <= 1.05) fitCurrentLightboxImage(); }, { passive: true });
    document.addEventListener('keydown', event => {
      if (!lightbox.classList.contains('open')) return;
      if (event.key === 'Tab') {
        const controls = [$('#closeLightbox'), $('#previousPhoto'), $('#nextPhoto')];
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        showLightboxUI();
      }
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') { event.preventDefault(); moveLightbox(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); moveLightbox(1); }
    });

    updateScrollState();
    releaseLoadingScreen();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
