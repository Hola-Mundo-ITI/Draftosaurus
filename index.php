<?php
session_start();
require_once 'php/idioma/idiomas.php';

$pageTitle = t('menu_inicio') . " - Draftosaurus";
$pageDescription = "Pagina de inicio de Draftosaurus - Elige tu modo de juego favorito";
$specificCSS = "indexPag.css";
$specificJS = "indexPag.js";

require_once 'php/auth/Sesion.php';
$sesion = new Sesion();
$verificacion = $sesion->verificarSesion();
$sesionActiva = $verificacion['activa'];
$idiomaActual = obtenerIdioma();

include 'php/includes/head.php';
?>
<body class="bg-light">
  <?php include 'php/includes/navigation.php'; ?>

  <main id="mainContent" class="container text-center main-content" role="main">
    <section class="hero-section">
      <h1 class="mb-3"><?php echo t('bienvenido'); ?></h1>
      <img src="Recursos/img/logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="img-fluid logo-image mb-4" />
      <p class="lead question"><?php echo t('como_jugar'); ?></p>
      <div class="button-group" role="group" aria-label="Opciones de modo de juego">
        <?php if ($sesionActiva): ?>
          <a href="fisico.php" class="btn-image-button" role="button">
            <?php if ($idiomaActual === 'en'): ?>
              <img src="Recursos/img/PhysicalMode.png" alt="<?php echo t('modo_fisico'); ?>" class="button-image" width="150px">
            <?php else: ?>
              <img src="Recursos/img/botonModoFisico.png" alt="<?php echo t('modo_fisico'); ?>" class="button-image" width="150px">
            <?php endif; ?>
          </a>
          <a href="seleccionarJugador.php" class="btn-image-button" role="button">
            <?php if ($idiomaActual === 'en'): ?>
              <img src="Recursos/img/DigitalMode.png" alt="<?php echo t('modo_digital'); ?>" class="button-image" >
            <?php else: ?>
              <img src="Recursos/img/botonMododDigital.png" alt="<?php echo t('modo_digital'); ?>" class="button-image" >
            <?php endif; ?>
          </a>
        <?php else: ?>
          <a href="sesion.php" class="btn-image-button" role="button">
            <?php if ($idiomaActual === 'en'): ?>
              <img src="Recursos/img/PhysicalMode.png" alt="<?php echo t('modo_fisico'); ?>" class="button-image" width="150px">
            <?php else: ?>
              <img src="Recursos/img/botonModoFisico.png" alt="<?php echo t('modo_fisico'); ?>" class="button-image" width="150px">
            <?php endif; ?>
          </a>
          <a href="sesion.php" class="btn-image-button" role="button">
            <?php if ($idiomaActual === 'en'): ?>
              <img src="Recursos/img/DigitalMode.png" alt="<?php echo t('modo_digital'); ?>" class="button-image" >
            <?php else: ?>
              <img src="Recursos/img/botonMododDigital.png" alt="<?php echo t('modo_digital'); ?>" class="button-image" >
            <?php endif; ?>
          </a>
        <?php endif; ?>
      </div>
    </section>
  </main>

  <?php include 'php/includes/footer.php'; ?>
</body>
</html>