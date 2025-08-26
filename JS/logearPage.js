


function mostrarRegistro() {
  document.getElementById('seccion-login').style.display = 'none';
  document.getElementById('seccion-registro').style.display = 'flex';
}


function mostrarLogin() {
  document.getElementById('seccion-registro').style.display = 'none';
  document.getElementById('seccion-login').style.display = 'flex';
}
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector('#seccion-login form');
  const registerForm = document.querySelector('#seccion-registro form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'index.php';
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.location.href = 'index.php';
    });
  }
});