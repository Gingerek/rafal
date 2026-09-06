(() => {
  const data = window.FOTODISOGNO;
  if (!data?.projects || data.projects.some(project => project.id === 'solar-eclipse-2026')) return;

  data.projects.push({
    id: 'solar-eclipse-2026',
    theme: 'ember',
    year: '2026',
    cover: 'DSC00139.avif',
    preview: 'DSC00139.avif',
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
    photos: [
      { src: 'DSC00139.avif', alt: 'Solar eclipse crescent against a black sky' },
      { src: 'DSC00111.avif', alt: 'Partial solar eclipse crescent against a black sky' },
      { src: 'DSC00250.avif', alt: 'Partial solar eclipse seen through tree branches' },
      { src: 'DSC00240.png', alt: 'Solar eclipse framed by branches and leaves' },
      { src: 'DSC00238.avif', alt: 'Partial solar eclipse glowing behind tree branches' },
      { src: 'DSC00235.webp', alt: 'Partial solar eclipse above silhouetted trees' },
      { src: 'DSC00230.avif', alt: 'Solar eclipse beside a silhouetted tree' },
      { src: 'DSC00229.avif', alt: 'Partial solar eclipse over silhouetted trees and clouds' }
    ]
  });
})();
