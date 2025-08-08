<?php
$pageTitle = "Inicio - Draftosaurus";
$pageDescription = "Página de inicio de Draftosaurus - Elige tu modo de juego favorito";
$specificCSS = "inicioPage.css";
$specificJS = "inicioPage.js";

include 'includes/head.php';
?>

<body class="bg-light">
  <?php include 'includes/navigation.php'; ?>
  
  <main class="container text-center main-content" role="main">
    <section class="hero-section">
      <h1 class="mb-3">Bienvenido a</h1>
      <img src="Recursos/img/logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="img-fluid logo-image mb-4" />
      <p class="lead question">¿Cómo querés jugar?</p>
      <div class="d-grid gap-3 button-group mx-auto" role="group" aria-label="Opciones de modo de juego">
        <a href="fisico.php" class="btn btn-dark" role="button">Modo Físico</a>
        <a href="digital.php" class="btn btn-warning text-dark" role="button">Modo Digital</a>
      </div>
    </section>
  </main>
  
  <footer class="site-footer mt-5" role="contentinfo">
    <p>Prototipo visual – 2025</p>
  </footer>
  
<?php include 'includes/footer.php'; ?>