<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

iniciarSesionSegura();

/**
 * Maneja el inicio de sesión: valida credenciales, autentica y establece la sesión.
 */
try {
    // Leer payload JSON si existe, sino usar $_POST
    $raw = file_get_contents('php://input');
    $datos = [];
    if ($raw !== false && strlen(trim($raw)) > 0) {
        $json = json_decode($raw, true);
        if (is_array($json)) $datos = $json;
    }
    if (empty($datos)) {
        $datos = $_POST;
    }

    $email = isset($datos['email']) ? trim((string)$datos['email']) : '';
    $password = isset($datos['password']) ? (string)$datos['password'] : '';

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email y contraseña son requeridos.']);
        exit;
    }

    $pdo = obtenerPdo();


    $stmt = $pdo->prepare('SELECT id, correo AS email, nombre_usuario AS name, hash_contrasena AS password_hash, rol AS role FROM usuarios WHERE correo = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Evitar revelar existencia de cuenta: responde 401 si falla 
    if (!$user || !isset($user['password_hash']) || !password_verify($password, (string)$user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Credenciales inválidas.']);
        exit;
    }

    // Autenticación exitosa: regenera id y guardar datos mínimos en sesión
    session_regenerate_id(true);
    $_SESSION['usuario'] = [
        'id' => (int)$user['id'],
        'email' => (string)$user['email'],
        'name' => (string)$user['name'],
        'role' => isset($user['role']) ? (string)$user['role'] : 'user'
    ];

    // No se permite redirigir a URLs almacenadas en sesión ni a parámetros externos.
    $redirectUrl = 'index.php';

    echo json_encode([
        'success' => true,
        'redirect' => $redirectUrl,
        'usuario' => [
            'id' => (int)$user['id'],
            'email' => (string)$user['email'],
            'name' => (string)$user['name'],
            'role' => $_SESSION['usuario']['role']
        ]
    ]);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor.']);
    exit;
}
