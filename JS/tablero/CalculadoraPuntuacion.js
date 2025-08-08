/**
 * Clase para calcular la puntuación según las reglas de Draftosaurus
 * Implementa el sistema de puntuación específico de cada zona
 */
class CalculadoraPuntuacion {
  constructor() {
    this.sistemasPuntuacion = this.definirSistemasPuntuacion();
  }

  /**
   * Define los sistemas de puntuación para cada zona
   */
  definirSistemasPuntuacion() {
    return {
      'bosque-semejanza': {
        calcular: (dinosaurios) => this.calcularBosqueSemejanza(dinosaurios),
        descripcion: 'Puntos por dinosaurios del mismo tipo'
      },
      'trio-frondoso': {
        calcular: (dinosaurios) => this.calcularTrioFrondoso(dinosaurios),
        descripcion: '7 puntos si tiene exactamente 3 dinosaurios'
      },
      'prado-diferencia': {
        calcular: (dinosaurios) => this.calcularPradoDiferencia(dinosaurios),
        descripcion: 'Puntos por variedad de tipos'
      },
      'pradera-amor': {
        calcular: (dinosaurios) => this.calcularPraderaAmor(dinosaurios),
        descripcion: 'Puntos por parejas completas'
      },
      'isla-solitaria': {
        calcular: (dinosaurios) => this.calcularIslaSolitaria(dinosaurios),
        descripcion: '7 puntos por el dinosaurio solitario'
      },
      'rey-selva': {
        calcular: (dinosaurios) => this.calcularReySelva(dinosaurios),
        descripcion: 'Puntos por el dinosaurio más grande'
      },
      'dinos-rio': {
        calcular: (dinosaurios) => this.calcularDinosRio(dinosaurios),
        descripcion: 'Puntos por secuencia en el río'
      },

    };
  }

  /**
   * Calcula la puntuación total de un jugador
   */
  calcularPuntuacionJugador(tablero, jugadorId, todosLosTableros = null) {
    let puntuacionTotal = 0;
    const detallesPuntuacion = {};

    Object.entries(tablero).forEach(([zonaId, dinosaurios]) => {
      // Filtrar dinosaurios del jugador específico
      const dinosauriosJugador = dinosaurios.filter(d => d.jugadorColocado === jugadorId);

      if (dinosauriosJugador.length > 0) {
        let puntos = 0;
        
        // Cálculos especiales que requieren contexto
        if (zonaId === 'rey-selva' && todosLosTableros) {
          puntos = this.calcularReySelva(dinosauriosJugador, todosLosTableros, jugadorId);
        } else if (zonaId === 'isla-solitaria') {
          puntos = this.calcularIslaSolitaria(dinosauriosJugador, tablero);
        } else {
          // Cálculos normales
          const sistema = this.sistemasPuntuacion[zonaId];
          puntos = sistema ? sistema.calcular(dinosauriosJugador) : 0;
        }

        puntuacionTotal += puntos;
        detallesPuntuacion[zonaId] = {
          puntos,
          dinosaurios: dinosauriosJugador.length,
          descripcion: this.obtenerDescripcionZona(zonaId)
        };
      }
    });

    return {
      total: puntuacionTotal,
      detalles: detallesPuntuacion
    };
  }

  /**
   * Bosque de la Semejanza: Puntos cuadráticos por mismo tipo
   */
  calcularBosqueSemejanza(dinosaurios) {
    if (dinosaurios.length === 0) return 0;

    // Agrupar por tipo
    const gruposPorTipo = {};
    dinosaurios.forEach(dino => {
      gruposPorTipo[dino.tipo] = (gruposPorTipo[dino.tipo] || 0) + 1;
    });

    // Calcular puntos cuadráticos para el grupo más grande
    const cantidadMaxima = Math.max(...Object.values(gruposPorTipo));

    // Sistema de puntuación: 1, 3, 6, 10, 15, 21 puntos
    const tablaPuntos = [0, 1, 3, 6, 10, 15, 21];
    return tablaPuntos[Math.min(cantidadMaxima, tablaPuntos.length - 1)] || 0;
  }

  /**
   * Trío Frondoso: 7 puntos si tiene exactamente 3 dinosaurios
   */
  calcularTrioFrondoso(dinosaurios) {
    return dinosaurios.length === 3 ? 7 : 0;
  }

  /**
   * Prado de la Diferencia: Puntos por variedad
   */
  calcularPradoDiferencia(dinosaurios) {
    const tiposUnicos = new Set(dinosaurios.map(d => d.tipo));
    const cantidadTipos = tiposUnicos.size;

    // Puntuación: 1, 3, 6, 10, 15, 21 puntos por 1, 2, 3, 4, 5, 6 tipos diferentes
    const tablaPuntos = [0, 1, 3, 6, 10, 15, 21];
    return tablaPuntos[Math.min(cantidadTipos, tablaPuntos.length - 1)] || 0;
  }

  /**
   * Pradera del Amor: Puntos por parejas completas
   */
  calcularPraderaAmor(dinosaurios) {
    const conteoTipos = {};

    dinosaurios.forEach(dino => {
      conteoTipos[dino.tipo] = (conteoTipos[dino.tipo] || 0) + 1;
    });

    // Contar parejas completas (grupos de 2)
    let parejasCompletas = 0;
    Object.values(conteoTipos).forEach(cantidad => {
      parejasCompletas += Math.floor(cantidad / 2);
    });

    // 5 puntos por cada pareja completa
    return parejasCompletas * 5;
  }

  /**
   * Nueva función para El Rey de la Selva
   */
  calcularReySelva(dinosaurios, todosLosTableros, jugadorId) {
    if (dinosaurios.length !== 1) return 0;
    
    const miDinosaurio = dinosaurios[0];
    const miCantidadTotal = this.contarEspecieEnParque(todosLosTableros[jugadorId], miDinosaurio.tipo);
    
    // Verificar que ningún otro jugador tenga MÁS de esta especie
    for (let otroJugadorId in todosLosTableros) {
      if (otroJugadorId !== jugadorId.toString()) {
        const cantidadOtroJugador = this.contarEspecieEnParque(todosLosTableros[otroJugadorId], miDinosaurio.tipo);
        if (cantidadOtroJugador > miCantidadTotal) {
          return 0; // Otro jugador tiene más de esta especie
        }
      }
    }
    
    return 7; // Nadie tiene más, recibe los puntos (incluye empates)
  }

  /**
   * Nueva función para La Isla Solitaria
   */
  calcularIslaSolitaria(dinosaurios, todoElTableroDelJugador) {
    if (dinosaurios.length !== 1) return 0;
    
    const dinosaurioSolitario = dinosaurios[0];
    
    // Contar cuántos de esta especie hay en TODO el parque del jugador
    let totalEspecieEnParque = 0;
    Object.values(todoElTableroDelJugador).forEach(zona => {
      totalEspecieEnParque += zona.filter(d => d.tipo === dinosaurioSolitario.tipo).length;
    });
    
    // Solo da puntos si es el ÚNICO de su especie en todo el parque
    return totalEspecieEnParque === 1 ? 7 : 0;
  }

  /**
   * Función auxiliar para contar especies en un parque
   */
  contarEspecieEnParque(tableroJugador, tipoEspecie) {
    let contador = 0;
    Object.values(tableroJugador).forEach(zona => {
      contador += zona.filter(d => d.tipo === tipoEspecie).length;
    });
    return contador;
  }

  /**
   * Función auxiliar para descripciones
   */
  obtenerDescripcionZona(zonaId) {
    const descripciones = {
      'bosque-semejanza': 'Puntos por dinosaurios de la misma especie',
      'trio-frondoso': '7 puntos si tiene exactamente 3 dinosaurios',
      'prado-diferencia': 'Puntos por variedad de especies',
      'pradera-amor': '5 puntos por cada pareja completa',
      'isla-solitaria': '7 puntos si es único de su especie en el parque',
      'rey-selva': '7 puntos si ningún rival tiene más de esa especie',
      'dinos-rio': 'Puntos por dinosaurios en secuencia',

    };
    
    return descripciones[zonaId] || 'Puntuación especial';
  }

  /**
   * Rey de la Selva: Puntos según el tamaño del dinosaurio (función original mantenida para compatibilidad)
   */
  calcularReySelvaOriginal(dinosaurios) {
    if (dinosaurios.length === 0) return 0;

    const puntosPorTipo = {
      'trex': 12,
      'brontosaurus': 10,
      'triceratops': 8,
      'stegosaurus': 6,
      'velociraptor': 4,
      'pteranodon': 2
    };

    // Tomar el dinosaurio más grande (mayor puntuación)
    const maxPuntos = Math.max(...dinosaurios.map(d => puntosPorTipo[d.tipo] || 0));
    return maxPuntos;
  }

  /**
   * Dinosaurios en el Río: Puntos por secuencia
   */
  calcularDinosRio(dinosaurios) {
    const cantidad = dinosaurios.length;

    // Puntuación progresiva: 1, 3, 6, 10, 15, 21, 28 puntos
    const tablaPuntos = [0, 1, 3, 6, 10, 15, 21, 28];
    return tablaPuntos[Math.min(cantidad, tablaPuntos.length - 1)] || 0;
  }



  /**
   * Calcula bonificaciones especiales
   */
  calcularBonificaciones(tablero, jugadorId) {
    let bonificaciones = 0;
    const detallesBonificaciones = {};

    // Bonificación por completar múltiples zonas
    const zonasCompletadas = this.contarZonasCompletadas(tablero, jugadorId);
    if (zonasCompletadas >= 5) {
      bonificaciones += 10;
      detallesBonificaciones.zonasCompletadas = 10;
    }

    // Bonificación por diversidad de dinosaurios
    const diversidad = this.calcularDiversidad(tablero, jugadorId);
    if (diversidad >= 6) {
      bonificaciones += 8;
      detallesBonificaciones.diversidad = 8;
    }

    return {
      total: bonificaciones,
      detalles: detallesBonificaciones
    };
  }

  /**
   * Cuenta las zonas completadas por un jugador
   */
  contarZonasCompletadas(tablero, jugadorId) {
    let zonasCompletadas = 0;

    Object.entries(tablero).forEach(([zonaId, dinosaurios]) => {
      const dinosauriosJugador = dinosaurios.filter(d => d.jugadorColocado === jugadorId);

      if (this.estaZonaCompletada(zonaId, dinosauriosJugador)) {
        zonasCompletadas++;
      }
    });

    return zonasCompletadas;
  }

  /**
   * Verifica si una zona está completada según sus reglas
   */
  estaZonaCompletada(zonaId, dinosaurios) {
    const reglasCompletitud = {
      'bosque-semejanza': (dinos) => dinos.length >= 3,
      'trio-frondoso': (dinos) => dinos.length === 3,
      'prado-diferencia': (dinos) => new Set(dinos.map(d => d.tipo)).size >= 3,
      'pradera-amor': (dinos) => this.tieneParejasCompletas(dinos),
      'isla-solitaria': (dinos) => dinos.length === 1,
      'rey-selva': (dinos) => dinos.length === 1,
      'dinos-rio': (dinos) => dinos.length >= 4
    };

    const regla = reglasCompletitud[zonaId];
    return regla ? regla(dinosaurios) : false;
  }

  /**
   * Verifica si hay parejas completas en una lista de dinosaurios
   */
  tieneParejasCompletas(dinosaurios) {
    const conteoTipos = {};

    dinosaurios.forEach(dino => {
      conteoTipos[dino.tipo] = (conteoTipos[dino.tipo] || 0) + 1;
    });

    return Object.values(conteoTipos).some(cantidad => cantidad >= 2);
  }

  /**
   * Calcula la diversidad de tipos de dinosaurios
   */
  calcularDiversidad(tablero, jugadorId) {
    const tiposUsados = new Set();

    Object.values(tablero).forEach(dinosaurios => {
      dinosaurios
        .filter(d => d.jugadorColocado === jugadorId)
        .forEach(d => tiposUsados.add(d.tipo));
    });

    return tiposUsados.size;
  }

  /**
   * Genera un reporte detallado de puntuación
   */
  generarReportePuntuacion(tablero, jugadorId) {
    const puntuacionBase = this.calcularPuntuacionJugador(tablero, jugadorId);
    const bonificaciones = this.calcularBonificaciones(tablero, jugadorId);

    return {
      jugador: jugadorId,
      puntuacionBase: puntuacionBase.total,
      detallesBase: puntuacionBase.detalles,
      bonificaciones: bonificaciones.total,
      detallesBonificaciones: bonificaciones.detalles,
      puntuacionTotal: puntuacionBase.total + bonificaciones.total,
      zonasCompletadas: this.contarZonasCompletadas(tablero, jugadorId),
      diversidad: this.calcularDiversidad(tablero, jugadorId)
    };
  }

  /**
   * Compara las puntuaciones de dos jugadores
   */
  compararJugadores(tablero, jugador1Id, jugador2Id) {
    const reporte1 = this.generarReportePuntuacion(tablero, jugador1Id);
    const reporte2 = this.generarReportePuntuacion(tablero, jugador2Id);

    return {
      jugador1: reporte1,
      jugador2: reporte2,
      ganador: reporte1.puntuacionTotal > reporte2.puntuacionTotal ? jugador1Id : jugador2Id,
      diferencia: Math.abs(reporte1.puntuacionTotal - reporte2.puntuacionTotal)
    };
  }

  /**
   * Obtiene sugerencias para mejorar la puntuación
   */
  obtenerSugerenciasPuntuacion(tablero, jugadorId) {
    const sugerencias = [];

    Object.entries(tablero).forEach(([zonaId, dinosaurios]) => {
      const dinosauriosJugador = dinosaurios.filter(d => d.jugadorColocado === jugadorId);
      const sugerenciaZona = this.analizarZonaParaSugerencias(zonaId, dinosauriosJugador);

      if (sugerenciaZona) {
        sugerencias.push(sugerenciaZona);
      }
    });

    return sugerencias;
  }

  /**
   * Analiza una zona específica para generar sugerencias
   */
  analizarZonaParaSugerencias(zonaId, dinosaurios) {
    const analisis = {
      'bosque-semejanza': (dinos) => {
        if (dinos.length === 0) return 'Considera colocar dinosaurios del mismo tipo en el Bosque';
        if (dinos.length < 3) return 'Agrega más dinosaurios del mismo tipo para más puntos';
        return null;
      },
      'trio-frondoso': (dinos) => {
        if (dinos.length === 0) return 'El Trío Frondoso da 7 puntos con exactamente 3 dinosaurios';
        if (dinos.length < 3) return `Necesitas ${3 - dinos.length} dinosaurios más para completar el trío`;
        return null;
      },
      'pradera-amor': (dinos) => {
        if (dinos.length === 0) return 'Las parejas en la Pradera del Amor dan buenos puntos';
        const parejas = this.contarParejas(dinos);
        if (parejas === 0) return 'Intenta formar parejas del mismo tipo';
        return null;
      }
    };

    const analizador = analisis[zonaId];
    return analizador ? analizador(dinosaurios) : null;
  }

  /**
   * Cuenta las parejas en una lista de dinosaurios
   */
  contarParejas(dinosaurios) {
    const conteoTipos = {};

    dinosaurios.forEach(dino => {
      conteoTipos[dino.tipo] = (conteoTipos[dino.tipo] || 0) + 1;
    });

    return Object.values(conteoTipos).reduce((parejas, cantidad) => {
      return parejas + Math.floor(cantidad / 2);
    }, 0);
  }

  /**
   * Simula puntuación si se coloca un dinosaurio en una zona
   */
  simularColocacion(tablero, jugadorId, zonaId, tipoDinosaurio) {
    // Crear copia del tablero
    const tableroSimulado = JSON.parse(JSON.stringify(tablero));

    // Agregar dinosaurio simulado
    tableroSimulado[zonaId].push({
      tipo: tipoDinosaurio,
      jugadorColocado: jugadorId
    });

    // Calcular nueva puntuación
    const puntuacionActual = this.calcularPuntuacionJugador(tablero, jugadorId).total;
    const puntuacionSimulada = this.calcularPuntuacionJugador(tableroSimulado, jugadorId).total;

    return {
      puntuacionActual,
      puntuacionSimulada,
      diferencia: puntuacionSimulada - puntuacionActual
    };
  }
}