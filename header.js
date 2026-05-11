(function () {
  var el = document.getElementById('header-placeholder');
  if (!el) return;
  el.innerHTML = `
    <header>
      <div class="header-container">
        <div class="logo">
          <a href="index.html"><img src="img/logo.png" alt="Netcraft Logo" class="logo-img" style="width:50px;height:auto"></a>
        </div>
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="Buscar componentes, periféricos..." onkeydown="if(event.key==='Enter')buscarProductos()">
          <button class="search-btn" onclick="buscarProductos()">Buscar</button>
        </div>
        <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
          <i class="fas fa-bars"></i>
        </button>
        <nav class="nav-right">
          <div class="nav-overlay" onclick="toggleMobileMenu()"></div>
          <ul class="nav-links">
            <li><a href="index.html">INICIO</a></li>
            <li><a href="productos.html">PRODUCTOS</a></li>
            <li class="dropdown">
              <a class="dropbtn" href="marcas.html">MARCAS <i class="fas fa-chevron-down"></i></a>
              <ul class="dropdown-content">
                <li><a href="productos.html?marca=asus"><i class="fas fa-angle-right"></i> Asus</a></li>
                <li><a href="productos.html?marca=lenovo"><i class="fas fa-angle-right"></i> Lenovo</a></li>
                <li><a href="productos.html?marca=hp"><i class="fas fa-angle-right"></i> HP</a></li>
                <li><a href="productos.html?marca=acer"><i class="fas fa-angle-right"></i> Acer</a></li>
                <li><a href="productos.html?marca=msi"><i class="fas fa-angle-right"></i> MSI</a></li>
                <li><a href="productos.html?marca=gigabyte"><i class="fas fa-angle-right"></i> Gigabyte</a></li>
                <li><a href="productos.html?marca=kingston"><i class="fas fa-angle-right"></i> Kingston</a></li>
                <li><a href="productos.html?marca=logitech"><i class="fas fa-angle-right"></i> Logitech</a></li>
              </ul>
            </li>
            <li class="dropdown">
              <a href="#" class="dropbtn">CATEGORÍAS <i class="fas fa-chevron-down"></i></a>
              <ul class="dropdown-content">
                <li><a href="productos.html?categoria=procesadores"><i class="fas fa-microchip"></i> Procesadores</a></li>
                <li><a href="productos.html?categoria=tarjetas-de-video"><i class="fas fa-memory"></i> Tarjetas de Video</a></li>
                <li><a href="productos.html?categoria=laptops"><i class="fas fa-laptop"></i> Laptops</a></li>
                <li><a href="productos.html?categoria=perifericos"><i class="fas fa-keyboard"></i> Periféricos</a></li>
                <li><a href="productos.html?categoria=almacenamiento"><i class="fas fa-hdd"></i> Almacenamiento</a></li>
                <li><a href="productos.html?categoria=monitores"><i class="fas fa-desktop"></i> Monitores</a></li>
              </ul>
            </li>
            <li><a href="quienes-somos.html">QUIÉNES SOMOS</a></li>
            <li><a href="tiendas.html">NUESTRAS TIENDAS</a></li>
          </ul>
          <div class="cart-icon" onclick="toggleCart()">
            <i class="fas fa-shopping-cart"></i>
            <span id="cart-count">0</span>
          </div>
        </nav>
      </div>
    </header>
    <div id="sidebar" class="sidebar">
      <div class="sidebar-header">
        <h3>Tu Carrito</h3>
        <button class="close-btn" onclick="toggleCart()">&times;</button>
      </div>
      <div id="cart-items" class="sidebar-body">
        <p class="empty-msg">El carrito est&aacute; vac&iacute;o</p>
      </div>
      <div class="sidebar-footer">
        <p>Total: S/. <span id="cart-total">0.00</span></p>
        <button class="btn-checkout">PAGAR</button>
      </div>
    </div>
    <div id="overlay" onclick="toggleCart()"></div>
  `;
})();
