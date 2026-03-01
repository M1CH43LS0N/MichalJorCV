/*
 * ── Scroll-triggered entrance animations ──
 *
 * IntersectionObserver watches every .animate-in element.
 * When at least 8% of an element enters the viewport (threshold: 0.08),
 * the "visible" class is added, triggering the CSS opacity + translateY transition.
 * observer.unobserve() is then called so the element is no longer watched —
 * it has already animated and there is no reason to keep observing it.
 */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);   // stop watching once animated in
    }
  });
}, { threshold: 0.08 });

// Register every element that should animate on scroll
document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

/*
 * ── Subtle background grid parallax ──
 *
 * On scroll, the body's backgroundPositionY is shifted by a tiny fraction
 * of the scroll distance (0.02×). The effect is very gentle — just enough
 * depth to feel alive without being distracting.
 *
 * The requestAnimationFrame + ticking pattern is a performance optimization:
 * it ensures the position is only updated once per animation frame, even if
 * the scroll event fires many times per frame (common on high-refresh devices).
 */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const y = window.scrollY * 0.02;
      document.body.style.backgroundPositionY = y + 'px';
      ticking = false;   // reset flag so the next scroll event can queue another frame
    });
    ticking = true;   // block further queuing until the current frame runs
  }
});
