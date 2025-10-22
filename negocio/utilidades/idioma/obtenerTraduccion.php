<?php
session_start();
header('Content-Type: application/json');

require_once 'idiomas.php';

$traductor = new Traductor();

$claves = [
    'ver_puntos',
    'puntuacion',
    'total',
    'zona',
    'dinos',
    'puntos',
    'cerrar',
    'bosque_semejanza',
    'prado_diferencia',
    'trio_frondoso',
    'pradera_amor',
    'isla_solitaria',
    'rey_selva',
    'dinos_rio',
    'debe_lanzar_dado',
    'debe_colocar_dino',
    'ya_lanzaste_dado',
    'ronda_completada',
    'partida_finalizada',
    'nueva_partida',
    'turno_de',
    'completa_nombres',
    'no_jugadores',
    'partida_guardada',
    'resultado_puntuacion',
    'puntuacion_total',
    'desglose_zona',
    'desc_bosque',
    'desc_prado',
    'desc_trio',
    'desc_pradera',
    'desc_isla',
    'desc_rey',
    'desc_rio'
];

$traducciones = [];
foreach ($claves as $clave) {
    $traducciones[$clave] = $traductor->traducir($clave);
}

echo json_encode([
    'success' => true,
    'traducciones' => $traducciones
]);
?>