(() => {
  const data = window.FOTODISOGNO;
  if (!data?.projects || data.projects.some(project => project.id === 'solar-eclipse-2026')) return;

  data.projects.push({
    id: 'solar-eclipse-2026',
    theme: 'ember',
    year: '2026',
    cover: 'A7409171.avif',
    preview: 'A7409171.avif',
    title: {
      nl: 'Zonsverduistering 2026',
      en: 'Solar Eclipse 2026',
      pl: 'Zaćmienie Słońca 2026'
    },
    description: {
      nl: 'Een nieuwe fotografische serie gewijd aan de zonsverduistering van 2026.',
      en: 'A new photographic series dedicated to the 2026 solar eclipse.',
      pl: 'Nowa seria fotograficzna poświęcona zaćmieniu Słońca w 2026 roku.'
    },
    location: {
      nl: 'Nieuwe serie',
      en: 'New series',
      pl: 'Nowa seria'
    },
    photos: []
  });
})();
