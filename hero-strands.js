import { initStrands } from "./strands.js";

const strandsContainer = document.getElementById("hero-strands");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (strandsContainer && !prefersReducedMotion) {
  initStrands(strandsContainer, {
    colors: ["#f49ab2", "#7d4769", "#65ddcf"],
    count: 3,
    speed: 0.5,
    amplitude: 1,
    waviness: 1,
    thickness: 0.7,
    glow: 2.6,
    taper: 3,
    spread: 1,
    intensity: 0.6,
    saturation: 1.5,
    opacity: 1,
    scale: 1.5,
    glass: false,
    refraction: 1,
    dispersion: 1,
    glassSize: 1,
  });
}
