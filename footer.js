(function () {
  var el = document.getElementById('footer-placeholder');
  if (!el) return;
  el.innerHTML = `
    <footer>
      <div class="footer-container">
        <div class="f-logo-area">
          <img src="img/logo.png" alt="Logo Footer" width="100" />
        </div>
        <div class="f-links">
          <ul>
            <li><a href="blog.html">Blog</a></li>
            <li><a href="como-comprar.html">&iquest;C&oacute;mo comprar?</a></li>
            <li><a href="preguntas-frecuentes.html">Preguntas frecuentes</a></li>
            <li><a href="terminos-y-condiciones.html">T&eacute;rminos y condiciones</a></li>
          </ul>
        </div>
        <div class="f-reclamaciones">
          <a href="reclamaciones.html" class="libro-link">
            <img src="img/libro-de-reclamaciones.jpg" alt="Libro de Reclamaciones" class="lib-img" />
          </a>
        </div>
      </div>
      <p class="copy">&copy; 2026 Grupo 2 - Proyecto Acad&eacute;mico ISAT</p>
    </footer>
  `;
})();
