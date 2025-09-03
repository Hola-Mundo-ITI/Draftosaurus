(function () {
  'use strict';

  const CONFIG = {
    menuToggleId: 'menuToggle',
    menuId: 'mainMenu',
    overlayId: 'menuOverlay',
    menuListSelector: '.menu-list',
    mainContentId: 'mainContent',
    mobileBreakpoint: 768
  };

  const ICON = { open: '✕', closed: '☰' };
  let isOpen = false;
  let menuToggle, menuNode, overlayNode, mainContent, menuLinks;
  const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  function init() {
    try {

      menuToggle = document.getElementById(CONFIG.menuToggleId)

        || document.querySelector(`[aria-controls="${CONFIG.menuId}"]`)

        || document.querySelector('.menu-toggle')
        || document.querySelector('.boton-menu')
        || document.querySelector('.menu-icon');

      menuNode = document.getElementById(CONFIG.menuId) || document.querySelector('.offcanvas-menu') || document.querySelector('.navegacion-lateral') || document.querySelector('.menu-lateral') || document.querySelector('aside[role="navigation"]');

      overlayNode = document.getElementById(CONFIG.overlayId) || document.querySelector('.nav-overlay') || document.querySelector('.overlay');

      mainContent = document.getElementById(CONFIG.mainContentId) || document.getElementById('contenido') || document.querySelector('.main-content') || document.querySelector('main[role="main"]');

      if (!menuToggle || !menuNode || !overlayNode) {
        console.warn('[navigation.js] Elementos de navegación faltantes. Verifique que los IDs/clases estén presentes en el HTML.');
        return;
      }

      menuLinks = Array.from(menuNode.querySelectorAll(CONFIG.menuListSelector + ' a'));

      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', menuNode.id || '');
      menuNode.setAttribute('aria-hidden', 'true');
      menuNode.setAttribute('role', 'navigation');

      menuToggle.addEventListener('click', onToggleClick);
      overlayNode.addEventListener('click', closeMenuIfOpen);
      document.addEventListener('keydown', onKeyDown);

      menuLinks.forEach(link => {
        link.setAttribute('role', 'menuitem');
        link.setAttribute('tabindex', '0');
        link.addEventListener('click', function () {
          try {
            if (window.innerWidth < CONFIG.mobileBreakpoint) closeMenu();
          } catch (e) {
            console.error('[navigation.js] Error al manejar click en enlace del menú', e);
          }
        });
      });

      menuNode.addEventListener('keydown', trapFocus);

      if (!menuToggle.hasAttribute('aria-label')) menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
      menuToggle.textContent = ICON.closed;

      console.info('[navigation.js] Inicialización completada. Elementos encontrados:', { menuToggle, menuNode, overlayNode, mainContent });

      // Añadir manejador para el botón de Cerrar sesión si existe
      try {
        const btnCerrarSesion = document.getElementById('btnCerrarSesion');
        if (btnCerrarSesion && !btnCerrarSesion.dataset._handler) {
          btnCerrarSesion.addEventListener('click', (e) => {
            try {
              e.preventDefault();
              cerrarSesion();
            } catch (err) {
              console.error('[navigation.js] Error en el handler de btnCerrarSesion:', err);
            }
          });
          // marcar para evitar reasignaciones
          btnCerrarSesion.dataset._handler = '1';
        }
      } catch (errBtn) {
        console.warn('[navigation.js] No se pudo configurar botón Cerrar sesión:', errBtn);
      }

    } catch (err) {
      console.error('[navigation.js] Error durante la inicialización:', err);
    }
  }

  function onToggleClick(event) {
    event.preventDefault();
    if (isOpen) closeMenu(); else openMenu();
  }

  function openMenu() {
    try {
      menuNode.classList.add('open');
      overlayNode.classList.add('active');
      if (mainContent) mainContent.classList.add('shifted');
      menuToggle.textContent = ICON.open;
      menuToggle.setAttribute('aria-expanded', 'true');
      menuNode.setAttribute('aria-hidden', 'false');
      isOpen = true;

      const focusable = getFocusableElements(menuNode);
      if (focusable.length) focusable[0].focus();
    } catch (err) {
      console.error('[navigation.js] Error al abrir el menú:', err);
    }
  }

  function closeMenu() {
    try {
      menuNode.classList.remove('open');
      overlayNode.classList.remove('active');
      if (mainContent) mainContent.classList.remove('shifted');
      menuToggle.textContent = ICON.closed;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuNode.setAttribute('aria-hidden', 'true');
      isOpen = false;
      menuToggle.focus();
    } catch (err) {
      console.error('[navigation.js] Error al cerrar el menú:', err);
    }
  }

  function closeMenuIfOpen() { if (isOpen) closeMenu(); }

  function onKeyDown(ev) {
    try {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        if (isOpen) { ev.preventDefault(); closeMenu(); }
      }
    } catch (err) {
      console.error('[navigation.js] Error en onKeyDown:', err);
    }
  }

  function getFocusableElements(container) {
    return Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS)).filter(el => el.offsetParent !== null);
  }

  function trapFocus(ev) {
    try {
      if (!isOpen) return;
      if (ev.key !== 'Tab') return;
      const focusable = getFocusableElements(menuNode);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (ev.shiftKey) {
        if (document.activeElement === first) { ev.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
    } catch (err) {
      console.error('[navigation.js] Error en trapFocus:', err);
    }
  }

  // Función para cerrar sesión haciendo petición al backend
  async function cerrarSesion() {
    try {
      const cerrarUrl = new URL('backend/cerrarSesion.php', window.location.href).toString();

      const resp = await fetch(cerrarUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      const contentType = resp.headers.get('content-type') || '';
      let json = null;
      if (contentType.includes('application/json')) {
        try { json = await resp.json(); } catch (e) { /* ignore parse errors */ }
      }

      if (resp.ok && json && (json.success === true || json.success === 'true')) {
        // Redirigir a la página de login para evitar que el usuario vea contenido autenticado
        window.location.href = 'logear.php';
        return;
      }

      console.error('[navigation.js] Respuesta inválida al cerrar sesión:', json);
      alert('No se pudo cerrar sesión. Por favor intenta nuevamente.');
    } catch (err) {
      console.error('[navigation.js] Error de red al cerrar sesión:', err);
      alert('Error de conexión al cerrar sesión. Reintenta.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
