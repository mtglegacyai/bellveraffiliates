/* Bellver Cards by MTG | shared behaviour (menu, reveals, 3D tilt, videos, calculators) */
(function(){
  'use strict';
  var d=document, root=d.documentElement;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(pointer: fine)').matches;
  var $=function(s,c){return (c||d).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  var money=function(n){return '$'+Math.round(n).toLocaleString('en-US')};

  /* header, progress, back to top, mobile CTA */
  var hdr=$('.hdr'), bar=$('.progress'), top=$('.totop'), mcta=$('.mobile-cta'), heroEnd=$('[data-hero-end]');
  var ticking=false, lastSY=window.scrollY, mctaHide=false; /* phone order bar: hides while reading down, returns when scrolling up */
  function onScroll(){
    var y=window.scrollY, h=root.scrollHeight-window.innerHeight, p=h>0?Math.min(1,y/h):0;
    if(hdr) hdr.classList.toggle('scrolled',y>12);
    if(bar) bar.style.setProperty('--p',p.toFixed(4));
    if(top){top.classList.toggle('on',y>700);top.style.setProperty('--p',p.toFixed(4));}
    if(mcta){var past=heroEnd?heroEnd.getBoundingClientRect().top<0:y>500;var nearEnd=h-y<260;var down=y>lastSY+4, up=y<lastSY-4;if(down)mctaHide=true;else if(up)mctaHide=false;mcta.classList.toggle('on',past&&!nearEnd&&!menuOpen&&!mctaHide);}
    lastSY=y;
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll);}},{passive:true});
  if(top) top.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});});

  /* pull-down menu: slide-out drawer on tablets and phones, collapsible side panel on laptops and desktops */
  var btn=$('.menu-btn'), tog=$('.side-toggle'), menu=$('#bv-menu'), scrim=$('.scrim'), dash=$('.dash'), menuOpen=false;
  var wide=window.matchMedia('(min-width:1061px)');
  function store(v){try{localStorage.setItem('bv-side',v);}catch(_){}}
  function setMenu(open){
    menuOpen=open;
    if(!btn||!menu) return;
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.querySelector('.lbl').textContent=open?'Close':'Menu';
    if(tog){tog.setAttribute('aria-expanded',open?'true':'false');var tl=open?'Collapse menu':'Expand menu';tog.setAttribute('aria-label',tl);tog.setAttribute('title',tl);}
    if(wide.matches){
      if(dash) dash.classList.toggle('side-off',!open);
      menu.classList.remove('open'); if(scrim) scrim.classList.remove('on');
    } else {
      menu.classList.toggle('open',open);
      if(scrim) scrim.classList.toggle('on',open);
      if(open){var first=menu.querySelector('a');if(first) setTimeout(function(){first.focus({preventScroll:true});},60);}
    }
    if(hdr) hdr.classList.toggle('scrolled',(!wide.matches&&open)||window.scrollY>12);
    
onScroll();
  }
  function syncMenu(){
    var off=false; try{off=localStorage.getItem('bv-side')==='off';}catch(_){}
    setMenu(wide.matches?!off:false);
  }
  syncMenu();
  if(wide.addEventListener) wide.addEventListener('change',syncMenu); else if(wide.addListener) wide.addListener(syncMenu);
  function flip(){var next=!menuOpen;setMenu(next);if(wide.matches) store(next?'on':'off');}
  if(btn) btn.addEventListener('click',flip);
  if(tog) tog.addEventListener('click',flip);
  if(scrim) scrim.addEventListener('click',function(){setMenu(false);});
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&menuOpen&&!wide.matches){setMenu(false);btn.focus();}});
  if(menu) $$('a',menu).forEach(function(a){a.addEventListener('click',function(){if(!wide.matches&&a.getAttribute('href').charAt(0)==='#') setMenu(false);});});

  /* reveal on scroll */
  var rvs=$$('.rv');
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.08});
    rvs.forEach(function(el){io.observe(el);});
  } else rvs.forEach(function(el){el.classList.add('in');});

  /* count up */
  var counters=$$('[data-count]');
  function runCount(el){
    var end=parseFloat(el.getAttribute('data-count')), pre=el.getAttribute('data-pre')||'', suf=el.getAttribute('data-suf')||'';
    if(reduce){el.textContent=pre+end.toLocaleString('en-US')+suf;return;}
    var t0=null,dur=1400;
    function step(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=pre+Math.round(end*e).toLocaleString('en-US')+suf;if(k<1)requestAnimationFrame(step);}
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){runCount(e.target);co.unobserve(e.target);}});},{threshold:.6});
    counters.forEach(function(el){co.observe(el);});
  } else counters.forEach(runCount);

  /* 3D tilt (hero card, special edition) */
  if(fine && !reduce){
    $$('[data-tilt]').forEach(function(zone){
      var target=$(zone.getAttribute('data-tilt'),zone)||zone, max=parseFloat(zone.getAttribute('data-max')||'14'), glare=$('.glare',target), raf=null;
      zone.addEventListener('pointermove',function(e){
        var r=zone.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        if(raf) cancelAnimationFrame(raf);
        raf=requestAnimationFrame(function(){
          target.style.transform='rotateY('+(x*max).toFixed(2)+'deg) rotateX('+(-y*max*.8).toFixed(2)+'deg) translateZ(20px)';
          if(glare){glare.style.setProperty('--gx',(50+x*90)+'%');glare.style.setProperty('--gy',(50+y*90)+'%');glare.style.setProperty('--go','1');}
        });
      });
      zone.addEventListener('pointerleave',function(){target.style.transform='';if(glare) glare.style.setProperty('--go','0');});
    });
  }

  /* video players: click-to-load. YouTube runs through the IFrame API so that
     YouTube's pause and end screens (suggested videos) are covered by our own screens */
  var ytQ=[], ytReady=false;
  function withYT(cb){
    if(window.YT&&window.YT.Player){cb();return;}
    ytQ.push(cb);
    if(ytReady) return; ytReady=true;
    var prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=function(){if(prev)prev();var q=ytQ;ytQ=[];q.forEach(function(f){f();});};
    var s=d.createElement('script'); s.src='https://www.youtube.com/iframe_api'; s.async=true; d.head.appendChild(s);
  }
  var orderHref=(function(){var a=$('a[rel~="sponsored"]');return a?a.href:'#';})();
  var canFS=!!(d.fullscreenEnabled||d.webkitFullscreenEnabled);
  function fsToggle(el){
    if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d);}
    else {var r=el.requestFullscreen||el.webkitRequestFullscreen; if(r) r.call(el);}
  }
  /* Focused ("theater") video: the player lifts out of the page, zooms to the centre over a dim
     backdrop, gets a close button, and turns landscape on phones. It returns to its place when the
     video ends or the visitor closes it. */
  var mqRotate=window.matchMedia('(orientation: portrait) and (max-width: 640px)');
  var coarse=window.matchMedia('(pointer: coarse)').matches;
  var openTheater=null;
  d.addEventListener('keydown',function(e){if(e.key==='Escape'&&openTheater) openTheater(true);});
  function bindPlayer(p){
    if(p.bvBound) return; p.bvBound=true;
    if(!p.classList.contains('vert')) p.classList.add('mfit'); /* phone fit for every 16:9 video */
    var yt=p.getAttribute('data-yt'), title=p.getAttribute('data-title')||'Video', more=p.getAttribute('data-more'), player=null, media=null, T=null, endL=null;
    function layer(cls,html){var l=d.createElement('div');l.className='vlayer '+cls;l.innerHTML=html;l.hidden=true;p.appendChild(l);return l;}
    function enterTheater(){
      var r=p.getBoundingClientRect();
      var sp=d.createElement('div'); sp.className='pspacer'; sp.style.height=r.height+'px'; p.parentNode.insertBefore(sp,p);
      var th=d.createElement('div'); th.className='vtheater'+(p.classList.contains('vert')?' vt-vert':'')+(p.classList.contains('mfit')?' mfit':''); th.setAttribute('role','dialog'); th.setAttribute('aria-modal','true'); th.setAttribute('aria-label',title);
      th.innerHTML='<div class="vback"></div><button type="button" class="vclose" aria-label="Close video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="vbox"><div class="vlid"><i class="vcam" aria-hidden="true"></i><div class="vscr"></div></div><div class="vbase" aria-hidden="true"><i></i></div></div>';
      var box=th.querySelector('.vscr'); box.insertBefore(p,box.firstChild);
      if(canFS&&!coarse){var fb=d.createElement('button');fb.type='button';fb.className='vfs';fb.setAttribute('aria-label','Full screen');fb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';fb.addEventListener('click',function(e){e.stopPropagation();th.classList.add('ufs');fsToggle(th);});th.appendChild(fb);}
      d.body.appendChild(th); root.classList.add('vt-open');
      requestAnimationFrame(function(){th.classList.add('on');});
      th.querySelector('.vback').addEventListener('click',function(){closeT(true);});
      th.querySelector('.vclose').addEventListener('click',function(e){e.stopPropagation();closeT(true);});
      T={th:th,sp:sp,back:d.activeElement,fs:false,top:r.top,y:window.scrollY};
      openTheater=closeT;
      setTimeout(function(){var c=th.querySelector('.vclose');if(c)c.focus({preventScroll:true});},60);
      /* phones: try real full screen + landscape (Android); otherwise CSS turns the video sideways */
      if(coarse&&mqRotate.matches&&!p.classList.contains('vert')&&th.requestFullscreen&&screen.orientation&&screen.orientation.lock){
        th.requestFullscreen({navigationUI:'hide'}).then(function(){
          T&&(T.fs=true);
          return screen.orientation.lock('landscape').then(function(){th.classList.add('locked');setTimeout(function(){if(innerWidth<innerHeight) th.classList.remove('locked');},450);});
        }).catch(function(){if(d.fullscreenElement===th) d.exitFullscreen().catch(function(){}); if(T) T.fs=false;});
      }
    }
    function closeT(reset){
      if(!T) return;
      var t=T; T=null; openTheater=null;
      try{if(screen.orientation&&screen.orientation.unlock) screen.orientation.unlock();}catch(_){}
      if(d.fullscreenElement) d.exitFullscreen().catch(function(){});
      if(reset) reset_();
      t.sp.parentNode.insertBefore(p,t.sp); t.sp.remove();
      /* put the visitor back exactly where the video was: same spot on the page, same distance from the top of the screen */
      var htmlEl=d.documentElement, prevSB=htmlEl.style.scrollBehavior; htmlEl.style.scrollBehavior='auto';
      function backToVideo(){var dy=p.getBoundingClientRect().top-t.top; if(Math.abs(dy)>1) window.scrollTo(0,Math.max(0,window.scrollY+dy));}
      backToVideo();
      requestAnimationFrame(backToVideo);
      setTimeout(backToVideo,120); setTimeout(backToVideo,380);
      setTimeout(function(){backToVideo();htmlEl.style.scrollBehavior=prevSB;},700);
      t.th.classList.remove('on'); setTimeout(function(){t.th.remove();},260);
      root.classList.remove('vt-open');
      if(t.back&&t.back.focus) try{t.back.focus({preventScroll:true});}catch(_){}
    }
    d.addEventListener('fullscreenchange',function(){if(!d.fullscreenElement){var u=d.querySelector('.vtheater.ufs');if(u)u.classList.remove('ufs');}if(T&&T.fs&&!d.fullscreenElement){T.fs=false;closeT(true);}});
    function finished(){
      closeT(true);
      if(endL) endL.remove();
      endL=d.createElement('div'); endL.className='vlayer vend';
      endL.innerHTML='<div class="vend-in"><p class="vend-k">Thanks for watching</p><h3>Ready to get your card?</h3><div class="vend-b"><a class="btn btn-go btn-sm" href="'+orderHref+'" target="_blank" rel="sponsored noopener">Order your card</a><button type="button" class="btn btn-ghost btn-sm" data-replay><span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5L7 4.5z"/></svg></span>Watch again</button>'+(more?'<a class="btn btn-ghost btn-sm" href="'+more+'">Read the summary</a>':'')+'</div></div>';
      endL.addEventListener('click',function(e){e.stopPropagation();});
      endL.querySelector('[data-replay]').addEventListener('click',function(){endL.remove();endL=null;play();});
      p.appendChild(endL);
    }
    function play(){
      if(p.classList.contains('playing')) return;
      if(endL){endL.remove();endL=null;}
      enterTheater();
      p.classList.add('playing');
      p.removeAttribute('role'); p.removeAttribute('tabindex');
      var pause=layer('vpause','<button type="button" class="vresume" aria-label="Resume video"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5L7 4.5z" fill="currentColor"/></svg></button><span>Paused</span>');
      pause.addEventListener('click',function(e){e.stopPropagation();if(player) player.playVideo();});
      if(yt){
        var mount=d.createElement('div'); mount.className='ytmount'; p.insertBefore(mount,pause);
        withYT(function(){
          if(!p.classList.contains('playing')) return;
          player=new YT.Player(mount,{host:'https://www.youtube-nocookie.com',videoId:yt,width:'100%',height:'100%',
            playerVars:{autoplay:1,rel:0,iv_load_policy:3,playsinline:1,modestbranding:1,fs:0,disablekb:0,cc_load_policy:0,origin:location.origin},
            events:{
              onReady:function(e){try{e.target.getIframe().title=title;}catch(_){} e.target.playVideo();},
              onStateChange:function(e){var st=e.data; pause.hidden=(st!==2); if(st===0) finished();}
            }});
        });
      } else {
        var v=d.createElement('video'); media=v;
        v.src=p.getAttribute('data-src'); v.controls=true; v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',''); v.preload='auto'; v.setAttribute('title',title);
        v.setAttribute('controlsList','nodownload noremoteplayback'); v.disablePictureInPicture=false;
        var poster=p.querySelector('img'); if(poster) v.poster=poster.currentSrc||poster.src;
        v.addEventListener('ended',finished);
        if(p.classList.contains('vert')){
          /* vertical video: stay upright in full screen too, never switch to landscape */
          var keepUp=function(){var fe=d.fullscreenElement||d.webkitFullscreenElement;if(fe&&(fe===v||fe.contains(v))&&screen.orientation&&screen.orientation.lock){screen.orientation.lock('portrait').catch(function(){});}};
          d.addEventListener('fullscreenchange',keepUp); d.addEventListener('webkitfullscreenchange',keepUp);
        }
        p.insertBefore(v,pause); var pr=v.play(); if(pr&&pr.catch) pr.catch(function(){});
      }
    }
    function reset_(){
      try{if(player&&player.destroy) player.destroy();}catch(_){}
      try{if(media){media.pause();media.removeAttribute('src');media.load();}}catch(_){}
      player=null; media=null;
      $$('video,iframe,.ytmount,.vpause',p).forEach(function(n){n.remove();});
      p.classList.remove('playing'); p.setAttribute('role','button'); p.setAttribute('tabindex','0');
    }
    p.addEventListener('click',function(){if(!p.classList.contains('playing')) play();});
    p.addEventListener('keydown',function(e){if(!p.classList.contains('playing')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();play();}});
    p.bvReset=function(){ if(T) closeT(true); else if(p.classList.contains('playing')) reset_(); if(endL){endL.remove();endL=null;} };
  }
  $$('.player[data-src],.player[data-yt]').forEach(bindPlayer);

  /* tutorial tiles: become playable as soon as the MP4 exists in videos/tutorials/ */
  $$('.player[data-wait]').forEach(function(p){
    var url=p.getAttribute('data-wait');
    if(!window.fetch) return;
    fetch(url,{method:'HEAD',cache:'no-store'}).then(function(r){
      if(!r.ok) return;
      p.setAttribute('data-src',url); p.classList.remove('soon'); p.classList.add('ready');
      p.setAttribute('role','button'); p.setAttribute('tabindex','0'); p.setAttribute('aria-label','Play: '+(p.getAttribute('data-title')||'tutorial'));
      var lb=$('.plabel',p); if(lb) lb.textContent='Watch now';
      var pn=p.closest('.vpanel'); if(pn){var vi=$('.vitem[data-show="'+pn.id+'"] .vdur'); if(vi) vi.textContent='Watch';}
      bindPlayer(p);
    }).catch(function(){});
  });

  /* presentation playlist */
  var lib=$('.vlib');
  if(lib){
    var panels=$$('.vpanel',lib), btns=$$('.vitem',lib);
    function show(id,scroll){
      if(!$('#'+id,lib)) id=panels[0].id;
      panels.forEach(function(pn){var on=pn.id===id;if(!on){var pl=$('.player',pn);if(pl&&pl.bvReset)pl.bvReset();}pn.classList.toggle('off',!on);});
      btns.forEach(function(b){b.setAttribute('aria-current',b.getAttribute('data-show')===id?'true':'false');});
      if(scroll){var st=$('.vstage',lib);var y=st.getBoundingClientRect().top+window.scrollY-90;window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});}
    }
    btns.forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-show');show(id,window.innerWidth<861||$('.vstage',lib).getBoundingClientRect().top<0);try{history.replaceState(null,'','#'+id);}catch(_){}});});
    show((location.hash||'').slice(1)||panels[0].id,false);
    window.addEventListener('hashchange',function(){show(location.hash.slice(1),true);});
  }
  $$('[data-play]').forEach(function(a){a.addEventListener('click',function(e){var t=$(a.getAttribute('data-play'));if(!t)return;e.preventDefault();t.click();});});

  /* =====================================================================
     CALCULATORS (shared tools). Maths:
       rewards a month = cardholders x average top-up x 0.1%
       seats in paid levels = 2^(levels+1) - 2
       payback: referrals x one-time commission vs your card price
     ===================================================================== */
  var reduceM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fmt(n){return Math.round(n).toLocaleString('en-US');}
  function usd(n){return (n>0&&n<100&&Math.abs(n-Math.round(n))>0.004)?'$'+n.toFixed(2):'$'+fmt(n);}
  function roll(el,to,f){ /* numbers count to their new value */
    if(!el) return; var txt=f(to); var from=el._v; el._v=to;
    if(reduceM||from===undefined||from===to||!isFinite(from)){el.textContent=txt;return;}
    var t0=performance.now(), dur=420; cancelAnimationFrame(el._r);
    (function step(t){var k=Math.min(1,(t-t0)/dur), e=1-Math.pow(1-k,3); el.textContent=f(from+(to-from)*e); if(k<1) el._r=requestAnimationFrame(step); else el.textContent=txt;})(t0);
  }
  function wireSpin(tool,onChange){ /* number box + keys + slider + quick picks, kept in sync */
    $$('.tfield',tool).forEach(function(f){
      var inp=$('input[type=number]',f); if(!inp) return;
      var sl=$('input[type=range]',f), chips=$$('.tchips button',f);
      function clamp(v){var mn=+inp.min, mx=+inp.max; v=Math.round(+v||0); return Math.max(mn,Math.min(mx,v));}
      function paint(){var v=clamp(inp.value);
        if(sl){sl.value=Math.min(v,+sl.max); sl.style.setProperty('--k',((Math.min(v,+sl.max)-sl.min)/(sl.max-sl.min)*100)+'%');}
        chips.forEach(function(c){c.classList.toggle('on',+c.getAttribute('data-set')===v);});}
      inp._paint=paint;
      function set(v){inp.value=clamp(v); paint(); onChange();}
      $$('.tkey',f).forEach(function(k){
        var hold=null;
        function bump(){var st=+inp.step||1, cur=clamp(inp.value), d=+k.getAttribute('data-d'); var big=cur>=1000&&st===1?Math.pow(10,Math.floor(Math.log10(cur))-1):st; set(cur+d*big);}
        k.addEventListener('click',bump);
        k.addEventListener('pointerdown',function(){hold=setTimeout(function rep(){bump();hold=setTimeout(rep,70);},450);});
        ['pointerup','pointerleave','pointercancel'].forEach(function(ev){k.addEventListener(ev,function(){clearTimeout(hold);});});
      });
      if(sl) sl.addEventListener('input',function(){inp.value=sl.value; paint(); onChange();});
      chips.forEach(function(c){c.addEventListener('click',function(){set(c.getAttribute('data-set'));});});
      inp.addEventListener('input',function(){paint(); onChange();});
      inp.addEventListener('change',function(){inp.value=clamp(inp.value); paint(); onChange();});
      paint();
    });
  }
  /* rewards tool */
  $$('.tool[data-calc="rewards"]').forEach(function(T){
    var lv=$('[name=lv]',T), n=$('[name=n]',T), a=$('[name=a]',T), o=function(k){return $('[data-o="'+k+'"]',T);};
    function upd(){
      var L=+lv.value, max=Math.pow(2,L+1)-2;
      n.max=max; var nv=Math.max(0,Math.min(max,Math.round(+n.value||0))); if(+n.value>max){n.value=max; n._paint&&n._paint();}
      var av=Math.max(0,Math.round(+a.value||0)), vol=nv*av, rew=vol*0.001, pct=max?nv/max*100:0;
      roll(o('vol'),vol,function(x){return '$'+fmt(x);}); roll(o('rew'),rew,usd); roll(o('yr'),rew*12,usd);
      o('pct').textContent=(pct>0&&pct<0.01?'under 0.01':(pct<1?pct.toFixed(2):pct.toFixed(1)))+'%'; o('bar').style.width=Math.max(pct,nv?1:0)+'%';
      o('how').textContent=fmt(nv)+' cardholders × $'+fmt(av)+' = $'+fmt(vol)+' loaded. 0.1% of that = '+usd(rew)+' a month.';
      $$('.tex',T).forEach(function(b){var l=+b.getAttribute('data-ex');b.classList.toggle('on',l===L&&nv===Math.pow(2,l+1)-2&&av===300);});
    }
    wireSpin(T,upd); lv.addEventListener('change',upd);
    $$('.tex',T).forEach(function(b){b.addEventListener('click',function(){var l=+b.getAttribute('data-ex'); lv.value=l; n.max=Math.pow(2,l+1)-2; n.value=n.max; a.value=300; n._paint(); a._paint(); upd();});});
    var def=(T.getAttribute('data-def')||'12,1000,300').split(',');
    $('[data-reset]',T).addEventListener('click',function(){lv.value=def[0]; n.max=Math.pow(2,+def[0]+1)-2; n.value=def[1]; a.value=def[2]; n._paint(); a._paint(); upd();});
    upd();
  });
  /* payback tool */
  $$('.tool[data-calc="payback"]').forEach(function(T){
    var PRICE={basic:99,premium:270,business:490,gold:990}, COM={basic:10,premium:100,business:200,gold:400}, COMSE={basic:10,premium:150,business:300,gold:500};
    var mine=$('[name=mine]',T), theirs=$('[name=theirs]',T), se=$('[name=se]',T), n=$('[name=n]',T), o=function(k){return $('[data-o="'+k+'"]',T);};
    function upd(){
      var k=Math.max(0,Math.min(50,Math.round(+n.value||0))), price=PRICE[mine.value], per=(se.checked?COMSE:COM)[theirs.value], earned=per*k, left=price-earned;
      roll(o('earned'),earned,function(x){return '$'+fmt(x);}); roll(o('price'),price,function(x){return '$'+fmt(x);});
      var box=o('leftbox');
      if(left<=0){o('leftlab').textContent=left===0?'Your card is':'Covered, plus'; box.classList.add('ok'); box.classList.remove('warn');
        if(left===0){o('left').textContent='Covered'; o('left')._v=undefined;} else roll(o('left'),-left,function(x){return '$'+fmt(x);});}
      else {o('leftlab').textContent='Still to cover'; box.classList.add('warn'); box.classList.remove('ok'); roll(o('left'),left,function(x){return '$'+fmt(x);});}
      var pct=Math.min(100,earned/price*100); o('bar').style.width=pct+'%'; o('pct').textContent=Math.round(pct)+'%';
      var need=Math.ceil(price/per);
      o('how').textContent=k+' × $'+per+' = $'+fmt(earned)+' earned. '+(left<=0?('$'+fmt(earned)+' minus your $'+price+' card = '+(left===0?'exactly covered.':'$'+fmt(-left)+' to spare.')):('$'+price+' card minus $'+fmt(earned)+' = $'+fmt(left)+' still to cover. You need '+need+' referral'+(need===1?'':'s')+' at this level.'));
    }
    wireSpin(T,upd); [mine,theirs,se].forEach(function(el){el.addEventListener('change',upd);});
    var def=(T.getAttribute('data-def')||'business,business,3,0').split(',');
    $('[data-reset]',T).addEventListener('click',function(){mine.value=def[0]; theirs.value=def[1]; n.value=def[2]; se.checked=def[3]==='1'; n._paint(); upd();});
    upd();
  });
  /* tables that turn into cards on phones */
  $$('.tbl-stack').forEach(function(t){var hs=$$('thead th',t).map(function(h){return h.textContent;});$$('tbody tr',t).forEach(function(r){$$('td',r).forEach(function(td,i){if(hs[i]) td.setAttribute('data-label',hs[i]);});});});

  /* =====================================================================
     PROGRESSIVE PAGES: a page opens short (top sections plus a peek of the
     next one). Scrolling down opens the next section by itself; the Up next
     bar, the section navigator, links and find-in-page all open it too.
     ===================================================================== */
  (function(){
    var main=$('#main'); if(!main) return;
    var open=parseInt(main.getAttribute('data-open')||'2',10);
    var secs=$$(':scope > section',main).filter(function(s){return !s.classList.contains('pager-sec');});
    function titleOf(s){var t=s.getAttribute('data-title');if(t)return t;var h=$('h2',s);return h?h.textContent.replace(/\s+/g,' ').trim():'';}
    var rest=secs.slice(open), chapters=[];
    rest.forEach(function(s){var t=titleOf(s);if(t||!chapters.length)chapters.push({els:[s],title:t||'More'});else chapters[chapters.length-1].els.push(s);});
    var titled=secs.filter(function(s){return titleOf(s);});
    var isDash=d.body.classList.contains('is-dash');
    var done=0, busy=false, bar=null, lastY=window.scrollY, dirDown=true, cool=0, nav=null, items=[];
    var progressive=chapters.length>=2;

    if(progressive){
      chapters.forEach(function(c,i){c.els.forEach(function(el){if(i>0||el!==c.els[0]) el.setAttribute('hidden','until-found');});});
      chapters[0].els[0].classList.add('chap-peek');
      bar=d.createElement('div'); bar.className='upnext';
      bar.innerHTML='<button type="button" class="un-go" aria-label="Open the next section" title="Open this section"><span class="un-ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="bg" cx="18" cy="18" r="15.5"/><circle class="fg" cx="18" cy="18" r="15.5"/></svg><i></i></span><span class="un-tx"><small></small><b></b><span class="un-dots" aria-hidden="true"></span></span><span class="un-chev" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></span></button><button type="button" class="un-all"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7l8 5 8-5M4 12l8 5 8-5"/></svg>Open all sections</button>';
      placeBar();
      $('.un-go',bar).addEventListener('click',function(){revealNext(true);});
      $('.un-all',bar).addEventListener('click',function(){revealUpTo(chapters.length-1,true);});
      d.addEventListener('beforematch',function(e){var i=indexOf(e.target);if(i>=0) revealUpTo(i,false);},true);
      /* sections open only when the visitor asks: the Up next bar, Show all, the section navigator or a link */

    }

    function placeBar(){
      if(!bar) return;
      if(done>=chapters.length){bar.remove();bar=null;updateNav();return;}
      var c=chapters[done], anchorEl=c.els[0];
      anchorEl.parentNode.insertBefore(bar,anchorEl.nextSibling);
      $('small',bar).textContent='Tap to open, '+(done+1)+' of '+chapters.length;
      $('b',bar).textContent=c.title;
      var dots='';for(var q=0;q<chapters.length;q++){dots+='<i class="'+(q<done?'on':(q===done?'cur':''))+'"></i>';}
      $('.un-dots',bar).innerHTML=dots;
      bar.style.setProperty('--p',(done/chapters.length).toFixed(3));
      bar.classList.remove('un-pop'); void bar.offsetWidth; bar.classList.add('un-pop');
      updateNav();
    }
    function indexOf(el){for(var i=0;i<chapters.length;i++){for(var j=0;j<chapters[i].els.length;j++){if(chapters[i].els[j]===el||chapters[i].els[j].contains(el))return i;}}return -1;}
    function openChapter(i,animate){
      var c=chapters[i];
      c.els.forEach(function(el,k){
        el.removeAttribute('hidden');
        if(k===0&&el.classList.contains('chap-peek')&&animate&&!reduce){
          var from=el.getBoundingClientRect().height; el.style.maxHeight=from+'px'; el.classList.add('chap-opening'); el.classList.remove('chap-peek');
          requestAnimationFrame(function(){el.style.maxHeight=el.scrollHeight+'px';});
          setTimeout(function(){el.style.maxHeight='';el.classList.remove('chap-opening');},900);
        } else { el.classList.remove('chap-peek'); if(animate&&!reduce){el.classList.add('chap-in');setTimeout(function(){el.classList.remove('chap-in');},900);} }
      });
    }
    function peekNext(animate){
      if(done<chapters.length){var el=chapters[done].els[0];el.removeAttribute('hidden');el.classList.add('chap-peek');if(animate&&!reduce){el.classList.add('peek-in');setTimeout(function(){el.classList.remove('peek-in');},700);}}
    }
    function revealNext(user){
      if(!progressive||busy||done>=chapters.length) return;
      busy=true; cool=Date.now()+1100;
      openChapter(done,true); done++;
      peekNext(true); placeBar();
      setTimeout(function(){busy=false;},700);
    }
    function revealUpTo(i,animate){
      if(!progressive) return;
      while(done<=i&&done<chapters.length){openChapter(done,animate);done++;}
      peekNext(animate); placeBar();
    }
    function goTo(el){
      if(!el) return;
      var i=indexOf(el); if(i>=0&&i>=done) revealUpTo(i,false);
      setTimeout(function(){var y=el.getBoundingClientRect().top+window.scrollY-(isDash?120:90);window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});},30);
    }
    /* links to a spot on this page */
    d.addEventListener('click',function(e){
      if(e.defaultPrevented) return; var a=e.target.closest&&e.target.closest('a[href*="#"]'); if(!a) return;
      var u; try{u=new URL(a.href,location.href);}catch(_){return;}
      if(u.pathname!==location.pathname||!u.hash||u.hash.length<2) return;
      var t=d.getElementById(decodeURIComponent(u.hash.slice(1))); if(!t||$('.vlib')) return;
      e.preventDefault(); goTo(t); try{history.replaceState(null,'',u.hash);}catch(_){}
    });
    if(location.hash.length>1){var t0=d.getElementById(decodeURIComponent(location.hash.slice(1)));if(t0&&indexOf(t0)>=0){revealUpTo(indexOf(t0),false);setTimeout(function(){goTo(t0);},120);}}

    /* section navigator */
    if(titled.length>=3){
      nav=d.createElement('nav'); nav.className=isDash?'secnav':'secrail'; nav.setAttribute('aria-label','Sections on this page');
      var html=isDash?'<button type="button" class="sn-toggle" aria-expanded="false"><span class="sn-k">On this page</span><b></b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button><div class="sn-list">':'<div class="sn-list">';
      titled.forEach(function(s,i){if(!s.id) s.id='s-'+(i+1); html+='<a class="sn-i" href="#'+s.id+'"><i></i><span>'+titleOf(s).replace(/</g,'&lt;')+'</span></a>';});
      nav.innerHTML=html+'</div>';
      if(isDash){var top2=$('.dtop');top2.parentNode.insertBefore(nav,top2.nextSibling);} else d.body.appendChild(nav);
      items=$$('.sn-i',nav);
      var tg=$('.sn-toggle',nav);
      if(tg) tg.addEventListener('click',function(){var o=nav.classList.toggle('open');tg.setAttribute('aria-expanded',o?'true':'false');});
      items.forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open');if(tg)tg.setAttribute('aria-expanded','false');});});
      if('IntersectionObserver' in window){
        var cur=null;
        var sio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cur=e.target.id;mark();}});},{rootMargin:'-35% 0px -60% 0px'});
        titled.forEach(function(s){sio.observe(s);});
        function mark(){items.forEach(function(a){var on=a.getAttribute('href')==='#'+cur;a.classList.toggle('on',on);if(on&&tg)$('b',tg).textContent=a.textContent;
          if(on){var L=a.parentNode;if(L&&L.scrollWidth>L.clientWidth+4){var x=a.offsetLeft-L.clientWidth/2+a.offsetWidth/2;L.scrollTo({left:Math.max(0,x),behavior:reduce?'auto':'smooth'});}}});}
      }
      if(tg) $('b',tg).textContent='Jump to a section';
      updateNav();
    }
    function updateNav(){
      if(!items.length) return;
      items.forEach(function(a){var t=d.getElementById(a.getAttribute('href').slice(1));var i=indexOf(t);a.classList.toggle('locked',i>=0&&i>=done&&progressive);});
      if(!isDash&&nav){nav.classList.toggle('show',window.scrollY>innerHeight*.6);}
    }
    if(nav&&!isDash) window.addEventListener('scroll',function(){nav.classList.toggle('show',window.scrollY>innerHeight*.6);},{passive:true});
  })();

  /* card levels on phones: one level at a time with a level picker (like the video playlist) */
  (function(){
    var mq=window.matchMedia('(max-width: 640px)');
    $$('.tiers').forEach(function(box){
      var tiers=$$('.tier',box); if(tiers.length<2) return;
      var bar=d.createElement('div'); bar.className='tierpick'; bar.setAttribute('role','tablist'); bar.setAttribute('aria-label','Choose a card level');
      tiers.forEach(function(t,i){var n=$('.name',t);var pr=$('.price',t);var b=d.createElement('button');b.type='button';b.setAttribute('role','tab');b.className='tp '+(t.className.match(/\b(basic|prem|biz|gold)\b/)||['',''])[1];b.innerHTML='<b>'+(n?n.textContent:'Level')+'</b><small>'+(pr?pr.childNodes[0].textContent.trim():'')+'</small>';b.addEventListener('click',function(){pick(i,true);});bar.appendChild(b);});
      box.parentNode.insertBefore(bar,box);
      var cur=Math.max(0,tiers.findIndex(function(t){return t.classList.contains('pop');}));
      function pick(i,anim){cur=i;$$('.tp',bar).forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false');});
        tiers.forEach(function(t,k){var on=!mq.matches||k===i;t.classList.toggle('tp-off',!on);if(on&&anim&&mq.matches){t.classList.remove('tp-in');void t.offsetWidth;t.classList.add('tp-in');}});}
      pick(cur,false);
      (mq.addEventListener?mq.addEventListener('change',function(){pick(cur,false);}):mq.addListener(function(){pick(cur,false);}));
    });
  })();
  /* keep the back-to-top button off the Up next bar */
  (function(){var tb=$('.totop');if(!tb||!('IntersectionObserver' in window))return;
    var watch=new MutationObserver(function(){var u=$('.upnext');if(u&&!u.bvWatched){u.bvWatched=true;io2.observe(u);}});
    var io2=new IntersectionObserver(function(es){es.forEach(function(e){root.classList.toggle('un-vis',e.isIntersecting);});});
    var u0=$('.upnext');if(u0){u0.bvWatched=true;io2.observe(u0);}
    watch.observe(d.body,{childList:true,subtree:true});
  })();

  /* click tracking: names the action, sends it to whichever analytics is on the page, never blocks the click */
  (function(){
    var page=location.pathname.replace(/^\/cards\/bellvercards\/?/,'').replace(/\/$/,'')||'home';
    function send(name,label){
      var path='event/'+name+'/'+page+(label?'/'+label:'');
      try{(window.dataLayer=window.dataLayer||[]).push({event:'bv_'+name,bv_page:page,bv_label:label||''});}catch(e){}
      try{if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:path,title:name,event:true});}catch(e){}
      try{if(window.plausible)window.plausible(name,{props:{page:page,label:label||''}});}catch(e){}
      try{if(window.gtag)window.gtag('event',name,{page:page,label:label||''});}catch(e){}
    }
    var seen={};
    d.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href],.player,.un-go');if(!a)return;
      if(a.classList.contains('un-go')){send('open-section',(a.querySelector('b')||{}).textContent||'');return;}
      if(a.classList.contains('player')){send('video-play',a.getAttribute('data-title')||'');return;}
      var h=a.getAttribute('href')||'', tr=a.getAttribute('data-track');
      if(tr){send(tr,'');return;}
      if(h.indexOf('app.bellvercards.com')>-1){send('order',(a.textContent||'').trim().slice(0,40));return;}
      if(h.indexOf('wa.me')>-1){send('whatsapp','');return;}
      if(/\.pdf(\?|$)/.test(h)){send('pdf',h.split('/').pop());return;}
    },true);
    d.addEventListener('input',function(e){var c=e.target.closest&&e.target.closest('[data-calc]');if(c&&!seen[c.getAttribute('data-calc')]){seen[c.getAttribute('data-calc')]=1;send('calculator',c.getAttribute('data-calc'));}},true);
    d.addEventListener('change',function(e){var c=e.target.closest&&e.target.closest('[data-calc]');if(c&&!seen[c.getAttribute('data-calc')]){seen[c.getAttribute('data-calc')]=1;send('calculator',c.getAttribute('data-calc'));}},true);
    d.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('[data-calc] button');if(c&&!seen['b'+c.closest('[data-calc]').getAttribute('data-calc')]){seen['b'+c.closest('[data-calc]').getAttribute('data-calc')]=1;send('calculator',c.closest('[data-calc]').getAttribute('data-calc'));}},true);
  })();

  /* who-table filter */
  (function(){var bar=$('[data-who-filter]'),tb=$('[data-who-table]');if(!bar||!tb)return;var rows=[].slice.call(tb.querySelectorAll('tbody tr')),cnt=$('[data-who-count]');
    function apply(f){var n=0;rows.forEach(function(r){var show=f==='all'||(f==='bl'?r.getAttribute('data-bl')==='1':r.getAttribute('data-cat')===f);r.hidden=!show;if(show)n++;});if(cnt)cnt.textContent=f==='all'?'':'Showing '+n+' of '+rows.length+' groups.';}
    bar.addEventListener('click',function(e){var b=e.target.closest('button[data-f]');if(!b)return;[].forEach.call(bar.querySelectorAll('button'),function(x){x.classList.toggle('on',x===b);});apply(b.getAttribute('data-f'));try{(window.dataLayer=window.dataLayer||[]).push({event:'who_filter',label:b.textContent});}catch(_){}});
  })();

  /* =====================================================================
     FAQ: smooth open and close, a shareable link for every answer,
     opening the answer a link points to, and a live search.
     ===================================================================== */
  (function(){
    var qs=$$('details.qa'); if(!qs.length) return;
    qs.forEach(function(det){
      var sum=$('summary',det), ans=$('.ans',det); if(!sum||!ans) return;
      sum.addEventListener('click',function(e){
        if(reduce) return; e.preventDefault();
        if(det._anim) return;
        if(!det.open){det.open=true; var h=ans.scrollHeight; ans.style.overflow='hidden'; ans.style.height='0px'; ans.style.opacity='0';
          requestAnimationFrame(function(){ans.style.transition='height .38s cubic-bezier(.2,.7,.2,1),opacity .3s'; ans.style.height=h+'px'; ans.style.opacity='1';});
          det._anim=setTimeout(function(){ans.style.cssText='';det._anim=null;},400);}
        else {ans.style.overflow='hidden'; ans.style.height=ans.scrollHeight+'px';
          requestAnimationFrame(function(){ans.style.transition='height .3s cubic-bezier(.2,.7,.2,1),opacity .25s'; ans.style.height='0px'; ans.style.opacity='0';});
          det._anim=setTimeout(function(){det.open=false;ans.style.cssText='';det._anim=null;},310);}
      });
      if(det.id&&det.closest('.faq')){
        var b=d.createElement('button'); b.type='button'; b.className='qa-link';
        b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg><span>Copy link to this answer</span>';
        b.addEventListener('click',function(){var u=location.href.split('#')[0]+'#'+det.id, sp=$('span',b);
          var ok=function(){sp.textContent='Link copied. Paste it in WhatsApp';b.classList.add('done');setTimeout(function(){sp.textContent='Copy link to this answer';b.classList.remove('done');},2400);};
          if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(ok,function(){prompt('Copy this link:',u);});} else prompt('Copy this link:',u);});
        ans.appendChild(b);
      }
    });
    function openFromHash(){var h=decodeURIComponent((location.hash||'').slice(1)); if(!h) return; var t=d.getElementById(h); if(t&&t.matches('details.qa')){t.open=true;setTimeout(function(){t.classList.add('qa-hl');setTimeout(function(){t.classList.remove('qa-hl');},1800);},350);}}
    openFromHash(); window.addEventListener('hashchange',openFromHash);
    var box=$('[data-faqsearch]'); if(!box) return;
    var inp=$('input',box), cnt=$('[data-faqcount]',box), none=$('[data-faqnone]',box);
    var secs=$$('section').filter(function(s){return $('details.qa',s)&&s.closest('#main');});
    inp.addEventListener('input',function(){
      var q=inp.value.trim().toLowerCase();
      if(q.length>=2){var all=$('.upnext .un-all'); if(all) all.click();}
      var n=0;
      qs.forEach(function(det){if(!det.closest('.faq')) return; var hit=q.length<2||det.textContent.toLowerCase().indexOf(q)>=0; det.hidden=!hit; if(hit&&q.length>=2) n++;});
      secs.forEach(function(s){var any=$$('details.qa',s).some(function(x){return !x.hidden;}); var tgt=s.contains(box)?$('.faq-cols',s):s; if(tgt) tgt.classList.toggle('faq-empty',!any);});
      cnt.textContent=q.length<2?'':(n===1?'1 answer found':n+' answers found');
      none.hidden=!(q.length>=2&&n===0);
    });
  })();

  onScroll();
  var y=d.querySelector('[data-year]'); if(y) y.textContent=new Date().getFullYear();
})();
