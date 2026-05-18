let cartCount = 0;
let cartTotal = 0;
let cartItems = [];
let allProducts = [];

// --- FUNCIÓN MENÚ MÓVIL (definida al inicio para estar disponible globalmente) ---
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');
  if (navLinks) {
    navLinks.classList.toggle('mobile-open');
  }
  if (overlay) {
    overlay.classList.toggle('show');
  }
}
window.toggleMobileMenu = toggleMobileMenu;

// --- LOCALSTORAGE DEL CARRITO ---
function guardarCarrito() {
  const carrito = {
    items: cartItems,
    count: cartCount,
    total: cartTotal
  };
  localStorage.setItem('netcraft_carrito', JSON.stringify(carrito));
}

function renderizarCarritoSidebar() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = '<p class="empty-msg">El carrito est&aacute; vac&iacute;o</p>';
  } else {
    container.innerHTML = '';
    cartItems.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <div class="cart-item-info">
          <span class="cart-item-name">${item.nombre}</span>
          <span class="cart-item-price">S/. ${item.precio.toFixed(2)}</span>
        </div>
        <button class="cart-item-delete" onclick="removeFromCart(${index})" title="Eliminar del carrito">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      container.appendChild(row);
    });
  }
}

function removeFromCart(index) {
  if (index >= 0 && index < cartItems.length) {
    const removedItem = cartItems[index];
    cartCount--;
    cartTotal -= removedItem.precio;
    if (cartTotal < 0) cartTotal = 0;
    
    cartItems.splice(index, 1);

    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cartCount;

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = cartTotal.toFixed(2);

    renderizarCarritoSidebar();
    guardarCarrito();
    mostrarToast(`"${removedItem.nombre}" eliminado`);
  }
}
window.removeFromCart = removeFromCart;

function cargarCarrito() {
  const guardado = localStorage.getItem('netcraft_carrito');
  if (guardado) {
    const carrito = JSON.parse(guardado);
    cartCount = carrito.count || 0;
    cartTotal = carrito.total || 0;
    cartItems = carrito.items || [];

    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cartCount;

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = cartTotal.toFixed(2);

    renderizarCarritoSidebar();
  }
}

// Función para abrir/cerrar el carrito
function toggleCart() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  }
}

// Función para añadir productos al carrito
function addToCart(name, price) {
  cartCount++;
  cartTotal += price;
  cartItems.push({ nombre: name, precio: price });

  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.innerText = cartCount;

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.innerText = cartTotal.toFixed(2);

  renderizarCarritoSidebar();
  guardarCarrito();

  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  }

  mostrarToast(`"${name}" agregado al carrito`);
}

// --- PASARELA DE PAGO INTERACTIVA (CHECKOUT) ---
function abrirPasarelaPago() {
  if (cartItems.length === 0) {
    mostrarToast("Añade productos al carrito antes de pagar");
    return;
  }

  // Cerrar el sidebar del carrito
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }

  // Crear modal de pago si no existe
  let modalOverlay = document.querySelector('.checkout-modal-overlay');
  if (modalOverlay) modalOverlay.remove();

  modalOverlay = document.createElement('div');
  modalOverlay.className = 'checkout-modal-overlay';
  modalOverlay.innerHTML = `
    <div class="checkout-modal-container">
      <div class="checkout-modal-header">
        <h3><i class="fas fa-shopping-bag"></i> Confirmar tu Pedido</h3>
        <button class="checkout-modal-close" onclick="cerrarPasarelaPago()">&times;</button>
      </div>
      
      <div class="checkout-summary">
        <h4 style="color: white; margin-bottom: 10px; font-size: 0.95rem;">Resumen de Compra</h4>
        <div style="max-height: 120px; overflow-y: auto; margin-bottom: 10px; border-bottom: 1px solid #30363d; padding-bottom: 10px;">
          ${cartItems.map(item => `
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#8b949e; margin-bottom:5px;">
              <span>${item.nombre}</span>
              <span style="color:white; font-weight:bold;">S/. ${item.precio.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="checkout-summary-row total">
          <span>Total a pagar:</span>
          <span>S/. ${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <form id="checkout-form" onsubmit="confirmarPedido(event)">
        <div class="checkout-form-group">
          <label for="checkout-name">Nombre y Apellidos *</label>
          <input type="text" id="checkout-name" required placeholder="Ej. Juan Pérez">
        </div>
        <div class="checkout-form-group">
          <label for="checkout-phone">WhatsApp / Celular *</label>
          <input type="tel" id="checkout-phone" required placeholder="Ej. 999 999 999">
        </div>
        <div class="checkout-form-group">
          <label for="checkout-address">Dirección de Entrega *</label>
          <input type="text" id="checkout-address" required placeholder="Calle, Av, Nro, Distrito - Lima">
        </div>
        <div class="checkout-form-group">
          <label for="checkout-payment">Método de Pago Preferido *</label>
          <select id="checkout-payment" required>
            <option value="yape-plin">Yape o Plin (Envío rápido)</option>
            <option value="transferencia">Transferencia Bancaria (BCP / BBVA)</option>
            <option value="tarjeta">Pago Online con Tarjeta (Crédito/Débito)</option>
          </select>
        </div>
        <button type="submit" class="btn-confirm-checkout">PROCESAR PEDIDO</button>
      </form>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  setTimeout(() => {
    modalOverlay.classList.add('active');
  }, 50);
}

function cerrarPasarelaPago() {
  const modalOverlay = document.querySelector('.checkout-modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    setTimeout(() => {
      modalOverlay.remove();
    }, 300);
  }
}

function confirmarPedido(event) {
  event.preventDefault();
  const name = document.getElementById('checkout-name').value;
  const phone = document.getElementById('checkout-phone').value;
  const address = document.getElementById('checkout-address').value;
  const payment = document.getElementById('checkout-payment').value;

  const orderNum = Math.floor(Math.random() * 90000) + 10000;
  const orderCode = `NET-ORDER-${orderNum}`;

  const orderData = {
    codigo: orderCode,
    nombre: name,
    telefono: phone,
    direccion: address,
    metodo: payment,
    items: cartItems,
    total: cartTotal,
    fecha: new Date().toISOString()
  };
  localStorage.setItem('ultimo_pedido', JSON.stringify(orderData));

  cartCount = 0;
  cartTotal = 0;
  cartItems = [];
  guardarCarrito();

  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.innerText = '0';

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.innerText = '0.00';

  renderizarCarritoSidebar();

  const container = document.querySelector('.checkout-modal-container');
  if (container) {
    container.innerHTML = `
      <div class="success-screen">
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <h3 class="success-title">¡Pedido Recibido con Éxito!</h3>
        <p style="color: #8b949e; font-size: 0.95rem; line-height: 1.5; padding: 0 10px;">
          Gracias por confiar en <strong>NetCraft</strong>. Hemos recibido tus datos y estamos preparando tu pedido.
        </p>
        <span class="success-order-code">${orderCode}</span>
        <p style="color: #8b949e; font-size: 0.85rem; margin-top: 10px; padding: 0 15px;">
          Se ha enviado un correo con los detalles y los pasos de pago. En breve, un asesor gamer se contactará contigo por WhatsApp al <strong>${phone}</strong> para coordinar la entrega.
        </p>
        <button class="btn-confirm-checkout" onclick="cerrarPasarelaPago()" style="margin-top: 25px; background: var(--card-bg); border: 1px solid var(--primary-cyan); color: var(--primary-cyan); box-shadow: none;">
          CERRAR Y SEGUIR EXPLORANDO
        </button>
      </div>
    `;
  }
}

window.abrirPasarelaPago = abrirPasarelaPago;
window.cerrarPasarelaPago = cerrarPasarelaPago;
window.confirmarPedido = confirmarPedido;

// --- TOAST DE NOTIFICACIÓN ---
function mostrarToast(mensaje) {
  // Eliminar toast anterior si existe
  const toastExistente = document.querySelector('.toast-notification');
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${mensaje}</span>
  `;
  document.body.appendChild(toast);

  // Animación de entrada
  setTimeout(() => toast.classList.add('show'), 10);

  // Eliminar después de 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Función de búsqueda
function buscarProductos() {
  const input = document.getElementById('search-input');
  if (!input) return;
  const query = input.value.trim();
  if (query) {
    window.location.href = 'productos.html?busqueda=' + encodeURIComponent(query);
  }
}

// NUEVA FUNCIÓN: Cambiar mapa de tiendas
function cambiarMapa(query) {
  const mapIframe = document.getElementById('mapa-iframe');
  if (mapIframe) {
    mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    mapIframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// --- LÓGICA DE CARGA DINÁMICA DE PRODUCTOS ---

const API_URL = '/api';

async function cargarProductos() {
  try {
    // Intentar primero con la API del backend
    try {
      const response = await fetch(`${API_URL}/productos`);
      if (response.ok) {
        allProducts = await response.json();
      } else {
        throw new Error('API no disponible');
      }
    } catch (apiError) {
      // Si la API no está disponible, usar productos.json local
      console.log('API no disponible, usando productos.json local');
      const response = await fetch('productos.json');
      allProducts = await response.json();
    }

    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    // Verificar si hay búsqueda por texto
    const busqueda = urlParams.get('busqueda');

    if (path.includes('index.html') || path === '/' || path.endsWith('Proyecto_integrador_ISAT/')) {
      renderizarProductosHome();
    } else if (path.includes('productos.html')) {
      renderizarProductosCatalogo(busqueda);
    }
  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

function getImagenConFallback(ruta) {
  return `onerror="this.onerror=null; this.src='img/no-image.png'" src="${ruta}"`;
}

function renderizarProductosHome() {
  const container = document.querySelector('.product-grid');
  if (!container) return;

  container.innerHTML = '';
  // Solo mostrar productos marcados como "top"
  const topProducts = allProducts.filter(p => p.top);

  topProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.onerror=null; this.src='img/no-image.png'" />
      <h4>${p.nombre}</h4>
      <p class="price">S/. ${p.precio}</p>
      <button class="add-btn" onclick="addToCart('${p.nombre.replace(/'/g, "\\'")}', ${p.precio})">
        Agregar al carrito
      </button>
    `;
    container.appendChild(card);
  });
}

function renderizarProductosCatalogo(busqueda = null) {
  const container = document.getElementById('contenedor-productos');
  if (!container) return;

  let productosAMostrar = [...allProducts];

  // Si hay búsqueda por texto, filtrar
  if (busqueda) {
    const query = busqueda.toLowerCase();
    productosAMostrar = productosAMostrar.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      p.marca.toLowerCase().includes(query) ||
      p.categoria.toLowerCase().includes(query)
    );
    // Actualizar título con resultado de búsqueda
    const titulo = document.querySelector('.page-title');
    if (titulo) {
      titulo.textContent = `RESULTADOS PARA "${busqueda}"`;
    }
  }

  container.innerHTML = '';
  productosAMostrar.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-marca', p.marca);
    card.setAttribute('data-categoria', p.categoria);
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.onerror=null; this.src='img/no-image.png'" />
      <div class="product-info">
        <span class="brand-tag">${p.marca.toUpperCase()}</span>
        <h4 class="product-name">${p.nombre}</h4>
        <div class="price-container">
          <span class="current-price">S/ ${p.precio.toFixed(2)}</span>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart('${p.nombre.replace(/'/g, "\\'")}', ${p.precio})">
          <i class="fas fa-shopping-cart"></i> Agregar
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Guardar referencia para ordenamiento
  window.productosEnCatalogo = productosAMostrar;

  // Una vez renderizados, aplicar filtros si existen parámetros en la URL
  inicializarFiltros();
}

// --- ORDENAMIENTO DE PRODUCTOS ---
function ordenarProductos(tipo) {
  if (!window.productosEnCatalogo) return;

  const container = document.getElementById('contenedor-productos');
  if (!container) return;

  let productosOrdenados = [...window.productosEnCatalogo];

  switch (tipo) {
    case 'menor':
      productosOrdenados.sort((a, b) => a.precio - b.precio);
      break;
    case 'mayor':
      productosOrdenados.sort((a, b) => b.precio - a.precio);
      break;
    case 'relevancia':
    default:
      // Mantener orden original (o por ID)
      productosOrdenados.sort((a, b) => a.id - b.id);
      break;
  }

  // Re-renderizar
  container.innerHTML = '';
  productosOrdenados.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-marca', p.marca);
    card.setAttribute('data-categoria', p.categoria);
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" onerror="this.onerror=null; this.src='img/no-image.png'" />
      <div class="product-info">
        <span class="brand-tag">${p.marca.toUpperCase()}</span>
        <h4 class="product-name">${p.nombre}</h4>
        <div class="price-container">
          <span class="current-price">S/ ${p.precio.toFixed(2)}</span>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart('${p.nombre.replace(/'/g, "\\'")}', ${p.precio})">
          <i class="fas fa-shopping-cart"></i> Agregar
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function inicializarFiltros() {
  const parametrosURL = new URLSearchParams(window.location.search);
  const marcaDesdeURL = parametrosURL.get('marca');
  const categoriaDesdeURL = parametrosURL.get('categoria');

  if (marcaDesdeURL) {
    const checkbox = document.querySelector(`.filter-checkbox[value="${marcaDesdeURL.toLowerCase()}"]`);
    if (checkbox) checkbox.checked = true;
  }

  if (categoriaDesdeURL) {
    const checkbox = document.querySelector(`.filter-checkbox[value="${categoriaDesdeURL.toLowerCase()}"]`);
    if (checkbox) checkbox.checked = true;
  }

  aplicarFiltros();
}

// --- FILTROS ---

function aplicarFiltros() {
  const checkboxesMarcados = document.querySelectorAll('.filter-checkbox:checked');
  const filtrosActivos = Array.from(checkboxesMarcados).map((cb) => cb.value);

  const productos = document.querySelectorAll('.product-card');

  productos.forEach((producto) => {
    const marcaProducto = producto.getAttribute('data-marca').toLowerCase();
    const categoriaProducto = producto.getAttribute('data-categoria').toLowerCase();

    if (filtrosActivos.length === 0) {
      producto.style.display = 'flex';
    } else {
      if (filtrosActivos.includes(marcaProducto) || filtrosActivos.includes(categoriaProducto)) {
        producto.style.display = 'flex';
      } else {
        producto.style.display = 'none';
      }
    }
  });
}

function limpiarFiltros() {
  const checkboxes = document.querySelectorAll('.sidebar-filters input[type="checkbox"]');
  checkboxes.forEach((box) => {
    box.checked = false;
  });

  if (window.history.replaceState) {
    const urlSinParametros = window.location.protocol + '//' + window.location.host + window.location.pathname;
    window.history.replaceState({ path: urlSinParametros }, '', urlSinParametros);
  }

  aplicarFiltros();
}

// --- SLIDER ---

let heroIndex = 0;

function mostrarHero(n) {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;

  if (n >= slides.length) { heroIndex = 0; }
  if (n < 0) { heroIndex = slides.length - 1; }

  slides.forEach(slide => slide.classList.remove('active'));
  slides[heroIndex].classList.add('active');
}

function controlarHero(direccion) {
  heroIndex += direccion;
  mostrarHero(heroIndex);
}

// --- HAMBURGER MENU PARA MÓVIL ---
setInterval(function() {
  var btn = document.querySelector('.mobile-menu-btn');
  if (btn && !btn.onclick) {
    btn.onclick = function() {
      document.querySelector('.nav-right').classList.toggle('show');
    };
  }
}, 100);

// --- DROPDOWN TOGGLE EN MÓVIL ---
function toggleDropdown(e) {
  if (e) e.preventDefault();
  if (window.innerWidth <= 768) {
    const link = e.target.closest('.dropbtn');
    if (link) {
      const dropdown = link.parentElement;
      dropdown.classList.toggle('active');
    }
  }
  return false;
}

// --- TOGGLE DE FILTROS EN MÓVIL ---
function toggleFilters() {
  const filtersPanel = document.getElementById('filters-panel');
  const toggleBtn = document.querySelector('.filter-toggle-btn');
  if (filtersPanel && toggleBtn) {
    filtersPanel.classList.toggle('show');
    toggleBtn.classList.toggle('open');
    const isOpen = filtersPanel.classList.contains('show');
    toggleBtn.innerHTML = isOpen 
      ? '<i class="fas fa-chevron-up"></i> Ocultar Filtros'
      : '<i class="fas fa-chevron-down"></i> Mostrar Filtros';
  }
}

// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
  // Cargar carrito desde localStorage
  cargarCarrito();

  // Cargar productos
  cargarProductos();

  // Slider auto-change
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length > 0) {
    setInterval(() => {
      heroIndex++;
      mostrarHero(heroIndex);
    }, 6000);
  }

  // Eventos para filtros
  const checkboxes = document.querySelectorAll('.filter-checkbox');
  checkboxes.forEach((box) => {
    box.addEventListener('change', aplicarFiltros);
  });

  // Evento para ordenamiento
  const selectOrdenar = document.getElementById('ordenar');
  if (selectOrdenar) {
    selectOrdenar.addEventListener('change', (e) => {
      ordenarProductos(e.target.value);
    });
  }

  // Evento para buscar mientras escribes (solo en productos.html)
  const searchInput = document.getElementById('search-input');
  if (searchInput && window.location.pathname.includes('productos.html')) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      const productos = document.querySelectorAll('.product-card');
      productos.forEach(producto => {
        const nombre = producto.querySelector('.product-name').textContent.toLowerCase();
        const marca = producto.getAttribute('data-marca').toLowerCase();
        if (nombre.includes(query) || marca.includes(query)) {
          producto.style.display = 'flex';
        } else {
          producto.style.display = 'none';
        }
      });
    });
  }

  // Menú móvil
  setTimeout(() => {
    const menuBtn = document.querySelector('#hamburgerBtn');
    if (menuBtn) {
      menuBtn.onclick = toggleMobileMenu;
    }
    const overlay = document.querySelector('.nav-overlay');
    if (overlay) {
      overlay.onclick = toggleMobileMenu;
    }
  }, 100);
});