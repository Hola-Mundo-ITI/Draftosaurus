<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'calcularPuntos.php';

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!isset($datos['tableroEstado'])) {
    echo json_encode(['error' => 'No se recibio el estado del tablero']);
    exit;
}

$tableroEstado = $datos['tableroEstado'];
$casillas = isset($tableroEstado['casillas']) ? $tableroEstado['casillas'] : [];

$zonas = [
    'bosque-semejanza' => [],
    'prado-diferencia' => [],
    'trio-frondoso' => [],
    'pradera-amor' => [],
    'isla-solitaria' => [],
    'rey-selva' => [],
    'dinos-rio' => []
];

foreach ($casillas as $casillaId => $especie) {
    $zona = obtenerZonaDeCasilla($casillaId);
    if ($zona !== 'desconocida') {
        $zonas[$zona][] = $especie;
    }
}

$calculador = new CalculadorPuntos();
$resultado = $calculador->calcular($zonas);

$respuesta = [
    'success' => true,
    'totalScore' => $resultado['total'],
    'detalles' => []
];

foreach ($resultado['detalles'] as $nombreZona => $info) {
    $descripcion = obtenerDescripcionZona($nombreZona);
    $respuesta['detalles'][$nombreZona] = [
        'puntos' => $info['puntos'],
        'cantidad' => $info['cantidad'],
        'descripcion' => $descripcion
    ];
}

echo json_encode($respuesta);

function obtenerZonaDeCasilla($casillaId) {
    if (strpos($casillaId, '1-') === 0) return 'bosque-semejanza';
    if (strpos($casillaId, '6-') === 0) return 'prado-diferencia';
    if (strpos($casillaId, '4-') === 0) return 'trio-frondoso';
    if (strpos($casillaId, '7-') === 0) return 'pradera-amor';
    if ($casillaId === '9-1') return 'isla-solitaria';
    if ($casillaId === '3-1') return 'rey-selva';
    if (strpos($casillaId, '8-') === 0) return 'dinos-rio';
    return 'desconocida';
}

function obtenerDescripcionZona($nombreZona) {
    $descripciones = [
        'bosque-semejanza' => 'Todos iguales',
        'prado-diferencia' => 'Todos diferentes',
        'trio-frondoso' => '7 pts si hay 3',
        'pradera-amor' => '5 pts por pareja',
        'isla-solitaria' => '7 pts si hay 1',
        'rey-selva' => '7 pts si hay 1',
        'dinos-rio' => 'Secuencia del rio'
    ];
    
    return isset($descripciones[$nombreZona]) ? $descripciones[$nombreZona] : '';
}
?>