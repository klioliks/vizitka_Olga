// Мягкое появление блоков при прокрутке.

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