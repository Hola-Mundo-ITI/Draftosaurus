<?php
$pageTitle = "Seleccionar Jugadores - Draftosaurus";
$specificCSS = "seleccionarJugador.css";
$specificJS = ["multijugador/seleccionarJugador.js"];
include 'php/includes/head.php';
?>

<body>
  <?php include 'php/includes/navigation.php'; ?>
  
  <main class="contenedor-seleccion">
    <div class="formulario-jugadores">
      <h1>Configurar Partida Multijugador</h1>
      
      <form id="formJugadores" action="digital.php" method="POST">
        <div class="grupo-cantidad">
          <label for="cantidadJugadores">Cantidad de Jugadores:</label>
          <select id="cantidadJugadores" name="cantidadJugadores" required>
            <option value="">Seleccionar...</option>
            <option value="1">1 Jugador</option>
            <option value="2">2 Jugadores</option>
            <option value="3">3 Jugadores</option>
            <option value="4">4 Jugadores</option>
            <option value="5">5 Jugadores</option>
          </select>
        </div>

        <div id="contenedorNombres" class="contenedor-nombres">
        </div>

        <button type="submit" id="btnIniciar" class="btn-iniciar" disabled>
          Iniciar Partida
        </button>
      </form>
    </div>
  </main>

  <?php include 'php/includes/footer.php'; ?>
</body>
</html>