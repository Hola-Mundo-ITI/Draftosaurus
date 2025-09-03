/**
 * Módulo cliente para administracion de usuarios: listado, creación, edición y eliminación.
 */
(function(){
  'use strict';

  /**
   * Muestra un mensaje breve en el área de mensajes del admin.
   */
  function mostrarMensaje(mensaje, tipo = 'info') {
    var cont = document.getElementById('admin-messages');
    if (!cont) return;
    cont.textContent = mensaje;
    cont.style.color = tipo === 'error' ? '#a00' : '#070';
    setTimeout(function(){ if (cont.textContent === mensaje) cont.textContent = ''; }, 5000);
  }

  /**
   * Realiza una petición GET al endpoint de usuarios para obtener la lista paginada.
   */
  function fetchUsuarios(page, perPage, q) {
    page = page || 1;
    perPage = perPage || 20;
    var url = 'backend/users.php?page=' + encodeURIComponent(page) + '&per_page=' + encodeURIComponent(perPage);
    if (q) url += '&q=' + encodeURIComponent(q);

    return fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    }).then(function(res){ return res.json(); });
  }

  /**
   * Renderiza la tabla de usuarios a partir de la respuesta del servidor.
   */
  function renderUsuarios(data) {
    var tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    if (!data || !Array.isArray(data)) return;
    data.forEach(function(u){
      var tr = document.createElement('tr');
      tr.innerHTML = '<td>'+escapeHtml(u.id)+'</td>' +
                     '<td>'+escapeHtml(u.nombre)+'</td>' +
                     '<td>'+escapeHtml(u.email)+'</td>' +
                     '<td>'+escapeHtml(u.role)+'</td>' +
                     '<td>' +
                       '<button class="btn btn-sm btn-primary btn-edit" data-id="'+u.id+'">Editar</button> ' +
                       '<button class="btn btn-sm btn-danger btn-del" data-id="'+u.id+'">Borrar</button>' +
                     '</td>';
      tbody.appendChild(tr);
    });

    // attach handlers
    Array.prototype.slice.call(document.querySelectorAll('.btn-edit')).forEach(function(btn){
      btn.addEventListener('click', function(){ actualizarUsuarioPrompt(parseInt(btn.getAttribute('data-id'),10)); });
    });
    Array.prototype.slice.call(document.querySelectorAll('.btn-del')).forEach(function(btn){
      btn.addEventListener('click', function(){ eliminarUsuarioConfirm(parseInt(btn.getAttribute('data-id'),10)); });
    });
  }

  /**
   * Escapa texto para insertar en HTML.
   */
  function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /**
   * Pide datos mediante prompt para crear un nuevo usuario y llama al endpoint.
   */
  function crearUsuarioPrompt() {
    var email = prompt('Email del nuevo usuario:');
    if (!email) return;
    var nombre = prompt('Nombre:');
    if (!nombre) return;
    var password = prompt('Password (mínimo 8 caracteres):');
    if (!password) return;
    var role = prompt('Role (user o admin):', 'user') || 'user';
    var payload = { email: email, nombre: nombre, password: password, role: role };

    fetch('backend/users.php', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json(); }).then(function(j){
      if (j && j.success) {
        mostrarMensaje('Usuario creado', 'ok');
        cargarYRenderUsuarios();
      } else {
        mostrarMensaje((j && j.error) ? j.error : 'Error al crear', 'error');
      }
    }).catch(function(){ mostrarMensaje('Error de red', 'error'); });
  }

  /**
   * Muestra prompt para editar y envía PUT al endpoint para actualizar usuario.
   */
  function actualizarUsuarioPrompt(id) {
    // obtener datos actuales desde la fila
    var row = document.querySelector('button[data-id="'+id+'"]')?.closest('tr');
    if (!row) return;
    var currentNombre = row.cells[1].textContent || '';
    var currentEmail = row.cells[2].textContent || '';
    var currentRole = row.cells[3].textContent || 'user';

    var nombre = prompt('Nombre:', currentNombre);
    if (nombre === null) return;
    var email = prompt('Email:', currentEmail);
    if (email === null) return;
    var role = prompt('Role (user o admin):', currentRole) || currentRole;
    var cambiarPw = confirm('¿Desea cambiar la contraseña?');
    var payload = { nombre: nombre, email: email, role: role };
    if (cambiarPw) {
      var pw = prompt('Nueva password (mínimo 8 caracteres):');
      if (pw) payload.password = pw;
    }

    fetch('backend/users.php?id='+encodeURIComponent(id), {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json(); }).then(function(j){
      if (j && j.success) {
        mostrarMensaje('Usuario actualizado', 'ok');
        cargarYRenderUsuarios();
      } else {
        mostrarMensaje((j && j.error) ? j.error : 'Error al actualizar', 'error');
      }
    }).catch(function(){ mostrarMensaje('Error de red', 'error'); });
  }

  /**
   * Confirma y elimina un usuario llamando DELETE al endpoint.
   */
  function eliminarUsuarioConfirm(id) {
    if (!confirm('¿Confirmar eliminación del usuario id='+id+'?')) return;
    fetch('backend/users.php?id='+encodeURIComponent(id), {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
    }).then(function(r){ return r.json(); }).then(function(j){
      if (j && j.success) {
        mostrarMensaje('Usuario eliminado', 'ok');
        cargarYRenderUsuarios();
      } else {
        mostrarMensaje((j && j.error) ? j.error : 'Error al eliminar', 'error');
      }
    }).catch(function(){ mostrarMensaje('Error de red', 'error'); });
  }

  /**
   * Carga usuarios y renderiza tabla con parámetros actuales.
   */
  function cargarYRenderUsuarios() {
    var q = document.getElementById('admin-search') ? document.getElementById('admin-search').value : '';
    fetchUsuarios(1,20,q).then(function(j){
      if (!j || !j.success) {
        mostrarMensaje('No se pudo cargar la lista', 'error');
        return;
      }
      renderUsuarios(j.usuarios || []);
    }).catch(function(){ mostrarMensaje('Error de red al listar', 'error'); });
  }

  // Inicialización al cargar el DOM
  document.addEventListener('DOMContentLoaded', function(){
    var toolbar = document.createElement('div');
    toolbar.style.marginBottom = '12px';

    var btnCrear = document.createElement('button');
    btnCrear.className = 'btn btn-success';
    btnCrear.textContent = 'Crear usuario';
    btnCrear.addEventListener('click', crearUsuarioPrompt);

    var inputSearch = document.createElement('input');
    inputSearch.id = 'admin-search';
    inputSearch.placeholder = 'Buscar por email o nombre';
    inputSearch.style.marginLeft = '8px';

    var btnBuscar = document.createElement('button');
    btnBuscar.className = 'btn btn-secondary';
    btnBuscar.textContent = 'Buscar';
    btnBuscar.style.marginLeft = '8px';
    btnBuscar.addEventListener('click', function(){ cargarYRenderUsuarios(); });

    toolbar.appendChild(btnCrear);
    toolbar.appendChild(inputSearch);
    toolbar.appendChild(btnBuscar);

    var adminRoot = document.getElementById('admin-root');
    if (adminRoot) adminRoot.insertBefore(toolbar, adminRoot.firstChild);

    cargarYRenderUsuarios();
  });

  // Export reducido para testing desde consola
  window.adminModule = { cargarYRenderUsuarios: cargarYRenderUsuarios };
})();
