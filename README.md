#  Draftosaurus - Juego Digital

## Descripción del Proyecto

Draftosaurus es una versión digital del juego de mesa del mismo nombre. El proyecto permite a los jugadores jugar de dos formas: **modo físico** (donde registran manualmente su tablero) y **modo digital** (donde juegan completamente en la computadora).

El juego consiste en colocar dinosaurios en diferentes zonas de un parque, siguiendo restricciones específicas y acumulando puntos según las reglas de cada zona.

##  Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura de las páginas
- **CSS3** - Estilos y diseño visual
- **JavaScript (Vanilla)** - Lógica del juego en el navegador
  - Manejo del DOM
  - Fetch API para comunicación con el servidor
  - LocalStorage para datos de jugadores

### Backend
- **PHP 7.4+** - Lógica del servidor
  - Programación Orientada a Objetos (POO)
  - Sesiones para manejo de usuarios
  - JSON para intercambio de datos

### Base de Datos
- **MySQL** - Almacenamiento de usuarios
  - Tabla `usuarios` con campos básicos

### Servidor Local
- **XAMPP** - Entorno de desarrollo
  - Apache (servidor web)
  - MySQL (base de datos)
  - phpMyAdmin (administración de BD)

##  Estructura del Proyecto

```
draftosaurus/
│
├── datos/                          # Capa de datos
│   ├── conexion/
│   │   └── conexionBD.php         # Clase para conectar con MySQL
│   └── sesion/
│       ├── iniciarSesion.php      # Endpoint de login
│       ├── crearSesion.php        # Endpoint de registro
│       ├── borrarSesion.php       # Endpoint de logout
│       └── verificarSesion.php    # Chequea si hay sesión activa
│
├── negocio/                        # Lógica de negocio
│   ├── partida/
│   │   ├── manejadorPartida.php   # Gestiona turnos y rondas
│   │   ├── procesarMulti.php      # Endpoint multijugador
│   │   ├── restriccionesPasivas.php # Valida restricciones del dado
│   │   └── validarMovimiento.php  # Valida si puedes poner un dino
│   │
│   ├── puntuacion/
│   │   ├── calcularPuntos.php     # Clase que calcula puntos
│   │   ├── puntosDigital.php      # Endpoint para modo digital
│   │   └── puntosFisico.php       # Procesa formulario modo físico
│   │
│   ├── tablero/
│   │   ├── tablero.php            # Clase Tablero principal
│   │   └── zonas/
│   │       └── zona.php           # Clases de cada tipo de zona
│   │
│   └── utilidades/
│       └── idioma/
│           ├── idiomas.php        # Clase Traductor
│           ├── cambiarIdioma.php  # Endpoint cambio idioma
│           └── obtenerTraduccion.php # Devuelve traducciones JS
│
├── presentacion/                   # Archivos visuales
│   ├── includes/
│   │   ├── head.php              # <head> común
│   │   ├── navigation.php        # Menú de navegación
│   │   └── footer.php            # Footer común
│   │
│   ├── css/
│   │   ├── digitalPag.css        # Estilos del juego digital
│   │   ├── sesion.css            # Estilos de login/registro
│   │   ├── configuracion.css     # Estilos de config
│   │   ├── indexPag.css          # Estilos página inicio
│   │   ├── seleccionarJugador.css # Estilos selector jugadores
│   │   └── restricciones.css     # Estilos zonas restringidas
│   │
│   └── js/
│       ├── digitalPag.js         # Lógica principal del juego
│       ├── sesion.js             # Manejo login/registro
│       ├── configuracion.js      # Cambio de idioma
│       ├── indexPag.js           # Menú lateral
│       ├── navigation.js         # Cerrar sesión
│       ├── multiJugador.js       # Lógica multijugador
│       ├── seleccionarJugador.js # Selector de jugadores
│       └── puntuacionDigital.js  # Panel de puntos
│
├── Recursos/                      # Imágenes y assets
│   └── img/
│       ├── dino1.png - dino6.png # Imágenes de dinosaurios
│       ├── tablero/              # Fondos de zonas
│       ├── dado/                 # Caras del dado
│       └── ...                   # Otros recursos visuales
│
├── index.php                      # Página principal
├── sesion.php                     # Login y registro
├── configuracion.php              # Cambiar idioma
├── fisico.php                     # Modo físico
├── seleccionarJugador.php         # Elegir jugadores
├── digital.php                    # Juego digital
└── draftosaurus.sql               # Script de base de datos
```

##  Funcionalidades Principales

### Sistema de Autenticación
- **Registro de usuarios**: Email, nombre y contraseña (mínimo 8 caracteres)
- **Login**: Verifica credenciales con contraseña hasheada
- **Sesiones PHP**: Mantiene al usuario logueado
- **Logout**: Cierra sesión y destruye cookies

### Modo Físico
- Formulario para registrar manualmente cuántos dinosaurios tienes en cada zona
- Calcula automáticamente los puntos según las reglas
- Muestra desglose de puntuación por zona

### Modo Digital - Un Jugador
1. **Lanzar dado**: Genera restricción aleatoria (bosque, llanura, baños, cafetería, recinto vacío)
2. **Seleccionar dinosaurio**: Elige uno de los 6 disponibles
3. **Colocar en tablero**: Solo en zonas permitidas por el dado
4. **Validación**: El servidor verifica si el movimiento es válido
5. **Puntuación en tiempo real**: Panel lateral que se actualiza automáticamente

### Modo Digital - Multijugador
- Hasta 5 jugadores pueden jugar por turnos
- Cada jugador tiene su propio tablero
- Los mazos rotan entre jugadores cada ronda
- 12 rondas en total
- Al final muestra ganador

### Sistema de Puntuación
Cada zona tiene sus propias reglas:

- **Bosque de la Semejanza**: Todos los dinos deben ser iguales (1-6 dinos: 0,1,3,6,10,15,21 puntos)
- **Prado de la Diferencia**: Todos deben ser diferentes (misma tabla)
- **Trío Frondoso**: 7 puntos si tiene exactamente 3 dinos
- **Pradera del Amor**: 5 puntos por cada pareja (2 dinos)
- **Isla Solitaria**: 7 puntos si tiene exactamente 1 dino
- **Rey de la Selva**: 7 puntos si tiene exactamente 1 dino
- **Dinosaurios del Río**: Tabla especial (0,1,3,6,10,15,21,28 puntos)

### Sistema de Restricciones (Dado)
El dado tiene 5 caras:
- **Bosque** : Solo zonas de bosque (Bosque Semejanza, Rey Selva, Trío Frondoso)
- **Llanura** : Solo zonas de llanura (Prado Diferencia, Pradera Amor, Isla Solitaria)
- **Baños** : Solo lado derecho del río (Rey Selva, Prado, Isla)
- **Cafetería** : Solo lado izquierdo del río (Bosque, Trío, Pradera)
- **Recinto Vacío** : Solo zonas completamente vacías (si no hay ninguna, puedes poner donde quieras)

### Internacionalización (i18n)
- Soporte para **Español** e **Inglés**
- Almacenado en sesión PHP
- Traducciones cargadas dinámicamente en JavaScript
- Cambia toda la interfaz al instante

##  Características Técnicas Interesantes

### Comunicación Cliente-Servidor
- **Fetch API** para peticiones asíncronas
- **JSON** para enviar y recibir datos
- **Headers** correctos (`Content-Type: application/json`)
- Manejo de errores con try-catch

### Validación en Dos Capas
1. **Frontend (JavaScript)**: Validación inmediata para mejor UX
2. **Backend (PHP)**: Validación definitiva para seguridad

### Programación Orientada a Objetos
- **Clase Tablero**: Maneja el estado del juego
- **Clase Zona**: Cada tipo de zona hereda de esta clase base
- **Clase Jugador**: Gestiona mano, mazo y descarte
- **Clase CalculadorPuntos**: Lógica de puntuación separada

### Efectos Visuales
- **Opacidad** en dinos usados y dado lanzado
- **Animación de brillo** en botón de pasar turno (cuando puedes pasar)
- **Restricciones visuales** con clases CSS `.permitido` y `.restringido`
- **Panel lateral deslizante** para ver puntuación

### Persistencia de Datos
- **Sesiones PHP** para usuarios y estado de partida multijugador
- **LocalStorage** para guardar jugadores temporalmente
- **MySQL** para usuarios registrados

##  Instalación en XAMPP - Tutorial Paso a Paso

### Paso 1: Descargar e Instalar XAMPP

1. Ve a https://www.apachefriends.org/
2. Descarga XAMPP para tu sistema operativo (Windows, Mac, Linux)
3. Ejecuta el instalador
4. Durnte la instalación, asegúrate de seleccionar:
   -  Apache
   -  MySQL
   -  PHP
   - phpMyAdmin
5. Instala en la ruta por defecto: `C:\xampp` (Windows) o `/Applications/XAMPP` (Mac)

### Paso 2: Descargar el Proyecto

1. Descarga todos los archivos del proyecto
2. Crea una carpeta llamada `draftosaurus` dentro de `C:\xampp\htdocs\`
   - Ruta completa: `C:\xampp\htdocs\draftosaurus\`
3. Copia todos los archivos del proyecto ahí

Tu estructura debería verse así:
```
C:\xampp\htdocs\draftosaurus\
├── datos/
├