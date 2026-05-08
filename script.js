let cartCount = 0;
let cartTotal = 0;

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

/* script.js  para la pestaña productos aplicando sus filtros*/

// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  // 1. Lógica para capturar parámetro de URL (Cuando vienes de marcas.html)
  const parametrosURL = new URLSearchParams(window.location.search);
  const marcaDesdeURL = parametrosURL.get("marca");

  if (marcaDesdeURL) {
    // Buscar el checkbox correspondiente y marcarlo
    const checkbox = document.querySelector(
      `.filter-checkbox[value="${marcaDesdeURL.toLowerCase()}"]`,
    );
    if (checkbox) {
      checkbox.checked = true;
    }
  }

  // Ejecutar filtro inicial (aplica si hay parámetro URL o muestra todos si no hay)
  aplicarFiltros();

  // 2. Lógica para escuchar cambios en los checkboxes
  const checkboxes = document.querySelectorAll(".filter-checkbox");
  checkboxes.forEach((box) => {
    box.addEventListener("change", aplicarFiltros);
  });
});

// Función principal de filtrado
function aplicarFiltros() {
  // Obtener todos los checkboxes marcados
  const checkboxesMarcados = document.querySelectorAll(
    ".filter-checkbox:checked",
  );
  const marcasActivas = Array.from(checkboxesMarcados).map((cb) => cb.value);

  // Obtener todos los productos
  const productos = document.querySelectorAll(".product-card");

  productos.forEach((producto) => {
    const marcaProducto = producto.getAttribute("data-marca").toLowerCase();

    // Si no hay ninguna marca seleccionada, mostrar todo
    if (marcasActivas.length === 0) {
      producto.style.display = "flex";
    } else {
      // Si la marca del producto está en el array de marcas seleccionadas, mostrar
      if (marcasActivas.includes(marcaProducto)) {
        producto.style.display = "flex";
      } else {
        // Si no, ocultar
        producto.style.display = "none";
      }
    }
  });
}

// Función para el botón "Limpiar Filtros"
function limpiarFiltros() {
  // Selecciona todos los checkboxes independientemente de su clase,
  // siempre y cuando estén dentro del contenedor sidebar-filters.
  const checkboxes = document.querySelectorAll(
    '.sidebar-filters input[type="checkbox"]',
  );

  checkboxes.forEach((box) => {
    box.checked = false;
  });

  if (window.history.replaceState) {
    const urlSinParametros =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname;
    window.history.replaceState(
      { path: urlSinParametros },
      "",
      urlSinParametros,
    );
  }

  aplicarFiltros();
}

let heroIndex = 0;

function mostrarHero(n) {
    const slides = document.querySelectorAll('.hero-slide');
    
    // Si llegamos al final, vuelve al principio
    if (n >= slides.length) { heroIndex = 0; }
    // Si retrocedemos desde el inicio, va al final
    if (n < 0) { heroIndex = slides.length - 1; }

    // Quitar la clase active de todas las imágenes
    slides.forEach(slide => slide.classList.remove('active'));

    // Poner la clase active a la imagen actual
    slides[heroIndex].classList.add('active');
}

function controlarHero(direccion) {
    heroIndex += direccion;
    mostrarHero(heroIndex);
}

// CAMBIO AUTOMÁTICO: Cambia cada 6 segundos
setInterval(() => {
    heroIndex++;
    mostrarHero(heroIndex);
}, 6000);