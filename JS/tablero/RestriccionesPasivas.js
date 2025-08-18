/**
 * Sistema de Restricciones Pasivas
 * Maneja las reglas específicas de cada recinto del tablero
 * Estas restricciones siempre aplican a todos los jugadores
 */
class RestriccionesPasivas {
  constructor() {
    this.reglasRecintos = this.definirReglasRecintos();
  }

  /**
   * Define las reglas pasivas de cada recinto
   */
  definirReglasRecintos() {
    return {
      'bosque-semejanza': {
        capacidad: 6,
        tipoEspecie: 'mismaEspecie',
        ordenamiento: 'secuencial',
        descripcion: 'Todos los dinosaurios deben ser del mismo tipo, colocados de izquierda a derecha'
      },
      'prado-diferencia': {
        capacidad: 6,
        tipoEspecie: 'especiesDiferentes',
        ordenamiento: 'secuencial',
        descripcion: 'Todas las especies deben ser diferentes, colocados de izquierda a derecha'
      },
      'pradera-amor': {
        capacidad: 6,
        tipoEspecie: 'cualquiera',
        ordenamiento: 'libre',
        descripcion: 'Cualquier especie, cualquier slot vacio'
      },
      'trio-frondoso': {
        capacidad: 3,
        tipoEspecie: 'cualquiera',
        ordenamiento: 'libre',
        descripcion: 'Maximo 3 dinosaurios, cualquier especie'
      },
      'rey-selva': {
        capacidad: 1,
        tipoEspecie: 'cualquiera',
        ordenamiento: 'libre',
        descripcion: 'Solo un dinosaurio'
      },
      'isla-solitaria': {
        capacidad: 1,
        tipoEspecie: 'cualquiera',
        ordenamiento: 'libre',
        descripcion: 'Solo un dinosaurio'
      },
      'dinos-rio': {
        capacidad: 7,
        tipoEspecie: 'cualquiera',
        ordenamiento: 'secuencial',
        descripcion: 'Comodín - siempre disponible'
      }
    };
  }

  /**
   * Valida si se puede colocar un dinosaurio en un recinto
   */
  validarColocacion(zonaId, dinosauriosEnZona, dinosaurio, slot) {
    const reglas = this.reglasRecintos[zonaId];
    
    if (!reglas) {
      return { valido: false, razon: 'Zona no reconocida' };
    }

    // Validar capacidad
    const validacionCapacidad = this.validarCapacidad(dinosauriosEnZona, reglas.capacidad);
    if (!validacionCapacidad.valido) {
      return validacionCapacidad;
    }

    // Validar especie
    const validacionEspecie = this.validarEspecie(dinosauriosEnZona, dinosaurio, reglas.tipoEspecie);
    if (!validacionEspecie.valido) {
      return validacionEspecie;
    }

    // Validar ordenamiento
    const validacionOrden = this.validarOrdenamiento(dinosauriosEnZona, slot, reglas.ordenamiento);
    if (!validacionOrden.valido) {
      return validacionOrden;
    }

    return { valido: true, razon: 'Colocacion valida' };
  }

  /**
   * Valida la capacidad del recinto
   */
  validarCapacidad(dinosauriosEnZona, capacidadMaxima) {
    if (dinosauriosEnZona.length >= capacidadMaxima) {
      return { valido: false, razon: 'Recinto lleno' };
    }
    return { valido: true };
  }

  /**
   * Valida las reglas de especie
   */
  validarEspecie(dinosauriosEnZona, dinosaurio, tipoEspecie) {
    switch (tipoEspecie) {
      case 'mismaEspecie':
        return this.validarMismaEspecie(dinosauriosEnZona, dinosaurio);
      case 'especiesDiferentes':
        return this.validarEspeciesDiferentes(dinosauriosEnZona, dinosaurio);
      case 'cualquiera':
        return { valido: true };
      default:
        return { valido: false, razon: 'Tipo de especie no reconocido' };
    }
  }

  /**
   * Valida que todos los dinosaurios sean de la misma especie
   */
  validarMismaEspecie(dinosauriosEnZona, dinosaurio) {
    if (dinosauriosEnZona.length === 0) {
      return { valido: true };
    }

    const especieExistente = dinosauriosEnZona[0].tipo;
    if (dinosaurio.tipo !== especieExistente) {
      return { 
        valido: false, 
        razon: `Solo dinosaurios ${especieExistente} permitidos en este recinto` 
      };
    }

    return { valido: true };
  }

  /**
   * Valida que todas las especies sean diferentes
   */
  validarEspeciesDiferentes(dinosauriosEnZona, dinosaurio) {
    const especiesExistentes = dinosauriosEnZona.map(d => d.tipo);
    
    if (especiesExistentes.includes(dinosaurio.tipo)) {
      return { 
        valido: false, 
        razon: 'Solo especies diferentes permitidas en este recinto' 
      };
    }

    return { valido: true };
  }

  /**
   * Valida las reglas de ordenamiento
   */
  validarOrdenamiento(dinosauriosEnZona, slot, tipoOrdenamiento) {
    switch (tipoOrdenamiento) {
      case 'secuencial':
        return this.validarOrdenSecuencial(dinosauriosEnZona, slot);
      case 'libre':
        return { valido: true };
      default:
        return { valido: false, razon: 'Tipo de ordenamiento no reconocido' };
    }
  }

  /**
   * Valida que se coloque en el primer slot disponible (izquierda a derecha)
   */
  validarOrdenSecuencial(dinosauriosEnZona, slot) {
    let slotNumero;
    
    // Manejar diferentes tipos de entrada para slot
    if (typeof slot === 'object' && slot.dataset && slot.dataset.slot) {
      // Elemento DOM con dataset
      slotNumero = parseInt(slot.dataset.slot);
    } else if (typeof slot === 'string') {
      // String con número de slot
      slotNumero = parseInt(slot);
    } else if (typeof slot === 'number') {
      // Número directo
      slotNumero = slot;
    } else {
      console.error('Tipo de slot no reconocido:', slot);
      return { valido: false, razon: 'Slot no válido' };
    }
    
    const slotEsperado = dinosauriosEnZona.length + 1;

    if (slotNumero !== slotEsperado) {
      return { 
        valido: false, 
        razon: `Debe colocar en el slot ${slotEsperado} (de izquierda a derecha)` 
      };
    }

    return { valido: true };
  }

  /**
   * Obtiene los slots validos para un recinto
   */
  obtenerSlotsValidos(zonaId, dinosauriosEnZona, dinosaurio) {
    const reglas = this.reglasRecintos[zonaId];
    
    if (!reglas) {
      return [];
    }

    // Si el recinto esta lleno, no hay slots validos
    if (dinosauriosEnZona.length >= reglas.capacidad) {
      return [];
    }

    // Validar especie antes de determinar slots
    const validacionEspecie = this.validarEspecie(dinosauriosEnZona, dinosaurio, reglas.tipoEspecie);
    if (!validacionEspecie.valido) {
      return [];
    }

    // Determinar slots segun ordenamiento
    if (reglas.ordenamiento === 'secuencial') {
      const siguienteSlot = dinosauriosEnZona.length + 1;
      return [siguienteSlot];
    } else {
      // Ordenamiento libre - todos los slots vacios
      const slotsOcupados = dinosauriosEnZona.map(d => parseInt(d.slot));
      const slotsValidos = [];
      
      for (let i = 1; i <= reglas.capacidad; i++) {
        if (!slotsOcupados.includes(i)) {
          slotsValidos.push(i);
        }
      }
      
      return slotsValidos;
    }
  }

  /**
   * Obtiene informacion de un recinto
   */
  obtenerInfoRecinto(zonaId) {
    return this.reglasRecintos[zonaId] || null;
  }
}