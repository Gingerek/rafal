(function photographicPortfolio() {
  'use strict';
  const data=window.FOTODISOGNO;
  if(!data)return;
  const manifest=window.FOTODISOGNO_IMAGES||{};
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:820px), (max-width:1000px) and (max-height:520px) and (pointer:coarse)');
  const copy={
    nl:{heroKicker:'Fotograaf / Nederland',heroIntro:'Portretten · Straat · Reizen',explore:'Ontdek mijn fotografie',workTitle:'Series en projecten',workIntro:'Van een blik op straat tot het laatste licht aan de kust. Kies een serie en kijk verder.',manifestKicker:'Mijn manier van kijken',manifestQuote:'Soms is één moment genoeg.',heroFrame:'Het laatste licht',portraitFrame:'Stilte in de ochtend',streetFrame:'Als de dag vertraagt',photos:'foto’s',choose:'Toon foto',role:'Fotograaf',menu:'Menu openen',closeMenu:'Menu sluiten',skip:'Naar de inhoud',collections:'Fotografiecollecties',framesKicker:'Een eerste indruk',framesTitle:'Geselecteerde fotografie',framesHint:'Een selectie uit mijn collecties.',filmHint:'Schuif om te ontdekken. Open een foto om meer te zien.',pause:'Diavoorstelling pauzeren',play:'Diavoorstelling afspelen',previous:'Vorige foto',next:'Volgende foto',close:'Foto sluiten',open:'Foto openen',loading:'Foto laden…',failed:'Deze foto kon niet worden geladen. Probeer de volgende foto.',collection:'Bekijk de hele serie',previousFrames:'Vorige beelden',nextFrames:'Volgende beelden',frameTitles:['Karakter in zwart-wit','Aan de waterkant','Een kleine ontmoeting','Een ochtend in stilte','Dichterbij','Een ander licht']},
    en:{heroKicker:'Photographer / The Netherlands',heroIntro:'Portraits · Street · Travel',explore:'Explore my photography',workTitle:'Series and projects',workIntro:'From a passing glance to the last light on the coast. Choose a series and look a little closer.',manifestKicker:'My way of seeing',manifestQuote:'Sometimes, one moment is enough.',heroFrame:'The last light',portraitFrame:'A quiet morning',streetFrame:'When the day slows down',photos:'photos',choose:'Show photograph',role:'Photographer',menu:'Open menu',closeMenu:'Close menu',skip:'Skip to content',collections:'Photography collections',framesKicker:'A first impression',framesTitle:'Selected photographs',framesHint:'A selection from my collections.',filmHint:'Scroll to explore. Open a photograph to look closer.',pause:'Pause slideshow',play:'Play slideshow',previous:'Previous photograph',next:'Next photograph',close:'Close photograph',open:'Open photograph',loading:'Loading photograph…',failed:'This photograph could not load. Try the next photograph.',collection:'View the full series',previousFrames:'Previous photographs',nextFrames:'Next photographs',frameTitles:['Character in black and white','By the water','A small encounter','A quiet morning','A closer look','A different light']},
    pl:{heroKicker:'Fotograf / Holandia',heroIntro:'Portrety · Ulica · Podróże',explore:'Odkryj moje fotografie',workTitle:'Serie i projekty',workIntro:'Od spojrzenia na ulicy po ostatnie światło na wybrzeżu. Wybierz serię i zobacz więcej.',manifestKicker:'Mój sposób patrzenia',manifestQuote:'Czasem wystarczy jeden moment.',heroFrame:'Ostatnie światło',portraitFrame:'Cisza poranka',streetFrame:'Kiedy dzień zwalnia',photos:'zdjęć',choose:'Pokaż zdjęcie',role:'Fotograf',menu:'Otwórz menu',closeMenu:'Zamknij menu',skip:'Przejdź do treści',collections:'Kolekcje fotograficzne',framesKicker:'Pierwsze spojrzenie',framesTitle:'Wybrane fotografie',framesHint:'Wybór zdjęć z moich kolekcji.',filmHint:'Przewiń i odkrywaj. Otwórz zdjęcie, żeby zobaczyć więcej.',pause:'Wstrzymaj pokaz',play:'Włącz pokaz',previous:'Poprzednie zdjęcie',next:'Następne zdjęcie',close:'Zamknij zdjęcie',open:'Otwórz zdjęcie',loading:'Wczytywanie zdjęcia…',failed:'Nie udało się wczytać tego zdjęcia. Spróbuj przejść do następnego.',collection:'Zobacz całą serię',previousFrames:'Poprzednie kadry',nextFrames:'Następne kadry',frameTitles:['Charakter w czerni i bieli','Nad wodą','Małe spotkanie','Cisza poranka','Z bliska','Inne światło']}
  };
  let lang=new URL(location.href).searchParams.get('lang');
  if(!copy[lang])lang='nl';
  const t=key=>copy[lang][key]||data.translations[lang][key]||key;
  const local=value=>value?.[lang]||value?.en||'';
  const path=file=>`images/${file.split('/').map(encodeURIComponent).join('/')}`;
  function picture(file,alt,{eager=false,sizes='(max-width:820px) 90vw, (max-width:1100px) 44vw, 29vw'}={}){
    const item=manifest[file];
    const attrs=`alt="${escape(alt)}" loading="${eager?'eager':'lazy'}" decoding="async" draggable="false"${eager?' fetchpriority="auto"':''}`;
    if(!item?.variants?.length)return `<img src="${path(file)}" ${attrs}>`;
    const sources=['avif','webp'].map(format=>`<source type="image/${format}" srcset="${item.variants.map(v=>`${v[format]} ${v.width}w`).join(',')}" sizes="${sizes}">`).join('');
    return `<picture>${sources}<img src="${item.variants.at(-1).webp}" width="${item.width}" height="${item.height}" ${attrs}></picture>`;
  }
  let revealObserver,chapterObserver;
  function observe(){
    revealObserver?.disconnect();chapterObserver?.disconnect();
    if(!('IntersectionObserver' in window))return;
    if(!motion.matches){
      revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.06});
      $$('.reveal').forEach(el=>revealObserver.observe(el));
      document.body.classList.add('motion-ready');
    } else document.body.classList.remove('motion-ready');
    chapterObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('#heroProjectIndex a').forEach(a=>a.classList.toggle('is-active',a.hash===`#${e.target.id}`))}),{rootMargin:'-25% 0px -40% 0px',threshold:0});
    $$('.portfolio-card').forEach(el=>chapterObserver.observe(el));
  }
  function render(){
    document.documentElement.lang=lang;
    $$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
    $$('[data-studio]').forEach(el=>el.textContent=t(el.dataset.studio));
    $$('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));
    $('#menuToggle').setAttribute('aria-label',t($('#menuToggle').getAttribute('aria-expanded')==='true'?'closeMenu':'menu'));
    $('#heroProjectIndex').setAttribute('aria-label',t('collections'));
    $('#heroProjectIndex').innerHTML=data.projects.map((p,i)=>`<a href="#chapter-${p.id}"><small>${String(i+1).padStart(2,'0')}</small>${escape(local(p.title))}</a>`).join('');
    $('#projectRail').innerHTML=data.projects.map((p,i)=>{
      const accent=window.FOTODISOGNO_EXHIBITION?.[p.id]?.accent||'#c2b395';
      return `<article class="portfolio-card reveal" id="chapter-${p.id}" style="--series-accent:${accent}"><a class="card-link" data-project-link="${p.id}" data-entry="${escape(p.preview||p.cover)}" href="projects/${p.id}/?lang=${lang}&amp;frame=${encodeURIComponent(p.preview||p.cover)}" aria-label="${escape(t('openStory')+': '+local(p.title))}"><span class="card-image"><span class="card-main">${picture(p.preview||p.cover,local(p.title))}</span><span class="card-count">${p.photos.length} ${t('photos')}</span><span class="card-open" aria-hidden="true">↗</span></span><div class="card-heading"><h3>${escape(local(p.title))}</h3><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div></a><div class="card-details"><span>${escape(local(p.location))}</span><span>${p.year.replace('—','–')}</span></div><p>${escape(local(p.description).replaceAll(' — ',', '))}</p></article>`;
    }).join('');
    $('#heroCaption').textContent=t('heroFrame');
    document.title=lang==='pl'?'FotodiSogno | Rafał Wilk, fotografia':lang==='nl'?'FotodiSogno | Rafał Wilk, fotograaf':'FotodiSogno | Rafał Wilk, photographer';
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search+url.hash);
    observe();
  }

  motion.addEventListener('change',()=>{observe();updateScroll()});

  let menuScroll=0;
  function menuIsOpen(){return $('#menuToggle').getAttribute('aria-expanded')==='true'}
  function closeMenu(){
    const wasOpen=menuIsOpen();
    $('#siteNav').classList.remove('open');$('#siteNav').inert=mobile.matches;
    $('#siteHeader').classList.remove('menu-open');
    $('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label',t('menu'));
    document.documentElement.classList.remove('menu-open');document.body.classList.remove('menu-open');
    document.body.style.removeProperty('top');
    $$('#main,.site-footer').forEach(el=>el.inert=false);
    if(wasOpen){window.scrollTo({top:menuScroll,behavior:'instant'})}
  }
  $('#menuToggle').addEventListener('click',()=>{
    if(menuIsOpen()){closeMenu();return}
    if(!mobile.matches)return;
    menuScroll=scrollY;
    document.body.style.top=`-${menuScroll}px`;
    document.documentElement.classList.add('menu-open');document.body.classList.add('menu-open');
    $('#siteHeader').classList.add('menu-open');$('#siteNav').classList.add('open');$('#siteNav').inert=false;
    $('#menuToggle').setAttribute('aria-expanded','true');$('#menuToggle').setAttribute('aria-label',t('closeMenu'));
    $$('#main,.site-footer').forEach(el=>el.inert=true);
$('.main-nav a').focus({preventScroll:true});
  });
  $$('.main-nav a,.site-header .brand').forEach(el=>el.addEventListener('click',()=>{
    if(!menuIsOpen())return;
    const target=$(el.hash);closeMenu();
    if(target){target.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'})}
    if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}
  }));
  document.addEventListener('keydown',e=>{
    if(!menuIsOpen())return;
    if(e.key==='Escape'){closeMenu();$('#menuToggle').focus();return}
    if(e.key==='Tab'){
      const controls=$$('.site-header a,.site-header button');
      const first=controls[0],last=controls.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
    }
  });
  mobile.addEventListener('change',()=>{const wasOpen=menuIsOpen();closeMenu();if(wasOpen)(mobile.matches?$('#menuToggle'):$('.main-nav a')).focus({preventScroll:true})});
  $('#siteNav').inert=mobile.matches;
  $$('[data-lang]').forEach(el=>el.addEventListener('click',()=>{lang=el.dataset.lang;render();if(menuIsOpen()){closeMenu();$('#menuToggle').focus({preventScroll:true})}}));
  let scheduled=false;
  function updateScroll(){scheduled=false;const hero=$('.cinema-hero');const progress=motion.matches?0:Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/(hero.offsetHeight*.65)));hero.style.setProperty('--hero-scale',String(1-progress*.08));hero.style.setProperty('--hero-border',String(progress*.2));hero.style.setProperty('--hero-copy-opacity',String(1-progress*.55));const max=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;$('#siteHeader').classList.toggle('scrolled',scrollY>(mobile.matches?24:innerHeight*.65))}
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
  addEventListener('resize',()=>{updateScroll()},{passive:true});
  $('#year').textContent=new Date().getFullYear();render();updateScroll();
})();
