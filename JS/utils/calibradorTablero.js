
class CalibradorTablero {
  constructor() {
    this.modoCalibrado = false;
    this.zonaSeleccionada = null;
    this.posicionesOriginales = this.obtenerPosicionesOriginales();
    this.configurarEventos();
  }

  
  obtenerPosicionesOriginales() {
    const zonas = document.querySelectorAll('.zona-tablero');
    const posiciones = {};
    
    zonas.forEach(zona => {
      const zonaId = zona.dataset.zona;
      const estilos = window.getComputedStyle(zona);
      posiciones[zonaId] = {
        top: parseInt(estilos.top),
        left: parseInt(estilos.left),
        right: parseInt(estilos.right),
        bottom: parseInt(estilos.bottom),
        width: parseInt(estilos.width),
        height: parseInt(estilos.height)
      };
    });
    
    return posiciones;
  }

  
  activarModoCalibrado() {
    this.modoCalibrado = true;
    document.body.classList.add('modo-calibrado');
    this.crearPanelControl();
    this.hacerZonasArrastrables();
    
    console.log('🔧 Modo calibrado activado');
  }

  
  desactivarModoCalibrado() {
    this.modoCalibrado = false;
    document.body.classList.remove('modo-calibrado');
    const panel = document.getElementById('panel-calibrado');
    if (panel) panel.remove();
    this.removerEventosArrastre();
    
    console.log('✅ Modo calibrado desactivado');
  }

  
  crearPanelControl() {
    const panel = document.createElement('div');
    panel.id = 'panel-calibrado';
    panel.innerHTML = `
      <div class="panel-calibrado">
        <h3>🔧 Calibrador de Tablero</h3>
        <div class="controles-calibrado">
          <button id="btn-guardar-posiciones">💾 Guardar Posiciones</button>
          <button id="btn-restaurar-posiciones">🔄 Restaurar Original</button>
          <button id="btn-exportar-css">📋 Exportar CSS</button>
          <button id="btn-cerrar-calibrado">❌ Cerrar</button>
        </div>
        <div class="info-zona">
          <p>Selecciona una zona para ver su información</p>
          <div id="info-zona-detalle"></div>
        </div>
      </div>
    `;
    
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 5000;
      font-family: monospace;
      min-width: 300px;
    `;
    
    document.body.appendChild(panel);
    document.getElementById('btn-guardar-posiciones').onclick = () => this.guardarPosiciones();
    document.getElementById('btn-restaurar-posiciones').onclick = () => this.restaurarPosiciones();
    document.getElementById('btn-exportar-css').onclick = () => this.exportarCSS();
    document.getElementById('btn-cerrar-calibrado').onclick = () => this.desactivarModoCalibrado();
  }

  
  hacerZonasArrastrables() {
    const zonas = document.querySelectorAll('.zona-tablero');
    
    zonas.forEach(zona => {
      zona.style.cursor = 'move';
      zona.style.border = '2px solid #FFD700';
      zona.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
      
      let arrastrando = false;
      let offsetX, offsetY;
      
      zona.addEventListener('mousedown', (e) => {
        if (!this.modoCalibrado) return;
        
        arrastrando = true;
        this.zonaSeleccionada = zona;
        
        const rect = zona.getBoundingClientRect();
        const tableroRect = zona.closest('.tablero-juego').getBoundingClientRect();
        
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        zona.style.zIndex = '1000';
        this.actualizarInfoZona(zona);
        
        e.preventDefault();
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!arrastrando || !this.modoCalibrado) return;
        
        const tablero = zona.closest('.tablero-juego');
        const tableroRect = tablero.getBoundingClientRect();
        
        const x = e.clientX - tableroRect.left - offsetX;
        const y = e.clientY - tableroRect.top - offsetY;
        
        zona.style.left = Math.max(0, Math.min(x, tableroRect.width - zona.offsetWidth)) + 'px';
        zona.style.top = Math.max(0, Math.min(y, tableroRect.height - zona.offsetHeight)) + 'px';
        
        this.actualizarInfoZona(zona);
      });
      
      document.addEventListener('mouseup', () => {
        if (arrastrando) {
          arrastrando = false;
          zona.style.zIndex = '';
        }
      });
    });
  }

  
  actualizarInfoZona(zona) {
    const zonaId = zona.dataset.zona;
    const estilos = window.getComputedStyle(zona);
    
    const info = document.getElementById('info-zona-detalle');
    if (info) {
      info.innerHTML = `
        <strong>${zonaId}</strong><br>
        Top: ${parseInt(estilos.top)}px<br>
        Left: ${parseInt(estilos.left)}px<br>
        Width: ${parseInt(estilos.width)}px<br>
        Height: ${parseInt(estilos.height)}px
      `;
    }
  }

  
  guardarPosiciones() {
    const zonas = document.querySelectorAll('.zona-tablero');
    const posiciones = {};
    
    zonas.forEach(zona => {
      const zonaId = zona.dataset.zona;
      const estilos = window.getComputedStyle(zona);
      posiciones[zonaId] = {
        top: parseInt(estilos.top),
        left: parseInt(estilos.left),
        width: parseInt(estilos.width),
        height: parseInt(estilos.height)
      };
    });
    
    localStorage.setItem('draftosaurus_posiciones_calibradas', JSON.stringify(posiciones));
    console.log('💾 Posiciones guardadas:', posiciones);
    alert('Posiciones guardadas en localStorage');
  }

  
  restaurarPosiciones() {
    Object.entries(this.posicionesOriginales).forEach(([zonaId, pos]) => {
      const zona = document.querySelector(`[data-zona="${zonaId}"]`);
      if (zona) {
        zona.style.top = pos.top + 'px';
        zona.style.left = pos.left + 'px';
        zona.style.width = pos.width + 'px';
        zona.style.height = pos.height + 'px';
      }
    });
    
    console.log('🔄 Posiciones restauradas');
  }

  
  exportarCSS() {
    const zonas = document.querySelectorAll('.zona-tablero');
    let css = '\n\n';
    
    zonas.forEach(zona => {
      const zonaId = zona.dataset.zona;
      const estilos = window.getComputedStyle(zona);
      
      css += `.${zonaId} {\n`;
      css += `  top: ${parseInt(estilos.top)}px;\n`;
      css += `  left: ${parseInt(estilos.left)}px;\n`;
      css += `  width: ${parseInt(estilos.width)}px;\n`;
      css += `  height: ${parseInt(estilos.height)}px;\n`;
      css += `}\n\n`;
    });
    navigator.clipboard.writeText(css).then(() => {
      alert('CSS copiado al portapapeles');
    });
    
    console.log('📋 CSS exportado:', css);
  }

  
  cargarPosicionesGuardadas() {
    const posicionesGuardadas = localStorage.getItem('draftosaurus_posiciones_calibradas');
    
    if (posicionesGuardadas) {
      const posiciones = JSON.parse(posicionesGuardadas);
      
      Object.entries(posiciones).forEach(([zonaId, pos]) => {
        const zona = document.querySelector(`[data-zona="${zonaId}"]`);
        if (zona) {
          zona.style.top = pos.top + 'px';
          zona.style.left = pos.left + 'px';
          zona.style.width = pos.width + 'px';
          zona.style.height = pos.height + 'px';
        }
      });
      
      console.log('📥 Posiciones cargadas desde localStorage');
    }
  }

  
  configurarEventos() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        if (this.modoCalibrado) {
          this.desactivarModoCalibrado();
        } else {
          this.activarModoCalibrado();
        }
      }
    });
  }

  
  removerEventosArrastre() {
    const zonas = document.querySelectorAll('.zona-tablero');
    
    zonas.forEach(zona => {
      zona.style.cursor = '';
      zona.style.border = '';
      zona.style.backgroundColor = '';
      zona.style.zIndex = '';
      const nuevoZona = zona.cloneNode(true);
      zona.parentNode.replaceChild(nuevoZona, zona);
    });
  }

  
  aplicarPosicionesOptimizadas() {
    const posicionesOptimizadas = {
      'bosque-semejanza': { top: 120, left: 80, width: 160, height: 100 },
      'trio-frondoso': { top: 120, left: 520, width: 90, height: 80 },
      'prado-diferencia': { top: 250, left: 80, width: 180, height: 90 },
      'pradera-amor': { top: 250, left: 220, width: 160, height: 100 },
      'isla-solitaria': { top: 380, left: 80, width: 70, height: 60 },
      'rey-selva': { top: 380, left: 170, width: 70, height: 60 },
      'dinos-rio': { top: 480, left: 80, width: 480, height: 70 },
      'zona-trex': { top: 120, left: 630, width: 90, height: 180 }
    };

    Object.entries(posicionesOptimizadas).forEach(([zonaId, pos]) => {
      const zona = document.querySelector(`[data-zona="${zonaId}"]`);
      if (zona) {
        zona.style.top = pos.top + 'px';
        zona.style.left = pos.left + 'px';
        zona.style.width = pos.width + 'px';
        zona.style.height = pos.height + 'px';
      }
    });

    console.log('🎯 Posiciones optimizadas aplicadas');
  }
}
window.calibradorTablero = new CalibradorTablero();
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.calibradorTablero) {
      calibradorTablero.aplicarPosicionesOptimizadas();
      calibradorTablero.cargarPosicionesGuardadas();
    }
  }, 1000);
});