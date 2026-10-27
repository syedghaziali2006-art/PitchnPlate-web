/**
 * PITChNPLATE — MAIN APPLICATION INTERACTIONS
 * Handles:
 * - Sticky navigation blur on scroll
 * - Active section highlighting
 * - Mobile drawer menu
 * - Booking modal with prefilled sports & WhatsApp dispatch
 * - Real photo gallery category filtering & interactive lightbox
 */

(function () {
  'use strict';

  // --- 1. Sticky Header on Scroll ---
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // --- 2. Active Navigation Highlighting via IntersectionObserver ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
  }

  // --- 3. Mobile Navigation Drawer ---
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    function toggleMobileMenu() {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    }

    mobileToggle.addEventListener('click', toggleMobileMenu);

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- 4. Interactive Booking Modal & WhatsApp API ---
  const bookingModal = document.getElementById('booking-modal');
  const openModalBtns = document.querySelectorAll('.open-booking-trigger, #open-booking-modal-btn, .modal-trigger-mobile');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const bookingForm = document.getElementById('booking-form');
  const sportSelect = document.getElementById('booking-sport');
  const dateInput = document.getElementById('booking-date');

  // Set default date to today or tomorrow
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  function openBookingModal(preferredSport) {
    if (!bookingModal) return;
    if (preferredSport && sportSelect) {
      sportSelect.value = preferredSport;
    }
    bookingModal.classList.add('active');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('active');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sport = btn.getAttribute('data-sport');
      openBookingModal(sport);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });
  }

  // Handle Form Submission -> Dispatch to WhatsApp
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('booking-name').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      const sport = sportSelect.value;
      const date = dateInput.value;
      const slot = document.getElementById('booking-slot').value;
      const notes = document.getElementById('booking-notes').value.trim();

      // Format WhatsApp Message
      let message = `*🏏 PitchnPlate Slot Booking Request*%0A`;
      message += `-----------------------------------%0A`;
      message += `*Name:* ${encodeURIComponent(name)}%0A`;
      message += `*Phone:* ${encodeURIComponent(phone)}%0A`;
      message += `*Activity:* ${encodeURIComponent(sport)}%0A`;
      message += `*Preferred Date:* ${encodeURIComponent(date)}%0A`;
      message += `*Time Slot:* ${encodeURIComponent(slot)}%0A`;
      if (notes) {
        message += `*Notes:* ${encodeURIComponent(notes)}%0A`;
      }
      message += `-----------------------------------%0A`;
      message += `_Sent via PitchnPlate Karachi Website_`;

      const whatsappURL = `https://wa.me/923350666786?text=${message}`;
      window.open(whatsappURL, '_blank');
      closeBookingModal();
    });
  }

  // --- 5. Real Facility Gallery: Filter Tabs & Lightbox ---
  const filterBtns = document.querySelectorAll('.gallery-filter-tabs .filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // Filter Tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox Open
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      const caption = item.getAttribute('data-caption');
      if (lightboxModal && lightboxImg) {
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || '';
        lightboxModal.classList.add('active');
        lightboxModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Lightbox Close
  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lightboxImg) lightboxImg.src = '';
    }
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Keyboard accessibility: ESC closes modal or lightbox
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBookingModal();
      closeLightbox();
    }
  });

  // --- 6. Dynamic Year in Footer ---
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

})();
