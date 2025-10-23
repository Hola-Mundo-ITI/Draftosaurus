let panelPuntosAbierto = false;

window.traducciones = window.traducciones || {};

window.addEventListener('DOMContentLoaded', function() {
    cargarTraducciones();
});

async function cargarTraducciones() {
    try {
        const respuesta = await fetch('negocio/utilidades/idioma/obtenerTraduccion.php');
        const datos = await respuesta.json();
        if (datos.success) {
            window.traducciones = datos.traducciones;
            crearBotonPuntos();
            crearPanelPuntos();
        }
    } catch (error) {
        console.error('Error cargando traducciones:', error);
        window.traducciones = {
            'ver_puntos': 'Ver Puntos',
            'puntuacion': 'Puntuacion',
            'total': 'Total:',
            'zona': 'Zona',
            'dinos': 'Dinos',
            'puntos': 'Puntos',
            'cerrar': 'Cerrar',
            'bosque_semejanza': 'Bosque Semejanza',
            'prado_diferencia': 'Prado Diferencia',
            'trio_frondoso': 'Trio Frondoso',
            'pradera_amor': 'Pradera Amor',
            'isla_solitaria': 'Isla Solitaria',
            'rey_selva': 'Rey Selva',
            'dinos_rio': 'Dinos Rio'
        };
        crearBotonPuntos();
        crearPanelPuntos();
    }
}

function t(clave) {
    return window.traducciones[clave] || clave;
}

function crearBotonPuntos() {
    const botonExportar = document.getElementById('botonExportar');
    
    if (botonExportar) {
        botonExportar.remove();
    }
    
    const headerDerecha = document.querySelector('.header-derecha');
    
    if (headerDerecha) {
        const boton = document.createElement('button');
        boton.id = 'botonPuntos';
        boton.className = 'boton-puntos';
        
        boton.innerHTML = `
            <span id="textoPuntos">0pts</span>
            <img src="Recursos/img/imgPts.png" alt="puntos" style="width: 20px; height: 20px; margin-left: 8px;">
        `;
        
        boton.onclick = togglePanelPuntos;
        
        headerDerecha.appendChild(boton);
    }
}

function crearPanelPuntos() {
    const panel = document.createElement('aside');
    panel.id = 'panelPuntos';
    panel.className = 'panel-puntos';
    
    panel.innerHTML = `
        <div class="panel-header">
            <h3>${t('puntuacion')}</h3>
            <button onclick="togglePanelPuntos()" class="btn-cerrar">✕</button>
        </div>
        <div class="total-puntos">
            <strong>${t('total')}</strong> 
            <span id="puntosTotal">0</span> ${t('pts')}
        </div>
        <div class="tabla-puntos">
            <table>
                <thead>
                    <tr>
                        <th>${t('zona')}</th>
                        <th>${t('dinos')}</th>
                        <th>${t('puntos')}</th>
                    </tr>
                </thead>
                <tbody id="tablaPuntosBody">
                    <tr>
                        <td>${t('bosque_semejanza')}</td>
                        <td id="cantidad-bosque">0</td>
                        <td id="puntos-bosque">0</td>
                    </tr>
                    <tr>
                        <td>${t('prado_diferencia')}</td>
                        <td id="cantidad-prado">0</td>
                        <td id="puntos-prado">0</td>
                    </tr>
                    <tr>
                        <td>${t('trio_frondoso')}</td>
                        <td id="cantidad-trio">0</td>
                        <td id="puntos-trio">0</td>
                    </tr>
                    <tr>
                        <td>${t('pradera_amor')}</td>
                        <td id="cantidad-pradera">0</td>
                        <td id="puntos-pradera">0</td>
                    </tr>
                    <tr>
                        <td>${t('isla_solitaria')}</td>
                        <td id="cantidad-isla">0</td>
                        <td id="puntos-isla">0</td>
                    </tr>
                    <tr>
                        <td>${t('rey_selva')}</td>
                        <td id="cantidad-rey">0</td>
                        <td id="puntos-rey">0</td>
                    </tr>
                    <tr>
                        <td>${t('dinos_rio')}</td>
                        <td id="cantidad-rio">0</td>
                        <td id="puntos-rio">0</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    document.body.appendChild(panel);
    
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
        actualizarPuntos();
    } else {
        panel.classList.remove('abierto');
        overlay.classList.remove('activo');
    }
}

async function actualizarPuntos() {
    const estadoActual = obtenerEstadoTablero();
    
    try {
        const respuesta = await fetch('negocio/puntuacion/puntosDigital.php', {
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
    
    document.querySelectorAll('.casillero-item').forEach(casilla => {
        const casillaId = casilla.getAttribute('data-casilla');
        const imagen = casilla.querySelector('img');
        
        if (imagen) {
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
    
    document.getElementById('textoPuntos').textContent = datos.totalScore + 'pts';
}

window.actualizarPuntos = actualizarPuntos;
window.togglePanelPuntos = togglePanelPuntos;

const estilos = document.createElement('style');
estilos.textContent = `
.boton-puntos {
    background-color: #552A0A;
    color: #FFD490;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 5px;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
}

.boton-puntos:hover {
    background-color: #764826;
    transform: translateY(-2px);
}

.panel-puntos {
    position: fixed;
    top: 0;
    right: -350px;
    width: 350px;
    height: 100%;
    background-color: #552A0A;
    padding: 20px;
    z-index: 1100;
    transition: right 0.3s;
    overflow-y: auto;
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
    border-bottom: 2px solid #FFD490;
}

.panel-header h3 {
    color: #FFD490;
    margin: 0;
}

.btn-cerrar {
    background: none;
    border: none;
    font-size: 24px;
    color: #FFD490;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
}

.total-puntos {
    background-color: #3d1f07;
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
    background-color: #3d1f07;
    border-radius: 5px;
    padding: 10px;
}

.tabla-puntos table {
    width: 100%;
    border-collapse: collapse;
}

.tabla-puntos th {
    background-color: #3d1f07;
    color: #FFD490;
    padding: 8px;
    text-align: left;
    border: 1px solid #FFD490;
}

.tabla-puntos td {
    padding: 8px;
    background-color: #552A0A;
    color: #FFD490;
    border: 1px solid #FFD490;
}

.tabla-puntos tr:nth-child(even) td {
    background-color: #552A0A;
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