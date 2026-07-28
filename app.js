// ===== STATE MANAGEMENT =====
let productsData = [];
let currentView = 'grid'; // 'grid' sau 'list'
let currentTab = 'products'; // 'products' sau 'cart'
let selectedCurrency = 'EUR';
let receivedAmount = '';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Încărcăm produsele din localStorage sau din constanta globală
  loadProducts();
  
  // Setăm evenimente
  setupEventListeners();
  
  // Render inițial
  renderProducts();
  renderCart();
  updateCartBadge();
  
  // Verifică actualizări
  checkForUpdates();
  
  // Setup scroll button
  setupScrollButton();
});

// ===== LOAD/SAVE PRODUCTS =====
function loadProducts() {
  const saved = localStorage.getItem('products');
  if (saved) {
    productsData = JSON.parse(saved);
  } else {
    productsData = JSON.parse(JSON.stringify(products));
  }
}

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(productsData));
}

// ===== RENDER PRODUCTS =====
function renderProducts() {
  const container = document.getElementById('products');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  
  const filtered = productsData.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    p.code.includes(searchTerm)
  );
  
  container.innerHTML = '';
  
  if (currentView === 'grid') {
    container.className = 'grid-view';
    filtered.forEach(product => {
      const card = createProductCard(product);
      container.appendChild(card);
    });
  } else {
    container.className = 'list-view';
    filtered.forEach(product => {
      const item = createProductListItem(product);
      container.appendChild(item);
    });
  }
}

function createProductCard(product) {
  const div = document.createElement('div');
  div.className = 'product-card';
  
  // Adaugă un event listener pentru întregul card (inclusiv imagine)
  div.addEventListener('click', (e) => {
    // Verifică dacă s-a făcut click pe un buton (+ sau -)
    if (e.target.closest('.qty-btn')) {
      return; // Dacă s-a făcut click pe buton, nu face nimic
    }
    
    // Adaugă produsul în coș
    product.qty = (product.qty || 0) + 1;
    saveProducts();
    renderAll();
  });
  
  div.innerHTML = `
    <div class="product-image">
      <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2224%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
      ${product.qty > 0 ? `<div class="badge">${product.qty}</div>` : ''}
    </div>
    <div class="product-name">${product.name}</div>
    <div class="product-info">
      <span class="product-code">${product.code}</span>
      <span class="product-price">€${product.priceEUR.toFixed(2)}</span>
    </div>
    <div class="product-actions">
      <button class="qty-btn minus" data-id="${product.id}">−</button>
      <span class="qty-count">${product.qty}</span>
      <button class="qty-btn plus" data-id="${product.id}">+</button>
    </div>
  `;
  
  return div;
}

function createProductListItem(product) {
  const div = document.createElement('div');
  div.className = 'product-list-item';
  
  // Adaugă event listener pentru întregul rând
  div.addEventListener('click', (e) => {
    // Verifică dacă s-a făcut click pe un buton (+ sau -)
    if (e.target.closest('.qty-btn')) {
      return; // Dacă s-a făcut click pe buton, nu face nimic
    }
    
    // Adaugă produsul în coș
    product.qty = (product.qty || 0) + 1;
    saveProducts();
    renderAll();
  });
  
  div.innerHTML = `
    <span class="list-name">${product.name}</span>
    <span class="list-code">${product.code}</span>
    <span class="list-price">€${product.priceEUR.toFixed(2)}</span>
    <div class="list-actions">
      <button class="qty-btn minus" data-id="${product.id}">−</button>
      <span class="qty-count">${product.qty}</span>
      <button class="qty-btn plus" data-id="${product.id}">+</button>
    </div>
  `;
  
  return div;
}

// ===== RENDER CART =====
function renderCart() {
  const container = document.getElementById('cart');
  const cartItems = productsData.filter(p => p.qty > 0);
  
  if (cartItems.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Coșul este gol</p>
      </div>
    `;
    updateTotals();
    return;
  }
  
  let html = `
    <div class="cart-header">
      <span class="cart-col-name">Produse</span>
      <span class="cart-col-code">Cod</span>
      <span class="cart-col-price">Preț</span>
      <span class="cart-col-qty">Cantitate</span>
    </div>
  `;
  
  cartItems.forEach(item => {
    html += `
      <div class="cart-row">
        <span class="cart-col-name">${item.name}</span>
        <span class="cart-col-code">${item.code}</span>
        <span class="cart-col-price">€${item.priceEUR.toFixed(2)}</span>
        <span class="cart-col-qty">
          <button class="qty-btn minus" data-id="${item.id}">−</button>
          <span class="qty-count">${item.qty}</span>
          <button class="qty-btn plus" data-id="${item.id}">+</button>
        </span>
      </div>
    `;
  });
  
  // Total section
  const totals = calculateTotals();
  html += `
    <div class="cart-total">
      <span class="total-label">Total</span>
      <span class="total-eur">€${totals.eur.toFixed(2)}</span>
      <span class="total-mdl">lei ${totals.mdl.toFixed(2)}</span>
      <span class="total-usd">$${totals.usd.toFixed(2)}</span>
      <span class="total-gbp">£${totals.gbp.toFixed(2)}</span>
    </div>
    
    <!-- Rest Calculator -->
    <div class="rest-calculator">
      <div class="rest-row">
        <span class="rest-label">Suma primită în</span>
        <div class="currency-selector">
          <button class="currency-btn ${selectedCurrency === 'EUR' ? 'active' : ''}" data-currency="EUR">€</button>
          <button class="currency-btn ${selectedCurrency === 'MDL' ? 'active' : ''}" data-currency="MDL">Lei</button>
          <button class="currency-btn ${selectedCurrency === 'USD' ? 'active' : ''}" data-currency="USD">$</button>
          <button class="currency-btn ${selectedCurrency === 'GBP' ? 'active' : ''}" data-currency="GBP">£</button>
        </div>
      </div>
      
      <div class="rest-row">
        <span class="rest-label">Suma primită</span>
        <input type="number" id="receivedAmount" class="rest-input" placeholder="0.00" step="0.01" min="0">
      </div>
      
      <div class="rest-row">
        <span class="rest-label">Restul</span>
        <span id="changeAmount" class="rest-value">${selectedCurrency} 0.00</span>
      </div>
    </div>
    
    <button id="clearCartBtn" class="clear-cart-btn">Șterge Coș</button>
  `;
  
  container.innerHTML = html;
  updateTotals();
  attachCartEvents();
}

// ===== CALCULATE TOTALS =====
function calculateTotals() {
  let eur = 0, mdl = 0, usd = 0, gbp = 0;
  
  productsData.forEach(p => {
    if (p.qty > 0) {
      eur += p.priceEUR * p.qty;
      mdl += p.priceMDL * p.qty;
      usd += p.priceUSD * p.qty;
      gbp += p.priceGBP * p.qty;
    }
  });
  
  return { eur, mdl, usd, gbp };
}

function updateTotals() {
  const totals = calculateTotals();
  const totalEur = document.querySelector('.total-eur');
  const totalMdl = document.querySelector('.total-mdl');
  const totalUsd = document.querySelector('.total-usd');
  const totalGbp = document.querySelector('.total-gbp');
  
  if (totalEur) totalEur.textContent = `€${totals.eur.toFixed(2)}`;
  if (totalMdl) totalMdl.textContent = `lei ${totals.mdl.toFixed(2)}`;
  if (totalUsd) totalUsd.textContent = `$${totals.usd.toFixed(2)}`;
  if (totalGbp) totalGbp.textContent = `£${totals.gbp.toFixed(2)}`;
  
  updateChange();
}

function updateChange() {
  const receivedInput = document.getElementById('receivedAmount');
  const changeDisplay = document.getElementById('changeAmount');
  
  if (!receivedInput || !changeDisplay) return;
  
  const received = parseFloat(receivedInput.value) || 0;
  const totals = calculateTotals();
  
  let total = 0;
  let currencySymbol = '';
  
  switch(selectedCurrency) {
    case 'EUR':
      total = totals.eur;
      currencySymbol = '€';
      break;
    case 'MDL':
      total = totals.mdl;
      currencySymbol = 'lei ';
      break;
    case 'USD':
      total = totals.usd;
      currencySymbol = '$';
      break;
    case 'GBP':
      total = totals.gbp;
      currencySymbol = '£';
      break;
  }
  
  const change = received - total;
  changeDisplay.textContent = change >= 0 ? `${currencySymbol}${change.toFixed(2)}` : `${currencySymbol}0.00`;
}

// ===== UPDATE CART BADGE =====
function updateCartBadge() {
  const totalItems = productsData.reduce((sum, p) => sum + p.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// ===== CHECK FOR UPDATES =====
function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
}

// ===== SCROLL TO TOP BUTTON =====
function setupScrollButton() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  
  if (!scrollBtn) return;
  
  // Arată/ascunde butonul în funcție de scroll
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  });
  
  // Scroll la începutul paginii la click
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Search
  document.getElementById('searchInput').addEventListener('input', renderProducts);
  
  // View mode toggle
  document.getElementById('viewMode').addEventListener('click', () => {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    if (currentView === 'grid') {
      document.getElementById('viewMode').textContent = '📋 Listă';
    } else {
      document.getElementById('viewMode').textContent = '📷 Poze';
    }
    renderProducts();
  });
  
  // Tab switching
  document.getElementById('productsBtn').addEventListener('click', () => {
    currentTab = 'products';
    document.getElementById('products').style.display = 'grid';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('productsBtn').classList.add('active');
    document.getElementById('cartBtn').classList.remove('active');
    renderProducts();
  });
  
  document.getElementById('cartBtn').addEventListener('click', () => {
    currentTab = 'cart';
    document.getElementById('products').style.display = 'none';
    document.getElementById('cart').style.display = 'block';
    document.getElementById('cartBtn').classList.add('active');
    document.getElementById('productsBtn').classList.remove('active');
    renderCart();
  });
  
  // Delegate events for qty buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty-btn');
    if (btn) {
      const id = parseInt(btn.dataset.id);
      const product = productsData.find(p => p.id === id);
      if (!product) return;
      
      if (btn.classList.contains('plus')) {
        product.qty = (product.qty || 0) + 1;
      } else if (btn.classList.contains('minus')) {
        product.qty = Math.max(0, (product.qty || 0) - 1);
