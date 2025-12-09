// ==================== Данные товаров ====================
const PRODUCTS = {
  1: {id:1,title:'Необычная кружка «Всегда на связи»',price:1290,desc:'Керамическая кружка с дизайнерским принтом.',img:'assets/mug.jpg'},
  2: {id:2,title:'Флешка-бутылка 128GB',price:899,desc:'Флешка в форме мини-бутылки.',img:'assets/usb.jpg'},
  3: {id:3,title:'Носки «Программисту — не просыпаться»',price:490,desc:'Мягкие носки с принтом ошибок компиляции.',img:'assets/socks.jpg'},
  4: {id:4,title:'Стикеры "Всё контролируется" (набор)',price:250,desc:'Набор наклеек для ноутбука.',img:'assets/stickers.jpg'}
};

// ==================== Работа с корзиной ====================
const CART_KEY = 'coolshop_cart_v1';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = loadCart();
  const count = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  document.querySelectorAll('#cart-count').forEach(el => el.textContent = count || 0);
}

// ==================== Рендер списка товаров ====================
function renderProductsList() {
  const root = document.getElementById('products-list');
  if (!root) return;

  root.innerHTML = '';
  Object.values(PRODUCTS).forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}" class="product-img">
      <h3 class="product-title">${p.title}</h3>
      <p class="price">${p.price.toLocaleString()} ₸</p>
      <p class="product-desc">${p.desc}</p>
      <div class="product-actions">
        <a class="btn" href="product.html#${p.id}">Подробнее</a>
        <button class="btn ghost" data-add="${p.id}">В корзину</button>
      </div>
    `;
    root.appendChild(card);
  });
}

// ==================== Рендер страницы товара ====================
function renderProductPage() {
  const root = document.getElementById('product-root');
  if (!root) return;

  const id = location.hash.replace('#', '');
  const p = PRODUCTS[id];
  if (!p) {
    root.innerHTML = '<p>Товар не найден. <a href="products.html">Назад в каталог</a></p>';
    return;
  }

  root.innerHTML = `
    <section class="product-page">
      <div class="product-media"><img src="${p.img}" alt="${p.title}"></div>
      <div class="product-info">
        <h2>${p.title}</h2>
        <p class="price">${p.price.toLocaleString()} ₸</p>
        <p>${p.desc}</p>
        <div class="product-actions">
          <button class="btn" data-add="${p.id}">Добавить в корзину</button>
          <a class="btn ghost" href="products.html">К каталогу</a>
        </div>
      </div>
    </section>
  `;
}

// ==================== Рендер страницы корзины ====================
function renderCartPage() {
  const root = document.getElementById('cart-root');
  if (!root) return;

  const cart = loadCart();
  if (Object.keys(cart).length === 0) {
    root.innerHTML = '<p>Корзина пуста. <a href="products.html">В каталог</a></p>';
    return;
  }

  let total = 0;
  let html = `
    <table class="cart-table">
      <tr>
        <th>Товар</th><th>Кол-во</th><th>Цена</th><th></th>
      </tr>
  `;

  for (const [id, qty] of Object.entries(cart)) {
    const p = PRODUCTS[id];
    const lineTotal = p.price * qty;
    total += lineTotal;
    html += `
      <tr>
        <td>${p.title}</td>
        <td>${qty}</td>
        <td>${lineTotal.toLocaleString()} ₸</td>
        <td><button class="btn ghost" data-rem="${id}">Удалить</button></td>
      </tr>
    `;
  }

  html += `
    <tr class="total">
      <td colspan="2">Итого</td>
      <td>${total.toLocaleString()} ₸</td>
      <td></td>
    </tr>
    </table>
    <p><a class="btn" href="#" id="clear-cart">Очистить корзину</a></p>
  `;

  root.innerHTML = html;
}

// ==================== Делегирование кликов ====================
document.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    const id = addBtn.getAttribute('data-add');
    const cart = loadCart();
    cart[id] = (cart[id] || 0) + 1;
    saveCart(cart);
    alert('Товар добавлен в корзину!');
    renderCartPage();
  }

  const remBtn = e.target.closest('[data-rem]');
  if (remBtn) {
    const id = remBtn.getAttribute('data-rem');
    const cart = loadCart();
    delete cart[id];
    saveCart(cart);
    renderCartPage();
  }

  if (e.target.id === 'clear-cart') {
    e.preventDefault();
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCartPage();
  }
});

// ==================== Инициализация ====================
window.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderProductsList();
  renderProductPage();
  renderCartPage();
});

window.addEventListener('hashchange', renderProductPage);
