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

// Leer body JSON
$raw = file_get_contents('php://input');
if (!$raw) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Empty body']);
    exit;
}

$payload = json_decode($raw, true);
if (!is_array($payload)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit;
}

$nombre = isset($payload['nombre']) ? trim((string)$payload['nombre']) : ('Partida ' . date('Y-m-d H:i:s'));
$bots_count = isset($payload['bots_count']) ? (int)$payload['bots_count'] : 0;
$gameState = $payload['gameState'] ?? null;

if ($gameState === null) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Missing gameState']);
    exit;
}

try {
    $pdo = obtenerPdo();
    $stmt = $pdo->prepare('INSERT INTO partidas_guardadas (usuario_id, nombre, cantidad_bots, datos) VALUES (:usuario_id, :nombre, :cantidad_bots, :datos)');
    $dataJson = json_encode($gameState, JSON_UNESCAPED_UNICODE);
    $stmt->bindValue(':usuario_id', $u['id'], PDO::PARAM_INT);
    $stmt->bindValue(':nombre', $nombre, PDO::PARAM_STR);
    $stmt->bindValue(':cantidad_bots', $bots_count, PDO::PARAM_INT);
    $stmt->bindValue(':datos', $dataJson, PDO::PARAM_STR);
    $stmt->execute();

    $id = (int)$pdo->lastInsertId();

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'id' => $id]);
    exit;
} catch (Throwable $e) {
    error_log('guardar_partida.php error: ' . $e->getMessage());
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Server error']);
    exit;
}
