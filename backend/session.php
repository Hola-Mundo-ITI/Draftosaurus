<?php
declare(strict_types=1);

/**
 * Configura cookies seguras para la sesión y abre la sesión si no está activa.
 */
function iniciarSesionSegura(): void {
    // Evitar reconfigurar parámetros si la sesión ya está activa
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    // Detectar si la conexión es segura (HTTPS)
    $esHttps = false;
    if (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') {
        $esHttps = true;
    } elseif (!empty($_SERVER['REQUEST_SCHEME']) && strtolower($_SERVER['REQUEST_SCHEME']) === 'https') {
        $esHttps = true;
    } elseif (!empty($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) {
        $esHttps = true;
    }

    $cookieParams = [
        'lifetime' => 0,
        'path' => '/',
        'secure' => $esHttps,
        'httponly' => true,
        'samesite' => 'Lax'
    ];

    // Establecer parámetros antes de iniciar la sesión
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params($cookieParams);
    } else {
        session_set_cookie_params($cookieParams['lifetime'], $cookieParams['path'], ini_get('session.cookie_domain') ?: '', $cookieParams['secure'], $cookieParams['httponly']);
    }

    session_start();
    // Marcar y regenerar si la sesión es nueva
    if (!isset($_SESSION['__iniciada'])) {
        session_regenerate_id(true);
        $_SESSION['__iniciada'] = time();
    }
}

/**
 * Retorna datos mínimos del usuario autenticado (id,email,name,role) o null si no hay sesión.
 */
function usuarioActual(): ?array {
    iniciarSesionSegura();

    // Comprobar diferentes convenciones de almacenamiento en sesión
    if (!empty($_SESSION['usuario']) && is_array($_SESSION['usuario'])) {
        $u = $_SESSION['usuario'];
    } elseif (!empty($_SESSION['user']) && is_array($_SESSION['user'])) {
        $u = $_SESSION['user'];
    } elseif (!empty($_SESSION['auth']) && is_array($_SESSION['auth'])) {
        $u = $_SESSION['auth'];
    } else {
        // Soporte para claves planas en $_SESSION
        if (isset($_SESSION['id']) || isset($_SESSION['email'])) {
            $u = [
                'id' => $_SESSION['id'] ?? null,
                'email' => $_SESSION['email'] ?? null,
                'name' => $_SESSION['name'] ?? ($_SESSION['nombre'] ?? null),
                'role' => $_SESSION['role'] ?? 'user'
            ];
        } else {
            return null;
        }
    }

    $id = isset($u['id']) ? (is_numeric($u['id']) ? (int)$u['id'] : $u['id']) : null;
    $email = isset($u['email']) ? (string)$u['email'] : null;
    $name = isset($u['name']) ? (string)$u['name'] : (isset($u['nombre']) ? (string)$u['nombre'] : null);
    $role = isset($u['role']) ? (string)$u['role'] : 'user';

    if ($id === null && $email === null) return null;

    return [
        'id' => $id,
        'email' => $email,
        'name' => $name,
        'role' => $role
    ];
}

/**
 * Detecta si la petición es AJAX o espera JSON por cabeceras.
 */
function esSolicitudAjax(): bool {
    $xrw = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    if (!empty($xrw) && strtolower($xrw) === 'xmlhttprequest') return true;

    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    if (stripos($accept, 'application/json') !== false) return true;

    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    if (stripos($contentType, 'application/json') !== false) return true;

    return false;
}

/**
 * Exige que el usuario esté autenticado; responde 401 JSON para AJAX o redirige a /logear.php en HTML.
 * Guarda la URL solicitada para redirigir al usuario después del login.
 */
function exigirLogin(): void {
    iniciarSesionSegura();

    if (usuarioActual() !== null) return;

    if (esSolicitudAjax()) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        // Detener ejecución de forma limpia
        exit;
    }

    // No almacenar ni permitir redirecciones personalizadas después del login.
    // Construir una URL hacia logear.php en el mismo directorio base que el script solicitado.
    $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
    $baseDir = rtrim(dirname($scriptName), '/\\');
    if ($baseDir === '' || $baseDir === '.' || $baseDir === '/') {
        $loginUrl = '/logear.php';
    } else {
        $loginUrl = $baseDir . '/logear.php';
    }

    // Redirigir al formulario de login SIN parámetros de 'redirect' para evitar que se pueda
    // indicar una URL de destino arbitraria. El manejador de login decidirá el destino fijo.
    header('Location: ' . $loginUrl);
    exit;
}

/**
 * Indica si el usuario autenticado posee rol de administrador.
 */
function esAdmin(): bool {
    $u = usuarioActual();
    if ($u === null) return false;
    return isset($u['role']) && $u['role'] === 'admin';
}