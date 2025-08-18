/**
 * Validador de Restricciones Unificado
 * Coordina las restricciones activas (dado) y pasivas (recinto)
 * Punto de entrada principal para todas las validaciones
 */
class ValidadorRestricciones {
  constructor() {
    this.restriccionesPasivas = new RestriccionesPasivas();
    this.restriccionesActivas = new RestriccionesActivas();
  }

  /**
   * Valida si se puede colocar un dinosaurio en una zona especifica
   * Aplica primero restricciones activas, luego pasivas
   */
  validarColocacion(zonaId, dinosauriosEnZona, dinosaurio, slot, jugadorId, estadoJuego) {
    try {
      // 1. Validar restricciones activas (dado)
      const validacionActiva = this.validarRestriccionesActivas(
        zonaId, 
        estadoJuego.tablero, 
        jugadorId, 
        estadoJuego
      );
      
      if (!validacionActiva.valido) {
        return validacionActiva;
      }

      // 2. Validar restricciones pasivas (recinto)
      const validacionPasiva = this.restriccionesPasivas.validarColocacion(
        zonaId, 
        dinosauriosEnZona, 
        dinosaurio, 
        slot
      );

      return validacionPasiva;

    } catch (error) {
      console.error('Error en validacion de restricciones:', error);
      return { 
        valido: false, 
        razon: 'Error interno de validacion' 
      };
    }
  }

  /**
   * Valida las restricciones activas del dado
   */
  validarRestriccionesActivas(zonaId, estadoTablero, jugadorId, estadoJuego) {
    // Si no hay sistema de dado activo, permitir todo
    if (!window.manejadorDado) {
      return { valido: true };
    }

    const estadoDado = window.manejadorDado.obtenerEstado();
    
    // Si el dado no esta activo, no hay restricciones
    if (!estadoDado || !estadoDado.activo) {
      return { valido: true };
    }

    // Verificar si el recinto esta permitido por el dado
    const recintoPermitido = this.restriccionesActivas.esRecintoPermitido(
      zonaId,
      estadoDado.caraActual,
      estadoTablero,
      jugadorId,
      estadoDado.jugadorQueLanzo
    );

    if (!recintoPermitido) {
      const mensaje = this.restriccionesActivas.obtenerMensajeRestriccion(
        estadoDado.caraActual,
        jugadorId,
        estadoDado.jugadorQueLanzo
      );
      
      return { 
        valido: false, 
        razon: `Restriccion del dado: ${mensaje}`,
        tipo: 'restriccionActiva'
      };
    }

    return { valido: true };
  }

  /**
   * Obtiene todos los slots validos para un dinosaurio en una zona
   */
  obtenerSlotsValidos(zonaId, dinosauriosEnZona, dinosaurio, jugadorId, estadoJuego) {
    try {
      // 1. Verificar restricciones activas
      const validacionActiva = this.validarRestriccionesActivas(
        zonaId,
        estadoJuego.tablero,
        jugadorId,
        estadoJuego
      );

      if (!validacionActiva.valido) {
        return [];
      }

      // 2. Obtener slots validos segun restricciones pasivas
      return this.restriccionesPasivas.obtenerSlotsValidos(
        zonaId,
        dinosauriosEnZona,
        dinosaurio
      );

    } catch (error) {
      console.error('Error obteniendo slots validos:', error);
      return [];
    }
  }

  /**
   * Obtiene todas las zonas disponibles para un jugador
   */
  obtenerZonasDisponibles(jugadorId, estadoJuego) {
    try {
      if (!window.manejadorDado) {
        return this.restriccionesActivas.obtenerTodosLosRecintos();
      }

      const estadoDado = window.manejadorDado.obtenerEstado();
      
      if (!estadoDado || !estadoDado.activo) {
        return this.restriccionesActivas.obtenerTodosLosRecintos();
      }

      const zonasPermitidas = this.restriccionesActivas.filtrarRecintosPorDado(
        estadoDado.caraActual,
        estadoJuego.tablero,
        jugadorId,
        estadoDado.jugadorQueLanzo
      );

      // Siempre incluir el rio como comodin
      if (!zonasPermitidas.includes('dinos-rio')) {
        zonasPermitidas.push('dinos-rio');
      }

      return zonasPermitidas;

    } catch (error) {
      console.error('Error obteniendo zonas disponibles:', error);
      return ['dinos-rio']; // Al menos el rio como fallback
    }
  }

  /**
   * Genera un mensaje de error especifico para la zona
   */
  generarMensajeError(zonaId, validacion) {
    if (validacion.tipo === 'restriccionActiva') {
      return validacion.razon;
    }

    // Mensajes personalizados por zona para restricciones pasivas
    const mensajesZona = {
      'bosque-semejanza': 'Bosque de la Semejanza: ' + validacion.razon,
      'prado-diferencia': 'Prado de la Diferencia: ' + validacion.razon,
      'pradera-amor': 'Pradera del Amor: ' + validacion.razon,
      'trio-frondoso': 'Trio Frondoso: ' + validacion.razon,
      'rey-selva': 'Rey de la Selva: ' + validacion.razon,
      'isla-solitaria': 'Isla Solitaria: ' + validacion.razon,
      'dinos-rio': 'Dinosaurios en el Rio: ' + validacion.razon
    };

    return mensajesZona[zonaId] || validacion.razon;
  }

  /**
   * Obtiene informacion completa sobre las restricciones actuales
   */
  obtenerInfoRestricciones(jugadorId, estadoJuego) {
    const info = {
      restriccionesActivas: null,
      zonasDisponibles: [],
      esLanzadorDado: false
    };

    try {
      if (window.manejadorDado) {
        const estadoDado = window.manejadorDado.obtenerEstado();
        
        if (estadoDado && estadoDado.activo) {
          info.esLanzadorDado = jugadorId === estadoDado.jugadorQueLanzo;
          info.restriccionesActivas = this.restriccionesActivas.obtenerInfoRestriccion(estadoDado.caraActual);
        }
      }

      info.zonasDisponibles = this.obtenerZonasDisponibles(jugadorId, estadoJuego);

    } catch (error) {
      console.error('Error obteniendo info de restricciones:', error);
    }

    return info;
  }
}