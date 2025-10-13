let jugadores = [];
let turnoActual = 1;
window.rondaActual = window.rondaActual || 1;
let dadoLanzado = false;
let dinoColocado = false;

async function inicializarMultijugador() {
  const jugadoresGuardados = localStorage.getItem('jugadoresPartida');
  
  if (!jugadoresGuardados) {
    alert('No hay jugadores configurados. Redirigiendo...');
    window.location.href = 'seleccionarJugadores.php';
    return;
  }
  
  jugadores = JSON.parse(jugadoresGuardados);
  
  const respuesta = await fetch('php/procesamiento/procesarMulti.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'inicializar',
      jugadores: jugadores
    })
  });
  
  const resultado = await respuesta.json();
  
  if (resultado.success) {
    turnoActual = resultado.estado.turnoActual;
    window.rondaActual = resultado.estado.rondaActual;
    
    await cargarTableroJugadorActual();
    actualizarInterfaz();
    configurarBotonPasarTurno();
  } else {
    alert('Error al inicializar partida: ' + resultado.error);
  }
}

async function cargarTableroJugadorActual() {
  const jugadorActivo = jugadores.find(j => j.id === turnoActual);
  if (!jugadorActivo) return;
  
  const respuesta = await fetch('php/procesamiento/procesarMulti.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'cargar_tablero',
      jugadorId: jugadorActivo.id
    })
  });
  
  const resultado = await respuesta.json();
  
  if (resultado.success) {
    limpiarTablero();
    restaurarTablero(resultado.tablero);
  }
}

function limpiarTablero() {
  const casilleros = document.querySelectorAll('.casillero-item');
  casilleros.forEach(casillero => {
    casillero.innerHTML = '';
    casillero.classList.remove('ocupada');
  });
}

function restaurarTablero(tablero) {
  if (!tablero.casillas) return;
  
  Object.keys(tablero.casillas).forEach(casillaId => {
    const especie = tablero.casillas[casillaId];
    const casillero = document.querySelector(`[data-casilla="${casillaId}"]`);
    
    if (casillero) {
      const img = document.createElement('img');
      img.src = `Recursos/img/dino${especie}.png`;
      img.alt = `Dino ${especie}`;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      
      casillero.innerHTML = '';
      casillero.appendChild(img);
      casillero.classList.add('ocupada');
    }
  });
}

function guardarTableroJugadorActual() {
  const jugadorActivo = jugadores.find(j => j.id === turnoActual);
  if (!jugadorActivo) return;
  
  const tablero = {
    casillas: {}
  };
  
  const casilleros = document.querySelectorAll('.casillero-item.ocupada');
  casilleros.forEach(casillero => {
    const casillaId = casillero.getAttribute('data-casilla');
    const img = casillero.querySelector('img');
    
    if (img) {
      const src = img.src;
      const match = src.match(/dino(\d+)\.png/);
      if (match) {
        tablero.casillas[casillaId] = parseInt(match[1]);
      }
    }
  });
  
  fetch('php/procesamiento/procesarMulti.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'guardar_tablero',
      jugadorId: jugadorActivo.id,
      tablero: tablero
    })
  });
}

function actualizarInterfaz() {
  const jugadorActivo = jugadores.find(j => j.id === turnoActual);
  if (jugadorActivo) {
    document.getElementById('nombreJugadorActual').textContent = jugadorActivo.nombre;
  }
  
  document.getElementById('numRonda').textContent = window.rondaActual;
}

function configurarBotonPasarTurno() {
  const boton = document.getElementById('botonPasarTurno');
  
  boton.addEventListener('click', async function() {
    if (!dadoLanzado) {
      alert('Debes lanzar el dado antes de pasar turno');
      return;
    }
    
    if (!dinoColocado) {
      alert('Debes colocar un dinosaurio antes de pasar turno');
      return;
    }
    
    guardarTableroJugadorActual();
    await pasarTurno();
  });
}

async function pasarTurno() {
  dadoLanzado = false;
  dinoColocado = false;
  
  const respuesta = await fetch('php/procesamiento/procesarMulti.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'siguiente_turno'
    })
  });
  
  const resultado = await respuesta.json();
  
  if (!resultado.success) {
    alert('Error al pasar turno: ' + resultado.error);
    return;
  }
  
  if (resultado.partidaFinalizada) {
    finalizarPartida();
    return;
  }
  
  turnoActual = resultado.turnoActual;
  window.rondaActual = resultado.rondaActual;
  
  await cargarTableroJugadorActual();
  actualizarInterfaz();
  
  alert(`Turno de ${resultado.jugadorActual.nombre}`);
}

async function finalizarPartida() {
  const respuesta = await fetch('php/procesamiento/procesarMulti.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accion: 'finalizar_partida'
    })
  });
  
  const resultado = await respuesta.json();
  
  if (resultado.success) {
    alert('Partida finalizada Mostrando resultados');
    mostrarResultadosFinales(resultado.resultados);
  }
}

function mostrarResultadosFinales(resultados) {
  let texto = 'RESULTADOS FINALES:\n\n';
  
  resultados.forEach(res => {
    texto += `${res.jugador}: Puntos por calcular\n`;
  });
  
  alert(texto);
  
  if (confirm('Quieres iniciar una nueva partida?')) {
    localStorage.removeItem('jugadoresPartida');
    window.location.href = 'seleccionarJugadores.php';
  }
}

function marcarDadoLanzado() {
  dadoLanzado = true;
}

function marcarDinoColocado() {
  dinoColocado = true;
}

document.addEventListener('DOMContentLoaded', function() {
  inicializarMultijugador();
  
  const dadoOriginal = window.lanzarDado;
  if (dadoOriginal) {
    window.lanzarDado = function() {
      dadoOriginal();
      marcarDadoLanzado();
    };
  }
  
  const colocarOriginal = window.colocarDino;
  if (colocarOriginal) {
    window.colocarDino = function(casillaId) {
      const resultado = colocarOriginal(casillaId);
      if (resultado !== false) {
        marcarDinoColocado();
      }
      return resultado;
    };
  }
});