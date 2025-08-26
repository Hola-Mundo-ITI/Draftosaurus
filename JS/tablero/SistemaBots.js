class SistemaBots {
  constructor(options = {}) {

    this.bots = options.bots || { 2: { nombre: 'Bot Alpha', activo: true }, 3: { nombre: 'Bot Beta', activo: true } };
    this.tiempoEspera = options.tiempoEspera || 2000;
    console.log('🤖 SistemaBots (cliente ligero) inicializado');
  }

  esBot(jugadorId) {
    return this.bots.hasOwnProperty(jugadorId) && this.bots[jugadorId].activo;
  }

  async ejecutarTurnoBot(jugadorId) {
    if (!this.esBot(jugadorId)) {
      console.warn(`[SistemaBots] Jugador ${jugadorId} no es un bot o está desactivado`);
      return;
    }

    console.log(`[SistemaBots] Ejecutando turno para Bot ${jugadorId} (${this.bots[jugadorId].nombre}) en segundo plano`);

    if (typeof window.ejecutarTurnoBotRemoto === 'function') {
      try {
        await window.ejecutarTurnoBotRemoto(jugadorId);
        return;
      } catch (err) {
        console.error('[SistemaBots] ejecutarTurnoBotRemoto falló, usando fallback local', err);
      }
    }

    try {
      const estadoActual = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;

      const mazoJugador = estadoActual && estadoActual.mazos && estadoActual.mazos[jugadorId] ? estadoActual.mazos[jugadorId] : [];
      const dinosauriosDisponiblesEnMazo = (mazoJugador || []).filter(d => d.disponible);

      const payload = {
        playerId: jugadorId,
        gameState: estadoActual,
        availableDinosaurs: dinosauriosDisponiblesEnMazo
      };

      const response = await fetch('backend/obtenerMovimientoBot.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result || !result.success) {
        console.warn(`[SistemaBots] Backend no devolvió movimiento para Bot ${jugadorId}`, result);

        if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
        return;
      }

      const moves = Array.isArray(result.moves) ? result.moves : (result.move ? [result.move] : []);

      if (moves.length === 0) {
        console.warn(`[SistemaBots] Bot ${jugadorId} no tiene movimientos válidos`);
        if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
        return;
      }

      for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        try {
          await this.procesarMovimientoBot(move, jugadorId);
        } catch (e) {
          console.error('[SistemaBots] Error procesando movimiento del bot:', e);
        }

        await new Promise(r => setTimeout(r, this.tiempoEspera));
      }

      try {
        if (window.estadoJuego && typeof window.estadoJuego.actualizarInterfazCompleta === 'function') {

          window.estadoJuego.actualizarInterfazCompleta();
        }
      } catch (e) {
        console.warn('[SistemaBots] No se pudo actualizar interfaz después de movimientos del bot', e);
      }

      if (typeof window.avanzarTurno === 'function') window.avanzarTurno();

    } catch (error) {
      console.error('[SistemaBots] Error en ejecutarTurnoBot:', error);
      if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
    }
  }

  async procesarMovimientoBot(move, jugadorId) {

    if (!move || !move.zoneId || !move.slot || !move.dinosaur) {
      console.warn('[SistemaBots] Movimiento recibido inválido', move);
      return;
    }

    const { dinosaur, zoneId, slot } = move;

    const dinoData = {
      id: dinosaur.id ?? (`dino_${dinosaur.type}_${Date.now()}`),
      tipo: dinosaur.type ?? dinosaur.tipo,
      imagen: dinosaur.image ?? dinosaur.imagen ?? (window.estadoJuego ? window.estadoJuego.obtenerImagenPorTipo?.(dinosaur.type ?? dinosaur.tipo) : null)
    };

    if (!dinoData.imagen && window.estadoJuego) {
      dinoData.imagen = window.estadoJuego.obtenerImagenPorTipo(dinoData.tipo);
    }

    if (window.estadoJuego && typeof window.estadoJuego.colocarDinosaurio === 'function') {
      try {

        const jugadorPrevio = window.estadoJuego.estado.jugadorActual;
        window.estadoJuego.estado.jugadorActual = jugadorId;
        // Llamada adaptada a la nueva firma: (jugadorId, zoneId, dinosaurio, slot)
        window.estadoJuego.colocarDinosaurio(jugadorId, zoneId, dinoData, slot);

        window.estadoJuego.estado.jugadorActual = jugadorPrevio;
      } catch (e) {
        console.error('[SistemaBots] Error actualizando estadoJuego con movimiento del bot', e);
      }
    } else {
      console.warn('[SistemaBots] window.estadoJuego.no disponible para aplicar movimiento del bot');
    }

    try {
      if (window.estadoJuego && window.estadoJuego.estado && window.estadoJuego.estado.mazos) {
        const mazo = window.estadoJuego.estado.mazos[jugadorId] || [];
        const dinoInMazo = mazo.find(d => d.id === dinoData.id || d.id == dinoData.id || d.tipo === dinoData.tipo);
        if (dinoInMazo) dinoInMazo.disponible = false;
      }
    } catch (e) {
      console.warn('[SistemaBots] No se pudo marcar dinosaurio en el mazo del bot', e);
    }

    console.log(`[SistemaBots] Bot ${jugadorId} colocó ${dinoData.tipo} en ${zoneId} slot ${slot}`);
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