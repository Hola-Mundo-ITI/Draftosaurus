# Sistema de Dados y Restricciones

## Arquitectura del Sistema

El sistema de dados está compuesto por tres componentes principales:
- **ManejadorDado**: Controla el estado y lógica del dado
- **RestriccionesActivas**: Maneja restricciones temporales del dado
- **RestriccionesPasivas**: Maneja reglas permanentes de cada zona

## ManejadorDado

### Inicialización
```javascript
class ManejadorDado {
  constructor() {
    this.estadoActual = null;
    this.rondaActual = 1;
    this.numeroJugadores = 2;
    this.areasTablero = this.definirAreasTablero();
    this.reglasDado = this.definirReglasDado();
    this.historialDados = [];
  }
}
```

### Definición de Áreas del Tablero
```javascript
definirAreasTablero() {
  return {
    bosque: ['trio-frondoso', 'bosque-semejanza', 'rey-selva'],
    llanura: ['prado-diferencia', 'isla-solitaria', 'pradera-amor'],
    derechaDeLRio: ['rey-selva', 'isla-solitaria', 'pradera-amor', 'dinos-rio'],
    izquierdaDelRio: ['trio-frondoso', 'bosque-semejanza', 'prado-diferencia']
  };
}
```

### Caras del Dado
El dado tiene 5 caras con diferentes restricciones:

#### Bosque (🌲)
- **Restricción**: Solo recintos del área del Bosque
- **Zonas permitidas**: trio-frondoso, bosque-semejanza, rey-selva
- **Color**: #2d5a27

#### Llanura (🌾)
- **Restricción**: Solo recintos del área de la Llanura
- **Zonas permitidas**: prado-diferencia, isla-solitaria, pradera-amor
- **Color**: #8b7355

#### Baños (🚻)
- **Restricción**: Solo recintos a la derecha del Río
- **Zonas permitidas**: rey-selva, isla-solitaria, pradera-amor, dinos-rio
- **Color**: #4a90e2

#### Cafetería (☕)
- **Restricción**: Solo recintos a la izquierda del Río
- **Zonas permitidas**: trio-frondoso, bosque-semejanza, prado-diferencia
- **Color**: #d4a574

#### Recinto Vacío (🏗️)
- **Restricción**: Solo recintos que estén completamente vacíos
- **Zonas permitidas**: Dinámicas según estado del juego
- **Color**: #95a5a6

### Mecánica de Lanzamiento

#### Determinación del Jugador
```javascript
determinarJugadorQueLanza(numeroRonda, numeroJugadores) {
  return ((numeroRonda - 1) % numeroJugadores) + 1;
}
```
El jugador que lanza rota cada ronda: Ronda 1 → Jugador 1, Ronda 2 → Jugador 2, etc.

#### Lanzamiento Aleatorio
```javascript
lanzarDadoAleatorio() {
  const caras = ['bosque', 'llanura', 'banos', 'cafeteria', 'vacio'];
  return caras[Math.floor(Math.random() * caras.length)];
}
```

#### Estado del Dado
```javascript
this.estadoActual = {
  rondaActual: numeroRonda,
  caraActual: caraDelDado,
  jugadorQueLanzo: jugadorQueLanza,
  descripcionRestriccion: this.reglasDado[caraDelDado].descripcion,
  activo: true,
  fechaLanzamiento: new Date()
};
```

### Sistema de Exenciones
El jugador que lanza el dado está exento de sus restricciones:
```javascript
jugadorEstaExento(jugadorId) {
  return this.estadoActual && this.estadoActual.jugadorQueLanzo === jugadorId;
}
```

## RestriccionesActivas

### Propósito
Maneja las restricciones temporales que se aplican durante una ronda específica basadas en el resultado del dado.

### Mapeo de Áreas
```javascript
definirMapeoAreas() {
  return {
    bosque: ['bosque-semejanza', 'rey-selva', 'trio-frondoso'],
    llanura: ['prado-diferencia', 'pradera-amor', 'isla-solitaria']
  };
}
```

### Mapeo de Lados del Río
```javascript
definirMapeoLados() {
  return {
    izquierda: ['bosque-semejanza', 'prado-diferencia', 'rey-selva'],
    derecha: ['pradera-amor', 'trio-frondoso', 'isla-solitaria']
  };
}
```

### Filtrado de Recintos
```javascript
filtrarRecintosPorDado(caraActual, estadoTablero, jugadorId, jugadorQueLanzo) {
  if (jugadorId === jugadorQueLanzo) {
    return this.obtenerTodosLosRecintos();
  }
  
  const caraDado = this.carasDado[caraActual];
  
  switch (caraDado.tipo) {
    case 'area':
    case 'lado':
      return caraDado.recintos;
    case 'dinamico':
      return this.filtrarRecintosDinamicos(caraActual, estadoTablero);
  }
}
```

### Restricciones Dinámicas
Para la cara "Recinto Vacío":
```javascript
filtrarRecintosVacios(recintos, estadoTablero) {
  return recintos.filter(recinto => {
    const dinosauriosEnRecinto = estadoTablero[recinto] || [];
    return dinosauriosEnRecinto.length === 0;
  });
}
```

### Zona Comodín
El recinto "dinos-rio" siempre está disponible independientemente de las restricciones del dado.

## RestriccionesPasivas

### Propósito
Define las reglas permanentes de cada zona del tablero que siempre se aplican.

### Definición de Reglas por Zona

#### Bosque de la Semejanza
```javascript
'bosque-semejanza': {
  capacidad: 6,
  tipoEspecie: 'mismaEspecie',
  ordenamiento: 'secuencial',
  descripcion: 'Todos los dinosaurios deben ser del mismo tipo, colocados de izquierda a derecha'
}
```

#### Prado de la Diferencia
```javascript
'prado-diferencia': {
  capacidad: 6,
  tipoEspecie: 'especiesDiferentes',
  ordenamiento: 'secuencial',
  descripcion: 'Todas las especies deben ser diferentes, colocados de izquierda a derecha'
}
```

#### Pradera del Amor
```javascript
'pradera-amor': {
  capacidad: 6,
  tipoEspecie: 'cualquiera',
  ordenamiento: 'libre',
  descripcion: 'Cualquier especie, cualquier slot vacío'
}
```

#### Trío Frondoso
```javascript
'trio-frondoso': {
  capacidad: 3,
  tipoEspecie: 'cualquiera',
  ordenamiento: 'libre',
  descripcion: 'Máximo 3 dinosaurios, cualquier especie'
}
```

#### Rey de la Selva / Isla Solitaria
```javascript
'rey-selva': {
  capacidad: 1,
  tipoEspecie: 'cualquiera',
  ordenamiento: 'libre',
  descripcion: 'Solo un dinosaurio'
}
```

#### Dinosaurios en el Río
```javascript
'dinos-rio': {
  capacidad: 7,
  tipoEspecie: 'cualquiera',
  ordenamiento: 'secuencial',
  descripcion: 'Comodín - siempre disponible'
}
```

### Sistema de Validación

#### Validación de Capacidad
```javascript
validarCapacidad(dinosauriosEnZona, capacidadMaxima) {
  if (dinosauriosEnZona.length >= capacidadMaxima) {
    return { valido: false, razon: 'Recinto lleno' };
  }
  return { valido: true };
}
```

#### Validación de Especies

##### Misma Especie
```javascript
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
```

##### Especies Diferentes
```javascript
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
```

#### Validación de Ordenamiento

##### Ordenamiento Secuencial
```javascript
validarOrdenSecuencial(dinosauriosEnZona, slot) {
  const slotNumero = parseInt(slot);
  const slotEsperado = dinosauriosEnZona.length + 1;
  
  if (slotNumero !== slotEsperado) {
    return { 
      valido: false, 
      razon: `Debe colocar en el slot ${slotEsperado} (de izquierda a derecha)` 
    };
  }
  
  return { valido: true };
}
```

## Integración de Sistemas

### ValidadorRestricciones
Actúa como punto de entrada que coordina ambos tipos de restricciones:

```javascript
validarColocacion(zonaId, dinosauriosEnZona, dinosaurio, slot, jugadorId, estadoJuego) {
  const validacionActiva = this.validarRestriccionesActivas(
    zonaId, estadoJuego.tablero, jugadorId, estadoJuego
  );
  
  if (!validacionActiva.valido) {
    return validacionActiva;
  }
  const validacionPasiva = this.restriccionesPasivas.validarColocacion(
    zonaId, dinosauriosEnZona, dinosaurio, slot
  );
  
  return validacionPasiva;
}
```

### Orden de Aplicación
1. **Restricciones Activas**: Se evalúan primero (dado)
2. **Restricciones Pasivas**: Se evalúan después (zona)
3. **Ambas deben ser válidas** para permitir el movimiento

### Sistema de Eventos
```javascript
notificarCambioEstado() {
  const evento = new CustomEvent('dadoCambiado', {
    detail: {
      estado: this.estadoActual,
      info: this.obtenerInfoRestriccionActual()
    }
  });
  window.dispatchEvent(evento);
}
```

## Historial y Estadísticas

### Registro de Lanzamientos
```javascript
this.historialDados.push({
  ronda: numeroRonda,
  cara: caraDelDado,
  jugador: jugadorQueLanza,
  fecha: new Date()
});
```

### Estadísticas
```javascript
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
```

## Limitaciones y Consideraciones

### Estado del Juego
- Requiere acceso al estado global del juego para restricciones dinámicas
- Vulnerable a errores si el estado no está disponible

### Sincronización
- Los eventos deben dispararse en el orden correcto
- La finalización de ronda debe coordinarse con el avance de turnos

### Validación
- El sistema asume que los datos de entrada son válidos
- No implementa validación exhaustiva de tipos de datos