class ManejadorSeleccion {
  constructor() {

    this.tablero = null;
    this.elementoSeleccionado = null;
    this.tipoSeleccion = null; // 'dinosaurio' o 'slot'
  }

  setTablero(tablero) {
    this.tablero = tablero;

    try {
      if (typeof this.configurarEventosPreview === 'function') {
        this.configurarEventosPreview();
      }
    } catch (e) {
      console.warn('ManejadorSeleccion: error al reconfigurar eventos tras setTablero', e);
    }
  }

  
  seleccionarDinosaurio(elementoDino) {
    this.limpiarSeleccionAnterior();
    
    this.elementoSeleccionado = elementoDino;
    this.tipoSeleccion = 'dinosaurio';

    elementoDino.classList.add('seleccionado');

    this.agregarEfectoPulso(elementoDino);

    this.resaltarSlotsDisponibles(elementoDino);

    document.body.style.cursor = 'crosshair';
    
    if (window.debugValidacion) console.log('ManejadorSeleccion: dinosaurio seleccionado', elementoDino);
  }

  
  seleccionarSlot(elementoSlot) {

    document.querySelectorAll('.slot.seleccionado').forEach(slot => {
      slot.classList.remove('seleccionado');
    });
    
    elementoSlot.classList.add('seleccionado');
    this.agregarEfectoResaltado(elementoSlot);
  }

  
  limpiarSeleccionAnterior() {

    document.querySelectorAll('.dinosaurio.seleccionado').forEach(dino => {
      dino.classList.remove('seleccionado');
      this.removerEfectoPulso(dino);
    });

    document.querySelectorAll('.slot.disponible, .slot.seleccionado, .slot.no-disponible').forEach(slot => {
      slot.classList.remove('disponible', 'seleccionado', 'no-disponible');
      slot.removeAttribute('title');
      slot.style.animation = '';
      this.removerEfectoResaltado(slot);
    });

    document.body.style.cursor = 'default';
    
    this.elementoSeleccionado = null;
    this.tipoSeleccion = null;
  }

  
  async resaltarSlotsDisponibles(elementoDino) {

    let tipoDino = null;
    try {
      if (this.tablero && typeof this.tablero.obtenerTipoDinosaurio === 'function') {
        tipoDino = this.tablero.obtenerTipoDinosaurio(elementoDino);
      } else if (window.tableroJuego && typeof window.tableroJuego.obtenerTipoDinosaurio === 'function') {
        tipoDino = window.tableroJuego.obtenerTipoDinosaurio(elementoDino);
      } else if (window.mapeoDinosaurios && typeof window.mapeoDinosaurios.obtenerTipoDesdeSrc === 'function') {
        const img = elementoDino.querySelector && elementoDino.querySelector('img');
        const src = img ? img.src : null;
        tipoDino = src ? window.mapeoDinosaurios.obtenerTipoDesdeSrc(src) : null;
      }
    } catch (e) {
      console.warn('ManejadorSeleccion: error determinando tipoDino, usando fallback simple', e);
    }

    if (!tipoDino) {

      const img = elementoDino.querySelector && elementoDino.querySelector('img');
      const src = img ? img.src : '';
      if (src.includes('dino1')) tipoDino = 'triceratops';
      else if (src.includes('dino2')) tipoDino = 'stegosaurus';
      else if (src.includes('dino3')) tipoDino = 'brontosaurus';
      else if (src.includes('dino4')) tipoDino = 'trex';
      else if (src.includes('dino5')) tipoDino = 'velociraptor';
      else if (src.includes('dino6')) tipoDino = 'pteranodon';
      else tipoDino = 'desconocido';
    }

    const jugadorId = this.obtenerJugadorActual();
    const estado = window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function' ? window.estadoJuego.obtenerEstado() : null;

    const tableroJugadorActual = estado?.tableros?.[jugadorId] || {};

    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('disponible', 'no-disponible', 'restringido-dado', 'restringido-recinto');
      this.removerEfectoDisponible(slot);
      slot.removeAttribute('title');
    });

    if (!estado || !tipoDino) {
      console.warn('ManejadorSeleccion: Estado del juego o tipo de dinosaurio no disponible para resaltar slots.');
      return;
    }

    const dinosaurioParaValidacion = {
      tipo: tipoDino,
      id: `temp_${tipoDino}_${Date.now()}`,
      imagen: this.obtenerImagenPorTipo(tipoDino)
    };

    let validSlotsBackend = [];
    try {
      const allZones = document.querySelectorAll('.zona-tablero');

      if (window.validadorDado && typeof window.validadorDado.getValidSlots === 'function') {
        for (const zona of allZones) {
          const zonaId = zona.dataset.zona;
          const dinosaursInCurrentZone = tableroJugadorActual[zonaId] || [];

          try {
            const result = await window.validadorDado.getValidSlots(zonaId, dinosaursInCurrentZone, dinosaurioParaValidacion, jugadorId, estado);

            if (result && result.valid && Array.isArray(result.validSlots)) {
              result.validSlots.forEach(slotNum => {
                const slotElement = document.querySelector(`[data-zona="${zonaId}"] [data-slot="${slotNum}"]`);
                if (slotElement && slotElement.dataset.ocupado === 'false') {
                  validSlotsBackend.push(slotElement);
                }
              });
            } else if (result && Array.isArray(result.validSlots)) {
              result.validSlots.forEach(slotNum => {
                const slotElement = document.querySelector(`[data-zona="${zonaId}"] [data-slot="${slotNum}"]`);
                if (slotElement && slotElement.dataset.ocupado === 'false') {
                  validSlotsBackend.push(slotElement);
                }
              });
            } else {
              console.warn('ManejadorSeleccion: respuesta inesperada de validadorDado para', zonaId, result);
            }

          } catch (innerErr) {
            console.error('ManejadorSeleccion: error al solicitar slots al validador remoto para zona', zonaId, innerErr);
          }
        }

      } else {

        for (const zona of allZones) {
          const zonaId = zona.dataset.zona;

          const dinosaursInCurrentZone = tableroJugadorActual[zonaId] || [];
          const capacidad = zona.querySelectorAll('.slot').length || 6;

          zona.querySelectorAll('.slot').forEach(slot => {
            if (slot.dataset.ocupado === 'false') {
              const slotIndex = parseInt(slot.dataset.slot);
              if (dinosaursInCurrentZone.length < capacidad) {
                validSlotsBackend.push(slot);
              }
            }
          });
        }
      }

    } catch (error) {
      console.error('Error obteniendo slots válidos del backend:', error);

      validSlotsBackend = [];
      document.querySelectorAll('.slot').forEach(s => {
        if (s.dataset.ocupado === 'false') validSlotsBackend.push(s);
      });

      try { this.tablero && this.tablero.mostrarMensaje('Error al obtener slots válidos. Usando heurística local.', 'advertencia'); } catch(e){}
    }

    document.querySelectorAll('.slot').forEach(slot => {
      if (slot.dataset.ocupado === 'false') {
        if (validSlotsBackend.includes(slot)) {
          slot.classList.add('disponible');
          this.agregarEfectoDisponible(slot);
          slot.setAttribute('title', 'Colocación válida');
        } else {
          slot.classList.add('no-disponible');
          slot.setAttribute('title', 'No permitido');
        }
      }
    });
  }

  
  agregarEfectoPulso(elemento) {
    elemento.style.animation = 'pulso-seleccion 1.5s infinite';
  }

  
  removerEfectoPulso(elemento) {
    elemento.style.animation = '';
  }

  
  agregarEfectoResaltado(elemento) {
    elemento.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
    elemento.style.transform = 'scale(1.1)';
  }

  
  removerEfectoResaltado(elemento) {
    elemento.style.boxShadow = '';
    elemento.style.transform = '';
  }

  
  agregarEfectoDisponible(elemento) {
    elemento.style.animation = 'parpadeo-disponible 2s infinite';
  }

  
  removerEfectoDisponible(elemento) {
    elemento.style.animation = '';
  }
  
  mostrarFeedbackValido(elemento) {
    elemento.classList.add('movimiento-valido');

    const efecto = document.createElement('div');
    efecto.className = 'efecto-confirmacion';
    efecto.innerHTML = '✓';
    elemento.appendChild(efecto);
    
    setTimeout(() => {
      elemento.classList.remove('movimiento-valido');
      if (efecto.parentNode) {
        efecto.parentNode.removeChild(efecto);
      }
    }, 1000);
  }

  
  mostrarFeedbackInvalido(elemento, tipoRestriccion = null) {
    elemento.classList.add('movimiento-invalido');
    
    if (tipoRestriccion === 'dado') {
      elemento.classList.add('invalido-dado');
    } else if (tipoRestriccion === 'recinto') {
      elemento.classList.add('invalido-recinto');
    }

    const efecto = document.createElement('div');
    efecto.className = 'efecto-error';
    efecto.innerHTML = '✗';
    elemento.appendChild(efecto);

    if (tipoRestriccion === 'dado') {
      elemento.style.animation = 'shake-dado 0.5s ease-in-out';
    } else if (tipoRestriccion === 'recinto') {
      elemento.style.animation = 'shake-recinto 0.5s ease-in-out';
    } else {
      elemento.style.animation = 'vibracion-error 0.5s';
    }
    
    setTimeout(() => {
      elemento.classList.remove('movimiento-invalido', 'invalido-dado', 'invalido-recinto');
      elemento.style.animation = '';
      if (efecto.parentNode) {
        efecto.parentNode.removeChild(efecto);
      }
    }, 1500);
  }

  
  mostrarPreviewColocacion(slot, tipoDino) {
    if (slot.dataset.ocupado === 'true' || !slot.classList.contains('disponible')) {
      return;
    }

    const preview = document.createElement('div');
    preview.className = 'preview-dinosaurio';
    preview.style.opacity = '0.6';
    preview.style.pointerEvents = 'none';
    
    const img = document.createElement('img');
    img.src = this.obtenerImagenPorTipo(tipoDino);
    img.style.width = '80%';
    img.style.height = '80%';
    img.style.objectFit = 'contain';
    
    preview.appendChild(img);
    slot.appendChild(preview);
  }

  
  ocultarPreviewColocacion(slot) {
    const preview = slot.querySelector('.preview-dinosaurio');
    if (preview) {
      preview.remove();
    }
  }

  
  obtenerImagenPorTipo(tipo) {
    const mapaTipos = {
      'triceratops': 'Recursos/img/dino1.png',
      'stegosaurus': 'Recursos/img/dino2.png',
      'brontosaurus': 'Recursos/img/dino3.png',
      'trex': 'Recursos/img/dino4.png',
      'velociraptor': 'Recursos/img/dino5.png',
      'pteranodon': 'Recursos/img/dino6.png'
    };
    
    return mapaTipos[tipo] || 'Recursos/img/dino1.png';
  }

  
  configurarEventosPreview() {
    document.querySelectorAll('.slot').forEach(slot => {
      slot.addEventListener('mouseenter', (e) => {
        if (this.elementoSeleccionado && this.tipoSeleccion === 'dinosaurio') {
          const tipoDino = this.tablero.obtenerTipoDinosaurio(this.elementoSeleccionado);
          this.mostrarPreviewColocacion(slot, tipoDino);
        }
      });

      slot.addEventListener('mouseleave', (e) => {
        this.ocultarPreviewColocacion(slot);
      });
    });
    
    console.log('✅ Eventos de preview configurados correctamente');
  }

  
  animarColocacionDinosaurio(dinosaurioOrigen, slotDestino, callback) {
    const rectOrigen = dinosaurioOrigen.getBoundingClientRect();
    const rectDestino = slotDestino.getBoundingClientRect();

    const clon = dinosaurioOrigen.cloneNode(true);
    clon.style.position = 'fixed';
    clon.style.left = rectOrigen.left + 'px';
    clon.style.top = rectOrigen.top + 'px';
    clon.style.width = rectOrigen.width + 'px';
    clon.style.height = rectOrigen.height + 'px';
    clon.style.zIndex = '1000';
    clon.style.pointerEvents = 'none';
    clon.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    document.body.appendChild(clon);

    dinosaurioOrigen.style.opacity = '0';

    setTimeout(() => {
      clon.style.left = rectDestino.left + 'px';
      clon.style.top = rectDestino.top + 'px';
      clon.style.width = rectDestino.width + 'px';
      clon.style.height = rectDestino.height + 'px';
      clon.style.transform = 'scale(0.8)';
    }, 50);

    setTimeout(() => {
      document.body.removeChild(clon);
      if (callback) callback();
    }, 650);
  }

  
  obtenerElementoSeleccionado() {
    return this.elementoSeleccionado;
  }

  
  obtenerTipoSeleccion() {
    return this.tipoSeleccion;
  }

  
  haySeleccion() {
    return this.elementoSeleccionado !== null;
  }

  
  obtenerJugadorActual() {

    if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
      const estado = window.estadoJuego.obtenerEstado();
      return estado.jugadorActual || 1;
    }
    return 1; // Por defecto jugador 1
  }

  
  actualizarPorCambioDado() {
    if (this.elementoSeleccionado && this.tipoSeleccion === 'dinosaurio') {
      this.resaltarSlotsDisponibles(this.elementoSeleccionado);
    }
  }
}