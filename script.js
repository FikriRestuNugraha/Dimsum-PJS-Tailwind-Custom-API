'use strict';

const BUSINESS = {
  name: 'Dimsum PJS',
  whatsapp: '6281372110606'
};

const API_URL = '/api/menu';
const products = new Map();
const cart = new Map();

const menuGrid = document.getElementById('menu-grid');
const menuStatus = document.getElementById('menu-status');
const specialGrid = document.getElementById('special-grid');
const specialStatus = document.getElementById('special-status');
const cartFab = document.getElementById('cart-open');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartEmpty = document.getElementById('cart-empty');
const cartForm = document.getElementById('cart-form');
const cartFooter = document.getElementById('cart-footer');
const cartTotal = document.getElementById('cart-total');
const toast = document.getElementById('toast');

let previousFocus = null;
let toastTimer = null;

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value).replace(/\s/g, ' ');
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.add('hidden'), 2400);
}

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.remove('hidden', 'border-red-200', 'bg-red-50', 'text-red-800');
  if (isError) element.classList.add('border-red-200', 'bg-red-50', 'text-red-800');
}

function createRegularCard(product) {
  const card = document.createElement('article');
  card.className = 'overflow-hidden rounded-[1.7rem] border border-maroon/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft';
  card.innerHTML = `
    <div class="overflow-hidden bg-cream-deep">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" class="aspect-[1.22/1] w-full object-cover transition duration-500 hover:scale-[1.03]">
    </div>
    <div class="flex min-h-[205px] flex-col p-5 sm:p-6">
      <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-maroon-card">${escapeHTML(product.category)}</p>
      <h3 class="mt-2 font-serif text-2xl leading-snug text-ink">${escapeHTML(product.name)}</h3>
      <p class="mt-2 flex-1 text-sm leading-6 text-muted">${escapeHTML(product.description)}</p>
      <div class="mt-5 flex items-center justify-between gap-3 border-t border-maroon/10 pt-4">
        <strong class="text-base text-maroon">${formatRupiah(product.price)}</strong>
        <button type="button" data-add="${escapeHTML(product.id)}" class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-maroon text-2xl leading-none text-white transition hover:bg-maroon-hover" aria-label="Tambah ${escapeHTML(product.name)} ke pesanan">+</button>
      </div>
    </div>`;
  return card;
}

function createSpecialCard(product, index) {
  const card = document.createElement('article');
  card.className = 'overflow-hidden rounded-[1.8rem] border border-white/15 bg-white text-ink shadow-soft';
  const number = String(index + 1).padStart(2, '0');
  card.innerHTML = `
    <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" class="aspect-[1.28/1] w-full object-cover">
    <div class="p-6 sm:p-7">
      <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-maroon-card">${number} / SPECIAL MENU · ${escapeHTML(product.category)}</p>
      <h3 class="mt-3 font-serif text-3xl">${escapeHTML(product.name)}</h3>
      <p class="mt-2 text-sm italic text-maroon-card">“${escapeHTML(product.quote || '')}”</p>
      <p class="mt-4 min-h-[72px] text-sm leading-7 text-muted">${escapeHTML(product.description)}</p>
      <div class="mt-5 flex items-end justify-between border-t border-maroon/10 pt-4">
        <div><span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">PRICE</span><strong class="mt-1 block text-lg text-maroon">${formatRupiah(product.price)}</strong></div>
        <div class="text-right"><span class="block text-[10px] font-bold uppercase tracking-[0.16em] text-muted">SERVING</span><strong class="mt-1 block text-sm">${escapeHTML(product.serving || product.unit)}</strong></div>
      </div>
      <button type="button" data-add="${escapeHTML(product.id)}" class="mt-6 w-full rounded-full bg-maroon px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-maroon-hover">ORDER THIS ↗</button>
    </div>`;
  return card;
}

async function loadMenu() {
  menuGrid.replaceChildren();
  specialGrid.replaceChildren();
  setStatus(menuStatus, 'Memuat menu Dimsum PJS dari API...');
  setStatus(specialStatus, 'Memuat menu spesial dari API...');

  try {
    const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Server API merespons ${response.status}`);

    const result = await response.json();
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error('Format data API tidak sesuai.');
    }

    products.clear();
    result.data.forEach((product) => products.set(product.id, product));

    const regularProducts = result.data.filter((product) => product.group === 'regular');
    const specialProducts = result.data.filter((product) => product.group === 'special');

    regularProducts.forEach((product) => menuGrid.append(createRegularCard(product)));
    specialProducts.forEach((product, index) => specialGrid.append(createSpecialCard(product, index)));

    menuStatus.classList.add('hidden');
    specialStatus.classList.add('hidden');

    if (regularProducts.length === 0) setStatus(menuStatus, 'Menu reguler belum tersedia.', true);
    if (specialProducts.length === 0) setStatus(specialStatus, 'Menu spesial belum tersedia.', true);
  } catch (error) {
    console.error('Gagal memuat API menu:', error);
    setStatus(menuStatus, 'Menu belum dapat dimuat. Jalankan `node server.js` di terminal folder proyek, lalu buka http://localhost:3000.', true);
    setStatus(specialStatus, 'Data menu spesial belum dapat dimuat.', true);
  }
}

function totalItems() {
  return [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);
}

function totalPrice() {
  let total = 0;
  for (const [id, quantity] of cart.entries()) {
    const product = products.get(id);
    if (product) total += product.price * quantity;
  }
  return total;
}

function addToCart(id) {
  const product = products.get(id);
  if (!product) {
    showToast('Data menu belum tersedia. Muat ulang halaman.');
    return;
  }
  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`${product.name} ditambahkan ke pesanan`);
}

function changeQuantity(id, difference) {
  const nextQuantity = (cart.get(id) || 0) + difference;
  if (nextQuantity <= 0) cart.delete(id);
  else cart.set(id, nextQuantity);
  renderCart();
}

function createCartRow(id, quantity) {
  const product = products.get(id);
  if (!product) return null;

  const row = document.createElement('article');
  row.className = 'flex items-center gap-4 border-b border-maroon/10 pb-4';
  row.innerHTML = `
    <img src="${escapeHTML(product.image)}" alt="" class="h-20 w-20 rounded-2xl object-cover">
    <div class="min-w-0 flex-1">
      <h3 class="font-serif text-lg leading-snug">${escapeHTML(product.name)}</h3>
      <p class="mt-1 text-xs text-muted">${formatRupiah(product.price)} / ${escapeHTML(product.unit)}</p>
      <div class="mt-3 inline-flex items-center gap-3 rounded-full bg-cream px-2 py-1">
        <button type="button" data-quantity="minus" data-id="${escapeHTML(id)}" class="grid h-7 w-7 place-items-center rounded-full bg-white font-bold text-maroon" aria-label="Kurangi ${escapeHTML(product.name)}">−</button>
        <span class="min-w-4 text-center text-sm font-bold">${quantity}</span>
        <button type="button" data-quantity="plus" data-id="${escapeHTML(id)}" class="grid h-7 w-7 place-items-center rounded-full bg-white font-bold text-maroon" aria-label="Tambah ${escapeHTML(product.name)}">+</button>
      </div>
    </div>
    <strong class="shrink-0 text-sm text-maroon">${formatRupiah(product.price * quantity)}</strong>`;
  return row;
}

function renderCart() {
  const count = totalItems();
  const hasItems = count > 0;
  cartCount.textContent = String(count);
  cartFab.classList.toggle('hidden', !hasItems);
  cartFab.classList.toggle('inline-flex', hasItems);
  cartEmpty.classList.toggle('hidden', hasItems);
  cartForm.classList.toggle('hidden', !hasItems);
  cartFooter.classList.toggle('hidden', !hasItems);
  cartItems.replaceChildren();

  for (const [id, quantity] of cart.entries()) {
    const row = createCartRow(id, quantity);
    if (row) cartItems.append(row);
  }
  cartTotal.textContent = formatRupiah(totalPrice());
}

function openCart() {
  if (cart.size === 0) {
    showToast('Pilih menu terlebih dahulu untuk membuat pesanan.');
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  previousFocus = document.activeElement;
  cartOverlay.classList.remove('hidden');
  cartDrawer.classList.remove('hidden');
  requestAnimationFrame(() => {
    cartDrawer.classList.remove('translate-x-full');
    cartDrawer.classList.add('translate-x-0');
  });
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');
  document.getElementById('cart-close').focus();
}

function closeCart() {
  cartDrawer.classList.remove('translate-x-0');
  cartDrawer.classList.add('translate-x-full');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
  window.setTimeout(() => {
    cartDrawer.classList.add('hidden');
    cartOverlay.classList.add('hidden');
  }, 300);
  if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
}

function checkoutWhatsApp() {
  if (cart.size === 0) return;

  const customerName = document.getElementById('customer-name').value.trim();
  const service = document.querySelector('input[name="service"]:checked')?.value || 'Takeaway';
  const note = document.getElementById('order-note').value.trim();
  const lines = [`Halo ${BUSINESS.name}! Saya ingin memesan:`, ''];
  let itemNumber = 1;

  for (const [id, quantity] of cart.entries()) {
    const product = products.get(id);
    if (!product) continue;
    lines.push(`${itemNumber}. ${product.name} × ${quantity} = ${formatRupiah(product.price * quantity)}`);
    itemNumber += 1;
  }

  lines.push('', `Estimasi total: ${formatRupiah(totalPrice())}`, `Layanan: ${service}`);
  if (customerName) lines.push(`Nama: ${customerName}`);
  if (note) lines.push(`Catatan: ${note}`);
  lines.push('', 'Mohon konfirmasi ketersediaan dan total pembayaran. Terima kasih!');

  const url = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Event delegation menangani tombol pada kartu yang dibuat secara dinamis dari API.
document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  if (addButton) addToCart(addButton.dataset.add);

  const quantityButton = event.target.closest('[data-quantity]');
  if (quantityButton) {
    const difference = quantityButton.dataset.quantity === 'plus' ? 1 : -1;
    changeQuantity(quantityButton.dataset.id, difference);
  }

  const closeButton = event.target.closest('[data-close-cart]');
  if (closeButton) closeCart();

  const scrollButton = event.target.closest('[data-scroll]');
  if (scrollButton) {
    document.querySelector(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
  }
});

cartFab.addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
document.getElementById('checkout-whatsapp').addEventListener('click', checkoutWhatsApp);
document.getElementById('final-whatsapp-order').addEventListener('click', () => {
  if (cart.size > 0) return openCart();
  const greeting = `Halo ${BUSINESS.name}! Saya ingin bertanya mengenai menu dan pemesanan. Mohon informasinya. Terima kasih!`;
  window.open(`https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(greeting)}`, '_blank', 'noopener,noreferrer');
});

const menuToggle = document.getElementById('menu-toggle');
const primaryNav = document.getElementById('primary-nav');
menuToggle.addEventListener('click', () => {
  const willOpen = primaryNav.classList.contains('hidden');
  primaryNav.classList.toggle('hidden', !willOpen);
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? 'Tutup navigasi' : 'Buka navigasi');
});
primaryNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      primaryNav.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Buka navigasi');
    }
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !cartDrawer.classList.contains('hidden')) closeCart();
});

document.getElementById('year').textContent = String(new Date().getFullYear());
renderCart();
loadMenu();
