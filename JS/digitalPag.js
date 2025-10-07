// Variables globales simples
let dinoSeleccionado = null;
let rondaActual = 1;
let numeroBots = 2;
let restriccionActual = null;
let tableroEstado = {
  casillas: {},
  dinosaurios: []
};


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
    alert('Dado: Bosque\n\nSolo puedes colocar en recintos del área Bosque');
  } else if (caraAleatoria === 'llanura') {
    zonasPermitidas = ['prado-diferencia', 'pradera-amor', 'isla-solitaria'];
    alert('Dado: Llanura\n\nSolo puedes colocar en recintos del área Llanura');
  } else if (caraAleatoria === 'banos') {
    zonasPermitidas = ['rey-selva', 'prado-diferencia', 'isla-solitaria'];
    alert('Dado: Baños\n\nSolo puedes colocar en recintos a la DERECHA del río');
  } else if (caraAleatoria === 'cafeteria') {
    zonasPermitidas = ['bosque-semejanza', 'trio-frondoso', 'pradera-amor'];
    alert('Dado: Cafetería\n\nSolo puedes colocar en recintos a la IZQUIERDA del río');
  } else if (caraAleatoria === 'recintoVacio') {
    // Para recinto vacío, necesito ver qué casillas están vacías
    zonasPermitidas = obtenerZonasVacias();
    if (zonasPermitidas.length === 0) {
      alert('Dado: Recinto Vacío\n\n¡No hay recintos vacíos! Puedes colocar donde quieras.');
      zonasPermitidas = ['bosque-semejanza', 'prado-diferencia', 'trio-frondoso', 
                         'pradera-amor', 'isla-solitaria', 'rey-selva', 'dinos-rio'];
    } else {
      alert('Dado: Recinto Vacío\n\nSolo puedes colocar en recintos SIN dinosaurios');
    }
  }
  
  // Aplicar el efecto visual
  aplicarRestriccionesVisuales(zonasPermitidas, caraAleatoria);
}

function aplicarRestriccionesVisuales(zonasPermitidas, caraDado) {
  // Quitar cualquier restricción anterior
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
  
  // Guardar la restricción actual para validar después
  restriccionActual = {
    zonasPermitidas: zonasPermitidas,
    caraDado: caraDado
  };
  
  console.log('Restricción aplicada:', restriccionActual);
}


function seleccionarDino(numeroDino) {
  // Quitar selección anterior
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

function colocarDino(numeroCasilla) {
  if (!dinoSeleccionado) {
    alert('Por favor selecciona un dinosaurio primero');
    return;
  }


  if (restriccionActual) {
    const zona = obtenerZonaDeCasilla(numeroCasilla);
    if (!restriccionActual.zonasPermitidas.includes(zona)) {
      let mensajeRestriccion = '';
      if (restriccionActual.caraDado === 'bosque') {
        mensajeRestriccion = 'Solo área Bosque';
      } else if (restriccionActual.caraDado === 'llanura') {
        mensajeRestriccion = 'Solo área Llanura';
      } else if (restriccionActual.caraDado === 'banos') {
        mensajeRestriccion = 'Solo derecha del río';
      } else if (restriccionActual.caraDado === 'cafeteria') {
        mensajeRestriccion = 'Solo izquierda del río';
      } else if (restriccionActual.caraDado === 'recintoVacio') {
        mensajeRestriccion = 'Solo recintos vacíos';
      }
      
      alert(`No puedes colocar aquí\n\nRestricción del dado: ${mensajeRestriccion}`);
      return;
    }
  }

  const casilla = document.querySelector(`[data-casilla="${numeroCasilla}"]`);
  
  // Verificar si la casilla ya tiene un dinosaurio
  if (casilla.querySelector('img')) {
    alert('Esta casilla ya está ocupada');
    return;
  }

  // Crear imagen del dinosaurio
  const imgDino = document.createElement('img');
  imgDino.src = `Recursos/img/dino${dinoSeleccionado}.png`;
  imgDino.alt = `Dinosaurio ${dinoSeleccionado}`;
  imgDino.style.width = '100%';
  imgDino.style.height = '100%';
  imgDino.style.objectFit = 'contain';

  casilla.appendChild(imgDino);

  tableroEstado.casillas[numeroCasilla] = dinoSeleccionado;
  tableroEstado.dinosaurios.push({
    dino: dinoSeleccionado,
    casilla: numeroCasilla
  });

  document.querySelectorAll('.dinosaurio').forEach(dino => {
    dino.classList.remove('seleccionado');
  });
  dinoSeleccionado = null;

  console.log('Dinosaurio colocado en casilla', numeroCasilla);
  console.log('Estado actual:', tableroEstado);
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
      nombre: `Partida ${new Date().toLocaleString()}`,
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

// Exponer funciones principales en el scope global para que los onclick inline las encuentren
window.lanzarDado = lanzarDado;
window.seleccionarDino = seleccionarDino;
window.colocarDino = colocarDino;

window.addEventListener('DOMContentLoaded', function() {
  console.log('Iniciando Draftosaurus...');
  

  const urlParams = new URLSearchParams(window.location.search);
  let bots = parseInt(urlParams.get('bots')) || 2;
  bots = Math.max(2, Math.min(4, bots));
  
  numeroBots = bots;
  document.getElementById('numeroBots').textContent = bots;
  

  const botonExportar = document.getElementById('botonExportar');
  if (botonExportar) {
    botonExportar.addEventListener('click', exportarPartida);
  }
  
  console.log('Draftosaurus cargado - Sistema de restricciones activo');
  console.log('Jugando con', bots, 'bots');
});