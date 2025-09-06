# Documentación: JS/

Resumen rápido
- Contiene la lógica del frontend (UI, interacción con DOM, manejo de tablero, utilidades de animación y validación de movimientos).
- Lenguaje: JavaScript (cliente). Muchos módulos exponen variables globales mínimas (p. ej. window.estadoJuego, window.slotsInitializer, window.manejadorDado) para interoperabilidad entre archivos y para compatibilidad con páginas que cargan scripts en orden indeterminado.
- Principales responsabilidades: inicializar UI, manejar eventos del tablero (point & click), persistir y representar estado de juego en cliente, producir animaciones/feedback y coordinar llamadas al backend (endpoints PHP).

Estructura y descripción por fichero

JS/ (raíz)

- adminPage.js
  - Propósito: utilidades específicas de la página de administración (admin.php).
  - Funciones clave: escapeHtml(s) — sanitiza texto para inserción en HTML.
  - Por qué está: centraliza pequeñas utilidades usadas en vistas administrativas para evitar XSS al renderizar contenido dinámico.

- configuracionPage.js
  - Propósito: lógica de la página de configuración (configuracion.php).
  - Funciones: manejadores del menú lateral, toggles y persistencia local de opciones UI.
  - Por qué está: separa comportamiento de la UI de configuración del resto de la app.

- digitalPage.js
  - Propósito: Interfaz del modo digital (digital.php). Es el fichero más grande del frontend y orquesta múltiples subsistemas.
  - Clases / funciones principales:
    - Class SlotsInitializer
      - Genera casilleros (.slot) dinámicamente por zona, limpia nodos de texto residuales, provee reintentos y diagnósticos si el DOM no está listo.
      - Métodos: constructor(options), inicializarSlotsDinamicos(), generarTodosLosSlots(), sanitizarNodosTextoSlot(), obtenerSlotsConfigurados(zonaId), attachDelegatedListeners(), diagnosticarProblemaSlots(), mostrarEstado(), activarDebug(), reintentarInicializacionManual().
      - Global: window.slotsInitializer inicializado por defecto.
    - inicializarJuego(), cuandoDOMListo(), asegurarElementosDOM()
      - Orquestan EstadoJuego, TableroPointClick, ManejadorSeleccion, sistema de bots y dado.
      - Llama a EstadoJuego.reiniciarJuego(), configura persistencia, lanza dado inicial y despacha evento CustomEvent('dadoLanzado').
    - lanzarDadoManual(), configurarEventosDado()
      - Interfaz para lanzar el dado virtual, actualizar imagen y normalizar estructura del resultado.
    - mostrarPuntuacionActual(), configurarControlesJuego(), configurarAtajosTeclado(), deshacerMovimiento(), confirmarReinicio()
      - Funciones auxiliares UI para cálculos de puntuación y controles del tablero.
    - Variables globales expuestas:
      - window.slotsInitializer, window.lanzarDadoManual, y un objeto API (al final del archivo) que permite inspeccionar subsistemas (tablero, estado, calculadora, dado, validador, etc.).
  - Por qué está: núcleo del modo online/digital; integra muchos componentes (EstadoJuego, ManejadorSeleccion, TableroPointClick, utilidades) y contiene la lógica de inicialización y configuración UI.

- fisicoPage.js
  - Propósito: Interfaz del modo físico (fisico.php) — ayuda a simular/validar la colocación de dinosaurios con point & click en modo local.
  - Funciones / responsabilidades:
    - Manejo de DOM: selección de dinosaurios, click/keydown en slots, accesibilidad (tabindex), snackbar simple.
    - Funciones: seleccionarDino(), validarReglasZona(zona, tipo, numeroSlot, reemplazo), colocarDinosaurio(), eliminarDinosaurio(), limpiarTablero(), calcularPuntuacion(), mostrarResultadoPuntuacion(), nombreZona(id).
    - Variables: estadoTablero (local), dinoSeleccionado, snackbar timer, playerId obtenido de main#mainContent.dataset.playerId.
  - Por qué está: provee una experiencia local/visual para probar reglas y calcular puntuaciones sin backend, además de la versión imprimible/física del juego.

- fisicoProcesamiento.js
  - Propósito: modulariza el procesamiento del formulario de fisico.php hacia el backend (calcularFisico.php).
  - Clase FisicoFormManager
    - Métodos: initializeElements(), init(), bindEvents(), submitHandler(), parseResponse(response), handleReset(), hideResultado(), createZoneDetailItem(zonaId, det), createBonusSection(bonuses), createFooter().
    - Behavior: valida respuestas del servidor, muestra resultados en DOM, maneja errores de parseo JSON y entradas vacías.
    - Export: instancia inicializada en DOMContentLoaded; también exporta la clase para testing/module.
  - Por qué está: separa la lógica de manipulación del formulario y presentación de resultados del HTML/plantilla, facilitando mantenimiento y tests.

- inicioPage.js
  - Propósito: comportamiento de la página de inicio (index.php).
  - Funciones: generalmente manejo de UI inicial (botones, animaciones intro, navegación rápida).
  - Por qué está: keep page-specific scripts isolated.

- logearPage.js
  - Propósito: lógica de la página de login/registro (logear.php).
  - Funciones: mostrarMensaje(elementId, mensaje, tipo) — muestra mensajes de estado en la UI; inicializadores vinculados a DOMContentLoaded.
  - Por qué está: maneja UX de autenticación de forma separada.

- navigation.js
  - Propósito: manejador del menú lateral / off-canvas y accesibilidad (trap focus, toggle, overlay).
  - Funciones principales: init(), onToggleClick(), openMenu(), closeMenu(), trapFocus(), getFocusableElements().
  - Otras: cerrarSesion() — realiza petición al backend para cerrar sesión; se asegura de agregar el handler una sola vez.
  - Por qué está: componente reutilizable para navegación y accesibilidad en todas las páginas.

- puntajePage.js
  - Propósito: scripts para la vista de puntuación (puntaje.php).
  - Funciones: toggles de menú, interacciones de la página que muestran resultados/paneles.
  - Por qué está: separar comportamiento de la vista de puntuación.

- session_check.js
  - Propósito: utilidades para chequear sesión desde frontend (p. ej. redirect si no autenticado) — complementa flow de verificarSesionYConfigurarUI() en digitalPage.js.
  - Por qué está: centraliza chequeos de sesión reutilizables por páginas.

- pruebas/pruebasRestricciones.js
  - Propósito: scripts de testing y playground para reglas/validador de tablero. No críticos en producción.
  - Por qué está: ayuda para desarrollo y depuración de reglas del juego.

JS/tablero/
(Contiene la lógica del tablero y selección. Estos módulos forman el núcleo del motor frontend del juego.)

- EstadoJuego.js
  - Clase: EstadoJuego
  - Propósito: mantiene la representación del estado del juego en el cliente, historial (para deshacer), persistencia local (localStorage) y operaciones de alto nivel.
  - Métodos importantes:
    - constructor(), inicializarEstado(), inicializarTableroVacio()
    - configurarPersistencia(), guardarEstado(), cargarEstado()
    - colocarDinosaurio(jugadorId, zonaId, dinosaurio, slotId)
    - actualizarTableroVisual(), actualizarInterfazCompleta(), mostrarResultadosFinales(ganador, puntuacion)
    - avanzarRonda() — incluye lógica para lanzar dado si hay manejador y despachar evento 'dadoLanzado'.
  - Por qué está: centraliza estado de la partida y la sincronización UI <-> estado.

- ManejadorDado.js
  - Clase: ManejadorDado
  - Propósito: encapsula la lógica del dado virtual y sus reglas por ronda.
  - Funciones esperadas: lanzarDadoParaRonda(ronda, totalJugadores), reiniciar(), configurarEventos(), obtenerEstadisticas().
  - Por qué está: desacopla el comportamiento del dado del resto de la UI.

- ManejadorSeleccion.js
  - Clase: ManejadorSeleccion
  - Propósito: gestiona la selección (dinosaurio o slot), feedback visual y animaciones de interacción.
  - Métodos principales:
    - seleccionarDinosaurio(elementoDino), seleccionarSlot(elementoSlot), limpiarSeleccionAnterior()
    - resaltarSlotsDisponibles(elementoDino) — consulta window.validadorDado.getValidSlots o usa heurísticas
    - agregarEfectoPulso/removerEfectoPulso, agregarEfectoResaltado/removerEfectoResaltado, agregarEfectoDisponible/removerEfectoDisponible
    - mostrarPreviewColocacion(slot, tipoDino), ocultarPreviewColocacion(slot), animarColocacionDinosaurio(dinosaurioOrigen, slotDestino, callback)
  - Por qué está: separa la lógica de UX de interacción del tablero del modelo EstadoJuego.

- SistemaBots.js
  - Propósito: adaptador/encapsulación del sistema de bots en frontend (para simulaciones o integración con backend).
  - Métodos: decidir movimientos, sincronizar con ValidadorTablero (puede delegar al backend en versiones remotas).
  - Nota: existe también una implementación en backend para motores más robustos; frontend mantiene una versión ligera por compatibilidad.

- TableroPointClick.js
  - Clase: TableroPointClick
  - Propósito: implementación concreta del tablero interactivo point & click.
  - Métodos / responsabilidades:
    - limpiarSeleccion(), resaltarSlotsDisponibles(), intentarColocarDinosaurio(slot), mostrarMensaje(mensaje, tipo), obtenerEstadoJuego()
    - Integra ManejadorSeleccion para animaciones y validaciones visuales.
  - Por qué está: conecta la UI del tablero con las decisiones del usuario y el EstadoJuego.

JS/utils/
(Utilidades pequeñas y compartidas: animaciones, calibración visual, mapeo de recursos, validación, tooltips.)

- animaciones.js
  - Clase: UtilidadesAnimacion (instancia global window.utilidadesAnimacion)
  - Métodos: animarMovimiento, aplicarPulso, removerPulso, aplicarParpadeo, aparecerSuave, desaparecerSuave, animarContador, crearParticulas, crearOndasConcentricas, mostrarTextoFlotante, aplicarBrillo, limpiarAnimaciones, animacionesHabilitadas, ejecutarSiHabilitada.
  - Por qué está: centraliza microinteracciones, evita duplicar CSS/JS de animación.

- calibradorTablero.js
  - Clase: CalibradorTablero (window.calibradorTablero instanciado)
  - Funciones: crearPanelControl(), aplicarPosicionesOptimizadas(), exportarCSS(), configurarEventos(), cargarPosicionesGuardadas(), guardarPosiciones(), activarModoCalibrado(), desactivarModoCalibrado().
  - Por qué está: herramienta dev/UX para ajustar posiciones y tamaños de zonas del tablero (útil para calibración visual en distintas pantallas).

- controladorTamano.js
  - Propósito: ajusta tamaños/escala del tablero y UI en respuesta a atajos (Ctrl/Ctrl+Alt) y eventos de ventana.
  - Por qué está: facilita adaptabilidad y accesibilidad.

- mapeoDinosaurios.js
  - Propósito: mapea recursos de imagen a tipos de dinosaurio y viceversa; utilizable por ManejadorSeleccion y SlotInitializer para elegir imagen/alt.
  - Por qué está: desacopla referencias a rutas de imagen y permite reemplazos centralizados.

- tooltips.js
  - Propósito: sistema ligero de tooltips/ayuda contextual y mensajes introductorios.
  - Métodos: mostrarAyudaTemporal(), configurarTodosLosTooltips(), etc.
  - Por qué está: ofrece ayuda contextual sin depender de librerías externas.

- validadorDado.js
  - Propósito: adaptador frontend para consultar validaciones basadas en el resultado del dado. En algunos casos delega al backend (validarMovimiento.php) o ejecuta heurísticas locales.
  - API esperada: getValidSlots(zonaId, dinosauriosEnZona, dinosaurio, jugadorId, estado) -> Promise<{ validSlots:[], razon?:string }>
  - Por qué está: punto centralizado para decidir si una colocación es permitida por la restricción del dado.

Integración y contratos importantes
- Eventos globales:
  - CustomEvent('dadoLanzado', { detail: { estado } }) — dispatch: digitalPage.js / EstadoJuego; listeners: slots initializer, bots, validadores y UI.
- Globals expuestos (por compatibilidad): window.estadoJuego, window.slotsInitializer, window.manejadorDado, window.validadorDado, window.utilidadesAnimacion, window.calibradorTablero, window.sistemaBots.
- Interacción con backend (endpoints PHP): navigation.js (cerrarSesion.php), digitalPage.js/validadorDado.js (validarMovimiento.php, obtenerMovimientoBot.php), fisicoProcesamiento.js (calcularFisico.php), digitalPage.js (calcularPuntuacion.php).

Buenas prácticas y notas operativas
- Los módulos UI están separados por página para minimizar dependencias innecesarias. digitalPage.js centraliza la mayor parte de la lógica del juego y debe cargarse sólo en digital.php.
- Evitar cargar varias instancias globales: comprobar si window.<obj> existe antes de instanciar.
- Persistencia: EstadoJuego guarda periódicamente en localStorage; guardado manual adicional se realiza al lanzar dado o avanzar ronda.
- Accesibilidad: navigation.js intenta trap focus en menús; slots son focusables con tabindex y reaccionan a keydown (Enter/Space).
- Debug: muchas clases exponen métodos activarDebug() y window.debugValidacion para facilitar diagnósticos.

Resumen final
- JS/ contiene la lógica completa del frontend del juego: interacción, validación y presentación.
- Para cambios de reglas o de comunicación con backend, los puntos clave son validadorDado.js (puente), EstadoJuego.js (modelo), ManejadorSeleccion.js (UX) y digitalPage.js (orquestador).

