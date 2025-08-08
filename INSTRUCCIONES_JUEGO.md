Basicamente manual de como jugar esto

# 🦕 Draftosaurus - Sistema Point and Click

## 📋 Instrucciones de Uso

### 🎮 Cómo Jugar

1. **Seleccionar Dinosaurio:**
   - Haz clic en cualquier dinosaurio de los lados del tablero
   - El dinosaurio se resaltará con un borde dorado y efecto de pulso
   - Los slots disponibles se iluminarán en verde

2. **Colocar Dinosaurio:**
   - Haz clic en cualquier slot verde (disponible) del tablero
   - El dinosaurio se moverá automáticamente al slot
   - Se avanzará al siguiente turno

3. **Información de Zonas:**
   - Pasa el mouse sobre cualquier zona para ver sus reglas
   - Cada zona tiene reglas específicas de colocación
   - Los tooltips explican cómo obtener puntos

### 🎯 Zonas del Tablero

#### 🌲 **Bosque de la Semejanza**
- **Regla:** Todos los dinosaurios deben ser del mismo tipo
- **Puntuación:** 1, 3, 6, 10, 15, 21 puntos (según cantidad)
- **Ejemplo:** 3 Triceratops = 6 puntos

#### 🌿 **El Trío Frondoso**
- **Regla:** Debe tener exactamente 3 dinosaurios
- **Puntuación:** 7 puntos si está completo
- **Ejemplo:** Cualquier combinación de 3 dinosaurios

#### 🌾 **Prado de la Diferencia**
- **Regla:** Todos los dinosaurios deben ser diferentes
- **Puntuación:** 1, 3, 6, 10, 15, 21 puntos (según variedad)
- **Ejemplo:** 6 tipos diferentes = 21 puntos

#### 💕 **La Pradera del Amor**
- **Regla:** Los dinosaurios forman parejas del mismo tipo
- **Puntuación:** 5 puntos por cada pareja completa
- **Ejemplo:** 2 T-Rex + 2 Triceratops = 10 puntos

#### 🏝️ **La Isla Solitaria**
- **Regla:** Solo un dinosaurio permitido
- **Puntuación:** 7 puntos
- **Ejemplo:** Cualquier dinosaurio solitario

#### 👑 **El Rey de la Selva**
- **Regla:** Para el dinosaurio más grande
- **Puntuación:** Según el tamaño del dinosaurio
- **Ejemplo:** T-Rex = 12 puntos, Brontosaurus = 10 puntos

#### 🌊 **Dinosaurios en el Río**
- **Regla:** Dinosaurios colocados en secuencia
- **Puntuación:** 1, 3, 6, 10, 15, 21, 28 puntos (según cantidad)
- **Ejemplo:** 5 dinosaurios = 15 puntos

#### 🦖 **Zona del T-Rex**
- **Regla:** Solo para T-Rex
- **Puntuación:** 12 puntos
- **Ejemplo:** Zona especial exclusiva del T-Rex

### 🦴 Tipos de Dinosaurios

1. **🦕 Triceratops** (dino1.png) - Tamaño: Mediano - 8 puntos en Rey de la Selva
2. **🦕 Stegosaurus** (dino2.png) - Tamaño: Mediano - 6 puntos en Rey de la Selva
3. **🦕 Brontosaurus** (dino3.png) - Tamaño: Grande - 10 puntos en Rey de la Selva
4. **🦖 T-Rex** (dino4.png) - Tamaño: Muy Grande - 12 puntos en Rey de la Selva
5. **🦕 Velociraptor** (dino5.png) - Tamaño: Pequeño - 4 puntos en Rey de la Selva
6. **🦅 Pteranodon** (dino6.png) - Tamaño: Muy Pequeño - 2 puntos en Rey de la Selva

### 🎮 Controles del Juego

#### Botones
- **↶ Deshacer:** Deshace el último movimiento
- **🔄 Reiniciar:** Reinicia completamente el tablero
- **📊 Puntos:** Muestra la puntuación actual

#### Atajos de Teclado
- **Ctrl + Z:** Deshacer movimiento
- **Ctrl + R:** Reiniciar juego (con confirmación)
- **Barra Espaciadora:** Ver puntuación
- **Escape:** Limpiar selección actual

### 📊 Sistema de Puntuación

El juego calcula automáticamente los puntos según las reglas oficiales de Draftosaurus:

- **Puntuación Base:** Según las reglas de cada zona
- **Bonificaciones:** Por completar múltiples zonas o usar variedad de dinosaurios
- **Comparación:** Entre Jugador 1 y Jugador 2
- **Estadísticas:** Movimientos realizados, tiempo de juego, etc.

### 🎯 Consejos Estratégicos

1. **Planifica con Anticipación:** Piensa en qué zonas quieres completar
2. **Diversifica:** Usar diferentes tipos de dinosaurios da bonificaciones
3. **Completa Zonas:** Las zonas completas dan puntos extra
4. **Usa el T-Rex Sabiamente:** Puede ir en Rey de la Selva o su zona especial
5. **Observa las Parejas:** La Pradera del Amor puede dar muchos puntos

### 🔧 Características Técnicas

#### Tablero SVG Interactivo
- **Tablero Real:** Usa el SVG oficial del juego Draftosaurus
- **Calibración:** Sistema de calibración de posiciones (Ctrl+Shift+C)
- **Posicionamiento Preciso:** Zonas posicionadas exactamente sobre el tablero
- **Escalado Automático:** Se adapta a diferentes tamaños de pantalla

#### Accesibilidad
- **Screen Reader:** Compatible con lectores de pantalla
- **Navegación por Teclado:** Totalmente accesible
- **Alto Contraste:** Soporte para modo de alto contraste
- **Animaciones Reducidas:** Respeta las preferencias del usuario

#### Persistencia
- **Guardado Automático:** El estado se guarda cada 30 segundos
- **Recuperación:** Continúa la partida al recargar la página
- **Historial:** Mantiene un historial de las últimas 50 partidas
- **Calibración Guardada:** Las posiciones calibradas se guardan localmente

#### Responsive Design
- **Móviles:** Optimizado para pantallas táctiles
- **Tablets:** Interfaz adaptada para tablets
- **Desktop:** Experiencia completa en escritorio

### 🛠️ Herramientas de Desarrollo

#### Calibrador de Tablero
- **Activación:** Presiona `Ctrl+Shift+C` para activar el modo calibrado
- **Arrastrar Zonas:** Mueve las zonas para ajustar su posición
- **Guardar Posiciones:** Guarda las posiciones calibradas en localStorage
- **Exportar CSS:** Copia el CSS con las nuevas posiciones al portapapeles
- **Restaurar:** Vuelve a las posiciones originales

#### Controlador de Tamaño
- **Activación:** Presiona `Ctrl+Shift+Y` para abrir el panel de control
- **Atajos Rápidos:** 
  - `Ctrl+Alt+Plus`: Aumentar tamaño
  - `Ctrl+Alt+Minus`: Disminuir tamaño
  - `Ctrl+Alt+0`: Resetear al tamaño por defecto
- **Panel de Control:** Slider, botones rápidos y controles de precisión
- **Tamaños Predefinidos:** Pequeño (15px), Mediano (19px), Grande (25px)
- **Persistencia:** El tamaño se guarda automáticamente

#### Debugging
- **Consola de Debug:** Accede a `window.draftosaurusDebug` en la consola
- **Estado del Juego:** Inspecciona el estado completo del juego
- **Validaciones:** Prueba las reglas de validación
- **Puntuación:** Calcula puntuaciones en tiempo real

### 🐛 Solución de Problemas

#### Si el juego no carga:
1. Recarga la página (F5)
2. Verifica que JavaScript esté habilitado
3. Limpia la caché del navegador

#### Si los dinosaurios no se mueven:
1. Asegúrate de hacer clic primero en un dinosaurio
2. Luego haz clic en un slot verde (disponible)
3. Verifica que el slot no esté ocupado

#### Si las reglas no se aplican:
1. Lee los tooltips de cada zona
2. Verifica que el dinosaurio cumple las reglas
3. Algunos slots pueden estar restringidos por las reglas
