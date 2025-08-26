let tableroJuego;
let manejadorSeleccion;
let estadoJuego;
let calculadoraPuntuacion;
let sistemaBots; // Mantener para compatibilidad, pero su lógica será en backend


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


function configurarMenuLateral() {
  try {
    const boton = document.getElementById('abrirMenu');
    const menu = document.getElementById('menuLateral');
    if (!boton || !menu) {

      console.warn('configurarMenuLateral: elemento abrirMenu o menuLateral no encontrado');
      return;
    }

    if (!boton.dataset.menuConfigured) {
      boton.addEventListener('click', () => {
        menu.classList.toggle('abierto');
      });
      boton.dataset.menuConfigured = 'true';
    }

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


function cuandoDOMListo() {

  configurarMenuLateral();

  inicializarJuego();

  configurarControlesJuego();

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


function inicializarJuego() {
  try {
    console.log('🚀 Iniciando inicialización del juego...');

    if (!asegurarElementosDOM()) {
      console.warn('Inicialización: elementos críticos del DOM faltan. Reintentando en 500ms...');
      setTimeout(() => {
        if (!asegurarElementosDOM()) {
          console.error('Elementos críticos del DOM no encontrados tras reintento. Abandonando inicialización.');
          mostrarErrorInicializacion();
          return;
        }

        inicializarJuego();
      }, 500);
      return;
    }

    console.log('🎮 Inicializando EstadoJuego...');
    estadoJuego = new EstadoJuego();

    window.estadoJuego = estadoJuego;
    console.log('✅ EstadoJuego disponible globalmente');

    console.log('🎨 Inicializando ManejadorSeleccion...');
    manejadorSeleccion = new ManejadorSeleccion();

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

    window.manejadorDado = new ManejadorDado();
    window.validadorDado = new ValidadorDado(window.manejadorDado);

    manejadorSeleccion.configurarEventosPreview();

    configurarEventosDado();



    console.log('🎮 Sistema de juego inicializado correctamente');
    mostrarMensajeBienvenida();

    setTimeout(() => {
      window.slotsInitializer.inicializarSlotsDinamicos();
    }, 200); // pequeño delay para permitir que elementos creados por JS terminen

  } catch (error) {
    console.error('❌ Error al inicializar el juego:', error);
    mostrarErrorInicializacion();
  }
}

/**
 * Configura los eventos del dado
 * - Vincula el botón #btn-lanzar-dado y el elemento .dado-virtual
 * - Ambos ejecutan lanzarDadoManual al hacer click
 */
function configurarEventosDado() {
  try {

    if (window._eventosDadoConfigurados) return;

    const btnLanzar = document.getElementById('btn-lanzar-dado');
    const dadoVirtual = document.querySelector('.dado-virtual');

    if (btnLanzar) {
      btnLanzar.addEventListener('click', lanzarDadoManual);
    }

    if (dadoVirtual) {
      dadoVirtual.addEventListener('click', lanzarDadoManual);
    }

    window._eventosDadoConfigurados = true;
    console.log('Eventos del dado configurados');
  } catch (err) {
    console.error('Error en configurarEventosDado:', err);
  }
}


function lanzarDadoManual() {
  try {
    if (!window.manejadorDado || !window.estadoJuego) {
      console.error('No se puede lanzar el dado: manejadorDado o estadoJuego no están disponibles');
      if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
        window.tableroJuego.mostrarMensaje('No se puede lanzar el dado: sistema no inicializado', 'error');
      }
      return null;
    }

    const estado = window.estadoJuego.obtenerEstado();
    if (!estado) {
      console.error('Estado del juego no disponible al intentar lanzar dado');
      if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
        window.tableroJuego.mostrarMensaje('Estado del juego no disponible', 'error');
      }
      return null;
    }

    const ronda = typeof estado.rondaActual === 'number' ? estado.rondaActual : 1;
    const totalJugadores = typeof estado.totalJugadores === 'number' ? estado.totalJugadores : (estado.totalPlayers || 3);

    const resultado = window.manejadorDado.lanzarDadoParaRonda(ronda, totalJugadores);

    const cara = resultado?.caraActual ?? resultado?.cara ?? resultado?.face ?? null;
    const descripcion = resultado?.descripcionRestriccion ?? resultado?.descripcion ?? resultado?.description ?? '';

    try {
      const imgDado = document.getElementById('imagen-dado');
      if (imgDado && cara != null) {
        
        const diceImageMap = {
          'bosque': 'dado/Bosque.png',
          'llanura': 'dado/Llanura.png',
          'banos': 'dado/Baños.png',
          'cafeteria': 'dado/Cafeteria.png',
          'vacio': 'dado/RecintoVacio.png'
        };

        const basePath = 'Recursos/img/';

        const imageName = diceImageMap[cara] || 'dado.png';
        const fullPath = basePath + imageName;

   
        imgDado.alt = `Dado cara ${cara}`;
        imgDado.dataset._fallback = imgDado.dataset._fallback || '';

        if (!imgDado._errorHandlerAsignado) {
          imgDado.addEventListener('error', () => {
            try {
              if (imgDado.dataset._fallback === '') {
                imgDado.dataset._fallback = '1';

                imgDado.src = basePath + 'dado.png';
                imgDado.alt = 'Dado (predeterminado)';
              }
            } catch (e) {
              console.warn('Error manejando fallback de imagen del dado:', e);
            }
          });
          imgDado._errorHandlerAsignado = true;
        }

        imgDado.src = fullPath;
      }
    } catch (errImg) {
      console.warn('No se pudo actualizar la imagen del dado:', errImg);
    }

    try {
      if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
        const texto = descripcion ? `Restricción del dado: ${descripcion}` : 'Dado lanzado';
        window.tableroJuego.mostrarMensaje(texto, 'info');
      } else {
        console.log('Restricción del dado:', descripcion);
      }
    } catch (errMsg) {
      console.warn('Error mostrando mensaje tras lanzar dado:', errMsg);
    }

    return resultado;
  } catch (error) {
    console.error('Error en lanzarDadoManual:', error);
    if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
      window.tableroJuego.mostrarMensaje('Error al lanzar el dado', 'error');
    }
    return null;
  }
}

window.lanzarDadoManual = lanzarDadoManual;


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

    const btnDeshacer = document.getElementById('btn-deshacer');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const btnCalcular = document.getElementById('btn-calcular-puntos');

    if (btnDeshacer) btnDeshacer.addEventListener('click', deshacerMovimiento);
    if (btnReiniciar) btnReiniciar.addEventListener('click', confirmarReinicio);
    if (btnCalcular) btnCalcular.addEventListener('click', mostrarPuntuacionActual);

    configurarAtajosTeclado();

  } catch (err) {
    console.error('Error configurando controles de juego:', err);
  }
}


function configurarAtajosTeclado() {
  document.addEventListener('keydown', (e) => {

    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      deshacerMovimiento();
    }

    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      confirmarReinicio();
    }

    if (e.key === 'Escape') {
      tableroJuego.limpiarSeleccion();
    }

    if (e.key === ' ') {
      e.preventDefault();
      mostrarPuntuacionActual();
    }
  });
}


function deshacerMovimiento() {
  if (estadoJuego.deshacerMovimiento()) {
    tableroJuego.mostrarMensaje('Movimiento deshecho', 'info');
  } else {
    tableroJuego.mostrarMensaje('No hay movimientos para deshacer', 'advertencia');
  }
}


function confirmarReinicio() {
  const confirmacion = confirm('¿Estás seguro de que quieres reiniciar el juego? Se perderá todo el progreso.');

  if (confirmacion) {
    estadoJuego.reiniciarJuego();
    tableroJuego.reiniciarTablero();
    tableroJuego.mostrarMensaje('Juego reiniciado', 'info');
    actualizarInterfazJugador();
  }
}


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

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}


function generarDetallesPuntuacion(detalles) {
  return Object.entries(detalles).map(([zona, info]) => {
    const nombreZona = obtenerNombreZonaLegible(zona);
    return `<div class="detalle-zona">${nombreZona}: ${info.puntos} pts</div>`;
  }).join('');
}


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


function mostrarMensajeBienvenida() {
  setTimeout(() => {
    tableroJuego.mostrarMensaje('🎮 ¡Listo para jugar! Tú vs Bot Alpha vs Bot Beta. Es tu turno, selecciona un dinosaurio.', 'info');

    iniciarPartidaConBotsAutomaticamente();

    if (window.draftosaurusDebug) {
      window.draftosaurusDebug.activarDebug();
      console.log('🎲 Sistema de dados inicializado. Usa window.draftosaurusDebug para debugging.');
      console.log('🤖 Sistema de bots refactorizado al backend.');
    }
  }, 1000);
}


function iniciarPartidaConBotsAutomaticamente() {
  try {
    console.log('🤖 Iniciando partida automática con bots...');

    if (!estadoJuego) {
      console.error('❌ Estado del juego no inicializado');
      return;
    }

    const estado = estadoJuego.obtenerEstado();
    console.log(`🎮 Partida iniciada con ${estado.totalJugadores} jugadores`);
    console.log(`👤 Jugador actual: ${estado.jugadorActual}`);

    actualizarInterfazJugador();
    actualizarInterfazMazo();

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


function avanzarTurno() {
  const estadoAntes = estadoJuego.obtenerEstado();

  estadoJuego.avanzarTurno();
  actualizarInterfazJugador();
  actualizarInterfazMazo();

  const estado = estadoJuego.obtenerEstado();

  console.log(`🎮 Turno avanzado: ${estadoAntes.turnoActual} → ${estado.turnoActual}, Jugador: ${estadoAntes.jugadorActual} → ${estado.jugadorActual}`);


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

  if (estado.jugadorActual !== 1) { // Asumimos que los jugadores 2 y 3 son bots
    setTimeout(() => {
      ejecutarTurnoBotRemoto(estado.jugadorActual);
    }, 2000); // Esperar 2 segundos antes del turno del bot
  }

  mostrarMensajeTurnoActual(estado);
}


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


async function validarMovimiento(zonaId, dinosaurio, slot, jugadorId, estadoJuegoParam) {

  let estado = estadoJuegoParam;

  if (!estado) {
    if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
      estado = window.estadoJuego.obtenerEstado();
    } else if (estadoJuego && typeof estadoJuego.obtenerEstado === 'function') {
      estado = estadoJuego.obtenerEstado();
    }
  }

  // Validaciones robustas del objeto estado
  if (typeof estado !== 'object' || estado === null) {
    console.error('validarMovimiento: estado del juego no es un objeto válido:', estado);
    return { valido: false, razon: 'Estado del juego no válido' };
  }

  // Determinar jugador para la validación (fallback al jugador actual si no se proporcionó)
  const jugadorParaValidar = typeof jugadorId !== 'undefined' && jugadorId !== null ? jugadorId : (estado.jugadorActual || 1);

  // Asegurar que estado.tableros exista y sea un objeto
  if (!estado.tableros || typeof estado.tableros !== 'object') {
    console.error('validarMovimiento: estado.tableros ausente o con tipo inesperado. Se usará un tablero vacío para validación. estado.tableros=', estado.tableros);
    // No modificamos el objeto original en profundidad para mantener compatibilidad con el backend; usamos fallback local
  }

  // Obtener tableroJugador con fallback seguro a objeto vacío
  let tableroJugador = {};
  try {
    if (estado.tableros && typeof estado.tableros === 'object') {
      const posibleTablero = estado.tableros[jugadorParaValidar];
      if (posibleTablero && typeof posibleTablero === 'object') {
        tableroJugador = posibleTablero;
      } else if (typeof posibleTablero === 'undefined') {
        // Intentar con claves string si el estado usa índices como strings
        const keyAsString = String(jugadorParaValidar);
        if (typeof estado.tableros[keyAsString] === 'object') {
          tableroJugador = estado.tableros[keyAsString];
        } else {
          console.warn(`validarMovimiento: tablero para jugador ${jugadorParaValidar} no existe. Usando tablero vacío.`);
        }
      } else {
        console.error(`validarMovimiento: tablero del jugador ${jugadorParaValidar} tiene tipo inesperado:`, typeof posibleTablero);
      }
    }
  } catch (e) {
    console.error('validarMovimiento: error accediendo a estado.tableros:', e);
    tableroJugador = {};
  }

  // Extraer dinosauriosEnZona con fallback a array vacío y validación de tipo
  let dinosauriosEnZona = [];
  try {
    const valorZona = tableroJugador && typeof tableroJugador === 'object' ? tableroJugador[zonaId] : undefined;
    if (Array.isArray(valorZona)) {
      dinosauriosEnZona = valorZona;
    } else if (typeof valorZona === 'undefined' || valorZona === null) {
      dinosauriosEnZona = [];
    } else {
      console.error(`validarMovimiento: datos en tableroJugador[${zonaId}] no son un array. Se ignoran y se usa [] en su lugar. Valor recibido:`, valorZona);
      dinosauriosEnZona = [];
    }
  } catch (e) {
    console.error('validarMovimiento: error obteniendo dinosauriosEnZona:', e);
    dinosauriosEnZona = [];
  }

  // Construir estado a enviar al backend manteniendo compatibilidad (tablero contiene el tablero del jugador)
  const estadoParaEnviar = {
    ...estado,
    tablero: tableroJugador, // compatibilidad con backend que espera estado.tablero
    mazos: estado.mazos || {},
    dado: estado.dado ?? { activo: false, caraActual: null, jugadorQueLanzo: null, rondaActual: estado.rondaActual }
  };

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
        playerId: jugadorParaValidar,
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

window.validarMovimiento = validarMovimiento;
window.registrarMovimiento = registrarMovimiento;
window.avanzarTurno = avanzarTurno;
window.lanzarDadoManual = lanzarDadoManual;


function registrarMovimiento(zonaId, dinosaurio, slotId) {
  try {
    const estado = estadoJuego.obtenerEstado();
    const jugadorActual = estado.jugadorActual || 1;
    // Nueva firma: (jugadorId, zonaId, dinosaurio, slotId)
    estadoJuego.colocarDinosaurio(jugadorActual, zonaId, dinosaurio, slotId);
  } catch (e) {
    // Compatibilidad: intentar con la firma antigua si algo falla
    try { estadoJuego.colocarDinosaurio(zonaId, dinosaurio, slotId); } catch (err) { console.error('Error al registrar movimiento:', err); }
  }

  actualizarInterfazMazo();

  setTimeout(() => {
    avanzarTurno();
  }, 800);
}


function actualizarInterfazMazo() {
  try {
    const estado = estadoJuego.obtenerEstado();
    const jugador = estado.jugadorActual || 1;
    const mazoActual = (estado.mazos && estado.mazos[jugador]) || [];

    const contenedorIzq = document.querySelector('.zona-dinos.izquierda') || document.getElementById('mazo-izquierda');
    const contenedorDer = document.querySelector('.zona-dinos.derecha') || document.getElementById('mazo-derecha');
    const contenedores = [contenedorIzq, contenedorDer].filter(Boolean);

    if (contenedores.length === 0) {
      let contenedorGlobal = document.querySelector('.contenedor-mazo');
      if (!contenedorGlobal) {
        contenedorGlobal = document.createElement('div');
        contenedorGlobal.className = 'contenedor-mazo';
        contenedorGlobal.style.position = 'fixed';
        contenedorGlobal.style.right = '10px';
        contenedorGlobal.style.top = '80px';
        contenedorGlobal.style.zIndex = '9999';
        contenedorGlobal.style.background = 'rgba(255,255,255,0.9)';
        contenedorGlobal.style.padding = '8px';
        contenedorGlobal.style.borderRadius = '6px';
        document.body.appendChild(contenedorGlobal);
      }
      contenedorGlobal.innerHTML = `<strong>Mazo Jugador ${jugador}</strong>`;
      mazoActual.forEach(d => {
        if (d.disponible) {
          const item = document.createElement('div');
          item.className = 'dino-mini';
          item.dataset.dinoId = d.id;
          item.textContent = d.tipo;
          item.style.margin = '4px 0';
          contenedorGlobal.appendChild(item);
        }
      });
      return;
    }

    contenedores.forEach(c => c.innerHTML = '');

    mazoActual.forEach((dino, index) => {
      if (!dino.disponible) return; // solo mostrar disponibles

      const contenedor = index < 3 ? contenedorIzq : contenedorDer;
      if (!contenedor) return;

      const elementoDino = document.createElement('div');
      elementoDino.className = 'dinosaurio';
      elementoDino.draggable = true;
      elementoDino.setAttribute('role', 'button');
      elementoDino.tabIndex = 0;
      elementoDino.setAttribute('aria-label', `Fósil de ${dino.tipo}`);
      elementoDino.dataset.dinoId = dino.id;

      const img = document.createElement('img');
      img.src = dino.imagen;
      img.alt = `Fósil ${dino.tipo}`;
      img.style.width = '64px';
      img.style.height = '64px';
      img.style.objectFit = 'contain';

      elementoDino.appendChild(img);
      contenedor.appendChild(elementoDino);
    });

    if (window.manejadorSeleccion && typeof window.manejadorSeleccion.configurarEventosDinosaurios === 'function') {
      try { window.manejadorSeleccion.configurarEventosDinosaurios(); } catch (e) {  }
    }

  } catch (err) {
    console.warn('Error actualizando interfaz de mazo:', err);
  }
}


async function ejecutarTurnoBotRemoto(jugadorId) {
  const tiempoEsperaBot = 2000; // 2 segundos para simular "pensamiento"

  const estadoActual = estadoJuego.obtenerEstado();

  if (estadoActual.jugadorActual !== jugadorId) {
    console.warn(`Abortando turno del bot ${jugadorId} porque no es su turno actual: ${estadoActual.jugadorActual}`);
    return;
  }

  const mazoBot = (estadoActual.mazos && estadoActual.mazos[jugadorId]) || [];
  const availableDinosaurs = mazoBot.filter(d => d.disponible).map(d => ({ id: d.id, type: d.tipo, image: d.imagen }));

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

    const botMove = result.move ?? result.movimiento ?? result.movimiento ?? result.movimiento ?? null;

    if (botMove) {
      const move = botMove;
      const dinosaur = move.dinosaur ?? move.dino ?? null;
      const zoneId = move.zoneId ?? move.zone ?? move.zona ?? null;
      const slot = move.slot ?? move.slotId ?? move.casillero ?? null;

      if (!dinosaur || !zoneId || slot == null) {
        console.warn('Respuesta del bot incompleta:', result);
        tableroJuego.mostrarMensaje(`🤖 Bot ${jugadorId === 2 ? 'Alpha' : 'Beta'} no pudo jugar. Respuesta incompleta del servidor.`, 'advertencia');
        avanzarTurno();
        return;
      }

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
            tipo: dinosaur.type || dinosaur.tipo,
            slot: slot,
            imagen: dinosaur.image,
            jugadorColocado: jugadorId
          };

          try {
            // Nueva firma: (jugadorId, zonaId, dinosaurio, slot)
            estadoJuego.colocarDinosaurio(jugadorId, zoneId, dinosaurioParaEstado, slot);
          } catch (e) {
            // Compatibilidad fallback
            try { estadoJuego.colocarDinosaurio(zoneId, dinosaurioParaEstado, slot); } catch (err) { console.error('Error al aplicar movimiento del bot en estadoJuego:', err); }
          }

          actualizarInterfazMazo();
          
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

  activarDebug: () => {
    window.debugValidacion = true;
    console.log('🐛 Debug de validación activado');
  },
  desactivarDebug: () => {
    window.debugValidacion = false;
    console.log('🐛 Debug de validación desactivado');
  },

};

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

    this.intentarInicializar();

    this.setupMutationObserver();
  }

  intentarInicializar() {
    const faltantes = this.verificarContenedoresSlots();

    if (faltantes.length === 0) {
      this.log('Todos los contenedores de slots presentes. Generando slots...');
      this.generarTodosLosSlots();
      this.mostrarEstado('Casilleros generados correctamente', 'exito');
      if (window.tableroJuego && typeof window.tableroJuego.resaltarSlotsDisponibles === 'function') {

        window.tableroJuego.resaltarSlotsDisponibles && window.tableroJuego.resaltarSlotsDisponibles();
      }

      this.disconnectObserver();
      return true;
    }

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

      this.log('MutationObserver detectó cambios en el DOM. Intentando inicializar slots...');
      this.intentarInicializar();
    });

    this.observador.observe(document.body, { childList: true, subtree: true });
  }

  disconnectObserver() {
    if (this.observador) {
      try { this.observador.disconnect(); } catch (e) {  }
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

        try {
          const estado = (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') ? window.estadoJuego.obtenerEstado() : null;

          if (estado && estado.tablero && Array.isArray(estado.tablero[zonaId])) {
            estado.tablero[zonaId].forEach(dino => {

              const slotElem = contenedor.querySelector(`[data-slot="${dino.slot}"]`);
              if (slotElem) {
                slotElem.dataset.ocupado = 'true';

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

    this.attachDelegatedListeners();
  }

  obtenerSlotsConfigurados(zonaId) {

    try {
      if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
        const estado = window.estadoJuego.obtenerEstado();
        if (estado && estado.tablero && typeof estado.tablero[zonaId] !== 'undefined') {


          return this.zonasDefault[zonaId] || 6;
        }
      }
    } catch (e) {

    }

    return this.zonasDefault[zonaId] || 6;
  }

  attachDelegatedListeners() {
    if (this.delegationAttached) return;

    const tableroContenedor = document.querySelector('.tablero-container') || document.body;
    tableroContenedor.addEventListener('click', (e) => {
      const slot = e.target.closest('.slot');
      if (!slot) return;

      if (slot.dataset.ocupado === 'true') {
        this.mostrarEstado('Este slot ya está ocupado', 'error');
        return;
      }

      if (window.tableroJuego && typeof window.tableroJuego.intentarColocarDinosaurio === 'function') {
        try {
          window.tableroJuego.intentarColocarDinosaurio(slot);
        } catch (err) {
          console.error('Error al delegar intento de colocación al tablero:', err);
        }
      } else if (window.tableroManager && typeof window.tableroManager.intentarColocarDinosaurio === 'function') {

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

window.slotsInitializer = window.slotsInitializer || new SlotsInitializer();