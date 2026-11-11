/* MTG's Bellver pages (body.bv-own) and, since 11 Nov 2026, his clients' pages (body.bv-team): nothing may scroll
   sideways on a phone. A table stays a normal table when it fits its box; when it would not fit (a phone, a tablet, or larger
   Android text) it becomes labelled cards, so the page never scrolls sideways. Every cell carries its column name. */
(function () {
  'use strict';
  var d = document;
  function tables() { return d.querySelectorAll('.bv-own table.tbl,.bv-team table.tbl'); }
  function over(t) { return t.scrollWidth > t.parentElement.clientWidth + 1; }
  function fit() {                       // full check: as a table first, cards only if it does not fit
    var ts = tables();
    for (var i = 0; i < ts.length; i++) { ts[i].classList.remove('stk'); if (over(ts[i])) ts[i].classList.add('stk'); }
  }
  function grow() {                      // text got bigger (or fonts loaded): turn into cards if it no longer fits
    var ts = tables();
    for (var i = 0; i < ts.length; i++) if (!ts[i].classList.contains('stk') && over(ts[i])) ts[i].classList.add('stk');
  }
  if (d.readyState !== 'loading') fit(); else d.addEventListener('DOMContentLoaded', fit);
  window.addEventListener('load', fit);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(fit);
  var r; window.addEventListener('resize', function () { clearTimeout(r); r = setTimeout(fit, 120); });
  if ('ResizeObserver' in window) {
    var q = 0, ro = new ResizeObserver(function () { if (!q) q = requestAnimationFrame(function () { q = 0; grow(); }); });
    var start = function () { var ts = tables(); for (var i = 0; i < ts.length; i++) { ro.observe(ts[i]); if (ts[i].tBodies[0]) ro.observe(ts[i].tBodies[0]); } };
    if (d.readyState !== 'loading') start(); else d.addEventListener('DOMContentLoaded', start);
  }
})();
