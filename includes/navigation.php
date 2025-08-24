<?php
// Navegación común para todas las páginas
include_once __DIR__ . '/nav_config.php';
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

// Compatibilidad: aceptar múltiples nombres de variable que pueden definir las páginas
// Prioridad: variables definidas por la página > constantes de nav_config.php > valores por defecto
$menuToggleId = 
    (isset($menuButtonId) ? $menuButtonId : (isset($menuToggleId) ? $menuToggleId : (defined('NAV_MENU_TOGGLE_ID') ? NAV_MENU_TOGGLE_ID : 'menuToggle')));
$menuToggleClass = 
    (isset($menuButtonClass) ? $menuButtonClass : (isset($menuToggleClass) ? $menuToggleClass : (defined('NAV_MENU_TOGGLE_CLASS') ? NAV_MENU_TOGGLE_CLASS : 'menu-toggle')));

$menuId = 
    (isset($menuId) ? $menuId : (defined('NAV_MENU_ID') ? NAV_MENU_ID : 'mainMenu'));
$menuClass = 
    (isset($menuClass) ? $menuClass : (defined('NAV_MENU_CLASS') ? NAV_MENU_CLASS : 'offcanvas-menu'));
$menuListClass = 
    (isset($menuListClass) ? $menuListClass : (defined('NAV_MENU_LIST_CLASS') ? NAV_MENU_LIST_CLASS : 'menu-list'));
$overlayId = 
    (isset($overlayId) ? $overlayId : (defined('NAV_OVERLAY_ID') ? NAV_OVERLAY_ID : 'menuOverlay'));
?>

<header>
  <button id="<?php echo $menuToggleId; ?>"
          class="<?php echo $menuToggleClass; ?>"
          aria-label="Abrir menú de navegación"
          aria-controls="<?php echo $menuId; ?>"
          aria-expanded="false"
          style="background-color: #552A0A; color: #FFFFFF; border: none;">
    ☰
  </button>
</header>

<aside id="<?php echo $menuId; ?>" 
       class="<?php echo $menuClass; ?>" 
       role="navigation" 
       aria-label="Menú principal" 
       aria-hidden="false" 
       style="background-color: #552A0A;">
  <nav>
    <ul class="<?php echo $menuListClass; ?>">
      <li><a href="index.php" <?php echo ($currentPage == 'index') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Inicio</a></li>
      <li><a href="fisico.php" <?php echo ($currentPage == 'fisico') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Seguimiento</a></li>
      <li><a href="digital.php" <?php echo ($currentPage == 'digital') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Modo Digital</a></li>
      <li><a href="https://drive.google.com/file/d/138qY_aZfQ-RXYDA0j6HshSk-_1mmJIrG/view" target="_blank" rel="noopener" role="menuitem" tabindex="0">Reglas</a></li>
      <li><a href="configuracion.php" <?php echo ($currentPage == 'configuracion') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Configuración</a></li>
    </ul>
  </nav>
</aside>

<!-- Overlay para cerrar el menú cuando se hace clic fuera -->
<div id="<?php echo $overlayId; ?>" class="nav-overlay" aria-hidden="true"></div>