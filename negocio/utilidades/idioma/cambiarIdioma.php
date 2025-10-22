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

$traductor = new Traductor();
$resultado = $traductor->cambiarIdioma($nuevoIdioma);

if ($resultado) {
    echo json_encode([
        'success' => true,
        'idioma' => $nuevoIdioma
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Idioma no valido'
    ]);
}
?>