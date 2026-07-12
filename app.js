(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;

  const previews = {
    people:   { src: 'DSC04191-2.avif', tint: '#21140f' },
    street:   { src: 'A7408846.avif', tint: '#0b1721' },
    nature:   { src: 'A7403102.avif', tint: '#0d1b12' },
    travel:   { src: 'A7406616.avif', tint: '#0a1a20' },
    creative: { src: 'A7406311-2.avif', tint: '#21120c' }
  };

  const homeCopy = {
    nl: {
      heroKicker: 'Fotografie / Nederland',
      heroIntro: 'Stille beelden van mensen, plaatsen en korte momenten die door licht worden gevormd.',
      manifestKicker: 'Een manier van kijken',
      manifestQuote: 'Licht onthult wat snelheid onzichtbaar maakt.'
    },
    en: {
      heroKicker: 'Photography / The Netherlands',
      heroIntro: 'Quiet photographs of people, places and brief moments shaped by light.',
      manifestKicker: 'A way of seeing',
      manifestQuote: 'Light reveals what speed makes invisible.'
    },
    pl: {
      heroKicker: 'Fotografia / Holandia',
      heroIntro: 'Spokojne fotografie ludzi, miejsc i krótkich chwil kształtowanych przez światło.',
      manifestKicker: 'Sposób patrzenia',
      manifestQuote: 'Światło odsłania to, czego nie widać w pośpiechu.'
    }
  };

  const state = { lang: 'nl', active: 0 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = key => data.translations[state.lang]?.[key] || data.translations.en[key] || key;
  const localized = value => value?.[state.lang] || value?.en || '';
  const imagePath = file => `images/${file.split('/').map(encodeURIComponent).join('/')}`;
  const projectHref = id => `projects/${id}/?lang=${state.lang}`;

  function updateStaticCopy() {
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(node => {
      const value = t(node.dataset.i18n);
      if (value) node.textContent = value;
    });
    $$('[data-home-copy]').forEach(node => {
      const value = homeCopy[state.lang]?.[node.dataset.homeCopy] || homeCopy.en[node.dataset.homeCopy];
      if (value) node.textContent = value;
    });
    $$('[data-lang]').forEach(button => {
      const active = button.dataset.lang === state.lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const url = new URL(location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    document.title = state.lang === 'pl'
      ? 'FotodiSogno — Fotografia Rafała Wilka'
      : state.lang === 'nl'
        ? 'FotodiSogno — Fotografie door Rafał Wilk'
        : 'FotodiSogno — Photography by Rafał Wilk';
  }

  function renderHeroIndex() {
    const index = $('#heroProjectIndex');
    if (!index) return;
    index.innerHTML = data.projects.map((project, projectIndex) => `
      <a href="#chapter-${project.id}" data-index="${projectIndex}">
        <span>${localized(project.title)}</span><i aria-hidden="true">↘</i>
      </a>`).join('');
  }

  function transitionToProject(event, project, image) {
    if (!image) return;
    image.style.viewTransitionName = `project-${project.id}`;
    sessionStorage.setItem('fotodisogno-transition-project', project.id);
  }

  function renderProjects() {
    const rail = $('#projectRail');
    if (!rail) return;
    rail.innerHTML = '';

    data.projects.forEach((project, index) => {
      const config = previews[project.id] || { src: project.cover, tint: '#111111' };
      const chapter = document.createElement('article');
      chapter.className = 'project-chapter reveal';
      chapter.id = `chapter-${project.id}`;
      chapter.dataset.project = project.id;
      chapter.dataset.projectIndex = String(index);
      chapter.style.setProperty('--chapter-tint', config.tint);
      chapter.innerHTML = `
        <div class="chapter-media">
          <a href="${projectHref(project.id)}" data-cursor="View" aria-label="${t('openStory')}: ${localized(project.title)}">
            <img class="chapter-image" src="${imagePath(config.src)}" alt="${localized(project.title)}" loading="eager" fetchpriority="${index < 2 ? 'high' : 'auto'}" decoding="async" data-preload>
          </a>
        </div>
        <div class="chapter-copy">
          <h3>${localized(project.title)}</h3>
          <div class="chapter-meta"><span>${project.year}</span><span>${localized(project.location)}</span></div>
          <p>${localized(project.description)}</p>
          <a class="text-link" href="${projectHref(project.id)}" data-cursor="View"><span>${t('openStory')}</span><i aria-hidden="true">↗</i></a>
        </div>`;

      const image = $('.chapter-image', chapter);
      $$('a[href]', chapter).forEach(link => link.addEventListener('click', event => transitionToProject(event, project, image)));
      rail.appendChild(chapter);
    });

    observeReveals();
    observeChapters();
    bindCursorTargets(rail);
  }

  function updateLanguage() {
    updateStaticCopy();
    renderHeroIndex();
    renderProjects();
  }

  let chapterObserver;
  function observeChapters() {
    chapterObserver?.disconnect();
    const chapters = $$('.project-chapter');
    if (!('IntersectionObserver' in window)) return;
    chapterObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number(visible.target.dataset.projectIndex || 0);
      state.active = index;
      chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle('is-active', chapterIndex === index));
      $$('#heroProjectIndex a').forEach((link, linkIndex) => link.classList.toggle('active', linkIndex === index));
      const project = data.projects[index];
      const tint = previews[project.id]?.tint || '#111111';
      document.documentElement.style.setProperty('--page-tint', tint);
    }, { threshold: [0.25, 0.5, 0.72], rootMargin: '-10% 0px -14%' });
    chapters.forEach(chapter => chapterObserver.observe(chapter));
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
      }, { rootMargin: '0px 0px -7% 0px', threshold: .07 });
    }
    items.forEach(item => {
      item.classList.add('reveal-observed');
      revealObserver.observe(item);
    });
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

  function closeMenu() {
    $('#siteNav')?.classList.remove('open');
    $('#menuToggle')?.setAttribute('aria-expanded', 'false');
  }

  function updateScrollState() {
    $('#siteHeader')?.classList.toggle('scrolled', scrollY > 18);
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

  async function releaseLoadingScreen(forceReturnDelay = false) {
    const returning = forceReturnDelay || sessionStorage.getItem('fotodisogno-return-home') === '1';
    sessionStorage.removeItem('fotodisogno-return-home');
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
    setTimeout(() => document.body.classList.add('is-ready'), returning ? 2000 : 320);
  }

  function init() {
    const requested = new URL(location.href).searchParams.get('lang');
    state.lang = data.translations[requested] ? requested : 'nl';
    $('#year').textContent = new Date().getFullYear();
    updateLanguage();
    $$('.projects-heading,.manifest-section,.about-visual,.about-copy,.contact-section').forEach(node => node.classList.add('reveal'));
    observeReveals();
    bindCursorTargets();

    $$('[data-lang]').forEach(button => button.addEventListener('click', () => {
      state.lang = button.dataset.lang;
      updateLanguage();
    }));
    $('#menuToggle')?.addEventListener('click', () => {
      const open = !$('#siteNav').classList.contains('open');
      $('#siteNav').classList.toggle('open', open);
      $('#menuToggle').setAttribute('aria-expanded', String(open));
    });
    $$('.main-nav a').forEach(link => link.addEventListener('click', closeMenu));
    addEventListener('mousemove', moveCursor, { passive: true });
    addEventListener('scroll', updateScrollState, { passive: true });
    addEventListener('resize', updateScrollState, { passive: true });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    updateScrollState();
    releaseLoadingScreen();
  }

  addEventListener('pageshow', event => {
    if (event.persisted && sessionStorage.getItem('fotodisogno-return-home') === '1') {
      document.body.classList.remove('is-ready');
      releaseLoadingScreen(true);
    }
  });

  document.addEventListener('DOMContentLoaded', init);
})();
