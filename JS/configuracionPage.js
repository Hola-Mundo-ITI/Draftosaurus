/**
 * Funcionalidad específica para la página de configuración
 * Maneja el menú lateral y el desplazamiento del contenido
 */

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const toggleBtn = document.getElementById("menu-toggle");
  const contenido = document.getElementById("contenido");
  
  // Toggle del menú lateral con desplazamiento de contenido
  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("abierto");
    contenido.classList.toggle("desplazado");
  });
  
  // Cerrar menú al hacer clic en cualquier enlace
  menu.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      menu.classList.remove("abierto");
      contenido.classList.remove("desplazado");
    });
  });
});