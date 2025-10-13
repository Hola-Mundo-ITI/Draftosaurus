document.addEventListener('DOMContentLoaded', function() {
    const selectCantidad = document.getElementById('cantidadJugadores');
    const contenedorNombres = document.getElementById('contenedorNombres');
    const btnIniciar = document.getElementById('btnIniciar');
    const form = document.getElementById('formJugadores');
  
    selectCantidad.addEventListener('change', function() {
      const cantidad = parseInt(this.value);
      contenedorNombres.innerHTML = '';
  
      if (cantidad > 0) {
        for (let i = 1; i <= cantidad; i++) {
          const grupoJugador = document.createElement('div');
          grupoJugador.className = 'grupo-jugador';
          
          grupoJugador.innerHTML = `
            <label for="jugador${i}">Jugador ${i}:</label>
            <input 
              type="text" 
              id="jugador${i}" 
              name="jugador${i}" 
              placeholder="Nombre del jugador ${i}"
              required
              maxlength="20"
            >
          `;
          
          contenedorNombres.appendChild(grupoJugador);
        }
        
        btnIniciar.disabled = false;
      } else {
        btnIniciar.disabled = true;
      }
    });
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const cantidad = parseInt(selectCantidad.value);
      const jugadores = [];
      
      for (let i = 1; i <= cantidad; i++) {
        const nombre = document.getElementById(`jugador${i}`).value.trim();
        if (nombre) {
          jugadores.push({
            id: i,
            nombre: nombre
          });
        }
      }
      
      if (jugadores.length === cantidad) {
        localStorage.setItem('jugadoresPartida', JSON.stringify(jugadores));
        localStorage.setItem('turnoActual', '1');
        localStorage.setItem('rondaActual', '1');
        
        window.location.href = 'digital.php';
      } else {
        alert('Por favor completa todos los nombres');
      }
    });
  });