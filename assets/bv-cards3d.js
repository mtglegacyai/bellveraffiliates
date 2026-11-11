/* The Bellver glass stack (MTG, 11 Nov 2026), see bv-cards3d.css. This script: lets the cards land and the stack open
   when the section scrolls into view, draws a leader line from every card to its label, pulls a card out when it (or
   its label) is tapped and opens its details, and walks through the four cards once on its own until the visitor
   touches anything. The numbers live in the page's HTML, never in here. No script: the stack simply stands open. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia && w.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }

  function setup(root) {
    var stage = root.querySelector('.cs3-stage'), svg = root.querySelector('.cs3-lines');
    var cards = $$('.cs3-card', root), tags = $$('.cs3-tag', root), lvs = $$('.cs3-lv', root);
    if (!stage || !svg || !cards.length) return;
    var by = {};
    cards.forEach(function (c) { var k = c.getAttribute('data-k'); by[k] = { card: c, an: c.querySelector('.an') }; });
    tags.forEach(function (t) { var k = t.getAttribute('data-k'); if (by[k]) by[k].tag = t; });
    lvs.forEach(function (l) { var k = l.getAttribute('data-k'); if (by[k]) by[k].lv = l; });
    Object.keys(by).forEach(function (k) {                       // one line, one dot and one ring per card
      var g = d.createElementNS(NS, 'g'); g.setAttribute('class', k);
      var p = d.createElementNS(NS, 'path'), dot = d.createElementNS(NS, 'circle'), ring = d.createElementNS(NS, 'circle');
      dot.setAttribute('r', '3'); ring.setAttribute('r', '3'); ring.setAttribute('class', 'ring');
      g.appendChild(p); g.appendChild(ring); g.appendChild(dot); svg.appendChild(g);
      by[k].g = g; by[k].p = p; by[k].dot = dot; by[k].ring = ring;
    });
    root.classList.add('js');

    var current = null;
    function select(k, user) {
      if (!by[k]) return;
      current = k;
      Object.keys(by).forEach(function (x) {
        var on = x === k, o = by[x];
        o.card.classList.toggle('on', on); o.g.classList.toggle('on', on);
        if (o.tag) o.tag.setAttribute('aria-pressed', String(on));
        if (o.lv) o.lv.classList.toggle('on', on);
      });
      if (by[k].tag) root.style.setProperty('--sel', getComputedStyle(by[k].tag).getPropertyValue('--c').trim());
      root.classList.add('picked');
      if (user) stopTour();
      if (reduce) draw();
    }

    function draw() {                                           // from each card's corner to its label
      var s = stage.getBoundingClientRect();
      Object.keys(by).forEach(function (k) {
        var o = by[k]; if (!o.tag || !o.an) return;
        var a = o.an.getBoundingClientRect(), t = o.tag.getBoundingClientRect();
        var ax = a.left + a.width / 2 - s.left, ay = a.top + a.height / 2 - s.top, tx = t.left - s.left, ty = t.top + t.height / 2 - s.top;
        var ex = Math.max(ax + 4, tx - 16);
        o.p.setAttribute('d', 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + (ex < tx ? ' L' + ex.toFixed(1) + ' ' + ty.toFixed(1) : '') + ' L' + tx.toFixed(1) + ' ' + ty.toFixed(1));
        o.dot.setAttribute('cx', ax.toFixed(1)); o.dot.setAttribute('cy', ay.toFixed(1));
        o.ring.setAttribute('cx', ax.toFixed(1)); o.ring.setAttribute('cy', ay.toFixed(1));
      });
    }

    var visible = false, running = false;
    function loop() { if (!visible) { running = false; return; } draw(); w.requestAnimationFrame(loop); }
    function run() { if (!running && !reduce) { running = true; w.requestAnimationFrame(loop); } }

    /* the walk through the four cards, once, until the visitor touches anything */
    var TOUR = ['basic', 'prem', 'biz', 'gold', 'biz'], ti = 0, timer = null, toured = false;
    function step() { if (ti >= TOUR.length) { timer = null; return; } select(TOUR[ti++], false); timer = setTimeout(step, 2700); }
    function startTour() { if (toured || reduce) return; toured = true; ti = 0; step(); }
    function stopTour() { toured = true; if (timer) { clearTimeout(timer); timer = null; } }

    var live = false;
    function arrive() {
      if (live) return; live = true;
      root.classList.add('live');
      if (reduce) { root.classList.add('ready'); draw(); return; }
      setTimeout(function () { root.classList.add('ready'); if (visible) startTour(); }, 2100);
    }

    cards.forEach(function (c) { c.addEventListener('click', function () { select(c.getAttribute('data-k'), true); }); });
    tags.forEach(function (t) { t.addEventListener('click', function () { select(t.getAttribute('data-k'), true); }); });
    root.addEventListener('keydown', stopTour); root.addEventListener('pointerdown', stopTour);

    if (fine && !reduce) {                                       // the stack leans a little towards the mouse
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        root.style.setProperty('--tz', (x * 9).toFixed(2) + 'deg'); root.style.setProperty('--tx', (-y * 6).toFixed(2) + 'deg');
      });
      stage.addEventListener('pointerleave', function () { root.style.setProperty('--tz', '0deg'); root.style.setProperty('--tx', '0deg'); });
    }

    var start = root.querySelector('.cs3-lv.on'); select(start ? start.getAttribute('data-k') : 'biz', false);
    root.classList.remove('picked');
    if ('IntersectionObserver' in w) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) { run(); if (es[0].intersectionRatio >= .3) arrive(); }
      }, { threshold: [0, .3, .6] }).observe(stage);
    } else { visible = true; arrive(); run(); }
    w.addEventListener('resize', draw); w.addEventListener('load', draw);
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(draw);
    draw();
  }

  function init() { $$('[data-cs3]').forEach(setup); }
  if (d.readyState !== 'loading') init(); else d.addEventListener('DOMContentLoaded', init);
})();
