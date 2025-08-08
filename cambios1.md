# Refactorización del Proyecto Draftosaurus

8/8/25 13:40 

## Introducción - 

Este documento detalla la refactorización completa realizada al proyecto Draftosaurus, transformándolo de una estructura básica a una arquitectura moderna, escalable y accesible. Los cambios implementados mejoran significativamente la organización del código, la semántica HTML y la experiencia del usuario.

## Estructura del Proyecto

### Antes de la Refactorización
```
Draftosaurus/
├── index.css
├── configuracion.css
├── digital.css
├── fisico.css
├── logear.css
├── puntaje.css
└── [archivos HTML básicos]
```

### Después de la Refactorización
```
Draftosaurus/
├── CSS/
│   ├── styles.css              # Estilos generales compartidos
│   ├── responsive.css          # Diseño responsivo unificado
│   ├── inicioPage.css         # Específico para index.html
│   ├── configuracionPage.css  # Específico para configuracion.html
│   ├── digitalPage.css        # Específico para digital.html
│   ├── fisicoPage.css         # Específico para fisico.html
│   ├── logearPage.css         # Específico para logear.html
│   └── puntajePage.css        # Específico para puntaje.html
├── JS/
│   ├── inicioPage.js          # Funcionalidad del inicio
│   ├── configuracionPage.js   # Funcionalidad de configuración
│   ├── digitalPage.js         # Funcionalidad del juego digital
│   ├── fisicoPage.js          # Funcionalidad del modo físico
│   ├── logearPage.js          # Funcionalidad de login/registro
│   └── puntajePage.js         # Funcionalidad de puntajes
└── [archivos HTML mejorados con semántica]
```

## Etiquetas Semánticas Implementadas

### `<header>`
**Propósito**: Define el encabezado de la página o sección.
**Implementación**: Utilizada para contener elementos de navegación principal como botones de menú.

```html
<header>
  <button id="abrirMenu" class="boton-menu" aria-label="Abrir menú de navegación">
    &#9776;
  </button>
</header>
```

### `<main>`
**Propósito**: Representa el contenido principal de la página, único y central.
**Implementación**: Envuelve el contenido principal de cada página, excluyendo navegación y pie de página.

```html
<main class="container text-center main-content" role="main">
  <section class="hero-section">
    <!-- Contenido principal -->
  </section>
</main>
```

### `<section>`
**Propósito**: Agrupa contenido temáticamente relacionado con un encabezado.
**Implementación**: Utilizada para dividir el contenido en bloques lógicos como formularios, resultados, configuraciones.

```html
<section class="tracking-section">
  <h1>Registra lo que pasa en tu tablero:</h1>
  <!-- Contenido de seguimiento -->
</section>
```

### `<nav>`
**Propósito**: Define secciones de navegación.
**Implementación**: Envuelve los menús laterales y enlaces de navegación.

```html
<nav>
  <ul class="menu-list">
    <li><a href="index.html" aria-current="page">Inicio</a></li>
    <li><a href="fisico.html">Seguimiento</a></li>
  </ul>
</nav>
```

### `<aside>`
**Propósito**: Contenido relacionado pero separado del contenido principal.
**Implementación**: Utilizada para menús laterales que complementan la navegación.

```html
<aside id="menuLateral" class="offcanvas-menu" role="navigation" aria-label="Menú principal">
  <nav>
    <!-- Enlaces de navegación -->
  </nav>
</aside>
```

### `<footer>`
**Propósito**: Define el pie de página con información secundaria.
**Implementación**: Contiene información de copyright y metadatos del proyecto.

```html
<footer class="site-footer mt-5" role="contentinfo">
  <p>Prototipo visual – 2025</p>
</footer>
```

### `<fieldset>` y `<legend>`
**Propósito**: Agrupa campos de formulario relacionados con una descripción.
**Implementación**: Organiza campos de configuración y formularios de registro.

```html
<fieldset>
  <legend class="visually-hidden">Datos de acceso</legend>
  <div class="grupo-campo">
    <label for="email">Correo electrónico</label>
    <input type="email" id="email" name="email" required />
  </div>
</fieldset>
```

### `<article>`
**Propósito**: Contenido independiente y reutilizable.
**Implementación**: Utilizada para secciones de puntajes y resultados que pueden existir independientemente.

## Mejoras de Accesibilidad

### Atributos ARIA

#### `role`
Define el propósito semántico de un elemento.
```html
<div id="tablero" class="tablero-juego" role="grid" aria-label="Tablero de juego principal">
```

#### `aria-label`
Proporciona una etiqueta accesible cuando el texto visible no es suficiente.
```html
<button id="abrirMenu" class="boton-menu" aria-label="Abrir menú de navegación">
```

#### `aria-describedby`
Asocia un elemento con texto descriptivo adicional.
```html
<input type="email" id="email" aria-describedby="email-help" />
<small id="email-help" class="form-text">Ingresa tu correo electrónico</small>
```

#### `aria-current`
Indica el elemento actual en un conjunto.
```html
<li><a href="index.html" aria-current="page">Inicio</a></li>
```

#### `aria-live`
Define regiones que se actualizan dinámicamente.
```html
<div class="ronda-actual" aria-live="polite">Ronda: <span class="valor">1</span></div>
```

#### `aria-hidden`
Oculta elementos decorativos de los lectores de pantalla.
```html
<section class="pantalla" id="seccion-registro" style="display: none;" aria-hidden="true">
```

### Navegación por Teclado
Implementación de `tabindex` para elementos interactivos no estándar.
```html
<div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 1">
```

## Organización del CSS

### Archivo Principal (styles.css)
Contiene estilos compartidos entre todas las páginas:
- Reset global y estilos base
- Componentes de navegación
- Tipografía común
- Botones generales
- Formularios básicos
- Clases de utilidad

### Archivos Específicos por Página
Cada página tiene su propio archivo CSS con estilos únicos:

#### inicioPage.css
- Estilos del hero section
- Configuración específica del logo
- Botones de selección de modo

#### configuracionPage.css
- Campos de configuración
- Controles específicos (range, select)
- Enlaces de sesión

#### digitalPage.css
- Encabezado de partida
- Zona de juego
- Dinosaurios arrastrables
- Tablero de juego
- Dado virtual

#### fisicoPage.css
- Grilla del formulario de seguimiento
- Campos de entrada específicos
- Botones de cálculo

#### logearPage.css
- Layout centrado para login
- Formularios de autenticación
- Cambio entre login/registro

#### puntajePage.css
- Visualización de resultados
- Ranking y ganadores
- Botones secundarios

### Responsive Design (responsive.css)
Archivo unificado con media queries para:
- Tablets (≤768px)
- Móviles (≤600px)
- Móviles pequeños (≤480px)
- Móviles extra pequeños (≤360px)
- Orientación horizontal
- Pantallas de alta resolución
- Estilos de impresión

## Organización del JavaScript

### Modularización
Cada página tiene su propio archivo JavaScript con funcionalidad específica:

#### inicioPage.js
- Manejo del menú lateral
- Navegación entre secciones

#### configuracionPage.js
- Toggle del menú con desplazamiento de contenido
- Manejo de configuraciones

#### digitalPage.js
- Lógica del juego digital
- Funcionalidad drag and drop (preparada)
- Manejo de turnos y rondas (preparado)

#### fisicoPage.js
- Formulario de seguimiento
- Validación de campos (preparada)
- Cálculo de puntajes (preparado)

#### logearPage.js
- Cambio entre formularios de login y registro
- Validación de formularios (preparada)

#### puntajePage.js
- Visualización de resultados
- Carga dinámica de puntajes (preparada)

### Documentación
Cada archivo JavaScript incluye:
- Comentarios JSDoc descriptivos
- Explicación de la funcionalidad
- TODOs para futuras mejoras
- Código limpio y bien estructurado

## Mejoras en Formularios

### Etiquetas Asociadas
Todos los inputs tienen labels correctamente asociados:
```html
<label for="volumen">Volumen:</label>
<input type="range" id="volumen" name="volumen" min="0" max="100" />
```

### Texto de Ayuda
Implementación de texto descriptivo para mejorar la usabilidad:
```html
<input type="email" id="email" aria-describedby="email-help" />
<small id="email-help" class="form-text">Ingresa tu correo electrónico</small>
```

### Validación
Campos marcados como requeridos y con tipos específicos:
```html
<input type="email" id="email" name="email" required />
```

## Metadatos Mejorados

### Descripciones por Página
Cada página tiene una descripción específica para SEO:
```html
<meta name="description" content="Página de inicio de Draftosaurus - Elige tu modo de juego favorito" />
```

### Enlaces Externos Seguros
Implementación de seguridad en enlaces externos:
```html
<a href="https://example.com" target="_blank" rel="noopener">Enlace externo</a>
```

## Beneficios de la Refactorización

### Mantenibilidad
- Código organizado en módulos específicos
- Separación clara de responsabilidades
- Fácil localización de estilos y funcionalidades

### Escalabilidad
- Estructura preparada para nuevas páginas
- Patrones consistentes para extensión
- Arquitectura modular

### Accesibilidad
- Cumplimiento de estándares WCAG
- Navegación por teclado completa
- Compatibilidad con lectores de pantalla

### SEO
- Semántica HTML5 correcta
- Metadatos específicos por página
- Estructura clara para motores de búsqueda

### Performance
- Carga optimizada de recursos específicos
- CSS modular reduce redundancia
- JavaScript separado por funcionalidad

### Experiencia de Usuario
- Navegación intuitiva
- Feedback visual y auditivo
- Responsive design completo