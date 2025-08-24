/* navigation.js
   Script centralizado para el sistema de navegación unificado de Draftosaurus
   - Maneja apertura/cierre de menú lateral
   - Cambia el icono entre 'hamburger' y 'X'
   - Cierra con clic fuera (overlay), con Escape y al seleccionar enlaces en móvil
   - Añade atributos ARIA y control de foco (focus trap básico)
   - Inicialización robusta y comprobación de elementos del DOM
*/

(function () {
  'use strict';

  // Configuración local (coincide con includes/nav_config.php)
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
      // Buscar elemento del toggle por id
      menuToggle = document.getElementById(CONFIG.menuToggleId)
        // fallback: botón que controla el menú por aria-controls
        || document.querySelector(`[aria-controls="${CONFIG.menuId}"]`)
        // fallback a clase existente
        || document.querySelector('.menu-toggle')
        || document.querySelector('.boton-menu')
        || document.querySelector('.menu-icon');

      // Buscar el nodo del menú por id o por clase histórica
      menuNode = document.getElementById(CONFIG.menuId) || document.querySelector('.offcanvas-menu') || document.querySelector('.navegacion-lateral') || document.querySelector('.menu-lateral') || document.querySelector('aside[role="navigation"]');

      // Buscar overlay por id o por clase existente
      overlayNode = document.getElementById(CONFIG.overlayId) || document.querySelector('.nav-overlay') || document.querySelector('.overlay');

      // Buscar main content con múltiples patrones para compatibilidad
      mainContent = document.getElementById(CONFIG.mainContentId) || document.getElementById('contenido') || document.querySelector('.main-content') || document.querySelector('main[role="main"]');

      if (!menuToggle || !menuNode || !overlayNode) {
        console.warn('[navigation.js] Elementos de navegación faltantes. Verifique que los IDs/clases estén presentes en el HTML.');
        return;
      }

      menuLinks = Array.from(menuNode.querySelectorAll(CONFIG.menuListSelector + ' a'));

      // Estado ARIA inicial
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-controls', menuNode.id || '');
      menuNode.setAttribute('aria-hidden', 'true');
      menuNode.setAttribute('role', 'navigation');

      // Event listeners
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

      // Soporte para navegación por teclado dentro del menú (focus trap básico)
      menuNode.addEventListener('keydown', trapFocus);

      if (!menuToggle.hasAttribute('aria-label')) menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
      menuToggle.textContent = ICON.closed;

      console.info('[navigation.js] Inicialización completada. Elementos encontrados:', { menuToggle, menuNode, overlayNode, mainContent });
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else setTimeout(init, 0);
})();
