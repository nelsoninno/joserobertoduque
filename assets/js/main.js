/* assets/js/main.js: scroll motion. The page is fully readable without it. */
(function () {
  var root = document.documentElement;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) { root.classList.remove('motion'); return; }
  root.classList.add('motion', 'motion-ready');

  /* 1. Reveal blocks as they enter, with a small stagger inside each group */
  var groups = [
    ['.section-head', null],
    ['.why blockquote', null],
    ['.why .wrap > div:last-child > *', 'group'],
    ['.now-grid > div > p, .now-grid .partners', 'group'],
    ['.steps li', 'group'],
    ['.photo', null],
    ['.who li', 'group'],
    ['.timeline li', null],
    ['.moments figure', 'group'],
    ['.family', null],
    ['.belief', 'group'],
    ['.video', 'group'],
    ['.press li', 'group'],
    ['.faq-item', 'group'],
    ['.contact .wrap > *', 'group']
  ];
  var targets = [];
  groups.forEach(function (g) {
    var els = document.querySelectorAll(g[0]);
    els.forEach(function (el, i) {
      el.setAttribute('data-reveal', '');
      if (g[1] === 'group') el.style.setProperty('--d', (Math.min(i, 6) * 70) + 'ms');
      targets.push(el);
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });

  /* 2. Count the facts up once (the real numbers stay in the HTML) */
  var fmt = function (n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); };
  var counters = [];
  document.querySelectorAll('.facts strong').forEach(function (el) {
    var m = el.textContent.match(/^([\d,]+)(.*)$/);
    if (!m) return;
    var end = parseInt(m[1].replace(/,/g, ''), 10);
    if (end < 10) return;
    counters.push({ el: el, end: end, tail: m[2], done: false });
    el.setAttribute('aria-label', el.textContent);
  });
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counters.forEach(function (c) {
        if (c.el !== e.target || c.done) return;
        c.done = true;
        var t0 = performance.now(), dur = 1400;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
          c.el.textContent = fmt(Math.round(c.end * ease)) + c.tail;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
      cio.unobserve(e.target);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (c) { c.el.textContent = '0' + c.tail; cio.observe(c.el); });

  /* 3. Scroll-linked pieces: progress bar, header, journey line, portrait depth */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var header = document.querySelector('.site-header');
  var timeline = document.querySelector('.timeline');
  var fill = null, steps = [];
  if (timeline) {
    fill = document.createElement('span');
    fill.className = 'timeline-fill';
    fill.setAttribute('aria-hidden', 'true');
    timeline.appendChild(fill);
    steps = Array.prototype.slice.call(timeline.querySelectorAll('li'));
  }
  var portrait = document.querySelector('.portrait');
  var wide = window.matchMedia('(min-width: 861px)');

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    if (header) header.classList.toggle('scrolled', y > 8);

    if (timeline) {
      var r = timeline.getBoundingClientRect();
      var mark = vh * 0.6;
      var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
      fill.style.transform = 'scaleY(' + p + ')';
      steps.forEach(function (li) {
        li.classList.toggle('passed', li.getBoundingClientRect().top + 10 < mark);
      });
    }
    if (portrait) {
      /* Desktop only, and never more than 10px, measured from the photo itself */
      var shift = 0;
      if (wide.matches) {
        var pr = portrait.getBoundingClientRect();
        shift = Math.max(-1, Math.min(1, (vh / 2 - (pr.top + pr.height / 2)) / vh)) * 10;
      }
      portrait.style.setProperty('--shift', shift.toFixed(1) + 'px');
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
