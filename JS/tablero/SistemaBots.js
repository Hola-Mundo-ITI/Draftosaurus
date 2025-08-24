// Cliente mínimo para bots: delega la lógica al backend
class SistemaBots {
  constructor(options = {}) {
    // Por defecto, asumir jugadores 2 y 3 son bots
    this.bots = options.bots || { 2: { nombre: 'Bot Alpha', activo: true }, 3: { nombre: 'Bot Beta', activo: true } };
    this.tiempoEspera = options.tiempoEspera || 2000;
    console.log('🤖 SistemaBots (cliente ligero) inicializado');
  }

  esBot(jugadorId) {
    return this.bots.hasOwnProperty(jugadorId) && this.bots[jugadorId].activo;
  }

  async ejecutarTurnoBot(jugadorId) {
    if (!this.esBot(jugadorId)) {
      console.warn(`Jugador ${jugadorId} no es un bot o está desactivado`);
      return;
    }

    // Preferir la función global que ya existe en digitalPage.js
    if (typeof window.ejecutarTurnoBotRemoto === 'function') {
      try {
        await window.ejecutarTurnoBotRemoto(jugadorId);
        return;
      } catch (err) {
        console.error('Error ejecutando ejecutarTurnoBotRemoto:', err);
        // continuar al fallback
      }
    }

    // Fallback: pedir movimiento al backend y aplicar en frontend
    try {
      const estadoActual = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;
      const availableDinosaurs = (typeof obtenerDinosauriosDisponiblesDOM === 'function') ? obtenerDinosauriosDisponiblesDOM() : [];

      const response = await fetch('backend/obtenerMovimientoBot.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: jugadorId, gameState: estadoActual, availableDinosaurs })
      });

      const result = await response.json();
      if (result.success && result.move) {
        // Simular el movimiento como lo hace digitalPage.js
        const { dinosaur, zoneId, slot } = result.move;
        const slotElement = document.querySelector(`[data-zona="${zoneId}"] [data-slot="${slot}"]`);
        const dinosaurioElemento = document.querySelector(`.dinosaurio img[src="${dinosaur.image}"]`)?.closest('.dinosaurio');

        if (slotElement) {
          setTimeout(() => {
            const imgDino = document.createElement('img');
            imgDino.src = dinosaur.image;
            imgDino.alt = `Dinosaurio ${dinosaur.type}`;
            imgDino.style.width = '50px';
            imgDino.style.height = '50px';
            imgDino.style.objectFit = 'contain';
            imgDino.style.position = 'absolute';
            imgDino.style.top = '50%';
            imgDino.style.left = '50%';
            imgDino.style.transform = 'translate(-50%, -50%)';
            imgDino.style.zIndex = '10';
            imgDino.style.pointerEvents = 'none';

            slotElement.appendChild(imgDino);
            slotElement.dataset.ocupado = 'true';

            if (dinosaurioElemento) dinosaurioElemento.style.display = 'none';

            const dinosaurioParaEstado = {
              id: dinosaur.id || Date.now(),
              tipo: dinosaur.type || dinosaur.type,
              slot: slot,
              imagen: dinosaur.image,
              jugadorColocado: jugadorId
            };

            if (window.estadoJuego && typeof window.estadoJuego.colocarDinosaurio === 'function') {
              try { window.estadoJuego.colocarDinosaurio(zoneId, dinosaurioParaEstado, slot); } catch (e) { console.warn('No se pudo actualizar estadoJuego desde SistemaBots fallback', e); }
            }

            if (window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
              window.tableroJuego.mostrarMensaje(`🤖 Bot colocó ${dinosaur.type} en ${zoneId}`, 'exito');
            }

            if (typeof window.avanzarTurno === 'function') {
              window.avanzarTurno();
            }
          }, this.tiempoEspera);
        } else {
          console.warn('Slot no encontrado en DOM para movimiento del bot');
          if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
        }
      } else {
        console.warn('Backend no devolvió un movimiento válido para el bot', result);
        if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
      }

    } catch (error) {
      console.error('Error comunicando con backend para movimiento del bot:', error);
      if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
    }
  }

  toggleBot(jugadorId, activo = null) {
    if (!this.bots[jugadorId]) {
      console.warn(`Bot ${jugadorId} no existe`);
      return;
    }
    this.bots[jugadorId].activo = activo !== null ? activo : !this.bots[jugadorId].activo;
    console.log(`Bot ${jugadorId} ${this.bots[jugadorId].activo ? 'activado' : 'desactivado'}`);
  }
}