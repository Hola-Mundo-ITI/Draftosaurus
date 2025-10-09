// Variables globales simples
let dinoSeleccionado = null;
let rondaActual = 1;
let numeroBots = 2;
let restriccionActual = null;
let tableroEstado = {
  casillas: {},
  dinosaurios: []
};

function mostrarDebugServidor(respuesta) {
  try {
    console.group('[SERVIDOR DEBUG]');
    console.log('Respuesta completa:', respuesta);
    
    if (respuesta.debug) {
      console.log('Info debug:', respuesta.debug);
    }
    if (respuesta.reason) {
      console.log('Razon:', respuesta.reason);
    }
    if (respuesta.error) {
      console.log('Error:', respuesta.error);
    }
    
    console.groupEnd();
  } catch (error) {
    console.error('Error mostrando debug:', error);
  }
}

function obtenerZonaDeCasilla(casillaId) {
  if (casillaId.startsWith('1-')) return 'bosque-semejanza';
  if (casillaId.startsWith('6-')) return 'prado-diferencia';
  if (casillaId.startsWith('4-')) return 'trio-frondoso';
  if (casillaId.startsWith('7-')) return 'pradera-amor';
  if (casillaId === '9-1') return 'isla-solitaria';
  if (casillaId === '3-1') return 'rey-selva';
  if (casillaId.startsWith('8-')) return 'dinos-rio';
  return 'desconocida';
}

function obtenerZonasVacias() {
  const zonasVacias = [];
  const todasZonas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 
                      'pradera-amor', 'isla-solitaria', 'rey-selva', 'dinos-rio'];
  
  todasZonas.forEach(zona => {
    let zonaVacia = true;
    
    document.querySelectorAll('.casillero-item').forEach(casilla => {
      const casillaId = casilla.getAttribute('data-casilla');
      if (obtenerZonaDeCasilla(casillaId) === zona) {
        if (casilla.querySelector('img')) {
          zonaVacia = false;
        }
      }
    });
    
    if (zonaVacia) {
      zonasVacias.push(zona);
    }
  });
  
  return zonasVacias;
}

function lanzarDado() {
  const caras = ['bosque', 'llanura', 'banos', 'cafeteria', 'recintoVacio'];
  const caraAleatoria = caras[Math.floor(Math.random() * caras.length)];
  
  let zonasPermitidas = [];
  
  if (caraAleatoria === 'bosque') {
    zonasPermitidas = ['bosque-semejanza', 'rey-selva', 'trio-frondoso'];
    alert('Dado: Bosque\n\nSolo puedes colocar en recintos del area Bosque');
  } else if (caraAleatoria === 'llanura') {
    zonasPermitidas = ['prado-diferencia', 'pradera-amor', 'isla-solitaria'];
    alert('Dado: Llanura\n\nSolo puedes colocar en recintos del area Llanura');
  } else if (caraAleatoria === 'banos') {
    zonasPermitidas = ['rey-selva', 'prado-diferencia', 'isla-solitaria'];
    alert('Dado: Banos\n\nSolo puedes colocar en recintos a la DERECHA del rio');
  } else if (caraAleatoria === 'cafeteria') {
    zonasPermitidas = ['bosque-semejanza', 'trio-frondoso', 'pradera-amor'];
    alert('Dado: Cafeteria\n\nSolo puedes colocar en recintos a la IZQUIERDA del rio');
  } else if (caraAleatoria === 'recintoVacio') {
    zonasPermitidas = obtenerZonasVacias();
    if (zonasPermitidas.length === 0) {
      alert('Dado: Recinto Vacio\n\nNo hay recintos vacios! Puedes colocar donde quieras.');
      zonasPermitidas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 
                         'pradera-amor', 'isla-solitaria', 'rey-selva', 'dinos-rio'];
    } else {
      alert('Dado: Recinto Vacio\n\nSolo puedes colocar en recintos SIN dinosaurios');
    }
  }
  
  aplicarRestriccionesVisuales(zonasPermitidas, caraAleatoria);
}

function aplicarRestriccionesVisuales(zonasPermitidas, caraDado) {
  // Quitar restricciones anteriores
  document.querySelectorAll('.casillero-item').forEach(casilla => {
    casilla.classList.remove('restringido', 'permitido');
  });
  
  // Aplicar nuevas restricciones
  document.querySelectorAll('.casillero-item').forEach(casilla => {
    const casillaId = casilla.getAttribute('data-casilla');
    const zona = obtenerZonaDeCasilla(casillaId);
    
    if (zonasPermitidas.includes(zona)) {
      casilla.classList.add('permitido');
    } else {
      casilla.classList.add('restringido');
    }
  });
  
  restriccionActual = {
    zonasPermitidas: zonasPermitidas,
    caraDado: caraDado
  };
  
  console.log('Restriccion aplicada:', restriccionActual);
}

function seleccionarDino(numeroDino) {
  // Quitar seleccion anterior
  document.querySelectorAll('.dinosaurio').forEach(dino => {
    dino.classList.remove('seleccionado');
  });

  // Seleccionar el nuevo
  const dinoElemento = document.querySelector(`[data-dino="${numeroDino}"]`);
  if (dinoElemento) {
    dinoElemento.classList.add('seleccionado');
    dinoSeleccionado = numeroDino;
    console.log('Dinosaurio seleccionado:', numeroDino);
  }
}

async function colocarDino(numeroCasilla) {
  console.log('=== INICIO colocarDino ===');
  console.log('Casilla objetivo:', numeroCasilla);
  console.log('Dino seleccionado:', dinoSeleccionado);
  
  if (!dinoSeleccionado) {
    alert('Por favor selecciona un dinosaurio primero');
    return;
  }

  // Verificar restriccion del dado
  if (restriccionActual) {
    const zona = obtenerZonaDeCasilla(numeroCasilla);
    console.log('Zona de la casilla:', zona);
    console.log('Zonas permitidas:', restriccionActual.zonasPermitidas);
    
    if (!restriccionActual.zonasPermitidas.includes(zona)) {
      let mensajeRestriccion = '';
      if (restriccionActual.caraDado === 'bosque') {
        mensajeRestriccion = 'Solo area Bosque';
      } else if (restriccionActual.caraDado === 'llanura') {
        mensajeRestriccion = 'Solo area Llanura';
      } else if (restriccionActual.caraDado === 'banos') {
        mensajeRestriccion = 'Solo derecha del rio';
      } else if (restriccionActual.caraDado === 'cafeteria') {
        mensajeRestriccion = 'Solo izquierda del rio';
      } else if (restriccionActual.caraDado === 'recintoVacio') {
        mensajeRestriccion = 'Solo recintos vacios';
      }

      alert('No puedes colocar aqui\n\nRestriccion del dado: ' + mensajeRestriccion);
      return;
    }
  }

  const casilla = document.querySelector(`[data-casilla="${numeroCasilla}"]`);
  if (!casilla) {
    console.error('Casilla no encontrada:', numeroCasilla);
    alert('Casilla no encontrada en el DOM');
    return;
  }

  if (casilla.querySelector('img')) {
    console.log('Casilla ocupada');
    alert('Esta casilla ya esta ocupada');
    return;
  }

  // VALIDACION EN SERVIDOR
  try {
    console.log('--- Preparando datos del tablero ---');
     
    const estadoActual = { casillas: {} };
    document.querySelectorAll('.casillero-item').forEach(casillaItem => {
      const idCasilla = casillaItem.getAttribute('data-casilla');
      const imagen = casillaItem.querySelector('img');
      if (imagen) {
        let especie = null;
        let match = imagen.src.match(/dino(\d+)(?:\.png|\.jpg|\.jpeg)?$/i);
        if (match) {
          especie = parseInt(match[1], 10);
        }
        if (!especie && imagen.alt) {
          let match2 = imagen.alt.match(/(\d+)/);
          if (match2) {
            especie = parseInt(match2[1], 10);
          }
        }
        if (especie) {
          estadoActual.casillas[idCasilla] = especie;
        }
      }
    });

    console.log('Estado del tablero creado:', estadoActual);

    const datosParaEnviar = {
      casillaId: numeroCasilla,
      species: dinoSeleccionado,
      tableroEstado: estadoActual,
      restriccionActiva: restriccionActual
    };

    console.log('Enviando al servidor:', datosParaEnviar);

    // CAMBIO IMPORTANTE AQUI: Ruta correcta al archivo PHP
    const respuesta = await fetch('php/utilidades/validarMovimiento.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosParaEnviar)
    });

    console.log('Respuesta recibida. Status:', respuesta.status, respuesta.statusText);

    // Primero leer como texto para ver que llega
    const textoRespuesta = await respuesta.text();
    console.log('Texto de respuesta:', textoRespuesta);

    // Intentar convertir a JSON
    let datos;
    try {
      datos = JSON.parse(textoRespuesta);
      console.log('JSON parseado:', datos);
      mostrarDebugServidor(datos);
    } catch (errorParseo) {
      console.error('ERROR: El servidor no devolvio JSON valido');
      console.error('Error de parseo:', errorParseo);
      console.error('Respuesta recibida:', textoRespuesta);
      alert('Error: El servidor no respondio correctamente.\n\nRevisa la consola del navegador.');
      return;
    }

    // Verificar si el movimiento es valido
    if (!datos.valid) {
      console.log('Movimiento rechazado');
      console.log('Razon:', datos.reason);
      alert('Movimiento invalido:\n' + (datos.reason || 'Restriccion del servidor'));
      return;
    }

    console.log('Movimiento aprobado - Colocando dinosaurio');
    
    // Crear la imagen del dinosaurio
    const imagenDino = document.createElement('img');
    imagenDino.src = `Recursos/img/dino${dinoSeleccionado}.png`;
    imagenDino.alt = `Dinosaurio ${dinoSeleccionado}`;
    imagenDino.style.width = '100%';
    imagenDino.style.height = '100%';
    imagenDino.style.objectFit = 'contain';

    // Colocar en la casilla
    casilla.appendChild(imagenDino);

    // Actualizar el estado del tablero
    tableroEstado.casillas[numeroCasilla] = dinoSeleccionado;
    tableroEstado.dinosaurios.push({
      dino: dinoSeleccionado,
      casilla: numeroCasilla
    });

    // Quitar seleccion
    document.querySelectorAll('.dinosaurio').forEach(dino => {
      dino.classList.remove('seleccionado');
    });
    dinoSeleccionado = null;

    console.log('Dinosaurio colocado en:', numeroCasilla);
    console.log('Estado actualizado:', tableroEstado);

  } catch (error) {
    console.error('ERROR COMPLETO:');
    console.error('Tipo:', error.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    alert('Error al comunicarse con el servidor.\n\n' + 
          'Error: ' + error.message + '\n\n' +
          'Revisa la consola para mas detalles.');
    return;
  }
  
  console.log('=== FIN colocarDino ===');
}

function exportarPartida() {
  const boton = document.getElementById('botonExportar');
  
  fetch('backend/guardar_partida.php', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      nombre: 'Partida ' + new Date().toLocaleString(),
      bots_count: numeroBots,
      gameState: tableroEstado
    })
  })
  .then(respuesta => respuesta.json())
  .then(resultado => {
    if (resultado.success) {
      alert('Partida guardada correctamente');
    } else {
      alert('Error al guardar: ' + (resultado.error || 'Desconocido'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('No se pudo guardar la partida');
  });
}

// Hacer las funciones globales
window.lanzarDado = lanzarDado;
window.seleccionarDino = seleccionarDino;
window.colocarDino = colocarDino;

// Inicializar cuando cargue la pagina
window.addEventListener('DOMContentLoaded', function() {
  console.log('Iniciando Draftosaurus...');
  
  const parametrosUrl = new URLSearchParams(window.location.search);
  let cantidadBots = parseInt(parametrosUrl.get('bots')) || 2;
  cantidadBots = Math.max(2, Math.min(4, cantidadBots));
  
  numeroBots = cantidadBots;
  document.getElementById('numeroBots').textContent = cantidadBots;
  
  const botonExportar = document.getElementById('botonExportar');
  if (botonExportar) {
    botonExportar.addEventListener('click', exportarPartida);
  }
  
  console.log('Draftosaurus cargado - Sistema de restricciones activo');
  console.log('Jugando con', cantidadBots, 'bots');
});