/**
 * Clase para validar las restricciones del dado de colocación
 * Se integra con el sistema de validación existente
 */
class ValidadorDado {
  constructor(manejadorDado) {
    this.manejadorDado = manejadorDado;
    console.log('🎯 ValidadorDado inicializado correctamente');
  }

  /**
   * Valida si un movimiento cumple con la restricción del dado
   */
  validarRestriccionDado(zonaId, dinosauriosEnZona, nuevoDino, jugadorId, estadoJuego = null) {
    const estadoDado = this.manejadorDado.obtenerEstado();
    
    // Si no hay dado activo, permitir movimiento
    if (!estadoDado || !estadoDado.activo) {
      return { 
        valido: true, 
        razon: 'Sin restricción de dado activa',
        tipo: 'dado'
      };
    }
    
    // Si es el jugador que lanzó el dado, está exento
    if (this.manejadorDado.jugadorEstaExento(jugadorId)) {
      return { 
        valido: true, 
        razon: 'Jugador exento (lanzó el dado)',
        tipo: 'dado',
        exento: true
      };
    }
    
    // Aplicar la regla específica del dado
    const regla = this.manejadorDado.reglasDado[estadoDado.caraActual];
    if (!regla) {
      return { 
        valido: false, 
        razon: 'Regla de dado no encontrada',
        tipo: 'dado'
      };
    }
    
    let esValido = false;
    
    try {
      // Diferentes validaciones según la cara del dado
      switch (estadoDado.caraActual) {
        case 'vacio':
          esValido = regla.validar(zonaId, dinosauriosEnZona);
          break;
        case 'trex':
          esValido = regla.validar(zonaId, dinosauriosEnZona, nuevoDino);
          break;
        default:
          esValido = regla.validar(zonaId);
          break;
      }
    } catch (error) {
      console.error('Error validando restricción de dado:', error);
      return { 
        valido: false, 
        razon: 'Error en validación del dado',
        tipo: 'dado'
      };
    }
    
    return {
      valido: esValido,
      razon: esValido ? 
        `Cumple restricción: ${regla.nombre}` : 
        `🎲 ${regla.descripcion}`,
      restriccion: regla.nombre,
      cara: estadoDado.caraActual,
      tipo: 'dado'
    };
  }

  /**
   * Obtiene información detallada sobre la restricción actual
   */
  obtenerInfoRestriccionActual() {
    return this.manejadorDado.obtenerInfoRestriccionActual();
  }

  /**
   * Verifica si una zona está permitida por la restricción del dado
   */
  zonaPermitidaPorDado(zonaId, jugadorId, estadoJuego = null) {
    const estadoDado = this.manejadorDado.obtenerEstado();
    
    // Sin restricción activa o jugador exento
    if (!estadoDado || !estadoDado.activo || this.manejadorDado.jugadorEstaExento(jugadorId)) {
      return true;
    }
    
    const regla = this.manejadorDado.reglasDado[estadoDado.caraActual];
    if (!regla) return false;
    
    // Para restricciones que dependen del estado del juego
    if (estadoDado.caraActual === 'vacio' || estadoDado.caraActual === 'trex') {
      const zonasPermitidas = regla.zonasPermitidas(estadoJuego);
      return zonasPermitidas.includes(zonaId);
    }
    
    // Para restricciones de área
    return regla.validar(zonaId);
  }

  /**
   * Obtiene todas las zonas permitidas para el jugador actual
   */
  obtenerZonasPermitidas(jugadorId, estadoJuego = null) {
    const estadoDado = this.manejadorDado.obtenerEstado();
    
    // Sin restricción activa o jugador exento
    if (!estadoDado || !estadoDado.activo || this.manejadorDado.jugadorEstaExento(jugadorId)) {
      return estadoJuego ? Object.keys(estadoJuego.tablero || {}) : 
             ['bosque-semejanza', 'trio-frondoso', 'prado-diferencia', 'pradera-amor', 'isla-solitaria', 'rey-selva', 'dinos-rio'];
    }
    
    return this.manejadorDado.obtenerZonasPermitidas(estadoJuego);
  }

  /**
   * Valida restricción específica para recinto vacío
   */
  validarRecintoVacio(zonaId, dinosauriosEnZona, estadoJuego) {
    // El recinto debe estar completamente vacío
    if (dinosauriosEnZona.length > 0) {
      return {
        valido: false,
        razon: '🏗️ El recinto debe estar vacío para colocar aquí',
        tipo: 'dado'
      };
    }
    
    return {
      valido: true,
      razon: 'Recinto vacío válido',
      tipo: 'dado'
    };
  }

  /**
   * Valida restricción específica para T-Rex
   */
  validarRestriccionTRex(zonaId, dinosauriosEnZona, nuevoDino) {
    const hayTRexEnZona = dinosauriosEnZona.some(d => d.tipo === 'trex');
    
    // Si ya hay T-Rex en la zona
    if (hayTRexEnZona) {
      // Solo permitir si el nuevo dinosaurio también es T-Rex (para casos especiales)
      if (nuevoDino.tipo === 'trex') {
        return {
          valido: false,
          razon: '🦖 Ya hay un T-Rex en este recinto',
          tipo: 'dado'
        };
      }
      
      return {
        valido: false,
        razon: '🦖 No se puede colocar en un recinto con T-Rex',
        tipo: 'dado'
      };
    }
    
    return {
      valido: true,
      razon: 'Recinto sin T-Rex válido',
      tipo: 'dado'
    };
  }

  /**
   * Obtiene mensaje explicativo para la restricción actual
   */
  obtenerMensajeRestriccion(jugadorId) {
    const info = this.obtenerInfoRestriccionActual();
    
    if (!info) {
      return 'Sin restricciones de dado activas';
    }
    
    if (this.manejadorDado.jugadorEstaExento(jugadorId)) {
      return `${info.icono} ¡Lanzaste el dado! Puedes colocar donde quieras`;
    }
    
    return `${info.icono} ${info.descripcion}`;
  }

  /**
   * Obtiene el color asociado a la restricción actual
   */
  obtenerColorRestriccion() {
    const info = this.obtenerInfoRestriccionActual();
    return info ? info.color : '#333333';
  }

  /**
   * Verifica si el dado está activo
   */
  dadoActivo() {
    const estado = this.manejadorDado.obtenerEstado();
    return estado && estado.activo;
  }

  /**
   * Obtiene estadísticas de validación
   */
  obtenerEstadisticasValidacion() {
    const estado = this.manejadorDado.obtenerEstado();
    
    if (!estado || !estado.activo) {
      return {
        restriccionActiva: false,
        cara: null,
        jugadorExento: null
      };
    }
    
    return {
      restriccionActiva: true,
      cara: estado.caraActual,
      jugadorExento: estado.jugadorQueLanzo,
      descripcion: estado.descripcionRestriccion,
      ronda: estado.rondaActual
    };
  }

  /**
   * Reinicia el validador
   */
  reiniciar() {
    console.log('🎯 ValidadorDado reiniciado');
  }

  /**
   * Valida múltiples movimientos de una vez (útil para IA/bots)
   */
  validarMovimientos(movimientos, jugadorId, estadoJuego) {
    return movimientos.map(movimiento => {
      const { zonaId, dinosauriosEnZona, nuevoDino } = movimiento;
      return {
        ...movimiento,
        validacion: this.validarRestriccionDado(zonaId, dinosauriosEnZona, nuevoDino, jugadorId, estadoJuego)
      };
    });
  }

  /**
   * Obtiene sugerencias para el jugador basadas en la restricción del dado
   */
  obtenerSugerencias(jugadorId, estadoJuego) {
    const info = this.obtenerInfoRestriccionActual();
    
    if (!info) {
      return ['Sin restricciones de dado. Puedes colocar en cualquier zona válida.'];
    }
    
    if (this.manejadorDado.jugadorEstaExento(jugadorId)) {
      return [`${info.icono} ¡Lanzaste el dado! Tienes libertad total de colocación.`];
    }
    
    const zonasPermitidas = this.obtenerZonasPermitidas(jugadorId, estadoJuego);
    const nombresZonas = this.convertirZonasANombres(zonasPermitidas);
    
    return [
      `${info.icono} ${info.descripcion}`,
      `Zonas disponibles: ${nombresZonas.join(', ')}`
    ];
  }

  /**
   * Convierte IDs de zonas a nombres legibles
   */
  convertirZonasANombres(zonasIds) {
    const nombres = {
      'bosque-semejanza': 'Bosque de la Semejanza',
      'trio-frondoso': 'El Trío Frondoso',
      'prado-diferencia': 'Prado de la Diferencia',
      'pradera-amor': 'La Pradera del Amor',
      'isla-solitaria': 'La Isla Solitaria',
      'rey-selva': 'El Rey de la Selva',
      'dinos-rio': 'Dinosaurios en el Río'
    };
    
    return zonasIds.map(id => nombres[id] || id);
  }
}