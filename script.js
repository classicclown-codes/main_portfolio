/* ============================================================
   PORTFOLIO — script.js
   Ogundun MoyinJah M.
   ============================================================ */

'use strict';

/* ============================================================
   UTILITIES
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(pointer: fine)').matches;
const enableCustomCursor = false;

/* ============================================================
   1. CUSTOM CURSOR (desktop only)
   ============================================================ */
if (enableCustomCursor && isDesktop && !prefersReducedMotion) {
  const dot  = $('#cursor .cursor-dot');
  const ring = $('#cursor .cursor-ring');

  if (dot && ring) {
    document.body.classList.add('has-custom-cursor');

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    let rafId;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    });

    // Smooth ring follow via rAF
    const animateRing = () => {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      rafId = requestAnimationFrame(animateRing);
    };
    rafId = requestAnimationFrame(animateRing);

    // Hover state on interactive elements
    const hoverEls = $$('a, button, [tabindex], input, textarea, select, label');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      dot.style.opacity  = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    });
  }
}

/* ============================================================
   2. LOADER — Terminal boot sequence
   ============================================================ */
(function initLoader() {
  const loader     = $('#site-loader');
  const skipBtn    = $('#skip-loader');
  const bootLines  = $('#boot-lines');
  const progressFill = $('#loader-progress');
  const progressPct  = $('#loader-pct');
  const nameReveal   = $('#loader-name');
  const SKIP_KEY     = 'portfolio.skipIntro.v2';

  if (!loader) return;

  const messages = [
    { text: '$ preparing selected work...', cls: 'dim' },
    { text: 'ok: security practice', cls: 'ok' },
    { text: 'ok: product notes', cls: 'ok' },
    { text: 'ok: visual systems', cls: 'ok' },
    { text: '$ opening briefing...', cls: 'hl' },
  ];

  function hideLoader() {
    loader.classList.add('loader-hidden');
    setTimeout(() => {
      loader.remove();
      revealHeroStagger();
    }, 520);
  }

  // Skip if previously dismissed
  if (sessionStorage.getItem(SKIP_KEY) === '1') {
    loader.remove();
    revealHeroStagger();
    return;
  }

  skipBtn && skipBtn.addEventListener('click', () => {
    sessionStorage.setItem(SKIP_KEY, '1');
    hideLoader();
  });

  if (prefersReducedMotion) {
    hideLoader();
    return;
  }

  // Typewrite boot messages
  let lineIndex = 0;
  let progress  = 0;
  const totalLines = messages.length;

  function addLine() {
    if (lineIndex >= totalLines) {
      // Reveal name then hide loader
      if (nameReveal) nameReveal.classList.add('revealed');
      setTimeout(hideLoader, 700);
      return;
    }

    const msg  = messages[lineIndex];
    const span = document.createElement('span');
    span.className = 'boot-line';
    span.innerHTML = `<span class="${msg.cls}">${msg.text}</span>`;
    span.style.animationDelay = '0ms';
    bootLines.appendChild(span);

    lineIndex++;
    progress = Math.round((lineIndex / totalLines) * 100);

    if (progressFill) progressFill.style.width = progress + '%';
    if (progressPct)  progressPct.textContent   = progress + '%';

    const delay = lineIndex === 1 ? 120 : 150 + Math.random() * 70;
    setTimeout(addLine, delay);
  }

  // Start after a brief pause
  setTimeout(addLine, 400);
})();

/* ============================================================
   3. HERO STAGGER REVEAL (called after loader)
   ============================================================ */
function revealHeroStagger() {
  const heroReveals = $$('#hero [data-reveal]');
  if (prefersReducedMotion) {
    heroReveals.forEach(el => el.classList.add('is-revealed'));
    return;
  }
  heroReveals.forEach((el, i) => {
    const delay = parseInt(el.dataset.delay || i, 10);
    setTimeout(() => el.classList.add('is-revealed'), delay * 120 + 60);
  });
}

/* ============================================================
   4. SCROLL REVEAL (IntersectionObserver)
   ============================================================ */
(function initReveal() {
  const reveals = $$('.reveal:not(#hero .reveal)');

  if (prefersReducedMotion) {
    reveals.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10) * 80;
      setTimeout(() => el.classList.add('is-revealed'), delay);
      obs.unobserve(el);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  reveals.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. NAVIGATION
   ============================================================ */
(function initNav() {
  const navbar    = $('#navbar');
  const toggle    = $('.nav-toggle');
  const navMenu   = $('#nav-menu');
  const navLinks  = $$('.nav-link[href^="#"]');
  const sections  = $$('section[id]');

  // Scroll: compact header
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.classList.toggle('nav-scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile toggle
  if (toggle && navMenu) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('show', !expanded);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('show');
      }
    });
  }

  // Smooth scroll + close mobile menu
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = $(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (navMenu) navMenu.classList.remove('show');
    });
  });

  // Active nav link via IntersectionObserver
  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    sections.forEach(s => sectionObserver.observe(s));
  }
})();

/* ============================================================
   6. ANIMATED COUNTERS
   ============================================================ */
(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const duration = target > 100 ? 1800 : 1000;
    const start    = performance.now();

    const tick = now => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  if (prefersReducedMotion) {
    counters.forEach(el => {
      el.textContent = parseInt(el.dataset.count, 10).toLocaleString();
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   7. MAGNETIC BUTTONS
   ============================================================ */
(function initMagnetic() {
  if (!isDesktop || prefersReducedMotion) return;

  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect   = btn.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) * 0.28;
      const dy     = (e.clientY - cy) * 0.28;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ============================================================
   8. MODALS
   ============================================================ */
(function initModals() {
  const modals = $$('.modal');

  function openModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element
    const focusable = modal.querySelector('button, a, input, textarea, [tabindex]');
    setTimeout(() => focusable && focusable.focus(), 50);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Open triggers
  $$('.modal-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = $(`#${btn.dataset.modal}`);
      openModal(modal);
    });
  });

  // Close buttons
  $$('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
  });

  // Backdrop click
  $$('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', () => closeModal(backdrop.closest('.modal')));
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    modals.forEach(m => {
      if (m.getAttribute('aria-hidden') === 'false') closeModal(m);
    });
  });
})();

/* ============================================================
   9. CONTACT FORM
   ============================================================ */
(function initForm() {
  const form       = $('#contact-form');
  if (!form) return;

  const nameInput  = $('#contact-name');
  const emailInput = $('#contact-email');
  const msgInput   = $('#contact-message');
  const nameErr    = $('#name-error');
  const emailErr   = $('#email-error');
  const msgErr     = $('#message-error');
  const successMsg = $('#success-msg');

  const validators = {
    name:    v => v.trim().length >= 2  ? '' : 'Please enter your name (min 2 characters).',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
    message: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
  };

  function validate(input, errEl, key) {
    const msg = validators[key](input.value);
    errEl.textContent = msg;
    input.style.borderColor = msg ? 'var(--red)' : '';
    return !msg;
  }

  // Live validation on blur
  nameInput  && nameInput.addEventListener('blur',  () => validate(nameInput,  nameErr,  'name'));
  emailInput && emailInput.addEventListener('blur', () => validate(emailInput, emailErr, 'email'));
  msgInput   && msgInput.addEventListener('blur',   () => validate(msgInput,   msgErr,   'message'));

  // Clear error on input
  [nameInput, emailInput, msgInput].forEach((inp, i) => {
    if (!inp) return;
    const keys = ['name', 'email', 'message'];
    const errs = [nameErr, emailErr, msgErr];
    inp.addEventListener('input', () => {
      if (errs[i]) errs[i].textContent = '';
      inp.style.borderColor = '';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v1 = validate(nameInput,  nameErr,  'name');
    const v2 = validate(emailInput, emailErr, 'email');
    const v3 = validate(msgInput,   msgErr,   'message');

    if (v1 && v2 && v3) {
      // Simulate send
      const btn = form.querySelector('.submit-btn');
      if (btn) {
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Sending…';
      }

      setTimeout(() => {
        if (successMsg) successMsg.classList.add('show');
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.querySelector('span').textContent = 'Send Note';
        }
        setTimeout(() => successMsg && successMsg.classList.remove('show'), 4000);
      }, 1000);
    }
  });
})();

/* ============================================================
   10. TERMINAL WIDGET
   ============================================================ */
(function initTerminal() {
  const fab      = $('#terminal-fab');
  const widget   = $('#terminal-widget');
  const closeBtn = $('#terminal-close');
  const output   = $('#terminal-output');
  const input    = $('#terminal-input');

  if (!fab || !widget) return;

  let isOpen = false;

  function toggleTerminal(open) {
    isOpen = open;
    fab.setAttribute('aria-expanded', String(open));
    widget.setAttribute('aria-hidden', String(!open));
    widget.classList.toggle('terminal-open', open);
    if (open && input) setTimeout(() => input.focus(), 320);
  }

  fab.addEventListener('click', () => toggleTerminal(!isOpen));
  closeBtn && closeBtn.addEventListener('click', () => toggleTerminal(false));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) toggleTerminal(false);
  });

  // Commands
  const commands = {
    help: () => `Available: <span class="t-hl">about</span> · <span class="t-hl">skills</span> · <span class="t-hl">projects</span> · <span class="t-hl">studio</span> · <span class="t-hl">contact</span> · <span class="t-hl">clear</span> · <span class="t-hl">whoami</span>`,
    whoami: () => `<span class="t-hl">Ogundun MoyinJah M.</span> — frontend builder · Smart Hub Projects founder · visual systems`,
    about:    () => { scrollTo('about');    return `Navigating to <span class="t-hl">About</span>…`; },
    skills:   () => { scrollTo('skills');   return `Navigating to <span class="t-hl">Skills</span>…`; },
    projects: () => { scrollTo('projects'); return `Navigating to <span class="t-hl">Projects</span>…`; },
    startup:  () => { scrollTo('startup');  return `Navigating to <span class="t-hl">Studio</span>…`; },
    studio:   () => { scrollTo('startup');  return `Navigating to <span class="t-hl">Studio</span>…`; },
    contact:  () => { scrollTo('contact');  return `Navigating to <span class="t-hl">Contact</span>…`; },
    clear:    () => { output.innerHTML = ''; return null; },
  };

  function scrollTo(id) {
    const section = document.getElementById(id);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }, 400);
    }
  }

  function addLine(html, cls = '') {
    const div = document.createElement('div');
    div.className = `t-line${cls ? ' ' + cls : ''}`;
    div.innerHTML = html;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const cmd = input.value.trim().toLowerCase();
      if (!cmd) return;

      // Echo command
      addLine(`<span class="t-prompt">visitor@portfolio:~$</span><span class="t-cmd"> ${cmd}</span>`);

      // Execute
      if (commands[cmd]) {
        const result = commands[cmd]();
        if (result !== null) {
          addLine(`<span class="t-response">${result}</span>`);
        }
      } else {
        addLine(`<span class="t-error">command not found: ${cmd}. Type <span class="t-hl">help</span> for available commands.</span>`);
      }

      input.value = '';
    });
  }
})();

/* ============================================================
   11. FOOTER BACK-TO-TOP (smooth)
   ============================================================ */
(function initBackToTop() {
  const backBtn = $('.footer-back');
  if (!backBtn) return;

  backBtn.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();

/* ============================================================
   12. STAGGER DELAY for sibling reveal elements
   ============================================================ */
(function initStaggerGroups() {
  const groups = ['.skills-grid', '.projects-grid', '.startup-metrics', '.about-badges'];
  groups.forEach(selector => {
    const parent = $(selector);
    if (!parent) return;
    $$('.reveal', parent).forEach((el, i) => {
      if (!el.dataset.delay) el.dataset.delay = i;
    });
  });
})();
