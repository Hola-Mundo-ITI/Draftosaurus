<?php
$pageTitle = "Partida Virtual - Draftosaurus";
$pageDescription = "Partida Virtual de Draftosaurus - Juega online con dinosaurios";
$specificCSS = "digitalPage.css";
$specificJS = [
  "utils/mapeoDinosaurios.js",
  "utils/animaciones.js",
  "utils/tooltips.js",
  "utils/calibradorTablero.js",
  "utils/controladorTamano.js",
  "tablero/EstadoJuego.js",
  "tablero/ManejadorSeleccion.js",
  "tablero/TableroPointClick.js",
  "tablero/ManejadorDado.js",
  "tablero/SistemaBots.js",
  "utils/validadorDado.js",
  "digitalPage.js"
];

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>
  
  <header class="encabezado-partida">
    <div class="ronda-actual" aria-live="polite">Ronda: <span class="valor">1</span></div>
    <h1 class="titulo">Partida Virtual</h1>
    <div class="datos-juego">
      <div class="dado-virtual" role="button" aria-label="Dado virtual para el juego - Haz clic para lanzar" onclick="lanzarDadoManual()" tabindex="0">
        <img id="imagen-dado" src="Recursos/img/dado.png" alt="Dado Virtual mostrando resultado" />
        <div class="texto-dado">Lanzar Dado</div>
      </div>
      <div class="cantidad-jugadores" aria-live="polite"><span class="valor">Partida Automática</span> (Tú vs <span id="numero-bots">2</span> Bots)</div>
    </div>
  </header>
  
  <!-- Inicializar configuración de bots según parámetro GET 'bots' -->
  <script>
    (function(){
      // Leer parámetro 'bots' desde la URL en el cliente y normalizar entre 2 y 4
      const urlParams = new URLSearchParams(window.location.search);
      let selectedBots = parseInt(urlParams.get('bots')) || null;
      if (selectedBots === null || Number.isNaN(selectedBots)) selectedBots = 3; // fallback si no se especifica
      selectedBots = Math.max(2, Math.min(4, selectedBots));

      // Exponer configuración global para el resto de scripts
      window.SELECTED_BOTS_COUNT = selectedBots; // número de bots seleccionados
      window.INIT_TOTAL_JUGADORES = selectedBots + 1; // humano (1) + bots

      // Construir mapping de bots: jugadores 2..N son bots activos
      const nombres = ['Bot Alpha','Bot Beta','Bot Gamma','Bot Delta'];
      const botsMap = {};
      for (let i = 0; i < selectedBots; i++) {
        const playerId = i + 2; // bots comienzan en jugador 2
        botsMap[playerId] = { nombre: nombres[i] || `Bot ${i+1}`, activo: true };
      }
      window.INIT_BOT_MAP = botsMap;

      // Actualizar UI indicador de cantidad de bots
      function updateBotUI() {
        const span = document.getElementById('numero-bots');
        if (span) span.textContent = String(window.SELECTED_BOTS_COUNT);
        const jugadoresValor = document.querySelector('.cantidad-jugadores .valor');
        if (jugadoresValor) jugadoresValor.textContent = `Partida Automática (Tú vs ${window.SELECTED_BOTS_COUNT} Bot${window.SELECTED_BOTS_COUNT>1?'s':''})`;
      }

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateBotUI); else updateBotUI();

      // Esperar a que la clase SistemaBots exista y crear la instancia cliente ligera
      const tryInit = setInterval(() => {
        if (typeof SistemaBots === 'function') {
          try {
            window.sistemaBots = new SistemaBots({ bots: window.INIT_BOT_MAP, tiempoEspera: 1200 });
            console.log('SistemaBots cliente inicializado. Bots configurados:', Object.keys(window.INIT_BOT_MAP).length);
          } catch (e) {
            console.warn('No se pudo instanciar SistemaBots automáticamente:', e);
          }
          clearInterval(tryInit);
        }
      }, 200);

      // Guardar variable para compatibilidad con EstadoJuego (que lee window.INIT_TOTAL_JUGADORES)
    })();
  </script>

  <main id="mainContent" class="zona-juego" role="main">
    <section class="zona-dinos izquierda" aria-label="Dinosaurios disponibles - lado izquierdo">
      <h2 class="visually-hidden">Dinosaurios disponibles para colocar</h2>
      <div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 1">
        <img src="Recursos/img/dino1.png" alt="Fósil 1" />
      </div>
      <div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 2">
        <img src="Recursos/img/dino2.png" alt="Fósil 2" />
      </div>
      <div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 3">
        <img src="Recursos/img/dino3.png" alt="Fósil 3" />
      </div>
    </section>
    
    <section class="contenedor-tablero">
      <div id="tablero" class="tablero-juego" role="grid" aria-label="Tablero de juego principal">
        
        <!-- Bosque de la Semejanza -->
        <div class="zona-tablero bosque-semejanza" data-zona="bosque-semejanza" data-regla="mismo-tipo">
          <h3 class="titulo-zona">Bosque de la Semejanza</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot 1 del Bosque de la Semejanza"></div>
            <div class="slot" data-slot="2" data-ocupado="false" role="gridcell" aria-label="Slot 2 del Bosque de la Semejanza"></div>
            <div class="slot" data-slot="3" data-ocupado="false" role="gridcell" aria-label="Slot 3 del Bosque de la Semejanza"></div>
            <div class="slot" data-slot="4" data-ocupado="false" role="gridcell" aria-label="Slot 4 del Bosque de la Semejanza"></div>
            <div class="slot" data-slot="5" data-ocupado="false" role="gridcell" aria-label="Slot 5 del Bosque de la Semejanza"></div>
            <div class="slot" data-slot="6" data-ocupado="false" role="gridcell" aria-label="Slot 6 del Bosque de la Semejanza"></div>
          </div>
        </div>

        <!-- El Trío Frondoso -->
        <div class="zona-tablero trio-frondoso" data-zona="trio-frondoso" data-regla="exactamente-tres">
          <h3 class="titulo-zona">El Trío Frondoso</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot 1 del Trío Frondoso"></div>
            <div class="slot" data-slot="2" data-ocupado="false" role="gridcell" aria-label="Slot 2 del Trío Frondoso"></div>
            <div class="slot" data-slot="3" data-ocupado="false" role="gridcell" aria-label="Slot 3 del Trío Frondoso"></div>
          </div>
        </div>

        <!-- Prado de la Diferencia -->
        <div class="zona-tablero prado-diferencia" data-zona="prado-diferencia" data-regla="todos-diferentes">
          <h3 class="titulo-zona">Prado de la Diferencia</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot 1 del Prado de la Diferencia"></div>
            <div class="slot" data-slot="2" data-ocupado="false" role="gridcell" aria-label="Slot 2 del Prado de la Diferencia"></div>
            <div class="slot" data-slot="3" data-ocupado="false" role="gridcell" aria-label="Slot 3 del Prado de la Diferencia"></div>
            <div class="slot" data-slot="4" data-ocupado="false" role="gridcell" aria-label="Slot 4 del Prado de la Diferencia"></div>
            <div class="slot" data-slot="5" data-ocupado="false" role="gridcell" aria-label="Slot 5 del Prado de la Diferencia"></div>
            <div class="slot" data-slot="6" data-ocupado="false" role="gridcell" aria-label="Slot 6 del Prado de la Diferencia"></div>
          </div>
        </div>

        <!-- La Pradera del Amor -->
        <div class="zona-tablero pradera-amor" data-zona="pradera-amor" data-regla="parejas">
          <h3 class="titulo-zona">La Pradera del Amor</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot 1 de la Pradera del Amor"></div>
            <div class="slot" data-slot="2" data-ocupado="false" role="gridcell" aria-label="Slot 2 de la Pradera del Amor"></div>
            <div class="slot" data-slot="3" data-ocupado="false" role="gridcell" aria-label="Slot 3 de la Pradera del Amor"></div>
            <div class="slot" data-slot="4" data-ocupado="false" role="gridcell" aria-label="Slot 4 de la Pradera del Amor"></div>
            <div class="slot" data-slot="5" data-ocupado="false" role="gridcell" aria-label="Slot 5 de la Pradera del Amor"></div>
            <div class="slot" data-slot="6" data-ocupado="false" role="gridcell" aria-label="Slot 6 de la Pradera del Amor"></div>
          </div>
        </div>

        <!-- La Isla Solitaria -->
        <div class="zona-tablero isla-solitaria" data-zona="isla-solitaria" data-regla="uno-solo">
          <h3 class="titulo-zona">La Isla Solitaria</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot único de la Isla Solitaria"></div>
          </div>
        </div>

        <!-- El Rey de la Selva -->
        <div class="zona-tablero rey-selva" data-zona="rey-selva" data-regla="mas-grande">
          <h3 class="titulo-zona">El Rey de la Selva</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot único del Rey de la Selva"></div>
          </div>
        </div>

        <!-- Dinosaurios en el Río -->
        <div class="zona-tablero dinos-rio" data-zona="dinos-rio" data-regla="secuencia">
          <h3 class="titulo-zona">Dinosaurios en el Río</h3>
          <div class="slots-zona">
            <div class="slot" data-slot="1" data-ocupado="false" role="gridcell" aria-label="Slot 1 de Dinosaurios en el Río"></div>
            <div class="slot" data-slot="2" data-ocupado="false" role="gridcell" aria-label="Slot 2 de Dinosaurios en el Río"></div>
            <div class="slot" data-slot="3" data-ocupado="false" role="gridcell" aria-label="Slot 3 de Dinosaurios en el Río"></div>
            <div class="slot" data-slot="4" data-ocupado="false" role="gridcell" aria-label="Slot 4 de Dinosaurios en el Río"></div>
            <div class="slot" data-slot="5" data-ocupado="false" role="gridcell" aria-label="Slot 5 de Dinosaurios en el Río"></div>
            <div class="slot" data-slot="6" data-ocupado="false" role="gridcell" aria-label="Slot 6 de Dinosaurios en el Río"></div>
            <div class="slot" data-slot="7" data-ocupado="false" role="gridcell" aria-label="Slot 7 de Dinosaurios en el Río"></div>
          </div>
        </div>



      </div>
      <nav class="acciones-juego">
        <button id="btn-lanzar-dado" class="boton-lanzar-dado" onclick="lanzarDadoManual()" title="Lanzar dado para nueva restricción">
          Lanzar Dado
        </button>
        <a href="puntaje.php" class="boton-puntaje" role="button">Ver Puntaje</a>
      </nav>
    </section>
    
    <section class="zona-dinos derecha" aria-label="Dinosaurios disponibles - lado derecho">
      <h2 class="visually-hidden">Más dinosaurios disponibles</h2>
      <div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 4">
        <img src="Recursos/img/dino4.png" alt="Fósil 4" />
      </div>
      <div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 5">
        <img src="Recursos/img/dino5.png" alt="Fósil 5" />
      </div>
      <div class="dinosaurio" draggable="true" role="button" tabindex="0" aria-label="Fósil de dinosaurio 6">
        <img src="Recursos/img/dino6.png" alt="Fósil 6" />
      </div>
    </section>
  </main>
  
<?php include 'includes/footer.php'; ?>