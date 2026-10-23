/* Bellver Cards by MTG | 2x2 Matrix Explained: hero animation, seat builder, calculator, quiz */
(function(){
  'use strict';
  var $=function(s,c){return (c||document).querySelector(s);}, $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS='http://www.w3.org/2000/svg';
  function money(v){return v<10?'$'+v.toFixed(2):'$'+Math.round(v).toLocaleString('en-US');}
  function lvOf(i){return Math.floor(Math.log2(i+1));}

  /* ---------- hero: seats fill in reading order, then coins rise to YOU ---------- */
  var hero=$('.mx-hero');
  if(hero){
    var seats=$$('.seat',hero), cap=$('[data-hero-n]'), you=$('.you circle',hero);
    if(reduce){seats.forEach(function(s){s.classList.add('on');}); if(cap)cap.textContent=seats.length;}
    else{
      var k=0, timer;
      var coins=function(){
        var yx=+you.getAttribute('cx'), yy=+you.getAttribute('cy');
        seats.forEach(function(s,j){
          var c=$('circle',s), x=+c.getAttribute('cx'), y=+c.getAttribute('cy');
          var dot=document.createElementNS(NS,'circle'); dot.setAttribute('r','4.5'); dot.setAttribute('class','coin'); dot.setAttribute('cx',x); dot.setAttribute('cy',y);
          hero.appendChild(dot);
          var a=dot.animate([{transform:'translate(0,0)',opacity:0},{opacity:1,offset:.15},{transform:'translate('+(yx-x)+'px,'+(yy-y)+'px)',opacity:.2}],{duration:1300,delay:j*60,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});
          a.onfinish=function(){dot.remove();};
        });
        you.animate([{filter:'none'},{filter:'drop-shadow(0 0 14px rgba(252,190,37,.95))'},{filter:'none'}],{duration:900,delay:1300});
      };
      var tick=function(){
        if(k<seats.length){
          var s=seats[k]; s.classList.add('on','pop'); setTimeout(function(){s.classList.remove('pop');},380);
          k++; if(cap)cap.textContent=k; timer=setTimeout(tick,k<3?650:330);
        } else {
          coins(); timer=setTimeout(function(){seats.forEach(function(s){s.classList.remove('on');}); k=0; if(cap)cap.textContent=0; timer=setTimeout(tick,700);},3600);
        }
      };
      if('IntersectionObserver' in window){
        var started=false;
        new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!started){started=true;timer=setTimeout(tick,600);}});}).observe(hero);
      } else timer=setTimeout(tick,600);
    }
  }

  /* ---------- seat builder ---------- */
  var B=$('[data-mx-build]');
  if(B){
    var W=480, GAP=92, R=[30,26,23,20], N=15, pos=[], owner={}, holder=$('[data-svg]',B), msg=$('[data-msg]',B), last=-1;
    for(var i=0;i<N;i++){var lv=lvOf(i), n=Math.pow(2,lv), col=i-(n-1); pos.push([(col+.5)*W/n,40+lv*GAP,R[lv]]);}
    var draw=function(){
      var h=40+3*GAP+40, out='<svg class="mx-tree" viewBox="-64 0 '+(W+64)+' '+h+'" role="img" aria-label="Your matrix: You and 14 seats on 3 levels"><g class="ln">';
      for(var i=1;i<N;i++){var p=pos[(i-1)>>1], q=pos[i]; out+='<line x1="'+p[0]+'" y1="'+p[1]+'" x2="'+q[0]+'" y2="'+q[1]+'"/>';}
      out+='</g>';
      for(var l=1;l<=3;l++) out+='<text class="rowlab" x="-60" y="'+(44+l*GAP)+'">LEVEL '+l+'</text>';
      out+='<g class="you" data-i="0" tabindex="0" role="button" aria-label="You: refer someone"><circle cx="'+pos[0][0]+'" cy="'+pos[0][1]+'" r="'+R[0]+'"/><text x="'+pos[0][0]+'" y="'+(pos[0][1]+5)+'">YOU</text></g>';
      for(var j=1;j<N;j++){
        var o=owner[j], c='seat lv'+lvOf(j)+(o?' full '+o.t:'')+(j===last?' new':'');
        var lab=o?('Seat '+j+', filled. Tap to let this person refer someone'):('Seat '+j+', empty');
        out+='<g class="'+c+'" data-i="'+j+'"'+(o?' tabindex="0" role="button"':'')+' aria-label="'+lab+'"><circle cx="'+pos[j][0]+'" cy="'+pos[j][1]+'" r="'+pos[j][2]+'"/><text x="'+pos[j][0]+'" y="'+(pos[j][1]+5)+'">'+j+'</text></g>';
      }
      holder.innerHTML=out+'</svg>';
    };
    var nextFree=function(root){
      var q=[root];
      while(q.length){var x=q.shift(); if(x!==root&&!owner[x])return x; var a=2*x+1,b=2*x+2; if(a<N)q.push(a); if(b<N)q.push(b);}
      return -1;
    };
    var say=function(h){msg.innerHTML=h;};
    var place=function(kind,by){
      var root=kind==='team'?by:0, p=nextFree(root);
      if(p<0){
        if(kind==='team') say('Seat '+by+' has no free seats left in this picture. In real life, the new person goes deeper, to Level 4 and beyond. Nobody is lost.');
        else say('All 14 seats in this picture are full. That is 3 levels. A real matrix keeps going, down to Level 20. Press <b>Reset</b> to try again.');
        return;
      }
      owner[p]={t:kind==='you'?'mine':(kind==='team'?'team':'spillx'),by:by}; last=p; draw();
      var L='Seat '+p+' (Level '+lvOf(p)+'). ';
      if(kind==='you'){
        var extra=lvOf(p)>1?' Your Level 1 seats were already full, so the system used the next free seat in reading order.':'';
        say('<b>'+L+'You referred them.</b> You earn the direct commission, and their top-ups count toward your monthly rewards.'+extra);
      } else if(kind==='team'){
        say('<b>'+L+'The person in seat '+by+' referred them.</b> Seat '+by+' earns the direct commission. They sit in your Level '+lvOf(p)+', so their top-ups count toward your rewards too.');
      } else {
        say('<b>'+L+'Spillover.</b> Someone above you referred them. No direct commission for you, but their top-ups count toward your monthly rewards.');
      }
    };
    B.addEventListener('click',function(e){
      var b=e.target.closest('[data-act]');
      if(b){var a=b.getAttribute('data-act'); if(a==='reset'){owner={};last=-1;draw();say('Empty again. Press <b>You refer someone</b> to start.');} else place(a==='you'?'you':'spill'); return;}
      var g=e.target.closest('g[data-i]'); if(!g)return;
      var i=+g.getAttribute('data-i');
      if(i===0) place('you'); else if(owner[i]) place('team',i);
      else say('Seat '+i+' is still empty. Seats fill in reading order, so it gets the next person whose turn it is.');
    });
    B.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches('g[data-i]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
    draw();
  }

  /* ---------- calculator ---------- */
  var C=$('[data-calc="matrix"]');
  if(C){
    var sel=$('[name=lv]',C), num=$('[name=n]',C), avg=$('[name=avg]',C), o=function(k){return $('[data-o="'+k+'"]',C);};
    var upd=function(){
      var lv=+sel.value, max=Math.pow(2,lv+1)-2, n=Math.max(0,Math.min(max,Math.floor(+num.value||0)));
      if(+num.value>max) num.value=max;
      num.max=max;
      var a=+avg.value, vol=n*a, rew=vol*0.001, pct=n/max*100;
      avg.style.setProperty('--k',((a-avg.min)/(avg.max-avg.min)*100)+'%'); o('avg').textContent='$'+a; o('vol').textContent=money(vol); o('rew').textContent=money(rew); o('yr').textContent=money(rew*12);
      o('pct').textContent=(pct>0&&pct<0.01?'under 0.01':(pct<1?pct.toFixed(2):pct.toFixed(1)))+'%'; o('bar').style.width=Math.max(pct,n?1:0)+'%';
      $$('.mx-chips button',C).forEach(function(b){b.classList.toggle('on',+b.getAttribute('data-n')===n);});
    };
    $$('.mx-chips button',C).forEach(function(b){b.addEventListener('click',function(){num.value=b.getAttribute('data-n');upd();});});
    [sel,num,avg].forEach(function(el){el.addEventListener('input',upd);el.addEventListener('change',upd);});
    upd();
  }

  /* ---------- quiz ---------- */
  var Q=$('[data-quiz]');
  if(Q){
    var data=JSON.parse($('script',Q).textContent), qi=0, score=0;
    var qq=$('[data-qq]',Q), qa=$('[data-qa]',Q), qe=$('[data-qe]',Q), nx=$('[data-qnext]',Q), qn=$('[data-qn]',Q), qs=$('[data-qs]',Q), bar=$('[data-qbar]',Q);
    var show=function(){
      var d=data[qi]; qn.textContent='Question '+(qi+1)+' of '+data.length; qs.textContent='Score '+score; bar.style.width=(qi/data.length*100)+'%';
      qq.textContent=d.q; qe.innerHTML=''; nx.hidden=true; qa.innerHTML='';
      d.a.forEach(function(t,j){var b=document.createElement('button'); b.type='button'; b.innerHTML='<span class="l">'+'ABC'[j]+'</span>'; b.appendChild(document.createTextNode(t)); b.addEventListener('click',function(){pick(j);}); qa.appendChild(b);});
    };
    var pick=function(j){
      var d=data[qi], bs=$$('button',qa);
      bs.forEach(function(b,x){b.disabled=true; if(x===d.c)b.classList.add('right'); else if(x===j)b.classList.add('wrong');});
      if(j===d.c){score++; qe.innerHTML='<b class="g">Correct.</b> '+d.e;} else qe.innerHTML='<b class="r">Not quite.</b> '+d.e;
      qs.textContent='Score '+score; nx.hidden=false; nx.textContent=qi<data.length-1?'Next question':'See my score'; nx.focus({preventScroll:true});
    };
    nx.addEventListener('click',function(){
      qi++;
      if(qi<data.length){show();return;}
      bar.style.width='100%'; qn.textContent='Done'; nx.hidden=true; qa.innerHTML=''; qq.textContent='';
      var line=score===data.length?'Perfect. You can explain the 2x2 matrix to anyone now.':(score>=4?'Nearly there. Scroll back up to the step you missed, then try again.':'No problem. Read the seven steps once more, then try again.');
      qe.innerHTML='<div class="mx-qdone"><b>'+score+' / '+data.length+'</b>'+line+'</div>';
      var again=document.createElement('button'); again.type='button'; again.className='btn btn-ghost btn-sm'; again.textContent='Try again'; again.style.margin='16px auto 0'; again.style.display='flex';
      again.addEventListener('click',function(){qi=0;score=0;show();}); qe.appendChild(again);
    });
    show();
  }
})();
