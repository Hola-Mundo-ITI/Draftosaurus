# Sistema de Bots

## Arquitectura General

El sistema de bots está implementado en la clase `SistemaBots` ubicada en `JS/tablero/SistemaBots.js`. Maneja dos bots automáticos que juegan contra el jugador humano en partidas de tres jugadores.

## Configuración de Bots

### Definición de Bots
```javascript
this.bots = {
  2: { nombre: 'Bot Alpha', activo: true },
  3: { nombre: 'Bot Beta', activo: true }
};
```

Los bots están configurados como jugadores 2 y 3, mientras que el jugador humano es el jugador 1.

### Tiempo de Espera
- Tiempo por defecto: 2000ms (2 segundos)
- Rango configurable: 500ms a 5000ms
- Simula el tiempo de "pensamiento" del bot

## Flujo de Ejecución

### Turno del Bot
1. **Verificación**: Confirma que el jugador es efectivamente un bot
2. **Indicador Visual**: Muestra mensaje de que el bot está jugando
3. **Lanzamiento de Dado**: El bot lanza automáticamente el dado para su turno
4. **Cálculo de Movimiento**: Determina el mejor movimiento disponible
5. **Ejecución**: Realiza el movimiento en el tablero
6. **Avance de Turno**: Pasa el turno al siguiente jugador

### Algoritmo de Decisión

#### Obtención de Dinosaurios Disponibles
- Busca elementos con clase `.dinosaurio` que no estén ocultos
- Extrae el tipo de dinosaurio basado en la imagen (`dino1` = triceratops, etc.)
- Crea objetos con información completa del dinosaurio

#### Obtención de Slots Disponibles
- Busca elementos con clase `.slot` que tengan `dataset.ocupado === 'false'`
- Identifica la zona correspondiente a cada slot
- Filtra slots según las restricciones activas y pasivas

#### Selección Aleatoria
- **Dinosaurio**: Selección completamente aleatoria de los disponibles
- **Slot**: Selección aleatoria entre los slots válidos para el dinosaurio elegido

## Sistema de Validación

### Validación Principal
Utiliza la función global `validarMovimiento()` que integra:
- Restricciones activas del dado
- Restricciones pasivas de cada zona
- Estado actual del juego

### Validación de Respaldo
En caso de error, implementa validación simple por zona:
- **Bosque de la Semejanza**: Misma especie o zona vacía
- **Prado de la Diferencia**: Especies diferentes únicamente
- **Isla Solitaria/Rey de la Selva**: Solo si está vacío
- **Trío Frondoso**: Máximo 3 dinosaurios
- **Otras zonas**: Siempre válidas

## Ejecución de Movimientos

### Creación Visual
- Genera elemento `img` con la imagen del dinosaurio
- Posiciona el elemento en el centro del slot
- Aplica estilos CSS para integración visual
- Marca el slot como ocupado

### Registro en Estado
- Crea objeto dinosaurio con ID único basado en timestamp
- Incluye información del jugador que lo colocó
- Registra el movimiento en el estado global del juego
- Oculta el dinosaurio de la zona de selección

### Retroalimentación
- Muestra mensaje de confirmación del movimiento
- Actualiza la interfaz de usuario
- Avanza automáticamente al siguiente turno

## Manejo de Errores

### Casos de Error
- **Sin movimientos válidos**: El bot pasa su turno
- **Estado de juego no disponible**: Registra error y pasa turno
- **Errores de validación**: Usa sistema de respaldo

### Recuperación
- Todos los errores resultan en pasar el turno
- Se mantiene la continuidad del juego
- Se registran los errores en consola para debugging

## Integración con Otros Sistemas

### Sistema de Dados
- Los bots lanzan automáticamente el dado al inicio de su turno
- Respetan las restricciones generadas por el dado
- Están sujetos a las mismas reglas que el jugador humano

### Sistema de Turnos
- Se integra con `avanzarTurno()` para mantener el flujo
- Detecta automáticamente cuando es turno de un bot
- Ejecuta movimientos con retrasos realistas

### Sistema de Mensajes
- Utiliza `tableroJuego.mostrarMensaje()` para comunicación
- Proporciona retroalimentación visual al jugador
- Indica claramente las acciones del bot

## Configuración y Control

### Activación/Desactivación
```javascript
toggleBot(jugadorId, activo)
```
Permite activar o desactivar bots individualmente.

### Información del Sistema
```javascript
obtenerInfoBots()
```
Retorna estado actual de todos los bots y configuración.

### Configuración de Tiempo
```javascript
configurarTiempoEspera(milisegundos)
```
Ajusta el tiempo de espera entre movimientos.

## Limitaciones Actuales

### Inteligencia Artificial
- Los bots utilizan selección completamente aleatoria
- No implementan estrategia o planificación
- No consideran puntuación o ventajas tácticas

### Validación
- Depende del sistema de validación global
- El sistema de respaldo es básico
- No maneja casos edge complejos

### Sincronización
- Requiere que todos los sistemas estén inicializados
- Vulnerable a errores de timing en la carga
- No implementa reintentos automáticos