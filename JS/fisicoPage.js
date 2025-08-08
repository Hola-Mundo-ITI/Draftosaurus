/**
 * Funcionalidad específica para la página del modo físico
 * Maneja el menú lateral y el formulario de seguimiento
 */

document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById('btnMenu');
  const menuLateral = document.getElementById('menuLateral');
  const contenido = document.getElementById('contenido');
  
  // Toggle del menú lateral con desplazamiento de contenido
  btnMenu.addEventListener('click', () => {
    menuLateral.classList.toggle('abierto');
    contenido.classList.toggle('desplazado');
  });
  
  // Cerrar menú al hacer clic en cualquier enlace
  menuLateral.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuLateral.classList.remove('abierto');
      contenido.classList.remove('desplazado');
    });
  });
  
  // TODO: Aquí se puede agregar la lógica del formulario
  // - Validación de campos
  // - Cálculo automático de puntajes
  // - Guardado de datos localmente
  // - Exportación de resultados
});