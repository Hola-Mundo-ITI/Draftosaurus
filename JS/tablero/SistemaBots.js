/*
  Clase: SistemaBots
  Descripción: Gestiona la ejecución de turnos de bots en el cliente. La clase
  obtiene la configuración de bots desde las opciones pasadas al constructor
  o, por defecto, desde la variable global window.INIT_BOT_MAP. No contiene la
  lógica de decisión avanzada del bot (esa puede residir en el backend), sino
  que orquesta peticiones al endpoint que sugiere movimientos y aplica esos
  movimientos en el estado del juego del cliente. Proporciona métodos para
  ejecutar turnos, procesar movimientos recibidos y activar/desactivar bots.
  
  Cambios aplicados:
  - Asegura que cada bot opere exclusivamente sobre su propio tablero (estado.tableros[jugadorId]).
  - No altera de forma persistente jugadorActual en estadoJuego al aplicar movimientos.
  - Envía el tablero específico del bot al backend para decisiones más precisas.
*/
class SistemaBots {
  /*
    Constructor: inicializa la instancia de SistemaBots.
    - options.bots: mapa de bots { jugadorId: { nombre, activo } }
    - options.tiempoEspera: tiempo en ms entre movimientos del bot
    Si no se proveen opciones, se usa window.INIT_BOT_MAP como fuente de verdad.
  */
  constructor(options = {}) {

    this.bots = options.bots || (typeof window !== 'undefined' ? window.INIT_BOT_MAP || {} : {});
    this.tiempoEspera = options.tiempoEspera || 2000;
    console.log('SistemaBots inicializado para', Object.keys(this.bots).length, 'bots');
  }

  /*
    esBot:
    Comprueba  si un identificador corresponde a un bot activo.
    - Acepta claves numéricas o en string.
    - Intenta recuperar el mapa desde window.INIT_BOT_MAP si no está presente.
    - Devuelve booleano y escribe logs para diagnóstico.
  */
  esBot(jugadorId) {
    try {
      // Si no hay bots cargados intentar sincronizar con la configuración global
      if ((!this.bots || Object.keys(this.bots).length === 0) && typeof window !== 'undefined' && window.INIT_BOT_MAP) {
        this.bots = window.INIT_BOT_MAP;
        console.log('[SistemaBots] Cargando mapa de bots desde window.INIT_BOT_MAP');
      }

      // Accept numeric or string keys
      const keyNum = jugadorId;
      const keyStr = String(jugadorId);

      const entry = (this.bots && (this.bots[keyNum] || this.bots[keyStr])) || null;

      const activo = Boolean(entry && (entry.activo === true || entry.active === true));

      console.log(`[SistemaBots] esBot(${jugadorId}) => foundEntry=${!!entry}, activo=${activo}`);
      return activo;
    } catch (err) {
      console.error('[SistemaBots] Error en esBot:', err);
      return false;
    }
  }

  /*
    ejecutarTurnoBot:
    - Orquesta la ejecución del turno de un bot identificado por jugadorId.
    - Recupera el estado global y extrae el mazo y el tablero propio del bot
      para enviarlos al backend. De este modo el backend toma decisiones basadas
      en el tablero del bot en lugar de usar el tablero del jugador humano.
    - Procesa los movimientos devueltos y los aplica siempre especificando
      explícitamente el jugadorId para que la modificación afecte al tablero
      correcto dentro de estadoJuego.
  */
  async ejecutarTurnoBot(jugadorId) {
    if (!this.esBot(jugadorId)) {
      console.warn(`[SistemaBots] Jugador ${jugadorId} no es un bot o está desactivado`);
      return;
    }

    console.log(`[SistemaBots] Ejecutando turno para Bot ${jugadorId} (${this.bots[jugadorId] ? this.bots[jugadorId].nombre : 'sin-nombre'})`);

    if (typeof window.ejecutarTurnoBotRemoto === 'function') {
      try {
        console.log('[SistemaBots] Delegando a ejecutarTurnoBotRemoto');
        await window.ejecutarTurnoBotRemoto(jugadorId);
        return;
      } catch (err) {
        console.error('[SistemaBots] ejecutarTurnoBotRemoto falló, usando fallback local', err);
      }
    }

    try {
      const estadoActual = window.estadoJuego ? window.estadoJuego.obtenerEstado() : null;

      // Asegurar que usamos el mazo y el tablero del bot (jugadorId) y no del usuario
      const mazoJugador = estadoActual && estadoActual.mazos && (estadoActual.mazos[jugadorId] || estadoActual.mazos[String(jugadorId)]) ? (estadoActual.mazos[jugadorId] || estadoActual.mazos[String(jugadorId)]) : [];
      const dinosauriosDisponiblesEnMazo = (mazoJugador || []).filter(d => d && d.disponible);

      const tableroBot = estadoActual && estadoActual.tableros && (estadoActual.tableros[jugadorId] || estadoActual.tableros[String(jugadorId)]) ? (estadoActual.tableros[jugadorId] || estadoActual.tableros[String(jugadorId)]) : {};

      const payload = {
        playerId: jugadorId,
        gameState: estadoActual,
        playerBoard: tableroBot, // tablero específico del bot
        availableDinosaurs: dinosauriosDisponiblesEnMazo,
        totalPlayers: (typeof window !== 'undefined' && window.INIT_TOTAL_JUGADORES) ? window.INIT_TOTAL_JUGADORES : (estadoActual && (estadoActual.totalJugadores || estadoActual.totalPlayers) ? (estadoActual.totalJugadores || estadoActual.totalPlayers) : 3)
      };

      console.log('[SistemaBots] Enviando payload al backend para decidir movimiento:', payload);

      const response = await fetch('backend/obtenerMovimientoBot.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const texto = await response.text().catch(() => '');
        console.warn(`[SistemaBots] Backend devolvió estado ${response.status} para Bot ${jugadorId}:`, texto.slice ? texto.slice(0, 500) : texto);
        if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
        return;
      }

      let result = null;
      try {
        result = await response.json();
      } catch (parseErr) {
        const texto = await response.text().catch(() => '');
        console.error('[SistemaBots] No se pudo parsear JSON de backend para movimiento del bot:', parseErr, texto.slice ? texto.slice(0, 500) : texto);
        if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
        return;
      }

      if (!result || !(result.success || result.exito)) {
        console.warn(`[SistemaBots] Backend no devolvió movimiento para Bot ${jugadorId}`, result);

        if (typeof window.avanzarTurno === 'function') window.avanzarTurno();
        return;
      }

      const moves = Array.isArray(result.moves) ? result.moves : (result.move ? [result.move] : (result.movimiento ? [result.movimiento] : []));

      if (!moves || moves.length === 0) {
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

  /*
    procesarMovimientoBot:
    - Recibe un movimiento sugerido por el backend y lo aplica localmente.
    - Normaliza el objeto dinosaurio y llama a estadoJuego.colocarDinosaurio
      pasando siempre el jugadorId explícito para que la colocación se aplique
      al tablero del bot correspondiente.
    - Actualiza el mazo del bot para marcar el dinosaurio como no disponible.
  */
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
        // Aplicar siempre la colocación especificando el jugadorId correcto
        window.estadoJuego.colocarDinosaurio(jugadorId, zoneId, dinoData, slot);
      } catch (e) {
        console.error('[SistemaBots] Error actualizando estadoJuego con movimiento del bot', e);
      }
    } else {
      console.warn('[SistemaBots] window.estadoJuego no disponible para aplicar movimiento del bot');
    }

    try {
      if (window.estadoJuego && window.estadoJuego.estado && window.estadoJuego.estado.mazos) {
        const mazo = window.estadoJuego.estado.mazos[jugadorId] || window.estadoJuego.estado.mazos[String(jugadorId)] || [];
        const dinoInMazo = mazo.find(d => d.id === dinoData.id || d.id == dinoData.id || d.tipo === dinoData.tipo);
        if (dinoInMazo) dinoInMazo.disponible = false;
      }
    } catch (e) {
      console.warn('[SistemaBots] No se pudo marcar dinosaurio en el mazo del bot', e);
    }

    console.log(`[SistemaBots] Bot ${jugadorId} colocó ${dinoData.tipo} en ${zoneId} slot ${slot}`);
  }

  /*
    toggleBot: activa o desactiva un bot en la configuración local
  */
  toggleBot(jugadorId, activo = null) {
    if (!this.bots[jugadorId]) {
      console.warn(`Bot ${jugadorId} no existe`);
      return;
    }
    this.bots[jugadorId].activo = activo !== null ? activo : !this.bots[jugadorId].activo;
    console.log(`Bot ${jugadorId} ${this.bots[jugadorId].activo ? 'activado' : 'desactivado'}`);
  }
}

// Expone la clase SistemaBots globalmente para su uso en otros módulos
window.SistemaBots = SistemaBots;