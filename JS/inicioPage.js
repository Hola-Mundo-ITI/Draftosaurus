/**
 * Funcionalidad específica para la página de inicio
 * Maneja la navegación del menú lateral
 */

document.addEventListener("DOMContentLoaded", () => {
  const botonAbrir = document.getElementById("abrirMenu");
  const menu = document.getElementById("menuLateral");
  
  // Abrir/cerrar menú lateral
  botonAbrir.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
  
  // Cerrar menú al hacer clic en cualquier enlace
  menu.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      menu.classList.remove("open");
    });
  });
});