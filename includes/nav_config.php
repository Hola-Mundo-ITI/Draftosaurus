<?php
// Configuración centralizada del sistema de navegación
// Mantener consistencia entre templates y scripts
if (!defined('NAV_VERSION')) define('NAV_VERSION', '1.0');

if (!defined('NAV_MENU_TOGGLE_ID')) define('NAV_MENU_TOGGLE_ID', 'menuToggle');
if (!defined('NAV_MENU_TOGGLE_CLASS')) define('NAV_MENU_TOGGLE_CLASS', 'menu-toggle');

if (!defined('NAV_MENU_ID')) define('NAV_MENU_ID', 'mainMenu');
if (!defined('NAV_MENU_CLASS')) define('NAV_MENU_CLASS', 'offcanvas-menu');
if (!defined('NAV_MENU_LIST_CLASS')) define('NAV_MENU_LIST_CLASS', 'menu-list');

if (!defined('NAV_OVERLAY_ID')) define('NAV_OVERLAY_ID', 'menuOverlay');

// Punto de corte (px) para comportamiento móvil (coincide con CSS)
if (!defined('NAV_MOBILE_BREAKPOINT')) define('NAV_MOBILE_BREAKPOINT', 768);

?>