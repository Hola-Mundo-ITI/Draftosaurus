let jugadores = [];
let turnoActual = 1;
window.rondaActual = window.rondaActual || 1;
let dadoLanzado = false;
let dinoColocado = false;

window.traducciones = window.traducciones || {};

async function cargarTraduccionesMulti() {
    try {
        const respuesta = await fetch('negocio/utilidades/idioma/obtenerTraduccion.php');
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

async function verificarPartidaEnCurso() {
    const jugadoresGuardados = localStorage.getItem('jugadoresPartida');
    
    if (!jugadoresGuardados) {
        alert('No hay partida en curso. Redirigiendo');
        window.location.href = 'seleccionarJugador.php';
        return false;
    }
    
    return true;
}

async function inicializarMultijugador() {
    await cargarTraduccionesMulti();
    
    const jugadoresGuardados = localStorage.getItem('jugadoresPartida');
  
    if (!jugadoresGuardados) {
        alert(t('no_jugadores'));
        window.location.href = 'seleccionarJugador.php';
        return;
    }
  
    jugadores = JSON.parse(jugadoresGuardados);
  
    const respuesta = await fetch('negocio/partida/procesarMulti.php', {
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
        configurarBotonTerminarPartida();
    } else {
        alert('Error al inicializar partida: ' + resultado.error);
    }
}

async function cargarTableroJugadorActual() {
    const jugadorActivo = jugadores.find(j => j.id === turnoActual);
    if (!jugadorActivo) return;
  
    const respuesta = await fetch('negocio/partida/procesarMulti.php', {
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
  
    fetch('negocio/partida/procesarMulti.php', {
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

function configurarBotonTerminarPartida() {
    const boton = document.getElementById('botonTerminarPartida');
    
    if (boton) {
        boton.addEventListener('click', async function() {
            const confirmacion = confirm('Estas seguro de que quieres terminar la partida ahora?');
            
            if (confirmacion) {
                guardarTableroJugadorActual();
                await finalizarPartidaForzada();
            }
        });
    }
}

function jugadorSinDinosDisponibles() {
    let dinosUsados = 0;
    for (let i = 1; i <= 6; i++) {
        if (window.dinosUsados[i] === true) {
            dinosUsados++;
        }
    }
    return dinosUsados >= 6;
}

async function verificarSiTodosTerminaron() {
    for (let jugador of jugadores) {
        const respuesta = await fetch('negocio/partida/procesarMulti.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accion: 'cargar_tablero',
                jugadorId: jugador.id
            })
        });
        
        const resultado = await respuesta.json();
        
        if (resultado.success) {
            const tablero = resultado.tablero;
            let dinosColocados = 0;
            
            if (tablero.casillas) {
                dinosColocados = Object.keys(tablero.casillas).length;
            }
            
            if (dinosColocados < 6) {
                return false;
            }
        }
    }
    
    return true;
}

async function pasarTurno() {
    dadoLanzado = false;
    dinoColocado = false;
  
    if (jugadorSinDinosDisponibles()) {
        alert('Ya usaste todos tus dinosaurios. Fin de tu turno.');
        guardarTableroJugadorActual();
        
        const todosTerminaron = await verificarSiTodosTerminaron();
        if (todosTerminaron) {
            finalizarPartida();
            return;
        }
    }
  
    guardarTableroJugadorActual();
  
    const respuesta = await fetch('negocio/partida/procesarMulti.php', {
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
    const respuesta = await fetch('negocio/partida/procesarMulti.php', {
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

async function finalizarPartidaForzada() {
    const puntosJugadores = [];
    
    for (let jugador of jugadores) {
        const respTablero = await fetch('negocio/partida/procesarMulti.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accion: 'cargar_tablero',
                jugadorId: jugador.id
            })
        });
        
        const datosTablero = await respTablero.json();
        
        const respPuntos = await fetch('negocio/puntuacion/puntosDigital.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tableroEstado: datosTablero.tablero
            })
        });
        
        const datosPuntos = await respPuntos.json();
        
        puntosJugadores.push({
            nombre: jugador.nombre,
            puntos: datosPuntos.totalScore || 0
        });
    }
    
    puntosJugadores.sort((a, b) => b.puntos - a.puntos);
    
    mostrarPantallaResultados(puntosJugadores);
}

async function finalizarPartida() {
    const respuesta = await fetch('negocio/partida/procesarMulti.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            accion: 'finalizar_partida'
        })
    });
  
    const resultado = await respuesta.json();
  
    if (resultado.success) {
        const puntosJugadores = [];
        
        for (let jugador of jugadores) {
            const respTablero = await fetch('negocio/partida/procesarMulti.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accion: 'cargar_tablero',
                    jugadorId: jugador.id
                })
            });
            
            const datosTablero = await respTablero.json();
            
            const respPuntos = await fetch('negocio/puntuacion/puntosDigital.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableroEstado: datosTablero.tablero
                })
            });
            
            const datosPuntos = await respPuntos.json();
            
            puntosJugadores.push({
                nombre: jugador.nombre,
                puntos: datosPuntos.totalScore || 0
            });
        }
        
        puntosJugadores.sort((a, b) => b.puntos - a.puntos);
        
        mostrarPantallaResultados(puntosJugadores);
    }
}

function mostrarPantallaResultados(puntosJugadores) {
    // aca se genera la pantalla
    let html = '<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(30, 30, 30, 0.95) 50%, rgba(0, 0, 0, 0.9) 100%); display: flex; justify-content: center; align-items: center; z-index: 9999;">';
    html += '<div style="background: #FFD490; padding: 40px; border-radius: 15px; max-width: 600px; width: 90%; text-align: center; border: 4px solid #552A0A; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">';
    html += '<h2 style="color: #552A0A; margin-bottom: 10px; font-size: 2.2em; font-weight: bold;">PARTIDA FINALIZADA</h2>';
    html += '<h3 style="color: #764826; margin-bottom: 30px; font-size: 1.3em;">Resultados Finales</h3>';
    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">';
    html += '<thead><tr style="background: #552A0A;"><th style="padding: 12px; border: 2px solid #552A0A; color: #FFD490; font-size: 1.1em;">Posicion</th><th style="padding: 12px; border: 2px solid #552A0A; color: #FFD490; font-size: 1.1em;">Jugador</th><th style="padding: 12px; border: 2px solid #552A0A; color: #FFD490; font-size: 1.1em;">Puntos</th></tr></thead>';
    html += '<tbody>';
    
    puntosJugadores.forEach((jugador, index) => {
        let bgColor = '#FFF';
        let textColor = '#552A0A';
        let medalText = '';
        
        if (index === 0) {
            bgColor = '#FFD700';
            medalText = '1er';
        } else if (index === 1) {
            bgColor = '#C0C0C0';
            medalText = '2do';
        } else if (index === 2) {
            bgColor = '#CD7F32';
            medalText = '3ro';
        }
        
        html += `<tr style="background: ${bgColor};">`;
        html += `<td style="padding: 12px; border: 2px solid #552A0A; color: ${textColor}; font-weight: bold; font-size: 1.2em;">${medalText || (index + 1)}</td>`;
        html += `<td style="padding: 12px; border: 2px solid #552A0A; color: ${textColor}; font-weight: bold; font-size: 1.1em;">${jugador.nombre}</td>`;
        html += `<td style="padding: 12px; border: 2px solid #552A0A; color: ${textColor}; font-weight: bold; font-size: 1.2em;">${jugador.puntos}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '<button onclick="reiniciarPartida()" style="background: #552A0A; color: #FFD490; border: 2px solid #764826; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 1.2em; font-weight: bold; transition: all 0.3s;">Nueva Partida</button>';
    html += '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function reiniciarPartida() {
    localStorage.removeItem('jugadoresPartida');
    window.location.href = 'seleccionarJugador.php';
}

function marcarDadoLanzado() {
    dadoLanzado = true;
}

function marcarDinoColocado() {
    dinoColocado = true;
}

document.addEventListener('DOMContentLoaded', async function() {
    const hayPartida = await verificarPartidaEnCurso();
    
    if (!hayPartida) {
        return;
    }
    
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