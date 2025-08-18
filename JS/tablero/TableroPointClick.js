/**
 * Clase principal para manejar el tablero con sistema Point and Click
 * Controla la selección de dinosaurios y su colocación en el tablero
 */
class TableroPointClick {
  constructor() {
    this.dinosaurioSeleccionado = null;
    this.zonas = this.definirZonas();
    this.estadoJuego = {
      turnoActual: 1,
      rondaActual: 1,
      tablero: {}
    };
    
    this.inicializarTablero();
    this.configurarEventos();
  }

  /**
   * Define las zonas del tablero con sus reglas específicas
   */
  definirZonas() {
    return {
      'bosque-semejanza': {
        nombre: 'Bosque de la Semejanza',
        slots: 6,
        regla: 'mismo-tipo',
        descripcion: 'Coloca dinosaurios del mismo tipo',
        dinosaurios: []
      },
      'trio-frondoso': {
        nombre: 'El Trío Frondoso',
        slots: 3,
        regla: 'exactamente-tres',
        descripcion: 'Coloca exactamente 3 dinosaurios',
        dinosaurios: []
      },
      'prado-diferencia': {
        nombre: 'Prado de la Diferencia',
        slots: 6,
        regla: 'todos-diferentes',
        descripcion: 'Todos los dinosaurios deben ser diferentes',
        dinosaurios: []
      },
      'pradera-amor': {
        nombre: 'La Pradera del Amor',
        slots: 6,
        regla: 'parejas',
        descripcion: 'Coloca dinosaurios en parejas',
        dinosaurios: []
      },
      'isla-solitaria': {
        nombre: 'La Isla Solitaria',
        slots: 1,
        regla: 'uno-solo',
        descripcion: 'Solo un dinosaurio permitido',
        dinosaurios: []
      },
      'rey-selva': {
        nombre: 'El Rey de la Selva',
        slots: 1,
        regla: 'mas-grande',
        descripcion: 'El dinosaurio más grande',
        dinosaurios: []
      },
      'dinos-rio': {
        nombre: 'Dinosaurios en el Río',
        slots: 7,
        regla: 'secuencia',
        descripcion: 'Dinosaurios en fila',
        dinosaurios: []
      },

    };
  }

  /**
   * Inicializa el estado del tablero
   */
  inicializarTablero() {
    Object.keys(this.zonas).forEach(zonaId => {
      this.estadoJuego.tablero[zonaId] = [];
    });
  }

  /**
   * Configura todos los eventos de clic
   */
  configurarEventos() {
    // Eventos para dinosaurios
    document.querySelectorAll('.dinosaurio').forEach(dino => {
      dino.addEventListener('click', (e) => this.seleccionarDinosaurio(e.target.closest('.dinosaurio')));
    });

    // Eventos para slots del tablero
    document.querySelectorAll('.slot').forEach(slot => {
      slot.addEventListener('click', (e) => this.intentarColocarDinosaurio(e.target));
    });

    // Eventos para zonas (para mostrar información)
    document.querySelectorAll('.zona-tablero').forEach(zona => {
      zona.addEventListener('mouseenter', (e) => this.mostrarInfoZona(e.target));
      zona.addEventListener('mouseleave', (e) => this.ocultarInfoZona(e.target));
    });
  }

  /**
   * Selecciona un dinosaurio para colocar
   */
  seleccionarDinosaurio(elementoDino) {
    // Usar ManejadorSeleccion si está disponible
    if (window.manejadorSeleccion) {
      manejadorSeleccion.limpiarSeleccionAnterior();
      manejadorSeleccion.seleccionarDinosaurio(elementoDino);
    } else {
      // Fallback al sistema antiguo
      document.querySelectorAll('.dinosaurio').forEach(d => d.classList.remove('seleccionado'));
      document.querySelectorAll('.slot').forEach(s => s.classList.remove('disponible', 'no-disponible'));
      elementoDino.classList.add('seleccionado');
    }

    // Actualizar estado interno
    this.dinosaurioSeleccionado = {
      elemento: elementoDino,
      tipo: this.obtenerTipoDinosaurio(elementoDino),
      imagen: elementoDino.querySelector('img').src
    };

    // Resaltar slots disponibles
    this.resaltarSlotsDisponibles();
    
    console.log('Dinosaurio seleccionado:', this.dinosaurioSeleccionado.tipo);
  }

  /**
   * Obtiene el tipo de dinosaurio basado en la imagen
   */
  obtenerTipoDinosaurio(elementoDino) {
    const img = elementoDino.querySelector('img');
    const src = img.src;
    
    // Extraer tipo del nombre del archivo
    if (src.includes('dino1')) return 'triceratops';
    if (src.includes('dino2')) return 'stegosaurus';
    if (src.includes('dino3')) return 'brontosaurus';
    if (src.includes('dino4')) return 'trex';
    if (src.includes('dino5')) return 'velociraptor';
    if (src.includes('dino6')) return 'pteranodon';
    
    return 'desconocido';
  }

  /**
   * Resalta los slots donde se puede colocar el dinosaurio seleccionado
   */
  resaltarSlotsDisponibles() {
    if (!this.dinosaurioSeleccionado) return;

    // Usar el ManejadorSeleccion si está disponible
    if (window.manejadorSeleccion) {
      manejadorSeleccion.resaltarSlotsDisponibles(this.dinosaurioSeleccionado.elemento);
      return;
    }

    // Fallback al sistema antiguo
    document.querySelectorAll('.slot').forEach(slot => {
      const zona = slot.closest('.zona-tablero');
      const zonaId = zona.dataset.zona;
      
      if (slot.dataset.ocupado === 'false') {
        // Usar el nuevo sistema de validación
        const validacion = window.validadorZona ? 
          validadorZona.validarColocacion(
            zonaId, 
            this.estadoJuego.tablero[zonaId], 
            this.dinosaurioSeleccionado, 
            slot
          ) : { valido: this.puedeColocarEnZona(this.dinosaurioSeleccionado, zonaId) };
        
        if (validacion.valido) {
          slot.classList.add('disponible');
        } else {
          slot.classList.add('no-disponible');
          slot.setAttribute('title', validacion.razon);
        }
      }
    });
  }

  /**
   * Intenta colocar el dinosaurio seleccionado en un slot
   * ACTUALIZADO: Integra información del jugador para validación del dado
   */
  intentarColocarDinosaurio(slot) {
    if (!this.dinosaurioSeleccionado) {
      this.mostrarMensaje('Primero selecciona un dinosaurio', 'advertencia');
      return;
    }

    if (slot.dataset.ocupado === 'true') {
      this.mostrarMensaje('Este slot ya está ocupado', 'error');
      return;
    }

    const zona = slot.closest('.zona-tablero');
    const zonaId = zona.dataset.zona;
    
    // NUEVO: Obtener ID del jugador actual
    const jugadorId = this.obtenerJugadorActual();
    
    // CORREGIDO: Verificar que estadoJuego esté disponible antes de usarlo
    const estadoJuego = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;
    
    // Verificación de seguridad adicional
    if (!estadoJuego) {
      console.warn('Estado del juego no disponible, reintentando inicialización...');
      this.mostrarMensaje('Juego inicializándose, por favor espera...', 'info');
      
      // Reintentar después de un breve delay
      setTimeout(() => {
        if (window.estadoJuego) {
          this.intentarColocarDinosaurio(slot);
        } else {
          this.mostrarMensaje('Error: No se pudo inicializar el juego. Recarga la página.', 'error');
        }
      }, 500);
      return;
    }

    // ACTUALIZADO: Pasar información completa al validador
    const validacion = window.validarMovimiento ? 
      window.validarMovimiento(zonaId, this.dinosaurioSeleccionado, slot, jugadorId, estadoJuego) :
      this.validarColocacionLocal(zonaId, slot, jugadorId, estadoJuego);

    if (!validacion.valido) {
      this.mostrarMensajeEspecifico(validacion, zonaId);
      if (window.manejadorSeleccion) {
        manejadorSeleccion.mostrarFeedbackInvalido(slot, validacion.tipo);
      }
      return;
    }

    this.colocarDinosaurio(slot, zonaId);
  }

  /**
   * Nueva función de validación local con slot
   * ACTUALIZADO: Incluye parámetros para validación del dado
   */
  validarColocacionLocal(zonaId, slot, jugadorId, estadoJuego) {
    const dinosauriosEnZona = this.estadoJuego.tablero[zonaId];
    
    if (window.validadorZona) {
      return validadorZona.validarColocacion(
        zonaId, 
        dinosauriosEnZona, 
        this.dinosaurioSeleccionado, 
        slot,
        jugadorId,
        estadoJuego
      );
    }
    
    // Fallback a validación simple
    return { valido: this.puedeColocarEnZona(this.dinosaurioSeleccionado, zonaId) };
  }

  /**
   * Nuevo método para obtener jugador actual
   */
  obtenerJugadorActual() {
    // Por ahora, asumir jugador 1 (humano)
    // En futuro multijugador, obtener del estado del juego
    if (window.estadoJuego) {
      const estado = window.estadoJuego.obtenerEstado();
      return estado.jugadorActual || 1;
    }
    return 1;
  }

  /**
   * Muestra mensajes específicos según la zona y tipo de error
   */
  mostrarMensajeEspecifico(validacion, zonaId) {
    // Si el mensaje ya tiene emoji, usarlo directamente
    if (validacion.razon.includes('🌲') || validacion.razon.includes('🌾') || 
        validacion.razon.includes('💕') || validacion.razon.includes('🌿') ||
        validacion.razon.includes('🏝️') || validacion.razon.includes('👑') ||
        validacion.razon.includes('🌊') || validacion.razon.includes('🦖')) {
      this.mostrarMensaje(validacion.razon, 'error');
      return;
    }

    // Mensajes personalizados para casos sin emoji
    const mensajesPersonalizados = {
      'bosque-semejanza': {
        'secuencial': '🌲 En el Bosque: coloca de izquierda a derecha sin espacios',
        'especie': '🌲 En el Bosque: solo dinosaurios de la misma especie',
        'default': '🌲 Bosque de la Semejanza: ' + validacion.razon
      },
      'prado-diferencia': {
        'secuencial': '🌾 En el Prado: coloca de izquierda a derecha sin espacios',
        'especie': '🌾 En el Prado: solo especies diferentes',
        'default': '🌾 Prado de la Diferencia: ' + validacion.razon
      },
      'pradera-amor': {
        'default': '💕 Pradera del Amor: ' + validacion.razon
      },
      'trio-frondoso': {
        'default': '🌿 Trío Frondoso: ' + validacion.razon
      },
      'isla-solitaria': {
        'default': '🏝️ Isla Solitaria: ' + validacion.razon
      },
      'rey-selva': {
        'default': '👑 Rey de la Selva: ' + validacion.razon
      },
      'dinos-rio': {
        'secuencial': '🌊 En el Río: coloca de izquierda a derecha sin espacios',
        'default': '🌊 Dinosaurios en el Río: ' + validacion.razon
      },

    };
    
    const tipoError = validacion.razon.includes('slot') ? 'secuencial' : 'default';
    const mensajeZona = mensajesPersonalizados[zonaId];
    const mensaje = mensajeZona?.[tipoError] || mensajeZona?.['default'] || validacion.razon;
    
    this.mostrarMensaje(mensaje, 'error');
  }

  /**
   * Coloca el dinosaurio en el slot especificado
   */
  colocarDinosaurio(slot, zonaId) {
    // Mostrar feedback visual positivo
    if (window.manejadorSeleccion) {
      manejadorSeleccion.mostrarFeedbackValido(slot);
    }

    // Animar colocación si está disponible
    if (window.manejadorSeleccion && manejadorSeleccion.animarColocacionDinosaurio) {
      manejadorSeleccion.animarColocacionDinosaurio(
        this.dinosaurioSeleccionado.elemento,
        slot,
        () => this.completarColocacion(slot, zonaId)
      );
    } else {
      this.completarColocacion(slot, zonaId);
    }
  }

  /**
   * Completa la colocación del dinosaurio
   */
  completarColocacion(slot, zonaId) {
    // Crear imagen del dinosaurio en el slot
    const imgDino = document.createElement('img');
    imgDino.src = this.dinosaurioSeleccionado.imagen;
    imgDino.alt = `Dinosaurio ${this.dinosaurioSeleccionado.tipo}`;
    imgDino.style.width = '50px';
    imgDino.style.height = '50px';
    imgDino.style.objectFit = 'contain';
    imgDino.style.position = 'absolute';
    imgDino.style.top = '50%';
    imgDino.style.left = '50%';
    imgDino.style.transform = 'translate(-50%, -50%)';
    imgDino.style.zIndex = '10';
    imgDino.style.pointerEvents = 'none';
    
    slot.appendChild(imgDino);
    slot.dataset.ocupado = 'true';
    slot.classList.remove('disponible', 'no-disponible');

    // Crear objeto dinosaurio para el estado
    const dinosaurioParaEstado = {
      id: Date.now(), // ID único temporal
      tipo: this.dinosaurioSeleccionado.tipo,
      slot: slot.dataset.slot,
      imagen: this.dinosaurioSeleccionado.imagen,
      jugadorColocado: 1 // Por defecto jugador 1
    };

    // Actualizar estado local PRIMERO
    this.estadoJuego.tablero[zonaId].push(dinosaurioParaEstado);

    // Registrar movimiento en el estado global si está disponible
    if (window.registrarMovimiento) {
      window.registrarMovimiento(zonaId, dinosaurioParaEstado, slot.dataset.slot);
    }

    // Sincronizar con el estado global si existe
    if (window.estadoJuego) {
      window.estadoJuego.colocarDinosaurio(zonaId, dinosaurioParaEstado, slot.dataset.slot);
    }

    // Remover dinosaurio de la zona de selección
    this.dinosaurioSeleccionado.elemento.style.display = 'none';

    // Limpiar selección
    this.limpiarSeleccion();
    
    this.mostrarMensaje(`Dinosaurio colocado en ${this.zonas[zonaId].nombre}`, 'exito');
    
    console.log('Estado actual del tablero:', this.estadoJuego.tablero);
    console.log('Dinosaurio colocado:', dinosaurioParaEstado);
  }

  /**
   * Verifica si se puede colocar un dinosaurio en una zona específica
   */
  puedeColocarEnZona(dinosaurio, zonaId) {
    const zona = this.zonas[zonaId];
    const dinosauriosEnZona = this.estadoJuego.tablero[zonaId];

    // Verificar si la zona está llena
    if (dinosauriosEnZona.length >= zona.slots) {
      return false;
    }

    // Aplicar reglas específicas de cada zona
    switch (zona.regla) {
      case 'mismo-tipo':
        return dinosauriosEnZona.length === 0 || 
               dinosauriosEnZona.every(d => d.tipo === dinosaurio.tipo);
      
      case 'todos-diferentes':
        return !dinosauriosEnZona.some(d => d.tipo === dinosaurio.tipo);
      
      case 'uno-solo':
        return dinosauriosEnZona.length === 0;
      
      case 'mas-grande':
        // Rey de la Selva acepta cualquier dinosaurio (solo límite de 1)
        return dinosauriosEnZona.length === 0;
      
      default:
        return true;
    }
  }

  /**
   * Limpia la selección actual
   */
  limpiarSeleccion() {
    // Usar ManejadorSeleccion si está disponible
    if (window.manejadorSeleccion) {
      manejadorSeleccion.limpiarSeleccionAnterior();
    } else {
      // Fallback al sistema antiguo
      document.querySelectorAll('.dinosaurio').forEach(d => d.classList.remove('seleccionado'));
      document.querySelectorAll('.slot').forEach(s => {
        s.classList.remove('disponible', 'no-disponible', 'seleccionado');
        s.removeAttribute('title');
        s.style.animation = '';
      });
    }
    
    this.dinosaurioSeleccionado = null;
  }

  /**
   * Muestra información de la zona al pasar el mouse
   */
  mostrarInfoZona(zona) {
    const zonaId = zona.dataset.zona;
    const infoZona = this.zonas[zonaId];
    
    // Crear tooltip si no existe
    let tooltip = zona.querySelector('.tooltip-zona');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip-zona';
      tooltip.innerHTML = `
        <strong>${infoZona.nombre}</strong><br>
        ${infoZona.descripcion}<br>
        <small>Slots: ${infoZona.slots}</small>
      `;
      zona.appendChild(tooltip);
    }
    
    tooltip.style.display = 'block';
  }

  /**
   * Oculta información de la zona
   */
  ocultarInfoZona(zona) {
    const tooltip = zona.querySelector('.tooltip-zona');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  /**
   * Muestra mensajes al usuario
   */
  mostrarMensaje(mensaje, tipo = 'info') {
    // Crear o actualizar área de mensajes
    let areaMensajes = document.getElementById('area-mensajes');
    if (!areaMensajes) {
      areaMensajes = document.createElement('div');
      areaMensajes.id = 'area-mensajes';
      areaMensajes.className = 'area-mensajes';
      document.querySelector('.contenedor-tablero').appendChild(areaMensajes);
    }

    areaMensajes.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
    areaMensajes.style.display = 'block';

    // Ocultar después de 3 segundos
    setTimeout(() => {
      areaMensajes.style.display = 'none';
    }, 3000);
  }

  /**
   * Obtiene el estado actual del juego
   */
  obtenerEstadoJuego() {
    return this.estadoJuego;
  }

  /**
   * Reinicia el tablero
   */
  reiniciarTablero() {
    // Limpiar slots
    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.ocupado = 'false';
      slot.classList.remove('disponible', 'seleccionado');
    });

    // Mostrar todos los dinosaurios
    document.querySelectorAll('.dinosaurio').forEach(dino => {
      dino.style.display = 'flex';
      dino.classList.remove('seleccionado');
    });

    // Reiniciar estado
    this.inicializarTablero();
    this.dinosaurioSeleccionado = null;
    
    this.mostrarMensaje('Tablero reiniciado', 'info');
  }
}