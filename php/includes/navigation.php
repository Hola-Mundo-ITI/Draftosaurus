<?php
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

if (!isset($specificCSS)) {
    $specificCSS = "utilidades/navigation.css";
}
if (!isset($specificJS)) {
    $specificJS = "utilidades/navigation.js";
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$sesionActiva = isset($_SESSION['usuario_id']);
$nombreUsuario = $sesionActiva ? $_SESSION['usuario_nombre'] : '';
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
        <p class="user-name">s<?php echo htmlspecialchars($nombreUsuario); ?></p>
        <button id="btn-cerrar-sesion" class="btn-logout">Cerrar sesion</button>
      </div>
    <?php else: ?>
      <a href="sesion.php" id="link-iniciar-sesion">Iniciar sesion</a>
    <?php endif; ?>
  </div>

  <nav>
    <ul class="menu-list">
      <li>
        <a href="index.php" <?php if($currentPage == 'index') echo 'class="active"'; ?>>
          Inicio
        </a>
      </li>
      
      <li>
        <a href="fisico.php" <?php if($currentPage == 'fisico') echo 'class="active"'; ?>>
          Modo Fisico
        </a>
      </li>
      
      <li>
        <a href="digital.php" <?php if($currentPage == 'seleccionarBots') echo 'class="active"'; ?>>
          Modo Digital
        </a>
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
          Configuracion
        </a>
      </li>
    </ul>
  </nav>
</aside>

<div id="menuOverlay" class="nav-overlay"></div>