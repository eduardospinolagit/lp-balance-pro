/* =========================================================
   LP Método Balance Pro — lp.js | Sano Lab
   ========================================================= */

/* ── FAQ accordion ── */
document.querySelectorAll('.lp-faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.lp-faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.lp-faq-item').forEach(el => {
      el.classList.remove('open');
      el.querySelector('.lp-faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ── Fade-in on scroll (respeita prefers-reduced-motion) ── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  const styleEl = document.createElement('style');
  styleEl.textContent = '.lp-visible { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(styleEl);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('lp-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.lp-pain-card, .lp-pillar, .lp-benefit, .lp-price-card, .lp-curr-list li, .lp-forwhom-block').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    observer.observe(el);
  });
}

document.addEventListener('scroll', () => {}, { passive: true });
