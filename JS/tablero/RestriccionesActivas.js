/**
 * Sistema de Restricciones Activas
 * Maneja las restricciones del dado que afectan a los jugadores que no lanzaron
 * Estas restricciones se aplican antes que las pasivas
 */
class RestriccionesActivas {
  constructor() {
    this.mapeoAreas = this.definirMapeoAreas();
    this.mapeoLados = this.definirMapeoLados();
    this.carasDado = this.definirCarasDado();
  }

  /**
   * Define el mapeo de recintos por areas (Bosque/Llanura)
   */
  definirMapeoAreas() {
    return {
      bosque: ['bosque-semejanza', 'rey-selva', 'trio-frondoso'],
      llanura: ['prado-diferencia', 'pradera-amor', 'isla-solitaria']
    };
  }

  /**
   * Define el mapeo de recintos por lados del rio
   */
  definirMapeoLados() {
    return {
      izquierda: ['bosque-semejanza', 'prado-diferencia', 'rey-selva'],
      derecha: ['pradera-amor', 'trio-frondoso', 'isla-solitaria']
    };
  }

  /**
   * Define las caras del dado y sus restricciones
   */
  definirCarasDado() {
    return {
      bosque: {
        nombre: 'Bosque',
        tipo: 'area',
        recintos: this.mapeoAreas.bosque,
        descripcion: 'Solo recintos del area Bosque'
      },
      llanura: {
        nombre: 'Llanura', 
        tipo: 'area',
        recintos: this.mapeoAreas.llanura,
        descripcion: 'Solo recintos del area Llanura'
      },
      banos: {
        nombre: 'Banos',
        tipo: 'lado',
        recintos: this.mapeoLados.derecha,
        descripcion: 'Solo recintos a la derecha del rio'
      },
      cafeteria: {
        nombre: 'Cafeteria',
        tipo: 'lado', 
        recintos: this.mapeoLados.izquierda,
        descripcion: 'Solo recintos a la izquierda del rio'
      },
      recintoVacio: {
        nombre: 'Recinto Vacio',
        tipo: 'dinamico',
        descripcion: 'Solo recintos que no tengan dinosaurios'
      },

    };
  }

  /**
   * Filtra los recintos disponibles segun la cara del dado
   */
  filtrarRecintosPorDado(caraActual, estadoTablero, jugadorId, jugadorQueLanzo) {
    // El jugador que lanzo el dado no tiene restricciones activas
    if (jugadorId === jugadorQueLanzo) {
      return this.obtenerTodosLosRecintos();
    }

    const caraDado = this.carasDado[caraActual];
    
    if (!caraDado) {
      console.warn('Cara del dado no reconocida:', caraActual);
      return this.obtenerTodosLosRecintos();
    }

    switch (caraDado.tipo) {
      case 'area':
      case 'lado':
        return caraDado.recintos;
      
      case 'dinamico':
        return this.filtrarRecintosDinamicos(caraActual, estadoTablero);
      
      default:
        return this.obtenerTodosLosRecintos();
    }
  }

  /**
   * Filtra recintos para restricciones dinamicas
   */
  filtrarRecintosDinamicos(caraActual, estadoTablero) {
    const todosLosRecintos = this.obtenerTodosLosRecintos();
    
    switch (caraActual) {
      case 'recintoVacio':
        return this.filtrarRecintosVacios(todosLosRecintos, estadoTablero);
      
      default:
        return todosLosRecintos;
    }
  }

  /**
   * Filtra solo los recintos que estan vacios
   */
  filtrarRecintosVacios(recintos, estadoTablero) {
    return recintos.filter(recinto => {
      const dinosauriosEnRecinto = estadoTablero[recinto] || [];
      return dinosauriosEnRecinto.length === 0;
    });
  }



  /**
   * Obtiene todos los recintos (excepto el rio)
   */
  obtenerTodosLosRecintos() {
    return [
      'bosque-semejanza',
      'prado-diferencia', 
      'pradera-amor',
      'trio-frondoso',
      'rey-selva',
      'isla-solitaria'
    ];
  }

  /**
   * Verifica si un recinto esta permitido por las restricciones activas
   */
  esRecintoPermitido(zonaId, caraActual, estadoTablero, jugadorId, jugadorQueLanzo) {
    // El rio siempre esta disponible como comodin
    if (zonaId === 'dinos-rio') {
      return true;
    }

    const recintosPermitidos = this.filtrarRecintosPorDado(caraActual, estadoTablero, jugadorId, jugadorQueLanzo);
    return recintosPermitidos.includes(zonaId);
  }

  /**
   * Obtiene informacion sobre la restriccion actual
   */
  obtenerInfoRestriccion(caraActual) {
    return this.carasDado[caraActual] || null;
  }

  /**
   * Obtiene mensaje explicativo de la restriccion
   */
  obtenerMensajeRestriccion(caraActual, jugadorId, jugadorQueLanzo) {
    if (jugadorId === jugadorQueLanzo) {
      return 'Lanzaste el dado - puedes colocar en cualquier recinto';
    }

    const caraDado = this.carasDado[caraActual];
    
    if (!caraDado) {
      return 'Restriccion desconocida';
    }

    return `${caraDado.nombre}: ${caraDado.descripcion}`;
  }
}