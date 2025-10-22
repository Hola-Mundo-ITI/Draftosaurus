function mostrarRegistro() {
  document.getElementById('seccion-login').style.display = 'none';
  document.getElementById('seccion-registro').style.display = 'flex';
}

function mostrarLogin() {
  document.getElementById('seccion-registro').style.display = 'none';
  document.getElementById('seccion-login').style.display = 'flex';
}

function inicializarLogearPage() {
  const formIniciar = document.getElementById('form-iniciarSesion');
  const formRegistro = document.getElementById('form-registro');

  if (formIniciar) formIniciar.addEventListener('submit', manejarInicioSesion);
  if (formRegistro) formRegistro.addEventListener('submit', manejarRegistro);
}

async function manejarInicioSesion(event) {
  event.preventDefault();
  const mensajeId = 'login-mensaje';

  const form = event.target;
  const emailEl = form.querySelector('input[name="email"]');
  const passwordEl = form.querySelector('input[name="password"]');

  if (!emailEl || !passwordEl) {
    mostrarMensaje(mensajeId, 'Formulario incompleto. Campos faltantes.', 'error');
    return;
  }

  const email = String(emailEl.value || '').trim().toLowerCase();
  const password = String(passwordEl.value || '');

  if (!email) { mostrarMensaje(mensajeId, 'Email requerido.', 'error'); return; }
  if (!password) { mostrarMensaje(mensajeId, 'Contrasena requerida.', 'error'); return; }

  try {
    const resp = await fetch('datos/sesion/iniciarSesion.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ email, password })
    });

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      mostrarMensaje(mensajeId, 'Respuesta invalida del servidor.', 'error');
      return;
    }

    const json = await resp.json();

    if (json && json.success === true) {
      window.location.href = 'index.php';
      return;
    }

    const errorMsg = (json && json.error) ? json.error : 'Error iniciando sesion';
    mostrarMensaje(mensajeId, errorMsg, 'error');
  } catch (err) {
    mostrarMensaje(mensajeId, 'Error de red intentando iniciar sesion.', 'error');
  }
}

async function manejarRegistro(event) {
  event.preventDefault();
  const mensajeId = 'registro-mensaje';

  const form = event.target;
  const emailEl = form.querySelector('input[name="email"]');
  const nombreEl = form.querySelector('input[name="nombre"]');
  const passwordEl = form.querySelector('input[name="password"]');

  if (!emailEl || !nombreEl || !passwordEl) {
    mostrarMensaje(mensajeId, 'Formulario incompleto. Campos faltantes.', 'error');
    return;
  }

  const email = String(emailEl.value || '').trim().toLowerCase();
  const nombre = String(nombreEl.value || '').trim();
  const password = String(passwordEl.value || '');

  if (!email) { mostrarMensaje(mensajeId, 'Email requerido.', 'error'); return; }
  if (!nombre) { mostrarMensaje(mensajeId, 'Nombre requerido.', 'error'); return; }
  if (!password || password.length < 8) { 
    mostrarMensaje(mensajeId, 'Contrasena requerida (minimo 8 caracteres).', 'error'); 
    return; 
  }

  try {
    const resp = await fetch('datos/sesion/crearSesion.php', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ email, nombre, password })
    });

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      mostrarMensaje(mensajeId, 'Respuesta invalida del servidor.', 'error');
      return;
    }

    const json = await resp.json();

    if (json && json.success === true) {
      window.location.href = 'index.php';
      return;
    }

    const errorMsg = (json && json.error) ? json.error : 'Error registrando usuario';
    mostrarMensaje(mensajeId, errorMsg, 'error');
  } catch (err) {
    mostrarMensaje(mensajeId, 'Error de red intentando registrarse.', 'error');
  }
}

function mostrarMensaje(elementId, mensaje, tipo = 'info') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = mensaje;
  el.className = tipo;
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarLogearPage();
});