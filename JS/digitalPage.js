/**
 * Funcionalidad específica para la página del juego digital
 * Maneja la navegación del menú y la lógica completa del juego
 */

// Variables globales del juego
let tableroJuego;
let manejadorSeleccion;
let validadorRestricciones;
let estadoJuego;
let calculadoraPuntuacion;
let sistemaBots;

document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById('abrirMenu');
  const menu = document.getElementById('menuLateral');

  // Abrir/cerrar menú lateral
  boton.addEventListener('click', () => {
    menu.classList.toggle('abierto');
  });

  // Cerrar menú al hacer clic en cualquier enlace
  menu.querySelectorAll('a').forEach(enlace => {
    enlace.addEventListener('click', () => {
      menu.classList.remove('abierto');
    });
  });

  // Inicializar el sistema de juego
  inicializarJuego();

  // Configurar controles adicionales
  configurarControlesJuego();

  // Configurar tooltips después de que todo esté cargado
  setTimeout(() => {
    if (window.sistemaTooltips) {
      sistemaTooltips.configurarTodosLosTooltips();
      sistemaTooltips.mostrarAyudaTemporal('¡Bienvenido a Draftosaurus!\\n\\n**Instrucciones:**\\n1. Haz clic en un dinosaurio para seleccionarlo\\n2. Haz clic en un slot válido para colocarlo\\n3. Cada zona tiene reglas específicas\\n\\n*Pasa el mouse sobre las zonas para ver más información*\\n\\n**Herramientas:**\\n• Ctrl+Shift+C: Calibrar posiciones\\n• Ctrl+Shift+Y: Control de tamaño\\n• Ctrl+Alt+Plus/Minus: Cambiar tamaño rápido', 6000);
    }
  }, 1000);
});

/**
 * Inicializa todos los componentes del juego
 * ACTUALIZADO: Incluye sistema de dados
 */
function inicializarJuego() {
  try {
    console.log('🚀 Iniciando inicialización del juego...');

    // Crear instancias de las clases principales EN ORDEN
    console.log('📊 Inicializando ValidadorRestricciones...');
    validadorRestricciones = new ValidadorRestricciones();

    console.log('🧮 Inicializando CalculadoraPuntuacion...');
    calculadoraPuntuacion = new CalculadoraPuntuacion();

    console.log('🎮 Inicializando EstadoJuego...');
    estadoJuego = new EstadoJuego();

    // Hacer estadoJuego disponible globalmente INMEDIATAMENTE
    window.estadoJuego = estadoJuego;
    console.log('✅ EstadoJuego disponible globalmente');

    console.log('🎯 Inicializando TableroPointClick...');
    tableroJuego = new TableroPointClick();

    console.log('🎨 Inicializando ManejadorSeleccion...');
    manejadorSeleccion = new ManejadorSeleccion(tableroJuego);

    // NUEVO: Inicializar sistema de dado
    window.manejadorDado = new ManejadorDado();
    window.validadorDado = new ValidadorDado(window.manejadorDado);

    // NUEVO: Inicializar sistema de bots
    sistemaBots = new SistemaBots();
    window.sistemaBots = sistemaBots;

    // Configurar eventos adicionales
    manejadorSeleccion.configurarEventosPreview();

    // NUEVO: Configurar eventos del dado
    configurarEventosDado();

    // NUEVO: Lanzar dado para la primera ronda
    iniciarPrimeraRonda();

    console.log('🎮 Sistema de juego inicializado correctamente');
    mostrarMensajeBienvenida();

  } catch (error) {
    console.error('❌ Error al inicializar el juego:', error);
    mostrarErrorInicializacion();
  }
}

/**
 * Configura controles adicionales del juego
 */
function configurarControlesJuego() {
  // Agregar botones de control
  const contenedorTablero = document.querySelector('.contenedor-tablero');
  const controlesJuego = document.createElement('div');
  controlesJuego.className = 'controles-juego';
  controlesJuego.innerHTML = `
    <div class="grupo-controles">
      <button id="btn-deshacer" class="boton-control" title="Deshacer último movimiento">
        ↶ Deshacer
      </button>
      <button id="btn-reiniciar" class="boton-control" title="Reiniciar tablero">
        🔄 Reiniciar
      </button>
      <button id="btn-calcular-puntos" class="boton-control" title="Calcular puntuación actual">
        📊 Puntos
      </button>
    </div>
    <div class="info-turno">
      <span class="etiqueta-turno">Turno del Jugador:</span>
      <span id="jugador-actual" class="numero-jugador">1</span>
    </div>
  `;

  contenedorTablero.appendChild(controlesJuego);

  // Configurar eventos de los botones
  document.getElementById('btn-deshacer').addEventListener('click', deshacerMovimiento);
  document.getElementById('btn-reiniciar').addEventListener('click', confirmarReinicio);
  document.getElementById('btn-calcular-puntos').addEventListener('click', mostrarPuntuacionActual);

  // Configurar atajos de teclado
  configurarAtajosTeclado();
}

/**
 * Configura atajos de teclado para el juego
 */
function configurarAtajosTeclado() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Z para deshacer
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      deshacerMovimiento();
    }

    // Ctrl+R para reiniciar (con confirmación)
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      confirmarReinicio();
    }

    // Escape para limpiar selección
    if (e.key === 'Escape') {
      tableroJuego.limpiarSeleccion();
    }

    // Espacio para calcular puntos
    if (e.key === ' ') {
      e.preventDefault();
      mostrarPuntuacionActual();
    }
  });
}

/**
 * Deshace el último movimiento
 */
function deshacerMovimiento() {
  if (estadoJuego.deshacerMovimiento()) {
    tableroJuego.mostrarMensaje('Movimiento deshecho', 'info');
  } else {
    tableroJuego.mostrarMensaje('No hay movimientos para deshacer', 'advertencia');
  }
}

/**
 * Confirma y reinicia el juego
 */
function confirmarReinicio() {
  const confirmacion = confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderá todo el progreso.');

  if (confirmacion) {
    estadoJuego.reiniciarJuego();
    tableroJuego.reiniciarTablero();
    tableroJuego.mostrarMensaje('Juego reiniciado', 'info');
    actualizarInterfazJugador();
  }
}

/**
 * Muestra la puntuación actual
 */
function mostrarPuntuacionActual() {
  const estado = estadoJuego.obtenerEstado();
  const puntuacion1 = calculadoraPuntuacion.generarReportePuntuacion(estado.tablero, 1);
  const puntuacion2 = calculadoraPuntuacion.generarReportePuntuacion(estado.tablero, 2);
  const puntuacion3 = calculadoraPuntuacion.generarReportePuntuacion(estado.tablero, 3);

  mostrarModalPuntuacion(puntuacion1, puntuacion2, puntuacion3);
}

/**
 * Muestra un modal con la puntuación detallada
 */
function mostrarModalPuntuacion(puntuacion1, puntuacion2, puntuacion3) {
  const modal = document.createElement('div');
  modal.className = 'modal-puntuacion';
  modal.innerHTML = `
    <div class="contenido-modal-puntuacion">
      <h3>📊 Puntuación Actual</h3>
      <div class="comparacion-jugadores">
        <div class="puntuacion-jugador">
          <h4>🎮 Jugador 1 (Tú)</h4>
          <div class="puntos-totales">${puntuacion1.puntuacionTotal} puntos</div>
          <div class="detalles-puntuacion">
            ${generarDetallesPuntuacion(puntuacion1.detallesBase)}
          </div>
        </div>
        <div class="puntuacion-jugador">
          <h4>🤖 Bot Alpha</h4>
          <div class="puntos-totales">${puntuacion2.puntuacionTotal} puntos</div>
          <div class="detalles-puntuacion">
            ${generarDetallesPuntuacion(puntuacion2.detallesBase)}
          </div>
        </div>
        <div class="puntuacion-jugador">
          <h4>🤖 Bot Beta</h4>
          <div class="puntos-totales">${puntuacion3.puntuacionTotal} puntos</div>
          <div class="detalles-puntuacion">
            ${generarDetallesPuntuacion(puntuacion3.detallesBase)}
          </div>
        </div>
      </div>
      <div class="acciones-modal">
        <button onclick="this.closest('.modal-puntuacion').remove()" class="boton-cerrar">
          Cerrar
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Genera HTML para los detalles de puntuación
 */
function generarDetallesPuntuacion(detalles) {
  return Object.entries(detalles).map(([zona, info]) => {
    const nombreZona = obtenerNombreZonaLegible(zona);
    return `<div class="detalle-zona">${nombreZona}: ${info.puntos} pts</div>`;
  }).join('');
}

/**
 * Convierte el ID de zona a nombre legible
 */
function obtenerNombreZonaLegible(zonaId) {
  const nombres = {
    'bosque-semejanza': 'Bosque de la Semejanza',
    'trio-frondoso': 'El Trío Frondoso',
    'prado-diferencia': 'Prado de la Diferencia',
    'pradera-amor': 'La Pradera del Amor',
    'isla-solitaria': 'La Isla Solitaria',
    'rey-selva': 'El Rey de la Selva',
    'dinos-rio': 'Dinosaurios en el Río'
  };

  return nombres[zonaId] || zonaId;
}

/**
 * Actualiza la interfaz del jugador actual
 */
function actualizarInterfazJugador() {
  const estado = estadoJuego.obtenerEstado();
  const elementoJugador = document.getElementById('jugador-actual');

  if (elementoJugador) {
    let textoJugador = '';
    let claseJugador = `numero-jugador jugador-${estado.jugadorActual}`;

    switch (estado.jugadorActual) {
      case 1:
        textoJugador = '1 (Tú)';
        break;
      case 2:
        textoJugador = '2 (Bot Alpha)';
        claseJugador += ' bot-jugando';
        break;
      case 3:
        textoJugador = '3 (Bot Beta)';
        claseJugador += ' bot-jugando';
        break;
      default:
        textoJugador = estado.jugadorActual;
    }

    elementoJugador.textContent = textoJugador;
    elementoJugador.className = claseJugador;
  }
}

/**
 * Muestra mensaje de bienvenida
 */
function mostrarMensajeBienvenida() {
  setTimeout(() => {
    tableroJuego.mostrarMensaje('🎮 ¡Listo para jugar! Tú vs Bot Alpha vs Bot Beta. Es tu turno, selecciona un dinosaurio.', 'info');

    // Iniciar partida automáticamente
    iniciarPartidaConBotsAutomaticamente();

    // Activar debug automáticamente para diagnosticar problemas
    if (window.draftosaurusDebug) {
      window.draftosaurusDebug.activarDebug();
      console.log('🎲 Sistema de dados inicializado. Usa window.draftosaurusDebug para debugging.');
      console.log('🤖 Sistema de bots inicializado:', sistemaBots.obtenerInfoBots());
    }
  }, 1000);
}

/**
 * NUEVO: Inicia automáticamente la partida con bots
 */
function iniciarPartidaConBotsAutomaticamente() {
  try {
    console.log('🤖 Iniciando partida automática con bots...');

    // Verificar que el sistema de bots esté inicializado
    if (!window.sistemaBots) {
      console.error('❌ Sistema de bots no inicializado');
      return;
    }

    // Verificar que el estado del juego esté listo
    if (!estadoJuego) {
      console.error('❌ Estado del juego no inicializado');
      return;
    }

    // Configurar el juego para 3 jugadores (ya está configurado en EstadoJuego.js)
    const estado = estadoJuego.obtenerEstado();
    console.log(`🎮 Partida iniciada con ${estado.totalJugadores} jugadores`);
    console.log(`👤 Jugador actual: ${estado.jugadorActual}`);

    // Actualizar la interfaz para mostrar el estado inicial
    actualizarInterfazJugador();

    // Mostrar información de los bots
    const infoBots = sistemaBots.obtenerInfoBots();
    console.log('🤖 Información de bots:', infoBots);

    // Si por alguna razón el turno inicial no es del jugador 1, activar el bot correspondiente
    if (estado.jugadorActual !== 1 && sistemaBots.esBot(estado.jugadorActual)) {
      setTimeout(() => {
        sistemaBots.ejecutarTurnoBot(estado.jugadorActual);
      }, 2000); // Dar tiempo para que se cargue todo
    }

    console.log('✅ Partida con bots iniciada correctamente');

  } catch (error) {
    console.error('❌ Error al iniciar partida con bots:', error);
    tableroJuego.mostrarMensaje('Error al iniciar partida con bots. Recarga la página.', 'error');
  }
}

/**
 * Muestra error de inicialización
 */
function mostrarErrorInicializacion() {
  const error = document.createElement('div');
  error.className = 'error-inicializacion';
  error.innerHTML = `
    <h3>❌ Error al cargar el juego</h3>
    <p>Hubo un problema al inicializar el sistema de juego. Por favor, recarga la página.</p>
    <button onclick="location.reload()" class="boton-recargar">🔄 Recargar Página</button>
  `;

  document.querySelector('.contenedor-tablero').appendChild(error);
}

/**
 * Función para manejar el avance de turno (llamada desde TableroPointClick)
 * CORREGIDO: Solo verificar fin de juego al completar rondas, no después de cada movimiento
 */
function avanzarTurno() {
  const estadoAntes = estadoJuego.obtenerEstado();

  // Avanzar el turno
  estadoJuego.avanzarTurno();
  actualizarInterfazJugador();

  // Obtener el estado actual después del avance
  const estado = estadoJuego.obtenerEstado();

  console.log(`🎮 Turno avanzado: ${estadoAntes.turnoActual} → ${estado.turnoActual}, Jugador: ${estadoAntes.jugadorActual} → ${estado.jugadorActual}`);

  // CORREGIDO: Solo verificar fin de juego si se completó una ronda
  // Una ronda se completa cuando todos los jugadores han jugado
  const seCompletoRonda = estadoAntes.rondaActual < estado.rondaActual;

  if (seCompletoRonda) {
    console.log(`🎯 Ronda ${estadoAntes.rondaActual} completada. Verificando fin de juego...`);

    if (estadoJuego.verificarFinJuego()) {
      console.log('🏁 Fin del juego detectado después de completar ronda');
      mostrarPuntuacionActual();
      return;
    }
  } else {
    console.log(`⏭️ Turno individual completado. Ronda ${estado.rondaActual} continúa...`);
  }

  // Si es turno de un bot, ejecutarlo automaticamente
  if (sistemaBots.esBot(estado.jugadorActual)) {
    setTimeout(() => {
      sistemaBots.ejecutarTurnoBot(estado.jugadorActual);
    }, 2000); // Esperar 2 segundos antes del turno del bot
  }

  // Mostrar mensaje del turno actual
  mostrarMensajeTurnoActual(estado);
}

/**
 * Muestra mensaje del turno actual
 */
function mostrarMensajeTurnoActual(estado) {
  let mensaje = '';

  switch (estado.jugadorActual) {
    case 1:
      mensaje = `Turno ${estado.turnoActual} - Ronda ${estado.rondaActual}: Es tu turno. Selecciona un dinosaurio.`;
      break;
    case 2:
      mensaje = `Turno ${estado.turnoActual} - Ronda ${estado.rondaActual}: Turno de Bot Alpha. Esperando movimiento...`;
      break;
    case 3:
      mensaje = `Turno ${estado.turnoActual} - Ronda ${estado.rondaActual}: Turno de Bot Beta. Esperando movimiento...`;
      break;
    default:
      mensaje = `Turno ${estado.turnoActual} - Ronda ${estado.rondaActual}: Jugador ${estado.jugadorActual}`;
  }

  if (tableroJuego) {
    tableroJuego.mostrarMensaje(mensaje, 'info');
  }

  console.log(mensaje);
}

/**
 * Función para validar movimiento (llamada desde TableroPointClick)
 * REFACTORIZADO: Usa el nuevo sistema de restricciones unificado
 */
function validarMovimiento(zonaId, dinosaurio, slot, jugadorId, estadoJuegoParam) {
  // Verificación robusta del estado del juego
  let estado = estadoJuegoParam;

  if (!estado) {
    // Intentar obtener desde diferentes fuentes
    if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
      estado = window.estadoJuego.obtenerEstado();
    } else if (estadoJuego && typeof estadoJuego.obtenerEstado === 'function') {
      estado = estadoJuego.obtenerEstado();
    }
  }

  if (!estado) {
    console.error('Estado del juego no disponible para validacion');
    console.log('Debug - window.estadoJuego:', window.estadoJuego);
    console.log('Debug - global estadoJuego:', typeof estadoJuego !== 'undefined' ? estadoJuego : 'undefined');
    return { valido: false, razon: 'Estado del juego no disponible - Juego inicializándose' };
  }

  const dinosauriosEnZona = estado.tablero[zonaId] || [];

  // Usar el nuevo sistema de restricciones refactorizado
  return validadorRestricciones.validarColocacion(zonaId, dinosauriosEnZona, dinosaurio, slot, jugadorId, estado);
}

// Hacer funciones disponibles globalmente
window.validarMovimiento = validarMovimiento;
window.registrarMovimiento = registrarMovimiento;
window.avanzarTurno = avanzarTurno;
window.lanzarDadoManual = lanzarDadoManual;

/**
 * Función para registrar movimiento (llamada desde TableroPointClick)
 */
function registrarMovimiento(zonaId, dinosaurio, slotId) {
  estadoJuego.colocarDinosaurio(zonaId, dinosaurio, slotId);

  // SOLO avanzar turno si es el jugador humano
  const estado = estadoJuego.obtenerEstado();
  if (estado.jugadorActual === 1) {
    setTimeout(() => {
      avanzarTurno();
    }, 1000);
  }
}

/**
 * NUEVO: Configura eventos del sistema de dados
 */
function configurarEventosDado() {
  // Escuchar cambios en el estado del dado
  window.addEventListener('dadoCambiado', (evento) => {
    const { estado, info } = evento.detail;
    mostrarEstadoDado(estado, 1); // Asumir jugador 1 es humano

    // Actualizar resaltado de slots si hay selección activa
    if (window.manejadorSeleccion && manejadorSeleccion.haySeleccion()) {
      manejadorSeleccion.actualizarPorCambioDado();
    }
  });

  console.log('🎲 Eventos del dado configurados');
}

/**
 * NUEVO: Inicia la primera ronda con el dado
 */
function iniciarPrimeraRonda() {
  try {
    // Crear interfaz del dado PRIMERO y verificar que se creó correctamente
    const interfazCreada = crearInterfazDado();

    if (!interfazCreada) {
      console.error('❌ No se pudo crear la interfaz del dado');
      return;
    }

    // Verificar que el manejador de dado esté inicializado
    if (!window.manejadorDado) {
      console.error('❌ ManejadorDado no inicializado');
      return;
    }

    // NO lanzar el dado automáticamente - esperar a que el jugador lo lance
    console.log('🎲 Primera ronda iniciada - Esperando que el jugador lance el dado');

    // Mostrar mensaje al usuario para que lance el dado
    if (tableroJuego) {
      tableroJuego.mostrarMensaje('Haz clic en el dado para comenzar tu turno', 'info');
    }

  } catch (error) {
    console.error('❌ Error al iniciar primera ronda:', error);
  }
}

/**
 * NUEVO: Función para lanzar el dado manualmente desde la interfaz
 */
function lanzarDadoManual() {
  if (!window.manejadorDado) {
    console.error('Sistema de dados no inicializado');
    return;
  }

  const dadoVirtual = document.querySelector('.dado-virtual');

  if (!dadoVirtual) {
    console.warn('Elemento dado virtual no encontrado');
    return;
  }

  // Prevenir múltiples clics durante la animación
  if (dadoVirtual.classList.contains('lanzando')) {
    return;
  }

  // Agregar clase de animación
  dadoVirtual.classList.add('lanzando');

  // Obtener ronda actual
  const estadoActual = window.estadoJuego ? estadoJuego.obtenerEstado() : { rondaActual: 1 };

  setTimeout(() => {
    // Lanzar el dado
    const estadoDado = window.manejadorDado.lanzarDadoParaRonda(estadoActual.rondaActual, 3);

    // Actualizar interfaces
    mostrarEstadoDado(estadoDado, 1);
    actualizarDadoVirtual(estadoDado);

    // Remover clase de animación y agregar resultado
    dadoVirtual.classList.remove('lanzando');
    dadoVirtual.classList.add('resultado');

    // Actualizar resaltado si hay selección activa
    if (window.manejadorSeleccion && manejadorSeleccion.haySeleccion()) {
      manejadorSeleccion.actualizarPorCambioDado();
    }

    // Mostrar mensaje informativo
    const regla = window.manejadorDado.reglasDado[estadoDado.caraActual];
    const esJugadorQueLanza = estadoDado.jugadorQueLanzo === 1;

    if (esJugadorQueLanza) {
      tableroJuego.mostrarMensaje(`🎲 ¡Lanzaste ${regla.nombre}! Puedes colocar donde quieras`, 'exito');
    } else {
      tableroJuego.mostrarMensaje(`🎲 ${regla.nombre}: ${regla.descripcion}`, 'info');
    }

    console.log('🎲 Dado lanzado manualmente:', estadoDado);

  }, 1000); // Duración de la animación
}

/**
 * NUEVO: Actualiza el dado virtual en el header
 */
function actualizarDadoVirtual(estadoDado) {
  const dadoVirtual = document.querySelector('.dado-virtual');
  const imagenDado = document.getElementById('imagen-dado');
  const textoDado = document.querySelector('.texto-dado');

  if (!dadoVirtual || !imagenDado || !textoDado) {
    console.warn('Elementos del dado virtual no encontrados');
    return;
  }

  // Verificar que el sistema de dados esté completamente inicializado
  if (!window.manejadorDado || !window.manejadorDado.reglasDado || !estadoDado) {
    console.warn('Sistema de dados no completamente inicializado para actualizar dado virtual');
    return;
  }

  const regla = window.manejadorDado.reglasDado[estadoDado.caraActual];
  const esJugadorQueLanza = estadoDado.jugadorQueLanzo === 1;

  // Crear indicador de cara del dado si no existe
  let indicadorCara = dadoVirtual.querySelector('.cara-dado-resultado');
  if (!indicadorCara) {
    indicadorCara = document.createElement('div');
    indicadorCara.className = 'cara-dado-resultado';
    dadoVirtual.appendChild(indicadorCara);
  }

  // Actualizar contenido
  indicadorCara.textContent = regla.icono;

  if (esJugadorQueLanza) {
    textoDado.textContent = '¡Libre!';
    dadoVirtual.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    textoDado.style.color = 'white';
  } else {
    textoDado.textContent = 'Restringido';
    dadoVirtual.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
    textoDado.style.color = 'white';
  }

  // Agregar tooltip con información
  dadoVirtual.title = `${regla.nombre}: ${regla.descripcion}`;
}

/**
 * NUEVO: Crea la interfaz visual del dado
 */
function crearInterfazDado() {
  // Verificar si ya existe
  if (document.getElementById('contenedor-dado')) {
    console.log('🎲 Interfaz del dado ya existe');
    return true;
  }

  try {
    const contenedorDado = document.createElement('div');
    contenedorDado.id = 'contenedor-dado';
    contenedorDado.className = 'dado-container';
    contenedorDado.innerHTML = `
      <div id="estado-dado" class="dado-estado">
        <!-- Contenido dinámico del dado -->
      </div>
      <div id="info-ronda" class="ronda-info">
        <span class="ronda-numero">Ronda 1</span>
        <span class="jugador-turno">Tu turno</span>
      </div>
    `;

    document.body.appendChild(contenedorDado);

    // Verificar que se creó correctamente
    const verificacion = document.getElementById('estado-dado');
    if (verificacion) {
      console.log('🎲 Interfaz del dado creada correctamente');
      return true;
    } else {
      console.error('❌ Error: No se pudo crear el elemento estado-dado');
      return false;
    }

  } catch (error) {
    console.error('❌ Error al crear interfaz del dado:', error);
    return false;
  }
}

/**
 * NUEVO: Muestra el estado actual del dado
 */
function mostrarEstadoDado(estadoDado, jugadorActual) {
  const contenedorDado = document.getElementById('estado-dado');

  if (!contenedorDado) {
    console.warn('Contenedor del dado no encontrado, intentando crear interfaz...');
    // Intentar crear la interfaz del dado si no existe
    crearInterfazDado();

    // Intentar obtener el contenedor nuevamente
    const contenedorDadoNuevo = document.getElementById('estado-dado');
    if (!contenedorDadoNuevo) {
      console.error('❌ No se pudo crear la interfaz del dado');
      return;
    }

    // Continuar con el contenedor recién creado
    return mostrarEstadoDado(estadoDado, jugadorActual);
  }

  // Verificar que el sistema de dados esté inicializado
  if (!window.manejadorDado || !window.manejadorDado.reglasDado) {
    console.warn('Sistema de dados no completamente inicializado');
    return;
  }

  if (!estadoDado || !estadoDado.activo) {
    contenedorDado.innerHTML = `
      <div class="dado-inactivo">
        <div class="cara-dado">🎲</div>
        <div class="info-dado">
          <h3>Dado Inactivo</h3>
          <p>Esperando nueva ronda...</p>
        </div>
      </div>
    `;
    return;
  }

  const regla = window.manejadorDado.reglasDado[estadoDado.caraActual];
  const esJugadorQueLanza = estadoDado.jugadorQueLanzo === jugadorActual;

  if (esJugadorQueLanza) {
    contenedorDado.innerHTML = `
      <div class="dado-resultado jugador-libre" style="--color-cara: ${regla.color}">
        <div class="cara-dado">${regla.icono}</div>
        <div class="info-dado">
          <h3>🎲 ¡Lanzaste el dado!</h3>
          <p><strong>${regla.nombre}</strong></p>
          <p class="privilegio">✨ Puedes colocar donde quieras</p>
        </div>
      </div>
    `;
  } else {
    const estadoJuegoActual = window.estadoJuego ? estadoJuego.obtenerEstado() : null;
    const zonasPermitidas = regla.zonasPermitidas ?
      regla.zonasPermitidas(estadoJuegoActual) : [];

    contenedorDado.innerHTML = `
      <div class="dado-resultado jugador-restringido" style="--color-cara: ${regla.color}">
        <div class="cara-dado">${regla.icono}</div>
        <div class="info-dado">
          <h3>🎲 Restricción del Dado</h3>
          <p><strong>${regla.nombre}</strong></p>
          <p class="descripcion">${regla.descripcion}</p>
          <div class="zonas-permitidas">
            <small>Zonas disponibles: ${zonasPermitidas.length}</small>
          </div>
        </div>
      </div>
    `;
  }

  // Actualizar info de ronda
  const infoRonda = document.getElementById('info-ronda');
  if (infoRonda) {
    infoRonda.innerHTML = `
      <span class="ronda-numero">Ronda ${estadoDado.rondaActual}</span>
      <span class="jugador-turno">${esJugadorQueLanza ? 'Lanzaste el dado' : 'Sigue la restricción'}</span>
    `;
  }
}

/**
 * NUEVO: Avanza a la siguiente ronda con nuevo dado
 */
function avanzarRonda() {
  const estadoActual = estadoJuego.obtenerEstado();
  const nuevaRonda = estadoActual.rondaActual + 1;

  // Finalizar ronda anterior del dado
  window.manejadorDado.finalizarRonda();

  // Lanzar dado para nueva ronda
  const estadoDado = window.manejadorDado.lanzarDadoParaRonda(nuevaRonda, 3);
  mostrarEstadoDado(estadoDado, 1);

  console.log(`🎲 Avanzado a ronda ${nuevaRonda}`);
}

// Hacer funciones disponibles globalmente para debugging
window.draftosaurusDebug = {
  tablero: () => tableroJuego,
  estado: () => estadoJuego,
  validador: () => validadorRestricciones,
  calculadora: () => calculadoraPuntuacion,
  dado: () => window.manejadorDado,
  validadorDado: () => window.validadorDado,
  reiniciar: () => confirmarReinicio(),
  puntos: () => mostrarPuntuacionActual(),
  lanzarDado: () => {
    const estado = estadoJuego.obtenerEstado();
    return window.manejadorDado.lanzarDadoParaRonda(estado.rondaActual, 3);
  },
  // NUEVO: Funciones de debug para validación
  activarDebug: () => {
    window.debugValidacion = true;
    console.log('🐛 Debug de validación activado');
  },
  desactivarDebug: () => {
    window.debugValidacion = false;
    console.log('🐛 Debug de validación desactivado');
  },
  probarValidacion: (zonaId, tipoDino) => {
    const jugadorId = 1;
    const estadoJuegoActual = estadoJuego.obtenerEstado();
    const dinosauriosEnZona = estadoJuegoActual.tablero[zonaId] || [];
    const dinosaurio = { tipo: tipoDino, id: `test_${tipoDino}` };

    console.log(`Probando validacion: ${tipoDino} en ${zonaId}`);
    console.log('Estado del juego:', estadoJuegoActual);
    console.log('Dinosaurios en zona:', dinosauriosEnZona);

    // Probar validacion con el nuevo sistema refactorizado
    const validacionCompleta = validadorRestricciones.validarColocacion(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      null,
      jugadorId,
      estadoJuegoActual
    );
    console.log('Validacion completa (refactorizada):', validacionCompleta);

    // Obtener informacion adicional sobre restricciones
    const infoRestricciones = validadorRestricciones.obtenerInfoRestricciones(jugadorId, estadoJuegoActual);
    console.log('Info restricciones:', infoRestricciones);

    return validacionCompleta;
  },
  // NUEVO: Función de prueba rápida para verificar que todo funcione
  probarSistemaCompleto: () => {
    console.log('🧪 Iniciando prueba completa del sistema...');

    // 1. Verificar que todas las clases esten inicializadas
    const componentes = [
      { nombre: 'validadorRestricciones', objeto: validadorRestricciones },
      { nombre: 'validadorZona', objeto: validadorZona },
      { nombre: 'estadoJuego', objeto: estadoJuego },
      { nombre: 'manejadorDado', objeto: window.manejadorDado },
      { nombre: 'validadorDado', objeto: window.validadorDado },
      { nombre: 'sistemaBots', objeto: window.sistemaBots }
    ];

    componentes.forEach(comp => {
      if (comp.objeto) {
        console.log(`✅ ${comp.nombre} inicializado correctamente`);
      } else {
        console.error(`❌ ${comp.nombre} NO inicializado`);
      }
    });

    // 2. Probar validación básica en zona vacía
    console.log('\n🦕 Probando validación básica en Bosque de la Semejanza vacío...');
    const tiposDino = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex', 'velociraptor', 'pteranodon'];

    tiposDino.forEach(tipo => {
      const resultado = window.draftosaurusDebug.probarValidacion('bosque-semejanza', tipo);
      console.log(`${resultado.valido ? '✅' : '❌'} ${tipo}: ${resultado.razon}`);
    });

    // 3. Verificar estado del dado
    console.log('\n🎲 Estado actual del dado:');
    if (window.manejadorDado) {
      const estadoDado = window.manejadorDado.obtenerEstado();
      if (estadoDado && estadoDado.activo) {
        console.log(`✅ Dado activo: ${estadoDado.caraActual} (${window.manejadorDado.reglasDado[estadoDado.caraActual].nombre})`);
        console.log(`👤 Jugador que lanzó: ${estadoDado.jugadorQueLanzo}`);
      } else {
        console.log('❌ Dado no activo');
      }
    }

    // 4. Verificar sistema de bots
    console.log('\n🤖 Estado del sistema de bots:');
    if (window.sistemaBots) {
      const infoBots = window.sistemaBots.obtenerInfoBots();
      console.log(`✅ Bots activos: ${infoBots.activos}`);
      console.log(`⏱️ Tiempo de espera: ${infoBots.tiempoEspera}ms`);
      Object.entries(infoBots.bots).forEach(([id, bot]) => {
        console.log(`🤖 Jugador ${id}: ${bot.nombre} (${bot.activo ? 'Activo' : 'Inactivo'})`);
      });
    } else {
      console.log('❌ Sistema de bots no inicializado');
    }

    console.log('\n🎉 Prueba completa finalizada. Revisa los resultados arriba.');
  },

  // NUEVO: Funciones específicas para debug de restricciones de zona
  restricciones: {
    probarZona: (zonaId, tipoDino) => {
      console.log(`🧪 Probando restricciones en ${zonaId} con ${tipoDino}`);

      const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
      if (!estadoActual) {
        console.error('Estado del juego no disponible');
        return null;
      }

      const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
      const dinosaurio = { tipo: tipoDino, id: `debug_${Date.now()}` };

      console.log(`📊 Estado actual de ${zonaId}:`, dinosauriosEnZona);

      // Probar validación completa
      const validacion = validadorRestricciones.validarColocacion(
        zonaId,
        dinosauriosEnZona,
        dinosaurio,
        null,
        1,
        estadoActual
      );

      console.log(`✅ Resultado de validación:`, validacion);

      // Obtener slots válidos
      const slotsValidos = validadorRestricciones.obtenerSlotsValidos(
        zonaId,
        dinosauriosEnZona,
        dinosaurio,
        1,
        estadoActual
      );

      console.log(`🎯 Slots válidos:`, slotsValidos);

      return {
        validacion,
        slotsValidos,
        estadoZona: dinosauriosEnZona
      };
    },

    probarTodosLosRecintos: () => {
      console.log('🧪 Probando todas las restricciones de recintos...');

      const zonas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 'rey-selva'];
      const tipos = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex'];

      zonas.forEach(zona => {
        console.log(`\n🏞️ === ZONA: ${zona} ===`);
        tipos.forEach(tipo => {
          const resultado = window.draftosaurusDebug.restricciones.probarZona(zona, tipo);
          if (resultado) {
            console.log(`${tipo}: ${resultado.validacion.valido ? '✅' : '❌'} ${resultado.validacion.razon}`);
          }
        });
      });
    },

    verificarSecuencial: (zonaId) => {
      console.log(`🔍 Verificando restricciones secuenciales en ${zonaId}`);

      const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
      if (!estadoActual) return null;

      const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
      const dinosaurio = { tipo: 'triceratops', id: 'test_secuencial' };

      // Probar cada slot del 1 al 6
      for (let slot = 1; slot <= 6; slot++) {
        const slotElement = document.createElement('div');
        slotElement.dataset.slot = slot;

        const validacion = validadorRestricciones.restriccionesPasivas.validarColocacion(
          zonaId,
          dinosauriosEnZona,
          dinosaurio,
          slotElement
        );

        console.log(`Slot ${slot}: ${validacion.valido ? '✅' : '❌'} ${validacion.razon}`);
      }
    }
  },

  // NUEVO: Funciones específicas para debug de bots
  bots: {
    info: () => window.sistemaBots ? window.sistemaBots.obtenerInfoBots() : null,
    forzarTurno: (jugadorId) => {
      if (window.sistemaBots && window.sistemaBots.esBot(jugadorId)) {
        window.sistemaBots.ejecutarTurnoBot(jugadorId);
      } else {
        console.log('Jugador no es un bot o sistema no inicializado');
      }
    },
    activar: (jugadorId) => {
      if (window.sistemaBots) {
        window.sistemaBots.activarBot(jugadorId, true);
        console.log(`🤖 Bot ${jugadorId} activado`);
      }
    },
    desactivar: (jugadorId) => {
      if (window.sistemaBots) {
        window.sistemaBots.activarBot(jugadorId, false);
        console.log(`🤖 Bot ${jugadorId} desactivado`);
      }
    }
  }
}; w.draftosaurusDebug.probarValidacion('bosque-semejanza', tipo);
console.log(`${resultado.valido ? '✅' : '❌'} ${tipo}: ${resultado.razon}`);
    });

// 3. Verificar estado del dado
console.log('\n🎲 Estado actual del dado:');
if (window.manejadorDado) {
  const estadoDado = window.manejadorDado.obtenerEstado();
  if (estadoDado && estadoDado.activo) {
    console.log(`✅ Dado activo: ${estadoDado.caraActual} (${window.manejadorDado.reglasDado[estadoDado.caraActual].nombre})`);
    console.log(`👤 Jugador que lanzó: ${estadoDado.jugadorQueLanzo}`);
  } else {
    console.log('❌ Dado no activo');
  }
}

// 4. Verificar sistema de bots
console.log('\n🤖 Estado del sistema de bots:');
if (window.sistemaBots) {
  const infoBots = window.sistemaBots.obtenerInfoBots();
  console.log(`✅ Bots activos: ${infoBots.activos}`);
  console.log(`⏱️ Tiempo de espera: ${infoBots.tiempoEspera}ms`);
  Object.entries(infoBots.bots).forEach(([id, bot]) => {
    console.log(`🤖 Jugador ${id}: ${bot.nombre} (${bot.activo ? 'Activo' : 'Inactivo'})`);
  });
} else {
  console.log('❌ Sistema de bots no inicializado');
}

console.log('\n🎉 Prueba completa finalizada. Revisa los resultados arriba.');
  },

// NUEVO: Funciones específicas para debug de restricciones de zona
restricciones: {
  probarZona: (zonaId, tipoDino) => {
    console.log(`🧪 Probando restricciones en ${zonaId} con ${tipoDino}`);

    const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
    if (!estadoActual) {
      console.error('Estado del juego no disponible');
      return null;
    }

    const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
    const dinosaurio = { tipo: tipoDino, id: `debug_${Date.now()}` };

    console.log(`📊 Estado actual de ${zonaId}:`, dinosauriosEnZona);

    // Probar validación completa
    const validacion = validadorRestricciones.validarColocacion(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      null,
      1,
      estadoActual
    );

    console.log(`✅ Resultado de validación:`, validacion);

    // Obtener slots válidos
    const slotsValidos = validadorRestricciones.obtenerSlotsValidos(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      1,
      estadoActual
    );

    console.log(`🎯 Slots válidos:`, slotsValidos);

    return {
      validacion,
      slotsValidos,
      estadoZona: dinosauriosEnZona
    };
  },

    probarTodosLosRecintos: () => {
      console.log('🧪 Probando todas las restricciones de recintos...');

      const zonas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 'rey-selva'];
      const tipos = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex'];

      zonas.forEach(zona => {
        console.log(`\n🏞️ === ZONA: ${zona} ===`);
        tipos.forEach(tipo => {
          const resultado = window.draftosaurusDebug.restricciones.probarZona(zona, tipo);
          if (resultado) {
            console.log(`${tipo}: ${resultado.validacion.valido ? '✅' : '❌'} ${resultado.validacion.razon}`);
          }
        });
      });
    },

      verificarSecuencial: (zonaId) => {
        console.log(`🔍 Verificando restricciones secuenciales en ${zonaId}`);

        const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
        if (!estadoActual) return null;

        const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
        const dinosaurio = { tipo: 'triceratops', id: 'test_secuencial' };

        // Probar cada slot del 1 al 6
        for (let slot = 1; slot <= 6; slot++) {
          const slotElement = document.createElement('div');
          slotElement.dataset.slot = slot;

          const validacion = validadorRestricciones.restriccionesPasivas.validarColocacion(
            zonaId,
            dinosauriosEnZona,
            dinosaurio,
            slotElement
          );

          console.log(`Slot ${slot}: ${validacion.valido ? '✅' : '❌'} ${validacion.razon}`);
        }
      }
},

// NUEVO: Funciones específicas para debug de bots
bots: {
  info: () => window.sistemaBots ? window.sistemaBots.obtenerInfoBots() : null,
    forzarTurno: (jugadorId) => {
      if (window.sistemaBots && window.sistemaBots.esBot(jugadorId)) {
        window.sistemaBots.ejecutarTurnoBot(jugadorId);
      } else {
        console.log('Jugador no es un bot o sistema no inicializado');
      }
    },
      activar: (jugadorId) => {
        if (window.sistemaBots) {
          window.sistemaBots.activarBot(jugadorId, true);
          console.log(`🤖 Bot ${jugadorId} activado`);
        }
      },
        desactivar: (jugadorId) => {
          if (window.sistemaBots) {
            window.sistemaBots.activarBot(jugadorId, false);
            console.log(`🤖 Bot ${jugadorId} desactivado`);
          }
        }
}
}; w.draftosaurusDebug.probarValidacion('bosque-semejanza', tipo);
console.log(`${resultado.valido ? '✅' : '❌'} ${tipo}: ${resultado.razon}`);
    });

// 3. Verificar estado del dado
console.log('\n🎲 Estado actual del dado:');
const estadoDado = window.manejadorDado.obtenerEstado();
if (estadoDado && estadoDado.activo) {
  console.log(`✅ Dado activo: ${estadoDado.caraActual} (${window.manejadorDado.reglasDado[estadoDado.caraActual].nombre})`);
  console.log(`👤 Jugador que lanzó: ${estadoDado.jugadorQueLanzo}`);
} else {
  console.log('❌ Dado no activo');
}

// 4. Verificar sistema de bots
console.log('\n🤖 Estado del sistema de bots:');
if (window.sistemaBots) {
  const infoBots = window.sistemaBots.obtenerInfoBots();
  console.log(`✅ Bots activos: ${infoBots.activos}`);
  console.log(`⏱️ Tiempo de espera: ${infoBots.tiempoEspera}ms`);
  Object.entries(infoBots.bots).forEach(([id, bot]) => {
    console.log(`🤖 Jugador ${id}: ${bot.nombre} (${bot.activo ? 'Activo' : 'Inactivo'})`);
  });
} else {
  console.log('❌ Sistema de bots no inicializado');
}

console.log('\n🎉 Prueba completa finalizada. Revisa los resultados arriba.');
  },

// NUEVO: Funciones específicas para debug de restricciones de zona
restricciones: {
  probarZona: (zonaId, tipoDino) => {
    console.log(`🧪 Probando restricciones en ${zonaId} con ${tipoDino}`);

    const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
    if (!estadoActual) {
      console.error('Estado del juego no disponible');
      return null;
    }

    const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
    const dinosaurio = { tipo: tipoDino, id: `debug_${Date.now()}` };

    console.log(`📊 Estado actual de ${zonaId}:`, dinosauriosEnZona);

    // Probar validación completa
    const validacion = validadorRestricciones.validarColocacion(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      null,
      1,
      estadoActual
    );

    console.log(`✅ Resultado de validación:`, validacion);

    // Obtener slots válidos
    const slotsValidos = validadorRestricciones.obtenerSlotsValidos(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      1,
      estadoActual
    );

    console.log(`🎯 Slots válidos:`, slotsValidos);

    return {
      validacion,
      slotsValidos,
      estadoZona: dinosauriosEnZona
    };
  },

    probarTodosLosRecintos: () => {
      console.log('🧪 Probando todas las restricciones de recintos...');

      const zonas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 'rey-selva'];
      const tipos = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex'];

      zonas.forEach(zona => {
        console.log(`\n🏞️ === ZONA: ${zona} ===`);
        tipos.forEach(tipo => {
          const resultado = window.draftosaurusDebug.restricciones.probarZona(zona, tipo);
          console.log(`${tipo}: ${resultado.validacion.valido ? '✅' : '❌'} ${resultado.validacion.razon}`);
        });
      });
    },

      verificarSecuencial: (zonaId) => {
        console.log(`🔍 Verificando restricciones secuenciales en ${zonaId}`);

        const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
        if (!estadoActual) return null;

        const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
        const dinosaurio = { tipo: 'triceratops', id: 'test_secuencial' };

        // Probar cada slot del 1 al 6
        for (let slot = 1; slot <= 6; slot++) {
          const slotElement = document.createElement('div');
          slotElement.dataset.slot = slot;

          const validacion = validadorRestricciones.restriccionesPasivas.validarColocacion(
            zonaId,
            dinosauriosEnZona,
            dinosaurio,
            slotElement
          );

          console.log(`Slot ${slot}: ${validacion.valido ? '✅' : '❌'} ${validacion.razon}`);
        }
      }
},

// NUEVO: Funciones específicas para debug de bots
bots: {
  info: () => window.sistemaBots ? window.sistemaBots.obtenerInfoBots() : null,
    forzarTurno: (jugadorId) => {
      if (window.sistemaBots && window.sistemaBots.esBot(jugadorId)) {
        window.sistemaBots.ejecutarTurnoBot(jugadorId);
      } else {
        console.log('Jugador no es un bot o sistema no inicializado');
      }
    },
      activar: (jugadorId) => {
        if (window.sistemaBots) {
          window.sistemaBots.activarBot(jugadorId, true);
          console.log(`🤖 Bot ${jugadorId} activado`);
        }
      },
        desactivar: (jugadorId) => {
          if (window.sistemaBots) {
            window.sistemaBots.activarBot(jugadorId, false);
            console.log(`🤖 Bot ${jugadorId} desactivado`);
          }
        }
}
};
probarZona: (zonaId, tipoDino) => {
  console.log(`🧪 Probando restricciones en ${zonaId} con ${tipoDino}`);

  const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
  if (!estadoActual) {
    console.error('Estado del juego no disponible');
    return null;
  }

  const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
  const dinosaurio = { tipo: tipoDino, id: `debug_${Date.now()}` };

  console.log(`📊 Estado actual de ${zonaId}:`, dinosauriosEnZona);

  // Probar validación completa
  const validacion = validadorRestricciones.validarColocacion(
    zonaId,
    dinosauriosEnZona,
    dinosaurio,
    null,
    1,
    estadoActual
  );

  console.log(`✅ Resultado de validación:`, validacion);

  // Obtener slots válidos
  const slotsValidos = validadorRestricciones.obtenerSlotsValidos(
    zonaId,
    dinosauriosEnZona,
    dinosaurio,
    1,
    estadoActual
  );

  console.log(`🎯 Slots válidos:`, slotsValidos);

  return {
    validacion,
    slotsValidos,
    estadoZona: dinosauriosEnZona
  };
},

  probarTodosLosRecintos: () => {
    console.log('🧪 Probando todas las restricciones de recintos...');

    const zonas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 'rey-selva'];
    const tipos = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex'];

    zonas.forEach(zona => {
      console.log(`\n🏞️ === ZONA: ${zona} ===`);
      tipos.forEach(tipo => {
        const resultado = window.draftosaurusDebug.restricciones.probarZona(zona, tipo);
        console.log(`${tipo}: ${resultado.validacion.valido ? '✅' : '❌'} ${resultado.validacion.razon}`);
      });
    });
  },

    verificarSecuencial: (zonaId) => {
      console.log(`🔍 Verificando restricciones secuenciales en ${zonaId}`);

      const estadoActual = estadoJuego ? estadoJuego.obtenerEstado() : null;
      if (!estadoActual) return null;

      const dinosauriosEnZona = estadoActual.tablero[zonaId] || [];
      const dinosaurio = { tipo: 'triceratops', id: 'test_secuencial' };

      // Probar cada slot del 1 al 6
      for (let slot = 1; slot <= 6; slot++) {
        const slotElement = document.createElement('div');
        slotElement.dataset.slot = slot;

        const validacion = validadorRestricciones.restriccionesPasivas.validarColocacion(
          zonaId,
          dinosauriosEnZona,
          dinosaurio,
          slotElement
        );

        console.log(`Slot ${slot}: ${validacion.valido ? '✅' : '❌'} ${validacion.razon}`);
      }
    }
},

// NUEVO: Funciones específicas para debug de bots
bots: {
  info: () => window.sistemaBots ? window.sistemaBots.obtenerInfoBots() : null,
    forzarTurno: (jugadorId) => {
      if (window.sistemaBots && window.sistemaBots.esBot(jugadorId)) {
        window.sistemaBots.ejecutarTurnoBot(jugadorId);
      } else {
        console.warn(`Jugador ${jugadorId} no es un bot`);
      }
    },
      configurarTiempo: (ms) => {
        if (window.sistemaBots) {
          window.sistemaBots.configurarTiempoEspera(ms);
        }
      },
        toggle: (jugadorId, activo) => {
          if (window.sistemaBots) {
            window.sistemaBots.toggleBot(jugadorId, activo);
          }
        },
          simularPartida: () => {
            console.log('🤖 Iniciando simulación de partida con bots...');
            // Forzar que sea turno de un bot para probar
            if (window.estadoJuego) {
              const estado = window.estadoJuego.obtenerEstado();
              if (estado.jugadorActual === 1) {
                // Avanzar al turno del bot
                window.avanzarTurno();
              }
            }
          }
},

// NUEVO: Función específica para diagnosticar problema de casilleros
diagnosticarCasilleros: () => {
  console.log('🔍 Diagnosticando problema de casilleros...');

  const estado = estadoJuego.obtenerEstado();
  console.log('Estado actual del juego:', estado);

  // Probar validación en diferentes zonas
  const zonas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 'pradera-amor'];
  const dinosaurio = { tipo: 'triceratops', id: 'test_triceratops' };

  zonas.forEach(zonaId => {
    console.log(`\n🧪 Probando zona: ${zonaId}`);

    const dinosauriosEnZona = estado.tablero[zonaId] || [];
    console.log(`Dinosaurios en zona: ${dinosauriosEnZona.length}`);

    // Probar validación completa
    const validacion = validadorRestricciones.validarColocacion(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      null,
      1,
      estado
    );

    console.log(`Resultado validación: ${validacion.valido ? '✅' : '❌'} - ${validacion.razon}`);

    // Obtener slots válidos
    const slotsValidos = validadorRestricciones.obtenerSlotsValidos(
      zonaId,
      dinosauriosEnZona,
      dinosaurio,
      1,
      estado
    );

    console.log(`Slots válidos: ${slotsValidos.length > 0 ? slotsValidos.join(', ') : 'Ninguno'}`);
  });

  // Verificar estado del dado
  console.log('\n🎲 Estado del dado:');
  if (window.manejadorDado) {
    const estadoDado = window.manejadorDado.obtenerEstado();
    console.log('Estado del dado:', estadoDado);

    if (estadoDado && estadoDado.activo) {
      const infoRestricciones = validadorRestricciones.obtenerInfoRestricciones(1, estado);
      console.log('Info restricciones activas:', infoRestricciones);
    }
  }

  console.log('\n🎯 Diagnóstico completado. Revisa los resultados arriba.');
}
};