<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../tablero.php';

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

// Log para depuración (se verá en el log de PHP/Apache)
error_log('[validarMovimiento] payload: ' . $json);

// Verificar que llegaron los datos mínimos necesarios
if (!isset($datos['casillaId']) || !isset($datos['species'])) {
    echo json_encode([
        'valid' => false,
        'reason' => 'Faltan datos: necesito casillaId y species',
        'debug' => ['received' => $datos]
    ]);
    exit;
}

// Extraer los datos
$casillaId = $datos['casillaId'];
$dino = (int)$datos['species'];
$tableroEstado = isset($datos['tableroEstado']) ? $datos['tableroEstado'] : ['casillas' => []];
$restriccionDado = isset($datos['restriccionActiva']) ? $datos['restriccionActiva'] : null;

try {
    // Crear el tablero y cargar el estado actual del juego
    $tablero = new Tablero();
    $tablero->cargarEstado($tableroEstado);
    
    // Validar si se puede colocar el dinosaurio
    $resultado = $tablero->puedoColocar($casillaId, $dino, $restriccionDado);
    
    // Determinar zona localmente (para debug)
    $nombreZona = null;
    if (strpos($casillaId, '1-') === 0) $nombreZona = 'bosque-semejanza';
    elseif (strpos($casillaId, '6-') === 0) $nombreZona = 'prado-diferencia';
    elseif (strpos($casillaId, '4-') === 0) $nombreZona = 'trio-frondoso';
    elseif (strpos($casillaId, '7-') === 0) $nombreZona = 'pradera-amor';
    elseif ($casillaId === '9-1') $nombreZona = 'isla-solitaria';
    elseif ($casillaId === '3-1') $nombreZona = 'rey-selva';
    elseif (strpos($casillaId, '8-') === 0) $nombreZona = 'dinos-rio';

    // Log resultado de validación
    error_log('[validarMovimiento] resultado: ' . json_encode($resultado) . ' zona: ' . $nombreZona);
    
    // Devolver respuesta en el formato que espera el frontend
    if ($resultado['valido']) {
        echo json_encode([
            'valid' => true,
            'debug' => [
                'zona' => $nombreZona,
                'tableroEstado' => $tableroEstado,
                'restriccionRecibida' => $restriccionDado
            ]
        ]);
    } else {
        echo json_encode([
            'valid' => false,
            'reason' => $resultado['razon'],
            'debug' => [
                'zona' => $nombreZona,
                'tableroEstado' => $tableroEstado,
                'restriccionRecibida' => $restriccionDado
            ]
        ]);
    }
    
} catch (Exception $e) {
    error_log('[validarMovimiento] exception: ' . $e->getMessage());
    echo json_encode([
        'valid' => false,
        'reason' => 'Error del servidor: ' . $e->getMessage(),
        'debug' => ['received' => $datos]
    ]);
}
?>