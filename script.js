let cartCount = 0;
let cartTotal = 0;
let cartItems = [];
let allProducts = [];

// --- LOCALSTORAGE DEL CARRITO ---
function guardarCarrito() {
  const carrito = {
    items: cartItems,
    count: cartCount,
    total: cartTotal
  };
  localStorage.setItem('netcraft_carrito', JSON.stringify(carrito));
}

function cargarCarrito() {
  const guardado = localStorage.getItem('netcraft_carrito');
  if (guardado) {
    const carrito = JSON.parse(guardado);
    cartCount = carrito.count || 0;
    cartTotal = carrito.total || 0;
    cartItems = carrito.items || [];

    // Actualizar contador
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cartCount;

    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = cartTotal.toFixed(2);

    // Renderizar items en el sidebar
    const container = document.getElementById('cart-items');
    if (container) {
      if (cartItems.length === 0) {
        container.innerHTML = '<p class="empty-msg">El carrito est&aacute; vac&iacute;o</p>';
      } else {
        container.innerHTML = '';
        cartItems.forEach(item => {
          const div = document.createElement('div');
          div.style.padding = '10px 0';
          div.style.borderBottom = '1px solid #30363d';
          div.innerHTML = `<span>${item.nombre}</span> <span style="float:right">S/. ${item.precio}</span>`;
          container.appendChild(div);
        });
      }
    }
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

  document.getElementById('cart-count').innerText = cartCount;
  document.getElementById('cart-total').innerText = cartTotal.toFixed(2);

  const container = document.getElementById('cart-items');
  if (cartCount === 1) container.innerHTML = "";

  const div = document.createElement('div');
  div.style.padding = '10px 0';
  div.style.borderBottom = '1px solid #30363d';
  div.innerHTML = `<span>${name}</span> <span style="float:right">S/. ${price}</span>`;
  container.appendChild(div);

  // Guardar en localStorage
  guardarCarrito();

  // Abrir el carrito automáticamente para confirmación
  document.getElementById('sidebar').classList.add('active');
  document.getElementById('overlay').classList.add('active');

  // Mostrar toast de notificación
  mostrarToast(`"${name}" agregado al carrito`);
}

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
function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.classList.toggle('mobile-open');
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
});