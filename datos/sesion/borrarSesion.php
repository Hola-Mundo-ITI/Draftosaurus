<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once __DIR__ . '/../conexion/conexionBD.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    exit;
}

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!$datos) {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
    exit;
}


$sesion = new Sesion();
$accion = isset($datos['accion']) ? $datos['accion'] : '';

if ($accion === 'cerrar') {
    $resultado = $sesion->cerrarSesion();
    echo json_encode($resultado);
    
} elseif ($accion === 'borrar') {
    $email = isset($datos['email']) ? $datos['email'] : '';
    $password = isset($datos['password']) ? $datos['password'] : '';
    
    $resultado = $sesion->borrarUsuario($email, $password);
    echo json_encode($resultado);
    
} else {
    echo json_encode(['success' => false, 'error' => 'Accion no valida. Usa "cerrar" o "borrar"']);
}