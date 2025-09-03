<?php
/*
 * Clase CalculadorPuntuacionLocal:
 * Implementa la lógica de cálculo de puntuaciones integrada directamente en fisico.php
 * para evitar dependencias externas del backend y problemas de conectividad JSON.
 */
require_once __DIR__ . '/backend/session.php';
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
if (function_exists('exigirLogin')) exigirLogin();

// Calculadora modularizada
require_once __DIR__ . '/backend/calcularFisico.php';

// Procesamiento del POST para cálculo de puntuación dentro del mismo archivo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (isset($_POST['action']) && $_POST['action'] === 'calcular-puntuacion' || strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false)) {
    header('Content-Type: application/json; charset=utf-8');

    try {
        // Soportar tanto FormData (POST tradicional) como JSON crudo
        $inputFullBoard = null;
        $playerId = 1;
        $allPlayerBoards = [];

        if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
            $raw = file_get_contents('php://input');
            $data = json_decode($raw, true);
            if (!is_array($data)) throw new Exception('JSON de entrada inválido.');
            $fullBoard = $data['fullBoard'] ?? $data['board'] ?? null;
            $playerId = isset($data['playerId']) ? (int)$data['playerId'] : $playerId;
            $allPlayerBoards = $data['allPlayerBoards'] ?? ($data['allBoards'] ?? []);
            if ($fullBoard === null) throw new Exception('fullBoard ausente en payload JSON.');
            // Normalizar a objeto
            $inputFullBoard = (object)$fullBoard;
        } else {
            // Si viene por FormData (desde el formulario físico), reconstruir fullBoard según conteos
            $campos = ['bosque-semejanza','trio-frondoso','prado-diferencia','pradera-amor','isla-solitaria','rey-selva','dinos-rio'];
            $especies = ['dino1','dino2','dino3','dino4','dino5','dino6'];
            $fullBoard = [];
            foreach ($campos as $campo) {
                $count = isset($_POST[$campo]) ? max(0, min(intval($_POST[$campo]), 100)) : 0;
                $arr = [];
                // Para FormData sólo tenemos la cantidad; deducimos una distribución de especies
                if ($count > 0) {
                    if ($campo === 'bosque-semejanza') {
                        $tipoUnico = $especies[0];
                        for ($i = 1; $i <= $count; $i++) {
                            $arr[] = (object)['type' => $tipoUnico, 'slot' => $i, 'imagen' => "Recursos/img/{$tipoUnico}.png", 'playerPlaced' => $playerId];
                        }
                    } elseif ($campo === 'prado-diferencia') {
                        for ($i = 1; $i <= $count; $i++) {
                            $tipo = $especies[($i - 1) % count($especies)];
                            $arr[] = (object)['type' => $tipo, 'slot' => $i, 'imagen' => "Recursos/img/{$tipo}.png", 'playerPlaced' => $playerId];
                        }
                    } else {
                        for ($i = 1; $i <= $count; $i++) {
                            $tipo = $especies[($i - 1) % count($especies)];
                            $arr[] = (object)['type' => $tipo, 'slot' => $i, 'imagen' => "Recursos/img/{$tipo}.png", 'playerPlaced' => $playerId];
                        }
                    }
                }
                $fullBoard[$campo] = $arr;
            }
            $inputFullBoard = (object)$fullBoard;
            $allPlayerBoards = [$playerId => $inputFullBoard];
        }

        // Instanciar calculadora local externa y generar reporte
        $sc = new CalculadorPuntuacionLocal();
        // Asegurar tipos: la clase espera object para fullBoard y array para allPlayerBoards
        $fbObj = is_object($inputFullBoard) ? $inputFullBoard : (object)$inputFullBoard;
        // Normalizar allPlayerBoards: convertir subtableros a objetos si vienen como arrays
        $normalizedAll = [];
        foreach ($allPlayerBoards as $k => $b) {
            $normalizedAll[$k] = is_object($b) ? $b : (object)$b;
        }
        $report = $sc->generarInformePuntuacion($fbObj, $playerId, $normalizedAll);

        echo json_encode(['exito' => true, 'mensaje' => 'Puntuación calculada exitosamente.', 'scoreReport' => $report], JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Throwable $e) {
        error_log('[CalculadorPuntuacionLocal] Error: ' . $e->getMessage());
        http_response_code(400);
        echo json_encode(['exito' => false, 'mensaje' => 'Error al calcular la puntuación: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
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
          <button type="submit" class="btn btn-primary" id="btn-submit"><img src="Recursos/img/btnCalcular.png" width="150px"></button>
          <button type="button" class="btn btn-secondary" id="btn-reset"><img src="Recursos/img/btnLimpiar.png" width="150px"></button>
        </div>

        <!-- Total de dinosaurios colocados (oculto pero funcional) -->
        <div class="col-12 mt-2">
          <div id="total-dinos-display" class="small text-muted">Total de dinosaurios colocados: <strong id="total-dinos-valor">0</strong></div>
        </div>

        <!-- campo oculto con el total para envío al servidor -->
        <input type="hidden" name="total-dinos" id="total-dinos" value="0">

      </form>

      <hr class="my-4" />

      <div id="resultado-form" style="display:none;" class="alert alert-info" role="status" aria-live="polite"></div>

    </section>
  </main>
  
<?php include 'includes/footer.php'; ?>

<script>
  /*
   * Sistema de manejo de formulario autoprocesado con validaciones frontend
   * y comunicación simplificada al mismo archivo PHP para evitar problemas de backend externo.
   */
  (function(){
    const form = document.getElementById('form-recintos');
    const resultado = document.getElementById('resultado-form');
    const btnReset = document.getElementById('btn-reset');
    const playerId = parseInt(document.querySelector('main#mainContent')?.dataset.playerId || '1', 10);

    // Contador y actualización en tiempo real de todos los inputs numéricos del formulario
    const totalDisplayEl = document.getElementById('total-dinos-valor');
    const totalHiddenInput = document.getElementById('total-dinos');
    const numberInputs = Array.from(document.querySelectorAll('#form-recintos input[type=number]'));

    function actualizarTotal() {
      const total = numberInputs.reduce((acc, inp) => {
        const v = Number(inp.value || 0);
        return acc + (Number.isFinite(v) ? v : 0);
      }, 0);
      if (totalDisplayEl) totalDisplayEl.textContent = String(total);
      if (totalHiddenInput) totalHiddenInput.value = String(total);
      return total;
    }

    // Escuchar cambios en cada input numérico
    numberInputs.forEach(inp => inp.addEventListener('input', actualizarTotal));
    // Inicializar valor al cargar
    actualizarTotal();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      resultado.style.display = 'none';

      // Validación mínima de frontend
      const inputs = Array.from(form.querySelectorAll('input[type=number]'));
      for (const input of inputs) {
        const min = Number(input.getAttribute('min') || -Infinity);
        const max = Number(input.getAttribute('max') || Infinity);
        const val = Number(input.value || 0);
        if (!Number.isInteger(val) || val < min || val > max) {
          resultado.style.display = 'block';
          resultado.className = 'alert alert-danger';
          resultado.textContent = `Valor inválido en ${input.name}. Debe ser entero entre ${min} y ${max}.`;
          return;
        }
      }

      const fd = new FormData(form);
      fd.set('playerId', String(playerId));
      fd.set('action', 'calcular-puntuacion');

      // Asegurar que el total esté actualizado antes de construir el payload
      actualizarTotal();

      try {
        const response = await fetch(window.location.href, { method: 'POST', body: fd });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        if (!text || !text.trim()) throw new Error('Respuesta vacía del servidor');
        let json;
        try { json = JSON.parse(text); } catch (e) { console.error('JSON parse error:', e, 'raw:', text); throw new Error('Respuesta no válida del servidor'); }

        if (json.exito && json.scoreReport) {
          mostrarPantallaPuntuacion(json.scoreReport);
        } else {
          resultado.style.display = 'block';
          resultado.className = 'alert alert-danger';
          resultado.textContent = json.mensaje || json.message || 'Error desconocido al calcular puntuación';
        }
      } catch (err) {
        console.error('Error en envío del formulario:', err);
        resultado.style.display = 'block';
        resultado.className = 'alert alert-danger';
        resultado.textContent = 'Error procesando solicitud: ' + err.message;
      }
    });

    btnReset.addEventListener('click', () => {
      form.reset();
      resultado.style.display = 'none';
      // resetear contador también
      actualizarTotal();
    });

    function mostrarPantallaPuntuacion(report) {
      const total = report.totalScore ?? report.total ?? report.baseScore ?? 0;
      const baseDetails = report.baseDetails ?? report.details ?? {};
      const bonuses = report.bonuses ?? report.bonusDetails ?? 0;

      const overlay = document.createElement('div');
      overlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
      overlay.style.background = 'rgba(0,0,0,0.6)'; overlay.style.zIndex = 9999;

      const card = document.createElement('div'); card.className = 'card shadow-lg'; card.style.maxWidth = '760px'; card.style.width = '90%';
      const cardBody = document.createElement('div'); cardBody.className = 'card-body';
      const title = document.createElement('h3'); title.className = 'card-title mb-3'; title.textContent = 'Resultado de Puntuación';
      const totalEl = document.createElement('div'); totalEl.className = 'mb-3 lead'; totalEl.innerHTML = `<strong>Puntuación Total:</strong> <span class="fs-4">${total} pts</span>`;
      cardBody.appendChild(title); cardBody.appendChild(totalEl);

      const detallesWrapper = document.createElement('div'); detallesWrapper.className = 'mb-3'; const h = document.createElement('h5'); h.textContent = 'Desglose por Zona:'; detallesWrapper.appendChild(h);
      const ul = document.createElement('ul'); ul.className = 'list-group list-group-flush';

      const zonaNombres = { 'bosque-semejanza': 'Bosque de la Semejanza','trio-frondoso':'El Trío Frondoso','prado-diferencia':'Prado de la Diferencia','pradera-amor':'La Pradera del Amor','isla-solitaria':'La Isla Solitaria','rey-selva':'El Rey de la Selva','dinos-rio':'Dinosaurios en el Río' };

      for (const zonaId of Object.keys(zonaNombres)) {
        const det = baseDetails[zonaId] ?? {};
        const points = det.points ?? det.puntos ?? 0;
        const count = det.dinosaurCount ?? det.count ?? 0;
        const li = document.createElement('li'); li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `<div><strong>${zonaNombres[zonaId]}:</strong> ${det.description ?? ''}</div><div><span class="badge bg-primary rounded-pill me-2">${count}</span><span>${points} pts</span></div>`;
        ul.appendChild(li);
      }

      detallesWrapper.appendChild(ul); cardBody.appendChild(detallesWrapper);

      if (typeof bonuses === 'number' && bonuses > 0) { const bdiv = document.createElement('div'); bdiv.className = 'alert alert-warning'; bdiv.innerHTML = `<strong>Bonificaciones:</strong> ${bonuses}`; cardBody.appendChild(bdiv); }

      const footer = document.createElement('div'); footer.className = 'd-flex justify-content-end gap-2';
      const btnClose = document.createElement('button'); btnClose.className = 'btn btn-secondary'; btnClose.textContent = 'Cerrar'; btnClose.addEventListener('click', () => document.body.removeChild(overlay));
      const btnGoPuntaje = document.createElement('a'); btnGoPuntaje.className = 'btn btn-primary'; btnGoPuntaje.textContent = 'Ver Página de Puntajes'; btnGoPuntaje.href = 'puntaje.php';
      footer.appendChild(btnGoPuntaje); footer.appendChild(btnClose);
      cardBody.appendChild(footer); card.appendChild(cardBody); overlay.appendChild(card); document.body.appendChild(overlay);
      overlay.scrollIntoView({ behavior: 'smooth' }); btnClose.focus();
    }

  })();
</script>

</body>
</html>