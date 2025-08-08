/**
 * Funcionalidad específica para la página del juego digital
 * Maneja la navegación del menú y la lógica completa del juego
 */

// Variables globales del juego
let tableroJuego;
let manejadorSeleccion;
let validadorZona;
let estadoJuego;
let calculadoraPuntuacion;

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
    // Crear instancias de las clases principales
    validadorZona = new ValidadorZona();
    calculadoraPuntuacion = new CalculadoraPuntuacion();
    estadoJuego = new EstadoJuego();
    tableroJuego = new TableroPointClick();
    manejadorSeleccion = new ManejadorSeleccion(tableroJuego);
    
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
  
  mostrarModalPuntuacion(puntuacion1, puntuacion2);
}

/**
 * Muestra un modal con la puntuación detallada
 */
function mostrarModalPuntuacion(puntuacion1, puntuacion2) {
  const modal = document.createElement('div');
  modal.className = 'modal-puntuacion';
  modal.innerHTML = `
    <div class="contenido-modal-puntuacion">
      <h3>📊 Puntuación Actual</h3>
      <div class="comparacion-jugadores">
        <div class="puntuacion-jugador">
          <h4>🎮 Jugador 1</h4>
          <div class="puntos-totales">${puntuacion1.puntuacionTotal} puntos</div>
          <div class="detalles-puntuacion">
            ${generarDetallesPuntuacion(puntuacion1.detallesBase)}
          </div>
        </div>
        <div class="puntuacion-jugador">
          <h4>🎮 Jugador 2</h4>
          <div class="puntos-totales">${puntuacion2.puntuacionTotal} puntos</div>
          <div class="detalles-puntuacion">
            ${generarDetallesPuntuacion(puntuacion2.detallesBase)}
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
    elementoJugador.textContent = estado.jugadorActual;
    elementoJugador.className = `numero-jugador jugador-${estado.jugadorActual}`;
  }
}

/**
 * Muestra mensaje de bienvenida
 */
function mostrarMensajeBienvenida() {
  setTimeout(() => {
    tableroJuego.mostrarMensaje('¡Bienvenido a Draftosaurus! Selecciona un dinosaurio para comenzar.', 'info');
    
    // Activar debug automáticamente para diagnosticar problemas
    if (window.draftosaurusDebug) {
      window.draftosaurusDebug.activarDebug();
      console.log('🎲 Sistema de dados inicializado. Usa window.draftosaurusDebug para debugging.');
    }
  }, 1000);
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
 */
function avanzarTurno() {
  estadoJuego.avanzarTurno();
  actualizarInterfazJugador();
  
  // Verificar si el juego ha terminado
  if (estadoJuego.verificarFinJuego()) {
    mostrarPuntuacionActual();
  }
}

/**
 * Función para validar movimiento (llamada desde TableroPointClick)
 * ACTUALIZADO: Incluye validación del dado
 */
function validarMovimiento(zonaId, dinosaurio, slot, jugadorId, estadoJuego) {
  const estado = estadoJuego || window.estadoJuego.obtenerEstado();
  const dinosauriosEnZona = estado.tablero[zonaId] || [];
  
  return validadorZona.validarColocacion(zonaId, dinosauriosEnZona, dinosaurio, slot, jugadorId, estado);
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
  
  // Avanzar turno automáticamente después de cada movimiento
  setTimeout(() => {
    avanzarTurno();
  }, 1000);
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
  const estadoDado = window.manejadorDado.lanzarDadoParaRonda(1, 2);
  mostrarEstadoDado(estadoDado, 1); // Asumir jugador 1 es humano
  
  // Crear interfaz del dado si no existe
  crearInterfazDado();
  
  // Actualizar el dado virtual en el header
  actualizarDadoVirtual(estadoDado);
  
  console.log('🎲 Primera ronda iniciada con dado');
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
    const estadoDado = window.manejadorDado.lanzarDadoParaRonda(estadoActual.rondaActual, 2);
    
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
    return;
  }
  
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
  
  console.log('🎲 Interfaz del dado creada');
}

/**
 * NUEVO: Muestra el estado actual del dado
 */
function mostrarEstadoDado(estadoDado, jugadorActual) {
  const contenedorDado = document.getElementById('estado-dado');
  
  if (!contenedorDado) {
    console.warn('Contenedor del dado no encontrado');
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
  const estadoDado = window.manejadorDado.lanzarDadoParaRonda(nuevaRonda, 2);
  mostrarEstadoDado(estadoDado, 1);
  
  console.log(`🎲 Avanzado a ronda ${nuevaRonda}`);
}

// Hacer funciones disponibles globalmente para debugging
window.draftosaurusDebug = {
  tablero: () => tableroJuego,
  estado: () => estadoJuego,
  validador: () => validadorZona,
  calculadora: () => calculadoraPuntuacion,
  dado: () => window.manejadorDado,
  validadorDado: () => window.validadorDado,
  reiniciar: () => confirmarReinicio(),
  puntos: () => mostrarPuntuacionActual(),
  lanzarDado: () => {
    const estado = estadoJuego.obtenerEstado();
    return window.manejadorDado.lanzarDadoParaRonda(estado.rondaActual, 2);
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
    
    console.log(`🧪 Probando validación: ${tipoDino} en ${zonaId}`);
    console.log('Estado del juego:', estadoJuegoActual);
    console.log('Dinosaurios en zona:', dinosauriosEnZona);
    
    // Probar validación de recinto
    const validacionRecinto = validadorZona.validarRestriccionRecinto(zonaId, dinosauriosEnZona, dinosaurio, null);
    console.log('Validación recinto:', validacionRecinto);
    
    // Probar validación de dado
    if (window.validadorDado) {
      const validacionDado = window.validadorDado.validarRestriccionDado(zonaId, dinosauriosEnZona, dinosaurio, jugadorId, estadoJuegoActual);
      console.log('Validación dado:', validacionDado);
    }
    
    // Probar validación completa
    const validacionCompleta = validadorZona.validarColocacion(zonaId, dinosauriosEnZona, dinosaurio, null, jugadorId, estadoJuegoActual);
    console.log('Validación completa:', validacionCompleta);
    
    return validacionCompleta;
  },
  // NUEVO: Función de prueba rápida para verificar que todo funcione
  probarSistemaCompleto: () => {
    console.log('🧪 Iniciando prueba completa del sistema...');
    
    // 1. Verificar que todas las clases estén inicializadas
    const componentes = [
      { nombre: 'validadorZona', objeto: validadorZona },
      { nombre: 'estadoJuego', objeto: estadoJuego },
      { nombre: 'manejadorDado', objeto: window.manejadorDado },
      { nombre: 'validadorDado', objeto: window.validadorDado }
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
    const estadoDado = window.manejadorDado.obtenerEstado();
    if (estadoDado && estadoDado.activo) {
      console.log(`✅ Dado activo: ${estadoDado.caraActual} (${window.manejadorDado.reglasDado[estadoDado.caraActual].nombre})`);
      console.log(`👤 Jugador que lanzó: ${estadoDado.jugadorQueLanzo}`);
    } else {
      console.log('❌ Dado no activo');
    }
    
    console.log('\n🎉 Prueba completa finalizada. Revisa los resultados arriba.');
  }
};