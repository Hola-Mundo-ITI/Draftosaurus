<?php
session_start();

require_once 'php//procesamiento/restriccionesActivas.php';
require_once 'php/procesamiento/procesarAccionesDigital.php';
require_once 'php/auxiliar.php';


inicializarSesion();
$resultado = procesarAccion();
$datosVista = obtenerDatosVista();


$pageTitle = "Partida Virtual - Draftosaurus";
$specificCSS = ["digitalPag.css", "restricciones.css"];
$specificJS = ["digitalPag.js"];

include 'php/includes/head.php';
?>

<body>

  <header class="encabezado-partida">
    <?php include 'php/includes/navigation.php'; ?>
    
    <div class="ronda-actual">
      Ronda: <span id="numRonda"><?php echo $datosVista['rondaActual']; ?></span>
    </div>
    
    <h1 class="titulo">Partida Virtual</h1>
    
    <div class="datos-juego">
      <!-- Dado virtual -->
      <form method="POST" style="display: inline;">
        <input type="hidden" name="accion" value="lanzar_dado">
        <div class="dado-virtual" onclick="this.parentElement.submit()">
          <img id="imagenDado" 
               src="Recursos/img/dado<?php echo $datosVista['caraActual'] ? '-'.$datosVista['caraActual'] : ''; ?>.png" 
               alt="Dado" />
          <div class="texto-dado">Lanzar Dado</div>
        </div>
      </form>
      
      <div class="cantidad-jugadores">
        Partida Automática (Tú vs <span id="numeroBots"><?php echo $datosVista['numeroBots']; ?></span> Bots)
      </div>
      

      <button id="botonExportar" class="boton-exportar">Exportar</button>
      
      <form method="POST" style="display: inline;">
        <input type="hidden" name="accion" value="reiniciar">
        <button type="submit" class="boton-reiniciar">Reiniciar</button>
      </form>
    </div>

    <?php if ($datosVista['caraActual']): ?>
    <div class="mensaje-restriccion">
      <strong><?php echo $datosVista['mensajeRestriccion']; ?></strong>
    </div>
    <?php endif; ?>
  </header>

  <?php if (!empty($resultado['mensaje'])): ?>
  <div class="alert alert-<?php echo $resultado['tipo']; ?>">
    <?php echo $resultado['mensaje']; ?>
  </div>
  <?php endif; ?>

  <main id="mainContent" class="zona-juego">
    
    <!-- Dinosaurios lado izquierdo -->
    <section class="zona-dinos izquierda">
      <?php renderizarDinosaurios(1, 3); ?>
    </section>
    
    <!-- Tablero central -->
    <?php include 'php/utilidades/tablero.php'; ?>
    
    <!-- Dinosaurios lado derecho -->
    <section class="zona-dinosDerecha">
      <?php renderizarDinosaurios(4, 6); ?>
    </section>
    
  </main>

  <?php include 'php/includes/footer.php'; ?>
</body>
</html>