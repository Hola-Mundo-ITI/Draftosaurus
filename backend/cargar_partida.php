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

$id = null;
if (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
} else {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $p = json_decode($raw, true);
        if (is_array($p) && isset($p['id'])) $id = (int)$p['id'];
    }
}

if (!$id) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Missing id']);
    exit;
}

try {
    $pdo = obtenerPdo();
    $stmt = $pdo->prepare('SELECT id, usuario_id AS user_id, nombre, cantidad_bots AS bots_count, datos AS data, creado_en AS created_at FROM partidas_guardadas WHERE id = :id LIMIT 1');
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Not found']);
        exit;
    }

    if ((int)$row['user_id'] !== (int)$u['id']) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }

    // data is stored as JSON text in `data` column
    $dataParsed = null;
    try {
        $dataParsed = json_decode($row['data'], true);
    } catch (Throwable $e) {
        $dataParsed = null;
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'save' => [
        'id' => (int)$row['id'],
        'nombre' => $row['nombre'],
        'bots_count' => (int)$row['bots_count'],
        'created_at' => $row['created_at'],
        'data' => $dataParsed
    ]]);
    exit;
} catch (Throwable $e) {
    error_log('cargar_partida.php error: ' . $e->getMessage());
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Server error']);
    exit;
}
