<?php
require_once __DIR__ . '/../tablero.php';

function construirTablero($tableroEstado = null) {
    $tablero = new Tablero();
    
    if ($tableroEstado !== null) {
        $tablero->cargarEstado($tableroEstado);
    }
    
    return $tablero;
}

function validarColocacion($casillaId, $dino, $tableroEstado, $restriccionDado = null) {
    $tablero = construirTablero($tableroEstado);
    return $tablero->puedoColocar($casillaId, $dino, $restriccionDado);
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


function obtenerInfoZona($nombreZona) {
    $zonas = [
        'bosque-semejanza' => [
            'nombre' => 'Bosque Semejanza',
            'capacidad' => 6,
            'regla' => 'Todos los dinosaurios deben ser de la misma especie',
            'orden' => 'Llenar de izquierda a derecha'
        ],
        'prado-diferencia' => [
            'nombre' => 'Prado Diferencia',
            'capacidad' => 6,
            'regla' => 'Todos los dinosaurios deben ser de especies diferentes',
            'orden' => 'Llenar de izquierda a derecha'
        ],
        'trio-frondoso' => [
            'nombre' => 'Trío Frondoso',
            'capacidad' => 3,
            'regla' => 'Sin restricciones especiales',
            'orden' => 'Llenar de izquierda a derecha'
        ],
        'pradera-amor' => [
            'nombre' => 'Pradera del Amor',
            'capacidad' => 2,
            'regla' => 'Sin restricciones especiales',
            'orden' => 'Orden libre'
        ],
        'isla-solitaria' => [
            'nombre' => 'Isla Solitaria',
            'capacidad' => 1,
            'regla' => 'Solo un dinosaurio',
            'orden' => 'Orden libre'
        ],
        'rey-selva' => [
            'nombre' => 'Rey de la Selva',
            'capacidad' => 1,
            'regla' => 'Solo un dinosaurio',
            'orden' => 'Orden libre'
        ],
        'dinos-rio' => [
            'nombre' => 'Dinosaurios del Río',
            'capacidad' => 6,
            'regla' => 'Sin restricciones (siempre permite)',
            'orden' => 'Orden libre'
        ]
    ];
    
    return isset($zonas[$nombreZona]) ? $zonas[$nombreZona] : null;
}

function listarTodasLasZonas() {
    return [
        'bosque-semejanza',
        'prado-diferencia',
        'trio-frondoso',
        'pradera-amor',
        'isla-solitaria',
        'rey-selva',
        'dinos-rio'
    ];
}