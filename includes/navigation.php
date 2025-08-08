<?php
// Navegación común para todas las páginas
$currentPage = basename($_SERVER['PHP_SELF'], '.php');
?>

<header>
  <button id="<?php echo isset($menuButtonId) ? $menuButtonId : 'abrirMenu'; ?>" 
          class="<?php echo isset($menuButtonClass) ? $menuButtonClass : 'boton-menu'; ?>" 
          aria-label="Abrir menú de navegación">
    ☰
  </button>
</header>

<aside id="<?php echo isset($menuId) ? $menuId : 'menuLateral'; ?>" 
       class="<?php echo isset($menuClass) ? $menuClass : 'offcanvas-menu'; ?>" 
       role="navigation" 
       aria-label="Menú principal">
  <nav>
    <ul class="<?php echo isset($menuListClass) ? $menuListClass : 'menu-list'; ?>">
      <li>
        <a href="index.php" <?php echo ($currentPage == 'index') ? 'aria-current="page"' : ''; ?>>
          Inicio
        </a>
      </li>
      <li>
        <a href="fisico.php" <?php echo ($currentPage == 'fisico') ? 'aria-current="page"' : ''; ?>>
          Seguimiento
        </a>
      </li>
      <li>
        <a href="digital.php" <?php echo ($currentPage == 'digital') ? 'aria-current="page"' : ''; ?>>
          Modo Digital
        </a>
      </li>
      <li>
        <a href="https://drive.google.com/file/d/138qY_aZfQ-RXYDA0j6HshSk-_1mmJIrG/view" 
           target="_blank" 
           rel="noopener">
          Reglas
        </a>
      </li>
      <li>
        <a href="configuracion.php" <?php echo ($currentPage == 'configuracion') ? 'aria-current="page"' : ''; ?>>
          Configuración
        </a>
      </li>
    </ul>
  </nav>
</aside>