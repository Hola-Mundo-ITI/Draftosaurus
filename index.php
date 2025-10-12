<?php
$pageTitle = "Inicio - Draftosaurus";
$pageDescription = "Página de inicio de Draftosaurus - Elige tu modo de juego favorito";
$specificCSS = "utilidades/responsive.css";
$specificCSS = "indexPag.css";
$specificJS = "indexPag.js";

require_once 'php/auth/Sesion.php';
$sesion = new Sesion();
$verificacion = $sesion->verificarSesion();
$sesionActiva = $verificacion['activa'];

include 'php/includes/head.php';
?>
<body class="bg-light">
  <?php include 'php/includes/navigation.php'; ?>

  <main id="mainContent" class="container text-center main-content" role="main">
    <section class="hero-section">
      <h1 class="mb-3">Bienvenido a</h1>
      <img src="Recursos/img/logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="img-fluid logo-image mb-4" />
      <p class="lead question">¿Cómo querés jugar?</p>
      <div class="button-group" role="group" aria-label="Opciones de modo de juego">
        <?php if ($sesionActiva): ?>
          <a href="fisico.php" class="btn-image-button" role="button">
            <img src="Recursos/img/botonModoFisico.png" alt="Modo Físico" class="button-image" width="150px">
          </a>
          <a href="digital.php" class="btn-image-button" role="button">
            <img src="Recursos/img/botonMododDigital.png" alt="Modo Digital" class="button-image" >
          </a>
        <?php else: ?>
          <a href="sesion.php" class="btn-image-button" role="button">
            <img src="Recursos/img/botonModoFisico.png" alt="Modo Físico" class="button-image" width="150px">
          </a>
          <a href="sesion.php" class="btn-image-button" role="button">
            <img src="Recursos/img/botonMododDigital.png" alt="Modo Digital" class="button-image" >
          </a>
        <?php endif; ?>
      </div>
    </section>
  </main>

  <?php include 'php/includes/footer.php'; ?>