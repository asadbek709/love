const DEFAULT_START_DATE = "2026-09-08";

const heartsLayer = document.getElementById("hearts-layer");
const letterWrap = document.querySelector(".letter-wrap");
const letterBtn = document.getElementById("letterBtn");
const letterHint = document.getElementById("letterHint");
const startDateInput = document.getElementById("startDate");
const setDateBtn = document.getElementById("setDateBtn");
const dateHint = document.getElementById("dateHint");
const musicBtn = document.getElementById("musicBtn");
const musicLabel = document.getElementById("musicLabel");
const musicIcon = document.getElementById("musicIcon");

let startDate = parseDate(DEFAULT_START_DATE);
let musicContext = null;
let musicTimer = null;
let musicPlaying = false;

function parseDate(value) {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(2025, 0, 1);
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
}


function createHeart() {
  if (heartsLayer.children.length > 26) return;
  const heart = document.createElement("span");
  heart.className = "flying-heart";
  heart.textContent = Math.random() > 0.55 ? "♡" : "♥";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${12 + Math.random() * 21}px`;
  heart.style.setProperty("--drift", `${Math.round(Math.random() * 150 - 75)}px`);
  heart.style.animationDuration = `${7 + Math.random() * 8}s`;
  heartsLayer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove(), { once: true });
}
for (let i = 0; i < 12; i++) {
  setTimeout(createHeart, i * 420);
}
setInterval(createHeart, 950);

// Reveal elements on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// Letter opening interaction
letterBtn.addEventListener("click", () => {
  const isOpen = letterWrap.classList.toggle("open");
  letterBtn.textContent = isOpen ? "Maktubni yopish 💗" : "Maktubni ochish 💌";
  letterHint.textContent = isOpen
    ? "Bu maktub faqat sen uchun yozilgan Madinam. ♡"
    : "Kichik konvertni ochib ko‘r...";
  if (isOpen) {
    for (let i = 0; i < 7; i++) setTimeout(createHeart, i * 140);
  }
});

// Time counter
function updateCounter() {
  const now = new Date();
  const elapsed = now.getTime() - startDate.getTime();

  if (elapsed < 0) {
    document.getElementById("days").textContent = "0";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    document.getElementById("seconds").textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(elapsed / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("days").textContent = days.toLocaleString("uz-UZ");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

function showDateHint() {
  const formatted = startDate.toLocaleDateString("uz-UZ", {
    year: "numeric", month: "long", day: "numeric"
  });
  dateHint.textContent = `Hisoblagich ${formatted} sanasidan hisoblayapti.`;
}

startDateInput.value = DEFAULT_START_DATE;
showDateHint();
updateCounter();
setInterval(updateCounter, 1000);

setDateBtn.addEventListener("click", () => {
  if (!startDateInput.value) {
    dateHint.textContent = "Iltimos, avval sanani tanlang.";
    return;
  }
  const selected = parseDate(startDateInput.value);
  if (selected.getTime() > Date.now()) {
    dateHint.textContent = "Kelajakdagi sana tanlandi. Hozircha hisoblagich 0 dan boshlanadi.";
  }
  startDate = selected;
  showDateHint();
  updateCounter();
});

// Gallery lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelectorAll(".gallery-card").forEach((card) => {
  card.addEventListener("click", () => {
    const image = card.dataset.image;
    lightboxImage.src = image;
    lightboxImage.alt = card.querySelector("img").alt;
    lightboxCaption.textContent = card.dataset.caption || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  });
});
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

// Optional soft chime using Web Audio; no audio file required.
// Browsers only allow sound after the visitor presses the button.
function playSoftTone() {
  if (!musicContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      musicLabel.textContent = "Ovoz qo‘llanmaydi";
      return;
    }
    musicContext = new AudioContextClass();
  }
  if (musicContext.state === "suspended") musicContext.resume();

  const notes = [523.25, 659.25, 783.99, 659.25];
  let index = 0;
  musicTimer = setInterval(() => {
    if (!musicPlaying) return;
    const oscillator = musicContext.createOscillator();
    const gain = musicContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = notes[index % notes.length];
    gain.gain.setValueAtTime(0.0001, musicContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, musicContext.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, musicContext.currentTime + 0.55);
    oscillator.connect(gain);
    gain.connect(musicContext.destination);
    oscillator.start();
    oscillator.stop(musicContext.currentTime + 0.58);
    index++;
  }, 650);
}

musicBtn.addEventListener("click", async () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying) {
    try {
      playSoftTone();
      musicBtn.classList.add("active");
      musicLabel.textContent = "Ohang yoqildi";
      musicIcon.textContent = "♫";
    } catch (error) {
      musicPlaying = false;
      musicLabel.textContent = "Ovoz yoqilmadi";
    }
  } else {
    if (musicTimer) clearInterval(musicTimer);
    musicBtn.classList.remove("active");
    musicLabel.textContent = "Ohang";
    musicIcon.textContent = "♫";
  }
});
