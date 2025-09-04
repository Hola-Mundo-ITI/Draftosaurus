-- Por qué usamos ENGINE=InnoDB:
-- pq es el default de MySQL desde la verison 5.5 xD

CREATE DATABASE IF NOT EXISTS `draftosaurus`
  DEFAULT CHARACTER SET = utf8mb4
  DEFAULT COLLATE = utf8mb4_unicode_ci;

USE `draftosaurus`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `correo` VARCHAR(255) NOT NULL,
  `nombre_usuario` VARCHAR(100) NOT NULL,
  `hash_contrasena` VARCHAR(255) NOT NULL,
  `rol` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_correo` (`correo`),
  KEY `idx_usuarios_creado_en` (`creado_en`)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Tabla para almacenar estados guardados de partidas por usuario
CREATE TABLE IF NOT EXISTS `partidas_guardadas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(200) NOT NULL DEFAULT 'Partida guardada',
  `cantidad_bots` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `datos` JSON NOT NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_partidas_usuario` (`usuario_id`),
  KEY `idx_partidas_creado_en` (`creado_en`),
  CONSTRAINT `fk_partidas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Tabla canonical de roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `es_por_defecto` TINYINT(1) NOT NULL DEFAULT 0,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_roles_clave` (`clave`)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Tabla de asignación many-to-many entre usuarios y roles 
CREATE TABLE IF NOT EXISTS `roles_usuarios` (
  `usuario_id` INT UNSIGNED NOT NULL,
  `rol_id` INT UNSIGNED NOT NULL,
  `asignado_por` INT UNSIGNED DEFAULT NULL,
  `asignado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_id`, `rol_id`),
  KEY `idx_roles_usuarios_rol` (`rol_id`),
  CONSTRAINT `fk_roles_usuarios_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_roles_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Insertar roles por defecto (si no existen)
INSERT INTO `roles` (`clave`, `nombre`, `es_por_defecto`)
SELECT * FROM (SELECT 'user' AS `clave`, 'Usuario' AS `nombre`, 1 AS `es_por_defecto`) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `clave` = 'user') LIMIT 1;

INSERT INTO `roles` (`clave`, `nombre`, `es_por_defecto`)
SELECT * FROM (SELECT 'admin' AS `clave`, 'Administrador' AS `nombre`, 0 AS `es_por_defecto`) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM `roles` WHERE `clave` = 'admin') LIMIT 1;

-- Migrar valores existentes de la columna usuarios.rol a roles_usuarios (ejecutar UNA sola vez)
-- Esta sentencia añade una fila en roles_usuarios por cada usuario que ya tiene usuarios.rol definido.
INSERT INTO `roles_usuarios` (`usuario_id`, `rol_id`, `asignado_por`, `asignado_en`)
SELECT u.id AS usuario_id, r.id AS rol_id, NULL AS asignado_por, NOW() AS asignado_en
FROM `usuarios` u
JOIN `roles` r ON r.`clave` = u.rol
LEFT JOIN `roles_usuarios` ur ON ur.usuario_id = u.id AND ur.rol_id = r.id
WHERE u.rol IS NOT NULL AND ur.usuario_id IS NULL;

-- aun no esta colocado el sistema de roles con los endpoints (session.php, etc etc)

-- Índices adicionales si se requiere consulta frecuente por es_por_defecto
CREATE INDEX `idx_roles_es_por_defecto` ON `roles` (`es_por_defecto`);

-- FIN de la sección de Roles
