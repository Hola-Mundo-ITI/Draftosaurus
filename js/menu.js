// ======= Funcionalidad del menú lateral =======
document.addEventListener("DOMContentLoaded", () => {
  const botonAbrir = document.getElementById("abrirMenu") || document.getElementById("btnMenu") || document.getElementById("menu-toggle");
  const menu = document.getElementById("menuLateral") || document.getElementById("menu");
  const contenido = document.getElementById("contenido");

  if (botonAbrir && menu) {
    botonAbrir.addEventListener("click", () => {
      menu.classList.toggle("open");
      menu.classList.toggle("abierto");
      
      if (contenido) {
        contenido.classList.toggle("desplazado");
      }
    });

    // Cerrar menú al hacer clic en enlaces
    menu.querySelectorAll("a").forEach(enlace => {
      enlace.addEventListener("click", () => {
        menu.classList.remove("open");
        menu.classList.remove("abierto");
        
        if (contenido) {
          contenido.classList.remove("desplazado");
        }
      });
    });
  }
});