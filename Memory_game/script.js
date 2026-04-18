/* ═══════════════════════════════════════════
   POKÉMON MEMORY GAME — SCRIPT
   Uses PokeAPI sprites (no local assets needed)
   ═══════════════════════════════════════════ */

// ── Starfield ─────────────────────────────────
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars(n = 180) {
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.twinkle += s.speed;
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  }

  resize();
  initStars();
  drawStars();
  window.addEventListener('resize', () => { resize(); initStars(); });
})();

// ── Pokémon picks (1–151 first gen) ───────────
const POKEMON_IDS = [1, 4, 7, 25, 39, 52, 54, 63, 66, 79, 92, 113];

// ── Build card data from PokeAPI sprites ───────
const cardsArray = POKEMON_IDS.map(id => ({
  name: `pokemon-${id}`,
  img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
  fallback: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
}));

// ── DOM refs ───────────────────────────────────
const gameEl   = document.getElementById('game');
const countEl  = document.querySelector('.count');
const secEl    = document.querySelector('.sec-count');
const minEl    = document.querySelector('.min-count');
const resetBtn = document.getElementById('resetBtn');
const winOverlay   = document.getElementById('winOverlay');
const winTimeEl    = document.querySelector('.win-time');
const winAttemptEl = document.querySelector('.win-attempts');

// ── State ──────────────────────────────────────
let attemptCount  = 0;
let sec           = 0;
let timer         = null;
let timeStarted   = false;
let firstGuess    = '';
let secondGuess   = '';
let previousTarget = null;
let count         = 0;
let matchedPairs  = 0;
const DELAY       = 1100;

// ── Timer ──────────────────────────────────────
function startTimer() {
  if (timer) return;
  timer = setInterval(() => {
    sec++;
    secEl.textContent = String(sec % 60).padStart(2, '0');
    minEl.textContent = String(Math.floor(sec / 60)).padStart(2, '0');
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── Build grid ─────────────────────────────────
function buildGrid() {
  gameEl.innerHTML = '';

  const grid = document.createElement('section');
  grid.classList.add('grid');
  gameEl.appendChild(grid);

  const gameGrid = [...cardsArray, ...cardsArray]
    .sort(() => 0.5 - Math.random());

  gameGrid.forEach((item, index) => {
    const card  = document.createElement('div');
    card.classList.add('card', item.name);
    card.dataset.name = item.name;

    // Staggered entrance
    card.style.opacity   = '0';
    card.style.transform = 'translateY(30px) scale(0.8)';
    card.style.transition = `opacity 0.4s ease ${index * 25}ms, transform 0.4s ease ${index * 25}ms`;

    const front = document.createElement('div');
    front.classList.add('front');

    const back = document.createElement('div');
    back.classList.add('back');

    const img = new Image();
    img.src = item.img;
    img.onerror = () => { back.style.backgroundImage = `url(${item.fallback})`; };
    img.onload  = () => { back.style.backgroundImage = `url(${item.img})`; };
    back.style.backgroundImage = `url(${item.img})`;

    card.appendChild(front);
    card.appendChild(back);
    grid.appendChild(card);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  });

  // Bind click
  grid.addEventListener('click', handleCardClick);
}

// ── Card click logic ───────────────────────────
function handleCardClick(e) {
  if (!timeStarted) {
    startTimer();
    timeStarted = true;
  }

  let clicked = e.target;

  // Must hit a card child element
  const card = clicked.closest('.card');
  if (!card) return;
  if (card === previousTarget) return;
  if (card.classList.contains('selected')) return;
  if (card.classList.contains('match')) return;
  if (count >= 2) return;

  // Attempt counter
  attemptCount++;
  countEl.textContent = attemptCount;
  countEl.classList.remove('count-flash');
  void countEl.offsetWidth; // reflow trick
  countEl.classList.add('count-flash');

  count++;
  card.classList.add('selected');

  if (count === 1) {
    firstGuess    = card.dataset.name;
    previousTarget = card;
  } else {
    secondGuess = card.dataset.name;

    if (firstGuess === secondGuess) {
      // Match!
      setTimeout(() => {
        const matched = document.querySelectorAll(`.${CSS.escape(firstGuess)}`);
        matched.forEach(c => {
          c.classList.add('match');
          c.classList.remove('selected');
          c.addEventListener('click', e => e.stopPropagation(), { once: false });
        });
        matchedPairs++;
        resetGuesses();
        if (matchedPairs === cardsArray.length) {
          setTimeout(showWin, 500);
        }
      }, DELAY);
    } else {
      setTimeout(resetGuesses, DELAY);
    }
  }
}

function resetGuesses() {
  document.querySelectorAll('.selected').forEach(c => c.classList.remove('selected'));
  firstGuess = secondGuess = '';
  count = 0;
  previousTarget = null;
}

// ── Win screen ─────────────────────────────────
function showWin() {
  stopTimer();
  winTimeEl.textContent    = formatTime(sec);
  winAttemptEl.textContent = `${attemptCount}`;
  winOverlay.classList.add('show');
}

// ── Reset ──────────────────────────────────────
function resetGame(confirmed = false) {
  if (!confirmed) {
    const ok = confirm('Reset the game and start over?');
    if (!ok) return;
  }
  stopTimer();
  attemptCount  = 0;
  sec           = 0;
  timeStarted   = false;
  matchedPairs  = 0;
  count         = 0;
  firstGuess    = secondGuess = '';
  previousTarget = null;

  countEl.textContent = '0';
  secEl.textContent   = '00';
  minEl.textContent   = '00';

  winOverlay.classList.remove('show');
  buildGrid();
}

resetBtn.addEventListener('click', () => resetGame(false));
document.getElementById('playAgainBtn').addEventListener('click', () => resetGame(true));

// ── Init ───────────────────────────────────────
buildGrid();
