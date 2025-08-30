let tableroJuego;
let manejadorSeleccion;
let estadoJuego;
let calculadoraPuntuacion;
let sistemaBots; // Mantener para compatibilidad, pero su lógica será en backend

/*
  Clase: SlotsInitializer
  Descripción: Inicializa y gestiona la creación dinámica de casilleros (.slot) en el tablero.
  - Asegura que los casilleros se generen sin texto visible
  - Mantiene atributos data- y aria-label para accesibilidad y funcionalidad
  - Provee diagnóstico y reintentos robustos en caso de que el DOM no esté listo
*/
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

    // Si restoreAllPlayers=true, se sincronizan los casilleros con todos los tableros de jugadores
    this.restorePlayer = (typeof options.restorePlayer !== 'undefined') ? options.restorePlayer : (window.INIT_RESTORE_PLAYER || 1);
    this.restoreAllPlayers = !!options.restoreAllPlayers;
  }

  /*
    Método: sanitizarNodosTextoSlot
    Descripción: Elimina nodos de texto residuales dentro de cada elemento .slot para evitar
    que números o texto accidental sean visibles. Preserva elementos hijos como <img> y mantiene
    aria-label para accesibilidad.
  */
  sanitizarNodosTextoSlot() {
    try {
      const slots = document.querySelectorAll('.slot');
      slots.forEach(slot => {
        [...slot.childNodes].forEach(n => {
          if (n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '') {
            n.remove();
          }
        });
        if (!slot.querySelector('img') && slot.textContent && slot.textContent.trim() !== '') {
          slot.textContent = '';
        }
      });
    } catch (e) {
      console.warn('sanitizarNodosTextoSlot: error limpiando slots', e);
    }
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

          slot.textContent = '';

          fragment.appendChild(slot);
        }

        contenedor.appendChild(fragment);

        this.sanitizarNodosTextoSlot();

        try {
          // Sincronizar con estadoJuego: leer estado.tableros (por jugador)
          const estado = (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') ? window.estadoJuego.obtenerEstado() : null;

          if (estado && estado.tableros) {
            // Si se pide restaurar todos los jugadores, iterar sobre todos
            const playersToInspect = this.restoreAllPlayers ? Object.keys(estado.tableros) : [String(this.restorePlayer || (estado.jugadorActual || 1))];

            playersToInspect.forEach(playerKey => {
              try {
                const tableroJugador = estado.tableros[playerKey] || {};
                const dinosEnZona = tableroJugador[zonaId] || [];

                dinosEnZona.forEach(dino => {
                  const slotElem = contenedor.querySelector(`[data-slot="${dino.slot}"]`);
                  if (slotElem) {
                    slotElem.dataset.ocupado = 'true';

                    if (!slotElem.querySelector('img') && dino.imagen) {
                      const img = document.createElement('img');
                      img.src = dino.imagen;
                      img.alt = `Dinosaurio ${dino.tipo || dino.type || 'desconocido'}`;
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

              } catch (innerErr) {
                console.warn('SlotsInitializer: error sincronizando tablero de jugador', playerKey, innerErr);
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
        // Revisar presencia de la zona dentro de tableros por jugador
        if (estado && estado.tableros) {
          const jugadores = Object.keys(estado.tableros || {});
          for (const p of jugadores) {
            if (estado.tableros[p] && typeof estado.tableros[p][zonaId] !== 'undefined') {
              return this.zonasDefault[zonaId] || 6;
            }
          }
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

// Inicializar inmediatamente la instancia global para evitar errores por orden de carga
window.slotsInitializer = window.slotsInitializer || new SlotsInitializer();

// NUEVO: Quitar cualquier texto accidental dentro de los elementos .slot (nodos de texto)
function quitarTextoCasilleros() {
  try {
    document.querySelectorAll('.slot').forEach(slot => {
      // eliminar únicamente nodos de texto (nodeType === 3), preservar elementos hijos como <img>
      [...slot.childNodes].forEach(n => {
        if (n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== '') {
          n.remove();
        }
      });
      // asegurar que no quede texto residual
      if (slot.textContent && slot.querySelector('img') == null) {
        // si no hay imagen y queda texto (por compatibilidad), vaciar
        slot.textContent = '';
      }
    });
  } catch (e) {
    console.warn('quitarTextoCasilleros: error limpiando slots', e);
  }
}

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

  // Limpiar textos visibles en casilleros estáticos antes de inicializar el juego
  quitarTextoCasilleros();

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
  /*
    inicializarJuego:
    - Inicializa todos los subsistemas del juego en el frontend (EstadoJuego, manejadores, tablero, slots, eventos, etc.).
    - Problema que resuelve: algunos bots no juegan porque el dado no se lanzaba ni se sincronizaba al inicio de la partida, lo que provocaba validaciones que bloqueaban colocaciones.
    - Interacción con otros componentes: lanza el dado automáticamente usando window.manejadorDado, actualiza estadoJuego.estado.dado y guarda el estado (persistencia/localStorage). Además despacha un evento CustomEvent('dadoLanzado') para que la UI y otros listeners (ej. validadores o sistema de bots) se sincronicen.
  */
  try {
    console.log('Iniciando inicialización del juego...');

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

    console.log('Inicializando EstadoJuego...');
    estadoJuego = new EstadoJuego();
    // Resetear el juego para asegurar un inicio fresco
    try { estadoJuego.reiniciarJuego(); console.log('EstadoJuego reiniciado para inicio limpio'); } catch (e) { console.warn('No se pudo reiniciar EstadoJuego tras inicializar:', e); }

    window.estadoJuego = estadoJuego;
    console.log('EstadoJuego disponible globalmente');

    // Inicializar sistema de bots globalmente si no existe
    try {
      window.sistemaBots = window.sistemaBots || new SistemaBots({ bots: window.INIT_BOT_MAP || {}, tiempoEspera: 1200 });
      console.log('[digitalPage] sistemaBots inicializado con', Object.keys(window.sistemaBots.bots || {}).length, 'bots');
    } catch (e) {
      console.error('[digitalPage] No se pudo inicializar sistemaBots:', e);
    }

    console.log('Inicializando ManejadorSeleccion...');
    manejadorSeleccion = new ManejadorSeleccion();

    window.manejadorSeleccion = manejadorSeleccion;

    console.log('Inicializando TableroPointClick...');
    tableroJuego = new TableroPointClick();

    console.log('Inyectando tablero en ManejadorSeleccion...');
    if (typeof manejadorSeleccion.setTablero === 'function') {
      manejadorSeleccion.setTablero(tableroJuego);
    } else {
      console.warn('setTablero no disponible en ManejadorSeleccion; inyectando directamente');
      manejadorSeleccion.tablero = tableroJuego;
    }

    // Inicializar manejadores del dado y validador
    window.manejadorDado = new ManejadorDado();
    window.validadorDado = new ValidadorDado(window.manejadorDado);

    manejadorSeleccion.configurarEventosPreview();

    configurarEventosDado();

    // Asegurarse de lanzar el dado automáticamente al iniciar la partida si aún no está activo
    try {
      const estado = estadoJuego.obtenerEstado();
      const dadoActual = estado && estado.dado ? estado.dado : null;

      // Solo lanzar si no hay un dado activo para evitar sobrescribir estados válidos restaurados
      if (window.manejadorDado && (!dadoActual || !(dadoActual.activo))) {
        try {
          const resultado = window.manejadorDado.lanzarDadoParaRonda(estado.rondaActual || 1, estado.totalJugadores || 3);

          // Normalizar estructura del estado del dado para compatibilidad con backend y validadores
          const estadoDado = {
            activo: resultado?.activo ?? resultado?.active ?? true,
            caraActual: resultado?.caraActual ?? resultado?.cara ?? resultado?.face ?? resultado?.currentFace ?? null,
            jugadorQueLanzo: resultado?.jugadorQueLanzo ?? resultado?.jugador ?? resultado?.playerWhoRolled ?? null,
            rondaActual: resultado?.rondaActual ?? resultado?.ronda ?? (estado.rondaActual || 1),
            descripcionRestriccion: resultado?.descripcionRestriccion ?? resultado?.descripcion ?? resultado?.description ?? ''
          };

          // Guardar en el estado central y persistir
          if (!estadoJuego.estado) estadoJuego.estado = {};
          estadoJuego.estado.dado = estadoDado;
          try { estadoJuego.guardarEstado(); } catch (e) { console.warn('[digitalPage] No se pudo guardar estado tras lanzar dado:', e); }

          console.log('[digitalPage] Dado lanzado automáticamente en inicializarJuego:', estadoDado);

          // Disparar evento para actualizar la UI y notificar subsistemas (bots, validadores, etc.)
          try {
            if (typeof window !== 'undefined') {
              const evento = new CustomEvent('dadoLanzado', { detail: { estado: estadoDado } });
              window.dispatchEvent(evento);
            }
          } catch (evtErr) {
            console.warn('[digitalPage] No se pudo despachar evento dadoLanzado:', evtErr);
          }
        } catch (launchErr) {
          console.warn('[digitalPage] No se pudo lanzar el dado automáticamente:', launchErr);
        }
      }
    } catch (errDadoInit) {
      console.warn('[digitalPage] Error inicializando estado del dado automáticamente:', errDadoInit);
    }

    console.log('Sistema de juego inicializado correctamente');
    mostrarMensajeBienvenida();

    // Inicializar slots dinámicos con verificación robusta y reintentos si es necesario
    const intentarInicializarSlots = (intentosLeft = 3, delayMs = 200) => {
      if (window.slotsInitializer && typeof window.slotsInitializer.inicializarSlotsDinamicos === 'function') {
        try {
          window.slotsInitializer.inicializarSlotsDinamicos();
          return;
        } catch (e) {
          console.warn('Error ejecutando inicializarSlotsDinamicos:', e);
        }
      }

      if (intentosLeft <= 0) {
        console.error('slotsInitializer no disponible tras varios intentos. Mostrar advertencia al usuario.');
        if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
          window.tableroJuego.mostrarMensaje('Advertencia: no se pudieron inicializar los casilleros automáticamente. Recarga la página o intenta reiniciar.', 'advertencia');
        }
        return;
      }

      setTimeout(() => intentarInicializarSlots(intentosLeft - 1, Math.min(2000, delayMs * 2)), delayMs);
    };

    intentarInicializarSlots(4, 200);

  } catch (error) {
    console.error('Error al inicializar el juego:', error);
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
  /*
    mostrarPuntuacionActual:
    - Recupera el estado actual del juego y construye fullBoard combinado.
    - Determina dinámicamente el número total de jugadores usando window.INIT_TOTAL_JUGADORES o el estado del juego.
    - Consulta al backend la puntuación para cada jugador del 1..totalJugadores usando fetch a backend/calcularPuntuacion.php.
    - Muestra la modal de puntuación pasando un array con las puntuaciones en orden de jugador.
  */
  const estado = estadoJuego.obtenerEstado();

  // Normalizar origen de tableros: preferir estado.tableros (estructura por jugador)
  const tablerosPorJugador = estado.tableros || estado.tablero || {};

  // Construir allPlayerBoards como map<string, boardObject> donde cada board tiene zonas -> array de dinos
  const allPlayerBoards = {};
  Object.keys(tablerosPorJugador).forEach(playerKey => {
    const board = tablerosPorJugador[playerKey] || {};
    const normalizedBoard = {};
    Object.keys(board).forEach(zoneId => {
      normalizedBoard[zoneId] = (board[zoneId] || []).map(d => ({
        id: d.id ?? d.ID ?? null,
        type: d.tipo ?? d.type ?? null,
        imagen: d.imagen ?? d.image ?? null,
        slot: d.slot ?? null,
        playerPlaced: d.jugadorColocado ?? d.playerPlaced ?? parseInt(playerKey, 10)
      }));
    });
    allPlayerBoards[String(playerKey)] = normalizedBoard;
  });

  // Asegurar que tenemos la lista de zonas (usar zonasDefault si está disponible)
  const zonasDefault = (window.slotsInitializer && window.slotsInitializer.zonasDefault) || {
    'bosque-semejanza': 6,
    'prado-diferencia': 6,
    'trio-frondoso': 3,
    'pradera-amor': 6,
    'isla-solitaria': 1,
    'rey-selva': 1,
    'dinos-rio': 7
  };

  // Construir fullBoard: para cada zona, agregar todos los dinosaurios de todos los jugadores
  const fullBoard = {};
  Object.keys(zonasDefault).forEach(zoneId => {
    fullBoard[zoneId] = [];
    Object.keys(allPlayerBoards).forEach(playerKey => {
      const arr = (allPlayerBoards[playerKey] && allPlayerBoards[playerKey][zoneId]) || [];
      arr.forEach(d => {
        fullBoard[zoneId].push(Object.assign({}, d, { playerPlaced: d.playerPlaced ?? parseInt(playerKey, 10) }));
      });
    });
  });

  // Determinar total de jugadores dinámicamente
  let totalJugadores = typeof window.INIT_TOTAL_JUGADORES === 'number' ? window.INIT_TOTAL_JUGADORES : null;
  try {
    if (!totalJugadores && window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
      const est = window.estadoJuego.obtenerEstado();
      totalJugadores = est && (est.totalJugadores || est.totalPlayers) ? (est.totalJugadores || est.totalPlayers) : null;
    }
  } catch (e) {
    console.warn('mostrarPuntuacionActual: no se pudo determinar totalJugadores desde estadoJuego', e);
  }
  if (!totalJugadores || typeof totalJugadores !== 'number') totalJugadores = 3;

  // Función para pedir puntuación de un jugador
  const fetchScore = async (playerId) => {
    try {
      const response = await fetch('backend/calcularPuntuacion.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullBoard: fullBoard,
          playerId: playerId,
          allPlayerBoards: allPlayerBoards
        }),
      });
      const result = await response.json();
      if (result.success || result.exito) {
        const report = result.scoreReport || {};
        return { puntuacionTotal: (report.totalScore ?? report.total ?? 0), detallesBase: (report.baseDetails ?? {}) };
      } else {
        console.error(`Error al obtener puntuación para jugador ${playerId}:`, result.message || result.mensaje);
        return { puntuacionTotal: 0, detallesBase: {} };
      }
    } catch (err) {
      console.error(`Error comunicándose con backend para jugador ${playerId}:`, err);
      return { puntuacionTotal: 0, detallesBase: {} };
    }
  };

  try {
    const promises = [];
    for (let p = 1; p <= totalJugadores; p++) {
      promises.push(fetchScore(p));
    }

    const resultados = await Promise.all(promises);

    // Mostrar modal pasando array de puntuaciones en orden
    mostrarModalPuntuacion(resultados);

  } catch (error) {
    console.error('Error al calcular puntuaciones con el backend:', error);
    if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje('Error al cargar puntuaciones.', 'error');
    return;
  }
}


/*
  mostrarModalPuntuacion:
  Muestra una ventana modal con las puntuaciones de todos los jugadores presentes en la partida.
  - Acepta: (puntuacion1, puntuacion2, puntuacion3) como antes o un único argumento que sea un array de puntuaciones.
  - Determina el número de paneles a mostrar usando window.INIT_TOTAL_JUGADORES o el estado del juego.
  - Para el jugador 1 usa la etiqueta "Jugador 1 (Tú)"; para los demás intenta obtener el nombre desde window.INIT_BOT_MAP[index].
  - Genera el HTML de manera dinámica para evitar hardcodear bloques de jugadores y así soportar 2..4 bots (3..5 jugadores totales).
*/
function mostrarModalPuntuacion() {
  // Normalizar argumentos: aceptar un array o múltiples parámetros
  let puntuaciones = [];
  if (arguments.length === 1 && Array.isArray(arguments[0])) {
    puntuaciones = arguments[0];
  } else {
    puntuaciones = Array.from(arguments).filter(x => x !== undefined && x !== null);
  }

  // Determinar total de jugadores: preferir variable global, fallback al estadoJuego
  let totalJugadores = typeof window.INIT_TOTAL_JUGADORES === 'number' ? window.INIT_TOTAL_JUGADORES : null;
  try {
    if (!totalJugadores && window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
      const est = window.estadoJuego.obtenerEstado();
      totalJugadores = est && (est.totalJugadores || est.totalPlayers) ? (est.totalJugadores || est.totalPlayers) : null;
    }
  } catch (e) {
    console.warn('mostrarModalPuntuacion: no se pudo leer estadoJuego para totalJugadores', e);
  }
  if (!totalJugadores || typeof totalJugadores !== 'number') totalJugadores = Math.max(3, puntuaciones.length); // fallback mínimo

  // Asegurar que hay una entrada por cada jugador
  while (puntuaciones.length < totalJugadores) {
    puntuaciones.push({ puntuacionTotal: 0, detallesBase: {} });
  }

  // Construir dinámicamente los bloques de puntuación
  const jugadoresHtml = [];
  for (let idx = 1; idx <= totalJugadores; idx++) {
    const scoreObj = puntuaciones[idx - 1] || { puntuacionTotal: 0, detallesBase: {} };
    let titulo = '';
    if (idx === 1) {
      titulo = 'Jugador 1 (Tú)';
    } else {
      const botInfo = (window.INIT_BOT_MAP && window.INIT_BOT_MAP[idx]) ? window.INIT_BOT_MAP[idx] : null;
      const nombreBot = botInfo ? botInfo.nombre : `Jugador ${idx}`;
      titulo = nombreBot;
    }

    jugadoresHtml.push(`
      <div class="puntuacion-jugador">
        <h4>${titulo}</h4>
        <div class="puntos-totales">${scoreObj.puntuacionTotal ?? 0} puntos</div>
        <div class="detalles-puntuacion">
          ${generarDetallesPuntuacion(scoreObj.detallesBase || {})}
        </div>
      </div>
    `);
  }

  const modal = document.createElement('div');
  modal.className = 'modal-puntuacion';
  modal.innerHTML = `
    <div class="contenido-modal-puntuacion">
      <h3>Puntuación Actual</h3>
      <div class="comparacion-jugadores">
        ${jugadoresHtml.join('\n')}
      </div>
      <div class="acciones-modal">
        <button onclick="this.closest('.modal-puntuacion').remove()" class="boton-cerrar">Cerrar</button>
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

    if (estado.jugadorActual === 1) {
      textoJugador = '1 (Tú)';
    } else {
      const botInfo = (window.INIT_BOT_MAP && window.INIT_BOT_MAP[estado.jugadorActual]) ? window.INIT_BOT_MAP[estado.jugadorActual] : null;
      const nombreBot = botInfo ? botInfo.nombre : `Jugador ${estado.jugadorActual}`;
      textoJugador = `${estado.jugadorActual} (${nombreBot})`;
      claseJugador += ' bot-jugando';
    }

    elementoJugador.textContent = textoJugador;
    elementoJugador.className = claseJugador;
  }
}


function mostrarMensajeBienvenida() {
  setTimeout(() => {
    const botCount = (window.SELECTED_BOTS_COUNT || (window.INIT_TOTAL_JUGADORES ? window.INIT_TOTAL_JUGADORES - 1 : 2));
    const botNames = window.INIT_BOT_MAP ? Object.values(window.INIT_BOT_MAP).map(b => b.nombre).slice(0, botCount) : [];
    const botsTexto = botNames.length ? botNames.join(' vs ') : `Bots (${botCount})`;
    tableroJuego.mostrarMensaje(`Listo para jugar. Tú vs ${botsTexto}. Es tu turno. Selecciona un dinosaurio.`, 'info');

    iniciarPartidaConBotsAutomaticamente();

    if (window.draftosaurusDebug) {
      window.draftosaurusDebug.activarDebug();
      console.log('Sistema de dados inicializado. Usa window.draftosaurusDebug para debugging.');
      console.log('Sistema de bots refactorizado al backend.');
    }
  }, 1000);
}


function iniciarPartidaConBotsAutomaticamente() {
  try {
    console.log('Iniciando partida automática con bots...');

    if (!estadoJuego) {
      console.error('Estado del juego no inicializado');
      return;
    }

    const estado = estadoJuego.obtenerEstado();

    if (typeof window.INIT_TOTAL_JUGADORES === 'number') {
      estado.totalJugadores = window.INIT_TOTAL_JUGADORES;
      if (window.estadoJuego && window.estadoJuego.estado) window.estadoJuego.estado.totalJugadores = window.INIT_TOTAL_JUGADORES;
    }

    console.log(`Partida iniciada con ${estado.totalJugadores} jugadores`);
    console.log(`Jugador actual: ${estado.jugadorActual}`);

    actualizarInterfazJugador();
    actualizarInterfazMazo();

    const botPlayers = Object.keys(window.INIT_BOT_MAP || {}).map(Number);
    if (botPlayers.includes(estado.jugadorActual)) {
      setTimeout(() => {
        ejecutarTurnoBotRemoto(estado.jugadorActual);
      }, 2000);
    }

    console.log('Partida con bots iniciada correctamente');

  } catch (error) {
    console.error('Error al iniciar partida con bots:', error);
    if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') {
      tableroJuego.mostrarMensaje('Error al iniciar partida con bots. Recarga la página.', 'error');
    }
  }
}


/**
 * avanzarTurno:
 * - Encapsula el avance de turno en la interfaz y en el estado.
 * - Se asegura de reiniciar la bandera haColocadoEnEsteTurno al pasar de turno
 *   para que el siguiente jugador pueda colocar sin restricciones heredadas.
 * - Actualiza la interfaz, comprueba fin de partida y despacha el turno a bots si procede.
 */
function avanzarTurno() {
  try {
    console.log('[digitalPage] avanzarTurno invocado');

    if (!window.estadoJuego) {
      console.error('[digitalPage] avanzarTurno: estadoJuego no disponible');
      return;
    }

    const estadoAntes = estadoJuego.obtenerEstado();
    console.log('[digitalPage] Estado antes de avanzarTurno:', estadoAntes);

    // Llamar a la función central que avanza el turno en el estado
    try { estadoJuego.avanzarTurno(); } catch (e) { console.error('[digitalPage] Error interno en estadoJuego.avanzarTurno:', e); }

    // Actualizar interfaz de jugador y mazo inmediatamente
    try { actualizarInterfazJugador(); } catch (e) { console.warn('[digitalPage] Error actualizando interfaz jugador tras avanzarTurno:', e); }
    try { actualizarInterfazMazo(); } catch (e) { console.warn('[digitalPage] Error actualizando interfaz mazo tras avanzarTurno:', e); }

    // Obtener el nuevo estado y determinar si el siguiente jugador es un bot
    const nuevoEstado = estadoJuego.obtenerEstado();
    const jugadorActual = nuevoEstado ? nuevoEstado.jugadorActual : null;

    console.log('[digitalPage] Nuevo estado tras avanzarTurno:', nuevoEstado);

    // Determinar si es turno de bot mediante sistemaBots si está disponible
    let esBotTurno = false;
    try {
      if (window.sistemaBots && typeof window.sistemaBots.esBot === 'function') {
        esBotTurno = !!window.sistemaBots.esBot(jugadorActual);
      } else if (window.INIT_BOT_MAP) {
        esBotTurno = !!(window.INIT_BOT_MAP[jugadorActual] || window.INIT_BOT_MAP[String(jugadorActual)]);
      }
    } catch (e) {
      console.error('[digitalPage] Error determinando si es bot:', e);
      esBotTurno = false;
    }

    console.log(`[digitalPage] jugadorActual=${jugadorActual}, esBotTurno=${esBotTurno}`);

    if (esBotTurno && jugadorActual != null) {
      // Delay para simular tiempo de pensamiento del bot y permitir que la UI actualice
      setTimeout(() => {
        try {
          console.log(`[digitalPage] Iniciando ejecución del bot ${jugadorActual}`);
          if (window.sistemaBots && typeof window.sistemaBots.ejecutarTurnoBot === 'function') {
            window.sistemaBots.ejecutarTurnoBot(jugadorActual);
          } else {
            ejecutarTurnoBotRemoto(jugadorActual);
          }
        } catch (err) {
          console.error('[digitalPage] Error iniciando turno de bot tras avanzarTurno:', err);
          // Asegurar que el juego no se quede bloqueado: avanzar el turno como fallback
          try { avanzarTurno(); } catch (e2) { console.error('[digitalPage] Error avanzando turno en fallback:', e2); }
        }
      }, 1500);
    }

  } catch (err) {
    console.error('[digitalPage] Excepción en avanzarTurno:', err);
  }
}


async function ejecutarTurnoBotRemoto(jugadorId) {
  /*
    Ejecuta el turno remoto del bot: valida turno, construye payload y delega
    la petición al backend. Maneja errores y en caso de fallo avanza el turno.
  */

  // Validaciones iniciales y obtención del estado
  const estadoActual = estadoJuego.obtenerEstado();
  if (!estadoActual) {
    console.warn(`[ejecutarTurnoBotRemoto] Estado no disponible para bot ${jugadorId}`);
    return;
  }

  // Validar que sea el turno del bot antes de proceder
  if (estadoActual.jugadorActual !== jugadorId) {
    console.warn(`Intento de ejecutar turno de bot ${jugadorId} fuera de su turno (actual: ${estadoActual.jugadorActual})`);
    return;
  }

  const mazoBot = (estadoActual.mazos && estadoActual.mazos[jugadorId]) || [];
  const availableDinosaurs = mazoBot.filter(d => d.disponible).map(d => ({ id: d.id ?? d.ID ?? null, type: d.tipo ?? d.type ?? null, image: d.imagen ?? d.image ?? null }));

  if (!availableDinosaurs || availableDinosaurs.length === 0) {
    if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${jugadorId} no tiene dinosaurios. Pasa turno.`, 'advertencia');
    avanzarTurno();
    return;
  }

  const botInfo = (window.INIT_BOT_MAP && window.INIT_BOT_MAP[jugadorId]) ? window.INIT_BOT_MAP[jugadorId] : { nombre: `Bot ${jugadorId}` };
  const botNombre = botInfo.nombre || `Bot ${jugadorId}`;

  if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} está pensando...`, 'info');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const payload = {
      playerId: jugadorId,
      gameState: estadoActual,
      availableDinosaurs: availableDinosaurs,
      totalPlayers: window.INIT_TOTAL_JUGADORES
    };

    const response = await fetch('backend/obtenerMovimientoBot.php', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const texto = await response.text().catch(() => '');
      console.error(`Backend devolvió estado ${response.status} para movimiento del bot:`, texto);
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} no pudo obtener movimiento (error servidor). Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    let result = null;

    if (!contentType.includes('application/json')) {
      const texto = await response.text().catch(() => '');
      console.error('Respuesta no JSON del backend para movimiento del bot:', texto.slice(0, 500));
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} retornó respuesta no válida. Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    try {
      result = await response.json();
    } catch (parseErr) {
      const texto = await response.text().catch(() => '');
      console.error('Respuesta JSON inválida del backend para movimiento del bot:', parseErr, texto.slice(0, 500));
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} retornó respuesta inválida. Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    if (!result || typeof result !== 'object') {
      console.error('JSON de respuesta inválido o vacío', result);
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} retornó respuesta vacía. Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    if (!result.success) {
      const mensaje = result.error || result.mensaje || result.message || 'El bot no pudo generar un movimiento';
      console.warn(`Backend devolvió success=false para bot ${botNombre}: ${mensaje}`);
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre}: ${mensaje}. Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    const botMove = result.move ?? result.movimiento ?? result.move ?? null;

    if (!botMove) {
      const mensaje = result.message ?? result.mensaje ?? 'El bot no pudo encontrar un movimiento válido.';
      console.warn(`Bot ${botNombre} no pudo obtener un movimiento válido del backend: ${mensaje}`);
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} no pudo jugar. Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    const dinosaur = botMove.dinosaur ?? botMove.dino ?? null;
    const zoneId = botMove.zoneId ?? botMove.zone ?? botMove.zona ?? null;
    const slot = botMove.slot ?? botMove.slotId ?? botMove.casillero ?? null;

    if (!dinosaur || !zoneId || slot == null) {
      console.warn('Respuesta del bot incompleta:', result);
      if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} retornó movimiento incompleto. Pasa turno.`, 'advertencia');
      avanzarTurno();
      return;
    }

    // Esperar un poco para animación y aplicar movimiento en estado
    setTimeout(async () => {
      try {
        // Aplicar el movimiento únicamente sobre el estado virtual del bot.
        const dinosaurioParaEstado = {
          id: dinosaur.id,
          tipo: dinosaur.type || dinosaur.tipo,
          slot: slot,
          imagen: dinosaur.image || dinosaur.imagen,
          jugadorColocado: jugadorId
        };

       // prevenir colocaciones en slots ya ocupados en el tablero del bot
        try {
          const estadoAntes = (estadoJuego && typeof estadoJuego.obtenerEstado === 'function') ? estadoJuego.obtenerEstado() : null;
          let tableroJugador = null;
          if (estadoAntes && estadoAntes.tableros) {
            tableroJugador = estadoAntes.tableros[jugadorId] || estadoAntes.tableros[String(jugadorId)] || null;
          }

          const dinosEnZona = (tableroJugador && tableroJugador[zoneId]) ? tableroJugador[zoneId] : [];
          if (dinosEnZona.some(d => Number(d.slot) === Number(slot))) {
            // Slot ya ocupado en el tablero virtual del bot
            console.error(`Slot ${zoneId}#${slot} ya ocupado en tablero virtual del bot ${botNombre}`);
            if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} intentó un slot ya ocupado. Pasa turno.`, 'advertencia');
            avanzarTurno();
            return;
          }

          // Aplicar la colocación en el estado (solo cambia el tablero del bot internamente)
          try {
            estadoJuego.colocarDinosaurio(jugadorId, zoneId, dinosaurioParaEstado, slot);
          } catch (e) {
            console.error('Error al aplicar movimiento del bot en estadoJuego:', e);
            if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Error al aplicar movimiento del bot ${botNombre}. Pasa turno.`, 'error');
            avanzarTurno();
            return;
          }

          // Actualizar solo las vistas que dependen del estado del jugador humano.
          try {
            if (window.estadoJuego && typeof window.estadoJuego.actualizarInterfazCompleta === 'function') {
              // actualizarInterfazCompleta actualiza la vista del jugador 1 (UI) sin exponer los tableros de bots
              window.estadoJuego.actualizarInterfazCompleta();
            }
          } catch (e) { /* no crítico */ }

          // Actualizar mazo y notificar breve mensaje
          try { actualizarInterfazMazo(); } catch (e) { /* no crítico */ }
          if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Bot ${botNombre} colocó ${dinosaur.type || dinosaur.tipo} en ${zoneId}`, 'exito');

        } catch (errApply) {
          console.error('Error aplicando movimiento del bot en estado:', errApply);
          if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Error aplicando movimiento del bot ${botNombre}. Pasa turno.`, 'error');
          avanzarTurno();
          return;
        }

      } catch (errApply) {
        console.error('Error aplicando movimiento del bot en DOM/estado:', errApply);
        if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Error aplicando movimiento del bot ${botNombre}. Pasa turno.`, 'error');
      } finally {
        avanzarTurno();
      }
    }, 600);

  } catch (error) {
    console.error(`Error al ejecutar turno del bot ${jugadorId} con el backend:`, error);
    if (tableroJuego && typeof tableroJuego.mostrarMensaje === 'function') tableroJuego.mostrarMensaje(`Error del bot ${botNombre}. Pasa turno.`, 'error');
    avanzarTurno();
  }
}

window.validarMovimiento = validarMovimiento;
window.registrarMovimiento = registrarMovimiento;
window.avanzarTurno = avanzarTurno;
window.lanzarDadoManual = lanzarDadoManual;


/**
 * registrarMovimiento:
 * - Registra la intención del jugador de colocar un dinosaurio en una zona/slot.
 * - Verifica que el jugador no haya colocado ya un dinosaurio en este turno
 *   usando la bandera haColocadoEnEsteTurno del estado global. Si ya colocó,
 *   muestra un mensaje de error en la UI y no ejecuta la acción.
 * - Llama a estadoJuego.colocarDinosaurio con la firma actualizada y actualiza
 *   la interfaz del mazo; avanza el turno tras un breve retardo si la colocación
 *   fue exitosa.
 */
function registrarMovimiento(zonaId, dinosaurio, slotId) {
  try {
    // Intentar leer la bandera directamente del objeto estado para evitar 
    // inconsistencias por copias retornadas por obtenerEstado()
    const estadoObj = (window.estadoJuego && window.estadoJuego.estado) ? window.estadoJuego.estado : (estadoJuego ? estadoJuego.obtenerEstado() : null);
    const haColocado = estadoObj ? (estadoObj.haColocadoEnEsteTurno ?? false) : false;

    if (haColocado) {
      if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
        window.tableroJuego.mostrarMensaje('Ya colocaste un dinosaurio este turno', 'error');
      } else {
        console.warn('Ya colocaste un dinosaurio este turno');
      }
      return;
    }

    const estado = estadoJuego.obtenerEstado();
    const jugadorActual = estado.jugadorActual || 1;
    // Nueva firma: (jugadorId, zonaId, dinosaurio, slotId)
    const colocado = estadoJuego.colocarDinosaurio(jugadorActual, zonaId, dinosaurio, slotId);

    if (!colocado) {
      // colocarDinosaurio ya debería mostrar mensajes en caso de falla.
      return;
    }

  } catch (e) {
    // Compatibilidad: intentar con la firma antigua si algo falla
    try { estadoJuego.colocarDinosaurio(zonaId, dinosaurio, slotId); } catch (err) { console.error('Error al registrar movimiento:', err); }
  }

  actualizarInterfazMazo();

  setTimeout(() => {
    avanzarTurno();
  }, 800);
}


/**
 * Actualiza visualmente la interfaz del mazo de dinosaurios disponibles
 * para el jugador actual. Crea contenedores globales si no existen los
 * contenedores laterales predeterminados, filtra los dinosaurios disponibles
 * y configura los eventos de selección para cada elemento de dinosaurio.
 * 
 * @throws {Error} Si no se puede acceder al estado del juego o elementos DOM
 */
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

      // Corregido: usar 'dino' como nombre de parámetro consistente
      mazoActual.forEach(dino => {
        if (dino.disponible) {
          const item = document.createElement('div');
          item.className = 'dino-mini';
          item.dataset.dinoId = dino.id;
          item.textContent = dino.tipo;
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
    console.log('Debug de validación activado');
  },
  desactivarDebug: () => {
    window.debugValidacion = false;
    console.log('Debug de validación desactivado');
  },

};