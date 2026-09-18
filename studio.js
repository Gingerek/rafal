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
  const selection=[
    {src:'A7408793.jpg',project:'street'}, {src:'A7407052.jpg',project:'street'},
    {src:'A7407707.jpg',project:'people'}, {src:'DSCF3455.jpg',project:'animals'},
    {src:'A7403102.avif',project:'nature'}, {src:'A7406608.jpg',project:'travel'},
    {src:'DSC_5304.jpg',project:'creative'}
  ];
  const featureCopy={
    nl:{eyebrow:'Persoonlijk project',intro:'Van een brandende bladzijde tot een spiraal van licht. Een serie rond licht, vorm en warme kleuren.',open:'Ontdek het project',titles:['Het laatste licht','Een ochtend in stilte','Karakter in zwart-wit','Een kleine ontmoeting','Dichterbij','Aan de waterkant','Een ander licht']},
    en:{eyebrow:'Personal project',intro:'From a burning page to a spiral of light. A series exploring light, form and warm colours.',open:'Explore the project',titles:['The last light','A quiet morning','Character in black and white','A small encounter','A closer look','By the water','A different light']},
    pl:{eyebrow:'Projekt autorski',intro:'Od płonącej kartki po spiralę światła. Seria poświęcona światłu, formie i ciepłym barwom.',open:'Odkryj projekt',titles:['Ostatnie światło','Cisza poranka','Charakter w czerni i bieli','Małe spotkanie','Z bliska','Nad wodą','Inne światło']}
  };
  Object.keys(copy).forEach(key=>copy[key].frameTitles=featureCopy[key].titles);
  let lang=new URL(location.href).searchParams.get('lang');
  if(!copy[lang])lang='nl';
  const t=key=>copy[lang][key]||data.translations[lang][key]||key;
  const local=value=>value?.[lang]||value?.en||'';
  const path=file=>`images/${file.split('/').map(encodeURIComponent).join('/')}`;
  function picture(file,alt,{eager=false,sizes='(max-width:820px) 92vw, 50vw'}={}){
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
    const savedScroll=$('#filmstrip').scrollLeft;
    $('#filmstrip').innerHTML=selection.map((p,i)=>`<figure class="film-frame" style="--photo-ratio:${manifest[p.src]?.width / manifest[p.src]?.height || 1}"><button class="film-photo" data-selection="${i}" type="button" aria-label="${escape(t('open')+': '+copy[lang].frameTitles[i])}">${picture(p.src,copy[lang].frameTitles[i],{sizes:'(max-width:820px) 90vw, 42vw'})}</button><figcaption><span>${escape(copy[lang].frameTitles[i])}</span><small>${String(i+1).padStart(2,'0')}</small></figcaption></figure>`).join('');
    $('#filmstrip').scrollLeft=savedScroll;
    [['filmPrevious','previousFrames'],['filmNext','nextFrames'],['framePrevious','previous'],['frameNext','next'],['frameClose','close']].forEach(([id,key])=>$('#'+id).setAttribute('aria-label',t(key)));
    $('#heroCaption').textContent=t('heroFrame');updateFilm();
    const featured=data.projects.find(p=>p.id==='creative'),feature=featureCopy[lang];
    $('#featuredProject').innerHTML=`<a class="featured-images reveal" data-project-link="creative" data-entry="${featured.cover}" href="projects/creative/?lang=${lang}&amp;frame=${encodeURIComponent(featured.cover)}" aria-label="${escape(t('openStory')+': '+local(featured.title))}"><span data-transition-image>${picture(featured.cover,local(featured.title),{sizes:'(max-width:820px) 60vw, 35vw'})}</span><span class="featured-secondary" aria-hidden="true">${picture('DSC_0007-2.jpg','',{sizes:'(max-width:820px) 30vw, 18vw'})}</span></a><div class="featured-copy reveal"><p class="section-kicker">${feature.eyebrow}</p><h2 id="featuredTitle">${escape(local(featured.title))}</h2><p>${feature.intro}</p><a class="text-link" data-project-link="creative" data-entry="${featured.cover}" href="projects/creative/?lang=${lang}&amp;frame=${encodeURIComponent(featured.cover)}"><span>${feature.open}</span><i aria-hidden="true">↗</i></a><div class="featured-meta"><span>${featured.photos.length} ${t('photos')}</span><span>${featured.year.replace('—','–')}</span></div></div>`;
    document.title=lang==='pl'?'FotodiSogno | Rafał Wilk, fotografia':lang==='nl'?'FotodiSogno | Rafał Wilk, fotograaf':'FotodiSogno | Rafał Wilk, photographer';
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search+url.hash);
    observe();
  }

  motion.addEventListener('change',()=>{observe();updateScroll()});

  // Native scrolling supports touch, keyboard, buttons and mouse dragging.
  const film=$('#filmstrip');
  function updateFilm(){
    const items=[...film.children];if(!items.length)return;
    const start=film.getBoundingClientRect().left+parseFloat(getComputedStyle(film).paddingLeft);
    const distances=items.map(el=>Math.abs(el.getBoundingClientRect().left-start));
    const nearest=distances.indexOf(Math.min(...distances));
    const atEnd=film.scrollLeft>=film.scrollWidth-film.clientWidth-6;
    $('#filmCount').textContent=`${String(atEnd?items.length:nearest+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
    $('#filmPrevious').disabled=film.scrollLeft<6;$('#filmNext').disabled=atEnd;
  }
  function moveFilm(direction){
    const items=[...film.children],padding=parseFloat(getComputedStyle(film).paddingLeft);
    const start=film.getBoundingClientRect().left+padding;
    const current=items.reduce((best,item,i)=>Math.abs(item.getBoundingClientRect().left-start)<Math.abs(items[best].getBoundingClientRect().left-start)?i:best,0);
    const next=items[Math.max(0,Math.min(items.length-1,current+direction))];
    if(next)film.scrollTo({left:film.scrollLeft+next.getBoundingClientRect().left-start,behavior:motion.matches?'instant':'smooth'});
  }
  $('#filmPrevious').addEventListener('click',()=>moveFilm(-1));$('#filmNext').addEventListener('click',()=>moveFilm(1));
  let filmScheduled=false,drag=null,ignoreClick=false;
  film.addEventListener('scroll',()=>{if(!filmScheduled){filmScheduled=true;requestAnimationFrame(()=>{filmScheduled=false;updateFilm()})}},{passive:true});
  film.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveFilm(e.key==='ArrowRight'?1:-1)}});
  film.addEventListener('dragstart',e=>e.preventDefault());
  film.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button===0)drag={x:e.clientX,left:film.scrollLeft,id:e.pointerId,moved:false}});
  film.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8&&!drag.moved){drag.moved=true;film.setPointerCapture(drag.id);film.classList.add('is-dragging')}if(drag.moved){e.preventDefault();film.scrollLeft=drag.left-dx}});
  function endDrag(){if(!drag)return;ignoreClick=drag.moved;if(film.hasPointerCapture(drag.id))film.releasePointerCapture(drag.id);film.classList.remove('is-dragging');drag=null;setTimeout(()=>ignoreClick=false,0)}
  film.addEventListener('pointerup',endDrag);film.addEventListener('pointercancel',endDrag);

  // Native dialog provides focus containment and Escape behaviour.
  const dialog=$('#frameLightbox');
  let selectionIndex=0,imageRequest=0,returnFocus=null,touchStart=null;
  async function displayPhotograph(index){
    selectionIndex=(index+selection.length)%selection.length;
    const request=++imageRequest,p=selection[selectionIndex];
    const title=copy[lang].frameTitles[selectionIndex];
    $('#lightboxTitle').textContent=title;
    $('#frameCounter').textContent=`${String(selectionIndex+1).padStart(2,'0')} / ${String(selection.length).padStart(2,'0')}`;
    $('#frameCollection').href=`projects/${p.project}/?lang=${lang}&frame=${encodeURIComponent(p.src)}`;$('#frameCollection').dataset.projectLink=p.project;$('#frameCollection').dataset.entry=p.src;$('#frameCollection').dataset.returnSelection=String(selectionIndex);$('#frameCollection span').textContent=t('collection');
    $('#frameStage').classList.add('is-loading');$('#frameStatus').textContent=t('loading');
    const image=new Image();image.decoding='async';
    const variants=manifest[p.src]?.variants||[];
    const meta=manifest[p.src],bounds=$('#frameStage').getBoundingClientRect();
    const displayWidth=meta?Math.min(bounds.width,bounds.height*meta.width/meta.height):bounds.width;
    const targetWidth=Math.min(2400,Math.ceil(displayWidth*Math.min(devicePixelRatio||1,3)));
    image.src=(variants.find(v=>v.width>=targetWidth)||variants.at(-1))?.webp||path(p.src);
    try{
      await image.decode();
      if(request!==imageRequest||!dialog.open)return;
      $('#frameImage').src=image.src;$('#frameImage').alt=title;$('#frameStatus').textContent='';
    }catch{if(request===imageRequest)$('#frameStatus').textContent=t('failed')}
    finally{if(request===imageRequest)$('#frameStage').classList.remove('is-loading')}
  }
  film.addEventListener('click',e=>{
    if(ignoreClick){e.preventDefault();return}
    const btn=e.target.closest('[data-selection]');if(!btn)return;
    returnFocus=btn;dialog.showModal();document.documentElement.classList.add('frame-open');displayPhotograph(Number(btn.dataset.selection));$('#frameClose').focus();
  });
  $('#frameClose').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{imageRequest++;document.documentElement.classList.remove('frame-open');$('#frameImage').removeAttribute('src');returnFocus?.focus({preventScroll:true})});
  $('#framePrevious').addEventListener('click',()=>displayPhotograph(selectionIndex-1));$('#frameNext').addEventListener('click',()=>displayPhotograph(selectionIndex+1));
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();displayPhotograph(selectionIndex+(e.key==='ArrowRight'?1:-1))}});
  $('#frameStage').addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&e.isPrimary&&!e.target.closest('button'))touchStart={x:e.clientX,y:e.clientY};else touchStart=null});
  $('#frameStage').addEventListener('pointerup',e=>{if(!touchStart)return;const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;touchStart=null;if((window.visualViewport?.scale||1)>1.05)return;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2)displayPhotograph(selectionIndex+(dx<0?1:-1))});
  $('#frameStage').addEventListener('pointercancel',()=>touchStart=null);

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
  $$('[data-lang]').forEach(el=>el.addEventListener('click',()=>{lang=el.dataset.lang;render()}));
  let scheduled=false;
  function updateScroll(){scheduled=false;const hero=$('.cinema-hero');const progress=motion.matches?0:Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/(hero.offsetHeight*.65)));hero.style.setProperty('--hero-scale',String(1-progress*.08));hero.style.setProperty('--hero-border',String(progress*.2));hero.style.setProperty('--hero-copy-opacity',String(1-progress*.55));const max=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;$('#siteHeader').classList.toggle('scrolled',scrollY>(mobile.matches?24:innerHeight*.65))}
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
  addEventListener('resize',()=>{updateScroll();updateFilm()},{passive:true});
  $('#year').textContent=new Date().getFullYear();render();updateScroll();
})();
