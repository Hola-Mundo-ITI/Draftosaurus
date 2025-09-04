<?php
declare(strict_types=1);
/*
  Mejoras para calcularPuntuacion.php para evitar errores HTML y asegurar JSON válido
*/

// CRÍTICO: Suprimir TODOS los outputs HTML/errores antes de enviar JSON
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Capturar cualquier output accidental
ob_start();

// Función para limpiar output y devolver JSON limpio
function enviarRespuestaJSON($response) {
    // Limpiar cualquier output previo que pueda contaminar el JSON
    if (ob_get_length()) {
        $contenidoPrevio = ob_get_clean();
        if (!empty($contenidoPrevio)) {
            error_log("calcularPuntuacion.php - Output no deseado capturado: " . $contenidoPrevio);
        }
    }
    
    // Asegurar header JSON
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache');
    }
    
    // Codificar y enviar respuesta
    $json = json_encode($response, JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        error_log('calcularPuntuacion.php - Error en json_encode: ' . json_last_error_msg());
        $fallback = [
            'success' => false,
            'error' => 'Error interno al generar respuesta JSON'
        ];
        echo json_encode($fallback);
    } else {
        echo $json;
    }
    exit;
}

// Manejar errores fatales
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        error_log('calcularPuntuacion.php - Error fatal: ' . print_r($error, true));
        
        // Limpiar cualquier output corrupto
        if (ob_get_length()) ob_end_clean();
        
        $response = [
            'success' => false,
            'error' => 'Error fatal en el servidor',
            'details' => 'Consulta los logs del servidor para más información'
        ];
        
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode($response);
        exit;
    }
});

try {
    // Verificar método HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        enviarRespuestaJSON([
            'success' => false,
            'error' => 'Método no permitido. Use POST.'
        ]);
    }

    // Leer input raw
    $input = file_get_contents('php://input');
    if ($input === false) {
        enviarRespuestaJSON([
            'success' => false,
            'error' => 'No se pudo leer el cuerpo de la solicitud'
        ]);
    }

    // Parsear JSON
    $data = json_decode($input, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        error_log('calcularPuntuacion.php - JSON inválido: ' . json_last_error_msg());
        enviarRespuestaJSON([
            'success' => false,
            'error' => 'JSON inválido en la solicitud',
            'jsonError' => json_last_error_msg()
        ]);
    }

    // Validar datos requeridos
    if (!isset($data['fullBoard']) || !isset($data['playerId'])) {
        enviarRespuestaJSON([
            'success' => false,
            'error' => 'Faltan datos requeridos: fullBoard y playerId'
        ]);
    }

    $fullBoard = $data['fullBoard'];
    $playerId = (int) $data['playerId'];
    $allPlayerBoards = $data['allPlayerBoards'] ?? [];

    // Incluir ScoreCalculator
    require_once __DIR__ . '/ScoreCalculator.php';

    // Crear calculadora y procesar
    $calculator = new ScoreCalculator();
    $scoreReport = $calculator->generarInformePuntuacion(
        (object) $fullBoard, 
        $playerId, 
        $allPlayerBoards
    );

    // Respuesta exitosa
    enviarRespuestaJSON([
        'success' => true,
        'scoreReport' => $scoreReport,
        'message' => 'Puntuación calculada correctamente'
    ]);

} catch (Throwable $e) {
    // Log del error completo
    error_log('calcularPuntuacion.php - Excepción: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
    
    enviarRespuestaJSON([
        'success' => false,
        'error' => 'Error interno al procesar la solicitud',
        'details' => 'Error registrado en los logs del servidor'
    ]);
}
?>