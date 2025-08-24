<?php
// Wrapper minimal que delega en ScoreCalculator (centraliza la lógica de puntuación)
require_once __DIR__ . '/ScoreCalculator.php';

// Delegar toda la lógica y respuesta HTTP al manejador estático
ScoreCalculator::handleHttpRequest();
?>
