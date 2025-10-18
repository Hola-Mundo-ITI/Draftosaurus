<?php
session_start();
require_once 'php/idioma/idiomas.php';
require_once 'php/procesamiento/puntosFisico.php';
$idiomaActual = obtenerIdioma();

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

$pageTitle = t('registra_tablero') . " - Draftosaurus";
$specificCSS = "utilidades/responsive.css";
$specificCSS = "fisicoPag.css";
$specificJS = "fisicoPag.js";

include 'php/includes/head.php';
include 'php/includes/navigation.php';
?>

<main id="mainContent" data-player-id="1">
  <section class="tracking-section container py-4">
    <h1><?php echo t('registra_tablero'); ?></h1>

    <form id="form-recintos" class="row g-3" method="POST">
      <input type="hidden" name="action" value="calcular-puntuacion">

      <div class="col-12 col-md-6">
        <label for="bosque-semejanza" class="form-label"><?php echo t('bosque_semejanza'); ?></label>
        <input type="number" class="form-control" id="bosque-semejanza" 
               name="bosque-semejanza" min="0" max="6" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="prado-diferencia" class="form-label"><?php echo t('prado_diferencia'); ?></label>
        <input type="number" class="form-control" id="prado-diferencia" 
               name="prado-diferencia" min="0" max="6" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="trio-frondoso" class="form-label"><?php echo t('trio_frondoso'); ?></label>
        <input type="number" class="form-control" id="trio-frondoso" 
               name="trio-frondoso" min="0" max="3" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="pradera-amor" class="form-label"><?php echo t('pradera_amor'); ?></label>
        <input type="number" class="form-control" id="pradera-amor" 
               name="pradera-amor" min="0" max="6" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="isla-solitaria" class="form-label"><?php echo t('isla_solitaria'); ?></label>
        <input type="number" class="form-control" id="isla-solitaria" 
               name="isla-solitaria" min="0" max="1" value="0">
      </div>

      <div class="col-12 col-md-6">
        <label for="rey-selva" class="form-label"><?php echo t('rey_selva'); ?></label>
        <input type="number" class="form-control" id="rey-selva" 
               name="rey-selva" min="0" max="1" value="0">
      </div>
      <div class="col-12 col-md-6 full-width-item">
        <label for="dinos-rio" class="form-label"><?php echo t('dinos_rio'); ?></label>
        <input type="number" class="form-control" id="dinos-rio" 
              name="dinos-rio" min="0" max="7" value="0"> 
        </div>
      <div class="col-12 d-flex gap-2 mt-3">
        <button type="submit" class="btn-primary" id="btn-submit">
          <?php if ($idiomaActual === 'en'): ?>
            <img src="Recursos/img/calculate.png" width="150px" alt="<?php echo t('calcular'); ?>">
          <?php else: ?>
            <img src="Recursos/img/btnCalcular.png" width="150px" alt="<?php echo t('calcular'); ?>">
          <?php endif; ?>
        </button>
        <button type="button" class="btn-secondary" id="btn-reset">
          <?php if ($idiomaActual === 'en'): ?>
            <img src="Recursos/img/clear.png" width="150px" alt="<?php echo t('limpiar'); ?>">
          <?php else: ?>
            <img src="Recursos/img/btnLimpiar.png" width="150px" alt="<?php echo t('limpiar'); ?>">
          <?php endif; ?>
        </button>
      </div>
      <div class="col-12 mt-2">
        <div id="total-dinos-display" class="small text-muted">
          <?php echo t('total_dinos'); ?> <strong id="total-dinos-valor">0</strong>
        </div>
      </div>

      <input type="hidden" name="total-dinos" id="total-dinos" value="0">
    </form>
    <div id="resultado-form" style="display:none;" class="alert alert-info"></div>
  </section>
</main>
<?php include 'php/includes/footer.php'; ?>