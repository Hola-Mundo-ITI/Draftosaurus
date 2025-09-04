<?php
declare(strict_types=1);
// Protección del endpoint: obliga a sesión válida antes de calcular movimiento del bot
require_once __DIR__ . '/session.php';
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
if (function_exists('exigirLogin')) exigirLogin();

// Configuración detallada de errores y logging - CORREGIDO: usar strings
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/php_errors.log');

// Respuesta siempre en JSON
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/SistemaBots.php';
require_once __DIR__ . '/ValidadorTablero.php';

/**
 * Devuelve una respuesta JSON y termina la ejecución.
 * @param mixed $data Datos serializables a JSON
 * @param int $statusCode Código HTTP
 */
function jsonResponse($data, int $statusCode = 200) {
    http_response_code($statusCode);
    while (ob_get_level() > 0) { @ob_end_clean(); }
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Ejecuta la lógica del bot para decidir un movimiento según el estado de juego recibido.
 * @param int $playerId Identificador del jugador bot
 * @param object $gameState Estado completo del juego
 * @param int|null $totalPlayers Opcional: total de jugadores para instanciar SistemaBots
 * @return array|null Movimiento generado o null si no hay disponible
 */
function ejecutarMovimientoBotSeguro(int $playerId, object $gameState, ?int $totalPlayers = null): ?array {
    $options = [];
    if ($totalPlayers !== null && $totalPlayers >= 2) {
        $options['totalPlayers'] = $totalPlayers;
    }

    $sistemaBots = new SistemaBots($options);

    $movimiento = $sistemaBots->decidirMovimientoBot($playerId, $gameState);

    if (!$movimiento) {
        return null;
    }

    return [
        'dinosaur' => $movimiento['dinosaur'] ?? null,
        'zoneId'   => $movimiento['zoneId'] ?? ($movimiento['zona'] ?? null),
        'slot'     => $movimiento['slot'] ?? ($movimiento['slotId'] ?? ($movimiento['casillero'] ?? null))
    ];
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonResponse(['success' => false, 'error' => 'Método no permitido. Use POST.'], 405);
    }

    $rawInput = file_get_contents('php://input');
    if ($rawInput === false) {
        jsonResponse(['success' => false, 'error' => 'No se pudo leer la entrada'], 400);
    }

    $data = json_decode($rawInput);
    if (json_last_error() !== JSON_ERROR_NONE) {
        jsonResponse(['success' => false, 'error' => 'JSON inválido'], 400);
    }

    $playerId = isset($data->playerId) ? intval($data->playerId) : null;
    $gameState = $data->gameState ?? null;
    $availableDinosaurs = $data->availableDinosaurs ?? [];
    $totalPlayers = isset($data->totalPlayers) ? intval($data->totalPlayers) : null;

    if ($playerId === null || $gameState === null) {
        jsonResponse(['success' => false, 'error' => 'Faltan parámetros obligatorios (playerId, gameState)'], 422);
    }

    // Inyectar availableDinosaurs en el estado para la decisión si aplica
    if (is_object($gameState) || is_array($gameState)) {
        $gameState->availableDinosaurs = $availableDinosaurs;
    }

    try {
        $move = ejecutarMovimientoBotSeguro($playerId, (object)$gameState, $totalPlayers);

        if ($move === null) {
            jsonResponse(['success' => false, 'error' => 'Sin movimiento disponible', 'move' => null], 200);
        }

        jsonResponse(['success' => true, 'move' => $move], 200);

    } catch (Throwable $e) {
        error_log('[obtenerMovimientoBot][logic_error] ' . $e->getMessage() . '\n' . $e->getTraceAsString());
        jsonResponse(['success' => false, 'error' => 'Error interno del servidor'], 500);
    }

} catch (Throwable $e) {
    error_log('[obtenerMovimientoBot][exception] ' . $e->getMessage() . '\n' . $e->getTraceAsString());
    jsonResponse(['success' => false, 'error' => 'Error interno del servidor'], 500);
}