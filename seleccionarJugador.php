<?php
session_start();
require_once 'negocio/utilidades/idioma/idiomas.php';

$pageTitle = t('configurar_partida') . " - Draftosaurus";
$specificCSS = "multijugador/seleccionarJugador.css";
$specificJS = ["multijugador/seleccionarJugador.js"];
include 'presentacion/includes/head.php';
?>

<body>
  <?php include 'presentacion/includes/navigation.php'; ?>
  
  <main class="contenedor-seleccion">
    <div class="formulario-jugadores">
      <h1><?php echo t('configurar_partida'); ?></h1>
      
      <form id="formJugadores" action="digital.php" method="POST">
        <div class="grupo-cantidad">
          <label for="cantidadJugadores"><?php echo t('cantidad_jugadores'); ?></label>
          <select id="cantidadJugadores" name="cantidadJugadores" required>
            <option value=""><?php echo t('seleccionar'); ?></option>
            <option value="1">1 <?php echo t('jugador'); ?></option>
            <option value="2">2 <?php echo t('jugadores'); ?></option>
            <option value="3">3 <?php echo t('jugadores'); ?></option>
            <option value="4">4 <?php echo t('jugadores'); ?></option>
            <option value="5">5 <?php echo t('jugadores'); ?></option>
          </select>
        </div>

        <div id="contenedorNombres" class="contenedor-nombres">
        </div>

        <button type="submit" id="btnIniciar" class="btn-iniciar" disabled>
          <?php echo t('iniciar_partida'); ?>
        </button>
      </form>
    </div>
  </main>

  <?php include 'presentacion/includes/footer.php'; ?>
</body>
</html>