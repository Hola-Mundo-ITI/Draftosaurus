/**
 * Clase para manejar las selecciones de dinosaurios y slots
 * Proporciona feedback visual y gestiona los estados de selección
 */
class ManejadorSeleccion {
  constructor(tablero) {
    this.tablero = tablero;
    this.elementoSeleccionado = null;
    this.tipoSeleccion = null; // 'dinosaurio' o 'slot'
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
    
    console.log('Dinosaurio seleccionado para colocación');
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
   * ACTUALIZADO: Considera restricciones del dado
   */
  resaltarSlotsDisponibles(elementoDino) {
    const tipoDino = this.tablero.obtenerTipoDinosaurio(elementoDino);
    const jugadorId = this.obtenerJugadorActual();
    const estadoJuego = window.estadoJuego ? estadoJuego.obtenerEstado() : null;
    
    document.querySelectorAll('.slot').forEach(slot => {
      // Limpiar clases anteriores
      slot.classList.remove('disponible', 'no-disponible', 'restringido-dado', 'restringido-recinto');
      
      if (slot.dataset.ocupado === 'false') {
        const zona = slot.closest('.zona-tablero');
        const zonaId = zona.dataset.zona;
        
        const dinosauriosEnZona = estadoJuego ? 
          estadoJuego.tablero[zonaId] : [];
        
        // NUEVA LÓGICA: Validar con ambas restricciones
        // Crear objeto dinosaurio completo para validación
        const dinosaurioParaValidacion = {
          tipo: tipoDino,
          id: `temp_${tipoDino}_${zonaId}`, // ID temporal consistente
          imagen: this.obtenerImagenPorTipo(tipoDino)
        };
        
        let validacion = { valido: true };
        
        try {
          if (window.validadorZona) {
            validacion = validadorZona.validarColocacion(
              zonaId, 
              dinosauriosEnZona, 
              dinosaurioParaValidacion, 
              slot,
              jugadorId,
              estadoJuego
            );
          }
        } catch (error) {
          console.error(`Error validando ${zonaId} para ${tipoDino}:`, error);
          validacion = { 
            valido: false, 
            razon: 'Error en validación', 
            tipo: 'error' 
          };
        }
        
        // Debug: Log de validación para troubleshooting (solo si está activado)
        if (window.debugValidacion) {
          console.log(`🔍 Validación ${zonaId} - ${tipoDino}:`, {
            valido: validacion.valido,
            razon: validacion.razon,
            tipo: validacion.tipo || 'sin-tipo',
            jugadorId,
            dinosauriosEnZona: dinosauriosEnZona.length,
            estadoDado: window.manejadorDado ? window.manejadorDado.obtenerEstado() : null
          });
        }
        
        if (validacion.valido) {
          slot.classList.add('disponible');
          this.agregarEfectoDisponible(slot);
          slot.setAttribute('title', 'Colocación válida');
        } else {
          slot.classList.add('no-disponible');
          
          // Diferentes estilos según el tipo de restricción
          if (validacion.tipo === 'dado') {
            slot.classList.add('restringido-dado');
          } else if (validacion.tipo === 'recinto') {
            slot.classList.add('restringido-recinto');
          }
          
          slot.setAttribute('title', validacion.razon);
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
    return 1; // Por ahora jugador 1, en futuro obtener del estado
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