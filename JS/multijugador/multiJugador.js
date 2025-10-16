let jugadores = [];
let turnoActual = 1;
window.rondaActual = window.rondaActual || 1;
let dadoLanzado = false;
let dinoColocado = false;

// Variable global con traducciones
window.traducciones = window.traducciones || {};

async function cargarTraduccionesMulti() {
    try {
        const respuesta = await fetch('php/idioma/obtenerTraduccion.php');
        const datos = await respuesta.json();
        if (datos.success) {
            window.traducciones = datos.traducciones;
        }
    } catch (error) {
        console.error('Error cargando traducciones:', error);
    }
}

function t(clave) {
    return window.traducciones[clave] || clave;
}

async function inicializarMultijugador() {
    await cargarTraduccionesMulti();
    
    const jugadoresGuardados = localStorage.getItem('jugadoresPartida');
  
    if (!jugadoresGuardados) {
        alert(t('no_jugadores'));
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
    
        if (window.resetearDinosauriosDisponibles) {
            window.resetearDinosauriosDisponibles();
        }
    
        restaurarTablero(resultado.tablero);
    
        if (window.tableroEstado) {
            window.tableroEstado.casillas = resultado.tablero.casillas || {};
        }
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
  
    if (tablero.dinosUsados && window.dinosUsados) {
        window.dinosUsados = tablero.dinosUsados;
    
        for (let especie = 1; especie <= 6; especie++) {
            const dinoElemento = document.querySelector(`[data-dino="${especie}"]`);
            if (dinoElemento) {
                if (window.dinosUsados[especie]) {
                    dinoElemento.style.opacity = '0.3';
                    dinoElemento.style.pointerEvents = 'none';
                } else {
                    dinoElemento.style.opacity = '1';
                    dinoElemento.style.pointerEvents = 'auto';
                }
            }
        }
    }
}

function guardarTableroJugadorActual() {
    const jugadorActivo = jugadores.find(j => j.id === turnoActual);
    if (!jugadorActivo) return;
  
    const tablero = {
        casillas: {},
        dinosUsados: window.dinosUsados || {}
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
            alert(t('debe_lanzar_dado'));
            return;
        }
    
        if (!dinoColocado) {
            alert(t('debe_colocar_dino'));
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
  
    if (resultado.rondaCompletada) {
        await rotarMazos();
    }
  
    turnoActual = resultado.turnoActual;
    window.rondaActual = resultado.rondaActual;
  
    await cargarTableroJugadorActual();
    actualizarInterfaz();
  
    if (resultado.rondaCompletada) {
        alert(t('ronda_completada'));
    }
  
    alert(`${t('turno_de')} ${resultado.jugadorActual.nombre}`);
}

async function rotarMazos() {
    const respuesta = await fetch('php/procesamiento/procesarMulti.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accion: 'rotar_mazos'
        })
    });
  
    const resultado = await respuesta.json();
  
    if (!resultado.success) {
        console.error('Error al rotar mazos:', resultado.error);
    }
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
        alert(t('partida_finalizada'));
        mostrarResultadosFinales(resultado.resultados);
    }
}

function mostrarResultadosFinales(resultados) {
    let texto = 'RESULTADOS FINALES:\n\n';
  
    resultados.forEach(res => {
        texto += `${res.jugador}: Puntos por calcular\n`;
    });
  
    alert(texto);
  
    if (confirm(t('nueva_partida'))) {
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
        window.colocarDino = async function(casillaId) {
            await colocarOriginal(casillaId);
      
            const casilla = document.querySelector(`[data-casilla="${casillaId}"]`);
            if (casilla && casilla.querySelector('img')) {
                marcarDinoColocado();
            }
        };
    }
});