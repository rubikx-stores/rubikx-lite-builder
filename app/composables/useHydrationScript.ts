// Standalone, dependency-free copy of loadSlider() from
// app/plugins/rubikx-hydration.client.ts, embedded directly into saved page
// HTML (see PageBuilderWrapper.client.vue's toHtml()) so the carousel is
// interactive on the actual published page — which never loads this app's
// Nuxt/Vue bundle, only the bare HTML fragment sent to Odoo.
//
// Kept as a plain string (not a build step) since this needs zero
// dependencies: no imports, only DOM APIs, so it runs unmodified anywhere.
// Wrapped in a readyState check since this script is embedded before the
// slider markup in the saved fragment — the slide/dot/arrow elements may
// not exist in the DOM yet when this tag's script executes.
export const SLIDER_SCRIPT = `(function() {
  function loadSlider(el) {
    if (el.dataset.hydrated === 'true') return;
    el.dataset.hydrated = 'true';

    var slides = Array.prototype.slice.call(el.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(el.querySelectorAll('[data-dot]'));
    var prevBtn = el.querySelector('[data-prev]');
    var nextBtn = el.querySelector('[data-next]');
    var autoPlay = el.dataset.autoplay === 'true';
    var interval = parseInt(el.dataset.interval || '4000', 10);

    if (!slides.length) return;

    var cur = 0;
    var timer = null;

    function goTo(n) {
      slides[cur].style.opacity = '0';
      slides[cur].style.pointerEvents = 'none';
      if (dots[cur]) {
        dots[cur].style.width = '8px';
        dots[cur].style.background = dots[cur].dataset.inactiveColor || 'rgba(255,255,255,0.5)';
      }
      cur = (n + slides.length) % slides.length;
      slides[cur].style.opacity = '1';
      slides[cur].style.pointerEvents = 'auto';
      if (dots[cur]) {
        dots[cur].style.width = '24px';
        dots[cur].style.background = dots[cur].dataset.activeColor || '#ffffff';
      }
    }

    function startTimer() {
      if (autoPlay) timer = setInterval(function () { goTo(cur + 1); }, interval);
    }
    function stopTimer() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { stopTimer(); goTo(cur - 1); startTimer(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stopTimer(); goTo(cur + 1); startTimer(); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { stopTimer(); goTo(i); startTimer(); });
    });
    el.addEventListener('mouseenter', stopTimer);
    el.addEventListener('mouseleave', startTimer);

    startTimer();
  }

  function run() {
    var els = document.querySelectorAll('[data-rubikx-component="HeroSlider"]');
    for (var i = 0; i < els.length; i++) loadSlider(els[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();`
