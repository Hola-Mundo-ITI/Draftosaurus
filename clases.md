# Documentación de clases y módulos (backend)
## ActiveRestrictions (backend/ActiveRestrictions.php)
- Tipo: Clase
- Propósito: Exponer las restricciones activas (las que dependen del estado del dado y del turno) y ofrecer utilidades para presentar información legible al cliente.

- Herencia / relaciones: No hereda de clases internas; usa la estructura de `carasDado` y coopera con las reglas definidas en el manejador del dado.

- Responsabilidades principales:

  - obtenerInfoRestriccion(string $caraActual): ?array — devuelve la definición de la cara del dado (nombre, descripción, tipo, recintos permitidos, etc.).

  - obtenerMensajeRestriccion(string $caraActual, int $playerId, int $jugadorQueLanzo): string — genera un mensaje legible para el jugador explicando la restricción vigente. Si el jugador lanzó, indica que puede colocar libremente.

- Notas de implementación:
  - Diseñada para ser serializable y entendible por el frontend.

  - No realiza validaciones de integridad profunda; asume que `carasDado` está bien formada.

## RestriccionesPasivas / PassiveRestrictions (backend/PassiveRestrictions.php)
- Tipo: Clase (definición principal en español: RestriccionesPasivas. Existe un adaptador inglés PassiveRestrictions que delega).
- Propósito: Encapsular las reglas permanentes de cada zona del tablero (capacidad, tipo de especie admitida, ordenamiento) y validar colocaciones.
- Herencia / relaciones: PassiveRestrictions extiende o adapta RestriccionesPasivas (adaptador), reutilizando lógica.

- Responsabilidades principales:
  - validarColocacion(string $zoneId, array $dinosaursInZone, object $dinosaur, int $slot): array — valida capacidad, especie y ordenamiento; devuelve ['valid'=>bool, 'reason'=>string].

  - obtenerSlotsValidos(string $zoneId, array $dinosaursInZone, object $dinosaur): array — calcula slots válidos según reglas (capacidad, orden secuencial, nextSlot, etc.).

  - obtenerInfoZona(string $zoneId): ?array — devuelve metadatos legibles de la zona (capacidad, tipoEspecie, ordenamiento, descripcion).

  - validaciones auxiliares: validarCapacidad, validarEspecie, validarOrdenamiento, validarOrdenSecuencial, calcularSlotSiguienteSecuencial.
- Comportamiento importante:

  - Cuando el ordenamiento es "secuencial" devuelve el slot esperado y motivos claros en caso de invalidación.

  - Normaliza datos de entrada (acepta tanto objetos como arrays en varios puntos).

- Errores y límites:
  - Devuelve mensajes legibles pero no lanza excepciones para validaciones esperadas; registra errores en caso de excepciones internas.

## ScoreCalculator (backend/ScoreCalculator.php)
- Tipo: Clase
- Propósito: Calcular la puntuación final de un jugador (desglose por zona, bonificaciones, total).

- Herencia / relaciones: Clase independiente; consumida por endpoints que necesitan calcular score.

- Responsabilidades principales:
  - generarInformePuntuacion(object $fullBoard, int $playerId, array $allPlayerBoards): array — produce el reporte con baseScore, detalles por zona, bonificaciones y total.
  
  - funciones por zona: calcularBosqueSemejanza, calcularTrioFrondoso, calcularPradoDiferencia, calcularPraderaAmor, calcularIslaSolitaria, calcularReySelva, calcularDinosauriosRio (o nombres equivalentes). Estos métodos implementan las reglas de puntuación.

  - utilitarios: contarEspecieEnParque, contarZonasCompletadas, calcularDiversidad, tieneParejasCompletas.

- Notas:
  - Presenta salida con estructura estable (details por zona con puntos y conteos) para que el frontend la consuma.

  - Maneja entradas heterogéneas (arrays u objetos) y normaliza internamente.

## ValidadorTablero (backend/ValidadorTablero.php)
- Tipo: Clase
- Propósito: Proveer validaciones más altas y orquestar reglas pasivas/activas para validar movimientos desde el cliente o APIs.

- Responsabilidades principales:
  - validatePlacement / validarColocacion: función que combina reglas pasivas y posibles restricciones activas y devuelve motivo y estado.

  - validarPlacementSecuencial: implementa la lógica que determina el siguiente slot esperado y retorna nextSlot en caso de fallo.

- Interacción:
  - Consume PassiveRestrictions para reglas por zona.

  - Se integra con la lógica de dado y otros validadores si es necesario.

- Observaciones:
  - Registra errores en logger cuando algo inesperado ocurre.

## SistemaBots (backend/SistemaBots.php)
- Tipo: Clase / módulo
- Propósito: Implementar la lógica para generar movimientos automáticos (bots) y exponer helpers para obtener el siguiente movimiento.

- Responsabilidades principales:
  - generarMovimientoBot / obtenerMovimientoBot: calcular jugadas plausibles para un bot dado el estado del tablero y la configuración.

  - Exponer funciones de configuración y parámetros de dificultad.

- Notas:

  - Debe ser determinista para pruebas, pero admite variabilidad (random) para simular habilidad.

## validarMovimiento.php, obtenerMovimientoBot.php, calcularPuntuacion.php (módulos/entradas)
- Naturaleza: Endpoints o scripts que envuelven las clases principales para uso desde HTTP/CLI.

- Propósito:
  - validarMovimiento.php: recibir payloads de movimiento, invocar ValidadorTablero y devolver resultado JSON.

  - obtenerMovimientoBot.php: endpoint que devuelve una sugerencia de movimiento a partir de SistemaBots.

  - calcularPuntuacion.php: wrapper que usa ScoreCalculator para devolver el informe de puntuación.

- Comportamiento:
  - Normalizan entrada (JSON / form-data), manejan errores y devuelven JSON con estructura predecible.

  - Registran errores y usan HTTP status codes apropiados.

## Buenas prácticas y consideraciones generales
- Normalización: la lógica backend espera formatos concretos pero acostumbra a normalizar arrays/objetos para robustez.

- Mensajes: las funciones devuelven motivos legibles en español para facilitar debugging en frontend.

- Persistencia: estas clases son puramente lógicas; la persistencia/estado se maneja fuera o en capas superiores.

- Errores: las validaciones devuelven objetos con 'valid' o 'valid' => false más 'reason'; no siempre lanzan excepciones.

## Advertencias y notas de mantenimiento
- Algunos archivos actúan como adaptadores (p.ej. PassiveRestrictions -> PassiveRestrictions adaptador en inglés). Mantener ambos sincronizados.

- Hay funciones que devuelven el "nextSlot" cuando la validación secuencial falla; el frontend debería utilizar ese dato para UX.

- Revisar los puntos de normalización si se añaden nuevos formatos de tablero; hay supuestos sobre claves (`type` vs `tipo`, `playerPlaced` vs `jugadorColocado`).


