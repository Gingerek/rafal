(() => {
  const data = window.FOTODISOGNO;
  const body = document.body;
  const project = data?.projects.find(item => item.id === body.dataset.project);
  if (!project) return;

  const manifest = window.FOTODISOGNO_IMAGES || {};
  const title = project.title.en;
  const imagePath = file => `../../images/${file.split('/').map(encodeURIComponent).join('/')}`;
  const meta = manifest[project.cover];
  const heroMarkup = meta?.variants?.length
    ? `<picture class="responsive-picture"><source type="image/avif" srcset="${meta.variants.map(item => `../../${item.avif} ${item.width}w`).join(',')}" sizes="(max-width:760px) 100vw, 62vw"><source type="image/webp" srcset="${meta.variants.map(item => `../../${item.webp} ${item.width}w`).join(',')}" sizes="(max-width:760px) 100vw, 62vw"><img id="projectHeroImage" src="../../${meta.variants[meta.variants.length - 1].webp}" width="${meta.width}" height="${meta.height}" alt="${title}" fetchpriority="high" decoding="async" data-preload></picture>`
    : `<img id="projectHeroImage" src="${imagePath(project.cover)}" alt="${title}" fetchpriority="high" decoding="async" data-preload>`;

  body.insertAdjacentHTML('afterbegin', `
    <a class="skip-link" href="#projectMain">Skip to content</a>
    <div class="boot-screen" id="bootScreen" aria-hidden="true"><span class="boot-name">FotodiSogno</span><span class="boot-progress" id="bootProgress">0%</span></div>
    <div class="cursor" id="cursor" aria-hidden="true"><span id="cursorLabel">View</span></div>
    <div class="scroll-progress" aria-hidden="true"><span id="scrollProgress"></span></div>

    <header class="project-header" id="projectHeader">
      <a class="project-back" id="backHome" href="../../#work"><span aria-hidden="true">←</span><span data-i18n="backHome">Back to portfolio</span></a>
      <a class="brand" id="brandHome" href="../../" aria-label="FotodiSogno — home"><span><b>FotodiSogno</b><small>Rafał Wilk Photography</small></span></a>
      <div class="language-switcher" aria-label="Language"><button type="button" data-lang="nl">NL</button><button type="button" data-lang="en">EN</button><button type="button" data-lang="pl">PL</button></div>
    </header>

    <main id="projectMain">
      <section class="project-opening" aria-labelledby="projectTitle">
        <figure class="project-opening-media reveal-media">${heroMarkup}</figure>
        <div class="project-opening-copy">
          <div class="project-meta"><span id="projectLocation">${project.location.en}</span><span id="projectYear">${project.year}</span></div>
          <h1 id="projectTitle">${title}</h1>
          <p id="projectDescription">${project.description.en}</p>
          <a class="text-link" href="#story"><span>View photographs</span><i aria-hidden="true">↓</i></a>
        </div>
      </section>

      <section class="gallery-section" aria-label="${title} photography">
        <header class="gallery-heading"><p class="section-kicker" data-i18n="selectedFrames">Selected photographs</p></header>
        <div class="gallery-grid" id="story"></div>
      </section>

      <section class="project-continuation reveal" aria-label="Project navigation">
        <div class="continuation-top">
          <a class="previous-project-link" id="previousProject" href="#"><span aria-hidden="true">←</span><small data-i18n="previousProject">Previous project</small><strong></strong></a>
          <p data-i18n="continueStory">Continue to the next gallery</p>
        </div>
        <a class="next-project-canvas" id="nextProject" href="#" data-cursor="Next">
          <div class="next-project-media" id="nextProjectMedia"></div>
          <div class="next-project-copy"><small data-i18n="nextProject">Next project</small><strong></strong><span aria-hidden="true">↗</span></div>
        </a>
      </section>

      <section class="project-contact reveal">
        <div class="project-contact-intro">
          <h2 data-i18n="projectContact">Have a project in mind?</h2>
          <p data-i18n="contactLead">Tell me briefly what you have in mind. I am easiest to reach by e-mail or WhatsApp.</p>
        </div>
        <div class="contact-details-list" aria-label="Contact details">
          <a class="contact-detail-row" href="mailto:fotodisogno@gmail.com" aria-label="E-mail: fotodisogno@gmail.com"><small>E-mail</small><strong>fotodisogno@gmail.com</strong><i aria-hidden="true">↗</i></a>
          <a class="contact-detail-row" href="https://wa.me/31644747733" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp: +31 6 44 74 77 33"><small>WhatsApp</small><strong>+31 6 44 74 77 33</strong><i aria-hidden="true">↗</i></a>
          <a class="contact-detail-row" href="https://instagram.com/fotodisogno" target="_blank" rel="noopener noreferrer" aria-label="Instagram: @fotodisogno"><small>Instagram</small><strong>@fotodisogno</strong><i aria-hidden="true">↗</i></a>
        </div>
      </section>
    </main>

    <footer class="site-footer"><span>FotodiSogno © <b id="year"></b></span><span>Rafał Wilk · The Netherlands</span></footer>

    <div class="project-lightbox" id="projectLightbox" aria-hidden="true" role="dialog" aria-modal="true">
      <button class="lightbox-close lightbox-ui" id="closeLightbox" type="button" aria-label="Close" title="Close">×</button>
      <div class="lightbox-stage" id="lightboxStage">
        <button class="lightbox-arrow lightbox-prev lightbox-ui" id="previousPhoto" type="button" aria-label="Previous photo">‹</button>
        <div class="lightbox-image-wrap"><img class="lightbox-image" id="lightboxImage" src="" alt=""></div>
        <button class="lightbox-arrow lightbox-next lightbox-ui" id="nextPhoto" type="button" aria-label="Next photo">›</button>
      </div>
      <span class="lightbox-counter lightbox-ui" id="lightboxCounter">01 / 01</span>
    </div>`);
})();