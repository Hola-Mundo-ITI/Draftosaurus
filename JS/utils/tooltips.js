/**
 * Sistema de tooltips para proporcionar ayuda contextual
 * Maneja la creación, posicionamiento y gestión de tooltips informativos
 */
class SistemaTooltips {
  constructor() {
    this.tooltipActivo = null;
    this.configuracion = {
      retraso: 500,
      duracionAnimacion: 200,
      offsetX: 10,
      offsetY: 10,
      maxWidth: 250
    };
    
    this.inicializar();
  }

  /**
   * Inicializa el sistema de tooltips
   */
  inicializar() {
    // Crear contenedor para tooltips
    this.contenedorTooltips = document.createElement('div');
    this.contenedorTooltips.id = 'contenedor-tooltips';
    this.contenedorTooltips.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 3000;
    `;
    document.body.appendChild(this.contenedorTooltips);

    // Configurar eventos globales
    this.configurarEventosGlobales();
  }

  /**
   * Configura eventos globales para tooltips
   */
  configurarEventosGlobales() {
    document.addEventListener('mouseover', (e) => {
      const elemento = e.target.closest('[data-tooltip]');
      if (elemento) {
        this.mostrarTooltip(elemento, elemento.dataset.tooltip);
      }
    });

    document.addEventListener('mouseout', (e) => {
      const elemento = e.target.closest('[data-tooltip]');
      if (elemento) {
        this.ocultarTooltip();
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.tooltipActivo) {
        this.actualizarPosicionTooltip(e.clientX, e.clientY);
      }
    });

    // Ocultar tooltip al hacer scroll
    document.addEventListener('scroll', () => {
      this.ocultarTooltip();
    });
  }

  /**
   * Muestra un tooltip con el contenido especificado
   */
  mostrarTooltip(elemento, contenido, opciones = {}) {
    // Limpiar tooltip anterior
    this.ocultarTooltip();

    const config = { ...this.configuracion, ...opciones };

    // Crear tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip-dinamico';
    tooltip.innerHTML = this.procesarContenidoTooltip(contenido);
    
    tooltip.style.cssText = `
      position: absolute;
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      max-width: ${config.maxWidth}px;
      word-wrap: break-word;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transform: scale(0.8);
      transition: all ${config.duracionAnimacion}ms ease-out;
      z-index: 3001;
    `;

    this.contenedorTooltips.appendChild(tooltip);
    this.tooltipActivo = tooltip;

    // Posicionar tooltip
    const rect = elemento.getBoundingClientRect();
    this.posicionarTooltip(tooltip, rect.left + rect.width / 2, rect.top);

    // Animar aparición
    setTimeout(() => {
      if (this.tooltipActivo === tooltip) {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'scale(1)';
      }
    }, config.retraso);
  }

  /**
   * Oculta el tooltip activo
   */
  ocultarTooltip() {
    if (this.tooltipActivo) {
      const tooltip = this.tooltipActivo;
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, this.configuracion.duracionAnimacion);
      
      this.tooltipActivo = null;
    }
  }

  /**
   * Posiciona el tooltip en las coordenadas especificadas
   */
  posicionarTooltip(tooltip, x, y) {
    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let finalX = x + this.configuracion.offsetX;
    let finalY = y - rect.height - this.configuracion.offsetY;

    // Ajustar si se sale por la derecha
    if (finalX + rect.width > viewportWidth) {
      finalX = x - rect.width - this.configuracion.offsetX;
    }

    // Ajustar si se sale por arriba
    if (finalY < 0) {
      finalY = y + this.configuracion.offsetY;
    }

    // Ajustar si se sale por la izquierda
    if (finalX < 0) {
      finalX = this.configuracion.offsetX;
    }

    // Ajustar si se sale por abajo
    if (finalY + rect.height > viewportHeight) {
      finalY = viewportHeight - rect.height - this.configuracion.offsetY;
    }

    tooltip.style.left = finalX + 'px';
    tooltip.style.top = finalY + 'px';
  }

  /**
   * Actualiza la posición del tooltip siguiendo el mouse
   */
  actualizarPosicionTooltip(x, y) {
    if (this.tooltipActivo) {
      this.posicionarTooltip(this.tooltipActivo, x, y);
    }
  }

  /**
   * Procesa el contenido del tooltip para soportar HTML básico
   */
  procesarContenidoTooltip(contenido) {
    // Soportar saltos de línea
    contenido = contenido.replace(/\\n/g, '<br>');
    
    // Soportar texto en negrita
    contenido = contenido.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Soportar texto en cursiva
    contenido = contenido.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return contenido;
  }

  /**
   * Crea tooltips específicos para zonas del tablero con reglas actualizadas
   */
  configurarTooltipsZonas() {
    const zonasInfo = {
      'bosque-semejanza': {
        titulo: 'Bosque de la Semejanza',
        descripcion: '**Reglas:**\\n• Solo dinosaurios de la misma especie\\n• Colocar de izquierda a derecha\\n• Sin dejar espacios\\n\\n**Puntuación:** 1, 3, 6, 10, 15, 21 puntos',
        ejemplo: 'Ejemplo: 4 Triceratops seguidos = 10 puntos'
      },
      'prado-diferencia': {
        titulo: 'Prado de la Diferencia',
        descripcion: '**Reglas:**\\n• Solo especies diferentes\\n• Colocar de izquierda a derecha\\n• Sin dejar espacios\\n\\n**Puntuación:** 1, 3, 6, 10, 15, 21 puntos',
        ejemplo: 'Ejemplo: 5 especies diferentes = 15 puntos'
      },
      'pradera-amor': {
        titulo: 'La Pradera del Amor',
        descripcion: '**Reglas:**\\n• Se pueden colocar dinosaurios de cualquier especie\\n• 5 puntos por cada pareja de la misma especie\\n• Los dinosaurios sin pareja no suman puntos',
        ejemplo: 'Ejemplo: 2 T-Rex + 2 Triceratops = 10 puntos'
      },
      'trio-frondoso': {
        titulo: 'El Trío Frondoso',
        descripcion: '**Reglas:**\\n• Puede albergar hasta tres dinosaurios\\n• 7 puntos si hay exactamente 3 dinosaurios\\n• Si no hay exactamente tres, no se obtienen puntos',
        ejemplo: 'Ejemplo: Exactamente 3 dinosaurios = 7 puntos'
      },
      'rey-selva': {
        titulo: 'El Rey de la Selva',
        descripcion: '**Reglas:**\\n• Solo un dinosaurio\\n• 7 puntos si ningún rival tiene más de esa especie\\n• En caso de empate, también se reciben los 7 puntos',
        ejemplo: 'Ejemplo: 1 T-Rex (y rivales tienen menos T-Rex) = 7 puntos'
      },
      'isla-solitaria': {
        titulo: 'La Isla Solitaria',
        descripcion: '**Reglas:**\\n• Solo un dinosaurio\\n• 7 puntos si es el único de su especie en TODO tu parque\\n• De lo contrario, no otorga puntos',
        ejemplo: 'Ejemplo: 1 Pteranodon (y no tienes más) = 7 puntos'
      },
      'dinos-rio': {
        titulo: 'Dinosaurios en el Río',
        descripcion: '**Reglas:**\\n• Dinosaurios colocados en secuencia\\n• Puntuación progresiva por cantidad',
        ejemplo: 'Ejemplo: 5 dinosaurios = 15 puntos'
      },
      'zona-trex': {
        titulo: 'Zona del T-Rex',
        descripcion: '**Reglas:**\\n• Solo para T-Rex\\n• 12 puntos por T-Rex en zona especial',
        ejemplo: 'Ejemplo: 1 T-Rex = 12 puntos'
      }
    };

    Object.entries(zonasInfo).forEach(([zonaId, info]) => {
      const zona = document.querySelector(`[data-zona="${zonaId}"]`);
      if (zona) {
        const contenidoTooltip = `**${info.titulo}**\\n${info.descripcion}\\n\\n*${info.ejemplo}*`;
        zona.setAttribute('data-tooltip', contenidoTooltip);
      }
    });
  }

  /**
   * Crea tooltips para dinosaurios
   */
  configurarTooltipsDinosaurios() {
    const dinosauriosInfo = {
      'dino1': {
        nombre: 'Triceratops',
        descripcion: 'Dinosaurio herbívoro con tres cuernos\\nTamaño: Mediano\\nPuntos en Rey de la Selva: 8'
      },
      'dino2': {
        nombre: 'Stegosaurus',
        descripcion: 'Dinosaurio con placas en el lomo\\nTamaño: Mediano\\nPuntos en Rey de la Selva: 6'
      },
      'dino3': {
        nombre: 'Brontosaurus',
        descripcion: 'Dinosaurio de cuello largo\\nTamaño: Grande\\nPuntos en Rey de la Selva: 10'
      },
      'dino4': {
        nombre: 'T-Rex',
        descripcion: 'El rey de los dinosaurios\\nTamaño: Muy Grande\\nPuntos en Rey de la Selva: 12\\n**Único que puede ir en Zona T-Rex**'
      },
      'dino5': {
        nombre: 'Velociraptor',
        descripcion: 'Dinosaurio cazador ágil\\nTamaño: Pequeño\\nPuntos en Rey de la Selva: 4'
      },
      'dino6': {
        nombre: 'Pteranodon',
        descripcion: 'Reptil volador\\nTamaño: Muy Pequeño\\nPuntos en Rey de la Selva: 2'
      }
    };

    document.querySelectorAll('.dinosaurio').forEach((dino, index) => {
      const img = dino.querySelector('img');
      if (img) {
        const src = img.src;
        let tipoKey = null;
        
        if (src.includes('dino1')) tipoKey = 'dino1';
        else if (src.includes('dino2')) tipoKey = 'dino2';
        else if (src.includes('dino3')) tipoKey = 'dino3';
        else if (src.includes('dino4')) tipoKey = 'dino4';
        else if (src.includes('dino5')) tipoKey = 'dino5';
        else if (src.includes('dino6')) tipoKey = 'dino6';
        
        if (tipoKey && dinosauriosInfo[tipoKey]) {
          const info = dinosauriosInfo[tipoKey];
          const contenidoTooltip = `**${info.nombre}**\\n${info.descripcion}`;
          dino.setAttribute('data-tooltip', contenidoTooltip);
        }
      }
    });
  }

  /**
   * Crea tooltips para controles del juego
   */
  configurarTooltipsControles() {
    const controles = {
      'btn-deshacer': 'Deshace el último movimiento realizado\\n**Atajo:** Ctrl+Z',
      'btn-reiniciar': 'Reinicia completamente el tablero\\n**Atajo:** Ctrl+R\\n*Requiere confirmación*',
      'btn-calcular-puntos': 'Muestra la puntuación actual de ambos jugadores\\n**Atajo:** Barra espaciadora'
    };

    Object.entries(controles).forEach(([id, descripcion]) => {
      const elemento = document.getElementById(id);
      if (elemento) {
        elemento.setAttribute('data-tooltip', descripcion);
      }
    });
  }

  /**
   * Muestra un tooltip de ayuda temporal
   */
  mostrarAyudaTemporal(mensaje, duracion = 3000) {
    const ayuda = document.createElement('div');
    ayuda.className = 'tooltip-ayuda-temporal';
    ayuda.innerHTML = this.procesarContenidoTooltip(mensaje);
    
    ayuda.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      font-size: 16px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 4000;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.8);
      transition: all 300ms ease-out;
    `;

    document.body.appendChild(ayuda);

    // Animar aparición
    setTimeout(() => {
      ayuda.style.opacity = '1';
      ayuda.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    // Animar desaparición
    setTimeout(() => {
      ayuda.style.opacity = '0';
      ayuda.style.transform = 'translate(-50%, -50%) scale(0.8)';
      
      setTimeout(() => {
        if (ayuda.parentNode) {
          ayuda.parentNode.removeChild(ayuda);
        }
      }, 300);
    }, duracion);
  }

  /**
   * Configura todos los tooltips del juego
   */
  configurarTodosLosTooltips() {
    this.configurarTooltipsZonas();
    this.configurarTooltipsDinosaurios();
    this.configurarTooltipsControles();
  }

  /**
   * Limpia todos los tooltips
   */
  limpiarTooltips() {
    this.ocultarTooltip();
    
    // Remover atributos de tooltip
    document.querySelectorAll('[data-tooltip]').forEach(elemento => {
      elemento.removeAttribute('data-tooltip');
    });
  }

  /**
   * Actualiza la configuración de tooltips
   */
  actualizarConfiguracion(nuevaConfig) {
    this.configuracion = { ...this.configuracion, ...nuevaConfig };
  }
}

// Crear instancia global
window.sistemaTooltips = new SistemaTooltips();