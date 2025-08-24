/**
 * Clase para manejar el estado completo del juego
 * Controla turnos, rondas, puntuación y persistencia
 */
class EstadoJuego {
  constructor() {
    this.estado = this.inicializarEstado();
    this.historial = [];
    this.configurarPersistencia();
  }

  /**
   * Inicializa el estado base del juego
   */
  inicializarEstado() {
    return {
      turnoActual: 1,
      rondaActual: 1,
      jugadorActual: 1,
      totalJugadores: 3,
      tablero: {
        'bosque-semejanza': [],
        'trio-frondoso': [],
        'prado-diferencia': [],
        'pradera-amor': [],
        'isla-solitaria': [],
        'rey-selva': [],
        'dinos-rio': []
      },
      puntuacion: {
        jugador1: 0,
        jugador2: 0,
        jugador3: 0
      },
      dinosauriosDisponibles: this.generarDinosauriosDisponibles(),
      configuracion: {
        modoJuego: 'clasico',
        tiempoTurno: null,
        sonidosActivados: true,
        animacionesActivadas: true
      },
      estadisticas: {
        movimientosRealizados: 0,
        tiempoJuego: 0,
        inicioPartida: new Date()
      },
      // Estado del dado para sincronizar con backend
      dado: {
        activo: false,
        caraActual: null,
        jugadorQueLanzo: null,
        rondaActual: null
      }
    };
  }

  /**
   * Genera la lista inicial de dinosaurios disponibles
   */
  generarDinosauriosDisponibles() {
    return [
      { id: 1, tipo: 'triceratops', disponible: true, imagen: 'Recursos/img/dino1.png' },
      { id: 2, tipo: 'stegosaurus', disponible: true, imagen: 'Recursos/img/dino2.png' },
      { id: 3, tipo: 'brontosaurus', disponible: true, imagen: 'Recursos/img/dino3.png' },
      { id: 4, tipo: 'trex', disponible: true, imagen: 'Recursos/img/dino4.png' },
      { id: 5, tipo: 'velociraptor', disponible: true, imagen: 'Recursos/img/dino5.png' },
      { id: 6, tipo: 'pteranodon', disponible: true, imagen: 'Recursos/img/dino6.png' }
    ];
  }

  /**
   * Avanza al siguiente turno
   */
  avanzarTurno() {
    this.guardarEstadoEnHistorial();
    
    this.estado.turnoActual++;
    
    // Ciclar entre jugadores 1, 2, 3
    this.estado.jugadorActual++;
    if (this.estado.jugadorActual > this.estado.totalJugadores) {
      this.estado.jugadorActual = 1;
    }
    
    // Verificar si se completa una ronda (todos los jugadores han jugado)
    // Una ronda se completa cuando el turno es múltiplo del número de jugadores
    if (this.estado.turnoActual % this.estado.totalJugadores === 0 && this.estado.turnoActual > 0) {
      this.avanzarRonda();
    }
    
    this.actualizarInterfazTurno();
    this.guardarEstado();
    
    console.log(`Turno ${this.estado.turnoActual}, Jugador ${this.estado.jugadorActual}`);
    
    // NUEVO: Activar bot si es su turno
    if (window.sistemaBots && window.sistemaBots.esBot(this.estado.jugadorActual)) {
      setTimeout(() => {
        window.sistemaBots.ejecutarTurnoBot(this.estado.jugadorActual);
      }, 500);
    }
  }

  /**
   * Avanza a la siguiente ronda
   * ACTUALIZADO: Integra sistema de dados
   */
  avanzarRonda() {
    this.estado.rondaActual++;
    this.estado.turnoActual = 1;
    this.estado.jugadorActual = 1;
    
    // NO regenerar dinosaurios - mantener el pool global que se va agotando
    // Los dinosaurios se marcan como no disponibles cuando se colocan
    
    // NUEVO: Lanzar dado para la nueva ronda y guardar estado en el estadoJuego
    if (window.manejadorDado) {
      try {
        const estadoDado = window.manejadorDado.lanzarDadoParaRonda(this.estado.rondaActual, this.estado.totalJugadores);
        if (estadoDado) {
          this.estado.dado = estadoDado;
          // Asegurar persistencia inmediata del cambio
          this.guardarEstado();
          console.log('[EstadoJuego] Estado del dado actualizado al avanzarRonda:', estadoDado);
        }
      } catch (e) {
        console.warn('[EstadoJuego] No se pudo lanzar o guardar el estado del dado en avanzarRonda:', e);
      }
    }
    
    this.actualizarInterfazRonda();
    
    console.log(`Nueva ronda ${this.estado.rondaActual} - Dinosaurios disponibles: ${this.estado.dinosauriosDisponibles.filter(d => d.disponible).length}`);
  }

  /**
   * Coloca un dinosaurio en el tablero
   */
  colocarDinosaurio(zonaId, dinosaurio, slotId) {
    // Agregar al tablero
    this.estado.tablero[zonaId].push({
      ...dinosaurio,
      slot: slotId,
      turnoColocado: this.estado.turnoActual,
      jugadorColocado: this.estado.jugadorActual
    });

    // Marcar dinosaurio como no disponible
    const dinoDisponible = this.estado.dinosauriosDisponibles.find(d => d.id === dinosaurio.id);
    if (dinoDisponible) {
      dinoDisponible.disponible = false;
    }

    // Actualizar estadísticas
    this.estado.estadisticas.movimientosRealizados++;
    
    this.guardarEstado();
    
    console.log(`Dinosaurio colocado en ${zonaId}:`, dinosaurio);
  }

  /**
   * Calcula la puntuación actual
   */
  calcularPuntuacion() {
    // Obtener todos los tableros para comparaciones entre jugadores
    const todosLosTableros = {
      1: this.estado.tablero, // Asumiendo que el estado actual es del jugador 1
      2: this.obtenerTableroOtroJugador() // Función a implementar para multijugador
    };
    
    this.estado.puntuacion.jugador1 = calculadoraPuntuacion.calcularPuntuacionJugador(
      this.estado.tablero, 
      1, 
      todosLosTableros
    ).total;
    
    // Para jugador 2 (cuando se implemente multijugador completo)
    // this.estado.puntuacion.jugador2 = calculadoraPuntuacion.calcularPuntuacionJugador(
    //   tableroJugador2, 
    //   2, 
    //   todosLosTableros
    // ).total;
    
    this.actualizarInterfazPuntuacion();
    
    return this.estado.puntuacion;
  }

  /**
   * Función placeholder para obtener tablero del otro jugador
   */
  obtenerTableroOtroJugador() {
    // TODO: Implementar cuando se tenga multijugador real
    // Por ahora, retornar tablero vacío
    return {
      'bosque-semejanza': [],
      'trio-frondoso': [],
      'prado-diferencia': [],
      'pradera-amor': [],
      'isla-solitaria': [],
      'rey-selva': [],
      'dinos-rio': []
    };
  }

  /**
   * Verifica si el juego ha terminado
   */
  verificarFinJuego() {
    // Verificar si no hay más dinosaurios disponibles
    const dinosauriosDisponibles = this.estado.dinosauriosDisponibles.filter(d => d.disponible);
    
    // El juego termina cuando NO hay dinosaurios disponibles Y es el final de una ronda completa
    if (dinosauriosDisponibles.length === 0) {
      // Solo terminar si todos los jugadores de la ronda actual han jugado
      const jugadoresQueHanJugadoEnRonda = (this.estado.turnoActual - 1) % this.estado.totalJugadores;
      
      if (jugadoresQueHanJugadoEnRonda === 0) {
        console.log('Fin del juego: No hay más dinosaurios disponibles y ronda completa');
        this.finalizarJuego();
        return true;
      } else {
        console.log(`Esperando que terminen los turnos restantes de la ronda. Faltan ${this.estado.totalJugadores - jugadoresQueHanJugadoEnRonda} jugadores`);
        return false;
      }
    }

    // También terminar si se han jugado demasiadas rondas (seguridad)
    const rondasMaximas = 10;
    if (this.estado.rondaActual > rondasMaximas) {
      console.log('Fin del juego: Máximo de rondas alcanzado');
      this.finalizarJuego();
      return true;
    }

    return false;
  }

  /**
   * Finaliza el juego y muestra resultados
   */
  finalizarJuego() {
    this.estado.estadisticas.tiempoJuego = new Date() - this.estado.estadisticas.inicioPartida;
    
    const puntuacionFinal = this.calcularPuntuacion();
    const ganador = puntuacionFinal.jugador1 > puntuacionFinal.jugador2 ? 1 : 2;
    
    this.mostrarResultadosFinales(ganador, puntuacionFinal);
    this.guardarEstadisticasFinales();
    
    console.log('¡Juego terminado!', { ganador, puntuacionFinal });
  }

  /**
   * Deshace el último movimiento
   */
  deshacerMovimiento() {
    if (this.historial.length === 0) {
      console.log('No hay movimientos para deshacer');
      return false;
    }

    const estadoAnterior = this.historial.pop();
    this.estado = { ...estadoAnterior };
    
    this.actualizarInterfazCompleta();
    this.guardarEstado();
    
    console.log('Movimiento deshecho');
    return true;
  }

  /**
   * Guarda el estado actual en el historial
   */
  guardarEstadoEnHistorial() {
    // Mantener solo los últimos 10 estados
    if (this.historial.length >= 10) {
      this.historial.shift();
    }
    
    this.historial.push(JSON.parse(JSON.stringify(this.estado)));
  }

  /**
   * Reinicia el juego completamente
   */
  reiniciarJuego() {
    this.estado = this.inicializarEstado();
    this.historial = [];
    
    this.actualizarInterfazCompleta();
    this.limpiarAlmacenamientoLocal();
    
    console.log('Juego reiniciado');
  }

  /**
   * Configura la persistencia del estado
   */
  configurarPersistencia() {
    // Cargar estado guardado si existe
    this.cargarEstado();
    
    // Guardar estado automáticamente cada 30 segundos
    setInterval(() => {
      this.guardarEstado();
    }, 30000);
    
    // Guardar estado al cerrar la página
    window.addEventListener('beforeunload', () => {
      this.guardarEstado();
    });
  }

  /**
   * Guarda el estado en localStorage
   */
  guardarEstado() {
    try {
      const estadoParaGuardar = {
        ...this.estado,
        fechaGuardado: new Date().toISOString()
      };
      
      localStorage.setItem('draftosaurus_estado', JSON.stringify(estadoParaGuardar));
    } catch (error) {
      console.error('Error al guardar estado:', error);
    }
  }

  /**
   * Carga el estado desde localStorage
   */
  cargarEstado() {
    try {
      const estadoGuardado = localStorage.getItem('draftosaurus_estado');
      
      if (estadoGuardado) {
        const estadoParsed = JSON.parse(estadoGuardado);
        
        // Verificar que el estado no sea muy antiguo (más de 24 horas)
        const fechaGuardado = new Date(estadoParsed.fechaGuardado);
        const ahora = new Date();
        const diferencia = ahora - fechaGuardado;
        
        if (diferencia < 24 * 60 * 60 * 1000) { // 24 horas en milisegundos
          this.estado = { ...this.estado, ...estadoParsed };
          console.log('Estado cargado desde localStorage');
        }
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
    }
  }

  /**
   * Limpia el almacenamiento local
   */
  limpiarAlmacenamientoLocal() {
    localStorage.removeItem('draftosaurus_estado');
  }

  /**
   * Actualiza la interfaz del turno actual
   */
  actualizarInterfazTurno() {
    const elementoTurno = document.querySelector('.ronda-actual .valor');
    if (elementoTurno) {
      elementoTurno.textContent = this.estado.turnoActual;
    }

    const elementoJugadores = document.querySelector('.cantidad-jugadores .valor');
    if (elementoJugadores) {
      elementoJugadores.textContent = this.estado.jugadorActual;
    }
  }

  /**
   * Actualiza la interfaz de la ronda actual
   */
  actualizarInterfazRonda() {
    const elementoRonda = document.querySelector('.ronda-actual');
    if (elementoRonda) {
      elementoRonda.innerHTML = `Ronda: <span class="valor">${this.estado.rondaActual}</span>`;
    }
  }

  /**
   * Actualiza la interfaz de puntuación
   */
  actualizarInterfazPuntuacion() {
    // Esta función se implementará cuando tengamos la interfaz de puntuación
    console.log('Puntuación actualizada:', this.estado.puntuacion);
  }

  /**
   * Actualiza toda la interfaz
   */
  actualizarInterfazCompleta() {
    this.actualizarInterfazTurno();
    this.actualizarInterfazRonda();
    this.actualizarInterfazPuntuacion();
    
    // Actualizar tablero visual
    this.actualizarTableroVisual();
  }

  /**
   * Actualiza el tablero visual basado en el estado
   */
  actualizarTableroVisual() {
    // Limpiar tablero
    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.ocupado = 'false';
    });

    // Restaurar dinosaurios colocados
    Object.entries(this.estado.tablero).forEach(([zonaId, dinosaurios]) => {
      dinosaurios.forEach(dino => {
        const zona = document.querySelector(`[data-zona="${zonaId}"]`);
        const slot = zona.querySelector(`[data-slot="${dino.slot}"]`);
        
        if (slot) {
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
          
          slot.appendChild(img);
          slot.dataset.ocupado = 'true';
        }
      });
    });

    // Actualizar dinosaurios disponibles
    document.querySelectorAll('.dinosaurio').forEach((dino, index) => {
      const dinoData = this.estado.dinosauriosDisponibles[index];
      if (dinoData && !dinoData.disponible) {
        dino.style.display = 'none';
      } else {
        dino.style.display = 'flex';
      }
    });
  }

  /**
   * Muestra los resultados finales del juego
   */
  mostrarResultadosFinales(ganador, puntuacion) {
    const modal = document.createElement('div');
    modal.className = 'modal-resultados';
    modal.innerHTML = `
      <div class="contenido-modal">
        <h2>¡Juego Terminado!</h2>
        <div class="resultados">
          <h3>🏆 Ganador: Jugador ${ganador}</h3>
          <div class="puntuaciones">
            <p>Jugador 1: ${puntuacion.jugador1} puntos</p>
            <p>Jugador 2: ${puntuacion.jugador2} puntos</p>
          </div>
          <div class="estadisticas">
            <p>Movimientos realizados: ${this.estado.estadisticas.movimientosRealizados}</p>
            <p>Tiempo de juego: ${Math.round(this.estado.estadisticas.tiempoJuego / 1000 / 60)} minutos</p>
          </div>
        </div>
        <div class="acciones-finales">
          <button onclick="this.closest('.modal-resultados').remove()">Cerrar</button>
          <button onclick="estadoJuego.reiniciarJuego(); this.closest('.modal-resultados').remove()">Nuevo Juego</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Guarda las estadísticas finales
   */
  guardarEstadisticasFinales() {
    const estadisticas = {
      fecha: new Date().toISOString(),
      puntuacion: this.estado.puntuacion,
      estadisticas: this.estado.estadisticas,
      rondas: this.estado.rondaActual
    };

    // Guardar en historial de partidas
    let historialPartidas = JSON.parse(localStorage.getItem('draftosaurus_historial') || '[]');
    historialPartidas.push(estadisticas);
    
    // Mantener solo las últimas 50 partidas
    if (historialPartidas.length > 50) {
      historialPartidas = historialPartidas.slice(-50);
    }
    
    localStorage.setItem('draftosaurus_historial', JSON.stringify(historialPartidas));
  }

  /**
   * Obtiene el estado actual del juego
   */
  obtenerEstado() {
    return { ...this.estado };
  }

  /**
   * Obtiene estadísticas del juego
   */
  obtenerEstadisticas() {
    return {
      ...this.estado.estadisticas,
      tiempoJuegoActual: new Date() - this.estado.estadisticas.inicioPartida
    };
  }

  /**
   * Configura opciones del juego
   */
  configurarJuego(opciones) {
    this.estado.configuracion = { ...this.estado.configuracion, ...opciones };
    this.guardarEstado();
    
    console.log('Configuración actualizada:', this.estado.configuracion);
  }
}