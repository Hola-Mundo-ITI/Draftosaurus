/*
 * configuracionPage.js:
 * Módulo que gestiona la lógica de la página de configuración.
 * Se encarga de leer y aplicar opciones de usuario, enlazar eventos
 * del DOM relacionados con la configuración y persistir preferencias
 * en el almacenamiento local.
 */

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const toggleBtn = document.getElementById("menu-toggle");
  const contenido = document.getElementById("contenido");

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("abierto");
    contenido.classList.toggle("desplazado");
  });

  menu.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      menu.classList.remove("abierto");
      contenido.classList.remove("desplazado");
    });
  });
});