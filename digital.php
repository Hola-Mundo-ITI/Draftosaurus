<?php
$pageTitle = "Partida Virtual - Draftosaurus";
$pageDescription = "Juego de dinosaurios online";
$specificCSS = "digitalPag.css";
$specificJS = ["digitalPag.js"];

include 'php/includes/head.php';
?>

<body>
  <header class="encabezado-partida">
    <?php include 'php/includes/navigation.php'; ?>
    <div class="ronda-actual">Ronda: <span id="numRonda">1</span></div>
    <h1 class="titulo">Partida Virtual</h1>
    <div class="datos-juego">
      <div class="dado-virtual" onclick="lanzarDado()">
        <img id="imagenDado" src="Recursos/img/dado.png" alt="Dado" />
        <div class="texto-dado">Lanzar Dado</div>
      </div>
      <div class="cantidad-jugadores">
        Partida Automática (Tú vs <span id="numeroBots">2</span> Bots)
      </div>
      <button id="botonExportar" class="boton-exportar">Exportar</button>
    </div>
  </header>

  <main id="mainContent" class="zona-juego">
    <!-- Zona izquierda de dinosaurios -->
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

 <!-- Tablero central -->
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

    <!-- Zona derecha de dinosaurios -->
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

  <?php include 'php/includes/footer.php'; ?>

  <script>
    // Variables globales simples
    let dinoSeleccionado = null;
    let rondaActual = 1;
    let numeroBots = 2;
    let tableroEstado = {
      casillas: {},
      dinosaurios: []
    };

    // Función para seleccionar un dinosaurio
    function seleccionarDino(numeroDino) {
      // Quitar selección anterior
      document.querySelectorAll('.dinosaurio').forEach(dino => {
        dino.classList.remove('seleccionado');
      });

      // Seleccionar el nuevo
      const dinoElemento = document.querySelector(`[data-dino="${numeroDino}"]`);
      if (dinoElemento) {
        dinoElemento.classList.add('seleccionado');
        dinoSeleccionado = numeroDino;
        console.log('Dinosaurio seleccionado:', numeroDino);
      }
    }

    // Función para colocar dinosaurio en casilla
    function colocarDino(numeroCasilla) {
      if (!dinoSeleccionado) {
        alert('Por favor selecciona un dinosaurio primero');
        return;
      }

      const casilla = document.querySelector(`[data-casilla="${numeroCasilla}"]`);
      
      // Verificar si la casilla ya tiene un dinosaurio
      if (casilla.querySelector('img')) {
        alert('Esta casilla ya está ocupada');
        return;
      }

      // Crear imagen del dinosaurio
      const imgDino = document.createElement('img');
      imgDino.src = `Recursos/img/dino${dinoSeleccionado}.png`;
      imgDino.alt = `Dinosaurio ${dinoSeleccionado}`;
      imgDino.style.width = '100%';
      imgDino.style.height = '100%';
      imgDino.style.objectFit = 'contain';

      // Colocar en la casilla
      casilla.appendChild(imgDino);

      // Guardar en el estado
      tableroEstado.casillas[numeroCasilla] = dinoSeleccionado;
      tableroEstado.dinosaurios.push({
        dino: dinoSeleccionado,
        casilla: numeroCasilla
      });

      // Quitar selección
      document.querySelectorAll('.dinosaurio').forEach(dino => {
        dino.classList.remove('seleccionado');
      });
      dinoSeleccionado = null;

      console.log('Dinosaurio colocado en casilla', numeroCasilla);
      console.log('Estado actual:', tableroEstado);
    }

    // Función para lanzar dado
    function lanzarDado() {
      const resultado = Math.floor(Math.random() * 6) + 1;
      console.log('Dado lanzado:', resultado);
      alert(`Resultado del dado: ${resultado}`);
    }

    // Función para exportar partida
    document.getElementById('botonExportar').addEventListener('click', async function() {
      try {
        const datos = {
          nombre: `Partida ${new Date().toLocaleString()}`,
          bots_count: numeroBots,
          gameState: tableroEstado
        };

        this.disabled = true;
        this.textContent = 'Exportando...';

        const respuesta = await fetch('backend/guardar_partida.php', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
          alert('Partida guardada correctamente');
        } else {
          alert('Error al guardar: ' + (resultado.error || 'Desconocido'));
        }

      } catch (error) {
        console.error('Error:', error);
        alert('No se pudo guardar la partida');
      } finally {
        this.disabled = false;
        this.textContent = 'Exportar';
      }
    });

    // Configurar número de bots desde URL
    window.addEventListener('DOMContentLoaded', function() {
      const urlParams = new URLSearchParams(window.location.search);
      let bots = parseInt(urlParams.get('bots')) || 2;
      bots = Math.max(2, Math.min(4, bots));
      
      numeroBots = bots;
      document.getElementById('numeroBots').textContent = bots;
    });
  </script>
</body>
</html>