<?php
declare(strict_types=1);
require_once __DIR__ . '/session.php';
require_once __DIR__ . '/db.php';

iniciarSesionSegura();
$u = usuarioActual();
if ($u === null) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $pdo = obtenerPdo();
    $stmt = $pdo->prepare('SELECT id, nombre, cantidad_bots AS bots_count, creado_en AS created_at FROM partidas_guardadas WHERE usuario_id = :uid ORDER BY creado_en DESC LIMIT 100');
    $stmt->bindValue(':uid', $u['id'], PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'saves' => $rows]);
    exit;
} catch (Throwable $e) {
    error_log('listar_partidas.php error: ' . $e->getMessage());
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Server error']);
    exit;
}
