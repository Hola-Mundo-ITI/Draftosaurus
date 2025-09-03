<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

iniciarSesionSegura();

/**
 * Maneja el registro de nuevos usuarios: valida datos, crea el registro en la BD
 * y establece la sesión con datos mínimos (id,email,name,role).
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
    $nombre = isset($datos['nombre']) ? trim((string)$datos['nombre']) : '';
    $password = isset($datos['password']) ? (string)$datos['password'] : '';

    // Validaciones
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email inválido.']);
        exit;
    }
    if ($nombre === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nombre requerido.']);
        exit;
    }
    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres.']);
        exit;
    }

    $pdo = obtenerPdo();

    // Verificar existencia de email (usar columna correo)
    $stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $existe = $stmt->fetch();
    if ($existe) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'El email ya está registrado.']);
        exit;
    }

    // Insertar usuario usando columnas en español
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $role = 'user';
    $ins = $pdo->prepare('INSERT INTO usuarios (correo, nombre_usuario, hash_contrasena, rol) VALUES (:email, :name, :password_hash, :role)');
    $ins->execute([
        ':email' => $email,
        ':name' => $nombre,
        ':password_hash' => $hash,
        ':role' => $role
    ]);

    $userId = (int)$pdo->lastInsertId();

    // Registrar en sesión (mantener claves esperadas por la app)
    session_regenerate_id(true);
    $_SESSION['usuario'] = [
        'id' => $userId,
        'email' => $email,
        'name' => $nombre,
        'role' => $role
    ];

 
    $redirectUrl = 'index.php';

    echo json_encode([
        'success' => true,
        'redirect' => $redirectUrl,
        'usuario' => [
            'id' => $userId,
            'email' => $email,
            'name' => $nombre,
            'role' => $role
        ]
    ]);
    exit;
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno del servidor.']);
    exit;
}
