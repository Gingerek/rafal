(() => {
  const data = window.FOTODISOGNO;
  if (!data) return;

  const previews = {
    people:   { src: 'DSC04191-2.avif', tint: '#241713' },
    street:   { src: 'A7408793.jpg', tint: '#0e1b27' },
    nature:   { src: 'A7403102.avif', tint: '#102017' },
    travel:   { src: 'A7406608.jpg', tint: '#0d2029' },
    creative: { src: 'A7406311-2.avif', tint: '#25150e' }
  };

  const state = { lang: 'nl', active: 0 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const t = key => data.translations[state.lang]?.[key] || data.translations.en[key] || key;
  const localized = value => value?.[state.lang] || value?.en || '';
  const imagePath = file => `images/${file.split('/').map(encodeURIComponent).join('/')}`;
  const projectHref = id => `projects/${id}/?lang=${state.lang}`;

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
    renderProjects();
  }

  function renderProjects() {
    const rail = $('#projectRail');
    if (!rail) return;
    rail.innerHTML = '';

    data.projects.forEach((project, index) => {
      const config = previews[project.id] || { src: project.cover, tint: '#101820' };
      const panel = document.createElement('a');
      panel.className = 'project-panel reveal';
      panel.href = projectHref(project.id);
      panel.dataset.project = project.id;
      panel.dataset.projectIndex = String(index);
      panel.dataset.cursor = `OPEN ${String(index + 1).padStart(2, '0')}`;
      panel.style.setProperty('--panel-tint', config.tint);
      panel.innerHTML = `
        <div class="project-panel-copy">
          <span class="project-panel-index">${String(index + 1).padStart(2, '0')} / ${String(data.projects.length).padStart(2, '0')}</span>
          <h3>${localized(project.title)}</h3>
          <div class="project-panel-meta"><span>${project.year}</span><span>${localized(project.location)}</span></div>
          <p>${localized(project.description)}</p>
          <span class="project-panel-link">${t('openStory')} <i aria-hidden="true">↗</i></span>
        </div>
        <div class="project-panel-media">
          <img class="project-panel-backdrop" src="${imagePath(config.src)}" alt="" aria-hidden="true" loading="lazy" decoding="async">
          <img class="project-panel-image" src="${imagePath(config.src)}" alt="${localized(project.title)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">
          <span class="project-panel-scan" aria-hidden="true"></span>
          <span class="project-panel-corner">FDS / ${String(index + 1).padStart(2, '0')}</span>
        </div>`;

      panel.addEventListener('click', () => {
        const image = $('.project-panel-image', panel);
        if (image) {
          image.style.viewTransitionName = `project-${project.id}`;
          sessionStorage.setItem('fotodisogno-transition-project', project.id);
        }
      });
      rail.appendChild(panel);
    });

    observeReveals();
    observePanels();
    bindCursorTargets(rail);
    bindTilt(rail);
  }

  let panelObserver;
  function observePanels() {
    panelObserver?.disconnect();
    const panels = $$('.project-panel');
    panelObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number(visible.target.dataset.projectIndex || 0);
      state.active = index;
      panels.forEach((panel, panelIndex) => panel.classList.toggle('is-active', panelIndex === index));
      $('#railCurrent').textContent = String(index + 1).padStart(2, '0');
      $('#railProgress').style.width = `${((index + 1) / panels.length) * 100}%`;
      const project = data.projects[index];
      document.body.dataset.activeProject = project.id;
      const tint = previews[project.id]?.tint || '#101820';
      document.documentElement.style.setProperty('--active-glow', `${tint}66`);
    }, { threshold: [0.24, 0.42, 0.62], rootMargin: '-12% 0px -18%' });
    panels.forEach(panel => panelObserver.observe(panel));
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
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    }
    items.forEach(item => {
      item.classList.add('reveal-observed');
      revealObserver.observe(item);
    });
  }

  function bindTilt(root = document) {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.project-panel', root).forEach(panel => {
      panel.addEventListener('pointermove', event => {
        const rect = panel.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        panel.style.transform = `perspective(1400px) rotateX(${(-y * 1.7).toFixed(2)}deg) rotateY(${(x * 2.1).toFixed(2)}deg)`;
      });
      panel.addEventListener('pointerleave', () => { panel.style.transform = ''; });
    });
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

  function closeMenu() {
    $('#siteNav')?.classList.remove('open');
    $('#menuToggle')?.setAttribute('aria-expanded', 'false');
  }

  function updateScrollState() {
    $('#siteHeader')?.classList.toggle('scrolled', scrollY > 18);
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#scrollProgress').style.height = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
    const backdrop = $('.hero-backdrop');
    if (backdrop && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      backdrop.style.transform = `translate3d(0,${Math.min(scrollY * .025, 22)}px,0) scale(1.06)`;
    }
  }

  function init() {
    const requested = new URL(location.href).searchParams.get('lang');
    state.lang = data.translations[requested] ? requested : 'nl';
    $('#year').textContent = new Date().getFullYear();
    updateLanguage();
    $$('.projects-heading,.signal-section,.about-visual,.about-copy,.contact-section').forEach(node => node.classList.add('reveal'));
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

    const ready = () => document.body.classList.add('is-ready');
    addEventListener('load', () => setTimeout(ready, 420), { once: true });
    if (document.readyState === 'complete') setTimeout(ready, 420);
    setTimeout(ready, 1800);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
