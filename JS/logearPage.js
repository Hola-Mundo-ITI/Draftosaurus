/**
 * Funcionalidad específica para la página de login/registro
 * Maneja el cambio entre formularios de login y registro
 */

/**
 * Muestra el formulario de registro y oculta el de login
 */
function mostrarRegistro() {
  document.getElementById('seccion-login').style.display = 'none';
  document.getElementById('seccion-registro').style.display = 'flex';
}

/**
 * Muestra el formulario de login y oculta el de registro
 */
function mostrarLogin() {
  document.getElementById('seccion-registro').style.display = 'none';
  document.getElementById('seccion-login').style.display = 'flex';
}

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  // Configurar formularios para redireccionar a PHP
  const loginForm = document.querySelector('#seccion-login form');
  const registerForm = document.querySelector('#seccion-registro form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Aquí se puede agregar validación antes de redireccionar
      window.location.href = 'index.php';
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Aquí se puede agregar validación antes de redireccionar
      window.location.href = 'index.php';
    });
  }
});

// TODO: Aquí se puede agregar funcionalidad adicional
// - Validación de formularios
// - Manejo de errores
// - Integración con backend
// - Recordar usuario
// - Recuperación de contraseña