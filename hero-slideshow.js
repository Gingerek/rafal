(() => {
  'use strict';
  const host = document.querySelector('#heroMedia');
  if (!host || !window.FOTODISOGNO) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const manifest = window.FOTODISOGNO_IMAGES || {};
  const projects = window.FOTODISOGNO.projects;
  const slides = [], seen = new Set();
  // Alternate collections and formats instead of filtering mobile to portraits.
  const queues = projects.map(project => {
    const photos = project.photos.filter(photo => manifest[photo.src]?.variants?.length);
    const wide = photos.filter(photo => manifest[photo.src].width >= manifest[photo.src].height);
    const tall = photos.filter(photo => manifest[photo.src].width < manifest[photo.src].height);
    const mixed = [];
    while (wide.length || tall.length) {
      if (wide.length) mixed.push(wide.shift());
      if (tall.length) mixed.push(tall.shift());
    }
    return { project, photos: mixed };
  });
  while (queues.some(queue => queue.photos.length)) {
    for (const { project, photos } of queues) {
      const photo = photos.shift();
      if (!photo || seen.has(photo.src)) continue;
      seen.add(photo.src);
      slides.push({ ...photo, project, title: project.title });
    }
  }
  if (!slides.length) return;
  const interval = 5500;
  let index = 0, timer, generation = 0, prepared, busy = false;
  let paused = reduced.matches;
  const local = value => value?.[document.documentElement.lang] || value?.en || '';
  const words = {
    prev: { pl: 'Poprzednie zdjęcie', en: 'Previous photograph', nl: 'Vorige foto' },
    next: { pl: 'Następne zdjęcie', en: 'Next photograph', nl: 'Volgende foto' },
    pause: { pl: 'Wstrzymaj pokaz', en: 'Pause slideshow', nl: 'Diavoorstelling pauzeren' },
    play: { pl: 'Włącz pokaz', en: 'Play slideshow', nl: 'Diavoorstelling afspelen' },
    open: { pl: 'Otwórz galerię', en: 'Open gallery', nl: 'Open de galerij' }
  };
  const controls = document.createElement('div'); controls.className = 'hero-play-controls';
  function control(symbol, action) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = symbol;
    button.addEventListener('click', action); controls.append(button); return button;
  }
  const previousButton = control('←', () => show(index - 1));
  const playbackButton = control('Ⅱ', () => { paused = !paused; labels(); schedule(); });
  const nextButton = control('→', () => show(index + 1));
  document.querySelector('.hero-bottom').append(controls);
  const previews = document.createElement('div'); previews.className = 'hero-preview-strip';
  document.querySelector('.cinema-frame').append(previews);
  const progress = document.createElement('div'); progress.className = 'hero-slide-progress';
  progress.setAttribute('aria-hidden', 'true'); progress.append(document.createElement('span'));
  document.querySelector('.cinema-frame').append(progress);
  function image(item, thumb = false) {
    const meta = manifest[item.src], img = document.createElement('img');
    // The main image always uses the largest existing export. No crop or enlargement animation.
    const variant = thumb ? meta.variants.find(v => v.width >= 480) || meta.variants[0] : meta.variants.at(-1);
    img.src = variant.webp; img.width = meta.width; img.height = meta.height;
    img.alt = thumb ? '' : item.alt || local(item.title); img.decoding = 'async'; img.draggable = false;
    return img;
  }
  function prepare(next) {
    const item = slides[next], wrapper = document.createElement('a');
    wrapper.className = 'hero-slide'; wrapper.setAttribute('aria-hidden', 'true'); wrapper.tabIndex = -1;
    wrapper.href = `projects/${item.project.id}/?lang=${document.documentElement.lang}&frame=${encodeURIComponent(item.src)}`;
    const img = image(item); wrapper.append(img); host.append(wrapper);
    return { next, wrapper, ready: img.decode().then(() => true, () => false) };
  }
  function labels() {
    const item = slides[index];
    document.querySelector('#heroFrameNumber').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    document.querySelector('#heroCaption').textContent = local(item.title);
    previousButton.setAttribute('aria-label', local(words.prev)); nextButton.setAttribute('aria-label', local(words.next));
    playbackButton.setAttribute('aria-label', local(paused ? words.play : words.pause));
    playbackButton.textContent = paused ? '▶' : 'Ⅱ';
    const current = host.querySelector('.is-current');
    if (current) {
      current.href = `projects/${item.project.id}/?lang=${document.documentElement.lang}&frame=${encodeURIComponent(item.src)}`;
      current.setAttribute('aria-label', `${local(words.open)}: ${local(item.title)}`);
    }
    document.querySelector('.cinema-frame').style.setProperty('--slide-accent', window.FOTODISOGNO_EXHIBITION?.[item.project.id]?.accent || '#b5d6e6');
    document.body.classList.toggle('hero-is-paused', paused || document.hidden);
    previews.replaceChildren();
    for (let offset = 1; offset <= Math.min(4, slides.length - 1); offset++) {
      const target = (index + offset) % slides.length, next = slides[target];
      const button = document.createElement('button'); button.type = 'button';
      button.setAttribute('aria-label', `${local(words.next)}: ${local(next.title)}`);
      button.append(image(next, true)); button.addEventListener('click', () => show(target)); previews.append(button);
    }
  }
  function schedule() {
    clearTimeout(timer);
    const bar = progress.firstElementChild;
    bar.getAnimations().forEach(animation => animation.cancel());
    if (paused || document.hidden || slides.length < 2) return;
    if (!reduced.matches) bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: interval, fill: 'forwards' });
    timer = setTimeout(() => show(index + 1), interval);
  }
  async function show(requested, initial = false) {
    if (busy) return;
    busy = true; clearTimeout(timer);
    const next = (requested + slides.length) % slides.length, version = ++generation;
    const target = prepared?.next === next ? prepared : prepare(next);
    if (prepared && prepared !== target) prepared.wrapper.remove();
    prepared = null;
    const ready = await target.ready;
    if (version !== generation) { target.wrapper.remove(); busy = false; return; }
    if (ready) {
      const old = host.querySelector('.is-current');
      target.wrapper.classList.add('is-current'); target.wrapper.removeAttribute('aria-hidden'); target.wrapper.tabIndex = 0;
      old?.classList.remove('is-current'); old?.setAttribute('aria-hidden', 'true'); if (old) old.tabIndex = -1;
      if (old && !reduced.matches && !initial) {
        const direction = requested < index ? -1 : 1;
        target.wrapper.animate([{ opacity: 0, transform: `translateX(${direction * 34}px) rotate(${direction * .6}deg)` }, { opacity: 1, transform: 'translateX(0) rotate(0deg)' }], { duration: 850, easing: 'cubic-bezier(.22,1,.36,1)' });
        const outgoing = old.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: `translateX(${-direction * 22}px)` }], { duration: 650, fill: 'forwards', easing: 'ease-out' });
        outgoing.finished.then(() => old.remove(), () => old.remove());
      } else old?.remove();
      index = next; labels();
    } else target.wrapper.remove();
    busy = false; prepared = prepare((next + 1) % slides.length); schedule();
  }
  let touchStart, suppressClick = false;
  host.addEventListener('touchstart', event => { suppressClick = false; touchStart = event.touches[0]?.clientX; }, { passive: true });
  host.addEventListener('touchend', event => {
    const delta = event.changedTouches[0]?.clientX - touchStart;
    if (Math.abs(delta) > 45) { suppressClick = true; show(index + (delta < 0 ? 1 : -1)); }
    touchStart = undefined;
  }, { passive: true });
  // A horizontal swipe changes the frame instead of following the photo link.
  host.addEventListener('click', event => { if (busy || suppressClick) { event.preventDefault(); suppressClick = false; } });
  document.addEventListener('visibilitychange', () => { labels(); schedule(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; labels(); schedule(); });
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  show(0, true);
})();
