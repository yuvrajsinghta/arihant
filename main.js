/**
 * ARIHANT HERITAGE — main.js
 * Mobile-First · Premium UX · All Interactions
 * Version: 4.0 FINAL
 */

'use strict';

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);
const raf = requestAnimationFrame;

/* ══════════════════════════════════════
   1. NAV — SCROLL SHADOW + STICKY
══════════════════════════════════════ */
function initNav() {
  const nav = $('#navbar');
  if (!nav) return;
  on(window, 'scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ══════════════════════════════════════
   2. MOBILE DRAWER
══════════════════════════════════════ */
function initDrawer() {
  const hamBtn   = $('#hamBtn');
  const drawer   = $('#drawer');
  const mask     = $('#drawerMask');
  const closeBtn = $('#drawerClose');
  const drawerEnq = $('#drawerEnq');

  if (!hamBtn || !drawer) return;

  let isOpen = false;

  function open() {
    isOpen = true;
    drawer.classList.add('open');
    mask.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamBtn.classList.add('ham-open');
    hamBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    // Focus trap: focus first drawer link
    const firstLink = drawer.querySelector('a, button');
    raf(() => firstLink?.focus());
  }

  function close() {
    isOpen = false;
    drawer.classList.remove('open');
    mask.classList.remove('open');
    document.body.style.overflow = '';
    hamBtn.classList.remove('ham-open');
    hamBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    hamBtn.focus();
  }

  on(hamBtn, 'click', () => isOpen ? close() : open());
  on(closeBtn, 'click', close);
  on(mask, 'click', close);

  // Close on link tap
  $$('.drawer-link', drawer).forEach(link => {
    on(link, 'click', close);
  });

  // Smooth scroll to enquiry from drawer
  on(drawerEnq, 'click', (e) => {
    e.preventDefault();
    close();
    setTimeout(() => smoothScrollTo('enquiry'), 460);
  });

  // Keyboard: Escape
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });
}

/* ══════════════════════════════════════
   3. HERO PARALLAX (subtle, GPU-only)
══════════════════════════════════════ */
function initHeroParallax() {
  const bg = $('#heroBg');
  if (!bg || window.innerWidth < 768) return; // skip on mobile

  let ticking = false;
  on(window, 'scroll', () => {
    if (ticking) return;
    raf(() => {
      const y = window.scrollY;
      // Very subtle — 0.25x speed
      bg.style.transform = `translateY(${y * 0.25}px)`;
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
}

/* ══════════════════════════════════════
   4. SCROLL REVEAL
══════════════════════════════════════ */
function initReveal() {
  const elements = $$('[data-reveal]');
  if (!elements.length) return;

  // Apply delays
  elements.forEach(el => {
    const delay = el.dataset.delay;
    if (delay) el.style.transitionDelay = `${delay}ms`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════
   5. ANIMATED COUNTERS
══════════════════════════════════════ */
function initCounters() {
  const bar = $('#statsBar');
  if (!bar) return;

  let fired = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1900;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOutCubic(progress) * target);
      el.textContent = value.toLocaleString('en-IN');
      if (progress < 1) raf(update);
    }
    raf(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !fired) {
        fired = true;
        $$('.counter', bar).forEach(animateCounter);
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(bar);
}

/* ══════════════════════════════════════
   6. PROJECT FILTER TABS
══════════════════════════════════════ */
function initProjectFilter() {
  $$('.proj-tab').forEach(tab => {
    on(tab, 'click', function () {
      const cat = this.textContent.trim().toLowerCase();

      $$('.proj-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      $$('.proj-card').forEach(card => {
        const cardCat = card.dataset.cat || '';
        const show = cat === 'all' || cardCat === cat;
        card.style.display = show ? '' : 'none';
        // Re-trigger reveal for filtered items
        if (show) {
          raf(() => card.classList.add('visible'));
        }
      });
    });
  });
}

/* ══════════════════════════════════════
   7. SMOOTH SCROLL UTILITY
══════════════════════════════════════ */
function smoothScrollTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const navH = document.getElementById('navbar')?.offsetHeight || 60;
  const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
  window.scrollTo({ top, behavior: 'smooth' });
}

// Expose globally (used by onclick in HTML)
window.scrollTo_section = smoothScrollTo;

/* ══════════════════════════════════════
   8. MOBILE BOTTOM BAR — ENQUIRY SCROLL
══════════════════════════════════════ */
function initMobileBar() {
  on($('#mobileBarEnq'), 'click', (e) => {
    e.preventDefault();
    smoothScrollTo('enquiry');
  });
}

/* ══════════════════════════════════════
   9. NAV LINKS — SMOOTH SCROLL
══════════════════════════════════════ */
function initSmoothLinks() {
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(id);
    });
  });
}

/* ══════════════════════════════════════
   10. ENQUIRY FORM
══════════════════════════════════════ */
function initForm() {
  const btn     = $('#formSubmit');
  const success = $('#formSuccess');
  if (!btn) return;

  on(btn, 'click', function () {
    const name  = $('#fn')?.value.trim();
    const phone = $('#fp')?.value.trim();

    if (!name) {
      shakeField('#fn');
      $('#fn')?.focus();
      return;
    }
    if (!phone) {
      shakeField('#fp');
      $('#fp')?.focus();
      return;
    }

    // Animate button
    this.disabled = true;
    this.innerHTML = `
      <svg viewBox="0 0 24 24" style="width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.8">
        <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Enquiry Sent — We'll be in touch within 24 hours
    `;
    this.style.cssText = `
      background:var(--ink);color:var(--ivory);border-color:var(--ink);
      width:100%;padding:17px 28px;font-family:'Plus Jakarta Sans',sans-serif;
      font-size:11px;letter-spacing:.2em;text-transform:uppercase;cursor:default;
      display:flex;align-items:center;justify-content:center;gap:10px;
    `;

    if (success) {
      success.style.display = 'block';
      // Scroll success into view
      raf(() => success.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
    }
  });

  // Real-time validation highlight
  $$('.form-group input, .form-group select, .form-group textarea').forEach(field => {
    on(field, 'blur', function () {
      if (this.required && !this.value.trim()) {
        this.style.borderColor = '#c0392b';
      } else {
        this.style.borderColor = '';
      }
    });
    on(field, 'focus', function () {
      this.style.borderColor = '';
    });
  });
}

function shakeField(selector) {
  const el = $(selector);
  if (!el) return;
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.style.borderColor = '#c0392b';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

// Shake keyframe injection
(function injectShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-6px); }
      40%     { transform: translateX(6px); }
      60%     { transform: translateX(-4px); }
      80%     { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════
   11. FOOTER ACCORDION (mobile only)
══════════════════════════════════════ */
function initFooterAccordion() {
  const cols = $$('.footer-col');
  cols.forEach(col => {
    const head = col.querySelector('.footer-col-head');
    if (!head) return;
    on(head, 'click', () => {
      if (window.innerWidth >= 768) return; // desktop: always open
      const isOpen = col.classList.contains('open');
      cols.forEach(c => c.classList.remove('open'));
      if (!isOpen) col.classList.add('open');
    });
  });
}

/* ══════════════════════════════════════
   12. PRICING CARDS → SCROLL TO ENQUIRY
══════════════════════════════════════ */
function initPricingCards() {
  $$('.price-card').forEach(card => {
    on(card, 'click', () => smoothScrollTo('enquiry'));
  });
}

/* ══════════════════════════════════════
   13. MARBLE CARDS → SCROLL TO ENQUIRY
══════════════════════════════════════ */
function initMarbleCards() {
  $$('.marble-card').forEach(card => {
    on(card, 'click', () => smoothScrollTo('enquiry'));
  });
}

/* ══════════════════════════════════════
   14. PROCESS STEP ANIMATION
══════════════════════════════════════ */
function initProcessSteps() {
  $$('.ps-animated').forEach((circle, i) => {
    // Stagger hover: each circle highlights in sequence on parent hover
    const parent = circle.closest('.ps-h-step');
    if (!parent) return;
  });
}

/* ══════════════════════════════════════
   15. FILTER FUNCTION (global for onclick)
══════════════════════════════════════ */
window.filterProjects = function(btn, cat) {
  $$('.proj-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  $$('.proj-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
  });
};

/* ══════════════════════════════════════
   16. SCROLL-TO (global for onclick in HTML)
══════════════════════════════════════ */
window.scrollTo = function(id) {
  if (typeof id === 'string') smoothScrollTo(id);
};

/* ══════════════════════════════════════
   17. IMAGE LAZY LOAD FALLBACK
══════════════════════════════════════ */
function initImages() {
  $$('img[onerror]').forEach(img => {
    if (!img.complete || img.naturalWidth === 0) {
      img.style.background = '#E8DDD0';
    }
  });
}

/* ══════════════════════════════════════
   18. RESIZE HANDLER
══════════════════════════════════════ */
function initResize() {
  let timeout;
  on(window, 'resize', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      // Reset footer on desktop
      if (window.innerWidth >= 768) {
        $$('.footer-col').forEach(col => {
          col.classList.remove('open');
        });
      }
    }, 250);
  });
}

/* ══════════════════════════════════════
   19. TOUCH ENHANCEMENTS
══════════════════════════════════════ */
function initTouch() {
  // Add active state for mobile taps on cards
  $$('.coll-card, .price-card, .proj-card, .marble-card, .why-card').forEach(card => {
    on(card, 'touchstart', () => card.classList.add('touch-active'), { passive: true });
    on(card, 'touchend',   () => setTimeout(() => card.classList.remove('touch-active'), 200), { passive: true });
  });

  // Add tap highlight style
  const style = document.createElement('style');
  style.textContent = `
    .touch-active { opacity: 0.88; transition: opacity 0.1s !important; }
  `;
  document.head.appendChild(style);
}

/* ══════════════════════════════════════
   20. PERFORMANCE: reduce motion
══════════════════════════════════════ */
function initReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  }
}

/* ══════════════════════════════════════
   INIT — DOMContentLoaded
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initReducedMotion();
  initNav();
  initDrawer();
  initReveal();
  initCounters();
  initProjectFilter();
  initSmoothLinks();
  initMobileBar();
  initForm();
  initFooterAccordion();
  initPricingCards();
  initMarbleCards();
  initProcessSteps();
  initImages();
  initResize();
  initTouch();

  // Parallax on desktop only (after fonts load)
  if (window.innerWidth >= 768) {
    document.fonts.ready.then(initHeroParallax);
  }

  console.log(
    '%c Arihant Heritage v4.0 ',
    'background:#B89A5A;color:#18140F;padding:6px 14px;font-weight:600;border-radius:3px;',
    '| Mobile-First · Premium UI'
  );
});

/* ══════════════════════════════════════
   PAGE LOAD — smooth entry
══════════════════════════════════════ */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.45s ease';
  raf(() => {
    raf(() => {
      document.body.style.opacity = '1';
    });
  });
});
