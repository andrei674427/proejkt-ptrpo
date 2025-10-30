
```js
// data
const PRODUCTS = {
  1: {id:1,title:'Необычная кружка «Всегда на связи»',price:1290,desc:'Керамическая кружка с дизайнерским принтом.',img:'assets/mug.jpg'},
  2: {id:2,title:'Флешка-бутылка 128GB',price:899,desc:'Флешка в форме мини-бутылки.',img:'assets/usb.jpg'},
  3: {id:3,title:'Носки «Программисту — не просыпаться»',price:490,desc:'Мягкие носки с принтом ошибок компиляции.',img:'assets/socks.jpg'},
  4: {id:4,title:'Стикеры "Всё контролируется" (набор)',price:250,desc:'Набор наклеек для ноутбука.',img:'assets/stickers.jpg'}
};

// simple cart in localStorage
const CART_KEY = 'coolshop_cart_v1';
function loadCart(){
  return JSON.parse(localStorage.getItem(CART_KEY) || '{}');
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const cart = loadCart();
  const count = Object.values(cart).reduce((s,n)=>s+n,0);
  document.querySelectorAll('#cart-count').forEach(el=>el.textContent = count);
}

// products list
function renderProductsList(){
  const root = document.getElementById('products-list');
  if(!root) return;
  root.innerHTML = '';
  Object.values(PRODUCTS).forEach(p=>{
    const card = document.createElement('article'); card.className='card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="price">${p.price.toLocaleString()} ₸</p>
      <p>${p.desc}</p>
      <p>
        <a class="btn" href="product.html#${p.id}">Подробнее</a>
        <button class="btn ghost" data-add="${p.id}">В корзину</button>
      </p>
    `;
    root.appendChild(card);
  });
}

// product page
function renderProductPage(){
  const root = document.getElementById('product-root');
  if(!root) return;
  const id = location.hash.replace('#','');
  const p = PRODUCTS[id];
  if(!p){ root.innerHTML = '<p>Товар не найден. <a href="products.html">Назад в каталог</a></p>'; return; }
  root.innerHTML = `
    <section class="product-page">
      <div class="product-media"><img src="${p.img}" alt="${p.title}"></div>
      <div class="product-info">
        <h2>${p.title}</h2>
        <p class="price">${p.price.toLocaleString()} ₸</p>
        <p>${p.desc}</p>
        <p>
          <button class="btn" data-add="${p.id}">Добавить в корзину</button>
          <a class="btn ghost" href="products.html">К каталогу</a>
        </p>
      </div>
    </section>
  `;
}

// cart page
function renderCartPage(){
  const root = document.getElementById('cart-root');
  if(!root) return;
  const cart = loadCart();
  if(Object.keys(cart).length===0){ root.innerHTML = '<p>Корзина пуста. <a href="products.html">В каталог</a></p>'; return; }
  let html = '<table class="cart-table"><tr><th>Товар</th><th>Кол-во</th><th>Цена</th><th></th></tr>';
  let total = 0;
  for(const [id,qty] of Object.entries(cart)){
    const p = PRODUCTS[id];
    const line = p.price * qty; total += line;
    html += `<tr><td>${p.title}</td><td>${qty}</td><td>${line.toLocaleString()} ₸</td><td><button data-rem="${id}">Удалить</button></td></tr>`;
  }
  html += `<tr class="total"><td colspan="2">Итого</td><td>${total.toLocaleString()} ₸</td><td></td></tr></table>`;
  html += '<p><a class="btn" href="#" id="clear-cart">Очистить корзину</a></p>';
  root.innerHTML = html;
}

// delegates
document.addEventListener('click', e=>{
  const add = e.target.closest('[data-add]');
  if(add){
    const id = add.getAttribute('data-add');
    const cart = loadCart(); cart[id] = (cart[id]||0)+1; saveCart(cart);
    alert('Добавлено в корзину');
    renderCartPage();
  }
  const rem = e.target.closest('[data-rem]');
  if(rem){
    const id = rem.getAttribute('data-rem');
    const cart = loadCart(); delete cart[id]; saveCart(cart); renderCartPage();
  }
  if(e.target.id==='clear-cart'){
    e.preventDefault(); localStorage.removeItem(CART_KEY); updateCartCount(); renderCartPage();
  }
});

// init
window.addEventListener('DOMContentLoaded', ()=>{
  updateCartCount(); renderProductsList(); renderProductPage(); renderCartPage();
});

// also update product view on hash change
window.addEventListener('hashchange', renderProductPage);
```
