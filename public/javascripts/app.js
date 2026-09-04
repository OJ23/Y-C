(function () {
  if (window.lucide) window.lucide.createIcons();

  document.querySelectorAll('.flash').forEach(flash => {
    let removalTimer;
    const dismiss = () => {
      if (!flash.isConnected || flash.classList.contains('is-hiding')) return;
      window.clearTimeout(removalTimer);
      flash.classList.add('is-hiding');
      window.setTimeout(() => flash.remove(), 220);
    };

    flash.querySelector('[data-dismiss-flash]')?.addEventListener('click', dismiss);
    removalTimer = window.setTimeout(dismiss, 5000);
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

  document.querySelectorAll('[data-visited-form]').forEach(form => {
    const button = form.querySelector('[data-visited-restaurant]');
    if (!button) return;
    const setVisited = visited => {
      button.setAttribute('aria-pressed', String(visited));
      const label = button.querySelector('span');
      if (label) label.textContent = visited ? 'Visited' : 'Mark visited';
    };
    form.addEventListener('submit', async event => {
      event.preventDefault();
      button.disabled = true;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form))
        });
        if (!response.ok) throw new Error('Visit update failed');
        const { visited } = await response.json();
        setVisited(visited);
        showToast(visited ? 'Added to your visits.' : 'Removed from your visits.');
      } catch (error) {
        showToast('Could not update your visits. Please try again.');
      } finally {
        button.disabled = false;
      }
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

  document.querySelectorAll('[data-search-suggest]').forEach(form => {
    const input = form.querySelector('input[type="search"]');
    const suggestions = form.querySelector('[data-search-suggestions]');
    if (!input || !suggestions) return;

    let timer;
    let request;
    let activeIndex = -1;

    const closeSuggestions = () => {
      suggestions.hidden = true;
      suggestions.replaceChildren();
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    };

    const selectSuggestion = item => {
      input.value = item.value;
      closeSuggestions();
      form.requestSubmit();
    };

    const showSuggestions = items => {
      suggestions.replaceChildren();
      activeIndex = -1;
      items.forEach(item => {
        const button = document.createElement('button');
        const label = document.createElement('strong');
        const detail = document.createElement('span');
        button.type = 'button';
        button.className = 'search-suggestion';
        button.setAttribute('role', 'option');
        label.textContent = item.label;
        detail.textContent = item.detail;
        button.append(label, detail);
        button.addEventListener('click', () => selectSuggestion(item));
        suggestions.append(button);
      });
      suggestions.hidden = items.length === 0;
      input.setAttribute('aria-expanded', String(items.length > 0));
    };

    input.addEventListener('input', () => {
      window.clearTimeout(timer);
      if (request) request.abort();
      const query = input.value.trim();
      if (query.length < 2) return closeSuggestions();
      timer = window.setTimeout(async () => {
        request = new AbortController();
        try {
          const response = await fetch(`${form.dataset.searchSuggest}?q=${encodeURIComponent(query)}`, { signal: request.signal });
          if (!response.ok) throw new Error('Suggestion request failed');
          showSuggestions(await response.json());
        } catch (error) {
          if (error.name !== 'AbortError') closeSuggestions();
        }
      }, 180);
    });

    input.addEventListener('keydown', event => {
      const options = [...suggestions.querySelectorAll('.search-suggestion')];
      if (!options.length || suggestions.hidden) return;
      if (event.key === 'Escape') return closeSuggestions();
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = event.key === 'ArrowDown'
          ? (activeIndex + 1) % options.length
          : (activeIndex - 1 + options.length) % options.length;
        options.forEach((option, index) => option.classList.toggle('is-active', index === activeIndex));
        options[activeIndex].scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        options[activeIndex].click();
      }
    });

    input.addEventListener('blur', () => window.setTimeout(closeSuggestions, 150));
  });

  const recipeCategoryTabs = [...document.querySelectorAll('[data-recipe-category]')];
  const recipeGroups = [...document.querySelectorAll('[data-recipe-group]')];
  const recipeCategoryEmpty = document.querySelector('[data-recipe-category-empty]');
  recipeCategoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.recipeCategory;
      let visibleGroups = 0;
      recipeCategoryTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      recipeGroups.forEach(group => {
        const visible = category === 'All' || group.dataset.recipeGroup === category;
        group.hidden = !visible;
        if (visible) visibleGroups += 1;
      });
      if (recipeCategoryEmpty) recipeCategoryEmpty.hidden = visibleGroups !== 0;
    });
  });

  const savedTabs = [...document.querySelectorAll('[data-saved-tab]')];
  const savedPanels = [...document.querySelectorAll('[data-saved-panel]')];
  savedTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      savedTabs.forEach(item => item.setAttribute('aria-selected', String(item === tab)));
      savedPanels.forEach(panel => { panel.hidden = panel.dataset.savedPanel !== tab.dataset.savedTab; });
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
