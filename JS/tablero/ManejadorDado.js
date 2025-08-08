/**
 * Clase para manejar el sistema de dados de Draftosaurus
 * Controla las restricciones adicionales por ronda que se aplican a los jugadores
 */
class ManejadorDado {
  constructor() {
    this.estadoActual = null;
    this.rondaActual = 1;
    this.numeroJugadores = 2;
    this.areasTablero = this.definirAreasTablero();
    this.reglasDado = this.definirReglasDado();
    this.historialDados = [];
    
    this.determinarLadosDelRio();
    console.log('🎲 ManejadorDado inicializado correctamente');
  }

  /**
   * Define las áreas del tablero para las restricciones del dado
   */
  definirAreasTablero() {
    return {
      bosque: ['trio-frondoso', 'bosque-semejanza', 'rey-selva'],
      llanura: ['prado-diferencia', 'isla-solitaria', 'pradera-amor'],
      derechaDeLRio: [], // Se determina dinámicamente
      izquierdaDelRio: [] // Se determina dinámicamente
    };
  }

  /**
   * Determina qué zonas están a cada lado del río
   */
  determinarLadosDelRio() {
    // Distribución basada en el layout típico de Draftosaurus
    this.areasTablero.izquierdaDelRio = ['trio-frondoso', 'bosque-semejanza', 'prado-diferencia'];
    this.areasTablero.derechaDeLRio = ['rey-selva', 'isla-solitaria', 'pradera-amor', 'dinos-rio'];
    
    console.log('🌊 Lados del río determinados:', {
      izquierda: this.areasTablero.izquierdaDelRio,
      derecha: this.areasTablero.derechaDeLRio
    });
  }

  /**
   * Define las reglas de cada cara del dado
   */
  definirReglasDado() {
    return {
      bosque: {
        nombre: 'El Bosque',
        icono: '🌲',
        descripcion: 'Los dinosaurios deben colocarse en cualquier recinto del área del Bosque',
        validar: (zonaId) => this.areasTablero.bosque.includes(zonaId),
        zonasPermitidas: () => this.areasTablero.bosque,
        color: '#2d5a27'
      },
      
      llanura: {
        nombre: 'Llanura',
        icono: '🌾',
        descripcion: 'Los dinosaurios deben colocarse en cualquier recinto del área de la Llanura',
        validar: (zonaId) => this.areasTablero.llanura.includes(zonaId),
        zonasPermitidas: () => this.areasTablero.llanura,
        color: '#8b7355'
      },
      
      banos: {
        nombre: 'Baños',
        icono: '🚻',
        descripcion: 'Los dinosaurios deben colocarse en los recintos a la derecha del Río',
        validar: (zonaId) => this.areasTablero.derechaDeLRio.includes(zonaId),
        zonasPermitidas: () => this.areasTablero.derechaDeLRio,
        color: '#4a90e2'
      },
      
      cafeteria: {
        nombre: 'Cafetería',
        icono: '☕',
        descripcion: 'Los dinosaurios deben colocarse en los recintos a la izquierda del Río',
        validar: (zonaId) => this.areasTablero.izquierdaDelRio.includes(zonaId),
        zonasPermitidas: () => this.areasTablero.izquierdaDelRio,
        color: '#d4a574'
      },
      
      vacio: {
        nombre: 'Recinto Vacío',
        icono: '🏗️',
        descripcion: 'Los dinosaurios deben colocarse en un recinto que esté vacío',
        validar: (zonaId, dinosauriosEnZona) => dinosauriosEnZona.length === 0,
        zonasPermitidas: (estadoJuego) => {
          if (!estadoJuego || !estadoJuego.tablero) return [];
          return Object.keys(estadoJuego.tablero).filter(zona => 
            estadoJuego.tablero[zona].length === 0
          );
        },
        color: '#95a5a6'
      },
      
      trex: {
        nombre: '¡Cuidado con el T-Rex!',
        icono: '🦖',
        descripcion: 'Los dinosaurios deben colocarse en un recinto que no contenga ya un T-Rex',
        validar: (zonaId, dinosauriosEnZona, nuevoDino) => {
          // Si el nuevo dinosaurio es T-Rex, verificar que no haya otro T-Rex
          if (nuevoDino && nuevoDino.tipo === 'trex') {
            return !dinosauriosEnZona.some(d => d.tipo === 'trex');
          }
          // Para otros dinosaurios, verificar que no haya T-Rex en la zona
          return !dinosauriosEnZona.some(d => d.tipo === 'trex');
        },
        zonasPermitidas: (estadoJuego) => {
          if (!estadoJuego || !estadoJuego.tablero) return [];
          return Object.keys(estadoJuego.tablero).filter(zona => 
            !estadoJuego.tablero[zona].some(d => d.tipo === 'trex')
          );
        },
        color: '#e74c3c'
      }
    };
  }

  /**
   * Lanza el dado al inicio de una ronda
   */
  lanzarDadoParaRonda(numeroRonda, numeroJugadores = 2) {
    const jugadorQueLanza = this.determinarJugadorQueLanza(numeroRonda, numeroJugadores);
    const caraDelDado = this.lanzarDadoAleatorio();
    
    this.estadoActual = {
      rondaActual: numeroRonda,
      caraActual: caraDelDado,
      jugadorQueLanzo: jugadorQueLanza,
      descripcionRestriccion: this.reglasDado[caraDelDado].descripcion,
      activo: true,
      fechaLanzamiento: new Date()
    };
    
    // Agregar al historial
    this.historialDados.push({
      ronda: numeroRonda,
      cara: caraDelDado,
      jugador: jugadorQueLanza,
      fecha: new Date()
    });
    
    this.notificarCambioEstado();
    
    console.log(`🎲 Dado lanzado para ronda ${numeroRonda}:`, {
      cara: caraDelDado,
      jugador: jugadorQueLanza,
      descripcion: this.reglasDado[caraDelDado].descripcion
    });
    
    return this.estadoActual;
  }

  /**
   * Determina qué jugador lanza el dado (rota cada ronda)
   */
  determinarJugadorQueLanza(numeroRonda, numeroJugadores) {
    return ((numeroRonda - 1) % numeroJugadores) + 1;
  }

  /**
   * Lanza el dado aleatoriamente
   */
  lanzarDadoAleatorio() {
    const caras = ['bosque', 'llanura', 'banos', 'cafeteria', 'vacio', 'trex'];
    return caras[Math.floor(Math.random() * caras.length)];
  }

  /**
   * Verifica si un jugador está exento de la restricción
   */
  jugadorEstaExento(jugadorId) {
    return this.estadoActual && this.estadoActual.jugadorQueLanzo === jugadorId;
  }

  /**
   * Obtiene las zonas permitidas para la restricción actual
   */
  obtenerZonasPermitidas(estadoJuego = null) {
    if (!this.estadoActual || !this.estadoActual.activo) {
      // Sin restricción activa, todas las zonas están permitidas
      return estadoJuego ? Object.keys(estadoJuego.tablero || {}) : 
             ['bosque-semejanza', 'trio-frondoso', 'prado-diferencia', 'pradera-amor', 'isla-solitaria', 'rey-selva', 'dinos-rio'];
    }
    
    const regla = this.reglasDado[this.estadoActual.caraActual];
    if (regla && regla.zonasPermitidas) {
      return regla.zonasPermitidas(estadoJuego);
    }
    
    return [];
  }

  /**
   * Finaliza la ronda actual
   */
  finalizarRonda() {
    if (this.estadoActual) {
      this.estadoActual.activo = false;
      console.log(`🎲 Ronda ${this.estadoActual.rondaActual} finalizada`);
    }
  }

  /**
   * Obtiene el estado actual del dado
   */
  obtenerEstado() {
    return this.estadoActual;
  }

  /**
   * Obtiene información detallada sobre la restricción actual
   */
  obtenerInfoRestriccionActual() {
    if (!this.estadoActual || !this.estadoActual.activo) {
      return null;
    }
    
    const regla = this.reglasDado[this.estadoActual.caraActual];
    
    return {
      cara: this.estadoActual.caraActual,
      nombre: regla.nombre,
      icono: regla.icono,
      descripcion: regla.descripcion,
      color: regla.color,
      jugadorQueLanzo: this.estadoActual.jugadorQueLanzo,
      ronda: this.estadoActual.rondaActual
    };
  }

  /**
   * Obtiene el historial de dados lanzados
   */
  obtenerHistorial() {
    return [...this.historialDados];
  }

  /**
   * Reinicia el estado del dado
   */
  reiniciar() {
    this.estadoActual = null;
    this.rondaActual = 1;
    this.historialDados = [];
    console.log('🎲 ManejadorDado reiniciado');
  }

  /**
   * Notifica cambios de estado a otros componentes
   */
  notificarCambioEstado() {
    // Disparar evento personalizado para que otros componentes puedan reaccionar
    if (typeof window !== 'undefined') {
      const evento = new CustomEvent('dadoCambiado', {
        detail: {
          estado: this.estadoActual,
          info: this.obtenerInfoRestriccionActual()
        }
      });
      window.dispatchEvent(evento);
    }
  }

  /**
   * Configura eventos del dado
   */
  configurarEventos() {
    // Escuchar eventos de nueva ronda
    window.addEventListener('nuevaRonda', (evento) => {
      const { numeroRonda, numeroJugadores } = evento.detail;
      this.lanzarDadoParaRonda(numeroRonda, numeroJugadores);
    });

    // Escuchar eventos de fin de ronda
    window.addEventListener('finRonda', () => {
      this.finalizarRonda();
    });

    console.log('🎲 Eventos del dado configurados');
  }

  /**
   * Obtiene estadísticas del uso del dado
   */
  obtenerEstadisticas() {
    const conteoCaras = {};
    this.historialDados.forEach(entrada => {
      conteoCaras[entrada.cara] = (conteoCaras[entrada.cara] || 0) + 1;
    });

    return {
      totalLanzamientos: this.historialDados.length,
      conteoCaras,
      rondaActual: this.rondaActual,
      estadoActivo: this.estadoActual?.activo || false
    };
  }
}