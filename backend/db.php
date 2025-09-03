<?php
// filepath: backend/db.php

declare(strict_types=1);

/**
 * Establece y retorna una conexión PDO a MySQL en modo singleton.
 * Configura utf8mb4, activa excepciones y desactiva emulación de prepares.
 * Lee DSN/usuario/clave desde variables de entorno con valores por defecto seguros.
 */
function obtenerPdo(): PDO {
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = getenv('DB_DSN') !== false ? (string)getenv('DB_DSN') : 'mysql:host=127.0.0.1;dbname=draftosaurus;charset=utf8mb4';
    $user = getenv('DB_USER') !== false ? (string)getenv('DB_USER') : 'root';
    $pass = getenv('DB_PASS') !== false ? (string)getenv('DB_PASS') : '';

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        // Opcional: establecer timeout de conexión si el driver lo soporta
        PDO::ATTR_TIMEOUT => 5
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
        // Asegurar que la conexión use utf8mb4 si DSN no lo definió
        try {
            $pdo->exec("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
        } catch (Throwable $e) {
            // No interrumpir si el driver no soporta exec en este contexto
        }

        return $pdo;
    } catch (Throwable $e) {
        throw new RuntimeException('No se pudo conectar a la base de datos.');
    }
}

// Prueba manual (descomentar para testear localmente):
// try { $pdo = obtenerPdo(); echo 'OK'; } catch (Throwable $e) { echo 'ERROR'; }
