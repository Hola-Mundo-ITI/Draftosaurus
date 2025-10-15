<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/Sesion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    exit;
}

//ajustar para utilizar $_POST en los casos que sea necesario
$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!$datos) {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}

$email = isset($datos['email']) ? $datos['email'] : '';
$password = isset($datos['password']) ? $datos['password'] : '';

$sesion = new Sesion();
$resultado = $sesion->iniciarSesion($email, $password);

echo json_encode($resultado);