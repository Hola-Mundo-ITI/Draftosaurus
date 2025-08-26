
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

  
  definirAreasTablero() {
    return {
      bosque: ['trio-frondoso', 'bosque-semejanza', 'rey-selva'],
      llanura: ['prado-diferencia', 'isla-solitaria', 'pradera-amor'],
      derechaDeLRio: [], // Se determina dinámicamente
      izquierdaDelRio: [] // Se determina dinámicamente
    };
  }

  
  determinarLadosDelRio() {
    this.areasTablero.izquierdaDelRio = ['trio-frondoso', 'bosque-semejanza', 'prado-diferencia'];
    this.areasTablero.derechaDeLRio = ['rey-selva', 'isla-solitaria', 'pradera-amor', 'dinos-rio'];
    
    console.log('🌊 Lados del río determinados:', {
      izquierda: this.areasTablero.izquierdaDelRio,
      derecha: this.areasTablero.derechaDeLRio
    });
  }

  
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
      

    };
  }

  
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

  
  determinarJugadorQueLanza(numeroRonda, numeroJugadores) {
    return ((numeroRonda - 1) % numeroJugadores) + 1;
  }

  
  lanzarDadoAleatorio() {
    const caras = ['bosque', 'llanura', 'banos', 'cafeteria', 'vacio'];
    return caras[Math.floor(Math.random() * caras.length)];
  }

  
  jugadorEstaExento(jugadorId) {
    return this.estadoActual && this.estadoActual.jugadorQueLanzo === jugadorId;
  }

  
  obtenerZonasPermitidas(estadoJuego = null) {
    if (!this.estadoActual || !this.estadoActual.activo) {
      return estadoJuego ? Object.keys(estadoJuego.tablero || {}) : 
             ['bosque-semejanza', 'trio-frondoso', 'prado-diferencia', 'pradera-amor', 'isla-solitaria', 'rey-selva', 'dinos-rio'];
    }
    
    const regla = this.reglasDado[this.estadoActual.caraActual];
    if (regla && regla.zonasPermitidas) {
      return regla.zonasPermitidas(estadoJuego);
    }
    
    return [];
  }

  
  finalizarRonda() {
    if (this.estadoActual) {
      this.estadoActual.activo = false;
      console.log(`🎲 Ronda ${this.estadoActual.rondaActual} finalizada`);
    }
  }

  
  obtenerEstado() {
    return this.estadoActual;
  }

  
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

  
  obtenerHistorial() {
    return [...this.historialDados];
  }

  
  reiniciar() {
    this.estadoActual = null;
    this.rondaActual = 1;
    this.historialDados = [];
    console.log('🎲 ManejadorDado reiniciado');
  }

  
  notificarCambioEstado() {
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

  
  configurarEventos() {
    window.addEventListener('nuevaRonda', (evento) => {
      const { numeroRonda, numeroJugadores } = evento.detail;
      this.lanzarDadoParaRonda(numeroRonda, numeroJugadores);
    });
    window.addEventListener('finRonda', () => {
      this.finalizarRonda();
    });

    console.log('🎲 Eventos del dado configurados');
  }

  
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