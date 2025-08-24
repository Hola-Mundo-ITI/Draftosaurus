/**
 * Funcionalidad específica para la página del juego digital
 * Maneja la navegación del menú y la lógica completa del juego
 */

// Variables globales del juego
let tableroJuego;
let manejadorSeleccion;
let estadoJuego;
let calculadoraPuntuacion;
let sistemaBots; // Mantener para compatibilidad, pero su lógica será en backend

/**
 * Asegura que los elementos críticos del DOM existen antes de inicializar
 */
function asegurarElementosDOM() {
  const elementosNecesarios = [
    'body',
    '.contenedor-tablero'
  ];

  let todosPresentes = true;
  elementosNecesarios.forEach(selector => {
    const el = document.querySelector(selector);
    if (!el) {
      console.error(`Elemento crítico no encontrado: ${selector}`);
      todosPresentes = false;
    }
  });

  return todosPresentes;
}

/**
 * Configura el menú lateral de forma segura (valida existencia)
 */
function configurarMenuLateral() {
  try {
    const boton = document.getElementById('abrirMenu');
    const menu = document.getElementById('menuLateral');
    if (!boton || !menu) {
      // No interrumpir si faltan elementos; mostrar advertencia para debug
      console.warn('configurarMenuLateral: elemento abrirMenu o menuLateral no encontrado');
      return;
    }

    // Evitar duplicar listeners
    if (!boton.dataset.menuConfigured) {
      boton.addEventListener('click', () => {
        menu.classList.toggle('abierto');
      });
      boton.dataset.menuConfigured = 'true';
    }

    // Cerrar menú al hacer clic en cualquier enlace (si existen)
    const enlaces = menu.querySelectorAll('a');
    if (enlaces && enlaces.length) {
      enlaces.forEach(enlace => {
        if (!enlace.dataset.menuLinkConfigured) {
          enlace.addEventListener('click', () => {
            menu.classList.remove('abierto');
          });
          enlace.dataset.menuLinkConfigured = 'true';
        }
      });
    }

  } catch (err) {
    console.error('Error configurando menú lateral:', err);
  }
}

/**
 * Función para asegurar que el DOM esté completamente cargado y luego inicializar
 */
function cuandoDOMListo() {
  // Configurar menú lateral de forma segura
  configurarMenuLateral();

  // Inicializar el sistema de juego de forma robusta
  inicializarJuego();

  // Configurar controles adicionales (la función verifica existencia internamente)
  configurarControlesJuego();

  // Configurar tooltips después de que todo esté cargado
  setTimeout(() => {
    if (window.sistemaTooltips) {
      try {
        sistemaTooltips.configurarTodosLosTooltips && sistemaTooltips.configurarTodosLosTooltips();
        sistemaTooltips.mostrarAyudaTemporal && sistemaTooltips.mostrarAyudaTemporal('¡Bienvenido a Draftosaurus!\\n\\n**Instrucciones:**\\n1. Haz clic en un dinosaurio para seleccionarlo\\n2. Haz clic en un slot válido para colocarlo\\n3. Cada zona tiene reglas específicas\\n\\n*Pasa el mouse sobre las zonas para ver más información*\\n\\n**Herramientas:**\\n• Ctrl+Shift+C: Calibrar posiciones\\n• Ctrl+Shift+Y: Control de tamaño\\n• Ctrl+Alt+Plus/Minus: Cambiar tamaño rápido', 6000);
      } catch (e) {
        console.warn('Error al configurar tooltips:', e);
      }
    }
  }, 1000);
}

// Esperar a que el DOM esté completamente cargado de forma segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      cuandoDOMListo();
    } catch (e) {
      console.error('Error en DOMContentLoaded handler:', e);
    }
  });
} else {
  try {
    cuandoDOMListo();
  } catch (e) {
    console.error('Error al ejecutar cuandoDOMListo:', e);
  }
}

/**
 * Inicializa todos los componentes del juego
 * ACTUALIZADO: Incluye sistema de dados y reintentos si faltan elementos DOM
 */
function inicializarJuego() {
  try {
    console.log('🚀 Iniciando inicialización del juego...');

    // Asegurarse de que los elementos del DOM estén presentes antes de inicializar
    if (!asegurarElementosDOM()) {
      console.warn('Inicialización: elementos críticos del DOM faltan. Reintentando en 500ms...');
      setTimeout(() => {
        if (!asegurarElementosDOM()) {
          console.error('Elementos críticos del DOM no encontrados tras reintento. Abandonando inicialización.');
          mostrarErrorInicializacion();
          return;
        }

        // Si pasamos la verificación en reintento, continuar con inicialización
        inicializarJuego();
      }, 500);
      return;
    }

    // Crear instancias de las clases principales EN ORDEN
    console.log('🎮 Inicializando EstadoJuego...');
    estadoJuego = new EstadoJuego();

    // Hacer estadoJuego disponible globalmente INMEDIATAMENTE
    window.estadoJuego = estadoJuego;
    console.log('✅ EstadoJuego disponible globalmente');

    // Inicializar manejador de selección primero para evitar condiciones de carrera
    console.log('🎨 Inicializando ManejadorSeleccion...');
    manejadorSeleccion = new ManejadorSeleccion();
    // Exponer globalmente para que los controladores de evento lo encuentren
    window.manejadorSeleccion = manejadorSeleccion;

    console.log('🎯 Inicializando TableroPointClick...');
    tableroJuego = new TableroPointClick();

    console.log('🔗 Inyectando tablero en ManejadorSeleccion...');
    if (typeof manejadorSeleccion.setTablero === 'function') {
      manejadorSeleccion.setTablero(tableroJuego);
    } else {
      console.warn('setTablero no disponible en ManejadorSeleccion; inyectando directamente');
      manejadorSeleccion.tablero = tableroJuego;
    }

    // NUEVO: Inicializar sistema de dado
    window.manejadorDado = new ManejadorDado();
    window.validadorDado = new ValidadorDado(window.manejadorDado);

    // Configurar eventos adicionales
    manejadorSeleccion.configurarEventosPreview();

    // NUEVO: Configurar eventos del dado
    configurarEventosDado();

    // NUEVO: Lanzar dado para la primera ronda
    iniciarPrimeraRonda();

    console.log('🎮 Sistema de juego inicializado correctamente');
    mostrarMensajeBienvenida();

    // Ejecutar inicialización de slots tras la inicialización principal
    setTimeout(() => {
      window.slotsInitializer.inicializarSlotsDinamicos();
    }, 200); // pequeño delay para permitir que elementos creados por JS terminen

  } catch (error) {
    console.error('❌ Error al inicializar el juego:', error);
    mostrarErrorInicializacion();
  }
}

/**
 * Configura controles adicionales del juego
 */
function configurarControlesJuego() {
  try {
    const contenedorTablero = document.querySelector('.contenedor-tablero');
    if (!contenedorTablero) {
      console.warn('contenedor-tablero no encontrado, omitiendo controles de juego');
      return;
    }

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

    // Configurar eventos de los botones sólo si existen
    const btnDeshacer = document.getElementById('btn-deshacer');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const btnCalcular = document.getElementById('btn-calcular-puntos');

    if (btnDeshacer) btnDeshacer.addEventListener('click', deshacerMovimiento);
    if (btnReiniciar) btnReiniciar.addEventListener('click', confirmarReinicio);
    if (btnCalcular) btnCalcular.addEventListener('click', mostrarPuntuacionActual);

    // Configurar atajos de teclado
    configurarAtajosTeclado();

  } catch (err) {
    console.error('Error configurando controles de juego:', err);
  }
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
async function mostrarPuntuacionActual() {
  const estado = estadoJuego.obtenerEstado();
  const allPlayerBoards = { // Crear un objeto con todos los tableros de los jugadores
    1: estado.tablero,
    2: estado.tablero,
    3: estado.tablero,
  }; // Esto debería ser un mapeo real de tablero por jugador si el estado lo permite

  let puntuacion1 = { puntuacionTotal: 0, detallesBase: {} };
  let puntuacion2 = { puntuacionTotal: 0, detallesBase: {} };
  let puntuacion3 = { puntuacionTotal: 0, detallesBase: {} };

  try {
    const fetchScore = async (playerId) => {
      const response = await fetch('backend/calcularPuntuacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullBoard: estado.tablero, // Enviar el tablero completo
          playerId: playerId,
          allPlayerBoards: allPlayerBoards // Enviar todos los tableros para Rey de la Selva
        }),
      });
      const result = await response.json();
      if (result.success || result.exito) {
        return { puntuacionTotal: (result.scoreReport && result.scoreReport.totalScore) || 0, detallesBase: (result.scoreReport && result.scoreReport.baseDetails) || {} };
      } else {
        console.error(`Error al obtener puntuación para jugador ${playerId}:`, result.message || result.mensaje);
        return { puntuacionTotal: 0, detallesBase: {} };
      }
    };

    [puntuacion1, puntuacion2, puntuacion3] = await Promise.all([
      fetchScore(1),
      fetchScore(2),
      fetchScore(3)
    ]);

  } catch (error) {
    console.error('Error al calcular puntuaciones con el backend:', error);
    tableroJuego.mostrarMensaje('Error al cargar puntuaciones.', 'error');
    return;
  }

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
      console.log('🤖 Sistema de bots refactorizado al backend.');
    }
  }, 1000);
}

/**
 * NUEVO: Inicia automáticamente la partida con bots
 */
function iniciarPartidaConBotsAutomaticamente() {
  try {
    console.log('🤖 Iniciando partida automática con bots...');

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

    // Si por alguna razón el turno inicial no es del jugador 1, activar el bot correspondiente
    if (estado.jugadorActual !== 1) { // Asumimos que los jugadores 2 y 3 son bots
      setTimeout(() => {
        ejecutarTurnoBotRemoto(estado.jugadorActual);
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
  if (estado.jugadorActual !== 1) { // Asumimos que los jugadores 2 y 3 son bots
    setTimeout(() => {
      ejecutarTurnoBotRemoto(estado.jugadorActual);
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
async function validarMovimiento(zonaId, dinosaurio, slot, jugadorId, estadoJuegoParam) {
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

  // Asegurar que el estado que enviamos tenga las propiedades esperadas por el backend
  const estadoParaEnviar = {
    ...estado,
    tablero: estado.tablero || {},
    dado: estado.dado ?? { activo: false, caraActual: null, jugadorQueLanzo: null, rondaActual: estado.rondaActual }
  };

  // REFACTORIZADO: Usar el nuevo endpoint PHP para la validación
  try {
    const response = await fetch('backend/validarMovimiento.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'validatePlacement',
        zoneId: zonaId,
        dinosaursInZone: dinosauriosEnZona,
        dinosaur: dinosaurio,
        slot: slot,
        playerId: jugadorId,
        gameState: estadoParaEnviar
      })
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error validando movimiento con backend:', err);
    return { valido: false, razon: 'Error de comunicación con el servidor' };
  }
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
    try {
      // Lanzar el dado
      const estadoDado = window.manejadorDado.lanzarDadoParaRonda(estadoActual.rondaActual, 3);

      // Guardar estado del dado en el estado global y persistir
      if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
        try {
          // Asegurar estructura mínima del dado
          const dadoNormalizado = {
            activo: !!(estadoDado && estadoDado.activo),
            caraActual: estadoDado ? estadoDado.caraActual ?? estadoDado.currentFace ?? null : null,
            jugadorQueLanzo: estadoDado ? estadoDado.jugadorQueLanzo ?? estadoDado.playerWhoRolled ?? estadoActual.jugadorActual : estadoActual.jugadorActual,
            rondaActual: estadoDado ? estadoDado.rondaActual ?? estadoActual.rondaActual : estadoActual.rondaActual
          };

          window.estadoJuego.estado.dado = dadoNormalizado;
          window.estadoJuego.guardarEstado();
          console.log('[digitalPage] Estado del dado guardado en estadoJuego:', dadoNormalizado);
        } catch (errGuardar) {
          console.warn('[digitalPage] No se pudo guardar estado del dado en estadoJuego:', errGuardar);
        }
      }

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
      const regla = window.manejadorDado.reglasDado[estadoDado.caraActual] || window.manejadorDado.reglasDado[estadoDado.currentFace];
      const esJugadorQueLanza = (estadoDado.jugadorQueLanzo ?? estadoDado.playerWhoRolled) === 1 || (window.estadoJuego && window.estadoJuego.estado.jugadorActual === 1 && (window.estadoJuego.estado.dado && window.estadoJuego.estado.dado.jugadorQueLanzo === 1));

      if (esJugadorQueLanza) {
        tableroJuego.mostrarMensaje(`🎲 ¡Lanzaste ${regla ? regla.nombre : 'el dado'}! Puedes colocar donde quieras`, 'exito');
      } else {
        tableroJuego.mostrarMensaje(`🎲 ${regla ? regla.nombre : 'Restricción'}: ${regla ? regla.descripcion : ''}`, 'info');
      }

      console.log('🎲 Dado lanzado manualmente:', estadoDado);

    } catch (err) {
      console.error('Error lanzando dado manualmente:', err);
      dadoVirtual.classList.remove('lanzando');
    }

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

/**
 * Función para obtener los dinosaurios disponibles del DOM
 */
function obtenerDinosauriosDisponiblesDOM() {
  const dinosaurs = [];
  document.querySelectorAll('.dinosaurio').forEach((element, index) => {
    if (element.style.display !== 'none') {
      const img = element.querySelector('img');
      const src = img ? img.src : '';
      let type = 'desconocido';
      if (window.mapeoDinosaurios && typeof window.mapeoDinosaurios.obtenerTipoDesdeSrc === 'function') {
        type = window.mapeoDinosaurios.obtenerTipoDesdeSrc(src);
      } else {
        // Fallback simple basado en nombre de archivo si no hay mapeo
        if (src.includes('dino1')) type = 'triceratops';
        else if (src.includes('dino2')) type = 'stegosaurus';
        else if (src.includes('dino3')) type = 'brontosaurus';
        else if (src.includes('dino4')) type = 'trex';
        else if (src.includes('dino5')) type = 'velociraptor';
        else if (src.includes('dino6')) type = 'pteranodon';
      }

      dinosaurs.push({
        id: `dino_${index + 1}`, // Unique ID
        type: type,
        image: src
      });
    }
  });
  return dinosaurs;
}

/**
 * NUEVO: Función para ejecutar el turno de un bot remoto
 */
async function ejecutarTurnoBotRemoto(jugadorId) {
  const tiempoEsperaBot = 2000; // 2 segundos para simular "pensamiento"

  const estadoActual = estadoJuego.obtenerEstado();
  const availableDinosaurs = obtenerDinosauriosDisponiblesDOM();

  // Mostrar mensaje de que el bot está pensando
  tableroJuego.mostrarMensaje(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} está pensando...`, 'info');

  try {
    const response = await fetch('backend/obtenerMovimientoBot.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playerId: jugadorId,
        gameState: estadoActual,
        availableDinosaurs: availableDinosaurs
      }),
    });

    const result = await response.json();

    // Compatibilidad con formatos de respuesta distintos (inglés/español)
    const botMove = result.move ?? result.movimiento ?? result.movimiento ?? result.movimiento ?? null;
    const successFlag = (result.success === true) || (result.exito === true) || (typeof result.success === 'undefined' && typeof result.exito === 'undefined');

    if (botMove) {
      const move = botMove;
      const dinosaur = move.dinosaur ?? move.dinosauro ?? move.dino ?? null;
      const zoneId = move.zoneId ?? move.zone ?? move.zone_id ?? move.zona ?? null;
      const slot = move.slot ?? move.slotId ?? move.casillero ?? null;

      if (!dinosaur || !zoneId || slot == null) {
        console.warn('Respuesta del bot incompleta:', result);
        tableroJuego.mostrarMensaje(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} no pudo jugar. Respuesta incompleta del servidor.`, 'advertencia');
        avanzarTurno();
        return;
      }

      // Simular la animación de selección y colocación en el frontend
      const dinosaurioElemento = document.querySelector(`.dinosaurio img[src="${dinosaur.image}"]`)?.closest('.dinosaurio');
      if (dinosaurioElemento) {
        dinosaurioElemento.classList.add('seleccionado');
      }
      
      const slotElement = document.querySelector(`[data-zona="${zoneId}"] [data-slot="${slot}"]`);

      if (slotElement) {
        setTimeout(async () => {
          const imgDino = document.createElement('img');
          imgDino.src = dinosaur.image;
          imgDino.alt = `Dinosaurio ${dinosaur.type}`;
          imgDino.style.width = '50px';
          imgDino.style.height = '50px';
          imgDino.style.objectFit = 'contain';
          imgDino.style.position = 'absolute';
          imgDino.style.top = '50%';
          imgDino.style.left = '50%';
          imgDino.style.transform = 'translate(-50%, -50%)';
          imgDino.style.zIndex = '10';
          imgDino.style.pointerEvents = 'none';

          slotElement.appendChild(imgDino);
          slotElement.dataset.ocupado = 'true';
          
          if (dinosaurioElemento) {
            dinosaurioElemento.style.display = 'none';
            dinosaurioElemento.classList.remove('seleccionado');
          }
          
          const dinosaurioParaEstado = {
            id: dinosaur.id,
            type: dinosaur.type,
            slot: slot,
            image: dinosaur.image,
            playerPlaced: jugadorId
          };
          estadoJuego.colocarDinosaurio(zoneId, dinosaurioParaEstado, slot);
          
          tableroJuego.mostrarMensaje(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} colocó ${dinosaur.type} en ${zoneId}`, 'exito');
          avanzarTurno();
        }, tiempoEsperaBot);
      } else {
        console.error(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} no pudo encontrar el elemento slot en el DOM.`);
        tableroJuego.mostrarMensaje(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} no pudo jugar. Pasa turno.`, 'advertencia');
        avanzarTurno();
      }

    } else {
      const mensaje = result.message ?? result.mensaje ?? 'El bot no pudo encontrar un movimiento válido.';
      console.warn(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} no pudo obtener un movimiento válido del backend: ${mensaje}`);
      tableroJuego.mostrarMensaje(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} no pudo jugar. Pasa turno.`, 'advertencia');
      avanzarTurno();
    }

  } catch (error) {
    console.error(`❌ Error al ejecutar turno del bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} con el backend:`, error);
    tableroJuego.mostrarMensaje(`❌ Error del bot ${jugadorId === 2 ? 'Alpha' : 'Beta'}. Pasa turno.`, 'error');
    avanzarTurno();
  }
}

// Hacer funciones disponibles globalmente para debugging
window.draftosaurusDebug = {
  tablero: () => tableroJuego,
  estado: () => estadoJuego,
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
  // Removidas las funciones de depuración relacionadas con validación y bots ya que la lógica está en el backend.
};

// NUEVO: Inicializador robusto de casilleros (slots)
class SlotsInitializer {
  constructor(options = {}) {
    this.maxReintentos = options.maxReintentos || 4;
    this.delayBase = options.delayBase || 500; // ms
    this.zonasDefault = options.zonasDefault || {
      'bosque-semejanza': 6,
      'prado-diferencia': 6,
      'trio-frondoso': 3,
      'pradera-amor': 6,
      'isla-solitaria': 1,
      'rey-selva': 1,
      'dinos-rio': 7
    };
    this.reintentos = 0;
    this.observador = null;
    this.debugMode = false;
    this.delegationAttached = false;
  }

  inicializarSlotsDinamicos() {
    this.log('Iniciando inicialización robusta de slots...');
    this.mostrarEstado('Iniciando inicialización de casilleros...', 'info');

    // Primer intento inmediato
    this.intentarInicializar();

    // Configurar un MutationObserver para detectar cambios dinámicos del DOM
    this.setupMutationObserver();
  }

  intentarInicializar() {
    const faltantes = this.verificarContenedoresSlots();

    if (faltantes.length === 0) {
      this.log('Todos los contenedores de slots presentes. Generando slots...');
      this.generarTodosLosSlots();
      this.mostrarEstado('Casilleros generados correctamente', 'exito');
      if (window.tableroJuego && typeof window.tableroJuego.resaltarSlotsDisponibles === 'function') {
        // Actualizar resaltado si existe selección
        window.tableroJuego.resaltarSlotsDisponibles && window.tableroJuego.resaltarSlotsDisponibles();
      }
      // Detener observador ya que se completó la inicialización
      this.disconnectObserver();
      return true;
    }

    // Si faltan contenedores, reintentar con delay progresivo
    this.reintentos++;
    if (this.reintentos > this.maxReintentos) {
      const msg = 'No se pudieron encontrar todos los contenedores de slots tras varios intentos.';
      this.log(msg, 'error');
      this.mostrarEstado(msg + ' Ejecuta diagnóstico o intenta reiniciar manualmente.', 'error');
      return false;
    }

    const delay = this.delayBase * Math.pow(2, this.reintentos - 1);
    this.log(`Contenedores faltantes: ${faltantes.join(', ')} - Reintento ${this.reintentos}/${this.maxReintentos} en ${delay}ms`);
    this.mostrarEstado(`Buscando contenedores... intento ${this.reintentos}/${this.maxReintentos}`, 'advertencia');

    setTimeout(() => {
      this.intentarInicializar();
    }, delay);

    return false;
  }

  setupMutationObserver() {
    if (this.observador) return;

    this.observador = new MutationObserver((mutations) => {
      // Reintentar inicialización si el DOM cambió
      this.log('MutationObserver detectó cambios en el DOM. Intentando inicializar slots...');
      this.intentarInicializar();
    });

    this.observador.observe(document.body, { childList: true, subtree: true });
  }

  disconnectObserver() {
    if (this.observador) {
      try { this.observador.disconnect(); } catch (e) { /* ignore */ }
      this.observador = null;
    }
  }

  verificarContenedoresSlots() {
    const zonasEncontradas = [];
    const zonasFaltantes = [];

    const elementosZona = document.querySelectorAll('.zona-tablero');
    elementosZona.forEach(z => {
      const id = z.dataset.zona;
      if (id) zonasEncontradas.push(id);
    });

    // Revisar todas las zonas que esperamos (usar keys del DOM si están); preferir zonasDefault
    const zonasARevisar = Object.keys(this.zonasDefault);

    zonasARevisar.forEach(zonaId => {
      const contenedor = document.querySelector(`[data-zona="${zonaId}"] .slots-zona`);
      if (!contenedor) {
        zonasFaltantes.push(zonaId);
      }
    });

    if (zonasFaltantes.length > 0) {
      console.warn('SlotsInitializer: Contenedores faltantes detectados:', zonasFaltantes);
    }

    return zonasFaltantes;
  }

  generarTodosLosSlots() {
    const zonas = Object.keys(this.zonasDefault);

    zonas.forEach(zonaId => {
      try {
        const contenedor = document.querySelector(`[data-zona="${zonaId}"] .slots-zona`);
        if (!contenedor) {
          this.log(`Generación: contenedor no encontrado para ${zonaId}`, 'error');
          return;
        }

        // Limpiar y generar usando fragmento para performance
        contenedor.innerHTML = '';
        const fragment = document.createDocumentFragment();

        const slotsCount = this.obtenerSlotsConfigurados(zonaId);
        for (let i = 1; i <= slotsCount; i++) {
          const slot = document.createElement('div');
          slot.className = 'slot';
          slot.dataset.slot = i;
          slot.dataset.zona = zonaId;
          slot.dataset.ocupado = 'false';
          slot.setAttribute('role', 'gridcell');
          slot.setAttribute('aria-label', `Slot ${i} de ${zonaId}`);
          slot.textContent = i;

          fragment.appendChild(slot);
        }

        contenedor.appendChild(fragment);

        // NUEVO: sincronizar con estadoJuego para marcar slots ocupados al cargar
        try {
          const estado = (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') ? window.estadoJuego.obtenerEstado() : null;

          if (estado && estado.tablero && Array.isArray(estado.tablero[zonaId])) {
            estado.tablero[zonaId].forEach(dino => {
              // Asegurar que slot exista y marcarlo ocupado
              const slotElem = contenedor.querySelector(`[data-slot="${dino.slot}"]`);
              if (slotElem) {
                slotElem.dataset.ocupado = 'true';

                // Restaurar imagen del dinosaurio en el slot si no existe ya
                if (!slotElem.querySelector('img') && dino.imagen) {
                  const img = document.createElement('img');
                  img.src = dino.imagen;
                  img.alt = `Dinosaurio ${dino.tipo}`;
                  img.style.width = '100px';
                  img.style.height = '100px';
                  img.style.objectFit = 'contain';
                  img.style.position = 'absolute';
                  img.style.top = '50%';
                  img.style.left = '50%';
                  img.style.transform = 'translate(-50%, -50%)';
                  img.style.zIndex = '10';
                  img.style.pointerEvents = 'none';

                  slotElem.appendChild(img);
                }
              }
            });
          }
        } catch (errEstado) {
          console.warn('SlotsInitializer: no se pudo sincronizar con estadoJuego al cargar:', errEstado);
        }

        this.log(`Generados ${slotsCount} slots para ${zonaId}`);

      } catch (error) {
        console.error('Error generando slots para', zonaId, error);
      }
    });

    // Después de crear los slots, configurar listeners por delegación si no lo están
    this.attachDelegatedListeners();
  }

  obtenerSlotsConfigurados(zonaId) {
    // Intentar sincronizar con estadoJuego si está definido
    try {
      if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
        const estado = window.estadoJuego.obtenerEstado();
        if (estado && estado.tablero && typeof estado.tablero[zonaId] !== 'undefined') {
          // Capacidad: si la zona ya existe en DOM con slots, usar default; si en estado hay array vacío, usar default
          // No podemos conocer capacidad explícita en todas partes, así que preferir mapa por defecto
          return this.zonasDefault[zonaId] || 6;
        }
      }
    } catch (e) {
      // Ignorar y usar default
    }

    return this.zonasDefault[zonaId] || 6;
  }

  attachDelegatedListeners() {
    if (this.delegationAttached) return;

    // Delegación: escuchar clicks en contenedor principal de tablero
    const tableroContenedor = document.querySelector('.tablero-container') || document.body;
    tableroContenedor.addEventListener('click', (e) => {
      const slot = e.target.closest('.slot');
      if (!slot) return;

      // Manejar click en slot creado dinámicamente
      if (slot.dataset.ocupado === 'true') {
        this.mostrarEstado('Este slot ya está ocupado', 'error');
        return;
      }

      // Si existe TableroPointClick, usar su método para intentar colocar
      if (window.tableroJuego && typeof window.tableroJuego.intentarColocarDinosaurio === 'function') {
        try {
          window.tableroJuego.intentarColocarDinosaurio(slot);
        } catch (err) {
          console.error('Error al delegar intento de colocación al tablero:', err);
        }
      } else if (window.tableroManager && typeof window.tableroManager.intentarColocarDinosaurio === 'function') {
        // Compatibilidad con demo local
        window.tableroManager.intentarColocarDinosaurio(slot);
      }
    });

    this.delegationAttached = true;
    this.log('Listeners delegados para slots configurados');
  }

  diagnosticarProblemaSlots() {
    const debug = {
      fecha: new Date().toISOString(),
      zonasDefault: this.zonasDefault,
      reintentos: this.reintentos,
      contenedoresPresentes: [],
      contenedoresFaltantes: []
    };

    Object.keys(this.zonasDefault).forEach(zonaId => {
      const contenedor = document.querySelector(`[data-zona="${zonaId}"] .slots-zona`);
      if (!contenedor) debug.contenedoresFaltantes.push(zonaId);
      else debug.contenedoresPresentes.push({ zonaId, slotsActuales: contenedor.children.length });
    });

    console.group('Diagnóstico de slots');
    console.log(debug);

    // Si existe consola de debug en la UI, mostrarla
    const consolaDebug = document.getElementById('debug-console');
    if (consolaDebug) {
      consolaDebug.textContent = JSON.stringify(debug, null, 2);
    }

    console.groupEnd();
    return debug;
  }

  mostrarEstado(mensaje, tipo = 'info') {
    const estadoElement = document.getElementById('estado');
    if (estadoElement) {
      estadoElement.textContent = mensaje;
      estadoElement.className = tipo;
    } else {
      // Fallback: log en consola
      if (tipo === 'error') console.error(mensaje);
      else if (tipo === 'advertencia') console.warn(mensaje);
      else console.log(mensaje);
    }
  }

  log(mensaje, tipo = 'info') {
    if (!this.debugMode) return;
    const debugConsole = document.getElementById('debug-console');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${timestamp}] ${mensaje}`;
    entry.className = tipo;
    if (debugConsole) {
      debugConsole.appendChild(entry);
      debugConsole.scrollTop = debugConsole.scrollHeight;
    } else {
      console.log(mensaje);
    }
  }

  activarDebug() {
    this.debugMode = true;
    this.log('Debug activado');
  }

  reintentarInicializacionManual() {
    this.reintentos = 0;
    this.mostrarEstado('Reintentando inicialización de casilleros manualmente...', 'info');
    this.intentarInicializar();
  }
}

// Crear instancia global y exponer utilidades
window.slotsInitializer = window.slotsInitializer || new SlotsInitializer();