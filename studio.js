(function photographicPortfolio() {
  'use strict';
  const data=window.FOTODISOGNO;
  if(!data)return;
  const manifest=window.FOTODISOGNO_IMAGES||{};
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const copy={
    nl:{heroKicker:'Fotograaf / Nederland',heroIntro:'Licht. Mensen. Het onverwachte.',explore:'Ontdek mijn fotografie',workTitle:'Elke serie, een eigen verhaal.',workIntro:'Van een blik op straat tot het laatste licht aan de kust. Kies een serie en kijk verder.',manifestKicker:'Mijn manier van kijken',manifestQuote:'Soms is één moment genoeg.',heroFrame:'Het laatste licht',portraitFrame:'Stilte in de ochtend',streetFrame:'Als de dag vertraagt',photos:'foto’s',choose:'Toon foto',role:'Fotograaf',menu:'Menu openen',closeMenu:'Menu sluiten',skip:'Naar de inhoud',collections:'Fotografiecollecties',framesKicker:'Een eerste indruk',framesTitle:'Even blijven kijken.',framesHint:'Een paar beelden om in te verdwalen.',filmHint:'Schuif om te ontdekken. Open een foto om meer te zien.',pause:'Diavoorstelling pauzeren',play:'Diavoorstelling afspelen',previous:'Vorige foto',next:'Volgende foto',close:'Foto sluiten',open:'Foto openen',loading:'Foto laden…',failed:'Deze foto kon niet worden geladen. Probeer de volgende foto.',collection:'Bekijk de hele serie',previousFrames:'Vorige beelden',nextFrames:'Volgende beelden',frameTitles:['Karakter in zwart-wit','Aan de waterkant','Een kleine ontmoeting','Een ochtend in stilte','Dichterbij','Een ander licht']},
    en:{heroKicker:'Photographer / The Netherlands',heroIntro:'Light. People. The unexpected.',explore:'Explore my photography',workTitle:'Every series, its own story.',workIntro:'From a passing glance to the last light on the coast. Choose a series and look a little closer.',manifestKicker:'My way of seeing',manifestQuote:'Sometimes, one moment is enough.',heroFrame:'The last light',portraitFrame:'A quiet morning',streetFrame:'When the day slows down',photos:'photos',choose:'Show photograph',role:'Photographer',menu:'Open menu',closeMenu:'Close menu',skip:'Skip to content',collections:'Photography collections',framesKicker:'A first impression',framesTitle:'Stay a little longer.',framesHint:'A few photographs to get lost in.',filmHint:'Scroll to explore. Open a photograph to look closer.',pause:'Pause slideshow',play:'Play slideshow',previous:'Previous photograph',next:'Next photograph',close:'Close photograph',open:'Open photograph',loading:'Loading photograph…',failed:'This photograph could not load. Try the next photograph.',collection:'View the full series',previousFrames:'Previous photographs',nextFrames:'Next photographs',frameTitles:['Character in black and white','By the water','A small encounter','A quiet morning','A closer look','A different light']},
    pl:{heroKicker:'Fotograf / Holandia',heroIntro:'Światło. Ludzie. To, co nieoczekiwane.',explore:'Odkryj moje fotografie',workTitle:'Każda seria ma swoją historię.',workIntro:'Od spojrzenia na ulicy po ostatnie światło na wybrzeżu. Wybierz serię i zobacz więcej.',manifestKicker:'Mój sposób patrzenia',manifestQuote:'Czasem wystarczy jeden moment.',heroFrame:'Ostatnie światło',portraitFrame:'Cisza poranka',streetFrame:'Kiedy dzień zwalnia',photos:'zdjęć',choose:'Pokaż zdjęcie',role:'Fotograf',menu:'Otwórz menu',closeMenu:'Zamknij menu',skip:'Przejdź do treści',collections:'Kolekcje fotograficzne',framesKicker:'Pierwsze spojrzenie',framesTitle:'Zostań na chwilę.',framesHint:'Kilka kadrów, w których można się zatrzymać.',filmHint:'Przewiń i odkrywaj. Otwórz zdjęcie, żeby zobaczyć więcej.',pause:'Wstrzymaj pokaz',play:'Włącz pokaz',previous:'Poprzednie zdjęcie',next:'Następne zdjęcie',close:'Zamknij zdjęcie',open:'Otwórz zdjęcie',loading:'Wczytywanie zdjęcia…',failed:'Nie udało się wczytać tego zdjęcia. Spróbuj przejść do następnego.',collection:'Zobacz całą serię',previousFrames:'Poprzednie kadry',nextFrames:'Następne kadry',frameTitles:['Charakter w czerni i bieli','Nad wodą','Małe spotkanie','Cisza poranka','Z bliska','Inne światło']}
  };
  const frames=[
    {src:'A7408793.jpg',key:'heroFrame',alt:'Sunset over a coastal bay'},
    {src:'A7407052.jpg',key:'portraitFrame',alt:'A cyclist in the morning fog'},
    {src:'A7408846.avif',key:'streetFrame',alt:'Basketball hoop at sunset'}
  ];
  const selection=[
    {src:'A7407707.jpg',project:'people'},{src:'A7406608.jpg',project:'travel'},
    {src:'DSCF3455.jpg',project:'animals'},{src:'A7407052.jpg',project:'street'},
    {src:'A7403102.avif',project:'nature'},{src:'DSC_5304.jpg',project:'creative'}
  ];
  let lang=new URL(location.href).searchParams.get('lang');
  if(!copy[lang])lang='nl';
  const t=key=>copy[lang][key]||data.translations[lang][key]||key;
  const local=value=>value?.[lang]||value?.en||'';
  const path=file=>`images/${file.split('/').map(encodeURIComponent).join('/')}`;
  function picture(file,alt,{eager=false,sizes='(max-width:760px) 100vw, 50vw'}={}){
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
      const alternate=p.photos.find(photo=>photo.src!==(p.preview||p.cover));
      return `<article class="portfolio-card reveal" id="chapter-${p.id}"><a class="card-link" href="projects/${p.id}/?lang=${lang}" aria-label="${escape(t('openStory')+': '+local(p.title))}"><span class="card-image"><span class="card-main">${picture(p.preview||p.cover,local(p.title))}</span>${alternate?`<span class="card-alternate" aria-hidden="true">${picture(alternate.src,'')}</span>`:''}<span class="card-count">${p.photos.length} ${t('photos')}</span><span class="card-open" aria-hidden="true">↗</span></span><div class="card-heading"><h3>${escape(local(p.title))}</h3><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span></div></a><div class="card-details"><span>${escape(local(p.location))}</span><span>${p.year.replace('—','–')}</span></div><p>${escape(local(p.description).replaceAll(' — ',', '))}</p></article>`;
    }).join('');
    const savedScroll=$('#filmstrip').scrollLeft;
    $('#filmstrip').innerHTML=selection.map((p,i)=>`<figure class="film-frame"><button class="film-photo" data-selection="${i}" type="button" aria-label="${escape(t('open')+': '+copy[lang].frameTitles[i])}">${picture(p.src,copy[lang].frameTitles[i],{sizes:'(max-width:760px) 85vw, 42vw'})}</button><figcaption><span>${escape(copy[lang].frameTitles[i])}</span><small>${String(i+1).padStart(2,'0')}</small></figcaption></figure>`).join('');
    $('#filmstrip').scrollLeft=savedScroll;
    [['filmPrevious','previousFrames'],['filmNext','nextFrames'],['framePrevious','previous'],['frameNext','next'],['frameClose','close']].forEach(([id,key])=>$('#'+id).setAttribute('aria-label',t(key)));
    updateHeroLabels();updateFilm();
    document.title=lang==='pl'?'FotodiSogno | Rafał Wilk, fotografia':lang==='nl'?'FotodiSogno | Rafał Wilk, fotograaf':'FotodiSogno | Rafał Wilk, photographer';
    const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url.pathname+url.search+url.hash);
    observe();
  }

  // A slow photographic sequence, paused when off-screen or hidden.
  let frameIndex=0,frameRequest=0,heroTimer=0,heroVisible=true;
  let userPaused=motion.matches,focusPaused=false;
  function playing(){return !userPaused&&!focusPaused&&heroVisible&&!document.hidden}
  function updateHeroLabels(){
    $('#heroCaption').textContent=t(frames[frameIndex].key);
    $('#heroFrameNumber').textContent=`${String(frameIndex+1).padStart(2,'0')} / 03`;
    $$('[data-frame]').forEach((el,i)=>{el.setAttribute('aria-pressed',String(i===frameIndex));el.setAttribute('aria-label',`${t('choose')} ${i+1}: ${t(frames[i].key)}`)});
    $('#heroPause').setAttribute('aria-label',t(userPaused?'play':'pause'));
    $('#heroPause').setAttribute('aria-pressed',String(userPaused));
    $('#heroPause span').textContent=userPaused?'▶':'Ⅱ';
  }
  function scheduleHero(){
    clearTimeout(heroTimer);
    $$('[data-frame]').forEach(el=>el.classList.remove('is-running'));
    document.body.classList.toggle('hero-is-paused',!playing());
    if(!playing())return;
    const active=$(`[data-frame="${frameIndex}"]`);
    void active.offsetWidth;active.classList.add('is-running');
    heroTimer=setTimeout(()=>showFrame((frameIndex+1)%frames.length),8000);
  }
  async function showFrame(index,manual=false){
    if(manual){userPaused=true;focusPaused=false;clearTimeout(heroTimer)}
    if(index===frameIndex){updateHeroLabels();scheduleHero();return}
    const request=++frameRequest;
    let target=$(`#heroMedia [data-hero-index="${index}"]`);
    if(!target){
      target=document.createElement('div');target.className='hero-slide';target.dataset.heroIndex=index;target.setAttribute('aria-hidden','true');
      target.innerHTML=picture(frames[index].src,frames[index].alt,{eager:true,sizes:'100vw'});
      $('#heroMedia').appendChild(target);
    }
    try{await target.querySelector('img').decode()}catch{scheduleHero();return}
    if(request!==frameRequest)return;
    if(!manual&&!playing()){scheduleHero();return}
    $$('#heroMedia .hero-slide').forEach(el=>{el.classList.toggle('is-current',el===target);el.setAttribute('aria-hidden',String(el!==target))});
    frameIndex=index;updateHeroLabels();scheduleHero();
  }
  $('#heroMedia .hero-slide').dataset.heroIndex='0';
  $$('[data-frame]').forEach(el=>el.addEventListener('click',()=>showFrame(Number(el.dataset.frame),true)));
  $('#heroPause').addEventListener('click',()=>{userPaused=!userPaused;focusPaused=false;frameRequest++;updateHeroLabels();scheduleHero()});
  $('.hero-controls').addEventListener('focusin',()=>{focusPaused=true;scheduleHero()});
  $('.hero-controls').addEventListener('focusout',e=>{if(!$('.hero-controls').contains(e.relatedTarget)){focusPaused=false;scheduleHero()}});
  document.addEventListener('visibilitychange',scheduleHero);
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting;scheduleHero()},{threshold:.2}).observe($('.cinema-hero'));
  motion.addEventListener('change',()=>{userPaused=motion.matches;updateHeroLabels();scheduleHero();observe()});

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
  function moveFilm(direction){film.scrollBy({left:direction*(film.clientWidth*.7),behavior:motion.matches?'instant':'smooth'})}
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
    $('#frameCollection').href=`projects/${p.project}/?lang=${lang}`;$('#frameCollection span').textContent=t('collection');
    $('#frameStage').classList.add('is-loading');$('#frameStatus').textContent=t('loading');
    const image=new Image();image.decoding='async';
    const variants=manifest[p.src]?.variants||[];
    image.src=(variants.find(v=>v.width>=2000)||variants.at(-1))?.webp||path(p.src);
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
  $('#frameStage').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchStart={x:e.clientX,y:e.clientY}});
  $('#frameStage').addEventListener('pointerup',e=>{if(!touchStart)return;const dx=e.clientX-touchStart.x,dy=e.clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.2)displayPhotograph(selectionIndex+(dx<0?1:-1))});
  $('#frameStage').addEventListener('pointercancel',()=>touchStart=null);

  function closeMenu(){$('#siteNav').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').setAttribute('aria-label',t('menu'))}
  $('#menuToggle').addEventListener('click',()=>{const open=$('#menuToggle').getAttribute('aria-expanded')!=='true';$('#siteNav').classList.toggle('open',open);$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').setAttribute('aria-label',t(open?'closeMenu':'menu'))});
  $$('.main-nav a').forEach(el=>el.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#menuToggle').getAttribute('aria-expanded')==='true'){closeMenu();$('#menuToggle').focus()}});
  $$('[data-lang]').forEach(el=>el.addEventListener('click',()=>{lang=el.dataset.lang;render()}));
  $('#projectRail').addEventListener('click',e=>{
    const link=e.target.closest('.card-link');
    if(!link||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
    const id=link.closest('.portfolio-card').id.replace('chapter-','');
    const image=matchMedia('(hover:hover)').matches?link.querySelector('.card-alternate img')||link.querySelector('.card-main img'):link.querySelector('.card-main img');
    if(image&&!motion.matches){image.style.viewTransitionName=`project-${id}`;sessionStorage.setItem('fotodisogno-transition-project',id)}
  });
  let scheduled=false;
  function updateScroll(){scheduled=false;const max=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;$('#siteHeader').classList.toggle('scrolled',scrollY>innerHeight*.65)}
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll)}},{passive:true});
  addEventListener('resize',()=>{updateScroll();updateFilm()},{passive:true});
  $('#year').textContent=new Date().getFullYear();render();scheduleHero();updateScroll();
})();
