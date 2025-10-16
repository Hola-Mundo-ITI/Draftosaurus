<?php
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

if (!isset($specificCSS)) {
    $specificCSS = "utilidades/navigation.css";
}
if (!isset($specificJS)) {
    $specificJS = "utilidades/navigation.js";
}
if (!function_exists('traducir')) {
    require_once __DIR__ . '/../idioma/idiomas.php';
}

require_once __DIR__ . '/../auth/Sesion.php';
$sesion = new Sesion();
$verificacion = $sesion->verificarSesion();
$sesionActiva = $verificacion['activa'];
$nombreUsuario = $sesionActiva ? $verificacion['usuario']['nombre'] : '';
?>

<header>
  <button id="menuToggle" class="menu-toggle" aria-label="Abrir menu">
    ☰
  </button>
</header>

<aside id="mainMenu" class="offcanvas-menu">
  <div class="user-area">
    <?php if ($sesionActiva): ?>
      <div class="user-info">
        <p class="user-name"><?php echo htmlspecialchars($nombreUsuario); ?></p>
        <button id="btn-cerrar-sesion" class="btn-logout"><?php echo t('menu_cerrar_sesion'); ?></button>
      </div>
    <?php else: ?>
      <a href="sesion.php" id="link-iniciar-sesion"><?php echo t('iniciar_sesion'); ?></a>
    <?php endif; ?>
  </div>

  <nav>
    <ul class="menu-list">
      <li>
        <a href="index.php" <?php if($currentPage == 'index') echo 'class="active"'; ?>>
          <?php echo t('menu_inicio'); ?>
        </a>
      </li>
      
      <li>
        <?php if ($sesionActiva): ?>
          <a href="fisico.php" <?php if($currentPage == 'fisico') echo 'class="active"'; ?>>
            <?php echo t('menu_fisica'); ?>
          </a>
        <?php else: ?>
          <a href="sesion.php">
            <?php echo t('menu_fisica'); ?>
          </a>
        <?php endif; ?>
      </li>
      
      <li>
        <?php if ($sesionActiva): ?>
          <a href="digital.php" <?php if($currentPage == 'seleccionarBots') echo 'class="active"'; ?>>
            <?php echo t('menu_digital'); ?>
          </a>
        <?php else: ?>
          <a href="sesion.php">
            <?php echo t('menu_digital'); ?>
          </a>
        <?php endif; ?>
      </li>
      
      <li>
        <a href="admin.php" <?php if($currentPage == 'admin') echo 'class="active"'; ?>>
          Panel Admin
        </a>
      </li>
      
      <li>
        <a href="https://drive.google.com/file/d/138qY_aZfQ-RXYDA0j6HshSk-_1mmJIrG/view" target="_blank">
          Reglas
        </a>
      </li>
      
      <li>
        <a href="configuracion.php" <?php if($currentPage == 'configuracion') echo 'class="active"'; ?>>
          <?php echo t('menu_configuracion'); ?>
        </a>
      </li>
    </ul>
  </nav>
</aside>

<div id="menuOverlay" class="nav-overlay"></div>