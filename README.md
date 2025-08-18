# Draftosaurus

Aplicación web del juego de mesa Draftosaurus desarrollada por HolaMundo! en 2025. Esta implementación digital permite jugar tanto en modo físico (seguimiento de partida) como en modo virtual completo con bots automáticos.

## Descripción del Proyecto

Draftosaurus es una adaptación web del popular juego de mesa de colocación de dinosaurios. La aplicación ofrece dos modos de juego distintos y un sistema completo de validación de reglas que replica fielmente la experiencia del juego original.

### Características Principales

- **Modo Físico**: Herramienta de seguimiento para partidas con tablero físico
- **Modo Digital**: Partida completa virtual con tablero interactivo
- **Sistema de Bots**: Dos bots automáticos (Alpha y Beta) para partidas de tres jugadores
- **Sistema de Dados**: Implementación completa de restricciones activas por ronda
- **Validación de Reglas**: Sistema robusto que valida todas las reglas del juego original
- **Interfaz Responsive**: Optimizada para dispositivos móviles, tablets y escritorio

## Estructura del Proyecto

### Archivos Principales

- `index.php` - Página de inicio con selección de modo de juego
- `digital.php` - Modo de juego virtual completo
- `fisico.php` - Modo de seguimiento para tablero físico
- `logear.php` - Sistema de autenticación de usuarios
- `configuracion.php` - Panel de configuración del juego
- `puntaje.php` - Visualización de resultados y estadísticas

### Directorios

#### `/CSS/`
Hojas de estilo organizadas por funcionalidad:
- `styles.css` - Estilos globales y componentes compartidos
- `inicioPage.css` - Estilos específicos de la página de inicio
- `digitalPage.css` - Estilos del modo digital
- `fisicoPage.css` - Estilos del modo físico
- `responsive.css` - Media queries para diseño adaptativo

#### `/JS/`
Scripts organizados por módulos:

**Utilidades (`/utils/`)**
- `animaciones.js` - Sistema de animaciones y transiciones
- `tooltips.js` - Información contextual de zonas y reglas
- `calibradorTablero.js` - Herramienta de calibración de posiciones
- `controladorTamano.js` - Control dinámico del tamaño de elementos
- `validadorDado.js` - Validación específica de restricciones del dado

**Sistema de Tablero (`/tablero/`)**
- `EstadoJuego.js` - Gestión del estado global del juego
- `TableroPointClick.js` - Interacciones de clic en el tablero
- `ManejadorDado.js` - Lógica del sistema de dados
- `ManejadorSeleccion.js` - Gestión de selección de dinosaurios
- `SistemaBots.js` - Inteligencia artificial de los bots
- `CalculadoraPuntuacion.js` - Sistema de cálculo de puntuación
- `ValidadorRestricciones.js` - Coordinador de validaciones
- `RestriccionesActivas.js` - Restricciones temporales del dado
- `RestriccionesPasivas.js` - Reglas permanentes de cada zona
- `ValidadorZona.js` - Validación específica por zona

#### `/includes/`
Componentes PHP reutilizables:
- `head.php` - Configuración común del head HTML
- `navigation.php` - Sistema de navegación lateral
- `footer.php` - Pie de página
- `font.php` - Gestión centralizada de fuentes

#### `/Recursos/`
Assets del juego:
- `/img/` - Imágenes de dinosaurios, botones y elementos visuales
- `/svg/` - Gráficos vectoriales del tablero
- `reglasDraftosaurus.pdf` - Documentación oficial del juego

## Modos de Juego

### Modo Digital

Partida completa virtual que incluye:
- Tablero interactivo con zonas calibradas
- Sistema de turnos automático
- Dos bots con inteligencia artificial básica
- Validación en tiempo real de movimientos
- Sistema de dados con restricciones por ronda
- Cálculo automático de puntuación
- Controles de juego (deshacer, reiniciar, ver puntos)

### Modo Físico

Herramienta de seguimiento para partidas con tablero real:
- Registro manual de movimientos
- Validación de reglas
- Cálculo de puntuación final
- Historial de partidas

## Sistema de Restricciones

### Restricciones Pasivas
Reglas permanentes de cada zona del tablero:

- **Bosque de la Semejanza**: Misma especie, colocación secuencial
- **Prado de la Diferencia**: Especies diferentes, colocación secuencial  
- **Pradera del Amor**: Cualquier especie, colocación libre
- **Trío Frondoso**: Máximo 3 dinosaurios, cualquier especie
- **Rey de la Selva**: Solo un dinosaurio
- **Isla Solitaria**: Solo un dinosaurio
- **Dinosaurios en el Río**: Zona comodín, siempre disponible

### Restricciones Activas
Limitaciones temporales basadas en el resultado del dado:

- **Bosque**: Solo zonas del área del Bosque
- **Llanura**: Solo zonas del área de la Llanura
- **Baños**: Solo zonas a la derecha del río
- **Cafetería**: Solo zonas a la izquierda del río
- **Recinto Vacío**: Solo zonas completamente vacías

## Sistema de Bots

Los bots implementan una estrategia de selección aleatoria simple:
- Identifican dinosaurios disponibles
- Filtran slots válidos según restricciones
- Seleccionan movimiento aleatorio entre opciones válidas
- Ejecutan movimientos con retrasos realistas
- Respetan todas las reglas del juego

## Tecnologías Utilizadas

### Frontend
- **HTML5**: Estructura semántica con elementos ARIA
- **CSS3**: Diseño responsive con Flexbox y Grid
- **JavaScript ES6+**: Programación orientada a objetos modular
- **Bootstrap 5.3**: Framework CSS para componentes base

### Backend
- **PHP**: Lógica del servidor y gestión de sesiones
- **Arquitectura MVC**: Separación clara de responsabilidades

### Herramientas de Desarrollo
- **Sistema de Debug**: Consola de debugging integrada
- **Calibrador de Tablero**: Herramienta de ajuste de posiciones
- **Controlador de Tamaño**: Ajuste dinámico de elementos
- **Validador de Restricciones**: Sistema de pruebas automatizadas

## Instalación y Configuración

### Requisitos
- Servidor web con soporte PHP 7.4+
- Navegador moderno con soporte JavaScript ES6+

### Instalación
1. Clonar o descargar el repositorio
2. Configurar servidor web apuntando al directorio raíz
3. Acceder a `index.php` desde el navegador
4. No requiere base de datos ni configuración adicional

### Configuración de Fuentes
El sistema utiliza Google Fonts (Passero One) gestionado centralmente en `includes/font.php`. La configuración se aplica automáticamente a todas las páginas.

## Debugging y Desarrollo

### Consola de Debug
Accesible mediante `window.draftosaurusDebug` en la consola del navegador:
- Inspección del estado del juego
- Validación manual de movimientos
- Control de bots
- Estadísticas del sistema de dados

### Herramientas de Calibración
- **Activar**: `Ctrl+Shift+C`
- **Controlador de Tamaño**: `Ctrl+Shift+Y`
- **Atajos de Teclado**: Múltiples combinaciones para desarrollo

### Atajos de Juego
- `Ctrl+Z`: Deshacer movimiento
- `Ctrl+R`: Reiniciar juego
- `Espacio`: Ver puntuación
- `Escape`: Limpiar selección

## Documentación Técnica

- `bots.md` - Documentación completa del sistema de bots
- `dado.md` - Documentación del sistema de dados y restricciones
- `INSTRUCCIONES_JUEGO.md` - Manual de usuario completo
- `PRUEBA_MANUAL_RESTRICCIONES.md` - Guía de testing manual

## Arquitectura del Código

### Patrón de Diseño
- **Separación de Responsabilidades**: Cada clase tiene una función específica
- **Inyección de Dependencias**: Los componentes se comunican mediante interfaces claras
- **Sistema de Eventos**: Comunicación asíncrona entre módulos
- **Validación en Capas**: Restricciones activas y pasivas aplicadas secuencialmente

### Gestión del Estado
- Estado centralizado en `EstadoJuego.js`
- Inmutabilidad de datos críticos
- Historial de movimientos para funcionalidad de deshacer
- Persistencia automática en localStorage

## Limitaciones Conocidas

### Sistema de Bots
- Estrategia completamente aleatoria
- No implementa planificación táctica
- No considera optimización de puntuación

### Sincronización
- Dependiente del orden de inicialización de módulos
- Vulnerable a errores de timing en la carga
- No implementa reintentos automáticos

### Validación
- Asume datos de entrada válidos
- Sistema de respaldo básico para casos edge
- No maneja validación exhaustiva de tipos

