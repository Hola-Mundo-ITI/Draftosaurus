# Documentación: backend/

Resumen rápido
- Lenguaje: PHP (7+). API REST estilo ligero con scripts que devuelven JSON.
- Autenticación: se usa backend/session.php. La mayoría de endpoints exigen sesión iniciada y usan iniciarSesionSegura() y exigirLogin().
- Conexión BD: backend/db.php provee obtenerPdo() (singleton) y lee DSN/usuario/clave desde variables de entorno (DB_DSN, DB_USER, DB_PASS).
- Formato JSON: los endpoints normalizan entrada JSON (file_get_contents('php://input')) y responden JSON con encabezado application/json; charset=utf-8.
- Logs: error_log() y archivos backend/php_errors.log y validarMovimiento_errors.log para errores concretos.

Estructura y descripción por archivo

ActiveRestrictions.php
- Clase que describe las restricciones activas (caras del dado).
- Genera mensajes legibles para el frontend y se diseña para serializarse y consumirse desde UI o validadores.
- No realiza validaciones profundas; asume que la cara del dado está bien formada.

PassiveRestrictions.php
- Implementa las reglas permanentes por zona (capacidad, tipo de especie, ordenamiento).
- API principal: validarColocacion(string $zoneId, array $dinosaursInZone, object $dinosaur, int $slot): array que devuelve ['valid'=>bool,'reason'=>string].
- Métodos auxiliares: obtenerSlotsValidos, validarCapacidad, validarEspecie, validarOrdenamiento, calcularSlotSiguienteSecuencial.
- Devuelve mensajes legibles y no lanza excepciones para validaciones esperables.

ValidadorTablero.php
- Orquesta reglas activas y pasivas, expone validarPlacement / validarColocacion y validarPlacementSecuencial.
- Integra PassiveRestrictions y ActiveRestrictions; su salida incluye motivos y nextSlot cuando aplique.
- Usado por endpoints que validan movimientos y por SistemaBots.

SistemaBots.php
- Motor de decisión para bots en backend.
- Métodos públicos adaptadores: decidirMovimientoBot / decideBotMove, alternarBot, getAvailableDinosaurs, getBotInfo, isBot.
- Recibe un gameState y devuelve movimiento(s) sugeridos después de validar con ValidadorTablero.
- Maneja selección de tablero del bot (acepta board/tablero en varias formas) y genera slots válidos.
- Es determinista opcionalmente (semilla configurable) para testing.

ScoreCalculator.php
- Lógica que genera el informe de puntuación por jugador y por zona.
- generaInformePuntuacion y demás utilidades. Atrapa excepciones internamente y devuelve JSON legible en caso de error.

calcularPuntuacion.php
- Wrapper/endpoint que recibe POST JSON (o form) con payload esperado por ScoreCalculator.
- Normaliza tableros (arrays/objetos), llama a ScoreCalculator y devuelve { exito, mensaje, data } con informe.
- Maneja errores y registra en error_log.

calcularFisico.php
- Modulariza el procesamiento del formulario físico (fisico.php delega aquí).
- Función pública usada: procesarSolicitudPuntuacion() que valida datos, invoca calculadora y retorna ['success'=>bool,'data'=>..., 'message'=>string].

validarMovimiento.php
- Endpoint que recibe payloads de movimiento, invoca ValidadorTablero y devuelve JSON con resultado de validación.
- Registra errores en validarMovimiento_errors.log si se producen.

obtenerMovimientoBot.php
- Endpoint POST que recibe payload de un bot (playerId, gameState, playerBoard, availableDinosaurs, totalPlayers).
- Llama a SistemaBots para decidir movimiento y devuelve JSON predecible con movimiento(s) o success=false y mensaje.
- Cliente establece timeout; el backend registra y devuelve motivo si no puede decidir.

guardar_partida.php
- Persiste partidas guardadas en tabla partidas_guardadas.
- Requiere sesión: usuario autenticado.
- Payload JSON esperado: { nombre?:string, bots_count?:int, gameState: object }.
- Devuelve { success:true, id } o { success:false, error }.

listar_partidas.php
- Devuelve partidas guardadas del usuario actual (máx 100) con campos id, nombre, bots_count, created_at.
- Requiere sesión.

cargar_partida.php
- Devuelve una partida concreta por id si pertenece al usuario.
- Soporta id via GET o body JSON.
- Devuelve { success:true, save: { id, nombre, bots_count, created_at, data } } o 401/404/400 según sea el caso.

users.php
- Endpoint para administración de usuarios; sólo accesible a administradores (esAdmin / rol en sesión).
- Operaciones: GET (listar/obtener), POST (crear usuario), PUT (actualizar), DELETE.
- Para métodos que modifican requiere Accept: application/json o X-Requested-With: XMLHttpRequest como mitigación mínima CSRF.
- Detalles: validación de email/nombre/password, password hashed con password_hash, reglas para no degradar propio admin, respuestas con códigos HTTP adecuados.
- Ejemplos curl incluidos en el archivo para testing.

registro.php
- Registro público de usuarios. Valida email/nombre/password, inserta en tabla usuarios y registra sesión para el nuevo usuario.
- Respuesta: { success:true, redirect: 'index.php', usuario: { id,email,name,role } } o error.

iniciarSesion.php
- Login endpoint. Acepta JSON o form; valida credenciales, establece $_SESSION['usuario'] o claves equivalentes.
- Responde { success:true, redirect:'index.php', usuario: {...} } o códigos 400/401 y mensajes.
- No permite redirecciones externas: siempre redirect a index.php.

cerrarSesion.php
- Destruye sesión de forma segura: inicia buffer, limpia $_SESSION, borra cookies de sesión con parámetros originales y devuelve JSON { success:true }.
- Maneja errores y devuelve JSON con status 500 si falla.

session.php
- Funciones clave: iniciarSesionSegura(), exigirLogin(), usuarioActual(), esSolicitudAjax(), esAdmin().
- Configura cookie params seguros, session_regenerate_id en sesiones nuevas y política de redirección a logear.php para peticiones no-AJAX.
- usuarioActual normaliza distintas formas de almacenamiento en $_SESSION (usuario/user/auth/planas).

db.php
- Proporciona obtenerPdo(): singleton PDO configurado con ATTR_ERRMODE => EXCEPTION, ATTR_EMULATE_PREPARES => false, DEFAULT_FETCH_MODE => ASSOC y timeout.
- Lee credenciales de entorno con valores por defecto seguros y asegura SET NAMES utf8mb4 si es posible.

validarMovimiento_errors.log y php_errors.log
- Archivos de log para diagnosticar errores. Revisar cuando el backend devuelva comportamientos inesperados.

Buenas prácticas, contratos y notas operativas
- Autenticación: casi todos los endpoints críticos requieren iniciarSesionSegura() y usuarioActual() distinto de null. Para APIs AJAX se devuelve 401 JSON.
- JSON input: siempre validar que file_get_contents('php://input') y json_decode devuelvan estructuras esperadas; los wrappers lo hacen y devuelven errores legibles.
- Encabezados: algunos endpoints requieren Accept: application/json o X-Requested-With para mitigación CSRF mínima (p. ej. users.php para POST/PUT/DELETE).
- Normalización: backend acepta variantes en nombres (type/tipo, image/imagen, tablero/board) y normaliza internamente.
- Mensajes: las respuestas devuelven keys en español (exito/mensaje) o en mezcla (success/error) según el endpoint; los consumidores frontend ya manejan ambas variantes.
- Manejo de errores: se usan http_response_code apropiados y se registra en error_log para debugging.
- Seguridad: evitar redirecciones basadas en entrada del usuario; login/registro/redirect usan URLs fijas (index.php). Evitar exposición de datos sensibles en logs.

Contratos JSON importantes (resumen)
- iniciarSesion.php / registro.php -> Request: { email, password [, nombre] }  Response success:true, redirect:'index.php', usuario:{id,email,name,role}
- guardar_partida.php -> Request: { nombre?, bots_count?, gameState } Response { success:true, id }
- listar_partidas.php -> Response { success:true, saves: [ { id, nombre, bots_count, created_at } ] }
- cargar_partida.php -> Response { success:true, save: { id, nombre, bots_count, created_at, data } }
- obtenerMovimientoBot.php -> Request: { playerId, gameState, playerBoard?, availableDinosaurs, totalPlayers } Response: estructura predecible con movimiento(s) o success:false
- validarMovimiento.php -> Request: payload de validación; Response: { valid:bool, reason:string, nextSlot?:int }
- calcularPuntuacion.php / fisico.php (POST) -> Request: payload con allPlayerBoards / fullBoard etc.; Response { exito:true, mensaje, scoreReport }

