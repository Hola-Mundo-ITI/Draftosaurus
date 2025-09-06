<?php
/*
 * fisico.php - Página principal del formulario físico
 * El procesamiento POST ahora está modularizado en calcularFisico.php
 */
require_once __DIR__ . '/backend/session.php';
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
if (function_exists('exigirLogin')) exigirLogin();

// Calculadora modularizada
require_once __DIR__ . '/backend/calcularFisico.php';

// Procesamiento POST simplificado 
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_POST['action']) && $_POST['action'] === 'calcular-puntuacion' || strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false)) {
    header('Content-Type: application/json; charset=utf-8');
    
    $resultado = procesarSolicitudPuntuacion();
    
    if ($resultado['success']) {
        echo json_encode([
            'exito' => true, 
            'mensaje' => $resultado['message'], 
            'scoreReport' => $resultado['data']
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(400);
        echo json_encode([
            'exito' => false, 
            'mensaje' => $resultado['message']
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

$pageTitle = "Registro del Tablero - Draftosaurus";
$pageDescription = "Registro del Tablero Físico - Lleva el seguimiento de tu partida de Draftosaurus";
$specificCSS = "fisicoPage.css";

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>
  
  <main id="mainContent" role="main" data-player-id="1">
    <section class="tracking-section container py-4">
      <h1>Registra lo que pasa en tu tablero:</h1>

      <!-- Formulario con el diseño de la imagen -->
      <form id="form-recintos" class="row g-3" method="POST">
        <input type="hidden" name="action" value="calcular-puntuacion">

        <div class="col-12 col-md-6">
          <label for="bosque-semejanza" class="form-label">Bosque de la Semejanza</label>
          <input type="number" class="form-control" id="bosque-semejanza" name="bosque-semejanza" 
                 min="0" max="6" value="0" placeholder="Bosque de la Semejanza">
        </div>

        <div class="col-12 col-md-6">
          <label for="prado-diferencia" class="form-label">Prado de la Diferencia</label>
          <input type="number" class="form-control" id="prado-diferencia" name="prado-diferencia" 
                 min="0" max="6" value="0" placeholder="Prado de la Diferencia">
        </div>

        <div class="col-12 col-md-6">
          <label for="trio-frondoso" class="form-label">El Trío Frondoso</label>
          <input type="number" class="form-control" id="trio-frondoso" name="trio-frondoso" 
                 min="0" max="3" value="0" placeholder="El Trío Frondoso">
        </div>

        <div class="col-12 col-md-6">
          <label for="pradera-amor" class="form-label">La Pradera del Amor</label>
          <input type="number" class="form-control" id="pradera-amor" name="pradera-amor" 
                 min="0" max="6" value="0" placeholder="La Pradera del Amor">
        </div>

        <div class="col-12 col-md-6">
          <label for="isla-solitaria" class="form-label">La Isla Solitaria</label>
          <input type="number" class="form-control" id="isla-solitaria" name="isla-solitaria" 
                 min="0" max="1" value="0" placeholder="La Isla Solitaria">
        </div>

        <div class="col-12 col-md-6">
          <label for="rey-selva" class="form-label">El Rey de la Selva</label>
          <input type="number" class="form-control" id="rey-selva" name="rey-selva" 
                 min="0" max="1" value="0" placeholder="El Rey de la Selva">
        </div>

        <div class="col-12 col-md-6">
          <label for="dinos-rio" class="form-label">Dinosaurios en el Río</label>
          <input type="number" class="form-control" id="dinos-rio" name="dinos-rio" 
                 min="0" max="7" value="0" placeholder="Dinosaurios en el Río">
        </div>

        <div class="col-12 d-flex gap-2 mt-3">
          <button type="submit" class="btn btn-primary" id="btn-submit">
            <img src="Recursos/img/btnCalcular.png" width="150px">
          </button>
          <button type="button" class="btn btn-secondary" id="btn-reset">
            <img src="Recursos/img/btnLimpiar.png" width="150px">
          </button>
        </div>

        <!-- Total de dinosaurios colocados (oculto) -->
        <div class="col-12 mt-2">
          <div id="total-dinos-display" class="small text-muted">
            Total de dinosaurios colocados: <strong id="total-dinos-valor">0</strong>
          </div>
        </div>

        <!-- campo oculto con el total para envío al servidor -->
        <input type="hidden" name="total-dinos" id="total-dinos" value="0">

      </form>

      <hr class="my-4" />

      <div id="resultado-form" style="display:none;" class="alert alert-info" role="status" aria-live="polite"></div>

    </section>
  </main>
  <script src="JS/fisicoProcesamiento.js"></script>
<?php include 'includes/footer.php'; ?>
</body>
</html>