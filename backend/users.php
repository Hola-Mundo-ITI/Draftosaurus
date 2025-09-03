<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/session.php';

iniciarSesionSegura();
exigirLogin();

$esAdminGlobal = false;
if (function_exists('esAdmin')) {
    $esAdminGlobal = esAdmin();
} else {
    $usuarioActual = function_exists('usuarioActual') ? usuarioActual() : null;
    $esAdminGlobal = isset($usuarioActual['role']) && $usuarioActual['role'] === 'admin';
}

if (!$esAdminGlobal) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Forbidden']);
    exit;
}

/**
 * Lee la entrada JSON del cuerpo de la petición o devuelve datos desde $_POST como fallback.
 */
function leerJsonEntrada(): array {
    $raw = file_get_contents('php://input');
    if ($raw !== false && trim($raw) !== '') {
        $decoded = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
    }
    return $_POST ?? [];
}

/**
 * Valida que un email tenga formato correcto y lo normaliza en minúsculas.
 */
function validarEmail(string $email): ?string {
    $norm = mb_strtolower(trim($email));
    if (!filter_var($norm, FILTER_VALIDATE_EMAIL)) return null;
    return $norm;
}

/**
 * Obtiene el conteo total de usuarios que coinciden con la búsqueda opcional.
 */
function contarUsuarios(PDO $pdo, ?string $q = null): int {
    if ($q === null || $q === '') {
        $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM usuarios');
        $stmt->execute();
        $r = $stmt->fetch();
        return (int)($r['c'] ?? 0);
    }
    $like = "%{$q}%";
    $stmt = $pdo->prepare('SELECT COUNT(*) AS c FROM usuarios WHERE correo LIKE :like OR nombre_usuario LIKE :like');
    $stmt->execute([':like' => $like]);
    $r = $stmt->fetch();
    return (int)($r['c'] ?? 0);
}

/**
 * Recupera una lista paginada de usuarios con búsqueda y ordenamiento mínimo.
 */
function obtenerUsuariosList(PDO $pdo, int $page, int $perPage, ?string $q = null, string $sort = 'created_at', string $order = 'desc'): array {
    $offset = max(0, ($page - 1) * $perPage);
    $allowedSort = ['created_at', 'email'];
    $sortCol = 'creado_en';
    if (in_array($sort, $allowedSort, true)) {
        $sortCol = ($sort === 'created_at') ? 'creado_en' : 'correo';
    }
    $orderDir = strtolower($order) === 'asc' ? 'ASC' : 'DESC';

    if ($q === null || $q === '') {
        $sql = "SELECT id, correo AS email, nombre_usuario AS nombre, rol AS role, creado_en AS created_at FROM usuarios ORDER BY {$sortCol} {$orderDir} LIMIT :lim OFFSET :off";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        $like = "%{$q}%";
        $sql = "SELECT id, correo AS email, nombre_usuario AS nombre, rol AS role, creado_en AS created_at FROM usuarios WHERE correo LIKE :like OR nombre_usuario LIKE :like ORDER BY {$sortCol} {$orderDir} LIMIT :lim OFFSET :off";
        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':like', $like, PDO::PARAM_STR);
        $stmt->bindValue(':lim', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    return $rows ?: [];
}

/**
 * Recupera un usuario por su id, o null si no existe.
 */
function obtenerUsuarioPorId(PDO $pdo, int $id): ?array {
    $stmt = $pdo->prepare('SELECT id, correo AS email, nombre_usuario AS nombre, rol AS role, creado_en AS created_at FROM usuarios WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

/**
 * Verifica si existe otro usuario con el mismo email distinto al id dado.
 */
function existeEmailEnOtro(PDO $pdo, string $email, ?int $excludeId = null): bool {
    if ($excludeId === null) {
        $stmt = $pdo->prepare('SELECT 1 FROM usuarios WHERE correo = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
    } else {
        $stmt = $pdo->prepare('SELECT 1 FROM usuarios WHERE correo = :email AND id != :id LIMIT 1');
        $stmt->execute([':email' => $email, ':id' => $excludeId]);
    }
    return (bool)$stmt->fetchColumn();
}

/**
 * Cuenta cuántos administradores existen actualmente en la tabla usuarios.
 */
function contarAdmins(PDO $pdo): int {
    $stmt = $pdo->prepare("SELECT COUNT(*) AS c FROM usuarios WHERE rol = 'admin'");
    $stmt->execute();
    $r = $stmt->fetch();
    return (int)($r['c'] ?? 0);
}

/**
 * Crea un nuevo usuario en la base de datos usando una transacción. Devuelve el usuario creado.
 */
function crearUsuario(PDO $pdo, array $datos): array {
    $email = validarEmail((string)($datos['email'] ?? ''));
    if ($email === null) {
        throw new InvalidArgumentException('Email inválido');
    }
    $nombre = trim((string)($datos['nombre'] ?? ''));
    if ($nombre === '') {
        throw new InvalidArgumentException('Nombre requerido');
    }
    $password = (string)($datos['password'] ?? '');
    if (mb_strlen($password) < 8) {
        throw new InvalidArgumentException('Password débil');
    }
    $role = in_array(($datos['role'] ?? 'user'), ['user', 'admin'], true) ? $datos['role'] : 'user';

    if (existeEmailEnOtro($pdo, $email, null)) {
        throw new RuntimeException('Email existente');
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare('INSERT INTO usuarios (correo, nombre_usuario, hash_contrasena, rol, creado_en) VALUES (:email, :name, :hash, :role, NOW())');
        $stmt->execute([':email' => $email, ':name' => $nombre, ':hash' => $hash, ':role' => $role]);
        $newId = (int)$pdo->lastInsertId();
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }

    $usuario = obtenerUsuarioPorId($pdo, $newId);
    return $usuario ?? ['id' => $newId, 'email' => $email, 'nombre' => $nombre, 'role' => $role];
}

/**
 * Actualiza un usuario existente dentro de una transacción y devuelve el usuario actualizado.
 */
function actualizarUsuario(PDO $pdo, int $id, array $datos, array $usuarioRequestor): array {
    $existente = obtenerUsuarioPorId($pdo, $id);
    if ($existente === null) {
        throw new OutOfBoundsException('No encontrado');
    }

    $nuevos = [];

    if (isset($datos['email'])) {
        $emailNorm = validarEmail((string)$datos['email']);
        if ($emailNorm === null) throw new InvalidArgumentException('Email inválido');
        if (existeEmailEnOtro($pdo, $emailNorm, $id)) throw new RuntimeException('Email existente');
        $nuevos['correo'] = $emailNorm;
    }

    if (isset($datos['nombre'])) {
        $nombre = trim((string)$datos['nombre']);
        if ($nombre === '') throw new InvalidArgumentException('Nombre requerido');
        $nuevos['nombre_usuario'] = $nombre;
    }

    if (isset($datos['password']) && trim((string)$datos['password']) !== '') {
        $pw = (string)$datos['password'];
        if (mb_strlen($pw) < 8) throw new InvalidArgumentException('Password débil');
        $nuevos['hash_contrasena'] = password_hash($pw, PASSWORD_DEFAULT);
    }

    if (isset($datos['role'])) {
        $role = $datos['role'] === 'admin' ? 'admin' : 'user';
        if ($usuarioRequestor['id'] === $id && $role !== 'admin') {
            throw new InvalidArgumentException('Un administrador no puede degradarse a sí mismo mediante este endpoint');
        }
        $nuevos['rol'] = $role;
    }

    if (empty($nuevos)) return $existente;

    try {
        $pdo->beginTransaction();
        $setParts = [];
        $params = [':id' => $id];
        foreach ($nuevos as $col => $val) {
            $setParts[] = "{$col} = :{$col}";
            $params[":{$col}"] = $val;
        }
        $sql = 'UPDATE usuarios SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }

    $actualizado = obtenerUsuarioPorId($pdo, $id);
    return $actualizado ?: $existente;
}

/**
 * Elimina físicamente un usuario verificando reglas sobre administradores y retornando true si se eliminó.
 */
function eliminarUsuario(PDO $pdo, int $id, array $usuarioRequestor): bool {
    if ($usuarioRequestor['id'] === $id) {
        throw new InvalidArgumentException('No se permite eliminar la propia cuenta mediante este endpoint');
    }

    $stmt = $pdo->prepare('SELECT id, rol AS role FROM usuarios WHERE id = :id');
    $stmt->execute([':id' => $id]);
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$fila) throw new OutOfBoundsException('No encontrado');

    if (($fila['role'] ?? '') === 'admin') {
        $totalAdmins = contarAdmins($pdo);
        if ($totalAdmins <= 1) {
            throw new RuntimeException('No se puede eliminar el último administrador');
        }
    }

    try {
        $pdo->beginTransaction();
        $del = $pdo->prepare('DELETE FROM usuarios WHERE id = :id');
        $del->execute([':id' => $id]);
        $pdo->commit();
        return true;
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

try {
    $pdo = obtenerPdo();

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id !== null) {
            $usuario = obtenerUsuarioPorId($pdo, $id);
            if ($usuario === null) {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'No encontrado']);
                exit;
            }
            echo json_encode(['success' => true, 'usuario' => $usuario]);
            exit;
        }

        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? min(100, max(1, (int)$_GET['per_page'])) : 20;
        $q = isset($_GET['q']) ? trim((string)$_GET['q']) : null;
        $sort = isset($_GET['sort']) ? (string)$_GET['sort'] : 'created_at';
        $order = isset($_GET['order']) ? (string)$_GET['order'] : 'desc';

        $total = contarUsuarios($pdo, $q);
        $usuarios = obtenerUsuariosList($pdo, $page, $perPage, $q, $sort, $order);

        echo json_encode(['success' => true, 'meta' => ['total' => $total, 'page' => $page, 'per_page' => $perPage], 'usuarios' => $usuarios]);
        exit;
    }

    if (in_array($method, ['POST', 'PUT', 'DELETE'], true)) {
        $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
        $xrw = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
        if (strpos((string)$accept, 'application/json') === false && strtolower((string)$xrw) !== 'xmlhttprequest') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Se requiere Accept: application/json o X-Requested-With: XMLHttpRequest']);
            exit;
        }
    }

    if ($method === 'POST') {
        $datos = leerJsonEntrada();
        try {
            $usuarioCreado = crearUsuario($pdo, $datos);
            http_response_code(201);
            echo json_encode(['success' => true, 'usuario' => $usuarioCreado]);
            exit;
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        } catch (RuntimeException $e) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Email ya existe']);
            exit;
        }
    }

    if ($method === 'PUT') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Falta id']);
            exit;
        }
        $datos = leerJsonEntrada();
        $usuarioRequestor = function_exists('usuarioActual') ? usuarioActual() : null;
        if (!$usuarioRequestor) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        try {
            $actualizado = actualizarUsuario($pdo, $id, $datos, $usuarioRequestor);
            echo json_encode(['success' => true, 'usuario' => $actualizado]);
            exit;
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        } catch (RuntimeException $e) {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Email ya existe']);
            exit;
        } catch (OutOfBoundsException $e) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
            exit;
        }
    }

    if ($method === 'DELETE') {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id === null) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Falta id']);
            exit;
        }
        $usuarioRequestor = function_exists('usuarioActual') ? usuarioActual() : null;
        if (!$usuarioRequestor) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            exit;
        }
        try {
            $eliminado = eliminarUsuario($pdo, $id, $usuarioRequestor);
            echo json_encode(['success' => true]);
            exit;
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        } catch (RuntimeException $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
            exit;
        } catch (OutOfBoundsException $e) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'No encontrado']);
            exit;
        }
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;

} catch (Throwable $e) {
    error_log('[users.php] ' . $e->getMessage() . '\n' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
    exit;
}

/*
Ejemplos curl de prueba (usar cookie con sesión de admin):

curl -X GET 'http://localhost/proyecto/Draftosaurus/backend/users.php?page=1&per_page=20' -b cookies.txt -H 'Accept: application/json'

curl -X GET 'http://localhost/proyecto/Draftosaurus/backend/users.php?id=123' -b cookies.txt -H 'Accept: application/json'

curl -X POST 'http://localhost/proyecto/Draftosaurus/backend/users.php' -b cookies.txt -c cookies.txt -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"email":"nuevo@ejemplo.com","nombre":"Nuevo","password":"Secreta123","role":"user"}'

curl -X PUT 'http://localhost/proyecto/Draftosaurus/backend/users.php?id=123' -b cookies.txt -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"nombre":"NuevoNombre","role":"admin"}'

curl -X DELETE 'http://localhost/proyecto/Draftosaurus/backend/users.php?id=123' -b cookies.txt -H 'Accept: application/json'

Nota de limitaciones:
- CSRF: este endpoint requiere Accept: application/json ó X-Requested-With como medida mínima; se recomienda implementar token CSRF en producción.
- Soft-delete: no se implementó soft-delete; la eliminación es física (DELETE).
- Logs de auditoría: se registran errores en error_log pero no hay tabla audit_log implementada aquí.
*/
