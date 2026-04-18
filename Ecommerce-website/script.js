/* ═══════════════════════════════════════════════
   MAISON PS — SCRIPT.JS
   Features: Smooth scroll · Sticky nav · Scroll reveal
   Product tabs · Cart drawer with CRUD · Wishlist
   Search · Toast · Newsletter · Hero parallax
   ═══════════════════════════════════════════════ */
'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Toast ── */
function showToast(msg, duration = 3000) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── 1. Smooth Scroll ── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const hash = link.getAttribute('href');
  if (hash === '#') return;
  const target = document.querySelector(hash);
  if (!target) return;
  e.preventDefault();
  const nb = $('#navbar');
  const offset = nb ? nb.offsetHeight : 0;
  window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset - 16, behavior: 'smooth' });
  const toggle = $('#nav-toggle');
  if (toggle) toggle.checked = false;
});

/* ── 2. Navbar scroll effect ── */
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ── 3. Scroll Reveal ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('[data-reveal]').forEach(el => revealObserver.observe(el));

/* ── 4. Hero image load ── */
const heroImg = $('#heroImg');
if (heroImg) {
  if (heroImg.complete) heroImg.classList.add('loaded');
  else heroImg.addEventListener('load', () => heroImg.classList.add('loaded'));
}

/* ── 5. Search toggle ── */
const searchToggle = $('#searchToggle');
const searchBar = $('#searchBar');
const searchInput = $('#searchInput');
if (searchToggle && searchBar) {
  searchToggle.addEventListener('click', () => {
    const isOpen = searchBar.classList.toggle('open');
    navbar.classList.toggle('search-open', isOpen);
    if (isOpen) setTimeout(() => searchInput.focus(), 320);
  });
}

/* ── 6. Product Tabs ── */
const filterTabs = $$('.filter-tab');
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    $$('.products-grid').forEach(g => g.classList.remove('active'));
    const grid = $('#tab-' + tab.dataset.tab);
    if (grid) {
      grid.classList.add('active');
      $$('[data-reveal]', grid).forEach(el => {
        el.classList.remove('revealed');
        setTimeout(() => revealObserver.observe(el), 50);
      });
    }
  });
});

/* ── 7. Cart ── */
let cart = JSON.parse(localStorage.getItem('maison-cart') || '[]');
function saveCart() { localStorage.setItem('maison-cart', JSON.stringify(cart)); }
function getCartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $$('.cart-count').forEach(el => el.textContent = count);
  const hdr = $('#cartHeaderCount');
  if (hdr) hdr.textContent = `(${count})`;
  const cartItemsEl = $('#cartItems');
  const cartFooter = $('#cartFooter');
  if (!cartItemsEl) return;
  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i><p>Your bag is empty</p><a href="#sellers" id="startShopping">Start Shopping</a></div>`;
    if (cartFooter) cartFooter.style.display = 'none';
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}">
        <div class="cart-item-details">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</p>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}"><i class="fa-solid fa-xmark"></i></button>
      </div>`).join('');
    if (cartFooter) {
      cartFooter.style.display = 'block';
      $('#cartTotal').textContent = `$${getCartTotal().toFixed(2)}`;
    }
  }
}

function addToCart(name, price, img) {
  const id = name.replace(/\s+/g, '-').toLowerCase();
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name, price: parseFloat(price), img, qty: 1 });
  saveCart(); updateCartUI(); openCart();
  showToast(`✓ ${name} added to your bag`);
}

function openCart() {
  $('#cartDrawer').classList.add('open');
  $('#cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

$('#cartToggle').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);

$('#cartItems').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  const rem = e.target.closest('.cart-item-remove');
  if (btn) {
    const item = cart.find(i => i.id === btn.dataset.id);
    if (!item) return;
    if (btn.dataset.action === 'inc') item.qty++;
    else { item.qty--; if (item.qty <= 0) cart = cart.filter(i => i.id !== btn.dataset.id); }
    saveCart(); updateCartUI();
  }
  if (rem) {
    const item = cart.find(i => i.id === rem.dataset.id);
    if (item) showToast(`${item.name} removed from bag`);
    cart = cart.filter(i => i.id !== rem.dataset.id);
    saveCart(); updateCartUI();
  }
});

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart-overlay');
  if (btn) addToCart(btn.dataset.name, btn.dataset.price, btn.dataset.img);
  if (e.target.closest('.btn-checkout')) { showToast('Redirecting to checkout…'); setTimeout(closeCart, 800); }
  if (e.target.id === 'startShopping') closeCart();
});

updateCartUI();

/* ── 8. Wishlist ── */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.wishlist-btn');
  if (!btn) return;
  const active = btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  if (icon) icon.className = active ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  const name = btn.closest('.product-card')?.querySelector('.product-name')?.textContent || 'Item';
  showToast(active ? `♥ ${name} saved to wishlist` : `${name} removed from wishlist`);
});

/* ── 9. Newsletter ── */
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (input && input.value) { showToast("🎉 Welcome! You're subscribed."); input.value = ''; }
}
window.handleNewsletter = handleNewsletter;

/* ── 10. Contact form feedback ── */
const contactForm = document.querySelector('.contact-form');
if (contactForm) contactForm.addEventListener('submit', () => setTimeout(() => showToast("✓ Message sent! We'll be in touch soon."), 1000));

/* ── 11. Active nav on scroll ── */
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      $$('.nav-link').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
$$('section[id]').forEach(s => sectionObserver.observe(s));

/* ── 12. ESC to close ── */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeCart();
  if (searchBar) { searchBar.classList.remove('open'); navbar.classList.remove('search-open'); }
  const toggle = $('#nav-toggle');
  if (toggle) toggle.checked = false;
});

/* ── 13. Mobile menu close on nav link ── */
$$('.nav-links .nav-link').forEach(link => {
  link.addEventListener('click', () => { const t = $('#nav-toggle'); if (t) t.checked = false; });
});

/* ── 14. Hero parallax (desktop only) ── */
if (window.innerWidth > 768) {
  const heroMedia = $('.hero-media');
  window.addEventListener('scroll', () => {
    if (heroMedia) heroMedia.style.transform = `translateY(${window.scrollY * 0.3}px)`;
  }, { passive: true });
}

console.log('%cMAISON PS ✦', 'font-size:20px;font-family:Georgia,serif;color:#b8944a;font-style:italic');
