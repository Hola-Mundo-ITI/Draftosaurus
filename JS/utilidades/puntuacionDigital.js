let panelPuntosAbierto = false;

window.addEventListener('DOMContentLoaded', function() {
    crearBotonPuntos();
    crearPanelPuntos();
});

function crearBotonPuntos() {
    const boton = document.createElement('button');
    boton.id = 'botonPuntos';
    boton.className = 'boton-puntos';
    boton.textContent = 'Ver Puntos';
    boton.onclick = togglePanelPuntos;
    
    document.body.appendChild(boton);
}

function crearPanelPuntos() {
    const panel = document.createElement('aside');
    panel.id = 'panelPuntos';
    panel.className = 'panel-puntos';
    
    panel.innerHTML = `
        <div class="panel-header">
            <h3>Puntuación</h3>
            <button onclick="togglePanelPuntos()" class="btn-cerrar">✕</button>
        </div>
        <div class="total-puntos">
            <strong>Total:</strong> 
            <span id="puntosTotal">0</span> pts
        </div>
        <div class="tabla-puntos">
            <table>
                <thead>
                    <tr>
                        <th>Zona</th>
                        <th>Dinos</th>
                        <th>Puntos</th>
                    </tr>
                </thead>
                <tbody id="tablaPuntosBody">
                    <tr>
                        <td>Bosque Semejanza</td>
                        <td id="cantidad-bosque">0</td>
                        <td id="puntos-bosque">0</td>
                    </tr>
                    <tr>
                        <td>Prado Diferencia</td>
                        <td id="cantidad-prado">0</td>
                        <td id="puntos-prado">0</td>
                    </tr>
                    <tr>
                        <td>Trío Frondoso</td>
                        <td id="cantidad-trio">0</td>
                        <td id="puntos-trio">0</td>
                    </tr>
                    <tr>
                        <td>Pradera Amor</td>
                        <td id="cantidad-pradera">0</td>
                        <td id="puntos-pradera">0</td>
                    </tr>
                    <tr>
                        <td>Isla Solitaria</td>
                        <td id="cantidad-isla">0</td>
                        <td id="puntos-isla">0</td>
                    </tr>
                    <tr>
                        <td>Rey Selva</td>
                        <td id="cantidad-rey">0</td>
                        <td id="puntos-rey">0</td>
                    </tr>
                    <tr>
                        <td>Dinos Río</td>
                        <td id="cantidad-rio">0</td>
                        <td id="puntos-rio">0</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'overlayPuntos';
    overlay.className = 'overlay-puntos';
    overlay.onclick = togglePanelPuntos;
    document.body.appendChild(overlay);
}

function togglePanelPuntos() {
    const panel = document.getElementById('panelPuntos');
    const overlay = document.getElementById('overlayPuntos');
    
    panelPuntosAbierto = !panelPuntosAbierto;
    
    if (panelPuntosAbierto) {
        panel.classList.add('abierto');
        overlay.classList.add('activo');
        actualizarPuntos(); // Actualizar al abrir
    } else {
        panel.classList.remove('abierto');
        overlay.classList.remove('activo');
    }
}

async function actualizarPuntos() {
    // Obtener el estado actual del tablero
    const estadoActual = obtenerEstadoTablero();
    
    try {
        const respuesta = await fetch('php/utilidades/puntuacionDigital.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tableroEstado: estadoActual
            })
        });
        
        const datos = await respuesta.json();
        
        if (datos.success) {
            mostrarPuntos(datos);
        } else {
            console.error('Error al calcular puntos:', datos.error);
        }
        
    } catch (error) {
        console.error('Error al actualizar puntos:', error);
    }
}

function obtenerEstadoTablero() {
    const casillas = {};
    
    // Recorrer todas las casillas del tablero
    document.querySelectorAll('.casillero-item').forEach(casilla => {
        const casillaId = casilla.getAttribute('data-casilla');
        const imagen = casilla.querySelector('img');
        
        if (imagen) {
            // Extraer el número del dinosaurio de la imagen
            let especie = null;
            let match = imagen.src.match(/dino(\d+)/i);
            if (match) {
                especie = parseInt(match[1], 10);
            }
            
            if (especie) {
                casillas[casillaId] = especie;
            }
        }
    });
    
    return { casillas: casillas };
}

function mostrarPuntos(datos) {
    document.getElementById('puntosTotal').textContent = datos.totalScore;
    
    // Actualizar cada zona
    const detalles = datos.detalles;
    
    document.getElementById('cantidad-bosque').textContent = detalles['bosque-semejanza'].cantidad;
    document.getElementById('puntos-bosque').textContent = detalles['bosque-semejanza'].puntos;
    
    document.getElementById('cantidad-prado').textContent = detalles['prado-diferencia'].cantidad;
    document.getElementById('puntos-prado').textContent = detalles['prado-diferencia'].puntos;
    
    document.getElementById('cantidad-trio').textContent = detalles['trio-frondoso'].cantidad;
    document.getElementById('puntos-trio').textContent = detalles['trio-frondoso'].puntos;
    
    document.getElementById('cantidad-pradera').textContent = detalles['pradera-amor'].cantidad;
    document.getElementById('puntos-pradera').textContent = detalles['pradera-amor'].puntos;
    
    document.getElementById('cantidad-isla').textContent = detalles['isla-solitaria'].cantidad;
    document.getElementById('puntos-isla').textContent = detalles['isla-solitaria'].puntos;
    
    document.getElementById('cantidad-rey').textContent = detalles['rey-selva'].cantidad;
    document.getElementById('puntos-rey').textContent = detalles['rey-selva'].puntos;
    
    document.getElementById('cantidad-rio').textContent = detalles['dinos-rio'].cantidad;
    document.getElementById('puntos-rio').textContent = detalles['dinos-rio'].puntos;
}
//funcion global para poder llamar desde digitalPag.js
window.actualizarPuntos = actualizarPuntos;
window.togglePanelPuntos = togglePanelPuntos;

const estilos = document.createElement('style');
estilos.textContent = `
.boton-puntos {
    position: fixed;
    top: 70px;
    right: 10px;
    background-color: #FFD490;
    color: #552A0A;
    border: 2px solid #552A0A;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: bold;
    border-radius: 5px;
    z-index: 1200;
    transition: background-color 0.3s;
}

.boton-puntos:hover {
    background-color: #e6bf82;
}

.panel-puntos {
    position: fixed;
    top: 0;
    right: -350px;
    width: 350px;
    height: 100%;
    background-color: #FFD490;
    padding: 20px;
    z-index: 1100;
    transition: right 0.3s;
    overflow-y: auto;
    box-shadow: -2px 0 10px rgba(0,0,0,0.3);
}

.panel-puntos.abierto {
    right: 0;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #552A0A;
}

.panel-header h3 {
    color: #552A0A;
    margin: 0;
}

.btn-cerrar {
    background: none;
    border: none;
    font-size: 24px;
    color: #552A0A;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
}

.total-puntos {
    background-color: #552A0A;
    color: #FFD490;
    padding: 15px;
    border-radius: 5px;
    text-align: center;
    font-size: 1.3em;
    margin-bottom: 20px;
}

.total-puntos span {
    font-size: 1.5em;
    font-weight: bold;
}

.tabla-puntos {
    background-color: white;
    border-radius: 5px;
    padding: 10px;
}

.tabla-puntos table {
    width: 100%;
    border-collapse: collapse;
}

.tabla-puntos th {
    background-color: #552A0A;
    color: #FFD490;
    padding: 8px;
    text-align: left;
    border: 1px solid #333;
}

.tabla-puntos td {
    padding: 8px;
    border: 1px solid #ddd;
    color: #333;
}

.tabla-puntos tr:nth-child(even) {
    background-color: #f9f9f9;
}

.overlay-puntos {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: none;
}

.overlay-puntos.activo {
    display: block;
}
`;
document.head.appendChild(estilos);