/**
 * Sistema de Bots para Draftosaurus
 * Maneja 2 bots que juegan automáticamente con decisiones aleatorias simples
 */
class SistemaBots {
  constructor() {
    this.bots = {
      2: { nombre: 'Bot Alpha', activo: true },
      3: { nombre: 'Bot Beta', activo: true }
    };
    this.tiempoEspera = 2000; // 2 segundos entre movimientos de bots
    this.configurarBots();
  }

  /**
   * Configura los bots iniciales
   */
  configurarBots() {
    console.log('🤖 Sistema de bots inicializado');
    console.log('🤖 Bot Alpha (Jugador 2) - Activo');
    console.log('🤖 Bot Beta (Jugador 3) - Activo');
  }

  /**
   * Verifica si un jugador es un bot
   */
  esBot(jugadorId) {
    return this.bots.hasOwnProperty(jugadorId);
  }

  /**
   * Ejecuta el turno de un bot
   */
  ejecutarTurnoBot(jugadorId) {
    if (!this.esBot(jugadorId)) {
      console.warn(`Jugador ${jugadorId} no es un bot`);
      return;
    }

    const nombreBot = this.bots[jugadorId].nombre;
    console.log(`🤖 ${nombreBot} está pensando...`);

    // Mostrar indicador visual de turno de bot
    this.mostrarIndicadorTurnoBot(nombreBot);

    // Mostrar mensaje al usuario
    if (window.tableroJuego) {
      tableroJuego.mostrarMensaje(`🤖 ${nombreBot} lanza el dado y está jugando...`, 'info');
    }

    // PRIMERO: El bot lanza el dado
    if (window.manejadorDado) {
      const estadoJuegoActual = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;
      if (estadoJuegoActual) {
        const estadoDado = window.manejadorDado.lanzarDadoParaRonda(estadoJuegoActual.rondaActual, 3);
        console.log(`🤖 ${nombreBot} lanzó el dado:`, estadoDado);
      }
    }

    // SEGUNDO: Esperar un poco para simular "pensamiento" y luego jugar
    setTimeout(() => {
      this.realizarMovimientoBot(jugadorId);
    }, this.tiempoEspera);
  }

  /**
   * Muestra un indicador visual cuando es el turno de un bot
   */
  mostrarIndicadorTurnoBot(nombreBot) {
    // Remover indicador anterior si existe
    const indicadorAnterior = document.querySelector('.turno-bot-indicator');
    if (indicadorAnterior) {
      indicadorAnterior.remove();
    }

    // Crear nuevo indicador
    const indicador = document.createElement('div');
    indicador.className = 'turno-bot-indicator';
    indicador.innerHTML = `🤖 ${nombreBot} está jugando...`;
    
    document.body.appendChild(indicador);

    // Remover después de la animación
    setTimeout(() => {
      if (indicador.parentNode) {
        indicador.remove();
      }
    }, 2000);
  }

  /**
   * Realiza un movimiento aleatorio para el bot
   */
  realizarMovimientoBot(jugadorId) {
    try {
      const movimiento = this.calcularMovimientoBot(jugadorId);
      
      if (!movimiento) {
        console.warn(`🤖 Bot ${jugadorId} no pudo encontrar movimiento válido`);
        this.pasarTurno(jugadorId);
        return;
      }

      this.ejecutarMovimiento(movimiento, jugadorId);
      
    } catch (error) {
      console.error(`🤖 Error en turno del bot ${jugadorId}:`, error);
      this.pasarTurno(jugadorId);
    }
  }

  /**
   * Calcula el mejor movimiento para el bot (aleatorio simple)
   */
  calcularMovimientoBot(jugadorId) {
    // Intentar obtener el estado del juego desde diferentes fuentes
    const estadoJuegoActual = window.estadoJuego ? 
      window.estadoJuego.obtenerEstado() : 
      (typeof estadoJuego !== 'undefined' ? estadoJuego.obtenerEstado() : null);
      
    if (!estadoJuegoActual) {
      console.error('🤖 Estado del juego no disponible para bot', jugadorId);
      console.log('🤖 window.estadoJuego:', window.estadoJuego);
      console.log('🤖 global estadoJuego:', typeof estadoJuego !== 'undefined' ? estadoJuego : 'undefined');
      return null;
    }

    // Obtener dinosaurios disponibles
    const dinosauriosDisponibles = this.obtenerDinosauriosDisponibles();
    if (dinosauriosDisponibles.length === 0) {
      console.log('🤖 No hay dinosaurios disponibles');
      return null;
    }

    // Obtener slots disponibles
    const slotsDisponibles = this.obtenerSlotsDisponibles(jugadorId, estadoJuegoActual);
    if (slotsDisponibles.length === 0) {
      console.log('🤖 No hay slots disponibles');
      return null;
    }

    // Selección aleatoria simple
    const dinosaurio = this.seleccionarDinosaurioAleatorio(dinosauriosDisponibles);
    const slot = this.seleccionarSlotAleatorio(slotsDisponibles, dinosaurio, jugadorId, estadoJuegoActual);

    if (!slot) {
      console.log('🤖 No se encontró slot válido para el dinosaurio seleccionado');
      return null;
    }

    return {
      dinosaurio,
      slot,
      zona: slot.zona
    };
  }

  /**
   * Obtiene dinosaurios disponibles para el bot
   */
  obtenerDinosauriosDisponibles() {
    const dinosaurios = [];
    const elementosDino = document.querySelectorAll('.dinosaurio');
    
    elementosDino.forEach((elemento, index) => {
      if (elemento.style.display !== 'none') {
        const tipo = this.obtenerTipoDinosaurio(elemento);
        dinosaurios.push({
          elemento,
          tipo,
          id: index + 1,
          imagen: elemento.querySelector('img').src
        });
      }
    });

    return dinosaurios;
  }

  /**
   * Obtiene el tipo de dinosaurio basado en la imagen
   */
  obtenerTipoDinosaurio(elementoDino) {
    const img = elementoDino.querySelector('img');
    const src = img.src;
    
    if (src.includes('dino1')) return 'triceratops';
    if (src.includes('dino2')) return 'stegosaurus';
    if (src.includes('dino3')) return 'brontosaurus';
    if (src.includes('dino4')) return 'trex';
    if (src.includes('dino5')) return 'velociraptor';
    if (src.includes('dino6')) return 'pteranodon';
    
    return 'desconocido';
  }

  /**
   * Obtiene slots disponibles para el bot
   */
  obtenerSlotsDisponibles(jugadorId, estadoJuego) {
    const slots = [];
    const elementosSlot = document.querySelectorAll('.slot');
    
    elementosSlot.forEach(slot => {
      if (slot.dataset.ocupado === 'false') {
        const zona = slot.closest('.zona-tablero');
        const zonaId = zona.dataset.zona;
        
        slots.push({
          elemento: slot,
          zona: zonaId,
          slotId: slot.dataset.slot
        });
      }
    });

    return slots;
  }

  /**
   * Selecciona un dinosaurio aleatoriamente
   */
  seleccionarDinosaurioAleatorio(dinosauriosDisponibles) {
    const indice = Math.floor(Math.random() * dinosauriosDisponibles.length);
    return dinosauriosDisponibles[indice];
  }

  /**
   * Selecciona un slot válido aleatoriamente
   */
  seleccionarSlotAleatorio(slotsDisponibles, dinosaurio, jugadorId, estadoJuego) {
    // Filtrar slots válidos
    const slotsValidos = slotsDisponibles.filter(slot => {
      return this.validarMovimientoBot(slot.zona, dinosaurio, slot, jugadorId, estadoJuego);
    });

    if (slotsValidos.length === 0) {
      return null;
    }

    // Selección aleatoria simple
    const indice = Math.floor(Math.random() * slotsValidos.length);
    return slotsValidos[indice];
  }

  /**
   * Valida si un movimiento es valido para el bot
   */
  validarMovimientoBot(zonaId, dinosaurio, slot, jugadorId, estadoJuego) {
    try {
      // Usar el sistema de validacion refactorizado
      if (window.validarMovimiento) {
        const validacion = window.validarMovimiento(zonaId, dinosaurio, slot.elemento, jugadorId, estadoJuego);
        return validacion && validacion.valido;
      }

      // Fallback a validacion simple
      return this.validacionSimple(zonaId, dinosaurio, estadoJuego);
      
    } catch (error) {
      console.error('Error en validacion del bot:', error);
      // En caso de error, usar validacion simple como fallback
      return this.validacionSimple(zonaId, dinosaurio, estadoJuego);
    }
  }

  /**
   * Validación simple como fallback
   */
  validacionSimple(zonaId, dinosaurio, estadoJuego) {
    const dinosauriosEnZona = estadoJuego.tablero[zonaId] || [];
    
    // Reglas básicas por zona
    switch (zonaId) {
      case 'bosque-semejanza':
        return dinosauriosEnZona.length === 0 || 
               dinosauriosEnZona.every(d => d.tipo === dinosaurio.tipo);
      
      case 'prado-diferencia':
        return !dinosauriosEnZona.some(d => d.tipo === dinosaurio.tipo);
      
      case 'isla-solitaria':
      case 'rey-selva':
        return dinosauriosEnZona.length === 0;
      
      case 'trio-frondoso':
        return dinosauriosEnZona.length < 3;
      
      default:
        return true;
    }
  }

  /**
   * Ejecuta el movimiento del bot
   */
  ejecutarMovimiento(movimiento, jugadorId) {
    const { dinosaurio, slot, zona } = movimiento;
    const nombreBot = this.bots[jugadorId].nombre;

    console.log(`🤖 ${nombreBot} coloca ${dinosaurio.tipo} en ${zona}`);

    // Crear imagen del dinosaurio en el slot
    const imgDino = document.createElement('img');
    imgDino.src = dinosaurio.imagen;
    imgDino.alt = `Dinosaurio ${dinosaurio.tipo}`;
    imgDino.style.width = '50px';
    imgDino.style.height = '50px';
    imgDino.style.objectFit = 'contain';
    imgDino.style.position = 'absolute';
    imgDino.style.top = '50%';
    imgDino.style.left = '50%';
    imgDino.style.transform = 'translate(-50%, -50%)';
    imgDino.style.zIndex = '10';
    imgDino.style.pointerEvents = 'none';
    
    slot.elemento.appendChild(imgDino);
    slot.elemento.dataset.ocupado = 'true';

    // Crear objeto dinosaurio para el estado
    const dinosaurioParaEstado = {
      id: Date.now() + jugadorId, // ID único
      tipo: dinosaurio.tipo,
      slot: slot.slotId,
      imagen: dinosaurio.imagen,
      jugadorColocado: jugadorId
    };

    // Registrar movimiento en el estado global
    if (window.registrarMovimiento) {
      window.registrarMovimiento(zona, dinosaurioParaEstado, slot.slotId);
    }

    // Remover dinosaurio de la zona de selección
    dinosaurio.elemento.style.display = 'none';

    // Mostrar mensaje
    if (window.tableroJuego) {
      tableroJuego.mostrarMensaje(`🤖 ${nombreBot} colocó ${dinosaurio.tipo}`, 'exito');
    }

    // Avanzar turno después de que el bot juegue
    setTimeout(() => {
      if (window.avanzarTurno) {
        window.avanzarTurno();
      }
    }, 500);
  }

  /**
   * Pasa el turno si el bot no puede jugar
   */
  pasarTurno(jugadorId) {
    const nombreBot = this.bots[jugadorId].nombre;
    console.log(`🤖 ${nombreBot} pasa el turno`);
    
    if (window.tableroJuego) {
      tableroJuego.mostrarMensaje(`🤖 ${nombreBot} pasa el turno`, 'advertencia');
    }

    // Avanzar turno cuando el bot pasa
    setTimeout(() => {
      if (window.avanzarTurno) {
        window.avanzarTurno();
      }
    }, 1000);
  }

  /**
   * Configura el tiempo de espera de los bots
   */
  configurarTiempoEspera(milisegundos) {
    this.tiempoEspera = Math.max(500, Math.min(5000, milisegundos));
    console.log(`🤖 Tiempo de espera configurado: ${this.tiempoEspera}ms`);
  }

  /**
   * Obtiene información de los bots
   */
  obtenerInfoBots() {
    return {
      bots: this.bots,
      tiempoEspera: this.tiempoEspera,
      activos: Object.keys(this.bots).length
    };
  }

  /**
   * Activa o desactiva un bot
   */
  toggleBot(jugadorId, activo = null) {
    if (!this.bots[jugadorId]) {
      console.warn(`Bot ${jugadorId} no existe`);
      return;
    }

    this.bots[jugadorId].activo = activo !== null ? activo : !this.bots[jugadorId].activo;
    const estado = this.bots[jugadorId].activo ? 'activado' : 'desactivado';
    console.log(`🤖 ${this.bots[jugadorId].nombre} ${estado}`);
  }
}