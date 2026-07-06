const CART_KEY = 'hooso_cart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  cart.push(item);
  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
}

function updateQty(index, delta) {
  const cart = getCart();
  cart[index].qty = Math.max(1, (cart[index].qty || 1) + delta);
  saveCart(cart);
  renderCartPage();
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function formatPrice(n) {
  return 'NT$' + n.toLocaleString('zh-TW');
}

const VARIANT_LABELS = {
  basic: '純開瓶器',
  logo: '開瓶器 + LOGO',
  nfc: '開瓶器 + NFC',
  logo_nfc: '開瓶器 + LOGO + NFC'
};

const COLOR_LABELS = { black: '黑', white: '白', pink: '粉', silver: '銀' };

function renderCartPage() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const summaryBox = document.getElementById('cart-summary-box');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (summaryBox) summaryBox.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (summaryBox) summaryBox.style.display = 'block';

  container.innerHTML = cart.map((item, i) => {
    const variantLabel = VARIANT_LABELS[item.variant] || item.variant;
    let colorLabel = '';
    if (item.colorMode === 'solid') {
      colorLabel = COLOR_LABELS[item.color] || item.color;
    } else if (item.colorMode === 'two-tone') {
      colorLabel = `本體${COLOR_LABELS[item.bodyColor] || ''} / 字體${COLOR_LABELS[item.textColor] || ''}`;
    }
    return `
    <div class="cart-item">
      <div class="cart-item-image"><i class="ti ti-bottle" aria-hidden="true"></i></div>
      <div>
        <div class="cart-item-name">hoo'so 開瓶器吊飾 — ${variantLabel}</div>
        <div class="cart-item-meta">${colorLabel}${item.nfcUrl ? ' · NFC已設定' : ''}${item.logoUploaded ? ' · LOGO已上傳' : ''}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
          <div class="qty-control">
            <button onclick="updateQty(${i}, -1)" aria-label="減少數量">−</button>
            <span>${item.qty || 1}</span>
            <button onclick="updateQty(${i}, 1)" aria-label="增加數量">+</button>
          </div>
          <a class="cart-item-remove" onclick="removeFromCart(${i})">移除</a>
        </div>
      </div>
      <div class="cart-item-price">${formatPrice(item.price * (item.qty || 1))}</div>
    </div>`;
  }).join('');

  const total = getCartTotal();
  const shipping = total >= 1000 ? 0 : 80;
  document.getElementById('summary-subtotal').textContent = formatPrice(total);
  document.getElementById('summary-shipping').textContent = shipping === 0 ? '免運' : formatPrice(shipping);
  document.getElementById('summary-total').textContent = formatPrice(total + shipping);
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
