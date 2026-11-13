const heroReel = document.querySelector('[data-hero-reel]');

if (heroReel) {
  const frames = Array.from(heroReel.querySelectorAll('[data-hero-frame]'));
  const hero = document.querySelector('.hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverMedia = window.matchMedia('(hover: hover)');

  const IMAGE_HOLD = 300;
  const VIDEO_HOLD = 1200;
  const VIDEO_RATE = 0.35;

  let index = 0;
  let timer = null;
  let running = false;
  let inView = true;

  const kindOf = (frame) => frame.dataset.kind || (frame.querySelector('video') ? 'video' : 'image');
  const videoOf = (frame) => frame.querySelector('video');
  const rateOf = (frame) => {
    const rate = Number(frame.dataset.rate);
    return rate > 0 ? rate : VIDEO_RATE;
  };
  const holdOf = (frame) => {
    const hold = Number(frame.dataset.hold);
    if (hold > 0) return hold;
    return kindOf(frame) === 'video' ? VIDEO_HOLD : IMAGE_HOLD;
  };

  const playFrame = (frameIndex) => {
    const video = videoOf(frames[frameIndex]);
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.playbackRate = rateOf(frames[frameIndex]);
    const played = video.play();
    if (played && played.catch) played.catch(() => {});
  };

  const pauseVideos = () => {
    frames.forEach((frame) => {
      const video = videoOf(frame);
      if (video) video.pause();
    });
  };

  const show = (nextIndex) => {
    const current = frames[index];
    const next = frames[nextIndex];

    if (current && current !== next) {
      current.classList.remove('is-active');
      const currentVideo = videoOf(current);
      if (currentVideo) currentVideo.pause();
    }

    next.classList.add('is-active');
    index = nextIndex;

    const video = videoOf(next);
    if (video) {
      try {
        video.currentTime = 0;
      } catch (error) {}
      playFrame(nextIndex);
    }
  };

  const schedule = () => {
    if (timer) clearTimeout(timer);
    if (!running) return;
    const frame = frames[index];
    if (!frame) return;
    timer = setTimeout(() => {
      show((index + 1) % frames.length);
      schedule();
    }, holdOf(frame));
  };

  const start = () => {
    if (running || !frames.length) return;
    running = true;
    playFrame(index);
    schedule();
  };

  const stop = () => {
    running = false;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const sync = () => {
    if (!frames.length) return;

    if (reduceMotion.matches) {
      stop();
      pauseVideos();
      frames.forEach((frame, frameIndex) => frame.classList.toggle('is-active', frameIndex === 0));
      index = 0;
      return;
    }

    if (document.hidden || !inView) {
      stop();
      pauseVideos();
      return;
    }

    if (frames.length === 1) {
      stop();
      frames[0].classList.add('is-active');
      playFrame(0);
      return;
    }

    start();
  };

  frames.forEach((frame) => {
    const video = videoOf(frame);
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'auto';
    video.playbackRate = rateOf(frame);
    if (video.readyState === 0) {
      video.addEventListener(
        'loadedmetadata',
        () => {
          video.playbackRate = rateOf(frame);
        },
        { once: true }
      );
    }
  });

  frames.forEach((frame, frameIndex) => frame.classList.toggle('is-active', frameIndex === 0));
  index = 0;
  playFrame(0);
  sync();

  document.addEventListener('visibilitychange', sync);

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', sync);
  }

  if ('IntersectionObserver' in window && hero) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
        });
        sync();
      },
      { threshold: 0.05 }
    );

    heroObserver.observe(hero);
  }
}

const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const siteHeader = document.querySelector('.site-header');
const year = document.getElementById('year');

if (year) {
  year.textContent = new Date().getFullYear();
}

const closeMenu = () => {
  document.body.classList.remove('menu-open');
  mainNav?.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Open menu');
};

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', isOpen);
    mainNav.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860 && document.body.classList.contains('menu-open')) {
      closeMenu();
    }
  });
}

if (siteHeader) {
  const updateHeader = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));

if ('IntersectionObserver' in window && revealItems.length) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-in'));
}

const sayhi = document.querySelector('.sayhi');
const restTriggers = Array.from(document.querySelectorAll('#services, #contact, .site-footer'));

if (sayhi && restTriggers.length && 'IntersectionObserver' in window) {
  const resting = new Set();
  const restObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          resting.add(entry.target);
        } else {
          resting.delete(entry.target);
        }
      });

      sayhi.classList.toggle('is-rest', resting.size > 0);
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
  );

  restTriggers.forEach((element) => restObserver.observe(element));
}

const serviceShowcase = document.querySelector('[data-service-showcase]');

if (serviceShowcase) {
  const panels = Array.from(serviceShowcase.querySelectorAll('[data-service-panel]'));
  const tracks = panels.map(panel => panel.querySelector('[data-service-track]'));
  const wheel = serviceShowcase.querySelector('[data-service-wheel]');
  const label = serviceShowcase.querySelector('[data-service-label]');
  const position = serviceShowcase.querySelector('[data-service-position]');
  const status = serviceShowcase.querySelector('[data-service-status]');
  const prevSample = serviceShowcase.querySelector('[data-sample-prev]');
  const nextSample = serviceShowcase.querySelector('[data-sample-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const degreesPerService = 360 / panels.length;
  let selection = 0;
  let activeIndex = 0;
  let drag;

  const spin = steps => wheel.style.setProperty('--wheel-angle', `${steps * degreesPerService}deg`);

  let sampleIndex = 0;

  const sampleCenter = (track, card) => card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;

  const syncSampleButtons = () => {
    const track = tracks[activeIndex];
    const cards = Array.from(track.children);
    sampleIndex = cards.reduce((nearest, card, index) =>
      Math.abs(sampleCenter(track, card) - track.scrollLeft) <
      Math.abs(sampleCenter(track, cards[nearest]) - track.scrollLeft) ? index : nearest, 0);
    cards.forEach((card, index) => card.classList.toggle('is-featured', index === sampleIndex));
    prevSample.disabled = sampleIndex === 0;
    nextSample.disabled = sampleIndex === cards.length - 1;
  };

  const centerInitialSample = () => {
    const track = tracks[activeIndex];
    track.scrollLeft = sampleCenter(track, track.children[1] ?? track.firstElementChild);
    syncSampleButtons();
  };

  const selectService = steps => {
    const previousSelection = selection;
    selection = steps;
    spin(selection);
    const nextIndex = ((selection % panels.length) + panels.length) % panels.length;
    if (nextIndex === activeIndex) return;

    panels[activeIndex].hidden = true;
    activeIndex = nextIndex;
    const panel = panels[activeIndex];
    panel.hidden = false;
    centerInitialSample();

    const name = panel.dataset.serviceName;
    label.textContent = name;
    position.textContent = String(activeIndex + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
    wheel.setAttribute('aria-valuenow', activeIndex + 1);
    wheel.setAttribute('aria-valuetext', name);
    status.textContent = `${name}. ${tracks[activeIndex].children.length} sample projects.`;

    if (!reduceMotion.matches && panel.animate) {
      const direction = Math.sign(selection - previousSelection);
      panel.animate([
        { opacity: 0, transform: `translateX(${direction * 32}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 390, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    }
  };

  const scrollSamples = direction => {
    const track = tracks[activeIndex];
    const card = track.children[sampleIndex + direction];
    if (card) {
      track.scrollTo({ left: sampleCenter(track, card), behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    }
  };

  prevSample.addEventListener('click', () => scrollSamples(-1));
  nextSample.addEventListener('click', () => scrollSamples(1));
  tracks.forEach(track => track.addEventListener('scroll', syncSampleButtons, { passive: true }));
  window.addEventListener('resize', syncSampleButtons);
  centerInitialSample();

  serviceShowcase.querySelector('[data-service-prev]').addEventListener('click', () => selectService(selection - 1));
  serviceShowcase.querySelector('[data-service-next]').addEventListener('click', () => selectService(selection + 1));

  wheel.addEventListener('keydown', event => {
    const directions = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
    const step = directions[event.key];
    if (step === undefined && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    if (event.key === 'Home') selectService(selection - activeIndex);
    else if (event.key === 'End') selectService(selection - activeIndex + panels.length - 1);
    else selectService(selection + step);
  });

  wheel.addEventListener('pointerdown', event => {
    if (drag || !event.isPrimary || event.button !== 0) return;
    const bounds = wheel.getBoundingClientRect();
    drag = { id: event.pointerId, startX: event.clientX, pixelsPerStep: bounds.width / 4, travel: 0 };
    wheel.setPointerCapture(event.pointerId);
    wheel.classList.add('is-spinning');
  });

  wheel.addEventListener('pointermove', event => {
    if (event.pointerId !== drag?.id) return;
    drag.travel = (event.clientX - drag.startX) / drag.pixelsPerStep;
    spin(selection + drag.travel);
  });

  const finishSpin = event => {
    if (event.pointerId !== drag?.id) return;
    const steps = event.type === 'pointerup' ? Math.round(drag.travel) : 0;
    drag = undefined;
    wheel.classList.remove('is-spinning');
    selectService(selection + steps);
  };

  wheel.addEventListener('pointerup', finishSpin);
  wheel.addEventListener('pointercancel', finishSpin);
  wheel.addEventListener('lostpointercapture', finishSpin);
}


document.querySelectorAll('[data-work-carousel]').forEach((workCarousel) => {
  const viewport = workCarousel.querySelector('[data-work-viewport]');
  const track = workCarousel.querySelector('[data-work-track]');
  const prevBtn = workCarousel.querySelector('[data-work-prev]');
  const nextBtn = workCarousel.querySelector('[data-work-next]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hoverMedia = window.matchMedia('(hover: hover)');

  const CLONE = 4;
  const SPEED = 800;
  const AUTOPLAY = 8000;

  const originals = Array.from(track.children);
  const cloneSlide = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    return clone;
  };

  track.prepend(...originals.slice(-CLONE).map(cloneSlide));
  track.append(...originals.slice(0, CLONE).map(cloneSlide));

  const total = originals.length;
  let index = CLONE;
  let offset = 0;
  let timer = null;
  let hovering = false;
  let focusWithin = false;
  let inView = false;
  let animating = false;
  let drag = null;
  let suppressClick = false;
  let resizeTimer;

  const visibleCount = () => {
    if (window.innerWidth >= 992) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const stepSize = () => viewport.clientWidth / visibleCount();

  const setOffset = (value, animate = true) => {
    offset = value;

    if (!animate) {
      track.style.transition = 'none';
    }

    track.style.transform = `translate3d(${offset}px, 0, 0)`;

    if (!animate) {
      requestAnimationFrame(() => {
        track.style.transition = '';
      });
    }
  };

  const goTo = (nextIndex, animate = true) => {
    index = nextIndex;
    setOffset(-index * stepSize(), animate);
  };

  const normalize = () => {
    if (index >= CLONE + total) {
      index -= total;
      setOffset(-index * stepSize(), false);
    } else if (index < CLONE) {
      index += total;
      setOffset(-index * stepSize(), false);
    }
  };

  const next = () => {
    if (animating) return;
    animating = true;
    goTo(index + 1);
    window.setTimeout(() => {
      animating = false;
    }, SPEED);
  };

  const prev = () => {
    if (animating) return;
    animating = true;
    goTo(index - 1);
    window.setTimeout(() => {
      animating = false;
    }, SPEED);
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    stop();

    if (hovering || focusWithin || !inView || reduceMotion.matches) {
      return;
    }

    timer = window.setInterval(next, AUTOPLAY);
  };

  const restart = () => {
    stop();
    start();
  };

  track.addEventListener('transitionend', (event) => {
    if (event.target !== track || event.propertyName !== 'transform') {
      return;
    }
    normalize();
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
      restart();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      restart();
    });
  }

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    stop();
    suppressClick = false;
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      moved: false,
    };
    track.style.transition = 'none';
    workCarousel.classList.add('is-dragging');
  });

  window.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        drag = null;
        workCarousel.classList.remove('is-dragging');
        track.style.transition = '';
        start();
        return;
      }

      if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        drag.moved = true;
      }
    }

    if (drag.moved) {
      offset = drag.startOffset + dx;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }
  });

  const endDrag = (event) => {
    if (!drag || event.pointerId !== drag.id) {
      return;
    }

    const wasMoved = drag.moved;
    drag = null;
    workCarousel.classList.remove('is-dragging');
    track.style.transition = '';

    if (wasMoved) {
      const step = stepSize();
      const target = Math.min(Math.max(Math.round(-offset / step), 0), CLONE + total);
      goTo(target);
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
      }, 400);
    }

    start();
  };

  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  viewport.addEventListener(
    'click',
    (event) => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }
    },
    true
  );

  viewport.addEventListener('dragstart', (event) => {
    event.preventDefault();
  });

  workCarousel.addEventListener('mouseenter', () => {
    if (!hoverMedia.matches) {
      return;
    }
    hovering = true;
    stop();
  });

  workCarousel.addEventListener('mouseleave', () => {
    hovering = false;
    start();
  });

  workCarousel.addEventListener('focusin', () => {
    focusWithin = true;
    stop();
  });

  workCarousel.addEventListener('focusout', (event) => {
    if (!workCarousel.contains(event.relatedTarget)) {
      focusWithin = false;
      start();
    }
  });

  workCarousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
      restart();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
      restart();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      workCarousel.style.setProperty('--work-visible', visibleCount());
      goTo(index, false);
    }, 150);
  });

  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) {
        stop();
      } else {
        start();
      }
    });
  }

  workCarousel.style.setProperty('--work-visible', visibleCount());
  setOffset(-index * stepSize(), false);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
        });

        if (inView) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(workCarousel);
  } else {
    inView = true;
    start();
  }
});

const clientsToggle = document.querySelector('[data-clients-toggle]');

if (clientsToggle) {
  const clients = clientsToggle.closest('.clients');
  clientsToggle.hidden = false;

  clientsToggle.addEventListener('click', () => {
    const paused = clients.classList.toggle('is-paused');
    clientsToggle.textContent = paused ? 'Resume logo slideshow' : 'Pause logo slideshow';
  });
}

const headerEmblem = document.querySelector('.header-brand model-viewer');

if (headerEmblem) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncEmblemMotion = () => {
    if (!headerEmblem.loaded) return;
    if (reducedMotion.matches) {
      headerEmblem.pause();
      headerEmblem.currentTime = 0;
    } else {
      headerEmblem.play();
    }
  };

  headerEmblem.addEventListener('load', () => {
    headerEmblem.classList.add('is-loaded');
    syncEmblemMotion();
  });
  reducedMotion.addEventListener('change', syncEmblemMotion);
}
