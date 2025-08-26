<?php

/*
 * Script calcularPuntuacion.php:
 * Endpoint ligero que delega en ScoreCalculator para calcular y devolver
 * el informe de puntuación. Mantiene la compatibilidad con la API que
 * espera un POST con los datos necesarios.
 */

require_once __DIR__ . '/ScoreCalculator.php';

ScoreCalculator::handleHttpRequest();
?>
