<section class="contenedor-tablero">
  <div id="tablero" class="tablero-juego">
    <div class="parent">

      <div class="div1 casilla" data-casilla="1">
        <div class="casillerosBosqueSemejanza">
          <?php renderizarCasillas('1', 6, $datosVista); ?>
        </div>
      </div>
      

      <div class="div2 casilla" data-casilla="2"></div>
      
      <div class="div3 casilla" data-casilla="3">
        <div class="reySelva">
          <?php renderizarCasilla('3-1', $datosVista); ?>
        </div>
      </div>
      

      <div class="div4 casilla" data-casilla="4">
        <div class="casillerosTrioFrondoso">
          <?php renderizarCasillas('4', 3, $datosVista); ?>
        </div>
      </div>

      <div class="div5 casilla" data-casilla="5"></div>
 
      <div class="div6 casilla" data-casilla="6">
        <div class="casillerosPradoDiferencia">
          <?php renderizarCasillas('6', 6, $datosVista); ?>
        </div>
      </div>
      
      <div class="div7 casilla" data-casilla="7">
        <div class="praderaDelAmor">
          <?php renderizarCasillas('7', 2, $datosVista); ?>
        </div>
      </div>

      <div class="div8 casilla" data-casilla="8">
        <div class="casillerosAgua">
          <?php renderizarCasillas('8', 6, $datosVista, true); ?>
        </div>
      </div>

      <div class="div9 casilla" data-casilla="9">
        <div class="casillerosIslaSolitaria">
          <?php renderizarCasilla('9-1', $datosVista); ?>
        </div>
      </div>
      
    </div>
  </div>
</section>