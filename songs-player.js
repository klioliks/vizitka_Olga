// Встроенный плеер для треков Suno.
// Подгружает аудио по ссылке через публичный сервис OpenSuno.
// Если загрузка не удалась — остаётся кнопка «Открыть на Suno».

const SUNO_TRACK_API = "https://opensuno.vercel.app/track";
const players = [];

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function toSunoQuery(url) {
  const parsed = new URL(url);
  return `${parsed.host}${parsed.pathname}`.replace(/^www\./, "");
}

function pauseOtherPlayers(currentAudio) {
  players.forEach(({ audio }) => {
    if (audio !== currentAudio && !audio.paused) {
      audio.pause();
    }
  });
}

function setToggleState(toggle, isPlaying) {
  toggle.classList.toggle("is-playing", isPlaying);
  toggle.setAttribute("aria-pressed", String(isPlaying));
  toggle.querySelector(".song-player-toggle-icon").textContent = isPlaying ? "❚❚" : "▶";
}

async function loadTrack(playerEl) {
  const sunoUrl = playerEl.dataset.sunoUrl;
  const audio = playerEl.querySelector(".song-player-audio");
  const art = playerEl.querySelector(".song-player-art");
  const status = playerEl.querySelector(".song-player-status");
  const toggle = playerEl.querySelector(".song-player-toggle");
  const seek = playerEl.querySelector(".song-player-seek");
  const currentTimeEl = playerEl.querySelector(".song-player-current");
  const durationEl = playerEl.querySelector(".song-player-duration");

  if (!sunoUrl || !audio) return;

  try {
    const response = await fetch(
      `${SUNO_TRACK_API}?url=${encodeURIComponent(toSunoQuery(sunoUrl))}`
    );

    if (!response.ok) {
      throw new Error("track request failed");
    }

    const payload = await response.json();
    const track = payload?.data;

    if (!track?.mp3_url) {
      throw new Error("mp3 url missing");
    }

    audio.src = track.mp3_url;

    if (track.cover_url && art) {
      art.src = track.cover_url;
      art.alt = track.title ? `Обложка: ${track.title}` : "Обложка трека";
      art.hidden = false;
    }

    status.textContent = "слушать состояние";
    playerEl.classList.add("is-ready");
    seek.disabled = false;
    toggle.disabled = false;
  } catch (error) {
    status.textContent = "Плеер не загрузился — можно открыть трек на Suno.";
    playerEl.classList.add("is-error");
    toggle.disabled = true;
    seek.disabled = true;
  }

  audio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    currentTimeEl.textContent = formatTime(audio.currentTime);

    if (audio.duration) {
      seek.value = String((audio.currentTime / audio.duration) * 100);
    }
  });

  audio.addEventListener("play", () => {
    pauseOtherPlayers(audio);
    setToggleState(toggle, true);
  });

  audio.addEventListener("pause", () => {
    setToggleState(toggle, false);
  });

  audio.addEventListener("ended", () => {
    setToggleState(toggle, false);
    seek.value = "0";
    currentTimeEl.textContent = "0:00";
  });

  toggle.addEventListener("click", async () => {
    if (!audio.src) return;

    if (audio.paused) {
      pauseOtherPlayers(audio);
      try {
        await audio.play();
      } catch (error) {
        status.textContent = "Нажми ещё раз, чтобы начать воспроизведение.";
      }
    } else {
      audio.pause();
    }
  });

  seek.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(seek.value) / 100) * audio.duration;
  });

  players.push({ audio, toggle });
}

document.querySelectorAll(".song-player").forEach((playerEl) => {
  loadTrack(playerEl);
});
