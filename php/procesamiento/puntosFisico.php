<?php

function procesarSolicitudPuntuacion() {
    // Obtiene los datos del formulario
    $bosque = isset($_POST['bosque-semejanza']) ? (int)$_POST['bosque-semejanza'] : 0;
    $prado = isset($_POST['prado-diferencia']) ? (int)$_POST['prado-diferencia'] : 0;
    $trio = isset($_POST['trio-frondoso']) ? (int)$_POST['trio-frondoso'] : 0;
    $pradera = isset($_POST['pradera-amor']) ? (int)$_POST['pradera-amor'] : 0;
    $isla = isset($_POST['isla-solitaria']) ? (int)$_POST['isla-solitaria'] : 0;
    $rey = isset($_POST['rey-selva']) ? (int)$_POST['rey-selva'] : 0;
    $rio = isset($_POST['dinos-rio']) ? (int)$_POST['dinos-rio'] : 0;
    
 
    $puntosBosque = calcularBosque($bosque);
    $puntosPrado = calcularPrado($prado);
    $puntosTrio = calcularTrio($trio);
    $puntosPradera = calcularPradera($pradera);
    $puntosIsla = calcularIsla($isla);
    $puntosRey = calcularRey($rey);
    $puntosRio = calcularRio($rio);
    

    $total = $puntosBosque + $puntosPrado + $puntosTrio + $puntosPradera + 
             $puntosIsla + $puntosRey + $puntosRio;
    
    // Preparar detalles por zona
    $detalles = [
        'bosque-semejanza' => [
            'points' => $puntosBosque,
            'dinosaurCount' => $bosque,
            'description' => 'Puntos por dinosaurios del mismo tipo'
        ],
        'prado-diferencia' => [
            'points' => $puntosPrado,
            'dinosaurCount' => $prado,
            'description' => 'Puntos por variedad de tipos'
        ],
        'trio-frondoso' => [
            'points' => $puntosTrio,
            'dinosaurCount' => $trio,
            'description' => '7 puntos si tiene exactamente 3 dinosaurios'
        ],
        'pradera-amor' => [
            'points' => $puntosPradera,
            'dinosaurCount' => $pradera,
            'description' => 'Puntos por parejas completas'
        ],
        'isla-solitaria' => [
            'points' => $puntosIsla,
            'dinosaurCount' => $isla,
            'description' => '7 puntos por el dinosaurio solitario'
        ],
        'rey-selva' => [
            'points' => $puntosRey,
            'dinosaurCount' => $rey,
            'description' => 'Puntos por el dinosaurio más grande'
        ],
        'dinos-rio' => [
            'points' => $puntosRio,
            'dinosaurCount' => $rio,
            'description' => 'Puntos por secuencia en el río'
        ]
    ];
    
    // Devolver resultado
    return [
        'success' => true,
        'message' => 'Puntuación calculada correctamente',
        'data' => [
            'totalScore' => $total,
            'baseDetails' => $detalles,
            'bonuses' => 0
        ]
    ];
}


function calcularBosque($cantidad) {
    $tabla = [0, 1, 3, 6, 10, 15, 21];
    if ($cantidad >= count($tabla)) {
        return $tabla[count($tabla) - 1];
    }
    return $tabla[$cantidad];
}


function calcularPrado($cantidad) {
    $tabla = [0, 1, 3, 6, 10, 15, 21];
    if ($cantidad >= count($tabla)) {
        return $tabla[count($tabla) - 1];
    }
    return $tabla[$cantidad];
}


function calcularTrio($cantidad) {
    if ($cantidad == 3) {
        return 7;
    }
    return 0;
}


function calcularPradera($cantidad) {
    // Cada 2 dinosaurios = 1 pareja = 5 puntos
    $parejas = floor($cantidad / 2);
    return $parejas * 5;
}


function calcularIsla($cantidad) {
    if ($cantidad == 1) {
        return 7;
    }
    return 0;
}


function calcularRey($cantidad) {
    if ($cantidad == 1) {
        return 7;
    }
    return 0;
}

function calcularRio($cantidad) {
    $tabla = [0, 1, 3, 6, 10, 15, 21, 28];
    if ($cantidad >= count($tabla)) {
        return $tabla[count($tabla) - 1];
    }
    return $tabla[$cantidad];
}