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