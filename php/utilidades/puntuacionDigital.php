<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!isset($datos['tableroEstado'])) {
    echo json_encode(['error' => 'No se recibió el estado del tablero']);
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

// Clasifica dinosaurios por zona
foreach ($casillas as $casillaId => $especie) {
    $zona = obtenerZonaDeCasilla($casillaId);
    if ($zona !== 'desconocida') {
        $zonas[$zona][] = $especie;
    }
}

$puntosBosque = calcularBosque(count($zonas['bosque-semejanza']), $zonas['bosque-semejanza']);
$puntosPrado = calcularPrado(count($zonas['prado-diferencia']), $zonas['prado-diferencia']);
$puntosTrio = calcularTrio(count($zonas['trio-frondoso']));
$puntosPradera = calcularPradera(count($zonas['pradera-amor']));
$puntosIsla = calcularIsla(count($zonas['isla-solitaria']));
$puntosRey = calcularRey(count($zonas['rey-selva']));
$puntosRio = calcularRio(count($zonas['dinos-rio']));

$total = $puntosBosque + $puntosPrado + $puntosTrio + $puntosPradera + 
         $puntosIsla + $puntosRey + $puntosRio;

$respuesta = [
    'success' => true,
    'totalScore' => $total,
    'detalles' => [
        'bosque-semejanza' => [
            'puntos' => $puntosBosque,
            'cantidad' => count($zonas['bosque-semejanza']),
            'descripcion' => 'Todos iguales'
        ],
        'prado-diferencia' => [
            'puntos' => $puntosPrado,
            'cantidad' => count($zonas['prado-diferencia']),
            'descripcion' => 'Todos diferentes'
        ],
        'trio-frondoso' => [
            'puntos' => $puntosTrio,
            'cantidad' => count($zonas['trio-frondoso']),
            'descripcion' => '7 pts si hay 3'
        ],
        'pradera-amor' => [
            'puntos' => $puntosPradera,
            'cantidad' => count($zonas['pradera-amor']),
            'descripcion' => '5 pts por pareja'
        ],
        'isla-solitaria' => [
            'puntos' => $puntosIsla,
            'cantidad' => count($zonas['isla-solitaria']),
            'descripcion' => '7 pts si hay 1'
        ],
        'rey-selva' => [
            'puntos' => $puntosRey,
            'cantidad' => count($zonas['rey-selva']),
            'descripcion' => '7 pts si hay 1'
        ],
        'dinos-rio' => [
            'puntos' => $puntosRio,
            'cantidad' => count($zonas['dinos-rio']),
            'descripcion' => 'Secuencia del río'
        ]
    ]
];

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

function calcularBosque($cantidad, $especies) {
    if ($cantidad == 0) return 0;
    
    $primerEspecie = $especies[0];
    foreach ($especies as $especie) {
        if ($especie != $primerEspecie) {
            return 0; 
        }
    }
    
    $tabla = [0, 1, 3, 6, 10, 15, 21];
    if ($cantidad >= count($tabla)) {
        return $tabla[count($tabla) - 1];
    }
    return $tabla[$cantidad];
}

function calcularPrado($cantidad, $especies) {
    if ($cantidad == 0) return 0;
    
    $especiesUnicas = array_unique($especies);
    if (count($especiesUnicas) != $cantidad) {
        return 0; 
    }
    
    $tabla = [0, 1, 3, 6, 10, 15, 21];
    if ($cantidad >= count($tabla)) {
        return $tabla[count($tabla) - 1];
    }
    return $tabla[$cantidad];
}

function calcularTrio($cantidad) {
    return ($cantidad == 3) ? 7 : 0;
}

function calcularPradera($cantidad) {
    $parejas = floor($cantidad / 2);
    return $parejas * 5;
}

function calcularIsla($cantidad) {
    return ($cantidad == 1) ? 7 : 0;
}

function calcularRey($cantidad) {
    return ($cantidad == 1) ? 7 : 0;
}

function calcularRio($cantidad) {
    $tabla = [0, 1, 3, 6, 10, 15, 21, 28];
    if ($cantidad >= count($tabla)) {
        return $tabla[count($tabla) - 1];
    }
    return $tabla[$cantidad];
}
?>