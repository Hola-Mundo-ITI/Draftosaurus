<?php
$pageTitle = "Seleccionar Bots - Draftosaurus";
$pageDescription = "Elige con cuántos bots querés jugar - Draftosaurus";
$specificCSS = "digitalPage.css";
$specificJS = null;

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>

  <main id="mainContent" class="container text-center" role="main" style="padding-top:40px;">
    <section class="prepantalla-seleccion">
      <h1 class="titulo">Modo Digital</h1>
      <p class="lead">Seleccioná con cuántos bots querés jugar</p>

      <div class="caja-seleccion-bots" style="display:flex;gap:18px;justify-content:center;margin-top:24px;flex-wrap:wrap;">
        <a href="digital.php?bots=2" class="boton-opcion" role="button" style="text-decoration:none;">
          <div class="boton-seleccion" style="background:#6b4f28;color:#fffce2;padding:18px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.15);font-family:'Passero One',sans-serif;font-size:18px;">
            2 Bots
          </div>
        </a>

        <a href="digital.php?bots=3" class="boton-opcion" role="button" style="text-decoration:none;">
          <div class="boton-seleccion" style="background:#4CAF50;color:#fff;padding:18px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.15);font-family:'Passero One',sans-serif;font-size:18px;">
            3 Bots
          </div>
        </a>

        <a href="digital.php?bots=4" class="boton-opcion" role="button" style="text-decoration:none;">
          <div class="boton-seleccion" style="background:#FF9800;color:#fff;padding:18px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.15);font-family:'Passero One',sans-serif;font-size:18px;">
            4 Bots
          </div>
        </a>
      </div>

      <p style="margin-top:18px;color:#3b2d15;">Los bots jugarán automáticamente, cada turno tendrá un retraso breve para simular pensamiento.</p>

    </section>
  </main>

<?php include 'includes/footer.php'; ?>