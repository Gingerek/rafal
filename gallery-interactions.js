(() => {
  const data = window.FOTODISOGNO;
  if (!data?.translations) return;

  const copy = {
    nl: {
      gallery: 'Bekijk de galerij',
      photo: 'Foto openen',
      nextGallery: 'Ga verder naar de volgende galerij',
      photos: 'foto’s',
      aboutRole: 'Fotograaf'
    },
    en: {
      gallery: 'View gallery',
      photo: 'Open photo',
      nextGallery: 'Continue to the next gallery',
      photos: 'photos',
      aboutRole: 'Photographer'
    },
    pl: {
      gallery: 'Zobacz galerię',
      photo: 'Otwórz zdjęcie',
      nextGallery: 'Przejdź do następnej galerii',
      photos: 'zdjęć',
      aboutRole: 'Fotograf'
    }
  };

  Object.entries(copy).forEach(([lang, labels]) => {
    const translations = data.translations[lang];
    if (!translations) return;
    translations.openStory = labels.gallery;
    translations.viewImage = labels.photo;
    translations.continueStory = labels.nextGallery;
  });

  const imageManifest = window.FOTODISOGNO_IMAGES || {};
  const layoutClasses = ['layout-classic', 'layout-panorama', 'layout-portrait', 'layout-diptych', 'layout-finale'];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = value => String(value).replace(/[&<>\"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

  const currentLanguage = () => {
    const requested = new URL(location.href).searchParams.get('lang');
    if (copy[requested]) return requested;
    const active = $('[data-lang].active')?.dataset.lang;
    if (copy[active]) return active;
    return copy[document.documentElement.lang] ? document.documentElement.lang : 'nl';
  };

  const localized = value => {
    const lang = currentLanguage();
    return value?.[lang] || value?.en || '';
  };

  function responsivePicture(file, alt, prefix = '') {
    const meta = imageManifest[file];
    const fallback = `${prefix}images/${file.split('/').map(encodeURIComponent).join('/')}`;
    if (!meta?.variants?.length) {
      return `<picture class="responsive-picture chapter-secondary-picture"><img class="chapter-secondary-image" src="${fallback}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"></picture>`;
    }
    const avif = meta.variants.map(item => `${prefix}${item.avif} ${item.width}w`).join(',');
    const webp = meta.variants.map(item => `${prefix}${item.webp} ${item.width}w`).join(',');
    const fallbackVariant = `${prefix}${meta.variants[meta.variants.length - 1].webp}`;
    return `<picture class="responsive-picture chapter-secondary-picture">
      <source type="image/avif" srcset="${avif}" sizes="(max-width:760px) 92vw, 44vw">
      <source type="image/webp" srcset="${webp}" sizes="(max-width:760px) 92vw, 44vw">
      <img class="chapter-secondary-image" src="${fallbackVariant}" width="${meta.width}" height="${meta.height}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
    </picture>`;
  }

  function titleClass(title) {
    const length = String(title || '').trim().length;
    if (length >= 22) return 'title-extra-long';
    if (length >= 14) return 'title-long';
    return 'title-standard';
  }

  function galleryHintMarkup(project, lang) {
    const count = project?.photos?.length || 0;
    return `<span>${copy[lang].gallery}</span><em>·</em><strong>${count} ${copy[lang].photos}</strong><i>↗</i>`;
  }

  function photoHintMarkup(lang) {
    return `<span>${copy[lang].photo}</span><i>↗</i>`;
  }

  function enhanceBranding() {
    $$('.brand').forEach(brand => {
      if (brand.querySelector('.brand-mark')) return;
      brand.insertAdjacentHTML('afterbegin', '<span class="brand-mark" aria-hidden="true">FS</span>');
    });
  }

  function enhanceAbout() {
    const figure = $('.about-photo');
    if (!figure) return;
    let caption = $('.about-photo-caption', figure);
    if (!caption) {
      caption = document.createElement('figcaption');
      caption.className = 'about-photo-caption';
      caption.innerHTML = '<strong>Rafał Wilk</strong><span></span>';
      figure.appendChild(caption);
    }
    $('span', caption).textContent = copy[currentLanguage()].aboutRole;
  }

  function enhanceHome() {
    const chapters = $$('.project-chapter');
    if (!chapters.length) return;
    const lang = currentLanguage();

    chapters.forEach((chapter, index) => {
      const project = data.projects.find(item => item.id === chapter.dataset.project);
      if (!project) return;

      chapter.classList.remove(...layoutClasses);
      chapter.classList.add(layoutClasses[index] || 'layout-classic');

      const title = $('.chapter-copy h3', chapter);
      if (title) {
        title.classList.remove('title-standard', 'title-long', 'title-extra-long');
        title.classList.add(titleClass(localized(project.title)));
      }

      const link = $('.chapter-media a', chapter);
      if (!link) return;
      link.setAttribute('aria-label', `${copy[lang].gallery}: ${localized(project.title)}`);

      let hint = $('.chapter-action', link);
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'interaction-hint chapter-action';
        hint.setAttribute('aria-hidden', 'true');
        link.appendChild(hint);
      }
      const markup = galleryHintMarkup(project, lang);
      if (hint.innerHTML !== markup) hint.innerHTML = markup;

      if (index === 3) {
        const secondPhoto = project.photos?.find(photo => photo.src !== project.preview && photo.src !== project.cover);
        if (secondPhoto && !$('.chapter-secondary-picture', link)) {
          hint.insertAdjacentHTML('beforebegin', responsivePicture(secondPhoto.src, `${localized(project.title)} — 2`));
        }
      } else {
        $('.chapter-secondary-picture', link)?.remove();
      }
    });
  }

  function enhanceProject() {
    const lang = currentLanguage();
    const projectTitle = $('#projectTitle');
    if (projectTitle) {
      projectTitle.classList.remove('title-standard', 'title-long', 'title-extra-long');
      projectTitle.classList.add(titleClass(projectTitle.textContent));
    }

    const items = $$('.gallery-item');
    items.forEach((item, index) => {
      item.classList.remove('gallery-feature-primary', 'gallery-companion', 'gallery-feature-wide', 'gallery-sequence-start', 'gallery-ending');
      if (index === 0) item.classList.add('gallery-feature-primary');
      else if (index === 1) item.classList.add('gallery-companion');
      if (index === 4 || index === 7) item.classList.add('gallery-feature-wide');
      if (index === 5) item.classList.add('gallery-sequence-start');
      if (index === items.length - 1) item.classList.add('gallery-ending');

      const card = $('.gallery-card', item);
      if (!card) return;
      card.setAttribute('data-cursor', copy[lang].photo);
      let hint = $('.gallery-action', card);
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'interaction-hint gallery-action';
        hint.setAttribute('aria-hidden', 'true');
        card.appendChild(hint);
      }
      const markup = photoHintMarkup(lang);
      if (hint.innerHTML !== markup) hint.innerHTML = markup;
    });
  }

  function refresh() {
    enhanceBranding();
    enhanceAbout();
    enhanceHome();
    enhanceProject();
  }

  let motionFrame = 0;
  function updateMotion() {
    motionFrame = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('.project-chapter').forEach(chapter => {
      const rect = chapter.getBoundingClientRect();
      const range = innerHeight + rect.height;
      const progress = range > 0 ? (innerHeight - rect.top) / range - 0.5 : 0;
      const shift = Math.max(-8, Math.min(8, progress * 16));
      chapter.style.setProperty('--media-shift', `${shift.toFixed(2)}px`);
    });
  }

  function requestMotionUpdate() {
    if (motionFrame) return;
    motionFrame = requestAnimationFrame(updateMotion);
  }

  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    requestMotionUpdate();

    const observer = new MutationObserver(() => {
      refresh();
      requestMotionUpdate();
    });
    ['projectRail', 'story'].forEach(id => {
      const node = document.getElementById(id);
      if (node) observer.observe(node, { childList: true });
    });

    $$('[data-lang]').forEach(button => {
      button.addEventListener('click', () => setTimeout(refresh, 0));
    });
    addEventListener('scroll', requestMotionUpdate, { passive: true });
    addEventListener('resize', requestMotionUpdate, { passive: true });
  });
})();