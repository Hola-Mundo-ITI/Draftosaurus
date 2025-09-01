<?php

/*
 * Script calcularPuntuacion.php:
 * Endpoint ligero que delega en ScoreCalculator para calcular y devolver
 * el informe de puntuación. Mantiene la compatibilidad con la API que
 * espera un POST con los datos necesarios.
 */

// Activar logging de errores pero ocultarlos al cliente
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Iniciar buffer para capturar cualquier salida accidental y permitir devolver siempre JSON limpio
ob_start();


$debugMode = isset($_GET['debug']) && $_GET['debug'] === '1';

// Enviar cabecera JSON (utf-8)
header('Content-Type: application/json; charset=utf-8');

// Función auxiliar para limpiar buffer y devolver JSON válido
function devolverJsonYSalir(array $response) {
    // Limpiar cualquier salida previa
    if (ob_get_length() !== false) {
        $rawOutput = ob_get_clean();
    } else {
        $rawOutput = '';
    }

    // Si existía salida no intencional, adjuntarla al log
    if ($rawOutput !== '') {
        error_log("calcularPuntuacion.php - Output inesperado antes del JSON: " . $rawOutput);
        // No incluir rawOutput en la respuesta en modo normal; solo en debug
        if (!empty($GLOBALS['debugMode'])) $response['rawOutput'] = $rawOutput;
    }

    // Codificar respuesta final asegurándonos de que json_encode no falle
    $json = json_encode($response, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        $fallback = ['exito' => false, 'mensaje' => 'Error interno: no se pudo codificar JSON de respuesta.'];
        error_log('calcularPuntuacion.php - json_encode error: ' . json_last_error_msg());
        echo json_encode($fallback, JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo $json;
    exit;
}

// Capturar fallos fatales y asegurar respuesta JSON
register_shutdown_function(function() {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        $response = [
            'exito' => false,
            'mensaje' => 'Error fatal en el servidor al procesar la solicitud.'
        ];
        // incluir detalles de error en log
        error_log('calcularPuntuacion.php - Fatal error: ' . print_r($err, true));
        if (!empty($GLOBALS['debugMode'])) {
            $response['debugError'] = $err;
        }
        devolverJsonYSalir($response);
    }
});

try {
    require_once __DIR__ . '/ScoreCalculator.php';

    // Delegar en ScoreCalculator y obtener la representación JSON
    $json = ScoreCalculator::manejarSolicitudHttp();

    // Validar que lo devuelto sea JSON decodificable
    $decoded = json_decode($json);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('calcularPuntuacion.php - ScoreCalculator devolvió JSON inválido: ' . json_last_error_msg());
        // Intentar reconstruir una respuesta de error legible
        $response = [
            'exito' => false,
            'mensaje' => 'La calculadora devolvió una respuesta inválida.',
        ];
        if ($debugMode) {
            $response['rawFromCalculator'] = $json;
            $response['jsonError'] = json_last_error_msg();
        }
        devolverJsonYSalir($response);
    }

    // Si todo está bien, devolver exactamente lo que el calculador retornó (ya es JSON)
    // Pero limpiamos cualquier salida previa por seguridad
    if (ob_get_length() !== false) ob_end_clean();
    echo $json;
    exit;
} catch (Throwable $e) {
    error_log('calcularPuntuacion.php - Excepción: ' . $e->getMessage());
    $response = [
        'exito' => false,
        'mensaje' => 'Error interno al calcular la puntuación',
    ];
    if ($debugMode) {
        $response['exception'] = ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()];
    }
    devolverJsonYSalir($response);
}
?>
