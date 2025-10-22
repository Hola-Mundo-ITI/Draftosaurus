<?php
require_once 'calcularPuntos.php';

function procesarSolicitudPuntuacion() {
    $zonas = [
        'bosque-semejanza' => obtenerDinosDesdePost('bosque-semejanza'),
        'prado-diferencia' => obtenerDinosDesdePost('prado-diferencia'),
        'trio-frondoso' => obtenerDinosDesdePost('trio-frondoso'),
        'pradera-amor' => obtenerDinosDesdePost('pradera-amor'),
        'isla-solitaria' => obtenerDinosDesdePost('isla-solitaria'),
        'rey-selva' => obtenerDinosDesdePost('rey-selva'),
        'dinos-rio' => obtenerDinosDesdePost('dinos-rio')
    ];
    
    $calculador = new CalculadorPuntos();
    $resultado = $calculador->calcular($zonas);
    
    $detalles = [];
    foreach ($resultado['detalles'] as $nombreZona => $info) {
        $detalles[$nombreZona] = [
            'points' => $info['puntos'],
            'dinosaurCount' => $info['cantidad'],
            'description' => obtenerDescripcionZona($nombreZona)
        ];
    }
    
    return [
        'success' => true,
        'message' => 'Puntuacion calculada correctamente',
        'data' => [
            'totalScore' => $resultado['total'],
            'baseDetails' => $detalles,
            'bonuses' => 0
        ]
    ];
}

function obtenerDinosDesdePost($nombreZona) {
    $cantidad = isset($_POST[$nombreZona]) ? (int)$_POST[$nombreZona] : 0;
    $dinos = [];
    for ($i = 0; $i < $cantidad; $i++) {
        $dinos[] = 1;
    }
    return $dinos;
}

function obtenerDescripcionZona($nombreZona) {
    $descripciones = [
        'bosque-semejanza' => 'Puntos por dinosaurios del mismo tipo',
        'prado-diferencia' => 'Puntos por variedad de tipos',
        'trio-frondoso' => '7 puntos si tiene exactamente 3 dinosaurios',
        'pradera-amor' => 'Puntos por parejas completas',
        'isla-solitaria' => '7 puntos por el dinosaurio solitario',
        'rey-selva' => 'Puntos por el dinosaurio mas grande',
        'dinos-rio' => 'Puntos por secuencia en el rio'
    ];
    
    return isset($descripciones[$nombreZona]) ? $descripciones[$nombreZona] : '';
}
?>