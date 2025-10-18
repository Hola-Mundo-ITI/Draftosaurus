<?php
session_start();
header('Content-Type: application/json');

require_once 'idiomas.php';

$traducciones = [
    'ver_puntos' => t('ver_puntos'),
    'puntuacion' => t('puntuacion'),
    'total' => t('total'),
    'zona' => t('zona'),
    'dinos' => t('dinos'),
    'puntos' => t('puntos'),
    'cerrar' => t('cerrar'),
    'bosque_semejanza' => t('bosque_semejanza'),
    'prado_diferencia' => t('prado_diferencia'),
    'trio_frondoso' => t('trio_frondoso'),
    'pradera_amor' => t('pradera_amor'),
    'isla_solitaria' => t('isla_solitaria'),
    'rey_selva' => t('rey_selva'),
    'dinos_rio' => t('dinos_rio'),
    'debe_lanzar_dado' => t('debe_lanzar_dado'),
    'debe_colocar_dino' => t('debe_colocar_dino'),
    'ya_lanzaste_dado' => t('ya_lanzaste_dado'),
    'ronda_completada' => t('ronda_completada'),
    'partida_finalizada' => t('partida_finalizada'),
    'nueva_partida' => t('nueva_partida'),
    'turno_de' => t('turno_de'),
    'completa_nombres' => t('completa_nombres'),
    'no_jugadores' => t('no_jugadores'),
    'partida_guardada' => t('partida_guardada'),
    'resultado_puntuacion' => t('resultado_puntuacion'),
    'puntuacion_total' => t('puntuacion_total'),
    'desglose_zona' => t('desglose_zona'),
    'desc_bosque' => t('desc_bosque'),
    'desc_prado' => t('desc_prado'),
    'desc_trio' => t('desc_trio'),
    'desc_pradera' => t('desc_pradera'),
    'desc_isla' => t('desc_isla'),
    'desc_rey' => t('desc_rey'),
    'desc_rio' => t('desc_rio')
];

echo json_encode([
    'success' => true,
    'traducciones' => $traducciones
]);
?>