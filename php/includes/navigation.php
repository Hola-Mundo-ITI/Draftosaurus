<?php
// Obtener la página actual
$currentPage = basename($_SERVER['PHP_SELF'], '.php');

if (!isset($specificCSS)) {
    $specificCSS = "navigation.css";
}
if (!isset($specificJS)) {
    $specificJS = "navigation.js";
}
?>

<header>
  <button id="menuToggle" class="menu-toggle" aria-label="Abrir menú">
    ☰
  </button>
</header>

<aside id="mainMenu" class="offcanvas-menu">
  <div class="user-area">
    <a href="sesion.php" id="link-iniciar-sesion">Iniciar sesión</a>
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
          Modo Físico
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
          Configuración
        </a>
      </li>
    </ul>
  </nav>
</aside>

<div id="menuOverlay" class="nav-overlay"></div>