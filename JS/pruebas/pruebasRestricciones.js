
class PruebasRestricciones {
  constructor() {
    this.validadorZona = new ValidadorZona();
    this.calculadoraPuntuacion = new CalculadoraPuntuacion();
    this.resultadosPruebas = [];
  }

  
  ejecutarTodasLasPruebas() {
    console.log('🧪 Iniciando pruebas de restricciones de recintos...');
    
    this.probarBosqueSemejanza();
    this.probarPradoDiferencia();
    this.probarPraderaAmor();
    this.probarTrioFrondoso();
    this.probarIslaSolitaria();
    this.probarReySelva();
    this.probarDinosRio();
    this.probarZonaTRex();
    
    this.mostrarResumenPruebas();
  }

  
  probarBosqueSemejanza() {
    console.log('🌲 Probando Bosque de la Semejanza...');
    const crearSlotMock = (numero) => ({
      dataset: { slot: numero.toString() }
    });
    const dinosaurios1 = [];
    const resultado1 = this.validadorZona.validarBosqueSemejanza(
      dinosaurios1, 
      { tipo: 'triceratops' }, 
      crearSlotMock(1)
    );
    this.verificarPrueba(
      'Bosque - Primer dinosaurio en slot 1',
      resultado1.valido === true,
      'Debe permitir primer dinosaurio en slot 1'
    );
    const resultado2 = this.validadorZona.validarBosqueSemejanza(
      dinosaurios1, 
      { tipo: 'triceratops' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Bosque - Primer dinosaurio NO en slot 2',
      resultado2.valido === false,
      'No debe permitir primer dinosaurio en slot 2'
    );
    const dinosaurios3 = [{ tipo: 'triceratops', slot: '1' }];
    const resultado3 = this.validadorZona.validarBosqueSemejanza(
      dinosaurios3, 
      { tipo: 'triceratops' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Bosque - Segundo dinosaurio misma especie en slot 2',
      resultado3.valido === true,
      'Debe permitir segundo dinosaurio de misma especie en slot 2'
    );
    const resultado4 = this.validadorZona.validarBosqueSemejanza(
      dinosaurios3, 
      { tipo: 'triceratops' }, 
      crearSlotMock(3)
    );
    this.verificarPrueba(
      'Bosque - Segundo dinosaurio NO en slot 3',
      resultado4.valido === false,
      'No debe permitir segundo dinosaurio en slot 3 (debe ser secuencial)'
    );
    const resultado5 = this.validadorZona.validarBosqueSemejanza(
      dinosaurios3, 
      { tipo: 'stegosaurus' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Bosque - Especie diferente',
      resultado5.valido === false,
      'No debe permitir especie diferente'
    );
  }

  
  probarPradoDiferencia() {
    console.log('🌾 Probando Prado de la Diferencia...');
    
    const crearSlotMock = (numero) => ({
      dataset: { slot: numero.toString() }
    });
    const dinosaurios1 = [];
    const resultado1 = this.validadorZona.validarPradoDiferencia(
      dinosaurios1, 
      { tipo: 'triceratops' }, 
      crearSlotMock(1)
    );
    this.verificarPrueba(
      'Prado - Primer dinosaurio en slot 1',
      resultado1.valido === true,
      'Debe permitir primer dinosaurio en slot 1'
    );
    const dinosaurios2 = [{ tipo: 'triceratops', slot: '1' }];
    const resultado2 = this.validadorZona.validarPradoDiferencia(
      dinosaurios2, 
      { tipo: 'stegosaurus' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Prado - Segundo dinosaurio diferente en slot 2',
      resultado2.valido === true,
      'Debe permitir segundo dinosaurio diferente en slot 2'
    );
    const resultado3 = this.validadorZona.validarPradoDiferencia(
      dinosaurios2, 
      { tipo: 'triceratops' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Prado - Misma especie',
      resultado3.valido === false,
      'No debe permitir misma especie'
    );
    const resultado4 = this.validadorZona.validarPradoDiferencia(
      dinosaurios2, 
      { tipo: 'brontosaurus' }, 
      crearSlotMock(3)
    );
    this.verificarPrueba(
      'Prado - Segundo dinosaurio NO en slot 3',
      resultado4.valido === false,
      'No debe permitir segundo dinosaurio en slot 3 (debe ser secuencial)'
    );
  }

  
  probarReySelva() {
    console.log('👑 Probando Rey de la Selva...');
    const todosLosTableros = {
      1: {
        'rey-selva': [{ tipo: 'trex', jugadorColocado: 1 }],
        'bosque-semejanza': [{ tipo: 'trex', jugadorColocado: 1 }]
      },
      2: {
        'rey-selva': [],
        'bosque-semejanza': [{ tipo: 'trex', jugadorColocado: 2 }]
      }
    };
    const dinosauriosRey1 = [{ tipo: 'trex', jugadorColocado: 1 }];
    const puntos1 = this.calculadoraPuntuacion.calcularReySelva(dinosauriosRey1, todosLosTableros, 1);
    this.verificarPrueba(
      'Rey - Jugador tiene más de la especie',
      puntos1 === 7,
      'Debe dar 7 puntos cuando el jugador tiene más de esa especie'
    );
    const dinosauriosRey2 = [{ tipo: 'trex', jugadorColocado: 2 }];
    const puntos2 = this.calculadoraPuntuacion.calcularReySelva(dinosauriosRey2, todosLosTableros, 2);
    this.verificarPrueba(
      'Rey - Jugador tiene menos de la especie',
      puntos2 === 0,
      'Debe dar 0 puntos cuando otro jugador tiene más de esa especie'
    );
    const tableriosEmpate = {
      1: {
        'rey-selva': [{ tipo: 'triceratops', jugadorColocado: 1 }],
        'bosque-semejanza': [{ tipo: 'triceratops', jugadorColocado: 1 }]
      },
      2: {
        'rey-selva': [],
        'bosque-semejanza': [
          { tipo: 'triceratops', jugadorColocado: 2 },
          { tipo: 'triceratops', jugadorColocado: 2 }
        ]
      }
    };
    
    const dinosauriosEmpate = [{ tipo: 'triceratops', jugadorColocado: 1 }];
    const puntosEmpate = this.calculadoraPuntuacion.calcularReySelva(dinosauriosEmpate, tableriosEmpate, 1);
    this.verificarPrueba(
      'Rey - Empate en cantidad',
      puntosEmpate === 7,
      'Debe dar 7 puntos en caso de empate'
    );
  }

  
  probarIslaSolitaria() {
    console.log('🏝️ Probando Isla Solitaria...');
    const tableroUnico = {
      'isla-solitaria': [{ tipo: 'pteranodon', jugadorColocado: 1 }],
      'bosque-semejanza': [{ tipo: 'triceratops', jugadorColocado: 1 }],
      'prado-diferencia': [{ tipo: 'stegosaurus', jugadorColocado: 1 }]
    };
    
    const dinosauriosIsla1 = [{ tipo: 'pteranodon', jugadorColocado: 1 }];
    const puntos1 = this.calculadoraPuntuacion.calcularIslaSolitaria(dinosauriosIsla1, tableroUnico);
    this.verificarPrueba(
      'Isla - Dinosaurio único en el parque',
      puntos1 === 7,
      'Debe dar 7 puntos cuando es único de su especie en todo el parque'
    );
    const tableroNoUnico = {
      'isla-solitaria': [{ tipo: 'pteranodon', jugadorColocado: 1 }],
      'bosque-semejanza': [{ tipo: 'pteranodon', jugadorColocado: 1 }],
      'prado-diferencia': [{ tipo: 'stegosaurus', jugadorColocado: 1 }]
    };
    
    const dinosauriosIsla2 = [{ tipo: 'pteranodon', jugadorColocado: 1 }];
    const puntos2 = this.calculadoraPuntuacion.calcularIslaSolitaria(dinosauriosIsla2, tableroNoUnico);
    this.verificarPrueba(
      'Isla - Dinosaurio NO único en el parque',
      puntos2 === 0,
      'Debe dar 0 puntos cuando hay más de la misma especie en el parque'
    );
    const dinosauriosIsla3 = [
      { tipo: 'pteranodon', jugadorColocado: 1 },
      { tipo: 'triceratops', jugadorColocado: 1 }
    ];
    const puntos3 = this.calculadoraPuntuacion.calcularIslaSolitaria(dinosauriosIsla3, tableroUnico);
    this.verificarPrueba(
      'Isla - Más de un dinosaurio en la isla',
      puntos3 === 0,
      'Debe dar 0 puntos cuando hay más de un dinosaurio en la isla'
    );
  }

  
  probarPraderaAmor() {
    console.log('💕 Probando Pradera del Amor...');
    const dinosaurios1 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'triceratops', jugadorColocado: 1 }
    ];
    const puntos1 = this.calculadoraPuntuacion.calcularPraderaAmor(dinosaurios1);
    this.verificarPrueba(
      'Pradera - Una pareja completa',
      puntos1 === 5,
      'Debe dar 5 puntos por una pareja completa'
    );
    const dinosaurios2 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 }
    ];
    const puntos2 = this.calculadoraPuntuacion.calcularPraderaAmor(dinosaurios2);
    this.verificarPrueba(
      'Pradera - Dos parejas completas',
      puntos2 === 10,
      'Debe dar 10 puntos por dos parejas completas'
    );
    const dinosaurios3 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 },
      { tipo: 'brontosaurus', jugadorColocado: 1 }
    ];
    const puntos3 = this.calculadoraPuntuacion.calcularPraderaAmor(dinosaurios3);
    this.verificarPrueba(
      'Pradera - Dinosaurios sin pareja',
      puntos3 === 0,
      'Debe dar 0 puntos cuando no hay parejas completas'
    );
    const dinosaurios4 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 }
    ];
    const puntos4 = this.calculadoraPuntuacion.calcularPraderaAmor(dinosaurios4);
    this.verificarPrueba(
      'Pradera - Pareja + solitario',
      puntos4 === 5,
      'Debe dar 5 puntos por la pareja, el solitario no suma'
    );
  }

  
  probarTrioFrondoso() {
    console.log('🌿 Probando Trío Frondoso...');
    const dinosaurios1 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 },
      { tipo: 'brontosaurus', jugadorColocado: 1 }
    ];
    const puntos1 = this.calculadoraPuntuacion.calcularTrioFrondoso(dinosaurios1);
    this.verificarPrueba(
      'Trío - Exactamente 3 dinosaurios',
      puntos1 === 7,
      'Debe dar 7 puntos con exactamente 3 dinosaurios'
    );
    const dinosaurios2 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 }
    ];
    const puntos2 = this.calculadoraPuntuacion.calcularTrioFrondoso(dinosaurios2);
    this.verificarPrueba(
      'Trío - Menos de 3 dinosaurios',
      puntos2 === 0,
      'Debe dar 0 puntos con menos de 3 dinosaurios'
    );
    const dinosaurios3 = [
      { tipo: 'triceratops', jugadorColocado: 1 },
      { tipo: 'stegosaurus', jugadorColocado: 1 },
      { tipo: 'brontosaurus', jugadorColocado: 1 },
      { tipo: 'trex', jugadorColocado: 1 }
    ];
    const puntos3 = this.calculadoraPuntuacion.calcularTrioFrondoso(dinosaurios3);
    this.verificarPrueba(
      'Trío - Más de 3 dinosaurios',
      puntos3 === 0,
      'Debe dar 0 puntos con más de 3 dinosaurios'
    );
  }

  
  probarDinosRio() {
    console.log('🌊 Probando Dinosaurios en el Río...');
    
    const crearSlotMock = (numero) => ({
      dataset: { slot: numero.toString() }
    });
    const dinosaurios1 = [];
    const resultado1 = this.validadorZona.validarDinosRio(
      dinosaurios1, 
      { tipo: 'triceratops' }, 
      crearSlotMock(1)
    );
    this.verificarPrueba(
      'Río - Primer dinosaurio en slot 1',
      resultado1.valido === true,
      'Debe permitir primer dinosaurio en slot 1'
    );
    const resultado2 = this.validadorZona.validarDinosRio(
      dinosaurios1, 
      { tipo: 'triceratops' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Río - Primer dinosaurio NO en slot 2',
      resultado2.valido === false,
      'No debe permitir primer dinosaurio en slot 2'
    );
    const dinosaurios3 = [{ tipo: 'triceratops', slot: '1' }];
    const resultado3 = this.validadorZona.validarDinosRio(
      dinosaurios3, 
      { tipo: 'stegosaurus' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Río - Segundo dinosaurio en slot 2',
      resultado3.valido === true,
      'Debe permitir segundo dinosaurio en slot 2 (secuencial)'
    );
    const resultado4 = this.validadorZona.validarDinosRio(
      dinosaurios3, 
      { tipo: 'brontosaurus' }, 
      crearSlotMock(4)
    );
    this.verificarPrueba(
      'Río - Segundo dinosaurio NO en slot 4',
      resultado4.valido === false,
      'No debe permitir segundo dinosaurio en slot 4 (debe ser secuencial)'
    );
    const resultado5 = this.validadorZona.validarDinosRio(
      dinosaurios3, 
      { tipo: 'triceratops' }, 
      crearSlotMock(2)
    );
    this.verificarPrueba(
      'Río - Permite especies repetidas',
      resultado5.valido === true,
      'Debe permitir especies repetidas en el río'
    );
  }

  
  probarZonaTRex() {
    console.log('🦖 Probando Zona del T-Rex...');
    
    const crearSlotMock = (numero) => ({
      dataset: { slot: numero.toString() }
    });
    const dinosaurios1 = [];
    const resultado1 = this.validadorZona.validarZonaTRex(
      dinosaurios1, 
      { tipo: 'trex' }, 
      crearSlotMock(1)
    );
    this.verificarPrueba(
      'Zona T-Rex - T-Rex permitido',
      resultado1.valido === true,
      'Debe permitir T-Rex en su zona especial'
    );
    const resultado2 = this.validadorZona.validarZonaTRex(
      dinosaurios1, 
      { tipo: 'triceratops' }, 
      crearSlotMock(1)
    );
    this.verificarPrueba(
      'Zona T-Rex - Otros dinosaurios NO permitidos',
      resultado2.valido === false,
      'No debe permitir otros dinosaurios en la zona del T-Rex'
    );
    const dinosaurios3 = [{ tipo: 'trex', slot: '1' }];
    const resultado3 = this.validadorZona.validarZonaTRex(
      dinosaurios3, 
      { tipo: 'trex' }, 
      crearSlotMock(1)
    );
    this.verificarPrueba(
      'Zona T-Rex - Solo un dinosaurio',
      resultado3.valido === false,
      'No debe permitir más de un dinosaurio en la zona del T-Rex'
    );
    const dinosauriosParaPuntos = [{ tipo: 'trex', jugadorColocado: 1 }];
    const puntos = this.calculadoraPuntuacion.calcularZonaTRex(dinosauriosParaPuntos);
    this.verificarPrueba(
      'Zona T-Rex - Puntuación correcta',
      puntos === 12,
      'Debe dar 12 puntos por T-Rex en zona especial'
    );
  }

  
  verificarPrueba(nombre, condicion, descripcion) {
    const resultado = {
      nombre,
      descripcion,
      exitosa: condicion,
      timestamp: new Date().toISOString()
    };
    
    this.resultadosPruebas.push(resultado);
    
    const icono = condicion ? '✅' : '❌';
    const estado = condicion ? 'EXITOSA' : 'FALLIDA';
    
    console.log(`${icono} ${nombre}: ${estado}`);
    if (!condicion) {
      console.log(`   📝 ${descripcion}`);
    }
  }

  
  mostrarResumenPruebas() {
    const totalPruebas = this.resultadosPruebas.length;
    const pruebasExitosas = this.resultadosPruebas.filter(p => p.exitosa).length;
    const pruebasFallidas = totalPruebas - pruebasExitosas;
    
    console.log('\n📊 RESUMEN DE PRUEBAS DE RESTRICCIONES');
    console.log('=====================================');
    console.log(`Total de pruebas: ${totalPruebas}`);
    console.log(`✅ Exitosas: ${pruebasExitosas}`);
    console.log(`❌ Fallidas: ${pruebasFallidas}`);
    console.log(`📈 Porcentaje de éxito: ${((pruebasExitosas / totalPruebas) * 100).toFixed(1)}%`);
    
    if (pruebasFallidas > 0) {
      console.log('\n❌ PRUEBAS FALLIDAS:');
      this.resultadosPruebas
        .filter(p => !p.exitosa)
        .forEach(prueba => {
          console.log(`   • ${prueba.nombre}: ${prueba.descripcion}`);
        });
    } else {
      console.log('\n🎉 ¡Todas las pruebas pasaron exitosamente!');
    }
    
    return {
      total: totalPruebas,
      exitosas: pruebasExitosas,
      fallidas: pruebasFallidas,
      porcentajeExito: (pruebasExitosas / totalPruebas) * 100
    };
  }

  
  probarZonaEspecifica(nombreZona) {
    console.log(`🎯 Probando zona específica: ${nombreZona}`);
    
    switch (nombreZona.toLowerCase()) {
      case 'bosque':
      case 'bosque-semejanza':
        this.probarBosqueSemejanza();
        break;
      case 'prado':
      case 'prado-diferencia':
        this.probarPradoDiferencia();
        break;
      case 'rey':
      case 'rey-selva':
        this.probarReySelva();
        break;
      case 'isla':
      case 'isla-solitaria':
        this.probarIslaSolitaria();
        break;
      case 'pradera':
      case 'pradera-amor':
        this.probarPraderaAmor();
        break;
      case 'trio':
      case 'trio-frondoso':
        this.probarTrioFrondoso();
        break;
      case 'rio':
      case 'dinos-rio':
        this.probarDinosRio();
        break;
      case 'trex':
      case 'zona-trex':
        this.probarZonaTRex();
        break;
      default:
        console.log(`❌ Zona no reconocida: ${nombreZona}`);
        return;
    }
    
    this.mostrarResumenPruebas();
  }

  
  generarReporteDetallado() {
    return {
      fechaEjecucion: new Date().toISOString(),
      resumen: {
        total: this.resultadosPruebas.length,
        exitosas: this.resultadosPruebas.filter(p => p.exitosa).length,
        fallidas: this.resultadosPruebas.filter(p => !p.exitosa).length
      },
      pruebas: this.resultadosPruebas,
      configuracion: {
        navegador: navigator.userAgent,
        idioma: navigator.language,
        plataforma: navigator.platform
      }
    };
  }
}
window.PruebasRestricciones = PruebasRestricciones;
window.ejecutarPruebasRestricciones = function() {
  const pruebas = new PruebasRestricciones();
  return pruebas.ejecutarTodasLasPruebas();
};
window.probarZona = function(nombreZona) {
  const pruebas = new PruebasRestricciones();
  return pruebas.probarZonaEspecifica(nombreZona);
};

console.log('🧪 Sistema de pruebas de restricciones cargado.');
console.log('💡 Usa ejecutarPruebasRestricciones() para ejecutar todas las pruebas.');
console.log('💡 Usa probarZona("nombreZona") para probar una zona específica.');