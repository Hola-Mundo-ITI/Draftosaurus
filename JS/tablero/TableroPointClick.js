/*
 * TableroPointClick.js:
 * Módulo responsable de gestionar la interacción por clic en el tablero.
 * Traduce eventos de puntero a intentos de colocación, muestra ayudas de
 * interfaz y delega la validación al validador del backend cuando procede.
 * Comentarios en español en tercera persona; la implementación no cambia.
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

  
  inicializarTablero() {
    Object.keys(this.zonas).forEach(zonaId => {
      this.estadoJuego.tablero[zonaId] = [];
    });
  }

  
  configurarEventos() {

    if (this.eventosConfigurados) return;

    try {

      document.addEventListener('click', (e) => {
        try {
          const dinosaurio = e.target.closest && e.target.closest('.dinosaurio');
          if (dinosaurio) {
            this.seleccionarDinosaurio(dinosaurio);
            return;
          }

          const slot = e.target.closest && e.target.closest('.slot');
          if (slot) {
            this.intentarColocarDinosaurio(slot);
            return;
          }
        } catch (err) {
          console.error('Error en handler delegado de click:', err);
        }
      });

      const zonas = document.querySelectorAll('.zona-tablero');
      if (zonas && zonas.length) {
        zonas.forEach(zona => {
          try {
            zona.addEventListener('mouseenter', (e) => this.mostrarInfoZona(e.currentTarget || e.target));
            zona.addEventListener('mouseleave', (e) => this.ocultarInfoZona(e.currentTarget || e.target));
          } catch (e) {
            console.warn('No se pudieron asignar eventos a zona:', e);
          }
        });
      } else {
        console.warn('configurarEventos: no se encontraron elementos .zona-tablero');
      }

      this.eventosConfigurados = true;
    } catch (err) {
      console.error('Error configurando eventos del tablero:', err);
    }
  }

  
  seleccionarDinosaurio(elementoDino) {

    if (window.manejadorSeleccion) {
      try {
        manejadorSeleccion.limpiarSeleccionAnterior();
        manejadorSeleccion.seleccionarDinosaurio(elementoDino);
      } catch (e) {
        console.warn('Error invoking manejadorSeleccion methods', e);
      }
    } else {

      document.querySelectorAll('.dinosaurio').forEach(d => d.classList.remove('seleccionado'));
      document.querySelectorAll('.slot').forEach(s => s.classList.remove('disponible', 'no-disponible'));
      elementoDino.classList.add('seleccionado');
    }

    let tipoDetectado = null;
    let imagenSrc = null;
    try {
      const img = elementoDino.querySelector && elementoDino.querySelector('img');
      imagenSrc = img ? img.src : null;

      if (window.mapeoDinosaurios && typeof window.mapeoDinosaurios.obtenerTipoDesdeSrc === 'function' && imagenSrc) {
        tipoDetectado = window.mapeoDinosaurios.obtenerTipoDesdeSrc(imagenSrc);
      } else {
        tipoDetectado = this.obtenerTipoDinosaurio(elementoDino);
      }
    } catch (e) {
      console.warn('Error determinando tipo de dinosaurio, usando fallback', e);
      tipoDetectado = this.obtenerTipoDinosaurio(elementoDino);
    }

    this.dinosaurioSeleccionado = {
      elemento: elementoDino,
      tipo: tipoDetectado,
      imagen: imagenSrc || (elementoDino.querySelector('img') ? elementoDino.querySelector('img').src : '')
    };

    this.resaltarSlotsDisponibles();

    if (window.debugValidacion) console.log('Dinosaurio seleccionado:', this.dinosaurioSeleccionado.tipo);
  }

  
  obtenerTipoDinosaurio(elementoDino) {

    try {
      const img = elementoDino.querySelector('img');
      const src = img ? img.src : '';
      if (window.mapeoDinosaurios && typeof window.mapeoDinosaurios.obtenerTipoDesdeSrc === 'function' && src) {
        return window.mapeoDinosaurios.obtenerTipoDesdeSrc(src);
      }

      if (src.includes('dino1')) return 'triceratops';
      if (src.includes('dino2')) return 'stegosaurus';
      if (src.includes('dino3')) return 'brontosaurus';
      if (src.includes('dino4')) return 'trex';
      if (src.includes('dino5')) return 'velociraptor';
      if (src.includes('dino6')) return 'pteranodon';
    } catch (e) {
      console.warn('obtenerTipoDinosaurio fallback error', e);
    }

    return 'desconocido';
  }

  
  async resaltarSlotsDisponibles() {
    if (!this.dinosaurioSeleccionado) return;

    document.querySelectorAll('.slot').forEach(s => {
      s.classList.remove('disponible', 'no-disponible');
      s.removeAttribute('title');
    });

    const estado = (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') ? window.estadoJuego.obtenerEstado() : this.estadoJuego;
    const jugadorId = (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') ? estado.jugadorActual : 1;

    if (window.validadorDado && typeof window.validadorDado.getValidSlots === 'function') {
      try {

        const zonasDOM = document.querySelectorAll('.zona-tablero');
        for (const zonaElem of Array.from(zonasDOM)) {
          const zonaId = zonaElem.dataset.zona;
          const dinosauriosEnZona = (estado && estado.tablero && estado.tablero[zonaId]) ? estado.tablero[zonaId] : [];

          const result = await window.validadorDado.getValidSlots(zonaId, dinosauriosEnZona, this.dinosaurioSeleccionado, jugadorId, estado);

          const validSlots = (result && (result.validSlots || result.slotsValidos)) ? (result.validSlots || result.slotsValidos) : [];

          zonaElem.querySelectorAll('.slot').forEach(slot => {
            const slotIndex = parseInt(slot.dataset.slot);
            if (slot.dataset.ocupado === 'false') {
              if (validSlots.includes(slotIndex)) {
                slot.classList.add('disponible');
                slot.setAttribute('title', 'Colocación válida');
              } else {
                slot.classList.add('no-disponible');
                slot.setAttribute('title', result.razon || 'No permitido');
              }
            }
          });
        }

        return;

      } catch (err) {
        console.error('Error obteniendo slots válidos del backend:', err);

      }
    }

    document.querySelectorAll('.slot').forEach(slot => {
      const zona = slot.closest('.zona-tablero');
      const zonaId = zona ? zona.dataset.zona : null;
      if (!zonaId) return;

      if (slot.dataset.ocupado === 'false') {

        const dinoEnZona = (this.estadoJuego && this.estadoJuego.tablero && this.estadoJuego.tablero[zonaId]) ? this.estadoJuego.tablero[zonaId] : [];
        const capacidad = zona ? (zona.querySelectorAll('.slot').length || 6) : 6;
        if (dinoEnZona.length < capacidad) {
          slot.classList.add('disponible');
        } else {
          slot.classList.add('no-disponible');
        }
      }
    });
  }

  
  async intentarColocarDinosaurio(slot) {
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

    const jugadorId = this.obtenerJugadorActual();

    const estadoJuego = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;

    if (!estadoJuego) {
      console.warn('Estado del juego no disponible, reintentando inicialización...');
      this.mostrarMensaje('Juego inicializándose, por favor espera...', 'info');

      setTimeout(() => {
        if (window.estadoJuego) {
          this.intentarColocarDinosaurio(slot);
        } else {
          this.mostrarMensaje('Error: No se pudo inicializar el juego. Recarga la página.', 'error');
        }
      }, 500);
      return;
    }

    const validacion = window.validarMovimiento ? 
      await window.validarMovimiento(zonaId, this.dinosaurioSeleccionado, slot.dataset.slot ? parseInt(slot.dataset.slot) : null, jugadorId, estadoJuego) :
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

    return { valido: this.puedeColocarEnZona(this.dinosaurioSeleccionado, zonaId) };
  }

  
  obtenerJugadorActual() {


    if (window.estadoJuego) {
      const estado = window.estadoJuego.obtenerEstado();
      return estado.jugadorActual || 1;
    }
    return 1;
  }

  
  mostrarMensajeEspecifico(validacion, zonaId) {

    if (validacion.razon.includes('🌲') || validacion.razon.includes('🌾') || 
        validacion.razon.includes('💕') || validacion.razon.includes('🌿') ||
        validacion.razon.includes('🏝️') || validacion.razon.includes('👑') ||
        validacion.razon.includes('🌊') || validacion.razon.includes('🦖')) {
      this.mostrarMensaje(validacion.razon, 'error');
      return;
    }

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

  
  colocarDinosaurio(slot, zonaId) {

    if (window.manejadorSeleccion) {
      manejadorSeleccion.mostrarFeedbackValido(slot);
    }

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

  
  completarColocacion(slot, zonaId) {

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

    const dinoIdFromElem = this.dinosaurioSeleccionado.elemento.dataset.dinoId || null;
    const dinosaurioParaEstado = {
      id: dinoIdFromElem || Date.now(),
      tipo: this.dinosaurioSeleccionado.tipo,
      slot: parseInt(slot.dataset.slot),
      imagen: this.dinosaurioSeleccionado.imagen,
      jugadorColocado: this.obtenerJugadorActual()
    };


    if (window.registrarMovimiento) {
      window.registrarMovimiento(zonaId, dinosaurioParaEstado, slot.dataset.slot);
    }

    if (window.estadoJuego) {
      try {
        const jugadorActual = this.obtenerJugadorActual();
        // Llamada con la nueva firma: (jugadorId, zonaId, dinosaurio, slot)
        window.estadoJuego.colocarDinosaurio(jugadorActual, zonaId, dinosaurioParaEstado, slot.dataset.slot);
      } catch(e) {  }
    }

    this.dinosaurioSeleccionado.elemento.style.display = 'none';

    this.limpiarSeleccion();
    
    this.mostrarMensaje(`Dinosaurio colocado en ${this.zonas[zonaId].nombre}`, 'exito');
    
    console.log('Estado actual del tablero:', this.estadoJuego.tablero);
    console.log('Dinosaurio colocado:', dinosaurioParaEstado);
  }

  
  puedeColocarEnZona(dinosaurio, zonaId) {
    const zona = this.zonas[zonaId];
    const dinosauriosEnZona = this.estadoJuego.tablero[zonaId];

    if (dinosauriosEnZona.length >= zona.slots) {
      return false;
    }

    switch (zona.regla) {
      case 'mismo-tipo':
        return dinosauriosEnZona.length === 0 || 
               dinosauriosEnZona.every(d => d.tipo === dinosaurio.tipo);
      
      case 'todos-diferentes':
        return !dinosauriosEnZona.some(d => d.tipo === dinosaurio.tipo);
      
      case 'uno-solo':
        return dinosauriosEnZona.length === 0;
      
      case 'mas-grande':

        return dinosauriosEnZona.length === 0;
      
      default:
        return true;
    }
  }

  
  limpiarSeleccion() {

    if (window.manejadorSeleccion) {
      manejadorSeleccion.limpiarSeleccionAnterior();
    } else {

      document.querySelectorAll('.dinosaurio').forEach(d => d.classList.remove('seleccionado'));
      document.querySelectorAll('.slot').forEach(s => {
        s.classList.remove('disponible', 'no-disponible', 'seleccionado');
        s.removeAttribute('title');
        s.style.animation = '';
      });
    }
    
    this.dinosaurioSeleccionado = null;
  }

  
  mostrarInfoZona(zona) {
    const zonaId = zona.dataset.zona;
    const infoZona = this.zonas[zonaId];

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

  
  ocultarInfoZona(zona) {
    const tooltip = zona.querySelector('.tooltip-zona');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  
  mostrarMensaje(mensaje, tipo = 'info') {

    let areaMensajes = document.getElementById('area-mensajes');
    if (!areaMensajes) {
      areaMensajes = document.createElement('div');
      areaMensajes.id = 'area-mensajes';
      areaMensajes.className = 'area-mensajes';
      document.querySelector('.contenedor-tablero').appendChild(areaMensajes);
    }

    areaMensajes.innerHTML = `<div class="mensaje ${tipo}">${mensaje}</div>`;
    areaMensajes.style.display = 'block';

    setTimeout(() => {
      areaMensajes.style.display = 'none';
    }, 3000);
  }

  
  obtenerEstadoJuego() {
    return this.estadoJuego;
  }

  
  reiniciarTablero() {

    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.ocupado = 'false';
      slot.classList.remove('disponible', 'seleccionado');
    });

    document.querySelectorAll('.dinosaurio').forEach(dino => {
      dino.style.display = 'flex';
      dino.classList.remove('seleccionado');
    });

    this.inicializarTablero();
    this.dinosaurioSeleccionado = null;
    
    this.mostrarMensaje('Tablero reiniciado', 'info');
  }
}