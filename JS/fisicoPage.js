

document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById('btnMenu');
  const menuLateral = document.getElementById('menuLateral');
  const contenido = document.getElementById('contenido');
  btnMenu.addEventListener('click', () => {
    menuLateral.classList.toggle('abierto');
    contenido.classList.toggle('desplazado');
  });
  menuLateral.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuLateral.classList.remove('abierto');
      contenido.classList.remove('desplazado');
    });
  });
});