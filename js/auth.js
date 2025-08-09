// ======= Funcionalidad de autenticación =======
function mostrarRegistro() {
  document.getElementById('seccion-login').style.display = 'none';
  document.getElementById('seccion-registro').style.display = 'flex';
}

function mostrarLogin() {
  document.getElementById('seccion-registro').style.display = 'none';
  document.getElementById('seccion-login').style.display = 'flex';
}