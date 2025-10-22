<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../tablero/tablero.php';

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

error_log('[validarMovimiento] payload: ' . $json);

if (!isset($datos['casillaId']) || !isset($datos['species'])) {
    echo json_encode([
        'valid' => false,
        'reason' => 'Faltan datos: necesito casillaId y species',
        'debug' => ['received' => $datos]
    ]);
    exit;
}

$casillaId = $datos['casillaId'];
$dino = (int)$datos['species'];
$tableroEstado = isset($datos['tableroEstado']) ? $datos['tableroEstado'] : ['casillas' => []];
$restriccionDado = isset($datos['restriccionActiva']) ? $datos['restriccionActiva'] : null;

try {
    $tablero = new Tablero();
    $tablero->cargarEstado($tableroEstado);
    
    $resultado = $tablero->puedoColocar($casillaId, $dino, $restriccionDado);
    
    $nombreZona = obtenerNombreZona($casillaId);
    
    error_log('[validarMovimiento] resultado: ' . json_encode($resultado) . ' zona: ' . $nombreZona);
    
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

function obtenerNombreZona($casillaId) {
    if (strpos($casillaId, '1-') === 0) return 'bosque-semejanza';
    if (strpos($casillaId, '6-') === 0) return 'prado-diferencia';
    if (strpos($casillaId, '4-') === 0) return 'trio-frondoso';
    if (strpos($casillaId, '7-') === 0) return 'pradera-amor';
    if ($casillaId === '9-1') return 'isla-solitaria';
    if ($casillaId === '3-1') return 'rey-selva';
    if (strpos($casillaId, '8-') === 0) return 'dinos-rio';
    return 'desconocida';
}
?>