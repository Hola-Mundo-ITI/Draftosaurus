/*
 * EstadoJuego.js:
 * Contiene la clase EstadoJuego que mantiene el estado central del juego
 * (turnos, rondas, tablero, mazos y estadísticas). Se encarga de exponer
 * métodos para inicializar el estado, colocar dinosaurios, calcular
 * puntuaciones y sincronizar la interfaz.
 */

class EstadoJuego {
  constructor() {
    this.estado = this.inicializarEstado();
    this.historial = [];
    this.configurarPersistencia();
  }

  
  inicializarEstado() {
    const totalPlayers = (typeof window !== 'undefined' && window.INIT_TOTAL_JUGADORES) ? parseInt(window.INIT_TOTAL_JUGADORES, 10) : 3;

    const tableros = {};
    const puntuacion = {};
    for (let p = 1; p <= totalPlayers; p++) {
      tableros[p] = this.inicializarTableroVacio();
      puntuacion[`jugador${p}`] = 0;
    }

    return {
      turnoActual: 1,
      rondaActual: 1,
      jugadorActual: 1,
      totalJugadores: totalPlayers,
      tableros: tableros,
      puntuacion: puntuacion,
      dinosauriosDisponibles: this.generarDinosauriosDisponibles(),

      mazos: this.generarMazosIniciales(totalPlayers),
      configuracion: {
        modoJuego: 'clasico',
        tiempoTurno: null,
        sonidosActivados: true,
        animacionesActivadas: true
      },
      estadisticas: {
        movimientosRealizados: 0,
        tiempoJuego: 0,
        inicioPartida: new Date()
      },

      dado: {
        activo: false,
        caraActual: null,
        jugadorQueLanzo: null,
        rondaActual: null
      },

      // bandera global que indica si el jugador actual ya colocó en este turno
      haColocadoEnEsteTurno: false
    };
  }

  
  inicializarTableroVacio() {
    return {
      'bosque-semejanza': [],
      'trio-frondoso': [],
      'prado-diferencia': [],
      'pradera-amor': [],
      'isla-solitaria': [],
      'rey-selva': [],
      'dinos-rio': []
    };
  }

  
  generarDinosauriosDisponibles() {
    return [
      { id: 1, tipo: 'triceratops', disponible: true, imagen: 'Recursos/img/dino1.png' },
      { id: 2, tipo: 'stegosaurus', disponible: true, imagen: 'Recursos/img/dino2.png' },
      { id: 3, tipo: 'brontosaurus', disponible: true, imagen: 'Recursos/img/dino3.png' },
      { id: 4, tipo: 'trex', disponible: true, imagen: 'Recursos/img/dino4.png' },
      { id: 5, tipo: 'velociraptor', disponible: true, imagen: 'Recursos/img/dino5.png' },
      { id: 6, tipo: 'pteranodon', disponible: true, imagen: 'Recursos/img/dino6.png' }
    ];
  }

  
  generarMazosIniciales(totalPlayers = 3) {
    const tiposDinosaurios = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex', 'velociraptor', 'pteranodon'];
    const mazos = {};
    for (let p = 1; p <= totalPlayers; p++) {
      mazos[p] = this.crearMazoAleatorio(tiposDinosaurios);
    }
    return mazos;
  }

  crearMazoAleatorio(tiposDinosaurios) {
    const mazo = tiposDinosaurios.map((tipo, index) => ({
      id: `dino_${tipo}_${Date.now()}_${Math.floor(Math.random() * 10000)}_${index}`,
      tipo: tipo,
      disponible: true,
      imagen: `Recursos/img/dino${index + 1}.png`
    }));

    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
    }

    return mazo;
  }

  
  avanzarTurno() {
    /*
      avanzarTurno:
      - Actualiza el estado para pasar al siguiente turno y potencialmente a la siguiente ronda.
      - Reinicia la bandera haColocadoEnEsteTurno para permitir la colocación en el nuevo turno.
      - NO debe encargarse de ejecutar la lógica de los bots; esa responsabilidad se delega
        al controlador principal que coordina la interfaz (por ejemplo digitalPage.js).
    */
    this.guardarEstadoEnHistorial();

    // Guardar jugador previo para saber si se completó la vuelta de todos los jugadores
    const jugadorPrevio = this.estado.jugadorActual;

    this.estado.turnoActual++;

    // Reiniciar la bandera de colocación al inicio de cada nuevo turno
    this.estado.haColocadoEnEsteTurno = false;

    this.estado.jugadorActual++;
    if (this.estado.jugadorActual > this.estado.totalJugadores) {
      this.estado.jugadorActual = 1;
    }

    // Solo avanzar de ronda cuando el jugador previo era el último jugador (todos han jugado)
    if (jugadorPrevio === this.estado.totalJugadores) {
      this.avanzarRonda();
    }
    
    this.actualizarInterfazTurno();
    this.guardarEstado();
    
    console.log(`Turno ${this.estado.turnoActual}, Jugador ${this.estado.jugadorActual}`);

    // NOTA: La lógica de ejecución de bots se delega al controlador de interfaz (digitalPage.js)
  }

  
  avanzarRonda() {
    /*
      avanzarRonda:
      - Incrementa la ronda y reinicia los contadores de turno/jugador para comenzar la nueva ronda.
      - Problema que resuelve: asegura que el dado se lance automáticamente al iniciar cada nueva ronda (evita que bots o validadores bloqueen colocaciones por falta de lanzamiento).
      - Interacción con otros componentes: utiliza window.manejadorDado para obtener el estado del dado, normaliza formatos legacy (diceState, dice, etc.), guarda el estado mediante guardarEstado() y despacha un evento CustomEvent('dadoLanzado') para que la UI y el backend se sincronicen.
    */
    this.estado.rondaActual++;
    this.estado.turnoActual = 1;
    this.estado.jugadorActual = 1;

    try {
      this.rotarMazos();
      console.log('[EstadoJuego] Mazos rotados al iniciar nueva ronda');
    } catch (e) {
      console.warn('[EstadoJuego] Error al rotar mazos:', e);
    }

    // Intentar lanzar y sincronizar el estado del dado automáticamente
    try {
      // Si existe un manejador de dado en ventana lo utilizamos
      if (typeof window !== 'undefined' && window.manejadorDado) {
        try {
          const resultado = window.manejadorDado.lanzarDadoParaRonda(this.estado.rondaActual, this.estado.totalJugadores);

          // Normalizar posibles nombres de propiedad del resultado
          const estadoDadoNormalizado = {
            activo: resultado?.activo ?? resultado?.active ?? true,
            caraActual: resultado?.caraActual ?? resultado?.cara ?? resultado?.face ?? resultado?.currentFace ?? null,
            jugadorQueLanzo: resultado?.jugadorQueLanzo ?? resultado?.jugador ?? resultado?.playerWhoRolled ?? null,
            rondaActual: resultado?.rondaActual ?? resultado?.ronda ?? this.estado.rondaActual,
            descripcionRestriccion: resultado?.descripcionRestriccion ?? resultado?.descripcion ?? resultado?.description ?? ''
          };

          this.estado.dado = estadoDadoNormalizado;
          try { this.guardarEstado(); } catch (e) { console.warn('[EstadoJuego] No se pudo guardar estado tras lanzar dado:', e); }

          console.log('[EstadoJuego] Estado del dado actualizado al avanzarRonda:', estadoDadoNormalizado);

          // Disparar evento para que la UI y listeners externos se sincronicen
          try {
            if (typeof window !== 'undefined') {
              const evento = new CustomEvent('dadoLanzado', { detail: { estado: estadoDadoNormalizado } });
              window.dispatchEvent(evento);
            }
          } catch (evtErr) {
            console.warn('[EstadoJuego] No se pudo despachar evento dadoLanzado:', evtErr);
          }
        } catch (e) {
          console.warn('[EstadoJuego] No se pudo lanzar o guardar el estado del dado en avanzarRonda:', e);
        }
      } else {
        // Si no hay manejador, intentar normalizar estado.dado si proviene de formatos antiguos
        try {
          if (this.estado.dado && typeof this.estado.dado === 'object') {
            // Mapear claves legacy
            const d = this.estado.dado;
            if (typeof d.activo === 'undefined') d.activo = d.active ?? (d.isActive ?? false);
            if (typeof d.caraActual === 'undefined') d.caraActual = d.cara ?? d.face ?? d.currentFace ?? null;
            if (typeof d.jugadorQueLanzo === 'undefined') d.jugadorQueLanzo = d.jugador ?? d.playerWhoRolled ?? null;
            if (typeof d.rondaActual === 'undefined') d.rondaActual = d.ronda ?? this.estado.rondaActual;
            this.estado.dado = d;
            try { this.guardarEstado(); } catch (e) { console.warn('[EstadoJuego] No se pudo guardar estado tras normalizar dado:', e); }

            try {
              if (typeof window !== 'undefined') {
                const evento = new CustomEvent('dadoLanzado', { detail: { estado: this.estado.dado } });
                window.dispatchEvent(evento);
              }
            } catch (evtErr) {
              console.warn('[EstadoJuego] No se pudo despachar evento dadoLanzado tras normalizar:', evtErr);
            }
          }
        } catch (normErr) {
          console.warn('[EstadoJuego] Error normalizando estado.dado sin manejador externo:', normErr);
        }
      }
    } catch (outerErr) {
      console.warn('[EstadoJuego] Error procesando lanzamiento/normalización del dado en avanzarRonda:', outerErr);
    }

    this.actualizarInterfazRonda();

    console.log(`Nueva ronda ${this.estado.rondaActual} - Dinosaurios disponibles: ${this.estado.dinosauriosDisponibles.filter(d => d.disponible).length}`);
  }

  
  /*
   * rotarMazos():
   * - Rota únicamente los dinosaurios marcados como disponibles (disponible === true)
   * - Mantiene los dinosaurios ya colocados (disponible === false) en el mazo original
   * - Usa deep copy para evitar referencias compartidas entre mazos
   * - Rotación definida: los disponibles de 1 → 2, de 2 → 3, de 3 → 1
   */
  rotarMazos() {
    /*
     * Rota los dinosaurios disponibles entre los mazos de los jugadores.
     * - Solo rotan los elementos con disponible === true
     * - El activo de cada jugador pasa al siguiente jugador (1->2->3->...->N->1)
     */
    const mazos = this.estado.mazos || {};
    const total = this.estado.totalJugadores || 3;

    // Preparar arrays separados de activos/inactivos por jugador
    const separados = {};
    for (let i = 1; i <= total; i++) {
      const arr = Array.isArray(mazos[i]) ? JSON.parse(JSON.stringify(mazos[i])) : [];
      separados[i] = {
        activos: (arr || []).filter(d => d && d.disponible === true).map(d => ({ ...d })),
        inactivos: (arr || []).filter(d => d && d.disponible === false).map(d => ({ ...d }))
      };
    }

    // Construir nuevos mazos: el activo del jugador previo se asigna al jugador actual
    const nuevos = {};
    for (let i = 1; i <= total; i++) {
      const prev = i - 1 >= 1 ? i - 1 : total;
      nuevos[i] = [...(separados[prev]?.activos || []), ...(separados[i]?.inactivos || [])];
    }

    this.estado.mazos = nuevos;

    // Log y comprobación de duplicados
    try {
      const allIds = [];
      Object.keys(this.estado.mazos || {}).forEach(k => {
        (this.estado.mazos[k] || []).forEach(d => allIds.push(String(d.id)));
      });
      const duplicates = allIds.filter((id, idx) => allIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        console.warn('[EstadoJuego] Rotación de mazos: IDs duplicados detectados entre mazos:', Array.from(new Set(duplicates)));
      }
    } catch (e) {
      console.warn('[EstadoJuego] No se pudo comprobar unicidad de IDs tras rotar mazos:', e);
    }

    console.log('[EstadoJuego] Rotación de mazos completada. Resumen por jugador:', (function(m){
      const res = {};
      for (let i=1;i<= (this.estado?.totalJugadores || 3); i++) res[i] = (this.estado.mazos[i] || []).length;
      return res;
    }).call(this));

    this.guardarEstado();
  }

  
  colocarDinosaurio(jugadorId, zonaId, dinosaurio, slotId) {
    // Compatibilidad con llamadas antiguas: detectar si se usó la firma antigua
    if ((typeof jugadorId === 'string' || typeof jugadorId === 'number') && typeof zonaId === 'undefined') {
      // Firma legacy: colocarDinosaurio(zonaId, dinosaurio, slotId)
      zonaId = String(jugadorId);
      dinosaurio = zonaId; // no-op guard
      jugadorId = this.estado.jugadorActual || 1;
    }

    // Validar jugadorId numérico y en rango
    let jugador = parseInt(jugadorId, 10);
    if (!Number.isInteger(jugador) || jugador < 1 || jugador > (this.estado.totalJugadores || 3)) {
      console.warn(`[EstadoJuego] jugadorId inválido recibido (${jugadorId}). Usando jugadorActual ${this.estado.jugadorActual}`);
      jugador = this.estado.jugadorActual || 1;
    }

    // Validar que el dado haya sido lanzado antes de permitir la colocación
    try {
      if (!this.estado.dado || !this.estado.dado.activo) {
        console.warn('[EstadoJuego] Intento de colocar sin haber lanzado el dado');
        if (typeof window !== 'undefined' && window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
          window.tableroJuego.mostrarMensaje('Debe lanzar el dado antes de colocar un dinosaurio', 'error');
        }
        return false;
      }
    } catch (e) {
      console.warn('[EstadoJuego] Error comprobando estado del dado antes de colocar:', e);
    }

    // Validar que el jugador no haya colocado ya en este turno
    if (this.estado.haColocadoEnEsteTurno) {
      console.warn('[EstadoJuego] Jugador ya colocó en este turno');
      if (typeof window !== 'undefined' && window.tableroJuego && typeof window.tableroJuego.mostrarMensaje === 'function') {
        window.tableroJuego.mostrarMensaje('Solo puede colocar un dinosaurio por turno', 'error');
      }
      return false;
    }

    const tipo = dinosaurio.tipo ?? dinosaurio.type ?? 'desconocido';
    const imagen = dinosaurio.imagen ?? dinosaurio.image ?? this.obtenerImagenPorTipo(tipo);

    const slotParsed = typeof slotId === 'string' ? parseInt(slotId, 10) : slotId;

    const dinosaurioCompleto = Object.assign({}, dinosaurio, {
      id: dinosaurio.id ?? (`dino_${tipo}_${Date.now()}`),
      tipo: tipo,
      imagen: imagen,
      slot: typeof slotParsed === 'number' ? slotParsed : slotId,
      turnoColocado: this.estado.turnoActual,
      jugadorColocado: jugador
    });

    if (!this.estado.tableros) this.estado.tableros = {};
    if (!this.estado.tableros[jugador]) this.estado.tableros[jugador] = this.inicializarTableroVacio();
    if (!this.estado.tableros[jugador][zonaId]) this.estado.tableros[jugador][zonaId] = [];

    // Insertar en el tablero específico del jugador objetivo
    this.estado.tableros[jugador][zonaId].push(dinosaurioCompleto);

    // Marcar que se ha colocado en este turno
    this.estado.haColocadoEnEsteTurno = true;

    try {
      const dinoDisponible = this.estado.dinosauriosDisponibles.find(d => d.id === dinosaurioCompleto.id);
      if (dinoDisponible) dinoDisponible.disponible = false;
    } catch (e) {
      console.warn('[EstadoJuego] Error marcando dinosaurio en pool global como no disponible', e);
    }

    try {
      const mazoJugador = this.estado.mazos && this.estado.mazos[jugador];
      if (Array.isArray(mazoJugador)) {
        const dinoEnMazo = mazoJugador.find(d => d && (String(d.id) === String(dinosaurioCompleto.id) || d.tipo === dinosaurioCompleto.tipo || d.type === dinosaurioCompleto.tipo));
        if (dinoEnMazo) dinoEnMazo.disponible = false;
      } else {
        // No hubo mazo para el jugador objetivo: informar
        console.warn(`[EstadoJuego] No se encontró mazo para jugador ${jugador} al marcar dinosaurio como no disponible`);
      }
    } catch (e) {
      console.warn('[EstadoJuego] No se pudo sincronizar mazo del jugador al colocar dinosaurio', e);
    }

    this.estado.estadisticas.movimientosRealizados++;

    this.guardarEstado();

    // Logging adicional para depuración de mazos y estados
    try {
      console.log('[EstadoJuego] Estado de mazos luego de colocar dinosaurio:', JSON.parse(JSON.stringify(this.estado.mazos)));

      // Verificar ids únicos entre mazos
      const ids = [];
      Object.values(this.estado.mazos || {}).forEach(mazo => {
        (mazo || []).forEach(d => ids.push(String(d.id)));
      });
      const dup = ids.filter((id, idx) => ids.indexOf(id) !== idx);
      if (dup.length) console.warn('[EstadoJuego] IDs duplicados detectados al colocar:', Array.from(new Set(dup)));
    } catch (e) {
      console.warn('[EstadoJuego] No se pudo loggear estado de mazos tras colocar:', e);
    }

    console.log(`[EstadoJuego] Dinosaurio colocado en zona='${zonaId}' (jugador ${jugador}):`, dinosaurioCompleto);
    return true;
  }

  obtenerImagenPorTipo(tipo) {
    const mapaImagenes = {
      'triceratops': 'Recursos/img/dino1.png',
      'stegosaurus': 'Recursos/img/dino2.png',
      'brontosaurus': 'Recursos/img/dino3.png',
      'trex': 'Recursos/img/dino4.png',
      'velociraptor': 'Recursos/img/dino5.png',
      'pteranodon': 'Recursos/img/dino6.png',
      'desconocido': 'Recursos/img/dino1.png'
    };

    try {
      return mapaImagenes[tipo] || 'Recursos/img/dino1.png';
    } catch (e) {
      console.warn('[EstadoJuego] obtenerImagenPorTipo falló para tipo:', tipo, e);
      return 'Recursos/img/dino1.png';
    }
  }

  
  calcularPuntuacion() {

    const todosLosTableros = this.estado.tableros || {};

    try {
      Object.keys(todosLosTableros).forEach(jId => {
        const tableroJugador = todosLosTableros[jId] || this.inicializarTableroVacio();
        if (!this.estado.puntuacion) this.estado.puntuacion = {};
        if (typeof calculadoraPuntuacion !== 'undefined' && calculadoraPuntuacion && typeof calculadoraPuntuacion.calcularPuntuacionJugador === 'function') {
          const resultado = calculadoraPuntuacion.calcularPuntuacionJugador(tableroJugador, parseInt(jId), todosLosTableros);
          this.estado.puntuacion[`jugador${jId}`] = resultado?.total ?? 0;
        } else {
          this.estado.puntuacion[`jugador${jId}`] = 0;
        }
      });
    } catch (e) {
      console.warn('[EstadoJuego] Error calculando puntuaciones por tablero:', e);
    }

    this.actualizarInterfazPuntuacion();
    return this.estado.puntuacion;
  }

  
  obtenerTableroOtroJugador() {


    return this.inicializarTableroVacio();
  }

  
  verificarFinJuego() {
    try {
      // Verificar primero si todos los mazos están vacíos de dinosaurios disponibles
      let todosMazosVacios = true;
      let totalDinosauriosDisponibles = 0;
      
      // Contar dinosaurios disponibles en todos los mazos
      for (let jugadorId = 1; jugadorId <= this.estado.totalJugadores; jugadorId++) {
        const mazo = (this.estado.mazos && this.estado.mazos[jugadorId]) || [];
        const disponiblesEnMazo = mazo.filter(d => d && d.disponible === true).length;
        
        if (disponiblesEnMazo > 0) {
          todosMazosVacios = false;
        }
        
        totalDinosauriosDisponibles += disponiblesEnMazo;
      }
  
      // Si todos los mazos están vacíos, el juego termina inmediatamente
      if (todosMazosVacios || totalDinosauriosDisponibles === 0) {
        console.log('Fin del juego: Todos los mazos están vacíos de dinosaurios disponibles');
        this.finalizarJuego();
        return true;
      }
  
      // Verificación adicional con el pool global (fallback)
      const dinosauriosGlobalesDisponibles = this.estado.dinosauriosDisponibles.filter(d => d && d.disponible === true);
      
      if (dinosauriosGlobalesDisponibles.length === 0 && totalDinosauriosDisponibles === 0) {
        console.log('Fin del juego: No hay más dinosaurios disponibles en ningún lugar');
        this.finalizarJuego();
        return true;
      }
  
      // Verificar límite máximo de rondas
      const rondasMaximas = 15; // Aumentado para permitir partidas más largas
      if (this.estado.rondaActual > rondasMaximas) {
        console.log('Fin del juego: Máximo de rondas alcanzado');
        this.finalizarJuego();
        return true;
      }
  
      // Verificación de seguridad: si hay más de 50 turnos, algo está mal
      if (this.estado.turnoActual > 50) {
        console.warn('Fin del juego forzado: Demasiados turnos ejecutados, posible bucle infinito');
        this.finalizarJuego();
        return true;
      }
  
      // El juego continúa
      console.log(`Juego continúa - Dinosaurios disponibles: ${totalDinosauriosDisponibles}, Ronda: ${this.estado.rondaActual}, Turno: ${this.estado.turnoActual}`);
      return false;
  
    } catch (error) {
      console.error('Error en verificarFinJuego:', error);
      // En caso de error, mejor finalizar el juego que quedar en bucle infinito
      console.warn('Finalizando juego por error en verificación');
      this.finalizarJuego();
      return true;
    }
  }

  
  finalizarJuego() {
    this.estado.estadisticas.tiempoJuego = new Date() - this.estado.estadisticas.inicioPartida;
    
    const puntuacionFinal = this.calcularPuntuacion();
    const ganador = puntuacionFinal.jugador1 > puntuacionFinal.jugador2 ? 1 : 2;
    
    this.mostrarResultadosFinales(ganador, puntuacionFinal);
    this.guardarEstadisticasFinales();
    
    console.log('¡Juego terminado!', { ganador, puntuacionFinal });
  }

  
  deshacerMovimiento() {
    if (this.historial.length === 0) {
      console.log('No hay movimientos para deshacer');
      return false;
    }

    const estadoAnterior = this.historial.pop();
    this.estado = { ...estadoAnterior };
    
    this.actualizarInterfazCompleta();
    this.guardarEstado();
    
    console.log('Movimiento deshecho');
    return true;
  }

  
  guardarEstadoEnHistorial() {

    if (this.historial.length >= 10) {
      this.historial.shift();
    }
    
    this.historial.push(JSON.parse(JSON.stringify(this.estado)));
  }

  
  reiniciarJuego() {
    this.estado = this.inicializarEstado();
    this.historial = [];
    
    this.actualizarInterfazCompleta();
    this.limpiarAlmacenamientoLocal();
    
    console.log('Juego reiniciado');
  }

  
  configurarPersistencia() {

    this.cargarEstado();

    setInterval(() => {
      this.guardarEstado();
    }, 30000);

    window.addEventListener('beforeunload', () => {
      this.guardarEstado();
    });
  }

  
  guardarEstado() {
    try {
      const estadoParaGuardar = {
        ...this.estado,
        fechaGuardado: new Date().toISOString()
      };
      
      localStorage.setItem('draftosaurus_estado', JSON.stringify(estadoParaGuardar));
    } catch (error) {
      console.error('Error al guardar estado:', error);
    }
  }

  
  cargarEstado() {
    try {
      const estadoGuardado = localStorage.getItem('draftosaurus_estado');
      
      if (estadoGuardado) {
        const estadoParsed = JSON.parse(estadoGuardado);

        const fechaGuardado = new Date(estadoParsed.fechaGuardado);
        const ahora = new Date();
        const diferencia = ahora - fechaGuardado;
        
        if (diferencia < 24 * 60 * 60 * 1000) { // 24 horas en milisegundos
          this.estado = { ...this.estado, ...estadoParsed };
          console.log('Estado cargado desde localStorage');
        }
      }
    } catch (error) {
      console.error('Error al cargar estado:', error);
    }
  }

  
  limpiarAlmacenamientoLocal() {
    localStorage.removeItem('draftosaurus_estado');
  }

  
  actualizarInterfazTurno() {
    const elementoTurno = document.querySelector('.ronda-actual .valor');
    if (elementoTurno) {
      elementoTurno.textContent = this.estado.turnoActual;
    }

    const elementoJugadores = document.querySelector('.cantidad-jugadores .valor');
    if (elementoJugadores) {
      elementoJugadores.textContent = this.estado.jugadorActual;
    }
  }

  
  actualizarInterfazRonda() {
    const elementoRonda = document.querySelector('.ronda-actual');
    if (elementoRonda) {
      elementoRonda.innerHTML = `Ronda: <span class="valor">${this.estado.rondaActual}</span>`;
    }
  }

  
  actualizarInterfazPuntuacion() {

    console.log('Puntuación actualizada:', this.estado.puntuacion);
  }

  
  actualizarInterfazCompleta() {
    this.actualizarInterfazTurno();
    this.actualizarInterfazRonda();
    this.actualizarInterfazPuntuacion();

    this.actualizarTableroVisual();
  }

  
  actualizarTableroVisual() {

    document.querySelectorAll('.slot').forEach(slot => {
      slot.innerHTML = '';
      slot.dataset.ocupado = 'false';
    });

    const tableroUsuario = (this.estado.tableros && this.estado.tableros[1]) ? this.estado.tableros[1] : this.inicializarTableroVacio();

    Object.entries(tableroUsuario).forEach(([zonaId, dinosaurios]) => {
      dinosaurios.forEach(dino => {
        const zona = document.querySelector(`[data-zona="${zonaId}"]`);
        if (!zona) return;
        const slot = zona.querySelector(`[data-slot="${dino.slot}"]`);
        if (slot) {
          const img = document.createElement('img');
          img.src = dino.imagen;
          img.alt = `Dinosaurio ${dino.tipo}`;
          img.style.width = '100px';
          img.style.height = '100px';
          img.style.objectFit = 'contain';
          img.style.position = 'absolute';
          img.style.top = '50%';
          img.style.left = '50%';
          img.style.transform = 'translate(-50%, -50%)';
          img.style.zIndex = '10';
          img.style.pointerEvents = 'none';

          slot.appendChild(img);
          slot.dataset.ocupado = 'true';
        }
      });
    });

    document.querySelectorAll('.dinosaurio').forEach((dino, index) => {
      try {
        const estado = this.estado;
        const jugador = estado.jugadorActual || 1;
        const mazoJugador = (estado.mazos && estado.mazos[jugador]) || null;

        if (mazoJugador && mazoJugador[index]) {
          const dinoData = mazoJugador[index];
          if (dinoData && !dinoData.disponible) {
            dino.style.display = 'none';
          } else {
            dino.style.display = 'flex';
          }
        } else {
          const dinoDataGlobal = this.estado.dinosauriosDisponibles[index];
          if (dinoDataGlobal && !dinoDataGlobal.disponible) {
            dino.style.display = 'none';
          } else {
            dino.style.display = 'flex';
          }
        }
      } catch (err) {

      }
    });
  }

  
  mostrarResultadosFinales(ganador, puntuacion) {
    const modal = document.createElement('div');
    modal.className = 'modal-resultados';
    modal.innerHTML = `
      <div class="contenido-modal">
        <h2>¡Juego Terminado!</h2>
        <div class="resultados">
          <h3>🏆 Ganador: Jugador ${ganador}</h3>
          <div class="puntuaciones">
            <p>Jugador 1: ${puntuacion.jugador1} puntos</p>
            <p>Jugador 2: ${puntuacion.jugador2} puntos</p>
          </div>
          <div class="estadisticas">
            <p>Movimientos realizados: ${this.estado.estadisticas.movimientosRealizados}</p>
            <p>Tiempo de juego: ${Math.round(this.estado.estadisticas.tiempoJuego / 1000 / 60)} minutos</p>
          </div>
        </div>
        <div class="acciones-finales">
          <button onclick="this.closest('.modal-resultados').remove()">Cerrar</button>
          <button onclick="estadoJuego.reiniciarJuego(); this.closest('.modal-resultados').remove()">Nuevo Juego</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  
  guardarEstadisticasFinales() {
    const estadisticas = {
      fecha: new Date().toISOString(),
      puntuacion: this.estado.puntuacion,
      estadisticas: this.estado.estadisticas,
      rondas: this.estado.rondaActual
    };

    let historialPartidas = JSON.parse(localStorage.getItem('draftosaurus_historial') || '[]');
    historialPartidas.push(estadisticas);

    if (historialPartidas.length > 50) {
      historialPartidas = historialPartidas.slice(-50);
    }
    
    localStorage.setItem('draftosaurus_historial', JSON.stringify(historialPartidas));
  }

  
  obtenerEstado() {
    return { ...this.estado };
  }

  
  obtenerEstadisticas() {
    return {
      ...this.estado.estadisticas,
      tiempoJuegoActual: new Date() - this.estado.estadisticas.inicioPartida
    };
  }

  
  configurarJuego(opciones) {
    this.estado.configuracion = { ...this.estado.configuracion, ...opciones };
    this.guardarEstado();
    
    console.log('Configuración actualizada:', this.estado.configuracion);
  }
}