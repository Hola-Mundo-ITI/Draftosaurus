<?php
session_start();
header('Content-Type: application/json');

require_once 'idiomas.php';

$datos = json_decode(file_get_contents('php://input'), true);

if (!isset($datos['idioma'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Idioma no especificado'
    ]);
    exit;
}

$nuevoIdioma = $datos['idioma'];

if ($nuevoIdioma !== 'es' && $nuevoIdioma !== 'en') {
    echo json_encode([
        'success' => false,
        'error' => 'Idioma no valido'
    ]);
    exit;
}

$_SESSION['idioma'] = $nuevoIdioma;

echo json_encode([
    'success' => true,
    'idioma' => $nuevoIdioma
]);
?>