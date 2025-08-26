/*
 * animaciones.js:
 * Bibliotecas y utilidades para animaciones UI reutilizables (transiciones,
 * animaciones de entrada/salida y microinteracciones). Centraliza los
 * helpers para evitar duplicación y facilitar ajustes de rendimiento.
 */

class UtilidadesAnimacion {
  constructor() {
    this.duracionAnimacionPorDefecto = 300;
    this.easingPorDefecto = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  }

  
  animarMovimiento(elemento, posicionInicial, posicionFinal, duracion = this.duracionAnimacionPorDefecto) {
    return new Promise((resolve) => {
      elemento.style.position = 'fixed';
      elemento.style.left = posicionInicial.x + 'px';
      elemento.style.top = posicionInicial.y + 'px';
      elemento.style.transition = `all ${duracion}ms ${this.easingPorDefecto}`;
      elemento.style.zIndex = '1000';

      elemento.offsetHeight;

      elemento.style.left = posicionFinal.x + 'px';
      elemento.style.top = posicionFinal.y + 'px';

      setTimeout(() => {
        elemento.style.position = '';
        elemento.style.left = '';
        elemento.style.top = '';
        elemento.style.transition = '';
        elemento.style.zIndex = '';
        resolve();
      }, duracion);
    });
  }

  
  aplicarPulso(elemento, duracion = 1000, escala = 1.1) {
    elemento.style.animation = `pulso-personalizado ${duracion}ms infinite`;

    if (!document.getElementById('pulso-personalizado-style')) {
      const style = document.createElement('style');
      style.id = 'pulso-personalizado-style';
      style.textContent = `
        @keyframes pulso-personalizado {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(${escala}); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  
  removerPulso(elemento) {
    elemento.style.animation = '';
  }

  
  aplicarParpadeo(elemento, duracion = 2000) {
    elemento.style.animation = `parpadeo-personalizado ${duracion}ms infinite`;
    
    if (!document.getElementById('parpadeo-personalizado-style')) {
      const style = document.createElement('style');
      style.id = 'parpadeo-personalizado-style';
      style.textContent = `
        @keyframes parpadeo-personalizado {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  
  aplicarVibracion(elemento, duracion = 500) {
    elemento.style.animation = `vibracion-personalizada ${duracion}ms`;
    
    if (!document.getElementById('vibracion-personalizada-style')) {
      const style = document.createElement('style');
      style.id = 'vibracion-personalizada-style';
      style.textContent = `
        @keyframes vibracion-personalizada {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      elemento.style.animation = '';
    }, duracion);
  }

  
  aparecerSuave(elemento, duracion = 300) {
    return new Promise((resolve) => {
      elemento.style.opacity = '0';
      elemento.style.transform = 'scale(0.8)';
      elemento.style.transition = `all ${duracion}ms ${this.easingPorDefecto}`;

      elemento.offsetHeight;
      
      elemento.style.opacity = '1';
      elemento.style.transform = 'scale(1)';
      
      setTimeout(() => {
        elemento.style.transition = '';
        resolve();
      }, duracion);
    });
  }

  
  desaparecerSuave(elemento, duracion = 300) {
    return new Promise((resolve) => {
      elemento.style.transition = `all ${duracion}ms ${this.easingPorDefecto}`;
      elemento.style.opacity = '0';
      elemento.style.transform = 'scale(0.8)';
      
      setTimeout(() => {
        elemento.style.display = 'none';
        elemento.style.transition = '';
        resolve();
      }, duracion);
    });
  }

  
  resaltarTemporalmente(elemento, color = '#FFD700', duracion = 1000) {
    const colorOriginal = elemento.style.backgroundColor;
    const borderOriginal = elemento.style.border;
    
    elemento.style.backgroundColor = color;
    elemento.style.border = `2px solid ${color}`;
    elemento.style.transition = `all 300ms ease`;
    
    setTimeout(() => {
      elemento.style.backgroundColor = colorOriginal;
      elemento.style.border = borderOriginal;
      
      setTimeout(() => {
        elemento.style.transition = '';
      }, 300);
    }, duracion);
  }

  
  animarContador(elemento, valorInicial, valorFinal, duracion = 1000) {
    return new Promise((resolve) => {
      const diferencia = valorFinal - valorInicial;
      const incremento = diferencia / (duracion / 16); // 60 FPS
      let valorActual = valorInicial;
      
      const intervalo = setInterval(() => {
        valorActual += incremento;
        
        if ((incremento > 0 && valorActual >= valorFinal) || 
            (incremento < 0 && valorActual <= valorFinal)) {
          valorActual = valorFinal;
          clearInterval(intervalo);
          resolve();
        }
        
        elemento.textContent = Math.round(valorActual);
      }, 16);
    });
  }

  
  crearParticulas(elemento, cantidad = 10, color = '#FFD700') {
    const rect = elemento.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < cantidad; i++) {
      const particula = document.createElement('div');
      particula.className = 'particula-celebracion';
      particula.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        width: 6px;
        height: 6px;
        background-color: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 2000;
      `;
      
      document.body.appendChild(particula);

      const angulo = (Math.PI * 2 * i) / cantidad;
      const velocidad = 100 + Math.random() * 100;
      const finalX = centerX + Math.cos(angulo) * velocidad;
      const finalY = centerY + Math.sin(angulo) * velocidad;
      
      particula.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      particula.style.transform = `translate(${finalX - centerX}px, ${finalY - centerY}px)`;
      particula.style.opacity = '0';
      
      setTimeout(() => {
        particula.remove();
      }, 1000);
    }
  }

  
  crearOndasConcentricas(elemento, color = 'rgba(255, 215, 0, 0.3)') {
    const rect = elemento.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const onda = document.createElement('div');
        onda.style.cssText = `
          position: fixed;
          left: ${centerX}px;
          top: ${centerY}px;
          width: 0;
          height: 0;
          border: 2px solid ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 1500;
          transform: translate(-50%, -50%);
          transition: all 1s ease-out;
        `;
        
        document.body.appendChild(onda);

        setTimeout(() => {
          onda.style.width = '200px';
          onda.style.height = '200px';
          onda.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
          onda.remove();
        }, 1000);
      }, i * 200);
    }
  }

  
  mostrarTextoFlotante(elemento, texto, color = '#4CAF50', duracion = 2000) {
    const rect = elemento.getBoundingClientRect();
    const textoFlotante = document.createElement('div');
    
    textoFlotante.textContent = texto;
    textoFlotante.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      color: ${color};
      font-weight: bold;
      font-size: 18px;
      pointer-events: none;
      z-index: 2000;
      transform: translateX(-50%);
      transition: all ${duracion}ms ease-out;
    `;
    
    document.body.appendChild(textoFlotante);

    setTimeout(() => {
      textoFlotante.style.transform = 'translateX(-50%) translateY(-50px)';
      textoFlotante.style.opacity = '0';
    }, 10);
    
    setTimeout(() => {
      textoFlotante.remove();
    }, duracion);
  }

  
  aplicarBrillo(elemento, duracion = 2000) {
    elemento.style.position = 'relative';
    elemento.style.overflow = 'hidden';
    
    const brillo = document.createElement('div');
    brillo.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
      transition: left ${duracion}ms ease-in-out;
      pointer-events: none;
      z-index: 1;
    `;
    
    elemento.appendChild(brillo);
    
    setTimeout(() => {
      brillo.style.left = '100%';
    }, 10);
    
    setTimeout(() => {
      brillo.remove();
    }, duracion);
  }

  
  limpiarAnimaciones(elemento) {
    elemento.style.animation = '';
    elemento.style.transition = '';
    elemento.style.transform = '';
    elemento.style.opacity = '';
  }

  
  animacionesHabilitadas() {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  
  ejecutarSiHabilitada(callback) {
    if (this.animacionesHabilitadas()) {
      callback();
    }
  }
}

window.utilidadesAnimacion = new UtilidadesAnimacion();