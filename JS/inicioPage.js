// me cago en todo lo cagable, esto es un infierno
// Menu lateral

document.addEventListener("DOMContentLoaded", () => {
  const botonAbrir = document.getElementById("abrirMenu");
  const menu = document.getElementById("menuLateral");

  botonAbrir.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  menu.querySelectorAll("a").forEach(enlace => {
    enlace.addEventListener("click", () => {
      menu.classList.remove("open");
    });
  });
});