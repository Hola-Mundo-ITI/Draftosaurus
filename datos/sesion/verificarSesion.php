<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../conexion/conexionBD.php';

$sesion = new Sesion();
$resultado = $sesion->verificarSesion();

echo json_encode($resultado);