# Sistema de Bots

Documento actualizado que describe la arquitectura actual del sistema de bots. Se ha refactorizado la responsabilidad de decisión hacia el backend: el cliente (JS) orquesta el turno y el backend devuelve movimientos sugeridos. Este documento explica la interacción entre las piezas, los formatos de payload/respuesta y consideraciones de implementación y pruebas.

## Resumen arquitectural
- Cliente (JS/tablero/SistemaBots.js): orquesta la ejecución del turno del bot, prepara y envía el payload al endpoint backend/obtenerMovimientoBot.php, procesa las respuestas y aplica los movimientos localmente en el estado de la partida.
- Backend (backend/SistemaBots.php): motor de decisión que calcula movimientos válidos (decidirMovimientoBot) usando ValidadorTablero, PassiveRestrictions y ActiveRestrictions; devuelve uno o más movimientos sugeridos en JSON.
- Endpoint: `backend/obtenerMovimientoBot.php` — wrapper que expone la funcionalidad de decisión del backend para peticiones POST con JSON.

Nota breve: la lógica de decisión puede residir parcialmente en el cliente como fallback, pero la fuente de verdad para la elección automatizada es el backend.

## Flujo de ejecución (alto nivel)
1. SistemaBots (cliente) detecta que es turno de un bot y llama a ejecutarTurnoBot(jugadorId).
2. Prepara payload con la información específica del bot: playerId, playerBoard (tablero del bot), gameState (estado global), availableDinosaurs (mazo filtrado), totalPlayers.
3. Envía POST a backend/obtenerMovimientoBot.php y espera respuesta (timeout configurable).
4. Backend valida payload, reconstruye estado y llama a decidirMovimientoBot(playerId, gameState).
5. Backend devuelve JSON con estructura predecible (ver sección `Formato de respuesta`).
6. Cliente procesa cada movimiento devuelto: normaliza dinosaurio, aplica estadoJuego.colocarDinosaurio(jugadorId, zoneId, dinosaur, slot), actualiza mazo del bot y UI.
7. Si no hay movimientos válidos o ocurre error, el bot pasa turno y se registra/loggea el incidente.

## Formato de payload (cliente -> backend)
Se envía JSON por POST. Campos habituales:
- playerId: int
- gameState: object (estado completo o parcial, incluye masos, tableros, ronda, jugadorQueLanzo)
- playerBoard: object (tablero específico del bot — esto evita ambiguedades de que el backend use el tablero del humano)
- availableDinosaurs: array de objetos { id, type|tipo, image|imagen }
- totalPlayers: int

Ejemplo (resumido):
{
  "playerId": 2,
  "gameState": { ... },
  "playerBoard": { ... },
  "availableDinosaurs": [{"id":1,"type":"triceratops"}],
  "totalPlayers": 3
}

Observación: el backend acepta variantes en nombres (type / tipo, imagen / image) y normaliza internamente.

## Formato de respuesta (backend -> cliente)
Respuesta JSON estándar con estos campos habituales:
- success|exito: bool
- moves|move|movimiento: array o objeto con movimientos sugeridos
- message|mensaje: string (opcional) — explicación o motivo de fallo

Cada movimiento suele tener la forma:
{
  "dinosaur": { "id":..., "tipo":..., "imagen":... },
  "zoneId": "pradera-amor",
  "slot": 2
}

El cliente debe aceptar variantes y normalizar (move / moves / movimiento) y campos internos del dinosaurio.

## Responsabilidades y límites
- Cliente JS (SistemaBots.js): orquestación, UI, aplicar movimientos en el estado local, fallback simple si el backend no responde.
- Backend PHP (SistemaBots.php): generación de movimientos válidos, uso de ValidadorTablero para garantizar conformidad con restricciones activas y pasivas.
- Validación: el backend se considera autoritativo; el cliente debe confiar en la respuesta pero validar mínimamente antes de aplicar (p.ej. slot no ocupado).

## Mecanismos de validación y seguridad
- El backend aplica ValidadorTablero antes de retornar un movimiento válido. Si decide devolver movimientos múltiples es para permitir ejecuciones en lote (por ejemplo, efectos que colocan varios dinos).
- Timeouts: el cliente establece un timeout en la petición (p.ej. 8s) y pasa turno si no recibe respuesta.
- Logs: tanto cliente (console) como backend (php_errors.log y logs específicos) registran anomalías para debugging.

## Manejo de errores y fallbacks
- Si backend devuelve error o respuesta inválida: cliente pasa turno y muestra mensaje al usuario.
- Si el estado enviado es inconsistente (mazo vacío, tablero mal formado), el backend puede devolver success=false y un mensaje; el cliente debe interpretar eso como "sin movimiento".
- Existe validación de respaldo en el cliente (algoritmo simplificado por zona) para casos donde el endpoint falle; este fallback es intencionalmente limitado.

## Tests y determinismo
- Para pruebas automatizadas, el backend puede operar en modo determinista (semilla fija para aleatoriedad) y devolver movimientos reproducibles.
- El cliente mantiene comportamiento determinista cuando usa datos de prueba locales.

## API pública de la clase JS SistemaBots (resumen)
- constructor(options) — acepta mapa de bots y tiempo de espera
- esBot(jugadorId) — chequea si un id corresponde a bot
- ejecutarTurnoBot(jugadorId) — ejecuta el flujo completo de petición y aplicación de movimientos
- procesarMovimientoBot(move, jugadorId) — aplica el movimiento localmente y actualiza mazo/estado
- toggleBot(jugadorId, activo) — activa/desactiva bot en la configuración local

## Consideraciones de mantenimiento
- Mantener sincronía entre los nombres de campos entre cliente y backend; el backend normaliza, pero conviene estandarizar.
- Evitar que el cliente aplique movimientos sin especificar jugadorId al invocar estadoJuego.colocarDinosaurio.
- Centralizar logs de errores del backend para facilitar detección de patrones (p.ej. payloads mal formados).
- Si se migran decisiones de vuelta al cliente, separar claramente las reglas (validador) y la heurística (decisión) para pruebas.

## Notas finales
- El sistema actual prioriza robustez y consistencia: la decisión final la toma el backend y el cliente actua como ejecutor y presentador.
- Este documento reemplaza la versión previa que describía una lógica de bots totalmente local; esa lógica sigue existiendo como fallback pero ya no es la fuente principal.


---
Documento técnico, en español; contiene leves errores de tipeo intencionados para dejarlo menos mecanico.