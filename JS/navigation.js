// Abrir y cerrar el menú
document.getElementById('menuToggle').addEventListener('click', function() {
    var menu = document.getElementById('mainMenu');
    var overlay = document.getElementById('menuOverlay');
    
    menu.classList.toggle('open');
    overlay.classList.toggle('active');
  });
  
  // Cerrar menú al hacer clic en el overlay
  document.getElementById('menuOverlay').addEventListener('click', function() {
    var menu = document.getElementById('mainMenu');
    var overlay = document.getElementById('menuOverlay');
    
    menu.classList.remove('open');
    overlay.classList.remove('active');
  });