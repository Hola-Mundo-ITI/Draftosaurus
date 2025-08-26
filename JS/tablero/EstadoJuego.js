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
    return {
      turnoActual: 1,
      rondaActual: 1,
      jugadorActual: 1,
      totalJugadores: 3,
      tableros: {
        1: this.inicializarTableroVacio(),
        2: this.inicializarTableroVacio(),
        3: this.inicializarTableroVacio()
      },
      puntuacion: {
        jugador1: 0,
        jugador2: 0,
        jugador3: 0
      },
      dinosauriosDisponibles: this.generarDinosauriosDisponibles(),

      mazos: this.generarMazosIniciales(),
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
      }
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

  
  generarMazosIniciales() {
    const tiposDinosaurios = ['triceratops', 'stegosaurus', 'brontosaurus', 'trex', 'velociraptor', 'pteranodon'];
    return {
      1: this.crearMazoAleatorio(tiposDinosaurios),
      2: this.crearMazoAleatorio(tiposDinosaurios),
      3: this.crearMazoAleatorio(tiposDinosaurios)
    };
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
    this.guardarEstadoEnHistorial();
    
    this.estado.turnoActual++;

    this.estado.jugadorActual++;
    if (this.estado.jugadorActual > this.estado.totalJugadores) {
      this.estado.jugadorActual = 1;
    }


    if (this.estado.turnoActual % this.estado.totalJugadores === 0 && this.estado.turnoActual > 0) {
      this.avanzarRonda();
    }
    
    this.actualizarInterfazTurno();
    this.guardarEstado();
    
    console.log(`Turno ${this.estado.turnoActual}, Jugador ${this.estado.jugadorActual}`);

    if (window.sistemaBots && window.sistemaBots.esBot(this.estado.jugadorActual)) {
      setTimeout(() => {
        window.sistemaBots.ejecutarTurnoBot(this.estado.jugadorActual);
      }, 500);
    }
  }

  
  avanzarRonda() {
    this.estado.rondaActual++;
    this.estado.turnoActual = 1;
    this.estado.jugadorActual = 1;

    try {
      this.rotarMazos();
      console.log('[EstadoJuego] Mazos rotados al iniciar nueva ronda');
    } catch (e) {
      console.warn('[EstadoJuego] Error al rotar mazos:', e);
    }



    if (window.manejadorDado) {
      try {
        const estadoDado = window.manejadorDado.lanzarDadoParaRonda(this.estado.rondaActual, this.estado.totalJugadores);
        if (estadoDado) {
          this.estado.dado = estadoDado;

          this.guardarEstado();
          console.log('[EstadoJuego] Estado del dado actualizado al avanzarRonda:', estadoDado);
        }
      } catch (e) {
        console.warn('[EstadoJuego] No se pudo lanzar o guardar el estado del dado en avanzarRonda:', e);
      }
    }
    
    this.actualizarInterfazRonda();
    
    console.log(`Nueva ronda ${this.estado.rondaActual} - Dinosaurios disponibles: ${this.estado.dinosauriosDisponibles.filter(d => d.disponible).length}`);
  }

  
  rotarMazos() {
    const mazos = this.estado.mazos || {};
    const temp = mazos[1];
    mazos[1] = mazos[2] || [];
    mazos[2] = mazos[3] || [];
    mazos[3] = temp || [];
    this.estado.mazos = mazos;

    this.guardarEstado();
  }

  
  colocarDinosaurio(jugadorId, zonaId, dinosaurio, slotId) {

    // Compatibilidad con llamadas antiguas: colocarDinosaurio(zonaId, dinosaurio, slotId)
    if (typeof jugadorId === 'string' && typeof zonaId !== 'string') {
      // Forma legacy detectada: primer parámetro es zonaId
      slotId = dinosaurio;
      dinosaurio = zonaId;
      zonaId = jugadorId;
      jugadorId = this.estado.jugadorActual || 1;
    }

    const tipo = dinosaurio.tipo ?? dinosaurio.type ?? 'desconocido';
    const imagen = dinosaurio.imagen ?? dinosaurio.image ?? this.obtenerImagenPorTipo(tipo);
    const jugador = jugadorId || (this.estado.jugadorActual || 1);

    const dinosaurioCompleto = {
      ...dinosaurio,
      id: dinosaurio.id ?? (`dino_${tipo}_${Date.now()}`),
      tipo: tipo,
      imagen: imagen,
      slot: slotId,
      turnoColocado: this.estado.turnoActual,
      jugadorColocado: jugador
    };

    if (!this.estado.tableros) this.estado.tableros = {};
    if (!this.estado.tableros[jugador]) this.estado.tableros[jugador] = this.inicializarTableroVacio();
    if (!this.estado.tableros[jugador][zonaId]) this.estado.tableros[jugador][zonaId] = [];

    this.estado.tableros[jugador][zonaId].push(dinosaurioCompleto);

    try {
      const dinoDisponible = this.estado.dinosauriosDisponibles.find(d => d.id === dinosaurioCompleto.id);
      if (dinoDisponible) dinoDisponible.disponible = false;
    } catch (e) {
      console.warn('[EstadoJuego] Error marcando dinosaurio en pool global como no disponible', e);
    }

    try {
      const mazoJugador = this.estado.mazos && this.estado.mazos[jugador];
      if (mazoJugador) {
        const dinoEnMazo = mazoJugador.find(d => d.id === dinosaurioCompleto.id || d.id == dinosaurioCompleto.id || d.tipo === dinosaurioCompleto.tipo);
        if (dinoEnMazo) dinoEnMazo.disponible = false;
      }
    } catch (e) {
      console.warn('[EstadoJuego] No se pudo sincronizar mazo del jugador al colocar dinosaurio', e);
    }

    this.estado.estadisticas.movimientosRealizados++;

    this.guardarEstado();

    console.log(`Dinosaurio colocado en ${zonaId} (jugador ${jugador}):`, dinosaurioCompleto);
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
      for (let jugadorId = 1; jugadorId <= this.estado.totalJugadores; jugadorId++) {
        const mazo = (this.estado.mazos && this.estado.mazos[jugadorId]) || [];
        const tiene = mazo.some(d => d.disponible);
        if (tiene) return false; // Aún hay dinosaurios en algún mazo
      }

      console.log('Fin del juego: Todos los mazos están vacíos');
      this.finalizarJuego();
      return true;
    } catch (e) {
      console.warn('[EstadoJuego] Error verificando fin de juego por mazos, cayendo al chequeo anterior', e);
    }

    const dinosauriosDisponibles = this.estado.dinosauriosDisponibles.filter(d => d.disponible);

    if (dinosauriosDisponibles.length === 0) {

      const jugadoresQueHanJugadoEnRonda = (this.estado.turnoActual - 1) % this.estado.totalJugadores;
      
      if (jugadoresQueHanJugadoEnRonda === 0) {
        console.log('Fin del juego: No hay más dinosaurios disponibles y ronda completa');
        this.finalizarJuego();
        return true;
      } else {
        console.log(`Esperando que terminen los turnos restantes de la ronda. Faltan ${this.estado.totalJugadores - jugadoresQueHanJugadoEnRonda} jugadores`);
        return false;
      }
    }

    const rondasMaximas = 10;
    if (this.estado.rondaActual > rondasMaximas) {
      console.log('Fin del juego: Máximo de rondas alcanzado');
      this.finalizarJuego();
      return true;
    }

    return false;
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