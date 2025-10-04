<?php
// Incluir el archivo que calcula la puntuación
require_once 'php/procesamiento/puntosFisico.php';

// Si el formulario fue enviado, procesar y devolver JSON
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    $resultado = procesarSolicitudPuntuacion();
    
    if ($resultado['success']) {
        echo json_encode([
            'exito' => true,
            'mensaje' => $resultado['message'],
            'scoreReport' => $resultado['data']
        ]);
    } else {
        echo json_encode([
            'exito' => false,
            'mensaje' => $resultado['message']
        ]);
    }
    exit;
}

// Configuración de la página
$pageTitle = "Registro del Tablero - Draftosaurus";
$specificCSS = "fisicoPag.css";
$specificJS = "fisicoPag.js";

include 'php/includes/head.php';
include 'php/includes/navigation.php';
?>

<main id="mainContent" data-player-id="1">
  <section class="tracking-section container py-4">
    <h1>Registra lo que pasa en tu tablero:</h1>

    <form id="form-recintos" class="row g-3" method="POST">
      <input type="hidden" name="action" value="calcular-puntuacion">

      <div class="col-12 col-md-6">
        <label for="bosque-semejanza" class="form-label">Bosque de la Semejanza</label>
        <input type="number" class="form-control" id="bosque-semejanza" 
               name="bosque-semejanza" min="0" max="6" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="prado-diferencia" class="form-label">Prado de la Diferencia</label>
        <input type="number" class="form-control" id="prado-diferencia" 
               name="prado-diferencia" min="0" max="6" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="trio-frondoso" class="form-label">El Trío Frondoso</label>
        <input type="number" class="form-control" id="trio-frondoso" 
               name="trio-frondoso" min="0" max="3" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="pradera-amor" class="form-label">La Pradera del Amor</label>
        <input type="number" class="form-control" id="pradera-amor" 
               name="pradera-amor" min="0" max="6" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="isla-solitaria" class="form-label">La Isla Solitaria</label>
        <input type="number" class="form-control" id="isla-solitaria" 
               name="isla-solitaria" min="0" max="1" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="rey-selva" class="form-label">El Rey de la Selva</label>
        <input type="number" class="form-control" id="rey-selva" 
               name="rey-selva" min="0" max="1" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="dinos-rio" class="form-label">Dinosaurios en el Río</label>
        <input type="number" class="form-control" id="dinos-rio" 
               name="dinos-rio" min="0" max="7" value="0">
      </div>

      <div class="col-12 d-flex gap-2 mt-3">
        <button type="submit" class="btn btn-primary" id="btn-submit">
          <img src="Recursos/img/btnCalcular.png" width="150px">
        </button>
        <button type="button" class="btn btn-secondary" id="btn-reset">
          <img src="Recursos/img/btnLimpiar.png" width="150px">
        </button>
      </div>

      <div class="col-12 mt-2">
        <div id="total-dinos-display" class="small text-muted">
          Total de dinosaurios: <strong id="total-dinos-valor">0</strong>
        </div>
      </div>

      <input type="hidden" name="total-dinos" id="total-dinos" value="0">
    </form>

    <hr class="my-4">
    <div id="resultado-form" style="display:none;" class="alert alert-info"></div>
  </section>
</main>

<?php include 'php/includes/footer.php'; ?>