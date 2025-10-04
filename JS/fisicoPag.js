// Esperar a que la página cargue
document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener elementos del formulario
    const form = document.getElementById('form-recintos');
    const btnReset = document.getElementById('btn-reset');
    const resultado = document.getElementById('resultado-form');
    const totalValor = document.getElementById('total-dinos-valor');
    const totalHidden = document.getElementById('total-dinos');
    
    // Todos los campos numéricos
    const inputs = document.querySelectorAll('#form-recintos input[type=number]');
    
    // Nombres de las zonas para mostrar
    const zonas = {
        'bosque-semejanza': 'Bosque de la Semejanza',
        'prado-diferencia': 'Prado de la Diferencia',
        'trio-frondoso': 'El Trío Frondoso',
        'pradera-amor': 'La Pradera del Amor',
        'isla-solitaria': 'La Isla Solitaria',
        'rey-selva': 'El Rey de la Selva',
        'dinos-rio': 'Dinosaurios en el Río'
    };
    
    // Actualizar total cuando cambien los inputs
    inputs.forEach(input => {
        input.addEventListener('input', actualizarTotal);
    });
    
    // Calcular total de dinosaurios
    function actualizarTotal() {
        let total = 0;
        inputs.forEach(input => {
            total += parseInt(input.value) || 0;
        });
        totalValor.textContent = total;
        totalHidden.value = total;
    }
    
    // Cuando se envía el formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        resultado.style.display = 'none';
        
        // Validar inputs
        let valido = true;
        inputs.forEach(input => {
            const min = parseInt(input.min);
            const max = parseInt(input.max);
            const valor = parseInt(input.value) || 0;
            
            if (valor < min || valor > max) {
                resultado.style.display = 'block';
                resultado.className = 'alert alert-danger';
                resultado.textContent = `Error: ${input.name} debe estar entre ${min} y ${max}`;
                valido = false;
            }
        });
        
        if (!valido) return;
        
        // Enviar formulario
        const formData = new FormData(form);
        
        fetch(window.location.href, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.exito) {
                mostrarResultado(data.scoreReport);
            } else {
                resultado.style.display = 'block';
                resultado.className = 'alert alert-danger';
                resultado.textContent = data.mensaje || 'Error al calcular';
            }
        })
        .catch(error => {
            resultado.style.display = 'block';
            resultado.className = 'alert alert-danger';
            resultado.textContent = 'Error: ' + error.message;
        });
    });
    
    // Botón limpiar
    btnReset.addEventListener('click', function() {
        form.reset();
        resultado.style.display = 'none';
        actualizarTotal();
    });
    
    // Mostrar resultado en pantalla grande
    function mostrarResultado(report) {
        const total = report.totalScore || 0;
        const detalles = report.baseDetails || {};
        
        // Crear overlay oscuro
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        
        // Crear tarjeta de resultado
        const card = document.createElement('div');
        card.className = 'card shadow-lg';
        card.style.maxWidth = '760px';
        card.style.width = '90%';
        
        // Contenido de la tarjeta
        let html = '<div class="card-body">';
        html += '<h3 class="card-title mb-3">Resultado de Puntuación</h3>';
        html += `<div class="mb-3 lead"><strong>Puntuación Total:</strong> <span class="fs-4">${total} pts</span></div>`;
        html += '<h5>Desglose por Zona:</h5>';
        html += '<ul class="list-group list-group-flush">';
        
        // Agregar cada zona
        for (let zonaId in zonas) {
            const det = detalles[zonaId] || {};
            const puntos = det.points || 0;
            const cantidad = det.dinosaurCount || 0;
            
            html += '<li class="list-group-item d-flex justify-content-between align-items-center">';
            html += `<div><strong>${zonas[zonaId]}:</strong> ${det.description || ''}</div>`;
            html += '<div>';
            html += `<span class="badge bg-primary rounded-pill me-2">${cantidad}</span>`;
            html += `<span>${puntos} pts</span>`;
            html += '</div>';
            html += '</li>';
        }
        
        html += '</ul>';
        html += '<div class="d-flex justify-content-end gap-2 mt-3">';
        html += '<a href="seleccionarBots.php" class="btn btn-primary">Jugar Digital</a>';
        html += '<button class="btn btn-secondary" id="btn-cerrar-modal">Cerrar</button>';
        html += '</div>';
        html += '</div>';
        
        card.innerHTML = html;
        overlay.appendChild(card);
        document.body.appendChild(overlay);
        
        // Botón cerrar
        document.getElementById('btn-cerrar-modal').addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        
        // Cerrar al hacer clic fuera
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    // Inicializar total
    actualizarTotal();
});