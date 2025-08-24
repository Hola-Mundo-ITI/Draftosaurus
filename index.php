<?php
$pageTitle = "Inicio - Draftosaurus";
$pageDescription = "Página de inicio de Draftosaurus - Elige tu modo de juego favorito";
$specificCSS = "inicioPage.css";
$specificJS = "inicioPage.js";
include 'includes/head.php';
?>

<body class="bg-light">
  <?php include 'includes/navigation.php'; ?>

  <main id="mainContent" class="container text-center main-content" role="main">
    <section class="hero-section">
      <h1 class="mb-3">Bienvenido a</h1>
      <img src="Recursos/img/logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="img-fluid logo-image mb-4" />
      <p class="lead question">¿Cómo querés jugar?</p>
      <div class="button-group" role="group" aria-label="Opciones de modo de juego">
        <a href="fisico.php" class="btn-image-button" role="button">
          <img src="Recursos/img/botonModoFisico.png" alt="Modo Físico" class="button-image" width="150px" height="50px">
        </a>
        <a href="digital.php" class="btn-image-button" role="button">
          <img src="Recursos/img/botonMododDigital.png" alt="Modo Digital" class="button-image" width="150px" height="50px">
        </a>
      </div>
    </section>
  </main>
  <?php include 'includes/footer.php'; ?>