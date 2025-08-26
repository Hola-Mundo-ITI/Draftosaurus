

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById('abrirMenu');
  const menu = document.getElementById('menuLateral');
  boton.addEventListener('click', () => {
    menu.classList.toggle('abierto');
  });
  menu.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', () => {
      menu.classList.remove('abierto');
    });
  });
});