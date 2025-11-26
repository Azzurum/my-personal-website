  /* ============================================================
    0. UTILITY FUNCTIONS
    ------------------------------------------------------------
    Helper functions used throughout the script:
    - qs  : querySelector shortcut
    - qsa : querySelectorAll shortcut (returns array)
    - clamp: restricts a numeric value between min/max
    - prefersReducedMotion: checks user accessibility preference
  ============================================================ */
  function qs(selector, parent = document) {
    return parent.querySelector(selector);
  }
  function qsa(selector, parent = document) {
    return Array.from((parent || document).querySelectorAll(selector));
  }
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ============================================================
    1. PRELOADER + HERO ENTRY ANIMATION
    ------------------------------------------------------------
    Removes the preloader once the page finishes loading, then
    triggers the hero section's staggered fade-in animation.
    Adds a floating effect after animations finish (if allowed).
  ============================================================ */
  window.addEventListener('load', () => {
    const preloader = qs('#preloader');
    if (preloader) {
      preloader.classList.add('hide');
      setTimeout(() => preloader.remove(), 600);
    }

    // Kick off the hero text + image stagger animation
    const heroTitle = qs('.hero-title');
    const heroSub   = qs('.hero-sub');
    const heroActs  = qs('.hero-actions');
    const heroQuote = qs('.hero-quote');
    const heroPortrait = qs('.hero-portrait');
    const heroCopy = qs('.hero-copy');

    requestAnimationFrame(() => {
      heroTitle?.classList.add('anim-in');
      heroSub?.classList.add('anim-in');
      heroActs?.classList.add('anim-in');
      heroQuote?.classList.add('anim-in');
      heroPortrait?.classList.add('anim-in');

      // Add mild floating animation after entry animation completes
      setTimeout(() => {
        if (!prefersReducedMotion()) {
          heroPortrait?.classList.add('floating');
          heroCopy?.classList.add('floating');
        }
      }, 600);
    });
  });

  /* ============================================================
    2. MOBILE NAVIGATION TOGGLE
    ------------------------------------------------------------
    Handles opening/closing the navigation menu on mobile.
    Automatically closes the menu when a link is clicked.
  ============================================================ */
  const navToggle = qs('.nav-toggle');
  const navList = qs('.nav-list');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('show');
    });

    // Close menu when selecting a nav link
    qsa('.nav-list a').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('show');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ============================================================
    3. SCROLL REVEAL (IntersectionObserver)
    ------------------------------------------------------------
    Adds an `.active` class to elements with `.reveal` when they
    enter the viewport, triggering fade/slide animations.
  ============================================================ */
  const revealItems = qsa('.reveal');
  if (revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        });
      },
      { threshold: 0.2 }
    );

    revealItems.forEach(item => revealObserver.observe(item));
  }

  /* ============================================================
    4. 3D TILT EFFECT ON PROJECT CARDS
    ------------------------------------------------------------
    Applies a light rotation effect based on cursor position to
    create a depth-driven hover interaction.
  ============================================================ */
  const tiltCards = qsa('.tilt-3d');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = clamp(-y / 20, -10, 10);
      const tiltY = clamp(x / 20, -10, 10);

      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  /* ============================================================
    5. PROJECTS HORIZONTAL TRACK
    ------------------------------------------------------------
    Enables horizontal scrolling for the project carousel using
    left/right buttons and keyboard arrow keys.
  ============================================================ */
  const projectsTrack = qs('#projectsTrack');
  const prevBtn = qs('.track-nav.prev');
  const nextBtn = qs('.track-nav.next');

  if (projectsTrack) {
    const scrollAmount = 350; // px per button click

    prevBtn?.addEventListener('click', () => {
      projectsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn?.addEventListener('click', () => {
      projectsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Keyboard support when track is focused
    projectsTrack.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        projectsTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        projectsTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });
  }

/* ============================================================
   6. PROJECT MODAL (LIGHTBOX)
   ------------------------------------------------------------
   Opens a modal displaying the selected project’s title,
   image, and description. Supports:
   - click
   - Enter key
   - Escape to close
   - clicking outside the modal to close
============================================================ */
  const modal = qs('#project-modal');
  const modalClose = qs('.modal-close', modal);
  const modalTitle = qs('#modal-title');
  const modalImage = qs('#modal-image');
  const modalDesc = qs('#modal-desc');

  const projectCards = qsa('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = qs('.project-title', card)?.textContent || 'Project';
      const caption = qs('.project-caption', card)?.textContent || '';
      const img = qs('img', card);

      modalTitle.textContent = title;
      modalDesc.textContent = caption;

      if (img) {
        modalImage.src = img.src;
        modalImage.alt = img.alt || title;
      }

      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });

    // Accessibility: open modal with Enter
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') card.click();
    });
  });

  // Close modal
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  modalClose?.addEventListener('click', closeModal);

  modal?.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  /* ============================================================
    7. AMBIENT BACKGROUND GLOW
    ------------------------------------------------------------
    Tracks pointer position and updates CSS variables used to
    create light-follow effects on background layers.
  ============================================================ */
  document.addEventListener('pointermove', e => {
    // update CSS vars for other layers (if any)
    document.body.style.setProperty('--pointer-x', `${e.clientX}px`);
    document.body.style.setProperty('--pointer-y', `${e.clientY}px`);
  });

  /* ============================================================
    8. KONAMI CODE EASTER EGG
    ------------------------------------------------------------
    Unlocks a hidden “secret chapter” when the user inputs the
    classic Konami sequence. Includes a confetti animation.
  ============================================================ */
  const easterEgg = qs('#easter-egg');
  const eggClose = qs('.egg-close');
  const KONAMI = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let buffer = [];

  window.addEventListener('keydown', e => {
    buffer.push(e.key);
    if (buffer.length > KONAMI.length) {
      buffer.shift();
    }

    if (JSON.stringify(buffer).toLowerCase() === JSON.stringify(KONAMI).toLowerCase()) {
      showSecretChapter();
      buffer = [];
    }
  });

  function showSecretChapter() {
    if (!easterEgg) return;

    easterEgg.classList.add('show');
    easterEgg.hidden = false;
    easterEgg.setAttribute('aria-hidden', 'false');

    fireConfetti();
  }

  /* ----- CONFETTI FUNCTION ----- */
  function fireConfetti() {
    const count = 80;
    const colors = ['#C8A978', '#FFD98F', '#FF6B6B', '#6BCB77', '#4D96FF'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.animationDuration = 1 + Math.random() * 2 + 's';
      confetti.style.width = 6 + Math.random() * 6 + 'px';
      confetti.style.height = 6 + Math.random() * 12 + 'px';

      const inner = document.createElement('div');
      inner.classList.add('confetti-inner');
      inner.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      confetti.appendChild(inner);
      document.body.appendChild(confetti);

      confetti.addEventListener('animationend', () => confetti.remove());
    }
  }

  eggClose?.addEventListener('click', () => {
    easterEgg.classList.remove('show');
    easterEgg.hidden = true;
    easterEgg.setAttribute('aria-hidden', 'true');
  });

  /* ============================================================
    9. LOGO NAME CLICK (SMALL EASTER EGG)
    ------------------------------------------------------------
    Shows a small inspirational alert when clicking the site logo.
  ============================================================ */
  const nameClick = qs('.logo-text#logoText');
  if (nameClick) {
    nameClick.addEventListener('click', () => {
      alert('“Keep writing your story, one page at a time.”');
    });
  }

  /* ============================================================
    10. CONTACT FORM VALIDATION
    ------------------------------------------------------------
    Blocks submission if required fields are empty.
    Shows simple feedback alert and resets the form.
  ============================================================ */
  const contactForm = qs('#contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();

      const name = qs('#name', contactForm)?.value.trim();
      const email = qs('#email', contactForm)?.value.trim();
      const message = qs('#message', contactForm)?.value.trim();

      if (!name || !email || !message) {
        alert("Please fill out all fields before sending!");
        return;
      }

      alert(`Thank you ${name}! Your message was received successfully.`);
      contactForm.reset();
    });
  }

  /* ============================================================
    11. SMOOTH SCROLL FOR INTERNAL LINKS
  ============================================================ */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ============================================================
    12. INK-DUST CURSOR TRAIL
    ------------------------------------------------------------
    A GSAP-powered custom cursor that creates multiple trailing
    dots following the pointer. Includes idle “orbiting” behavior.
  ============================================================ */
  const cursor = document.getElementById("cursor");
  const amount = 20;
  const sineDots = Math.floor(amount * 0.3);
  const width = 17;
  const idleTimeout = 150;

  let lastFrame = 0;
  let mousePosition = {x: 0, y: 0};
  let dots = [];
  let timeoutID;
  let idle = false;

  // Dot class representing each cursor particle
  class Dot {
      constructor(index = 0) {
          this.index = index;
          this.anglespeed = 0.05;
          this.x = 0;
          this.y = 0;
          this.scale = 1 - 0.05 * index;
          this.range = width / 2 - width / 2 * this.scale + 2;
          this.limit = width * 0.75 * this.scale;
          this.element = document.createElement("span");
          TweenMax.set(this.element, {scale: this.scale});
          cursor.appendChild(this.element);
      }

      lock() {
          this.lockX = this.x;
          this.lockY = this.y;
          this.angleX = Math.PI * 2 * Math.random();
          this.angleY = Math.PI * 2 * Math.random();
      }

      draw(delta) {
          if (!idle || this.index <= sineDots) {
              TweenMax.set(this.element, {x: this.x, y: this.y});
          } else {
              this.angleX += this.anglespeed;
              this.angleY += this.anglespeed;
              this.y = this.lockY + Math.sin(this.angleY) * this.range;
              this.x = this.lockX + Math.sin(this.angleX) * this.range;
              TweenMax.set(this.element, {x: this.x, y: this.y});
          }
      }
  }

  // Build dot instances
  function buildDots() {
      for (let i = 0; i < amount; i++) {
          let dot = new Dot(i);
          dots.push(dot);
      }
  }

  // Track mouse movement
  const onMouseMove = event => {
      mousePosition.x = event.clientX - width / 2;
      mousePosition.y = event.clientY - width / 2;
      resetIdleTimer();
  };

  // Idle state management
  function startIdleTimer() {
      timeoutID = setTimeout(goInactive, idleTimeout);
      idle = false;
  }

  function resetIdleTimer() {
      clearTimeout(timeoutID);
      startIdleTimer();
  }

  function goInactive() {
      idle = true;
      for (let dot of dots) {
          dot.lock();
      }
  }

  // Render loop
  const render = timestamp => {
      const delta = timestamp - lastFrame;
      positionCursor(delta);
      lastFrame = timestamp;
      requestAnimationFrame(render);
  };

  const positionCursor = delta => {
      let x = mousePosition.x;
      let y = mousePosition.y;

      dots.forEach((dot, index, dots) => {
          let nextDot = dots[index + 1] || dots[0];
          dot.x = x;
          dot.y = y;
          dot.draw(delta);

          if (!idle || index <= sineDots) {
              const dx = (nextDot.x - dot.x) * 0.35;
              const dy = (nextDot.y - dot.y) * 0.35;
              x += dx;
              y += dy;
          }
      });
  };

  // Initialize custom cursor
  function init() {
      window.addEventListener("mousemove", onMouseMove);
      lastFrame += new Date();
      buildDots();
      render();
  }

  init();

  /* ============================================================
    13. HERO FLOATING + POINTER PARALLAX
    ------------------------------------------------------------
    Subtle parallax motion applied to the hero portrait and text,
    reacting to pointer position. Disabled for reduced-motion
    users. Uses lerp for smooth transitions.
  ============================================================ */
  (function heroFloatParallax() {
    if (prefersReducedMotion()) return;

    const heroPortrait = qs('.hero-portrait');
    const heroCopy = qs('.hero-copy');
    if (!heroPortrait && !heroCopy) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('pointermove', (e) => {
      // map pointer to small range based on viewport center
      const cx = innerWidth / 2;
      const cy = innerHeight / 2;
      const dx = (e.clientX - cx) / cx; // -1 to 1
      const dy = (e.clientY - cy) / cy; // -1 to 1

      // scale down for subtlety
      targetX = clamp(dx * 10, -10, 10); // translate px
      targetY = clamp(dy * 8, -8, 8);
    });

    function applyTransforms() {
      // lerp current towards target for smoothing
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      // heroCopy moves a tiny amount in opposite direction (depth)
      if (heroCopy) {
        heroCopy.style.transform = `translate3d(${currentX * -0.4}px, ${currentY * -0.6}px, 0)`;
      }

      // heroPortrait moves slightly with more depth
      if (heroPortrait) {
        heroPortrait.style.transform = `translate3d(${currentX * 0.6}px, ${currentY * 0.9}px, 0)`;
      }

      requestAnimationFrame(applyTransforms);
    }

    // Kick off the transform loop
    requestAnimationFrame(applyTransforms);

     // Maintain accessibility: highlight elements on keyboard focus
    [heroPortrait, heroCopy].forEach(el => {
      if (!el) return;
      el.addEventListener('focusin', () => {
        el.classList.add('floating-focus');
      });
      el.addEventListener('focusout', () => {
        el.classList.remove('floating-focus');
      });
    });
  })();