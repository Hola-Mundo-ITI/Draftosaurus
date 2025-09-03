<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/session.php';

iniciarSesionSegura();

/**
 * Retorna información de la sesión actual: datos del usuario o null si no existe.
 */
try {
    $usuario = usuarioActual();
    echo json_encode(['success' => true, 'usuario' => $usuario]);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'usuario' => null, 'error' => 'Error interno del servidor.']);
    exit;
}
