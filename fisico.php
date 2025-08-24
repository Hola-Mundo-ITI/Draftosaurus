<?php
$pageTitle = "Registro del Tablero - Draftosaurus";
$pageDescription = "Registro del Tablero Físico - Lleva el seguimiento de tu partida de Draftosaurus";
$specificCSS = "fisicoPage.css";
$specificJS = "fisicoPage.js";


include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>
  
  <main id="mainContent" role="main">
    <section class="tracking-section">
      <h1>Registra lo que pasa en tu tablero:</h1>
      <form aria-label="Formulario de seguimiento del tablero">
        <fieldset>
          <legend class="visually-hidden">Zonas del tablero de Draftosaurus</legend>
          <div class="form-grid">
            <div class="columna">
              <h2 class="visually-hidden">Zonas del lado izquierdo</h2>
              <div class="campo-grupo">
                <label for="bosque-semejanza">Bosque de la Semejanza</label>
                <input type="text" id="bosque-semejanza" name="bosque-semejanza" aria-describedby="bosque-help" />
                <small id="bosque-help" class="form-text">Dinosaurios del mismo tipo</small>
              </div>
              
              <div class="campo-grupo">
                <label for="trio-frondoso">El Trío Frondoso</label>
                <input type="text" id="trio-frondoso" name="trio-frondoso" aria-describedby="trio-help" />
                <small id="trio-help" class="form-text">Exactamente 3 dinosaurios</small>
              </div>
              
              <div class="campo-grupo">
                <label for="isla-solitaria">La Isla Solitaria</label>
                <input type="text" id="isla-solitaria" name="isla-solitaria" aria-describedby="isla-help" />
                <small id="isla-help" class="form-text">Un solo dinosaurio</small>
              </div>
              
              <div class="campo-grupo">
                <label for="dinos-rio">Dinosaurios en el Río</label>
                <input type="text" id="dinos-rio" name="dinos-rio" aria-describedby="rio-help" />
                <small id="rio-help" class="form-text">Dinosaurios en fila</small>
              </div>
            </div>
            
            <div class="columna">
              <h2 class="visually-hidden">Zonas del lado derecho</h2>
              <div class="campo-grupo">
                <label for="prado-diferencia">Prado de la Diferencia</label>
                <input type="text" id="prado-diferencia" name="prado-diferencia" aria-describedby="prado-help" />
                <small id="prado-help" class="form-text">Todos diferentes</small>
              </div>
              
              <div class="campo-grupo">
                <label for="pradera-amor">La Pradera del Amor</label>
                <input type="text" id="pradera-amor" name="pradera-amor" aria-describedby="pradera-help" />
                <small id="pradera-help" class="form-text">Parejas de dinosaurios</small>
              </div>
              
              <div class="campo-grupo">
                <label for="rey-selva">El Rey de la Selva</label>
                <input type="text" id="rey-selva" name="rey-selva" aria-describedby="rey-help" />
                <small id="rey-help" class="form-text">El dinosaurio más grande</small>
              </div>
              
              <div class="campo-grupo">
                <label for="trex-tablero">T-Rex en el Tablero</label>
                <input type="text" id="trex-tablero" name="trex-tablero" aria-describedby="trex-help" />
                <small id="trex-help" class="form-text">Posición del T-Rex</small>
              </div>
            </div>
          </div>
        </fieldset>
        <button type="submit" aria-describedby="calcular-help">Calcular Puntaje</button>
        <small id="calcular-help" class="form-text">Calcula automáticamente tu puntuación total</small>
      </form>
    </section>
  </main>
  
<?php include 'includes/footer.php'; ?>