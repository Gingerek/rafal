(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;

  const state = { lang: "nl" };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = key => data.translations[state.lang]?.[key] || data.translations.en[key] || key;
  const projectById = id => data.projects.find(project => project.id === id);
  const projectHref = id => `projects/${id}/?lang=${state.lang}`;
  const imagePath = file => `images/${file.split("/").map(encodeURIComponent).join("/")}`;

  function updateLanguage() {
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(node => {
      const value = t(node.dataset.i18n);
      if (value) node.textContent = value;
    });
    $$('[data-lang]').forEach(button => {
      button.classList.toggle('active', button.dataset.lang === state.lang);
      button.setAttribute('aria-pressed', String(button.dataset.lang === state.lang));
    });
    $$('[data-project-title]').forEach(node => {
      const project = projectById(node.dataset.projectTitle);
      if (project) node.textContent = project.title[state.lang] || project.title.en;
    });
    $$('[data-project-link]').forEach(link => { link.href = projectHref(link.dataset.projectLink); });

    const url = new URL(location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    document.title = state.lang === 'pl' ? 'FotodiSogno — Fotografia Rafała Wilka' : state.lang === 'nl' ? 'FotodiSogno — Fotografie door Rafał Wilk' : 'FotodiSogno — Photography by Rafał Wilk';
    renderCollections();
  }

  function renderCollections() {
    const grid = $('#collectionGrid');
    if (!grid) return;
    grid.innerHTML = '';
    data.projects.forEach(project => {
      const link = document.createElement('a');
      link.className = 'collection-card project-link reveal';
      link.href = projectHref(project.id);
      link.dataset.projectLink = project.id;
      link.dataset.cursor = 'view';
      link.innerHTML = `
        <img class="image-fade" src="${imagePath(project.cover)}" alt="${project.title[state.lang] || project.title.en}" loading="lazy" decoding="async" sizes="(max-width: 760px) 100vw, 60vw">
        <span class="collection-card-content">
          <span><span class="featured-meta">${project.year} · ${project.location[state.lang] || project.location.en}</span><h4>${project.title[state.lang] || project.title.en}</h4></span>
          <p>${project.description[state.lang] || project.description.en}</p>
        </span>`;
      grid.appendChild(link);
    });
    prepareImages(grid);
    observeReveals();
    bindProjectTransitions(grid);
    bindCursorTargets(grid);
  }

  function prepareImages(root = document) {
    $$('img.image-fade', root).forEach(image => {
      if (image.complete) image.classList.add('is-loaded');
      else image.addEventListener('load', () => image.classList.add('is-loaded'), { once: true });
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
      }, { rootMargin: '0px 0px -7% 0px', threshold: .08 });
    }
    items.forEach(item => {
      item.classList.add('reveal-observed');
      revealObserver.observe(item);
    });
  }

  function closeMenu() {
    $('#siteNav')?.classList.remove('open');
    $('#menuToggle')?.setAttribute('aria-expanded', 'false');
  }

  function setupParallax() {
    const image = $('#heroImage');
    if (!image || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      image.style.transform = `translate3d(0, ${Math.min(scrollY * .045, 34)}px, 0) scale(1.04)`;
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  function bindProjectTransitions(root = document) {
    $$('.project-link', root).forEach(link => {
      if (link.dataset.transitionBound === 'true') return;
      link.dataset.transitionBound = 'true';
      link.addEventListener('click', () => {
        const projectId = link.dataset.projectLink;
        const image = $('img', link);
        if (projectId && image) {
          image.style.viewTransitionName = `project-${projectId}`;
          sessionStorage.setItem('fotodisogno-transition-project', projectId);
        }
      });
    });
  }

  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  let cursorX = 0, cursorY = 0, cursorFrame = 0;

  function moveCursor(event) {
    cursorX = event.clientX;
    cursorY = event.clientY;
    if (!cursorFrame) {
      cursorFrame = requestAnimationFrame(() => {
        if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%) scale(${cursor.classList.contains('active') ? 1 : .5})`;
        cursorFrame = 0;
      });
    }
  }

  function bindCursorTargets(root = document) {
    if (!cursor || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-cursor]', root).forEach(target => {
      if (target.dataset.cursorBound === 'true') return;
      target.dataset.cursorBound = 'true';
      target.addEventListener('mouseenter', () => {
        cursorLabel.textContent = target.dataset.cursor === 'open' ? 'Open' : 'View';
        cursor.classList.add('active');
      });
      target.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  }

  function init() {
    const requested = new URL(location.href).searchParams.get('lang');
    state.lang = data.translations[requested] ? requested : 'nl';
    $('#year').textContent = new Date().getFullYear();
    updateLanguage();
    prepareImages();
    $$('.section-heading, .featured, .collections-header, .about-image-wrap, .about-copy, .contact-copy, .contact-actions').forEach(node => node.classList.add('reveal'));
    observeReveals();
    bindProjectTransitions();
    bindCursorTargets();
    setupParallax();

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
    addEventListener('scroll', () => $('#siteHeader')?.classList.toggle('scrolled', scrollY > 18), { passive: true });
    addEventListener('load', () => setTimeout(() => document.body.classList.add('is-ready'), 420), { once: true });
    if (document.readyState === 'complete') setTimeout(() => document.body.classList.add('is-ready'), 420);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
