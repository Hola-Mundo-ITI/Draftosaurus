/**
 * Funcionalidad específica para la página de puntajes
 * Maneja la navegación del menú y la visualización de resultados
 */

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById('abrirMenu');
  const menu = document.getElementById('menuLateral');
  
  // Abrir/cerrar menú lateral
  boton.addEventListener('click', () => {
    menu.classList.toggle('abierto');
  });
  
  // Cerrar menú al hacer clic en cualquier enlace
  menu.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', () => {
      menu.classList.remove('abierto');
    });
  });
  
  // TODO: Aquí se puede agregar funcionalidad adicional
  // - Carga dinámica de puntajes
  // - Animaciones para el ranking
  // - Filtros y ordenamiento
  // - Exportación de resultados
  // - Comparación de partidas
});