<?php
declare(strict_types=1);

/*
 * Script validarMovimiento.php:
 * Expone un endpoint HTTP que valida movimientos solicitados desde el cliente.
 * - Recibe JSON con la acción solicitada y los datos necesarios.
 * - Usa ValidadorTablero para comprobar colocaciones y generar mensajes.
 * Devuelve JSON con el resultado de la validación.
 */


ini_set('display_errors', '0');
error_reporting(E_ALL);

// Incluir manejo de sesión y exigir autenticación antes de devolver cualquier JSON
require_once __DIR__ . '/session.php';
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
// Para endpoints AJAX exigimos sesión activa; exigirLogin enviará la respuesta adecuada (redirect o 401)
if (function_exists('exigirLogin')) exigirLogin();

header('Content-Type: application/json; charset=utf-8');

ob_start();

$logFile = __DIR__ . '/validarMovimiento_errors.log';

$respuesta = [
    'valido' => false,
    'razon' => 'Solicitud no válida',
];

try {
    require_once 'ValidadorTablero.php';
} catch (Throwable $e) {

    $out = ob_get_clean();
    if ($out) error_log("[require_error] Output before JSON:\n" . $out . "\n", 3, $logFile);
    http_response_code(500);
    error_log("[require_error] " . $e->getMessage() . "\n", 3, $logFile);
    echo json_encode(['valido' => false, 'razon' => 'Error interno del servidor.']);
    exit;
}

/*
 * Bloque principal de manejo de la petición:
 * - Valida método HTTP y parsea el payload JSON.
 * - En función de la acción solicita al Validador las comprobaciones necesarias.
 */
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

    // Normalizar dinosaursInZone: asegurarnos que sea array de objetos y propiedades consistentes
    if (!is_array($dinosaursInZone)) {
        $dinosaursInZone = [];
    }

    foreach ($dinosaursInZone as $idx => $d) {
        if (is_array($d)) {
            $d = json_decode(json_encode($d));
            error_log("[validarMovimiento] dinosaursInZone[{$idx}] convertido de array a objeto", 3, $logFile);
        }
        if (!is_object($d)) {
        
            error_log("[validarMovimiento] dinosaursInZone[{$idx}] no es objeto, tipo: " . gettype($d), 3, $logFile);
            unset($dinosaursInZone[$idx]);
            continue;
        }

        if (!isset($d->type) && isset($d->tipo)) $d->type = $d->tipo;
        if (!isset($d->image) && isset($d->imagen)) $d->image = $d->imagen;
        if (!isset($d->id) && (isset($d->ID) || isset($d->Id))) {
            $d->id = $d->ID ?? $d->Id;
        }


        if (!isset($d->id)) {
 
            $d->id = uniqid('dino_');
            error_log("[validarMovimiento] dinosaursInZone[{$idx}] sin id, se asignó temporario: {$d->id}", 3, $logFile);
        }

        $dinosaursInZone[$idx] = $d;
    }

    // Reindex array to avoid holes
    $dinosaursInZone = array_values($dinosaursInZone);

    $dinosaurObj = null;
    if ($dinosaur !== null) {
        if (is_array($dinosaur)) {

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

                if (is_array($dinosaurObj)) {

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

    $buf = ob_get_clean();
    if ($buf) error_log("[exception] Output before JSON:\n" . $buf . "\n", 3, $logFile);
    error_log("[exception] " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n", 3, $logFile);
    http_response_code(500);
    echo json_encode(['valido' => false, 'razon' => 'Error interno del servidor.']);
    exit;
}

$leftover = ob_get_clean();
if ($leftover) {
    error_log("[leftover_output] " . substr($leftover, 0, 2000) . "\n", 3, $logFile);
}

echo json_encode($respuesta);
?>