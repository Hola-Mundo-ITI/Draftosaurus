<?php
// ValidarMovimiento.php - salida JSON robusta y manejo de errores
// Evitar que errores/avisos contaminen la salida JSON
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Forzar JSON
header('Content-Type: application/json; charset=utf-8');

// Buffer para capturar cualquier salida no intencional (HTML, warnings, etc.)
ob_start();

// Ruta de log de errores (en el mismo directorio backend)
$logFile = __DIR__ . '/validarMovimiento_errors.log';

$respuesta = [
    'valido' => false,
    'razon' => 'Solicitud no válida',
];

try {
    require_once 'ValidadorTablero.php';
} catch (Throwable $e) {
    // Capturar y devolver error controlado
    $out = ob_get_clean();
    if ($out) error_log("[require_error] Output before JSON:\n" . $out . "\n", 3, $logFile);
    http_response_code(500);
    error_log("[require_error] " . $e->getMessage() . "\n", 3, $logFile);
    echo json_encode(['valido' => false, 'razon' => 'Error interno del servidor.']);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $out = ob_get_clean();
        if ($out) error_log("[method_error] Output before JSON:\n" . $out . "\n", 3, $logFile);
        http_response_code(405);
        echo json_encode(['valido' => false, 'razon' => 'Método no permitido. Use POST.']);
        exit;
    }

    $input = file_get_contents('php://input');
    $datos = json_decode($input, true);

    if ($datos === null && json_last_error() !== JSON_ERROR_NONE) {
        $buf = ob_get_clean();
        if ($buf) error_log("[json_parse_error] Output before JSON:\n" . $buf . "\n", 3, $logFile);
        http_response_code(400);
        echo json_encode(['valido' => false, 'razon' => 'JSON de entrada no válido.']);
        exit;
    }

    $validador = new ValidadorTablero();

    $accion = $datos['action'] ?? null;
    $zoneId = $datos['zoneId'] ?? null;
    $dinosaursInZone = $datos['dinosaursInZone'] ?? [];
    $dinosaur = $datos['dinosaur'] ?? null;
    $slot = $datos['slot'] ?? null;
    $playerId = array_key_exists('playerId', $datos) ? $datos['playerId'] : null;
    $gameState = $datos['gameState'] ?? null;

    // Asegurar que los objetos que espera ValidadorTablero sean objetos (no arrays asociativos)
    $dinosaurObj = null;
    if ($dinosaur !== null) {
        if (is_array($dinosaur)) {
            // convertir array asociativo a objeto stdClass recursivamente
            $dinosaurObj = json_decode(json_encode($dinosaur));
        } else {
            $dinosaurObj = $dinosaur;
        }
    }

    $gameStateObj = null;
    if ($gameState !== null) {
        if (is_array($gameState)) {
            $gameStateObj = json_decode(json_encode($gameState));
        } else {
            $gameStateObj = $gameState;
        }
    }

    switch ($accion) {
        case 'validatePlacement':
            if ($zoneId !== null && $dinosaur !== null && $slot !== null && $playerId !== null && $gameState !== null) {
                $resultado = $validador->validarColocacion(
                    $zoneId,
                    $dinosaursInZone,
                    $dinosaurObj,
                    (int)$slot,
                    (int)$playerId,
                    $gameStateObj
                );

                if (!empty($resultado['valid'])) {
                    $respuesta = [
                        'valido' => true,
                        'razon' => 'Movimiento válido.',
                        'detalle' => $resultado
                    ];
                } else {
                    $mensaje = method_exists($validador, 'generarMensajeError') ? $validador->generarMensajeError($zoneId, $resultado) : ($resultado['reason'] ?? 'Movimiento inválido.');
                    $respuesta = [
                        'valido' => false,
                        'razon' => $mensaje,
                        'detalle' => $resultado
                    ];
                }
            } else {
                http_response_code(400);
                $respuesta['razon'] = 'Faltan datos esenciales para la validación de colocación.';
            }
            break;

        case 'getValidSlots':
            if ($zoneId !== null && $dinosaur !== null && $playerId !== null && $gameState !== null) {
                // Asegurar que $dinosaurObj sea un objeto antes de llamar al validador
                if (is_array($dinosaurObj)) {
                    // Si viene como array, convertir a objeto stdClass
                    $dinosaurObj = (object)$dinosaurObj;
                    error_log('[validarMovimiento] getValidSlots: dinosaur convertido de array a objeto', 3, $logFile);
                }

                if (!is_object($dinosaurObj)) {
                    http_response_code(400);
                    $respuesta['razon'] = 'Tipo inválido: dinosaur debe ser un objeto.';
                    error_log('[validarMovimiento] getValidSlots: dinosaur no es objeto, tipo recibido: ' . gettype($dinosaur), 3, $logFile);
                    break;
                }

                $slotsValidos = $validador->obtenerSlotsValidos(
                    $zoneId,
                    $dinosaursInZone,
                    $dinosaurObj,
                    (int)$playerId,
                    $gameStateObj
                );

                $respuesta = [
                    'valido' => true,
                    'slotsValidos' => $slotsValidos,
                    'valid' => true,
                    'validSlots' => $slotsValidos
                ];
            } else {
                http_response_code(400);
                $respuesta['razon'] = 'Faltan datos esenciales para obtener slots válidos.';
            }
            break;

        default:
            http_response_code(400);
            $respuesta['razon'] = 'Acción solicitada no válida.';
            break;
    }

} catch (Throwable $e) {
    // Capturar cualquier excepción inesperada
    $buf = ob_get_clean();
    if ($buf) error_log("[exception] Output before JSON:\n" . $buf . "\n", 3, $logFile);
    error_log("[exception] " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", 3, $logFile);
    http_response_code(500);
    echo json_encode(['valido' => false, 'razon' => 'Error interno del servidor.']);
    exit;
}

// Si quedó salida accidental en buffer (p. ej. HTML de warnings), loguearla y limpiar
$leftover = ob_get_clean();
if ($leftover) {
    error_log("[leftover_output] " . substr($leftover, 0, 2000) . "\n", 3, $logFile);
}

// Responder siempre con JSON limpio
echo json_encode($respuesta);
?>