/**
 * Clase para validar las reglas específicas de cada zona del tablero
 * Implementa la lógica de juego para determinar movimientos válidos
 */
class ValidadorZona {
  constructor() {
    this.reglasZona = this.definirReglasZona();
  }

  /**
   * Define las reglas específicas para cada zona
   */
  definirReglasZona() {
    return {
      'bosque-semejanza': {
        validar: (dinosaurios, nuevoDino) => this.validarMismoTipo(dinosaurios, nuevoDino),
        descripcion: 'Todos los dinosaurios deben ser del mismo tipo',
        maxSlots: 6
      },
      'trio-frondoso': {
        validar: (dinosaurios, nuevoDino) => this.validarExactamenteTres(dinosaurios, nuevoDino),
        descripcion: 'Debe tener exactamente 3 dinosaurios',
        maxSlots: 3
      },
      'prado-diferencia': {
        validar: (dinosaurios, nuevoDino) => this.validarTodosDiferentes(dinosaurios, nuevoDino),
        descripcion: 'Todos los dinosaurios deben ser de tipos diferentes',
        maxSlots: 6
      },
      'pradera-amor': {
        validar: (dinosaurios, nuevoDino) => this.validarParejas(dinosaurios, nuevoDino),
        descripcion: 'Los dinosaurios deben formar parejas del mismo tipo',
        maxSlots: 6
      },
      'isla-solitaria': {
        validar: (dinosaurios, nuevoDino) => this.validarUnoSolo(dinosaurios, nuevoDino),
        descripcion: 'Solo puede haber un dinosaurio',
        maxSlots: 1
      },
      'rey-selva': {
        validar: (dinosaurios, nuevoDino) => this.validarMasGrande(dinosaurios, nuevoDino),
        descripcion: 'Solo el dinosaurio más grande (T-Rex)',
        maxSlots: 1
      },
      'dinos-rio': {
        validar: (dinosaurios, nuevoDino) => this.validarSecuencia(dinosaurios, nuevoDino),
        descripcion: 'Dinosaurios colocados en secuencia',
        maxSlots: 7
      }

    };
  }

  /**
   * Valida colocación secuencial de izquierda a derecha
   */
  validarColocacionSecuencial(dinosaurios, slotDestino) {
    // Verificar que slotDestino existe y tiene dataset
    if (!slotDestino || !slotDestino.dataset || !slotDestino.dataset.slot) {
      return {
        valido: false,
        razon: 'Slot de destino no válido'
      };
    }
    
    const slotNumero = parseInt(slotDestino.dataset.slot);
    const slotsOcupados = dinosaurios.map(d => parseInt(d.slot)).filter(slot => !isNaN(slot)).sort((a, b) => a - b);
    
    // Si no hay dinosaurios, debe empezar en slot 1
    if (slotsOcupados.length === 0) {
      return {
        valido: slotNumero === 1,
        razon: slotNumero === 1 ? 'Primera colocación válida' : 'Debe empezar en el primer slot (izquierda)'
      };
    }
    
    // Debe ser el siguiente slot consecutivo
    const siguienteSlotEsperado = Math.max(...slotsOcupados) + 1;
    
    return {
      valido: slotNumero === siguienteSlotEsperado,
      razon: slotNumero === siguienteSlotEsperado ? 
        'Colocación secuencial válida' : 
        `Debe colocarse en el slot ${siguienteSlotEsperado} (sin dejar espacios)`
    };
  }

  /**
   * Valida si se puede colocar un dinosaurio en una zona específica
   * ACTUALIZADO: Integra validación del dado
   */
  validarColocacion(zonaId, dinosauriosEnZona, nuevoDinosaurio, slotDestino = null, jugadorId = null, estadoJuego = null) {
    // 1. SIEMPRE validar restricciones del recinto (lógica existente)
    const validacionRecinto = this.validarRestriccionRecinto(zonaId, dinosauriosEnZona, nuevoDinosaurio, slotDestino);
    
    if (!validacionRecinto.valido) {
      return {
        valido: false,
        razon: validacionRecinto.razon,
        tipo: 'recinto',
        detalles: validacionRecinto
      };
    }
    
    // 2. Si se proporciona jugadorId, validar restricción del dado
    if (jugadorId && window.validadorDado) {
      const validacionDado = window.validadorDado.validarRestriccionDado(
        zonaId, 
        dinosauriosEnZona, 
        nuevoDinosaurio, 
        jugadorId, 
        estadoJuego
      );
      
      if (!validacionDado.valido) {
        return {
          valido: false,
          razon: validacionDado.razon,
          tipo: 'dado',
          detalles: validacionDado
        };
      }
    }
    
    return { 
      valido: true, 
      razon: 'Colocación válida',
      tipo: 'exito'
    };
  }

  /**
   * Método auxiliar para validación de recinto (lógica existente separada)
   */
  validarRestriccionRecinto(zonaId, dinosauriosEnZona, nuevoDinosaurio, slotDestino) {
    const regla = this.reglasZona[zonaId];
    
    if (!regla) {
      return { valido: false, razon: 'Zona no válida' };
    }

    // Verificar límite de slots
    if (dinosauriosEnZona.length >= regla.maxSlots) {
      return {
        valido: false,
        razon: `El recinto está lleno (máximo ${regla.maxSlots} dinosaurios)`
      };
    }

    // Aplicar validación específica de la zona con slot de destino
    switch (zonaId) {
      case 'bosque-semejanza':
        // Primero validar regla básica (mismo tipo)
        const validacionBasicaBosque = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        if (!validacionBasicaBosque.valido) {
          return validacionBasicaBosque;
        }
        // Solo validar secuencial si hay slotDestino
        if (slotDestino) {
          const validacionSecuencial = this.validarColocacionSecuencial(dinosauriosEnZona, slotDestino);
          if (!validacionSecuencial.valido) {
            return validacionSecuencial;
          }
        }
        return { valido: true, razon: 'Colocación válida en Bosque de la Semejanza' };
      
      case 'prado-diferencia':
        // Primero validar regla básica (todos diferentes)
        const validacionBasicaPrado = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        if (!validacionBasicaPrado.valido) {
          return validacionBasicaPrado;
        }
        // Solo validar secuencial si hay slotDestino
        if (slotDestino) {
          const validacionSecuencial = this.validarColocacionSecuencial(dinosauriosEnZona, slotDestino);
          if (!validacionSecuencial.valido) {
            return validacionSecuencial;
          }
        }
        return { valido: true, razon: 'Colocación válida en Prado de la Diferencia' };
      
      case 'pradera-amor':
        // Usar la función existente validarParejas
        const resultadoParejas = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        return {
          valido: resultadoParejas.valido,
          razon: resultadoParejas.razon || '💕 Pradera del Amor: ' + regla.descripcion
        };
      
      case 'trio-frondoso':
        // Usar la función existente validarExactamenteTres
        const resultadoTrio = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        return {
          valido: resultadoTrio.valido,
          razon: resultadoTrio.razon || '🌿 Trío Frondoso: ' + regla.descripcion
        };
      
      case 'isla-solitaria':
        // Usar la función existente validarUnoSolo
        const resultadoIsla = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        return {
          valido: resultadoIsla.valido,
          razon: resultadoIsla.razon || '🏝️ Isla Solitaria: ' + regla.descripcion
        };
      
      case 'rey-selva':
        // Usar la función existente validarMasGrande
        const resultadoRey = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        return {
          valido: resultadoRey.valido,
          razon: resultadoRey.razon || '👑 Rey de la Selva: ' + regla.descripcion
        };
      
      case 'dinos-rio':
        // Para el río, aplicar colocación secuencial si hay slotDestino
        if (slotDestino && dinosauriosEnZona.length > 0) {
          const validacionSecuencial = this.validarColocacionSecuencial(dinosauriosEnZona, slotDestino);
          if (!validacionSecuencial.valido) {
            return {
              valido: false,
              razon: '🌊 En el Río: coloca de izquierda a derecha sin espacios'
            };
          }
        }
        // Si pasa la validación secuencial, usar la función existente
        const resultadoRio = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        return {
          valido: resultadoRio.valido,
          razon: resultadoRio.razon || '🌊 Dinosaurios en el Río: ' + regla.descripcion
        };
      

      
      default:
        // Fallback para zonas no implementadas
        const resultado = regla.validar(dinosauriosEnZona, nuevoDinosaurio);
        return {
          valido: resultado.valido,
          razon: resultado.razon || regla.descripcion
        };
    }
  }

  /**
   * Actualizar validación del Bosque de la Semejanza
   */
  validarBosqueSemejanza(dinosaurios, nuevoDino, slotDestino) {
    // 1. Verificar misma especie (lógica existente)
    if (dinosaurios.length > 0 && dinosaurios[0].tipo !== nuevoDino.tipo) {
      return { 
        valido: false, 
        razon: `Solo dinosaurios ${dinosaurios[0].tipo} permitidos en este recinto` 
      };
    }
    
    // 2. NUEVA LÓGICA: Verificar colocación secuencial
    if (slotDestino) {
      const validacionSecuencial = this.validarColocacionSecuencial(dinosaurios, slotDestino);
      if (!validacionSecuencial.valido) {
        return validacionSecuencial;
      }
    }
    
    return { valido: true, razon: 'Colocación válida en Bosque de la Semejanza' };
  }

  /**
   * Actualizar validación del Prado de la Diferencia
   */
  validarPradoDiferencia(dinosaurios, nuevoDino, slotDestino) {
    // 1. Verificar especies diferentes (lógica existente)
    const tiposExistentes = dinosaurios.map(d => d.tipo);
    if (tiposExistentes.includes(nuevoDino.tipo)) {
      return { 
        valido: false, 
        razon: `Ya hay un ${nuevoDino.tipo} en este recinto. Solo especies diferentes permitidas` 
      };
    }
    
    // 2. NUEVA LÓGICA: Verificar colocación secuencial
    if (slotDestino) {
      const validacionSecuencial = this.validarColocacionSecuencial(dinosaurios, slotDestino);
      if (!validacionSecuencial.valido) {
        return validacionSecuencial;
      }
    }
    
    return { valido: true, razon: 'Colocación válida en Prado de la Diferencia' };
  }

  /**
   * Regla: Bosque de la Semejanza - Mismo tipo (función original mantenida para compatibilidad)
   */
  validarMismoTipo(dinosaurios, nuevoDino) {
    if (dinosaurios.length === 0) {
      return { valido: true, razon: 'Primera colocación en la zona' };
    }

    const tipoExistente = dinosaurios[0].tipo;
    if (nuevoDino.tipo === tipoExistente) {
      return { valido: true, razon: 'Mismo tipo que los dinosaurios existentes' };
    }

    return { 
      valido: false, 
      razon: `Debe ser del mismo tipo (${tipoExistente})` 
    };
  }

  /**
   * Regla: Trío Frondoso - Exactamente tres
   */
  validarExactamenteTres(dinosaurios, nuevoDino) {
    if (dinosaurios.length < 3) {
      return { valido: true, razon: 'Aún hay espacio disponible' };
    }

    return { 
      valido: false, 
      razon: 'Ya tiene exactamente 3 dinosaurios' 
    };
  }

  /**
   * Regla: Prado de la Diferencia - Todos diferentes
   */
  validarTodosDiferentes(dinosaurios, nuevoDino) {
    const tiposExistentes = dinosaurios.map(d => d.tipo);
    
    if (tiposExistentes.includes(nuevoDino.tipo)) {
      return { 
        valido: false, 
        razon: `Ya hay un ${nuevoDino.tipo} en esta zona` 
      };
    }

    return { valido: true, razon: 'Tipo único en la zona' };
  }

  /**
   * Regla: Pradera del Amor - Parejas
   */
  validarParejas(dinosaurios, nuevoDino) {
    const conteoTipos = {};
    
    // Contar tipos existentes
    dinosaurios.forEach(dino => {
      conteoTipos[dino.tipo] = (conteoTipos[dino.tipo] || 0) + 1;
    });

    // Verificar si agregar este dinosaurio mantiene la regla de parejas
    const nuevoConteo = (conteoTipos[nuevoDino.tipo] || 0) + 1;
    
    if (nuevoConteo > 2) {
      return { 
        valido: false, 
        razon: `Ya hay una pareja de ${nuevoDino.tipo}` 
      };
    }

    return { valido: true, razon: 'Forma pareja válida' };
  }

  /**
   * Regla: Isla Solitaria - Solo uno
   */
  validarUnoSolo(dinosaurios, nuevoDino) {
    if (dinosaurios.length === 0) {
      return { valido: true, razon: 'Isla disponible' };
    }

    return { 
      valido: false, 
      razon: 'La isla solo puede tener un dinosaurio' 
    };
  }

  /**
   * Regla: Rey de la Selva - Solo un dinosaurio (cualquier tipo)
   */
  validarMasGrande(dinosaurios, nuevoDino) {
    // Rey de la Selva solo puede tener un dinosaurio, pero puede ser de cualquier tipo
    // La comparación con otros jugadores se hace en el cálculo de puntuación
    if (dinosaurios.length === 0) {
      return { valido: true, razon: 'Rey de la Selva disponible' };
    }

    return { 
      valido: false, 
      razon: 'El Rey de la Selva solo puede tener un dinosaurio' 
    };
  }

  /**
   * Regla: Dinosaurios en el Río - Secuencia
   */
  validarSecuencia(dinosaurios, nuevoDino) {
    // Para simplificar, permitimos cualquier colocación en el río
    // En una implementación completa, se verificaría la secuencia específica
    return { valido: true, razon: 'Colocación en el río permitida' };
  }



  /**
   * Validación específica para Pradera del Amor
   */
  validarPraderaAmor(dinosaurios, nuevoDino, slotDestino) {
    // 1. Verificar regla de parejas (máximo 2 de cada tipo)
    const conteoTipos = {};
    dinosaurios.forEach(dino => {
      conteoTipos[dino.tipo] = (conteoTipos[dino.tipo] || 0) + 1;
    });

    const nuevoConteo = (conteoTipos[nuevoDino.tipo] || 0) + 1;
    if (nuevoConteo > 2) {
      return { 
        valido: false, 
        razon: `💕 Ya hay una pareja completa de ${nuevoDino.tipo} en la Pradera del Amor` 
      };
    }

    return { valido: true, razon: 'Colocación válida en Pradera del Amor' };
  }

  /**
   * Validación específica para Trío Frondoso
   */
  validarTrioFrondoso(dinosaurios, nuevoDino, slotDestino) {
    // Solo verificar que no exceda 3 dinosaurios (ya se verifica en validarColocacion)
    if (dinosaurios.length >= 3) {
      return { 
        valido: false, 
        razon: '🌿 El Trío Frondoso ya tiene 3 dinosaurios (máximo permitido)' 
      };
    }

    return { valido: true, razon: 'Colocación válida en Trío Frondoso' };
  }

  /**
   * Validación específica para Isla Solitaria
   */
  validarIslaSolitaria(dinosaurios, nuevoDino, slotDestino) {
    // Solo puede haber un dinosaurio
    if (dinosaurios.length >= 1) {
      return { 
        valido: false, 
        razon: '🏝️ La Isla Solitaria solo puede tener un dinosaurio' 
      };
    }

    // NUEVA LÓGICA: Verificar que será único en todo el parque
    // Esta validación se hará en tiempo de puntuación, no de colocación
    // porque requiere conocer todo el estado del juego

    return { valido: true, razon: 'Colocación válida en Isla Solitaria' };
  }

  /**
   * Validación específica para Rey de la Selva
   */
  validarReySelva(dinosaurios, nuevoDino, slotDestino) {
    // Solo puede haber un dinosaurio
    if (dinosaurios.length >= 1) {
      return { 
        valido: false, 
        razon: '👑 El Rey de la Selva solo puede tener un dinosaurio' 
      };
    }

    // NUEVA LÓGICA: La comparación con otros jugadores se hará en tiempo de puntuación
    // porque requiere conocer el estado de todos los jugadores

    return { valido: true, razon: 'Colocación válida en Rey de la Selva' };
  }

  /**
   * Validación específica para Dinosaurios en el Río
   */
  validarDinosRio(dinosaurios, nuevoDino, slotDestino) {
    // NUEVA LÓGICA: Implementar colocación secuencial también para el río
    if (slotDestino) {
      const validacionSecuencial = this.validarColocacionSecuencial(dinosaurios, slotDestino);
      if (!validacionSecuencial.valido) {
        return {
          valido: false,
          razon: '🌊 En el Río: coloca de izquierda a derecha sin espacios'
        };
      }
    }

    return { valido: true, razon: 'Colocación válida en Dinosaurios en el Río' };
  }



  /**
   * Obtiene información detallada sobre una zona
   */
  obtenerInfoZona(zonaId) {
    const regla = this.reglasZona[zonaId];
    
    if (!regla) {
      return null;
    }

    return {
      descripcion: regla.descripcion,
      maxSlots: regla.maxSlots,
      ejemplos: this.obtenerEjemplosZona(zonaId)
    };
  }

  /**
   * Obtiene ejemplos de colocaciones válidas para una zona
   */
  obtenerEjemplosZona(zonaId) {
    const ejemplos = {
      'bosque-semejanza': ['3 Triceratops', '2 T-Rex', '4 Stegosaurus'],
      'trio-frondoso': ['Exactamente 3 dinosaurios de cualquier tipo'],
      'prado-diferencia': ['1 de cada tipo diferente'],
      'pradera-amor': ['2 Triceratops + 2 T-Rex', '1 pareja de cada tipo'],
      'isla-solitaria': ['1 dinosaurio solitario'],
      'rey-selva': ['El dinosaurio más grande'],
      'dinos-rio': ['Dinosaurios en fila'],
      'zona-trex': ['Solo T-Rex']
    };

    return ejemplos[zonaId] || [];
  }

  /**
   * Valida el estado completo de una zona
   */
  validarEstadoZona(zonaId, dinosaurios) {
    const regla = this.reglasZona[zonaId];
    
    if (!regla) {
      return { valido: false, razon: 'Zona no válida' };
    }

    // Validaciones específicas por zona para el estado final
    switch (zonaId) {
      case 'trio-frondoso':
        return {
          valido: dinosaurios.length === 3,
          razon: dinosaurios.length === 3 ? 'Trío completo' : `Faltan ${3 - dinosaurios.length} dinosaurios`
        };
      
      case 'pradera-amor':
        return this.validarEstadoParejas(dinosaurios);
      
      default:
        return { valido: true, razon: 'Estado válido' };
    }
  }

  /**
   * Valida que las parejas estén completas
   */
  validarEstadoParejas(dinosaurios) {
    const conteoTipos = {};
    
    dinosaurios.forEach(dino => {
      conteoTipos[dino.tipo] = (conteoTipos[dino.tipo] || 0) + 1;
    });

    const tiposIncompletos = Object.entries(conteoTipos)
      .filter(([tipo, cantidad]) => cantidad === 1)
      .map(([tipo]) => tipo);

    if (tiposIncompletos.length > 0) {
      return {
        valido: false,
        razon: `Parejas incompletas: ${tiposIncompletos.join(', ')}`
      };
    }

    return { valido: true, razon: 'Todas las parejas están completas' };
  }

  /**
   * Obtiene sugerencias para completar una zona
   */
  obtenerSugerencias(zonaId, dinosaurios) {
    const regla = this.reglasZona[zonaId];
    
    if (!regla) {
      return [];
    }

    switch (zonaId) {
      case 'bosque-semejanza':
        if (dinosaurios.length > 0) {
          return [`Agregar más ${dinosaurios[0].tipo}`];
        }
        return ['Colocar dinosaurios del mismo tipo'];
      
      case 'trio-frondoso':
        const faltantes = 3 - dinosaurios.length;
        return faltantes > 0 ? [`Agregar ${faltantes} dinosaurios más`] : [];
      
      case 'prado-diferencia':
        const tiposUsados = dinosaurios.map(d => d.tipo);
        const tiposDisponibles = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex', 'velociraptor', 'pteranodon']
          .filter(tipo => !tiposUsados.includes(tipo));
        return tiposDisponibles.map(tipo => `Agregar ${tipo}`);
      
      default:
        return [];
    }
  }
}