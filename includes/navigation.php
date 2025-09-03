<?php

include_once __DIR__ . '/nav_config.php';

// Protección y render condicional: iniciar sesión segura y obtener usuario actual
require_once __DIR__ . '/../backend/session.php';
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
$usuario = function_exists('usuarioActual') ? usuarioActual() : null;

$currentPage = basename($_SERVER['PHP_SELF'], '.php');


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

  <div class="user-area" style="padding:12px; color:#fff; display:flex; gap:8px; align-items:center;">
    <?php if ($usuario): ?>
      <span id="usuario-nombre" class="requires-auth"><?= htmlspecialchars($usuario['name'] ?? $usuario['nombre'] ?? $usuario['email'] ?? '') ?></span>
      <button id="btnCerrarSesion" class="requires-auth" style="background:transparent; border:1px solid #fff; color:#fff; padding:6px 8px; border-radius:4px;">Cerrar sesión</button>
    <?php else: ?>
      <a href="logear.php" id="link-iniciar-sesion" style="color:#fff; text-decoration:none;">Iniciar sesión</a>
    <?php endif; ?>
  </div>

  <nav>
    <ul class="<?php echo $menuListClass; ?>">
      <li><a href="index.php" <?php echo ($currentPage == 'index') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Inicio</a></li>
      <li><a href="fisico.php" <?php echo ($currentPage == 'fisico') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Modo Fisico</a></li>
      <?php if ($usuario): ?>
        <li><a href="digital.php" class="requires-auth" <?php echo ($currentPage == 'digital') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Modo Digital</a></li>
      <?php endif; ?>

      <?php // Enlace al panel de administración, visible solo para administradores ?>
      <?php if ($usuario && !empty($usuario['role']) && $usuario['role'] === 'admin'): ?>
        <li><a href="admin.php" class="requires-auth" <?php echo ($currentPage == 'admin') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Panel Admin</a></li>
      <?php endif; ?>

      <li><a href="https://drive.google.com/file/d/138qY_aZfQ-RXYDA0j6HshSk-_1mmJIrG/view" target="_blank" rel="noopener" role="menuitem" tabindex="0">Reglas</a></li>
      <li><a href="configuracion.php" <?php echo ($currentPage == 'configuracion') ? 'aria-current="page"' : ''; ?> role="menuitem" tabindex="0">Configuración</a></li>
    </ul>
  </nav>
</aside>

<!-- Overlay para cerrar el menú cuando se hace clic fuera -->
<div id="<?php echo $overlayId; ?>" class="nav-overlay" aria-hidden="true"></div>