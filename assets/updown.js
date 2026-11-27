/* MTG | Up and Down buttons on every long page (MTG, 27 Nov 2026: "all the long pages, to have those two buttons", like
   clickbaitpaysus.com, which has had Up and Down since 22 Nov 2026).
   Up: back to the top. Down: the next part of the page (the next section, then the footer, then the very end).
   One line on any page, any site:  <script src="/assets/updown.js?v=1" defer></script>
   (most pages get it from their site's shared script, which loads this file once).
   - If the page already has a back-to-top button (#totop, .totop, .tt, .back-to-top), Down is a twin of it: same look,
     arrow turned around, sitting in the same corner. When Up is hidden (top of the page) Down takes its place; when Up
     shows, Down sits right above it.
   - If the page has no back-to-top button, this file draws both, in gold.
   - Only on long pages (more than about two screens). Never on a video picture: hides while it would lie on a video.
   - Does nothing on pages that already have Up and Down (ClickBaitPays: [data-ud]).
   Copy this file to any new site (same path), like /assets/video-return.js. */
(function () {
'use strict';
var w = window, d = document, html = d.documentElement;
if (w.__mtgUD) return; w.__mtgUD = true;
var RM = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
var GAP = 10;

function ready(f) { if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', f); else f(); }

ready(function () {
  if (d.querySelector('[data-ud],.ud,[data-down],.mtg-dn')) return;      // the page already has Up and Down
  var up = d.querySelector('#totop,button.totop,a.totop,button.tt,.back-to-top,[data-totop]');
  var own = !up;
  var css = d.createElement('style');
  css.textContent =
    '.mtg-dn{transition:opacity .3s,bottom .35s cubic-bezier(.16,1,.3,1),visibility 0s .3s!important}' +
    '.mtg-dn.mtg-on{transition:opacity .3s,bottom .35s cubic-bezier(.16,1,.3,1),visibility 0s!important}' +
    '.mtg-dn .mtg-flip{transform:rotate(180deg);transform-origin:50% 50%}' +
    /* our own pair (pages with no back-to-top button): flat gold, like the MTG TRIBE button */
    '.mtg-ud{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(18px + env(safe-area-inset-bottom,0px));z-index:94;display:grid;place-items:center;width:48px;height:48px;padding:0;border:0;border-radius:50%;cursor:pointer;' +
      'color:#1a1002;background:linear-gradient(180deg,#ffd98e,#f2ad3c);box-shadow:inset 0 0 0 1px rgba(255,236,190,.6),0 8px 22px rgba(0,0,0,.45),0 0 0 4px rgba(242,173,60,.14);-webkit-tap-highlight-color:transparent;' +
      'opacity:0;visibility:hidden;transition:opacity .3s,bottom .35s cubic-bezier(.16,1,.3,1),visibility 0s .3s}' +
    '.mtg-ud.mtg-on{opacity:1;visibility:visible;transition:opacity .3s,bottom .35s cubic-bezier(.16,1,.3,1),visibility 0s}' +
    '.mtg-ud svg{width:20px;height:20px}' +
    '.mtg-ud:hover{filter:brightness(1.07)}.mtg-ud:active{transform:scale(.94)}' +
    '.mtg-ud:focus-visible,.mtg-dn:focus-visible{outline:3px solid #ffd98e;outline-offset:3px}' +
    '@media (max-width:640px){.mtg-ud{width:44px;height:44px}}' +
    '@media (prefers-reduced-motion:reduce){.mtg-dn,.mtg-dn.mtg-on,.mtg-ud,.mtg-ud.mtg-on{transition:none!important}}' +
    '@media print{.mtg-dn,.mtg-ud{display:none!important}}';
  d.head.appendChild(css);

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';
  var dn;
  if (own) {
    up = d.createElement('button'); up.type = 'button'; up.className = 'mtg-ud mtg-up';
    up.setAttribute('aria-label', 'Up: back to the top'); up.title = 'Back to the top'; up.innerHTML = ARROW;
    d.body.appendChild(up);
    up.addEventListener('click', function () { jump(0); });
    dn = d.createElement('button'); dn.className = 'mtg-ud mtg-dn';
    dn.innerHTML = ARROW.replace('<svg ', '<svg class="mtg-flip" ');
    d.body.appendChild(dn);
  } else {
    dn = up.cloneNode(true);
    dn.removeAttribute('id'); dn.removeAttribute('onclick'); dn.removeAttribute('href'); dn.removeAttribute('data-totop');
    dn.classList.add('mtg-dn'); dn.classList.remove('on', 'show', 'visible', 'is-visible', 'vis');
    // a reading-progress ring belongs to Up only; Down keeps the track, not the moving bar
    Array.prototype.forEach.call(dn.querySelectorAll('[id]'), function (el) { el.removeAttribute('id'); });
    Array.prototype.forEach.call(dn.querySelectorAll('.fg,.bar,.pr .bar,.ring .fg,.tr .fg'), function (el) { el.parentNode.removeChild(el); });
    // turn the arrow around: the last icon in the button that is not the ring
    var icons = Array.prototype.filter.call(dn.querySelectorAll('svg'), function (s) { return !s.matches('.ring,.pr,.tr') && !s.closest('.ring,.pr,.tr'); });
    var arr = icons[icons.length - 1];
    if (arr) arr.classList.add('mtg-flip');
    else dn.innerHTML = dn.innerHTML.replace('↑', '↓').replace('&uarr;', '&darr;');
    if (dn.tagName !== 'BUTTON') { dn.setAttribute('role', 'button'); dn.setAttribute('tabindex', '0'); }
    up.parentNode.insertBefore(dn, up.nextSibling);
  }
  if (dn.tagName === 'BUTTON') dn.type = 'button';
  dn.setAttribute('aria-label', 'Down: the next part of this page'); dn.title = 'Next part';

  function jump(top) { var y = Math.max(0, top); try { w.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); } catch (e) { w.scrollTo(0, y); } }

  /* the fixed bar at the top of the page (so a section never hides under it) */
  function topBar() {
    var h = 0, xs = [w.innerWidth / 2, 24, w.innerWidth - 24];
    for (var i = 0; i < xs.length; i++) {
      var el = d.elementFromPoint(xs[i], 3);
      while (el && el !== d.body && el !== html) {
        var cs = getComputedStyle(el);
        if (cs.position === 'fixed' || cs.position === 'sticky') { var r = el.getBoundingClientRect(); if (r.top <= 4 && r.height < w.innerHeight * 0.4) h = Math.max(h, r.bottom); break; }
        el = el.parentElement;
      }
    }
    return h;
  }

  /* the parts of the page Down stops at: sections, the parts of <main>, then the footer */
  function stops() {
    var main = d.querySelector('main') || d.body;
    var list = Array.prototype.slice.call(d.querySelectorAll('main > *, main > div > section, main section, article > section, body > section, section[id], .sec, [data-stop], footer, main h2, article h2, .prose h2'));
    if (main !== d.body) list = list.concat(Array.prototype.slice.call(main.children));
    var seen = [], out = [];
    list.forEach(function (el) {
      if (seen.indexOf(el) > -1) return; seen.push(el);
      if (el.matches('script,style,template,link,meta,dialog,[hidden],.mtg-ud,.mtg-dn')) return;
      var cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      var r = el.getBoundingClientRect(); if (r.height < 120 && el.tagName !== 'FOOTER' && el.tagName !== 'H2') return;
      if (el.tagName === 'H2' && (r.height === 0 || el.closest('dialog,[role="dialog"],nav,aside,header,.md-side'))) return;
      out.push({ el: el, y: r.top + (w.scrollY || 0) });
    });
    out.sort(function (a, b) { return a.y - b.y; });
    return out;
  }

  function down() {
    var bar = topBar(), y = w.scrollY || 0, line = y + bar + 24;
    var all = stops(), next = all.filter(function (s) { return s.y > line; })[0];
    // never skip more than about two screens of reading: stop at the next heading on the way
    if (!next || next.y - line > w.innerHeight * 2) {
      var lim = next ? next.y : html.scrollHeight, sy = w.scrollY || 0;
      var h = Array.prototype.map.call(d.querySelectorAll('main h2, main h3, article h2, article h3, .prose h2, .prose h3, li[id^="step"]'), function (el) {
        return { el: el, y: el.getBoundingClientRect().top + sy, ok: el.offsetHeight > 0 && !el.closest('dialog,[role="dialog"],nav,aside,header,.md-side') };
      }).filter(function (s) { return s.ok && s.y > line + 40 && s.y < lim; }).sort(function (a, b) { return a.y - b.y; })[0];
      if (h && h.y - line <= w.innerHeight * 2) next = h;
      else if (next) next = { y: line + w.innerHeight * 0.85 };           // a long stretch with no headings: one screen at a time
    }
    var max = html.scrollHeight - w.innerHeight;
    var to = next ? next.y - bar - 12 : y + w.innerHeight * 0.85;
    if (to <= y + 40) to = y + w.innerHeight * 0.85;                    // sections too close together: one screen down
    jump(Math.min(to, max));
  }
  dn.addEventListener('click', down);
  dn.addEventListener('keydown', function (e) { if (dn.tagName !== 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); down(); } });

  /* where Up is and whether it shows */
  function upShown() {
    if (own) return up.classList.contains('mtg-on');
    var cs = getComputedStyle(up);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return up.matches('.on,.show,.visible,.is-visible,.vis,.in,.active') || parseFloat(cs.opacity) > 0.6;
  }
  var VID = 'video,iframe,.pl,.vm-vid,.vplay,[data-play],.video,.vid,.player,.yt,.cover-play';
  function onVideo(r) {
    return Array.prototype.some.call(d.querySelectorAll(VID), function (v) {
      if (v.closest('dialog,[role="dialog"],#vm,.sheet,.modal,[aria-hidden="true"]')) return false;
      if (v.tagName === 'VIDEO' && (v.loop || v.autoplay) && !v.controls) return false;   // a moving background, not a video to watch
      var q = v.getBoundingClientRect(); if (q.width < 60 || q.height < 60) return false;
      return q.bottom > r.top - 6 && q.top < r.bottom + 6 && q.right > r.left - 6 && q.left < r.right + 6;
    });
  }
  var tick = false;
  function paint() {
    tick = false;
    var y = w.scrollY || html.scrollTop, vh = w.innerHeight || html.clientHeight, max = html.scrollHeight - vh;
    var long = html.scrollHeight > vh * 2.1;
    if (own) up.classList.toggle('mtg-on', long && y > vh * 0.6);
    var cs = getComputedStyle(up), ub = parseFloat(cs.bottom) || 18, ur = parseFloat(cs.right) || 18, uh = up.offsetHeight || 48;
    var shown = upShown(), ru = up.getBoundingClientRect();
    // Up shown: right above it, wherever its page has moved it (some lift it off a bar or the footer); hidden: in its place
    var b = shown && ru.height ? Math.max(ub + uh + GAP, vh - ru.top + GAP) : ub;
    if (shown && ru.width) ur = Math.max(0, (w.innerWidth || html.clientWidth) - ru.right + (ru.width - (dn.offsetWidth || ru.width)) / 2);
    dn.style.setProperty('position', 'fixed', 'important');
    dn.style.setProperty('right', ur + 'px', 'important');
    dn.style.setProperty('left', 'auto', 'important');
    dn.style.setProperty('top', 'auto', 'important');
    dn.style.setProperty('bottom', b + 'px', 'important');
    dn.style.setProperty('margin', '0', 'important');
    var want = long && y < max - 80;
    if (want) {                                       // never on the picture of a video
      var vw = w.innerWidth, s = dn.offsetWidth || uh;
      want = !onVideo({ top: vh - b - s, bottom: vh - b, left: vw - ur - s, right: vw - ur });
    }
    dn.classList.toggle('mtg-on', want);
    dn.style.setProperty('opacity', want ? '1' : '0', 'important');
    dn.style.setProperty('visibility', want ? 'visible' : 'hidden', 'important');
    dn.style.setProperty('pointer-events', want ? 'auto' : 'none', 'important');
    if (!own) dn.style.setProperty('transform', 'none', 'important');
  }
  function soon() { if (!tick) { tick = true; requestAnimationFrame(paint); } }
  w.addEventListener('scroll', soon, { passive: true });
  w.addEventListener('resize', soon);
  w.addEventListener('load', soon);
  if (w.MutationObserver && !own) new MutationObserver(function () { soon(); setTimeout(soon, 420); }).observe(up, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
  setTimeout(soon, 600); paint();
});
})();
