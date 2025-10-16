function obtenerTraduccion(clave) {
  const elemento = document.querySelector(`[data-traduccion="${clave}"]`);
  return elemento ? elemento.textContent : clave;
}

document.addEventListener('DOMContentLoaded', function() {
    const selectCantidad = document.getElementById('cantidadJugadores');
    const contenedorNombres = document.getElementById('contenedorNombres');
    const btnIniciar = document.getElementById('btnIniciar');
    const form = document.getElementById('formJugadores');
  
    // Obtener las traducciones desde el HTML
    const textoJugador = document.querySelector('option[value="1"]').textContent.split(' ')[1];
    const textoJugadores = document.querySelector('option[value="2"]').textContent.split(' ')[1];
    const textoNombreJugador = 'Player name'; 
  
    selectCantidad.addEventListener('change', function() {
      const cantidad = parseInt(this.value);
      contenedorNombres.innerHTML = '';
  
      if (cantidad > 0) {
        for (let i = 1; i <= cantidad; i++) {
          const grupoJugador = document.createElement('div');
          grupoJugador.className = 'grupo-jugador';
          
          const labelTexto = cantidad === 1 ? textoJugador : textoJugadores;
          const placeholderBase = document.querySelector('option[value="2"]').textContent.split(' ')[1];
          
          grupoJugador.innerHTML = `
            <label for="jugador${i}">${labelTexto} ${i}:</label>
            <input 
              type="text" 
              id="jugador${i}" 
              name="jugador${i}" 
              placeholder="${placeholderBase} ${i}"
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
        alert('Please complete all names');
      }
    });
  });