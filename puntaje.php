<?php
$pageTitle = "Puntajes - Draftosaurus";
$pageDescription = "Puntajes y resultados de Draftosaurus - Ve quién ganó la partida";
$specificCSS = "puntajePage.css";
$specificJS = "puntajePage.js";

// Variables específicas para la navegación
$menuId = "menuLateral";
$menuClass = "navegacion-lateral";
$menuListClass = "lista-menu";

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>
  
  <header>
    <h1 class="titulo-puntaje">Puntuaciones</h1>
  </header>
  
  <main class="contenido-puntaje" role="main">
    <section class="ganador-partida" aria-labelledby="ganador-titulo">
      <h2 id="ganador-titulo">Ganador de esta Partida:</h2>
      <div class="caja-ganador" role="region" aria-live="polite">
        <p><strong>JUGADOR Nº1</strong> - <span class="puntos">31 pts</span></p>
        <button class="btn-secundario" aria-describedby="resto-help">Resto de Jugadores</button>
        <small id="resto-help" class="form-text">Ver todos los participantes</small>
      </div>
    </section>
    
    <section class="ranking-top5" aria-labelledby="ranking-titulo">
      <h2 id="ranking-titulo">Ranking de Top 5:</h2>
      <ol class="lista-ranking" role="list">
        <li role="listitem">
          <span class="jugador">JUGADOR Nº1</span> - <span class="puntos">31 pts</span>
        </li>
        <li role="listitem">
          <span class="jugador">JUGADOR Nº2</span> - <span class="puntos">28 pts</span>
        </li>
        <li role="listitem">
          <span class="jugador">JUGADOR Nº3</span> - <span class="puntos">25 pts</span>
        </li>
        <li role="listitem">
          <span class="jugador">JUGADOR Nº4</span> - <span class="puntos">22 pts</span>
        </li>
        <li role="listitem">
          <span class="jugador">JUGADOR Nº5</span> - <span class="puntos">18 pts</span>
        </li>
      </ol>
    </section>
  </main>
  
<?php include 'includes/footer.php'; ?>