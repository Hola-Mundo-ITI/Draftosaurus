<?php
session_start();
require_once 'negocio/utilidades/idioma/idiomas.php';

$pageTitle = "Partida Virtual - Draftosaurus";
$specificCSS = "digitalPag.css";
$specificJS = ["digitalPag.js", "utilidades/puntuacionDigital.js", "multijugador/multijugador.js"];

include 'presentacion/includes/head.php';
?>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<body>
  <header class="header-partida">
  <?php include 'presentacion/includes/navigation.php'; ?>
    <div class="header-izquierda">
      <div class="info-jugador-actual">
        <span class="etiqueta-turno"><?php echo t('turno_de'); ?></span>
        <span class="nombre-jugador-actual" id="nombreJugadorActual"><?php echo t('jugador'); ?> 1</span>
      </div>
      <div class="ronda-actual">
        <span class="icono-ronda"><?php echo t('ronda'); ?></span>
        <span class="numero-ronda" id="numRonda">1</span>
      </div>
    </div>
    
    <div class="header-derecha">
      <div class="dado-container">
        <div class="dado-virtual" onclick="lanzarDado()">
          <img id="imagenDado" src="Recursos/img/dado.png" alt="Dado" />
        </div>
      </div>
      <button id="botonPasarTurno" class="boton-pasar-turno"><?php echo t('pasar_turno'); ?></button>
      <button id="botonExportar" class="boton-exportar"><?php echo t('exportar'); ?></button>
    </div>
  </header>
  
  <main id="mainContent" class="zona-juego">
    <section class="zona-dinos izquierda">
      <div class="dinosaurio" onclick="seleccionarDino(1)" data-dino="1">
        <img src="Recursos/img/dino1.png" alt="Dino 1" />
      </div>
      <div class="dinosaurio" onclick="seleccionarDino(2)" data-dino="2">
        <img src="Recursos/img/dino2.png" alt="Dino 2" />
      </div>
      <div class="dinosaurio" onclick="seleccionarDino(3)" data-dino="3">
        <img src="Recursos/img/dino3.png" alt="Dino 3" />
      </div>
    </section>

    <section class="contenedor-tablero">
      <div id="tablero" class="tablero-juego">
        <div class="parent">
          <div class="div1 casilla" data-casilla="1">
            <div class="casillerosBosqueSemejanza">
              <div class="casillero-item clickeable" onclick="colocarDino('1-1')" data-casilla="1-1"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('1-2')" data-casilla="1-2"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('1-3')" data-casilla="1-3"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('1-4')" data-casilla="1-4"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('1-5')" data-casilla="1-5"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('1-6')" data-casilla="1-6"></div>
            </div>
          </div>
          <div class="div2 casilla" data-casilla="2"></div>
          <div class="div3 casilla" data-casilla="3">
            <div class="reySelva">
              <div class="casillero-item clickeable" onclick="colocarDino('3-1')" data-casilla="3-1"></div>
            </div>
          </div>
          <div class="div4 casilla" data-casilla="4">
            <div class="casillerosTrioFrondoso">
              <div class="casillero-item clickeable" onclick="colocarDino('4-1')" data-casilla="4-1"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('4-2')" data-casilla="4-2"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('4-3')" data-casilla="4-3"></div>
            </div>
          </div>
          <div class="div5 casilla" data-casilla="5"></div>
          <div class="div6 casilla" data-casilla="6">
            <div class="casillerosPradoDiferencia">
              <div class="casillero-item clickeable" onclick="colocarDino('6-1')" data-casilla="6-1"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('6-2')" data-casilla="6-2"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('6-3')" data-casilla="6-3"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('6-4')" data-casilla="6-4"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('6-5')" data-casilla="6-5"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('6-6')" data-casilla="6-6"></div>
            </div>
          </div>
          <div class="div7 casilla" data-casilla="7">
            <div class="praderaDelAmor">
              <div class="casillero-item clickeable" onclick="colocarDino('7-1')" data-casilla="7-1"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('7-2')" data-casilla="7-2"></div>
            </div>
          </div>
          <div class="div8 casilla" data-casilla="8">
            <div class="casillerosAgua">
              <div class="casillero-item clickeable" onclick="colocarDino('8-1')" data-casilla="8-1"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('8-2')" data-casilla="8-2"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('8-3')" data-casilla="8-3"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('8-4')" data-casilla="8-4"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('8-5')" data-casilla="8-5"></div>
              <div class="casillero-item clickeable" onclick="colocarDino('8-6')" data-casilla="8-6"></div>
            </div>
          </div>
          <div class="div9 casilla" data-casilla="9">
            <div class="casillerosIslaSolitaria">
              <div class="casillero-item clickeable" onclick="colocarDino('9-1')" data-casilla="9-1"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="zona-dinosDerecha">
      <div class="dinosaurio" onclick="seleccionarDino(4)" data-dino="4">
        <img src="Recursos/img/dino4.png" alt="Dino 4" />
      </div>
      <div class="dinosaurio" onclick="seleccionarDino(5)" data-dino="5">
        <img src="Recursos/img/dino5.png" alt="Dino 5" />
      </div>
      <div class="dinosaurio" onclick="seleccionarDino(6)" data-dino="6">
        <img src="Recursos/img/dino6.png" alt="Dino 6" />
      </div>
    </section>
  </main>

  <?php include 'presentacion/includes/footer.php'; ?>
</body>
</html>