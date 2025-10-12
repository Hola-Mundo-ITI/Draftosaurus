document.getElementById('menuToggle').addEventListener('click', function() {
  var menu = document.getElementById('mainMenu');
  var overlay = document.getElementById('menuOverlay');
  
  menu.classList.toggle('open');
  overlay.classList.toggle('active');
});

document.getElementById('menuOverlay').addEventListener('click', function() {
  var menu = document.getElementById('mainMenu');
  var overlay = document.getElementById('menuOverlay');
  
  menu.classList.remove('open');
  overlay.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', function() {
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
  
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', cerrarSesion);
  }
});

async function cerrarSesion() {
  try {
    const respuesta = await fetch('php/auth/borrarSesion.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accion: 'cerrar'
      })
    });
    
    const datos = await respuesta.json();
    
    if (datos.success) {
      window.location.href = 'sesion.php';
    } else {
      console.log('Error al cerrar sesion: ' + (datos.error || 'Desconocido'));
    }
  } catch (error) {
    console.error('Error:', error);
    console.log('Error de red al cerrar sesion');
  }
}