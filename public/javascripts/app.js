(function () {
  if (window.lucide) window.lucide.createIcons();

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('nav-open', isOpen);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) navToggle.click();
    });
  }

  document.querySelectorAll('[data-dismiss-flash]').forEach(button => {
    button.addEventListener('click', () => button.closest('.flash').remove());
  });

  const toast = document.querySelector('#app-toast');
  let toastTimer;
  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const heroSlider = document.querySelector('[data-hero-slider]');
  if (heroSlider) {
    const slides = [...heroSlider.querySelectorAll('[data-hero-slide]')];
    const dots = [...heroSlider.querySelectorAll('[data-hero-dot]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeSlide = 0;
    let timer;

    const showSlide = index => {
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeSlide;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === activeSlide)));
    };

    const stopAutoplay = () => window.clearInterval(timer);
    const startAutoplay = () => {
      stopAutoplay();
      if (!reducedMotion.matches && !document.hidden) {
        timer = window.setInterval(() => showSlide(activeSlide + 1), 6500);
      }
    };

    heroSlider.querySelector('[data-hero-prev]').addEventListener('click', () => { showSlide(activeSlide - 1); startAutoplay(); });
    heroSlider.querySelector('[data-hero-next]').addEventListener('click', () => { showSlide(activeSlide + 1); startAutoplay(); });
    dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.heroDot)); startAutoplay(); }));
    document.addEventListener('visibilitychange', startAutoplay);
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) stopAutoplay(); else startAutoplay(); });
    showSlide(0);
    startAutoplay();
  }

  document.querySelectorAll('[data-save-restaurant]').forEach(button => {
    const key = `savour:saved:${button.dataset.saveRestaurant}`;
    const setSaved = saved => {
      button.setAttribute('aria-pressed', String(saved));
      const label = button.querySelector('span');
      if (label) label.textContent = saved ? 'Saved' : 'Save';
    };
    setSaved(localStorage.getItem(key) === 'true');
    button.addEventListener('click', () => {
      const saved = button.getAttribute('aria-pressed') !== 'true';
      localStorage.setItem(key, String(saved));
      setSaved(saved);
      showToast(saved ? 'Saved to this browser.' : 'Removed from saved places.');
    });
  });

  document.querySelectorAll('[data-visited-restaurant]').forEach(button => {
    const key = `savour:visited:${button.dataset.visitedRestaurant}`;
    const setVisited = visited => {
      button.setAttribute('aria-pressed', String(visited));
      const label = button.querySelector('span');
      if (label) label.textContent = visited ? 'Visited' : 'Mark visited';
    };
    setVisited(localStorage.getItem(key) === 'true');
    button.addEventListener('click', () => {
      const visited = button.getAttribute('aria-pressed') !== 'true';
      localStorage.setItem(key, String(visited));
      setVisited(visited);
      showToast(visited ? 'Added to your local visit history.' : 'Removed from visit history.');
    });
  });

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      const layout = document.querySelector('[data-results-layout]');
      if (!layout) return;
      document.querySelectorAll('[data-view]').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      layout.dataset.activeView = button.dataset.view;
      if (button.dataset.view === 'map' && window.restaurantMap) {
        window.setTimeout(() => window.restaurantMap.resize(), 50);
      }
    });
  });

  document.querySelectorAll('[data-password-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
      button.innerHTML = `<i data-lucide="${reveal ? 'eye-off' : 'eye'}" aria-hidden="true"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  });

  document.querySelectorAll('[data-coming-soon], [data-journal-prompt]').forEach(control => {
    control.addEventListener('click', event => {
      event.preventDefault();
      showToast('This journal feature is next on the roadmap.');
    });
  });

  document.querySelectorAll('[data-validate]').forEach(form => {
    form.addEventListener('submit', event => {
      form.querySelectorAll('.field').forEach(field => field.classList.remove('is-invalid'));
      if (!form.checkValidity()) {
        event.preventDefault();
        form.querySelectorAll(':invalid').forEach(input => input.closest('.field')?.classList.add('is-invalid'));
        form.querySelector(':invalid')?.focus();
      }
    });
  });
})();
