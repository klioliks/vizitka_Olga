// Реакции на песни: эмоджи + общий счётчик для всех посетителей.
// Сервис CountAPI хранит числа бесплатно и без регистрации.
// Твой выбор сохраняется в браузере — повторно нажимать не нужно.

const REACTIONS_NAMESPACE = "mei-digital-world";
const REACTIONS_STORAGE_KEY = "mei-song-reactions-v1";

function readStoredReactions() {
  try {
    return JSON.parse(localStorage.getItem(REACTIONS_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function writeStoredReactions(data) {
  localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(data));
}

function counterKey(songId, reactionId) {
  return `${songId}-${reactionId}`;
}

async function fetchReactionCount(songId, reactionId) {
  const key = counterKey(songId, reactionId);

  try {
    const response = await fetch(
      `https://api.countapi.xyz/get/${REACTIONS_NAMESPACE}/${key}`
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return Number(payload.value) || 0;
  } catch (error) {
    return null;
  }
}

async function increaseReactionCount(songId, reactionId) {
  const key = counterKey(songId, reactionId);

  try {
    const response = await fetch(
      `https://api.countapi.xyz/hit/${REACTIONS_NAMESPACE}/${key}`
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return Number(payload.value) || 0;
  } catch (error) {
    return null;
  }
}

function setActiveReaction(container, reactionId) {
  container.querySelectorAll(".song-reaction").forEach((button) => {
    const isActive = button.dataset.reaction === reactionId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateCount(button, value) {
  const countEl = button.querySelector(".song-reaction-count");
  if (!countEl || value === null) return;
  countEl.textContent = String(value);
}

async function loadReactionCounts(container, songId) {
  const buttons = container.querySelectorAll(".song-reaction");

  await Promise.all(
    Array.from(buttons).map(async (button) => {
      const count = await fetchReactionCount(songId, button.dataset.reaction);
      updateCount(button, count);
    })
  );
}

async function handleReactionClick(container, button) {
  const songId = container.dataset.songId;
  const reactionId = button.dataset.reaction;
  const stored = readStoredReactions();

  if (stored[songId] === reactionId) {
    return;
  }

  const nextCount = await increaseReactionCount(songId, reactionId);
  stored[songId] = reactionId;
  writeStoredReactions(stored);
  setActiveReaction(container, reactionId);
  updateCount(button, nextCount);

  if (nextCount === null) {
    const label = container.querySelector(".song-reactions-label");
    if (label) {
      label.textContent = "Реакция сохранена у тебя в браузере";
    }
  }
}

document.querySelectorAll(".song-reactions").forEach((container) => {
  const songId = container.dataset.songId;
  const stored = readStoredReactions();

  if (stored[songId]) {
    setActiveReaction(container, stored[songId]);
  }

  loadReactionCounts(container, songId);

  container.querySelectorAll(".song-reaction").forEach((button) => {
    button.addEventListener("click", () => {
      handleReactionClick(container, button);
    });
  });
});
