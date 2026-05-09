let cartCount = 0;
let cartTotal = 0;
let allProducts = [];

// Función para abrir/cerrar el carrito
function toggleCart() {
  document.getElementById("sidebar").classList.toggle("active");
  document.getElementById("overlay").classList.toggle("active");
}

// Función para añadir productos al carrito
function addToCart(name, price) {
  cartCount++;
  cartTotal += price;

  document.getElementById("cart-count").innerText = cartCount;
  document.getElementById("cart-total").innerText = cartTotal.toFixed(2);

  const container = document.getElementById("cart-items");
  if (cartCount === 1) container.innerHTML = "";

  const div = document.createElement("div");
  div.style.padding = "10px 0";
  div.style.borderBottom = "1px solid #30363d";
  div.innerHTML = `<span>${name}</span> <span style="float:right">S/. ${price}</span>`;
  container.appendChild(div);

  // Abrir el carrito automáticamente para confirmación
  document.getElementById("sidebar").classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

// NUEVA FUNCIÓN: Alertas de navegación para el menú y footer
function redirigir(seccion) {
  alert("Esta página dice:\n\nRedirigiendo a la sección de " + seccion);
}

// NUEVA FUNCIÓN: Cambiar mapa de tiendas
function cambiarMapa(query) {
  const mapIframe = document.getElementById("mapa-iframe");
  if (mapIframe) {
    mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    mapIframe.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// --- LÓGICA DE CARGA DINÁMICA DE PRODUCTOS ---

async function cargarProductos() {
  try {
    const response = await fetch('productos.json');
    allProducts = await response.json();
    
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path.endsWith('Proyecto_integrador_ISAT/')) {
      renderizarProductosHome();
    } else if (path.includes('productos.html')) {
      renderizarProductosCatalogo();
    }
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

function renderizarProductosHome() {
  const container = document.querySelector('.product-grid');
  if (!container) return;
  
  container.innerHTML = "";
  // Solo mostrar productos marcados como "top"
  const topProducts = allProducts.filter(p => p.top);
  
  topProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" />
      <h4>${p.nombre}</h4>
      <p class="price">S/. ${p.precio}</p>
      <button class="add-btn" onclick="addToCart('${p.nombre}', ${p.precio})">
        Agregar al carrito
      </button>
    `;
    container.appendChild(card);
  });
}

function renderizarProductosCatalogo() {
  const container = document.getElementById('contenedor-productos');
  if (!container) return;
  
  container.innerHTML = "";
  allProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-marca', p.marca);
    card.setAttribute('data-categoria', p.categoria);
    card.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}" />
      <div class="product-info">
        <span class="brand-tag">${p.marca.toUpperCase()}</span>
        <h4 class="product-name">${p.nombre}</h4>
        <div class="price-container">
          <span class="current-price">S/ ${p.precio.toFixed(2)}</span>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart('${p.nombre}', ${p.precio})">
          <i class="fas fa-shopping-cart"></i> Agregar
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  // Una vez renderizados, aplicar filtros si existen parámetros en la URL
  inicializarFiltros();
}

function inicializarFiltros() {
  const parametrosURL = new URLSearchParams(window.location.search);
  const marcaDesdeURL = parametrosURL.get("marca");
  const categoriaDesdeURL = parametrosURL.get("categoria");

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
  const checkboxesMarcados = document.querySelectorAll(".filter-checkbox:checked");
  const filtrosActivos = Array.from(checkboxesMarcados).map((cb) => cb.value);

  const productos = document.querySelectorAll(".product-card");

  productos.forEach((producto) => {
    const marcaProducto = producto.getAttribute("data-marca").toLowerCase();
    const categoriaProducto = producto.getAttribute("data-categoria").toLowerCase();

    if (filtrosActivos.length === 0) {
      producto.style.display = "flex";
    } else {
      // Mostrar si coincide con marca O categoría (ajustable a Y si se prefiere)
      if (filtrosActivos.includes(marcaProducto) || filtrosActivos.includes(categoriaProducto)) {
        producto.style.display = "flex";
      } else {
        producto.style.display = "none";
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
    const urlSinParametros = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.replaceState({ path: urlSinParametros }, "", urlSinParametros);
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

// --- INICIALIZACIÓN ---

document.addEventListener("DOMContentLoaded", () => {
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
  const checkboxes = document.querySelectorAll(".filter-checkbox");
  checkboxes.forEach((box) => {
    box.addEventListener("change", aplicarFiltros);
  });
});