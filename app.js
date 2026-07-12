(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;

  const previewConfig = {
    people:   { src: 'DSC04191-2.avif', position: 'center 44%', fit: 'cover', tint: '#241713' },
    street:   { src: 'A7408793.jpg', position: 'center', fit: 'cover', tint: '#111a22' },
    nature:   { src: 'A7403102.avif', position: 'center', fit: 'contain', tint: '#142016' },
    travel:   { src: 'A7406608.jpg', position: 'center', fit: 'cover', tint: '#102027' },
    creative: { src: 'A7406311-2.avif', position: 'center', fit: 'cover', tint: '#231710' }
  };

  const state = { lang: 'nl', active: 0, layer: 0 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = key => data.translations[state.lang]?.[key] || data.translations.en[key] || key;
  const projectHref = id => `projects/${id}/?lang=${state.lang}`;
  const imagePath = file => `images/${file.split('/').map(encodeURIComponent).join('/')}`;
  const projectTitle = project => project.title[state.lang] || project.title.en;
  const projectDescription = project => project.description[state.lang] || project.description.en;
  const projectLocation = project => project.location[state.lang] || project.location.en;

  function updateLanguage() {
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

    const url = new URL(location.href);
    url.searchParams.set('lang', state.lang);
    history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    document.title = state.lang === 'pl'
      ? 'FotodiSogno — Fotografia Rafała Wilka'
      : state.lang === 'nl'
        ? 'FotodiSogno — Fotografie door Rafał Wilk'
        : 'FotodiSogno — Photography by Rafał Wilk';

    renderProjectIndex();
  }

  function renderProjectIndex() {
    const list = $('#projectList');
    if (!list) return;
    list.innerHTML = '';

    data.projects.forEach((project, index) => {
      const link = document.createElement('a');
      link.className = 'project-index-row project-link reveal';
      link.href = projectHref(project.id);
      link.dataset.projectLink = project.id;
      link.dataset.projectIndex = String(index);
      link.dataset.cursor = 'view';
      link.dataset.cursorLabel = `View ${String(index + 1).padStart(2, '0')}`;
      link.innerHTML = `
        <span class="project-index-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="project-index-title">${projectTitle(project)}</span>
        <span class="project-index-meta">${project.year}<br>${projectLocation(project)}</span>
        <span class="project-index-arrow" aria-hidden="true">↗</span>`;
      link.addEventListener('mouseenter', () => activateProject(index));
      link.addEventListener('focus', () => activateProject(index));
      list.appendChild(link);
    });

    observeReveals();
    observeProjectRows();
    bindProjectTransitions(list);
    bindCursorTargets(list);
    activateProject(Math.min(state.active, data.projects.length - 1), true);
  }

  function activateProject(index, immediate = false) {
    const project = data.projects[index];
    if (!project) return;
    state.active = index;

    $$('.project-index-row').forEach((row, rowIndex) => {
      row.classList.toggle('is-active', rowIndex === index);
      row.setAttribute('aria-current', rowIndex === index ? 'true' : 'false');
    });

    const config = previewConfig[project.id] || {
      src: project.cover,
      position: project.position || 'center',
      fit: 'cover',
      tint: '#171717'
    };

    const layers = [$('#previewImageA'), $('#previewImageB')];
    const outgoing = layers[state.layer];
    const incoming = layers[1 - state.layer];
    incoming.src = imagePath(config.src);
    incoming.alt = projectTitle(project);
    incoming.style.objectPosition = config.position;
    incoming.style.objectFit = config.fit;
    incoming.classList.toggle('is-contained', config.fit === 'contain');
    incoming.style.zIndex = '2';
    outgoing.style.zIndex = '1';

    const reveal = () => {
      if (immediate) {
        incoming.classList.add('is-active');
        outgoing.classList.remove('is-active');
      } else {
        incoming.classList.remove('is-active');
        requestAnimationFrame(() => incoming.classList.add('is-active'));
        setTimeout(() => outgoing.classList.remove('is-active'), 90);
      }
      state.layer = 1 - state.layer;
    };
    if (incoming.complete) reveal();
    else incoming.addEventListener('load', reveal, { once: true });

    $('#projectPreviewNumber').textContent = String(index + 1).padStart(2, '0');
    $('#projectPreviewMeta').textContent = `${project.year} · ${projectLocation(project)}`;
    $('#projectPreviewTitle').textContent = projectTitle(project);
    $('#projectPreviewDescription').textContent = projectDescription(project);
    $('#projectPreviewLink').href = projectHref(project.id);
    $('#projectPreviewLink').dataset.projectLink = project.id;
    $('#projectPreviewProgress').style.width = `${((index + 1) / data.projects.length) * 100}%`;
    $('#projectPreviewMedia').style.setProperty('--preview-tint', config.tint);
    document.documentElement.style.setProperty('--active-project-tint', config.tint);
  }

  let rowObserver;
  function observeProjectRows() {
    if (!('IntersectionObserver' in window) || innerWidth > 980) return;
    rowObserver?.disconnect();
    rowObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top - innerHeight * .45) - Math.abs(b.boundingClientRect.top - innerHeight * .45));
      if (visible[0]) activateProject(Number(visible[0].target.dataset.projectIndex));
    }, { rootMargin: '-30% 0px -45% 0px', threshold: .01 });
    $$('.project-index-row').forEach(row => rowObserver.observe(row));
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
    const hero = $('#heroImage');
    const visual = $('#visualBreakImage');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      if (hero) hero.style.transform = `translate3d(0, ${Math.min(scrollY * .035, 26)}px, 0) scale(1.035)`;
      if (visual) {
        const rect = visual.parentElement.getBoundingClientRect();
        const offset = Math.max(-28, Math.min(28, (innerHeight / 2 - (rect.top + rect.height / 2)) * .035));
        visual.style.transform = `translate3d(0, ${offset}px, 0) scale(1.045)`;
      }
      ticking = false;
    };
    addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function bindProjectTransitions(root = document) {
    $$('.project-link', root).forEach(link => {
      if (link.dataset.transitionBound === 'true') return;
      link.dataset.transitionBound = 'true';
      link.addEventListener('click', () => {
        const projectId = link.dataset.projectLink;
        const image = $('img.is-active, img', link);
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
    document.documentElement.style.setProperty('--pointer-x', `${cursorX}px`);
    document.documentElement.style.setProperty('--pointer-y', `${cursorY}px`);
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
        cursorLabel.textContent = target.dataset.cursorLabel || (target.dataset.cursor === 'open' ? 'Open' : 'View');
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
    $$('.section-heading, .project-index-shell, .visual-break, .about-image-wrap, .about-copy, .contact-copy, .contact-actions').forEach(node => node.classList.add('reveal'));
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
    addEventListener('resize', observeProjectRows, { passive: true });
    addEventListener('scroll', () => $('#siteHeader')?.classList.toggle('scrolled', scrollY > 18), { passive: true });
    addEventListener('load', () => setTimeout(() => document.body.classList.add('is-ready'), 420), { once: true });
    if (document.readyState === 'complete') setTimeout(() => document.body.classList.add('is-ready'), 420);
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  document.addEventListener('DOMContentLoaded', init);
})();