document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formConfiguracion');
    const mensaje = document.getElementById('mensajeConfiguracion');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const idioma = document.getElementById('selectorIdioma').value;
        
        try {
            const respuesta = await fetch('negocio/utilidades/idioma/cambiarIdioma.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idioma: idioma
                })
            });
            
            const datos = await respuesta.json();
            
            if (datos.success) {
                mensaje.textContent = idioma === 'es' ? 'Cambios guardados correctamente' : 'Changes saved successfully';
                mensaje.className = 'mensaje-exito';
                mensaje.style.display = 'block';
                
                setTimeout(function() {
                    window.location.reload();
                }, 1000);
            } else {
                mensaje.textContent = datos.error;
                mensaje.className = 'mensaje-error';
                mensaje.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            mensaje.textContent = idioma === 'es' ? 'Error al guardar cambios' : 'Error saving changes';
            mensaje.className = 'mensaje-error';
            mensaje.style.display = 'block';
        }
    });
});