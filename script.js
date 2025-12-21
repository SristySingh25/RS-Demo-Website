/* script.js
   Plain vanilla JS controller for:
   - responsive nav toggle
   - carousel (autoplay + controls + indicators)
   - modal open/close
   - auto-popup on first load (sessionStorage)
   - contact form enhancement (client-side validation + fetch to Formspree)
*/

document.addEventListener('DOMContentLoaded', function () {
  // year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // NAV TOGGLE
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navList.classList.toggle('show');
    });
  }

  // CAROUSEL
  const slidesContainer = document.getElementById('slides');
  const slides = Array.from(slidesContainer.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const indicators = document.getElementById('indicators');

  let activeIndex = 0;
  const slideCount = slides.length;
  let autoplay = true;
  let timer = null;
  const interval = 4000; // 4s

  // Build indicators
  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.dataset.index = i;
    btn.addEventListener('click', () => goTo(i));
    indicators.appendChild(btn);
  });

  function updateSlides() {
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === activeIndex);
    });
    // update indicators
    Array.from(indicators.children).forEach((b, i) => {
      if (i === activeIndex) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  }

  function goTo(i) {
    activeIndex = (i + slideCount) % slideCount;
    updateSlides();
    restartTimer();
  }

  function next() { goTo(activeIndex + 1); }
  function prev() { goTo(activeIndex - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  function startTimer() {
    if (autoplay) timer = setInterval(next, interval);
  }
  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function restartTimer() { stopTimer(); startTimer(); }

  // Pause on hover/focus
  slidesContainer.addEventListener('mouseenter', stopTimer);
  slidesContainer.addEventListener('mouseleave', startTimer);
  slidesContainer.addEventListener('focusin', stopTimer);
  slidesContainer.addEventListener('focusout', startTimer);

  // initialize
  updateSlides();
  startTimer();

  // MODAL
  const modal = document.getElementById('modal');
  const modalClose = modal.querySelector('.modal-close');

  function openModal(contentHtml) {
    modal.querySelector('.modal-content p').innerHTML = contentHtml || 'Replace this content with project demos, videos or docs.';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus trap minimal
    modalClose.focus();
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const id = el.getAttribute('data-modal');
      openModal(`<strong>${id}</strong> — sample demo content. Replace with real demo video or repo excerpt.`);
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });

  // AUTO-POPUP (once per session)
  if (!sessionStorage.getItem('seenPopup')) {
    // open the modal after a short delay
    setTimeout(() => {
      openModal('<strong>Welcome!</strong> — Explore our recent projects and join the society. This popup appears once per session.');
      sessionStorage.setItem('seenPopup', '1');
    }, 1100);
  }

  // CONTACT FORM: client validation + progressive enhancement for fetch
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    formStatus.textContent = 'Sending...';
    formStatus.style.color = 'var(--muted)';

    const formData = new FormData(contactForm);

    // Basic client validation:
    if (!formData.get('name') || !formData.get('email') || !formData.get('message')) {
      formStatus.textContent = 'Please fill all fields.';
      formStatus.style.color = 'crimson';
      return;
    }

    // Send via fetch to the form action (works with Formspree or any endpoint that accepts form POST)
    const action = contactForm.getAttribute('action');
    fetch(action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    }).then(response => {
      if (response.ok) {
        contactForm.reset();
        formStatus.textContent = 'Thanks! Message sent.';
        formStatus.style.color = 'green';
      } else {
        return response.json().then(data => {
          throw new Error((data && data.error) ? data.error : 'Submission failed');
        });
      }
    }).catch(err => {
      formStatus.textContent = 'There was an error sending your message. Try again later.';
      formStatus.style.color = 'crimson';
      console.warn('Form submission error:', err);
    });
  });

  // small enhancement: keyboard navigation for cards
  document.querySelectorAll('.card[tabindex]').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        // open default modal (demo)
        const modalBtn = card.querySelector('[data-modal]');
        if (modalBtn) modalBtn.click();
      }
    });
  });

});
