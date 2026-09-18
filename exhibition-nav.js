(() => {
  'use strict';
  const KEY='fotodisogno-exhibition-return';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const read=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}};
  const write=value=>{try{sessionStorage.setItem(KEY,JSON.stringify(value))}catch{}};
  const isPlainClick=e=>e.button===0&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey;
  const clearNames=()=>document.querySelectorAll('[data-exhibition-transition]').forEach(el=>{el.style.viewTransitionName='';delete el.dataset.exhibitionTransition});
  const nameImage=(image,id)=>{if(!image||motion.matches)return;clearNames();image.style.viewTransitionName=`project-${id}`;image.dataset.exhibitionTransition='true'};
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-project-link]');
    if(!link||!isPlainClick(event)||link.target==='_blank')return;
    const id=link.dataset.projectLink;
    let image=link.querySelector('[data-transition-image] img,.card-main img,.next-project-image');
    if(link.id==='frameCollection')image=document.querySelector('#frameImage');
    if(!image&&link.closest('#featuredProject'))image=document.querySelector('#featuredProject [data-transition-image] img');
    if(document.body.classList.contains('home-page')){
      const anchor=link.closest('.portfolio-card')?.id||(link.closest('#featuredProject')?'featuredProject':'selectedFrames');
      write({id,anchor,y:scrollY,width:innerWidth,filmX:document.querySelector('#filmstrip')?.scrollLeft||0,selection:link.dataset.returnSelection===undefined?null:Number(link.dataset.returnSelection),time:Date.now()});
    }
    if(image){const rect=image.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight)nameImage(image,id)}
  });
  function restoreHome(){
    const url=new URL(location.href),state=read();
    if(url.searchParams.get('restore')!=='1')return;
    url.searchParams.delete('restore');history.replaceState(history.state,'',url.pathname+url.search+url.hash);
    if(!state||Date.now()-state.time>86400000)return;
    const anchor=document.getElementById(state.anchor);
    if(!anchor)return;
    document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
    // Defer until fonts and the browser's initial anchor positioning have settled.
    Promise.resolve(document.fonts?.ready).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const top=Math.abs(innerWidth-state.width)<40?state.y:anchor.getBoundingClientRect().top+scrollY-100;
      const film=document.querySelector('#filmstrip');if(film)film.scrollTo({left:state.filmX||0,behavior:'instant'});
      window.scrollTo({top:Math.max(0,top),behavior:'instant'});
      const selected=Number.isInteger(state.selection)&&state.selection>=0?document.querySelector(`[data-selection="${state.selection}"]`):null;
      (selected||anchor.querySelector('a,button:not(:disabled)'))?.focus({preventScroll:true});
    })));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if(document.body.classList.contains('home-page')){restoreHome();return}
    const id=document.body.dataset.project;
    if(id)nameImage(document.querySelector('#projectHeroImage'),id);
    const updateReturn=()=>{
      const state=read();
      const lang=document.documentElement.lang;
      const valid=state&&Date.now()-state.time<86400000&&document.getElementById('backHome');
      const href=valid?`../../?lang=${lang}&restore=1#${encodeURIComponent(state.anchor)}`:`../../?lang=${lang}#work`;
      const back=document.getElementById('backHome');if(back)back.href=href;
    };
    updateReturn();
    document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',updateReturn));
    setTimeout(clearNames,1400);
  });
  addEventListener('pageshow',event=>{if(event.persisted){clearNames();if(document.body.classList.contains('home-page'))restoreHome()}});
})();
