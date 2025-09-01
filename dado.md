# Sistema de Dados y Restricciones

## Arquitectura general
- ManejadorDado (JS: JS/tablero/ManejadorDado.js): mantiene el estado local del dado en el cliente, expone métodos para lanzar el dado (manual o automático), notifica cambios mediante eventos y proporciona utilitarios para obtener información legible para la UI.
- RestriccionesActivas (JS y backend/ActiveRestrictions.php): lógica que determina qué recintos están permitidos según la cara actual del dado; el backend ofrece la versión autoritativa para validaciones server-side.
- RestriccionesPasivas (JS y backend/PassiveRestrictions.php): reglas permanentes por zona (capacidad, tipo de especie, ordenamiento). Implementadas en JS para pre-checks de UI y en backend para validación final.

Nota: el cliente muestra y anima el dado; las validaciones definitivas se delegan al backend cuando se ejecutan movimientos via endpoints.

## ManejadorDado — responsabilidades y API (resumen)
- Mantiene: estadoActual { rondaActual, caraActual, jugadorQueLanzo, descripcionRestriccion, activo, fechaLanzamiento } y historialDados.
- Métodos principales:
  - lanzarDadoParaRonda(numeroRonda, numeroJugadores = 2) — ejecuta la lógica de determinación de quién lanza, selecciona cara (aleatoria o semilla en tests), actualiza estadoActual y devuelve el objeto de estado.
  - determinarJugadorQueLanza(numeroRonda, numeroJugadores) — rotación simple ( (ronda-1) % jugadores + 1 ).
  - lanzarDadoAleatorio() — devuelve una de las caras: 'bosque','llanura','banos','cafeteria','vacio'.
  - obtenerInfoRestriccionActual() — traduce la cara actual a metadatos legibles (nombre, descripcion, recintos permitidos).
  - notificarCambioEstado() — dispara CustomEvent 'dadoCambiado' con detail { estado, info }.

Observaciones:
- El manejo de imágenes del dado y fallback (dado.png) se realiza en el cliente; hay un mapeo de nombre de cara a recursos en Recusos/img/dado/.
- Para pruebas es posible forzar una semilla o cara fija.

## Restricciones Activas — comportamiento
- Propósito: limitar recintos permitidos por resultado del dado, con exenciones para el jugador que lanzó.
- Tipos de caras:
  - Área (bosque/llanura): permite recintos de una zona específica.
  - Lado del río (cafeteria/banos): permite recintos a izquierda o derecha del río.
  - Dinámico (vacio/recinto vacio): calcula recintos según estado actual (p. ej. recintos vacíos).
- Reglas:
  - Si jugadorId === jugadorQueLanzo → exento: devuelve todos los recintos.
  - Filtrado en dos pasos: primero por caraDelDado, luego por dinámica interna si aplica.
- Implementación: funciones en JS usadas para UI y la implementación en backend/ActiveRestrictions.php usada para validación server-side.

## Restricciones Pasivas — resumen de reglas por zona
- Cada zona define: capacidad (slots), tipoEspecie (misma, diferente, cualquiera), ordenamiento (secuencial o libre) y descripcion.
- Zonas principales (resumen):
  - bosque-semejanza: capacidad 6, mismaEspecie, secuencial
  - prado-diferencia: capacidad 6, especiesDiferentes, secuencial
  - pradera-amor: capacidad 6, cualquiera, libre
  - trio-frondoso: capacidad 3, cualquiera, libre
  - rey-selva: capacidad 1, cualquiera, libre
  - isla-solitaria: capacidad 1, cualquiera, libre
  - dinos-rio: capacidad 7, cualquiera, secuencial (comodín)
- Validaciones típicas:
  - validarCapacidad: comprobar slots libres
  - validarMismaEspecie / validarEspeciesDiferentes
  - validarOrdenSecuencial: exigir colocar en slot = longitudActual + 1

Nota: las funciones están disponibles en JS (para feedback inmediato) y en PHP para la regla final.

## Integración y orden de validación
1. Restricciones Activas (dado) — se evalúan primero para filtrar recintos permitidos.
2. Restricciones Pasivas (zona) — se aplican después para comprobar capacidad, especie y orden.
3. Ambas deben pasar para aceptar un movimiento.

En el cliente existe ValidadorRestricciones.js que replica este flujo antes de llamar al endpoint backend/validarMovimiento.php.

## Eventos y contratos con la UI
- Evento: 'dadoCambiado' — detail: { estado: estadoActual, info: obtenerInfoRestriccionActual() }
- El UI escucha este evento para actualizar imagen, texto descriptivo y habilitar/deshabilitar zonas.
- Recomendación: el frontend debe mostrar claramente si el jugador que lanza está exento.

## Endpoints relevantes
- backend/validarMovimiento.php — valida movimientos combinando ValidadorTablero y ActiveRestrictions/PassiveRestrictions server-side.
- backend/obtenerMovimientoBot.php — consulta que puede necesitar la cara del dado y sus restricciones.

Formato de estado enviado al backend (ejemplo resumido):
- ronda: int
- cara: 'bosque'|'llanura'|'banos'|'cafeteria'|'vacio'
- jugadorQueLanzo: int
- tablero: objeto con arrays por zona

El backend normaliza nombres (tipo/tipoEspecie, image/imagen) y espera estado coherente.

## Historial y estadísticas
- ManejadorDado mantiene historialDados[] con entradas { ronda, cara, jugador, fecha }.
- Métodos de utilidad: obtenerEstadisticas() que devuelve conteo de caras y total de lanzamientos.

## Limitaciones y consideraciones
- El sistema asume que el estado global está disponible; si falta información las funciones devuelven errores controlados o null.
- Sincronización: disparar eventos en el orden correcto es critico para evitar que el frontend valide con estado desactualizado.
- Consistencia: la validación definitiva debe realizarse en el backend antes de persistir movimientos.

