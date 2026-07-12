(() => {
  const data = window.FOTODISOGNO;
  if (!data?.translations) return;

  const copy = {
    nl: { gallery: 'Bekijk de galerij', photo: 'Foto openen', nextGallery: 'Ga verder naar de volgende galerij' },
    en: { gallery: 'View gallery', photo: 'Open photo', nextGallery: 'Continue to the next gallery' },
    pl: { gallery: 'Zobacz galerię', photo: 'Otwórz zdjęcie', nextGallery: 'Przejdź do następnej galerii' }
  };

  Object.entries(copy).forEach(([lang, labels]) => {
    if (!data.translations[lang]) return;
    data.translations[lang].openStory = labels.gallery;
    data.translations[lang].viewImage = labels.photo;
    data.translations[lang].continueStory = labels.nextGallery;
  });

  const currentLanguage = () => {
    const requested = new URL(location.href).searchParams.get('lang');
    if (copy[requested]) return requested;
    const active = document.querySelector('[data-lang].active')?.dataset.lang;
    if (copy[active]) return active;
    return copy[document.documentElement.lang] ? document.documentElement.lang : 'nl';
  };

  const injectHomeHints = () => {
    const lang = currentLanguage();
    document.querySelectorAll('.project-chapter').forEach(chapter => {
      const link = chapter.querySelector('.chapter-media a');
      if (!link) return;
      const project = data.projects.find(item => item.id === chapter.dataset.project);
      let hint = link.querySelector('.chapter-action');
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'interaction-hint chapter-action';
        hint.setAttribute('aria-hidden', 'true');
        link.appendChild(hint);
      }
      hint.innerHTML = `<span>${copy[lang].gallery}</span><strong>${project?.photos?.length || ''}</strong><i>↗</i>`;
    });
  };

  const injectGalleryHints = () => {
    const lang = currentLanguage();
    document.querySelectorAll('.gallery-card').forEach(card => {
      let hint = card.querySelector('.gallery-action');
      if (!hint) {
        hint = document.createElement('span');
        hint.className = 'interaction-hint gallery-action';
        hint.setAttribute('aria-hidden', 'true');
        card.appendChild(hint);
      }
      hint.innerHTML = `<span>${copy[lang].photo}</span><i>↗</i>`;
    });
  };

  const refresh = () => {
    injectHomeHints();
    injectGalleryHints();
  };

  document.addEventListener('DOMContentLoaded', () => {
    refresh();
    const observer = new MutationObserver(() => refresh());
    ['projectRail', 'story'].forEach(id => {
      const node = document.getElementById(id);
      if (node) observer.observe(node, { childList: true, subtree: true });
    });
    document.querySelectorAll('[data-lang]').forEach(button => {
      button.addEventListener('click', () => setTimeout(refresh, 0));
    });
  });
})();
