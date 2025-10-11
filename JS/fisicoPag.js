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

   
    let currentPicker = null;

    function closePicker() {
        if (currentPicker && currentPicker.parentNode) {
            currentPicker.parentNode.removeChild(currentPicker);
        }
        currentPicker = null;
        document.removeEventListener('click', docClickHandler);
    }

    function docClickHandler(e) {
        if (!currentPicker) return;
        if (e.target.closest('.number-picker')) return;
        // si hacemos click en un input del formulario, no cerrar (permite reabrir)
        if (e.target.tagName === 'INPUT' && e.target.closest('#form-recintos')) return;
        closePicker();
    }

    function openPickerFor(input) {
        closePicker();
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || 0;
        const picker = document.createElement('div');
        picker.className = 'number-picker';

        // Crear opciones desde min hasta max
        for (let v = min; v <= max; v++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'picker-option';
            btn.textContent = v;
            btn.addEventListener('click', function () {
                input.value = v;
                actualizarTotal();
                closePicker();
                // devolver foco al input para accesibilidad
                input.focus();
            });
            picker.appendChild(btn);
        }

        // Posicionar el picker debajo del input, evitando overflow horizontal
        const rect = input.getBoundingClientRect();
        picker.style.position = 'absolute';
        picker.style.left = Math.max(window.scrollX + rect.left, 8) + 'px';
        picker.style.top = (window.scrollY + rect.bottom + 8) + 'px';
        picker.style.zIndex = '20000';

        document.body.appendChild(picker);
        currentPicker = picker;

        // Cerrar al clicar fuera
        setTimeout(() => {
            document.addEventListener('click', docClickHandler);
        }, 0);
    }

    // Asociar eventos a cada input (focus / click / teclado)
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            openPickerFor(input);
        });
        input.addEventListener('click', function (e) {
            // evitar que el click en el input cierre inmediatamente por el docClickHandler
            e.stopPropagation();
            openPickerFor(input);
        });
        input.addEventListener('keydown', function (e) {
            // permitir cambiar con flechas y cerrar con Escape
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                let val = parseInt(input.value) || 0;
                const min = parseInt(input.min) || 0;
                const max = parseInt(input.max) || 0;
                if (e.key === 'ArrowUp') val = Math.min(val + 1, max);
                else val = Math.max(val - 1, min);
                input.value = val;
                actualizarTotal();
            }
            if (e.key === 'Escape') {
                closePicker();
            }
        });
    });

    // Cerrar picker si se hace scroll o resize para evitar desalineado
    window.addEventListener('scroll', function () { if (currentPicker) closePicker(); }, true);
    window.addEventListener('resize', function () { if (currentPicker) closePicker(); });

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
        html += '<button class="btn btn-secondary modal-btn-secondary" id="btn-cerrar-modal">Cerrar</button>';
        html += '</div>';
        html += '</div>';

        card.innerHTML = html;

        const primaryButtons = card.querySelectorAll('.modal-btn-primary');
        primaryButtons.forEach(btn => btn.remove());

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