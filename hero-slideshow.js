(() => {
  'use strict';
  const host = document.querySelector('#heroMedia');
  if (!host || !window.FOTODISOGNO) return;
  const interval = 5500;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const manifest = window.FOTODISOGNO_IMAGES || {};
  const slides = [{ src: 'A7408793.jpg', title: { pl: 'Ostatnie światło', en: 'The last light', nl: 'Het laatste licht' } }];
  const seen = new Set(slides.map(s => s.src));
  for (const project of window.FOTODISOGNO.projects) for (const photo of project.photos) {
    if (seen.has(photo.src)) continue;
    seen.add(photo.src);
    slides.push({ src: photo.src, title: project.title });
  }
  let index = 0, timer, prepared, paused = reduced.matches;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'hero-playback';
  document.querySelector('.hero-bottom').append(button);
  const local = value => value[document.documentElement.lang] || value.en;
  function labels() {
    document.querySelector('#heroFrameNumber').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    document.querySelector('#heroCaption').textContent = local(slides[index].title);
    const text = paused ? { pl: 'Włącz pokaz slajdów', en: 'Play slideshow', nl: 'Diavoorstelling afspelen' } : { pl: 'Wstrzymaj pokaz slajdów', en: 'Pause slideshow', nl: 'Diavoorstelling pauzeren' };
    button.setAttribute('aria-label', local(text));
    button.textContent = paused ? '▶' : 'Ⅱ';
    document.body.classList.toggle('hero-is-paused', paused || document.hidden);
  }
  function prepare(next) {
    const item = slides[next], meta = manifest[item.src];
    const wrapper = document.createElement('div'); wrapper.className = 'hero-slide'; wrapper.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = local(item.title); img.decoding = 'async';
    if (meta?.variants?.length) {
      const picture = document.createElement('picture');
      for (const format of ['avif', 'webp']) {
        const source = document.createElement('source'); source.type = `image/${format}`;
        source.srcset = meta.variants.map(v => `${v[format]} ${v.width}w`).join(',');
        source.sizes = '(max-width:820px) 150vh, 100vw'; picture.append(source);
      }
      img.width = meta.width; img.height = meta.height;
      img.src = meta.variants.at(-1).webp; picture.append(img); wrapper.append(picture);
    } else { img.src = `images/${item.src.split('/').map(encodeURIComponent).join('/')}`; wrapper.append(img); }
    host.append(wrapper);
    const ready = img.decode().then(() => true, () => false);
    return { next, wrapper, ready };
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused && !document.hidden && slides.length > 1) timer = setTimeout(advance, interval);
  }
  async function advance() {
    const target = prepared;
    const ok = await target.ready;
    if (paused || document.hidden) return;
    if (ok) {
      const previous = host.querySelector('.is-current');
      target.wrapper.removeAttribute('aria-hidden'); target.wrapper.classList.add('is-current');
      previous?.classList.remove('is-current'); previous?.setAttribute('aria-hidden', 'true');
      setTimeout(() => previous?.remove(), 1700);
      index = target.next; labels();
    } else target.wrapper.remove();
    prepared = prepare((target.next + 1) % slides.length);
    schedule();
  }
  button.addEventListener('click', () => { paused = !paused; labels(); schedule(); });
  document.addEventListener('visibilitychange', () => { labels(); schedule(); });
  reduced.addEventListener('change', () => { paused = reduced.matches; labels(); schedule(); });
  new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  prepared = prepare(1 % slides.length); labels(); schedule();
})();
