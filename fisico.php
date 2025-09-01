<?php
/*
 * Clase CalculadorPuntuacionLocal:
 * Implementa la lógica de cálculo de puntuaciones integrada directamente en fisico.php
 * para evitar dependencias externas del backend y problemas de conectividad JSON.
 */
class CalculadorPuntuacionLocal {
    private $sistemasPuntuacion;

    public function __construct() {
        $this->sistemasPuntuacion = [
            'bosque-semejanza' => [ 'calculate' => fn($dinosaurios) => $this->calcularSimilitudBosque($dinosaurios), 'description' => 'Puntos por dinosaurios del mismo tipo' ],
            'trio-frondoso'   => [ 'calculate' => fn($dinosaurios) => $this->calcularTrioFrondoso($dinosaurios), 'description' => '7 puntos si tiene exactamente 3 dinosaurios' ],
            'prado-diferencia'=> [ 'calculate' => fn($dinosaurios) => $this->calcularDiferenciaPrado($dinosaurios), 'description' => 'Puntos por variedad de tipos' ],
            'pradera-amor'    => [ 'calculate' => fn($dinosaurios) => $this->calcularPraderaAmor($dinosaurios), 'description' => 'Puntos por parejas completas' ],
            'isla-solitaria'  => [ 'calculate' => fn($dinosaurios, $playerBoard = null) => $this->calcularIslaSolitaria($dinosaurios, $playerBoard), 'description' => '7 puntos por el dinosaurio solitario' ],
            'rey-selva'       => [ 'calculate' => fn($dinosaurios, $allBoards = null, $playerId = null) => $this->calcularReySelva($dinosaurios, $allBoards, $playerId), 'description' => 'Puntos por el dinosaurio más grande' ],
            'dinos-rio'       => [ 'calculate' => fn($dinosaurios) => $this->calcularDinosauriosRio($dinosaurios), 'description' => 'Puntos por secuencia en el río' ],
        ];
    }

    public function generarInformePuntuacion(object $fullBoard, int $playerId, array $allPlayerBoards): array {
        // Construir tablero del jugador con solo los dinosaurios del playerId
        $playerBoard = new stdClass();
        foreach ($fullBoard as $zoneId => $dinosInZone) {
            $filtered = [];
            foreach ($dinosInZone as $d) {
                // Aceptar objetos o arrays (normalizar)
                if (is_array($d)) $d = (object)$d;
                if (!isset($d->playerPlaced) || (int)$d->playerPlaced === $playerId) {
                    $filtered[] = $d;
                }
            }
            $playerBoard->{$zoneId} = $filtered;
        }

        $baseScoreResult = $this->calcularPuntuacionJugador($playerBoard, $playerId, $allPlayerBoards);
        $bonusesResult = $this->calcularBonificaciones($playerBoard, $playerId);

        return [
            'player' => $playerId,
            'baseScore' => $baseScoreResult['total'],
            'baseDetails' => $baseScoreResult['details'],
            'bonuses' => $bonusesResult['total'],
            'bonusDetails' => $bonusesResult['details'],
            'totalScore' => $baseScoreResult['total'] + $bonusesResult['total'],
            'completedZones' => $this->contarZonasCompletadas($playerBoard, $playerId),
            'diversity' => $this->calcularDiversidad($playerBoard, $playerId)
        ];
    }

    public function calcularPuntuacionJugador(object $playerBoard, int $playerId, array $allPlayerBoards): array {
        $totalScore = 0;
        $zoneDetails = [];

        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if (!empty($dinosaurios)) {
                $score = 0;
                $system = $this->sistemasPuntuacion[$zoneId] ?? null;

                if ($system) {
                    if ($zoneId === 'rey-selva') {
                        $score = $this->calcularReySelva($dinosaurios, $allPlayerBoards, $playerId);
                    } elseif ($zoneId === 'isla-solitaria') {
                        $score = $this->calcularIslaSolitaria($dinosaurios, $playerBoard);
                    } else {
                        $score = $system['calculate']($dinosaurios);
                    }
                }

                $totalScore += $score;
                $zoneDetails[$zoneId] = [
                    'points' => $score,
                    'dinosaurCount' => count($dinosaurios),
                    'description' => $this->obtenerDescripcionZona($zoneId)
                ];
            }
        }

        return [ 'total' => $totalScore, 'details' => $zoneDetails ];
    }

    private function calcularSimilitudBosque(array $dinosaurios): int {
        if (empty($dinosaurios)) return 0;
        $counts = [];
        foreach ($dinosaurios as $dino) {
            if (is_array($dino)) $dino = (object)$dino;
            $t = $dino->type ?? $dino->tipo ?? null;
            if (!$t) continue;
            $counts[$t] = ($counts[$t] ?? 0) + 1;
        }
        $maxCount = $counts ? max(array_values($counts)) : 0;
        $scoreTable = [0,1,3,6,10,15,21];
        $idx = min($maxCount, count($scoreTable)-1);
        return $scoreTable[$idx] ?? 0;
    }

    private function calcularTrioFrondoso(array $dinosaurios): int {
        return count($dinosaurios) === 3 ? 7 : 0;
    }

    private function calcularDiferenciaPrado(array $dinosaurios): int {
        $unique = [];
        foreach ($dinosaurios as $dino) {
            if (is_array($dino)) $dino = (object)$dino;
            $t = $dino->type ?? $dino->tipo ?? null;
            if ($t) $unique[$t] = true;
        }
        $typeCount = count($unique);
        $scoreTable = [0,1,3,6,10,15,21];
        $idx = min($typeCount, count($scoreTable)-1);
        return $scoreTable[$idx] ?? 0;
    }

    private function calcularPraderaAmor(array $dinosaurios): int {
        $counts = [];
        foreach ($dinosaurios as $dino) {
            if (is_array($dino)) $dino = (object)$dino;
            $t = $dino->type ?? $dino->tipo ?? null;
            if (!$t) continue;
            $counts[$t] = ($counts[$t] ?? 0) + 1;
        }
        $pairs = 0;
        foreach ($counts as $c) $pairs += floor($c / 2);
        return $pairs * 5;
    }

    private function calcularReySelva(array $dinosaurios, array $allPlayerBoards, int $playerId): int {
        if (count($dinosaurios) !== 1) return 0;
        $myDinosaur = $dinosaurios[0];
        if (is_array($myDinosaur)) $myDinosaur = (object)$myDinosaur;
        $type = $myDinosaur->type ?? $myDinosaur->tipo ?? null;
        if (!$type) return 0;

        $myTotal = $this->contarEspecieEnParque($allPlayerBoards[$playerId] ?? [], $type);
        foreach ($allPlayerBoards as $otherId => $board) {
            if ((string)$otherId === (string)$playerId) continue;
            $otherCount = $this->contarEspecieEnParque($board, $type);
            if ($otherCount > $myTotal) return 0;
        }
        return 7;
    }

    private function calcularIslaSolitaria(array $dinosaurios, $playerBoard): int {
        if (count($dinosaurios) !== 1) return 0;
        $d = $dinosaurios[0]; if (is_array($d)) $d = (object)$d;
        $type = $d->type ?? $d->tipo ?? null;
        if (!$type) return 0;

        $total = 0;
        foreach ($playerBoard as $zone) {
            foreach ($zone as $din) {
                if (is_array($din)) $din = (object)$din;
                if (($din->type ?? $din->tipo ?? null) === $type) $total++;
            }
        }
        return $total === 1 ? 7 : 0;
    }

    private function calcularDinosauriosRio(array $dinosaurios): int {
        $count = count($dinosaurios);
        $scoreTable = [0,1,3,6,10,15,21,28];
        $idx = min($count, count($scoreTable)-1);
        return $scoreTable[$idx] ?? 0;
    }

    private function calcularBonificaciones(object $playerBoard, int $playerId): array {
        $totalBonuses = 0;
        $details = [];
        $completed = $this->contarZonasCompletadas($playerBoard, $playerId);
        if ($completed >= 5) { $totalBonuses += 10; $details['completedZones'] = 10; }
        $div = $this->calcularDiversidad($playerBoard, $playerId);
        if ($div >= 6) { $totalBonuses += 8; $details['diversity'] = 8; }
        return ['total' => $totalBonuses, 'details' => $details];
    }

    private function contarZonasCompletadas(object $playerBoard, int $playerId): int {
        $count = 0;
        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if ($this->esZonaCompletada($zoneId, $dinosaurios)) $count++;
        }
        return $count;
    }

    private function esZonaCompletada(string $zoneId, array $dinosaurios): bool {
        $rules = [
            'bosque-semejanza' => fn($d) => count($d) >= 3,
            'trio-frondoso' => fn($d) => count($d) === 3,
            'prado-diferencia' => fn($d) => count(array_unique(array_map(fn($x) => ($x->type ?? $x->tipo ?? null), $d))) >= 3,
            'pradera-amor' => fn($d) => $this->tieneParejasCompletas($d),
            'isla-solitaria' => fn($d) => count($d) === 1,
            'rey-selva' => fn($d) => count($d) === 1,
            'dinos-rio' => fn($d) => count($d) >= 4
        ];
        $rule = $rules[$zoneId] ?? null;
        return $rule ? (bool)$rule($dinosaurios) : false;
    }

    private function tieneParejasCompletas(array $dinosaurios): bool {
        $counts = [];
        foreach ($dinosaurios as $dino) { if (is_array($dino)) $dino = (object)$dino; $t = $dino->type ?? $dino->tipo ?? null; if ($t) $counts[$t] = ($counts[$t] ?? 0) + 1; }
        foreach ($counts as $c) if ($c >= 2) return true;
        return false;
    }

    private function calcularDiversidad(object $playerBoard, int $playerId): int {
        $unique = [];
        foreach ($playerBoard as $zone) {
            foreach ($zone as $dino) { if (is_array($dino)) $dino = (object)$dino; $t = $dino->type ?? $dino->tipo ?? null; if ($t) $unique[$t] = true; }
        }
        return count($unique);
    }

    private function contarEspecieEnParque($playerBoard, string $speciesType): int {
        $cnt = 0;
        foreach ($playerBoard as $zone) {
            foreach ($zone as $d) { if (is_array($d)) $d = (object)$d; if (($d->type ?? $d->tipo ?? null) === $speciesType) $cnt++; }
        }
        return $cnt;
    }

    private function obtenerDescripcionZona(string $zoneId): string {
        $descriptions = [
            'bosque-semejanza' => 'Puntos por dinosaurios de la misma especie',
            'trio-frondoso' => '7 puntos si tiene exactamente 3 dinosaurios',
            'prado-diferencia' => 'Puntos por variedad de especies',
            'pradera-amor' => '5 puntos por cada pareja completa',
            'isla-solitaria' => '7 puntos si es único de su especie en el parque',
            'rey-selva' => '7 puntos si ningún rival tiene más de esa especie',
            'dinos-rio' => 'Puntos por dinosaurios en secuencia'
        ];
        return $descriptions[$zoneId] ?? 'Puntuación especial';
    }
}

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
                // - Bosque de la Semejanza: asumimos que todos los dinosaurios son de la misma especie
                //   para que la puntuación refleje la cantidad colocada (maxCount == count)
                // - Prado de la Diferencia: asumimos especies variadas (rotación) para maximizar diversidad
                // - Otros recintos: rotación por defecto
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

        // Instanciar calculadora local y generar reporte
        // Preferir la implementación canónica en backend/ScoreCalculator.php
        require_once __DIR__ . '/backend/ScoreCalculator.php';
        $sc = new ScoreCalculator();
        // Asegurar tipos: ScoreCalculator espera object para fullBoard y array para allPlayerBoards
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
      <h1 class="mb-4">Registrar cantidad de dinosaurios por recinto</h1>

      <!-- Formulario Bootstrap simple -->
      <form id="form-recintos" class="row g-3" method="POST">
        <input type="hidden" name="action" value="calcular-puntuacion">

        <div class="col-12 col-md-6">
          <label for="bosque-semejanza" class="form-label">Bosque de la Semejanza (máx 6)</label>
          <input type="number" class="form-control" id="bosque-semejanza" name="bosque-semejanza" min="0" max="6" value="0" aria-describedby="helpBosque">
          <div id="helpBosque" class="form-text">Solo cuenta la cantidad de dinosaurios colocados en este recinto.</div>
        </div>

        <div class="col-12 col-md-6">
          <label for="trio-frondoso" class="form-label">El Trío Frondoso (máx 3)</label>
          <input type="number" class="form-control" id="trio-frondoso" name="trio-frondoso" min="0" max="3" value="0">
        </div>

        <div class="col-12 col-md-6">
          <label for="prado-diferencia" class="form-label">Prado de la Diferencia (máx 6)</label>
          <input type="number" class="form-control" id="prado-diferencia" name="prado-diferencia" min="0" max="6" value="0">
        </div>

        <div class="col-12 col-md-6">
          <label for="pradera-amor" class="form-label">La Pradera del Amor (máx 6)</label>
          <input type="number" class="form-control" id="pradera-amor" name="pradera-amor" min="0" max="6" value="0">
        </div>

        <div class="col-12 col-md-4">
          <label for="isla-solitaria" class="form-label">La Isla Solitaria (máx 1)</label>
          <input type="number" class="form-control" id="isla-solitaria" name="isla-solitaria" min="0" max="1" value="0">
        </div>

        <div class="col-12 col-md-4">
          <label for="rey-selva" class="form-label">El Rey de la Selva (máx 1)</label>
          <input type="number" class="form-control" id="rey-selva" name="rey-selva" min="0" max="1" value="0">
        </div>

        <div class="col-12 col-md-4">
          <label for="dinos-rio" class="form-label">Dinosaurios en el Río (máx 7)</label>
          <input type="number" class="form-control" id="dinos-rio" name="dinos-rio" min="0" max="7" value="0">
        </div>

        <div class="col-12 d-flex gap-2 mt-3">
          <button type="submit" class="btn btn-primary" id="btn-submit">Enviar</button>
          <button type="button" class="btn btn-secondary" id="btn-reset">Limpiar</button>
        </div>

        <!-- Total de dinosaurios colocados (se actualiza en tiempo real) -->
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