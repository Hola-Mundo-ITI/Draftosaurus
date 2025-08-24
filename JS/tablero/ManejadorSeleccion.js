/**
 * Clase para manejar las selecciones de dinosaurios y slots
 * Proporciona feedback visual y gestiona los estados de selección
 */
class ManejadorSeleccion {
  constructor(/* tablero removed for late injection */) {
    // La dependencia al tablero se inyecta posteriormente con setTablero
    this.tablero = null;
    this.elementoSeleccionado = null;
    this.tipoSeleccion = null; // 'dinosaurio' o 'slot'
  }

  // Permite inyectar la dependencia del tablero después de su creación
  setTablero(tablero) {
    this.tablero = tablero;
    // Si hace falta reconfigurar eventos que dependen del tablero, hacerlo aquí
    try {
      if (typeof this.configurarEventosPreview === 'function') {
        this.configurarEventosPreview();
      }
    } catch (e) {
      console.warn('ManejadorSeleccion: error al reconfigurar eventos tras setTablero', e);
    }
  }

  /**
   * Selecciona un dinosaurio y actualiza el estado visual
   */
  seleccionarDinosaurio(elementoDino) {
    this.limpiarSeleccionAnterior();
    
    this.elementoSeleccionado = elementoDino;
    this.tipoSeleccion = 'dinosaurio';
    
    // Aplicar estilos de selección
    elementoDino.classList.add('seleccionado');
    
    // Agregar efecto de pulso
    this.agregarEfectoPulso(elementoDino);
    
    // Resaltar slots disponibles
    this.resaltarSlotsDisponibles(elementoDino);
    
    // Actualizar cursor
    document.body.style.cursor = 'crosshair';
    
    if (window.debugValidacion) console.log('ManejadorSeleccion: dinosaurio seleccionado', elementoDino);
  }

  /**
   * Selecciona un slot del tablero
   */
  seleccionarSlot(elementoSlot) {
    // Remover selección anterior de slots
    document.querySelectorAll('.slot.seleccionado').forEach(slot => {
      slot.classList.remove('seleccionado');
    });
    
    elementoSlot.classList.add('seleccionado');
    this.agregarEfectoResaltado(elementoSlot);
  }

  /**
   * Limpia todas las selecciones anteriores
   */
  limpiarSeleccionAnterior() {
    // Limpiar dinosaurios seleccionados
    document.querySelectorAll('.dinosaurio.seleccionado').forEach(dino => {
      dino.classList.remove('seleccionado');
      this.removerEfectoPulso(dino);
    });

    // Limpiar slots resaltados (incluyendo no-disponible)
    document.querySelectorAll('.slot.disponible, .slot.seleccionado, .slot.no-disponible').forEach(slot => {
      slot.classList.remove('disponible', 'seleccionado', 'no-disponible');
      slot.removeAttribute('title');
      slot.style.animation = '';
      this.removerEfectoResaltado(slot);
    });

    // Restaurar cursor
    document.body.style.cursor = 'default';
    
    this.elementoSeleccionado = null;
    this.tipoSeleccion = null;
  }

  /**
   * Resalta los slots donde se puede colocar el dinosaurio
   * ACTUALIZADO: Considera restricciones del dado y añade fallbacks si el tablero no está inyectado
   */
  async resaltarSlotsDisponibles(elementoDino) {
    // Determinar tipo de dinosaurio de forma robusta
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
      // Fallback simple basado en nombre de archivo si no hay mapeo
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
    const estadoJuego = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;

    // Limpiar clases anteriores en todos los slots
    document.querySelectorAll('.slot').forEach(slot => {
      slot.classList.remove('disponible', 'no-disponible', 'restringido-dado', 'restringido-recinto');
      this.removerEfectoDisponible(slot); // Asegurarse de remover el efecto de animación
      slot.removeAttribute('title');
    });

    if (!estadoJuego || !tipoDino) {
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

      // Preferir validador remoto centralizado si está disponible
      if (window.validadorDado && typeof window.validadorDado.getValidSlots === 'function') {
        for (const zona of allZones) {
          const zonaId = zona.dataset.zona;
          const dinosaursInCurrentZone = estadoJuego.tablero[zonaId] || [];

          try {
            const result = await window.validadorDado.getValidSlots(zonaId, dinosaursInCurrentZone, dinosaurioParaValidacion, jugadorId, estadoJuego);

            if (result && result.valid && Array.isArray(result.validSlots)) {
              result.validSlots.forEach(slotNum => {
                const slotElement = document.querySelector(`[data-zona="${zonaId}"] [data-slot="${slotNum}"]`);
                if (slotElement && slotElement.dataset.ocupado === 'false') {
                  validSlotsBackend.push(slotElement);
                }
              });
            } else {
              // Si la respuesta no es la esperada, loggear para depuración
              console.warn('ManejadorSeleccion: respuesta inesperada de validadorDado para', zonaId, result);
            }

          } catch (innerErr) {
            console.error('ManejadorSeleccion: error al solicitar slots al validador remoto para zona', zonaId, innerErr);
          }
        }

      } else {
        // Fallback: pedir al backend con fetch pero manejo robusto de contenido
        for (const zona of allZones) {
          const zonaId = zona.dataset.zona;
          const dinosaursInCurrentZone = estadoJuego.tablero[zonaId] || [];

          try {
            const response = await fetch('backend/validarMovimiento.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'getValidSlots',
                zoneId: zonaId,
                dinosaursInZone: dinosaursInCurrentZone,
                dinosaur: dinosaurioParaValidacion,
                playerId: jugadorId,
                gameState: estadoJuego
              })
            });

            const ct = response.headers.get('content-type') || '';
            if (!response.ok) {
              const txt = await response.text();
              console.error('ManejadorSeleccion: backend error', response.status, txt.slice(0,500));
              continue;
            }

            if (ct.includes('application/json')) {
              let result;
              try {
                result = await response.json();
              } catch (parseErr) {
                const txt = await response.text();
                console.error('ManejadorSeleccion: JSON parse error from backend for getValidSlots:', parseErr, txt.slice(0,500));
                continue;
              }

              if (result && result.valid && Array.isArray(result.validSlots)) {
                result.validSlots.forEach(slotNum => {
                  const slotElement = document.querySelector(`[data-zona="${zonaId}"] [data-slot="${slotNum}"]`);
                  if (slotElement && slotElement.dataset.ocupado === 'false') {
                    validSlotsBackend.push(slotElement);
                  }
                });
              }
            } else {
              const txt = await response.text();
              console.error('ManejadorSeleccion: respuesta no-JSON del backend al pedir slots:', txt.slice(0,500));
              continue;
            }

          } catch (fetchErr) {
            console.error('ManejadorSeleccion: error fetching getValidSlots', fetchErr);
          }
        }
      }

    } catch (error) {
      console.error('Error obteniendo slots válidos del backend:', error);
      // Fallback a heurística local: marcar slots no-ocupados como disponibles
      validSlotsBackend = [];
      document.querySelectorAll('.slot').forEach(s => {
        if (s.dataset.ocupado === 'false') validSlotsBackend.push(s);
      });
      // Informar al usuario
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

  /**
   * Agrega efecto de pulso a un elemento
   */
  agregarEfectoPulso(elemento) {
    elemento.style.animation = 'pulso-seleccion 1.5s infinite';
  }

  /**
   * Remueve efecto de pulso
   */
  removerEfectoPulso(elemento) {
    elemento.style.animation = '';
  }

  /**
   * Agrega efecto de resaltado a un slot
   */
  agregarEfectoResaltado(elemento) {
    elemento.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.8)';
    elemento.style.transform = 'scale(1.1)';
  }

  /**
   * Remueve efecto de resaltado
   */
  removerEfectoResaltado(elemento) {
    elemento.style.boxShadow = '';
    elemento.style.transform = '';
  }

  /**
   * Agrega efecto visual para slots disponibles
   */
  agregarEfectoDisponible(elemento) {
    elemento.style.animation = 'parpadeo-disponible 2s infinite';
  }

  /**
   * Remueve efecto visual para slots disponibles
   */
  removerEfectoDisponible(elemento) {
    elemento.style.animation = '';
  }
  /**
   * Proporciona feedback visual para movimiento válido
   */
  mostrarFeedbackValido(elemento) {
    elemento.classList.add('movimiento-valido');
    
    // Crear efecto de confirmación
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

  /**
   * Proporciona feedback visual para movimiento inválido
   * ACTUALIZADO: Considera el tipo de restricción
   */
  mostrarFeedbackInvalido(elemento, tipoRestriccion = null) {
    elemento.classList.add('movimiento-invalido');
    
    if (tipoRestriccion === 'dado') {
      elemento.classList.add('invalido-dado');
    } else if (tipoRestriccion === 'recinto') {
      elemento.classList.add('invalido-recinto');
    }
    
    // Crear efecto de error
    const efecto = document.createElement('div');
    efecto.className = 'efecto-error';
    efecto.innerHTML = '✗';
    elemento.appendChild(efecto);
    
    // Agregar vibración específica según tipo
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

  /**
   * Muestra preview del dinosaurio en el slot al hacer hover
   */
  mostrarPreviewColocacion(slot, tipoDino) {
    if (slot.dataset.ocupado === 'true' || !slot.classList.contains('disponible')) {
      return;
    }

    // Crear preview temporal
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

  /**
   * Oculta el preview del dinosaurio
   */
  ocultarPreviewColocacion(slot) {
    const preview = slot.querySelector('.preview-dinosaurio');
    if (preview) {
      preview.remove();
    }
  }

  /**
   * Obtiene la imagen correspondiente a un tipo de dinosaurio
   */
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

  /**
   * Configura eventos de hover para preview
   */
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

  /**
   * Anima la transición del dinosaurio desde su posición original al slot
   */
  animarColocacionDinosaurio(dinosaurioOrigen, slotDestino, callback) {
    const rectOrigen = dinosaurioOrigen.getBoundingClientRect();
    const rectDestino = slotDestino.getBoundingClientRect();
    
    // Crear clon para animación
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
    
    // Ocultar original temporalmente
    dinosaurioOrigen.style.opacity = '0';
    
    // Animar hacia el destino
    setTimeout(() => {
      clon.style.left = rectDestino.left + 'px';
      clon.style.top = rectDestino.top + 'px';
      clon.style.width = rectDestino.width + 'px';
      clon.style.height = rectDestino.height + 'px';
      clon.style.transform = 'scale(0.8)';
    }, 50);
    
    // Completar animación
    setTimeout(() => {
      document.body.removeChild(clon);
      if (callback) callback();
    }, 650);
  }

  /**
   * Obtiene el elemento actualmente seleccionado
   */
  obtenerElementoSeleccionado() {
    return this.elementoSeleccionado;
  }

  /**
   * Obtiene el tipo de selección actual
   */
  obtenerTipoSeleccion() {
    return this.tipoSeleccion;
  }

  /**
   * Verifica si hay algo seleccionado
   */
  haySeleccion() {
    return this.elementoSeleccionado !== null;
  }

  /**
   * Método auxiliar para obtener jugador actual
   */
  obtenerJugadorActual() {
    // Asume que window.estadoJuego está disponible y tiene un método obtenerEstado
    if (window.estadoJuego && typeof window.estadoJuego.obtenerEstado === 'function') {
      const estado = window.estadoJuego.obtenerEstado();
      return estado.jugadorActual || 1;
    }
    return 1; // Por defecto jugador 1
  }

  /**
   * Actualiza el resaltado cuando cambia el estado del dado
   */
  actualizarPorCambioDado() {
    if (this.elementoSeleccionado && this.tipoSeleccion === 'dinosaurio') {
      this.resaltarSlotsDisponibles(this.elementoSeleccionado);
    }
  }
}