// Мягкое появление блоков при прокрутке + меню и контакты.

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -40px 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const nav = document.getElementById("site-nav");
const navToggle = document.querySelector(".nav-toggle");

const setNavOpen = (isOpen) => {
  if (!nav || !navToggle) return;
  nav.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
};

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    setNavOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });
}

const telegramLink = document.getElementById("telegram-link");
if (telegramLink) {
  telegramLink.addEventListener("click", (event) => {
    const deepLink = telegramLink.getAttribute("data-tg");
    if (!deepLink) return;

    event.preventDefault();
    const fallback = telegramLink.href;
    window.location.href = deepLink;

    window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.open(fallback, "_blank", "noopener,noreferrer");
      }
    }, 800);
  });
}

const heroVideo = document.querySelector(".avatar-video");
const HERO_VIDEO_LOOP_SECONDS = 3;

if (heroVideo) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  } else {
    const restartLoop = () => {
      if (heroVideo.currentTime >= HERO_VIDEO_LOOP_SECONDS) {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
      }
    };

    heroVideo.addEventListener("timeupdate", restartLoop);
    heroVideo.addEventListener("ended", () => {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
    });

    heroVideo.play().catch(() => {});
  }
}

const pauseSongPlayers = () => {
  document.querySelectorAll(".song-player-audio").forEach((audio) => {
    audio.pause();
  });
};

let activeModal = null;
let modalTrigger = null;

const openModal = (modalId, trigger) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  if (activeModal && activeModal !== modal) {
    closeModal();
  }

  modalTrigger = trigger || document.activeElement;
  activeModal = modal;
  modal.hidden = false;
  document.body.classList.add("modal-open");

  const closeBtn = modal.querySelector(".content-modal-close");
  if (closeBtn) closeBtn.focus();
};

const closeModal = () => {
  if (!activeModal) return;

  if (activeModal.id === "songs-modal") {
    pauseSongPlayers();
  }

  activeModal.hidden = true;
  document.body.classList.remove("modal-open");

  if (modalTrigger && typeof modalTrigger.focus === "function") {
    modalTrigger.focus();
  }

  activeModal = null;
  modalTrigger = null;
};

document.querySelectorAll("[data-open-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    openModal(button.getAttribute("data-open-modal"), button);
  });
});

document.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
