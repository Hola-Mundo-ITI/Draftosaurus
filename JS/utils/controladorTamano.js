/**
 * Controlador para cambiar el tamaño de los casilleros interactivamente
 * Permite ajustar el tamaño de todos los slots del tablero en tiempo real
 */
class ControladorTamano {
  constructor() {
    this.tamanoActual = 19; // Tamaño por defecto en píxeles
    this.tamanoMinimo = 15;
    this.tamanoMaximo = 50;
    this.panelActivo = false;
    
    this.configurarEventos();
  }

  /**
   * Configura los eventos globales para el controlador
   */
  configurarEventos() {
    // Atajo de teclado para activar el panel (Ctrl+Shift+Y)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
        e.preventDefault();
        this.togglePanel();
      }
    });

    // Atajos para cambiar tamaño rápidamente
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          this.aumentarTamano();
        } else if (e.key === '-') {
          e.preventDefault();
          this.disminuirTamano();
        } else if (e.key === '0') {
          e.preventDefault();
          this.resetearTamano();
        }
      }
    });
  }

  /**
   * Activa o desactiva el panel de control
   */
  togglePanel() {
    if (this.panelActivo) {
      this.cerrarPanel();
    } else {
      this.abrirPanel();
    }
  }

  /**
   * Abre el panel de control de tamaño
   */
  abrirPanel() {
    this.panelActivo = true;
    
    const panel = document.createElement('div');
    panel.id = 'panel-tamano';
    panel.innerHTML = `
      <div class="panel-tamano-contenido">
        <h3>🔧 Control de Tamaño de Casilleros</h3>
        <div class="controles-tamano">
          <div class="control-slider">
            <label for="slider-tamano">Tamaño: <span id="valor-tamano">${this.tamanoActual}px</span></label>
            <input type="range" id="slider-tamano" min="${this.tamanoMinimo}" max="${this.tamanoMaximo}" value="${this.tamanoActual}">
          </div>
          <div class="botones-rapidos">
            <button id="btn-tamano-pequeno">Pequeño (15px)</button>
            <button id="btn-tamano-mediano">Mediano (19px)</button>
            <button id="btn-tamano-grande">Grande (25px)</button>
          </div>
          <div class="controles-precision">
            <button id="btn-disminuir">- 1px</button>
            <button id="btn-aumentar">+ 1px</button>
            <button id="btn-resetear">Reset</button>
          </div>
          <div class="info-atajos">
            <small>
              <strong>Atajos:</strong><br>
              Ctrl+Alt+Plus: Aumentar<br>
              Ctrl+Alt+Minus: Disminuir<br>
              Ctrl+Alt+0: Reset<br>
              Ctrl+Shift+Y: Toggle Panel
            </small>
          </div>
        </div>
        <button id="btn-cerrar-tamano" class="btn-cerrar">❌ Cerrar</button>
      </div>
    `;
    
    // Estilos del panel
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 5000;
      font-family: monospace;
      min-width: 280px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    
    document.body.appendChild(panel);
    
    // Configurar eventos del panel
    this.configurarEventosPanel();
    
    console.log('🔧 Panel de control de tamaño activado');
  }

  /**
   * Configura los eventos del panel de control
   */
  configurarEventosPanel() {
    const slider = document.getElementById('slider-tamano');
    const valorTamano = document.getElementById('valor-tamano');
    
    // Slider principal
    slider.addEventListener('input', (e) => {
      this.cambiarTamano(parseInt(e.target.value));
      valorTamano.textContent = e.target.value + 'px';
    });
    
    // Botones rápidos
    document.getElementById('btn-tamano-pequeno').onclick = () => this.cambiarTamano(15);
    document.getElementById('btn-tamano-mediano').onclick = () => this.cambiarTamano(19);
    document.getElementById('btn-tamano-grande').onclick = () => this.cambiarTamano(25);
    
    // Controles de precisión
    document.getElementById('btn-disminuir').onclick = () => this.disminuirTamano();
    document.getElementById('btn-aumentar').onclick = () => this.aumentarTamano();
    document.getElementById('btn-resetear').onclick = () => this.resetearTamano();
    
    // Cerrar panel
    document.getElementById('btn-cerrar-tamano').onclick = () => this.cerrarPanel();
  }

  /**
   * Cierra el panel de control
   */
  cerrarPanel() {
    const panel = document.getElementById('panel-tamano');
    if (panel) {
      panel.remove();
    }
    this.panelActivo = false;
    console.log('✅ Panel de control de tamaño cerrado');
  }

  /**
   * Cambia el tamaño de todos los casilleros
   */
  cambiarTamano(nuevoTamano) {
    // Validar rango
    nuevoTamano = Math.max(this.tamanoMinimo, Math.min(this.tamanoMaximo, nuevoTamano));
    this.tamanoActual = nuevoTamano;
    
    // Aplicar a todos los slots
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
      slot.style.width = nuevoTamano + 'px';
      slot.style.height = nuevoTamano + 'px';
    });
    
    // Aplicar tamaños especiales para el río (un poco más pequeños)
    const slotsRio = document.querySelectorAll('.dinos-rio .slot');
    const tamanoRio = Math.max(15, nuevoTamano - 2);
    slotsRio.forEach(slot => {
      slot.style.width = tamanoRio + 'px';
      slot.style.height = tamanoRio + 'px';
    });
    
    // Actualizar el slider si el panel está abierto
    const slider = document.getElementById('slider-tamano');
    const valorTamano = document.getElementById('valor-tamano');
    if (slider && valorTamano) {
      slider.value = nuevoTamano;
      valorTamano.textContent = nuevoTamano + 'px';
    }
    
    // Guardar en localStorage
    localStorage.setItem('draftosaurus_tamano_slots', nuevoTamano.toString());
    
    console.log(`📏 Tamaño de casilleros cambiado a ${nuevoTamano}px`);
  }

  /**
   * Aumenta el tamaño en 1px
   */
  aumentarTamano() {
    this.cambiarTamano(this.tamanoActual + 1);
  }

  /**
   * Disminuye el tamaño en 1px
   */
  disminuirTamano() {
    this.cambiarTamano(this.tamanoActual - 1);
  }

  /**
   * Resetea al tamaño por defecto
   */
  resetearTamano() {
    this.cambiarTamano(19);
  }

  /**
   * Carga el tamaño guardado desde localStorage
   */
  cargarTamanoGuardado() {
    const tamanoGuardado = localStorage.getItem('draftosaurus_tamano_slots');
    if (tamanoGuardado) {
      const tamano = parseInt(tamanoGuardado);
      if (!isNaN(tamano)) {
        this.cambiarTamano(tamano);
        console.log(`📥 Tamaño cargado desde localStorage: ${tamano}px`);
      }
    }
  }

  /**
   * Aplica estilos CSS dinámicos para el panel
   */
  aplicarEstilosPanel() {
    if (!document.getElementById('estilos-panel-tamano')) {
      const estilos = document.createElement('style');
      estilos.id = 'estilos-panel-tamano';
      estilos.textContent = `
        .panel-tamano-contenido h3 {
          margin: 0 0 15px 0;
          color: #FFD700;
          font-size: 14px;
        }
        
        .controles-tamano {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 15px;
        }
        
        .control-slider {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .control-slider label {
          font-size: 12px;
          color: #ccc;
        }
        
        #slider-tamano {
          width: 100%;
          height: 20px;
          background: #333;
          outline: none;
          border-radius: 10px;
        }
        
        .botones-rapidos {
          display: flex;
          gap: 5px;
        }
        
        .botones-rapidos button,
        .controles-precision button {
          padding: 5px 8px;
          background: #444;
          color: white;
          border: 1px solid #666;
          border-radius: 3px;
          cursor: pointer;
          font-size: 10px;
          flex: 1;
        }
        
        .botones-rapidos button:hover,
        .controles-precision button:hover {
          background: #555;
        }
        
        .controles-precision {
          display: flex;
          gap: 5px;
        }
        
        .info-atajos {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px;
          border-radius: 5px;
          font-size: 10px;
          line-height: 1.3;
        }
        
        .btn-cerrar {
          width: 100%;
          padding: 8px;
          background: #d32f2f;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
        }
        
        .btn-cerrar:hover {
          background: #f44336;
        }
      `;
      document.head.appendChild(estilos);
    }
  }

  /**
   * Inicializa el controlador
   */
  inicializar() {
    this.aplicarEstilosPanel();
    this.cargarTamanoGuardado();
    console.log('🎛️ Controlador de tamaño inicializado');
  }

  /**
   * Obtiene el tamaño actual
   */
  obtenerTamanoActual() {
    return this.tamanoActual;
  }

  /**
   * Aplica un tamaño específico a una zona
   */
  aplicarTamanoZona(zonaId, tamano) {
    const zona = document.querySelector(`[data-zona="${zonaId}"]`);
    if (zona) {
      const slots = zona.querySelectorAll('.slot');
      slots.forEach(slot => {
        slot.style.width = tamano + 'px';
        slot.style.height = tamano + 'px';
      });
    }
  }

  /**
   * Sincroniza todos los casilleros al mismo tamaño
   */
  sincronizarTamanos() {
    this.cambiarTamano(this.tamanoActual);
  }
}

// Crear instancia global
window.controladorTamano = new ControladorTamano();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.controladorTamano) {
      controladorTamano.inicializar();
    }
  }, 1500);
});