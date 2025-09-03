<?php
declare(strict_types=1);

// Iniciar buffer para capturar cualquier salida accidental
ob_start();

// Responder siempre JSON
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/session.php';

try {
    // Asegurar que la sesión esté iniciada con los parámetros seguros
    if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();

    // Limpiar datos de sesión en memoria
    $_SESSION = [];

    // Intentar eliminar la cookie de sesión en el cliente usando los mismos parámetros
    $params = session_get_cookie_params();

    if (ini_get('session.use_cookies')) {
        $name = session_name();
        $expire = time() - 42000;


        if (defined('PHP_VERSION_ID') && PHP_VERSION_ID >= 70300) {
            $options = [
                'expires' => $expire,
                'path' => $params['path'] ?? '/',
                'domain' => $params['domain'] ?? '',
                'secure' => !empty($params['secure']),
                'httponly' => !empty($params['httponly'])
            ];
            if (isset($params['samesite'])) $options['samesite'] = $params['samesite'];
            setcookie($name, '', $options);
        } else {

            setcookie(
                $name,
                '',
                $expire,
                $params['path'] ?? '/',
                $params['domain'] ?? '',
                (bool)($params['secure'] ?? false),
                (bool)($params['httponly'] ?? true)
            );
        }
    }

    // Liberar variables de sesión y destruir la sesión del servidor
    if (function_exists('session_unset')) session_unset();
    session_destroy();

    // Limpiar buffer y devolver JSON limpio
    if (ob_get_length() !== false) ob_end_clean();
    echo json_encode(['success' => true]);
    exit;

} catch (Throwable $e) {
    // Asegurar que el buffer se limpie y devolver error JSON
    if (ob_get_length() !== false) ob_end_clean();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno al cerrar la sesión.']);
    exit;
}
