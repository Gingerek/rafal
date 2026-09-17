(() => {
  'use strict';
  const data = window.FOTODISOGNO;
  if (!data) return;
  const manifest = window.FOTODISOGNO_IMAGES || {};
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = {
    nl:{heroKicker:'Rafał Wilk / Fotografie / Nederland',heroLine:'Verhalen',heroAccent:'in licht.',heroIntro:'Mensen, plaatsen en de momenten daartussen. Gezien door mijn lens.',workTitle:'Een eigen manier van kijken.',manifestKicker:'Achter het beeld',manifestQuote:'Licht onthult wat snelheid onzichtbaar maakt.',heroFrame:'Licht aan de kust',portraitFrame:'Een blik, een verhaal',streetFrame:'Het laatste licht',photos:'foto’s',choose:'Toon foto',role:'Fotograaf',menu:'Menu openen',closeMenu:'Menu sluiten',skip:'Naar de inhoud',collections:'Fotografiecollecties'},
    en:{heroKicker:'Rafał Wilk / Photography / The Netherlands',heroLine:'Stories',heroAccent:'in light.',heroIntro:'People, places and the moments in between. Seen through my lens.',workTitle:'A different way of seeing.',manifestKicker:'Behind the image',manifestQuote:'Light reveals what speed makes invisible.',heroFrame:'Light on the coast',portraitFrame:'A look, a story',streetFrame:'The last light',photos:'photos',choose:'Show photograph',role:'Photographer',menu:'Open menu',closeMenu:'Close menu',skip:'Skip to content',collections:'Photography collections'},
    pl:{heroKicker:'Rafał Wilk / Fotografia / Holandia',heroLine:'Historie',heroAccent:'w świetle.',heroIntro:'Ludzie, miejsca i chwile pomiędzy. Widziane przez mój obiektyw.',workTitle:'Mój sposób patrzenia.',manifestKicker:'Za kadrem',manifestQuote:'Światło odsłania to, czego nie widać w pośpiechu.',heroFrame:'Światło na wybrzeżu',portraitFrame:'Spojrzenie i historia',streetFrame:'Ostatnie światło',photos:'zdjęć',choose:'Pokaż zdjęcie',role:'Fotograf',menu:'Otwórz menu',closeMenu:'Zamknij menu',skip:'Przejdź do treści',collections:'Kolekcje fotograficzne'}
  };
  const frames=[{src:'A7408793.jpg',key:'heroFrame',alt:'Sunset over a coastal bay'},{src:'DSCF4051.jpg',key:'portraitFrame',alt:'Portrait of a woman holding a cat'},{src:'A7408846.avif',key:'streetFrame',alt:'Basketball hoop at sunset'}];
  let lang=new URL(location.href).searchParams.get('lang');
  if(!copy[lang]) lang='nl';
  let frameIndex=0;
  let frameRequest=0;
  const t=key=>copy[lang][key]||data.translations[lang][key]||key;
  const local=value=>value?.[lang]||value?.en||'';
  function picture(file,alt,{eager=false,sizes='(max-width:760px) 100vw, 50vw'}={}) {
    const item=manifest[file];
    const attrs=`alt="${escape(alt)}" loading="${eager?'eager':'lazy'}" decoding="async"${eager?' fetchpriority="high"':''}`;
    if(!item?.variants?.length) return `<img src="images/${file.split('/').map(encodeURIComponent).join('/')}" ${attrs}>`;
    const sources=['avif','webp'].map(format=>`<source type="image/${format}" srcset="${item.variants.map(v=>`${v[format]} ${v.width}w`).join(',')}" sizes="${sizes}">`).join('');
    return `<picture>${sources}<img src="${item.variants.at(-1).webp}" width="${item.width}" height="${item.height}" ${attrs}></picture>`;
  }
  let observer;
  function reveal(){
    observer?.disconnect();
    if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.06});
    $$('.reveal').forEach(el=>observer.observe(el));
    document.body.classList.add('motion-ready');
  }
  function render(){
    document.documentElement.lang=lang;
    $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    $$('[data-studio]').forEach(el=>el.textContent=t(el.dataset.studio));
    $$('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
    $('#menuToggle').setAttribute('aria-label',t($('#menuToggle').getAttribute('aria-expanded')==='true'?'closeMenu':'menu'));
    $('#heroProjectIndex').setAttribute('aria-label',t('collections'));
    $('#heroProjectIndex').innerHTML=data.projects.map((p,i)=>`<a href="#chapter-${p.id}"><small>${String(i+1).padStart(2,'0')}</small>${escape(local(p.title))}</a>`).join('');
    $('#projectRail').innerHTML=data.projects.map((p,i)=>`<article class="portfolio-card reveal" id="chapter-${p.id}"><a class="card-link" href="projects/${p.id}/?lang=${lang}" aria-label="${escape(t('openStory')+': '+local(p.title))}"><span class="card-image">${picture(p.preview||p.cover,local(p.title))}<span class="card-count">${p.photos.length} ${t('photos')}</span><span class="card-open" aria-hidden="true">↗</span></span><div class="card-heading"><h3>${escape(local(p.title))}</h3><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div></a><div class="card-details"><span>${escape(local(p.location))}</span><span>${p.year.replace('—','–')}</span></div><p>${escape(local(p.description).replaceAll(' — ','. '))}</p></article>`).join('');
    updateFrameLabels();
    document.title=lang==='pl'?'FotodiSogno | Fotografia Rafała Wilka':lang==='nl'?'FotodiSogno | Fotografie door Rafał Wilk':'FotodiSogno | Photography by Rafał Wilk';
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search+url.hash);
    reveal();
  }
  function updateFrameLabels(){
    $('#heroCaption').textContent=t(frames[frameIndex].key);
    $$('[data-frame]').forEach((el,i)=>{el.setAttribute('aria-pressed',String(i===frameIndex));el.setAttribute('aria-label',`${t('choose')} ${i+1}: ${t(frames[i].key)}`)});
  }
  async function showFrame(index){
    if(index===frameIndex)return;
    const request=++frameRequest;
    const frame=frames[index];
    const holder=document.createElement('div');holder.innerHTML=picture(frame.src,frame.alt,{eager:true,sizes:'(max-width:760px) 100vw, 70vw'});
    const img=holder.querySelector('img');
    try{await img.decode()}catch{return}
    if(request!==frameRequest)return;
    const target=$('#heroMedia');
    const change=()=>{target.replaceChildren(...holder.childNodes);frameIndex=index;updateFrameLabels()};
    if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){target.style.viewTransitionName='hero-photograph';const transition=document.startViewTransition(change);transition.finished.finally(()=>target.style.viewTransitionName='')}
    else change();
  }
  function closeMenu(){
    $('#siteNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label',t('menu'));
  }
  $('#year').textContent=new Date().getFullYear();
  render();
  $$('[data-lang]').forEach(el=>el.addEventListener('click',()=>{lang=el.dataset.lang;render()}));
  $$('[data-frame]').forEach(el=>el.addEventListener('click',()=>showFrame(Number(el.dataset.frame))));
  $('#menuToggle').addEventListener('click',()=>{const open=$('#menuToggle').getAttribute('aria-expanded')!=='true';$('#siteNav').classList.toggle('open',open);$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').setAttribute('aria-label',t(open?'closeMenu':'menu'))});
  $$('.main-nav a').forEach(el=>el.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#menuToggle').getAttribute('aria-expanded')==='true'){closeMenu();$('#menuToggle').focus()}});
  let scheduled=false;
  function updateScroll(){
    scheduled=false;
    const max=document.documentElement.scrollHeight-innerHeight;
    $('#readingProgress').style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&innerWidth>760){
      const hero=$('.cinema-frame');
      if(scrollY<innerHeight)hero.style.transform=`translateY(${Math.min(36,scrollY*.06)}px)`;
    }
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
  addEventListener('resize',()=>{if(innerWidth<=760)$('.cinema-frame').style.transform='';updateScroll()},{passive:true});
  updateScroll();
})();
