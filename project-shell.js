(() => {
  const data = window.FOTODISOGNO;
  const body = document.body;
  const project = data?.projects.find(item => item.id === body.dataset.project);
  if (!project) return;

  const title = project.title.en;
  const cover = `../../images/${encodeURIComponent(project.cover)}`;

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
        <figure class="project-opening-media reveal-media">
          <img id="projectHeroImage" src="${cover}" alt="${title}" fetchpriority="high" decoding="async" data-preload>
        </figure>
        <div class="project-opening-copy">
          <div class="project-meta"><span id="projectLocation">${project.location.en}</span><span id="projectYear">${project.year}</span></div>
          <h1 id="projectTitle">${title}</h1>
          <p id="projectDescription">${project.description.en}</p>
          <a class="text-link" href="#story"><span>View photographs</span><i aria-hidden="true">↓</i></a>
        </div>
      </section>

      <section class="gallery-section" aria-label="${title} photography">
        <div class="gallery-grid" id="story"></div>
      </section>

      <nav class="project-navigation reveal" aria-label="Project navigation">
        <a class="project-nav-link" id="previousProject" href="#"><small data-i18n="previousProject">Previous project</small><strong></strong><span aria-hidden="true">←</span></a>
        <a class="project-nav-link" id="nextProject" href="#"><small data-i18n="nextProject">Next project</small><strong></strong><span aria-hidden="true">→</span></a>
      </nav>

      <section class="project-contact reveal"><h2 data-i18n="projectContact">Have a project in mind?</h2><a class="text-link" href="mailto:fotodisogno@gmail.com"><span data-i18n="projectContactCta">Get in touch</span><i aria-hidden="true">↗</i></a></section>
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
