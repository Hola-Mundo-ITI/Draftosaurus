
## Descripción
 Esta correcion se basa en arreglar errores anteriores, aunque no comparte
 codigo que se esta usando para la segunda entrega. 

 Se hizo una simple refactorizacion y se arreglaron errores de escalabilidad o deuda tecnica. 

## Estructura del proyecto

### Archivos principales
- `index.html` - Página de inicio con selección de modo de juego
- `logear.html` - Sistema de login y registro
- `configuracion.html` - Configuración de usuario
- `digital.html` - Modo de juego digital interactivo
- `fisico.html` - Interfaz para seguimiento de partidas físicas
- `puntaje.html` - Visualización de puntuaciones y rankings

### Organización de estilos (CSS)
Los estilos están organizados por funcionalidad en la carpeta `css/`:

- `style.css` - Estilos base, variables CSS y configuración general
- `diseno.css` - Layout principal y estructura visual
- `navegacion.css` - Menú lateral y navegación
- `formularios.css` - Formularios, inputs y campos de entrada
- `botones.css` - Estilos para todos los botones
- `juego.css` - Específico para el modo digital (tablero, dinosaurios, puntajes)
- `responsive.css` - Media queries para diferentes dispositivos

### JavaScript
Los scripts están separados por funcionalidad en la carpeta `js/`:

- `menu.js` - Funcionalidad del menú lateral (compatible con todos los HTML)
- `auth.js` - Sistema de autenticación (login/registro)

### Recursos
- `Recursos/img/` - Todas las imágenes del proyecto:
  - `logo.png` - Logo de la aplicación
  - `tablero.png` - Imagen del tablero de juego
  - `dado.png` - Imagen del dado virtual
  - `dino1.png` a `dino6.png` - Imágenes de los dinosaurios

## Características técnicas

- Diseño responsive para móviles, tablets y desktop
- Variables CSS para fácil mantenimiento de colores y estilos
- JavaScript modular sin dependencias externas
- Estructura de archivos organizada y escalable
- Bootstrap 5.3.3 para componentes base

## Instalación y uso

1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. Selecciona el modo de juego deseado
4. Para el modo digital, arrastra los dinosaurios al tablero
5. Para el modo físico, registra los datos de tu partida

## Navegación

Todas las páginas incluyen un menú lateral accesible desde el botón hamburguesa en la esquina superior izquierda, que permite navegar entre:
- Inicio
- Seguimiento (modo físico)
- Partida Virtual (modo digital)
- Reglas del juego
- Configuración
