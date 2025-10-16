window.traducciones = window.traducciones || {};

async function cargarTraduccionesFisico() {
    try {
        const respuesta = await fetch('php/idioma/obtenerTraduccion.php');
        const datos = await respuesta.json();
        if (datos.success) {
            window.traducciones = datos.traducciones;
        }
    } catch (error) {
        console.error('Error cargando traducciones:', error);
    }
}

function t(clave) {
    return window.traducciones[clave] || clave;
}

document.addEventListener('DOMContentLoaded', async function() {
    await cargarTraduccionesFisico();
    
    const form = document.getElementById('form-recintos');
    const btnReset = document.getElementById('btn-reset');
    const resultado = document.getElementById('resultado-form');
    const totalValor = document.getElementById('total-dinos-valor');
    const totalHidden = document.getElementById('total-dinos');
    
    const inputs = document.querySelectorAll('#form-recintos input[type=number]');
    
    const zonas = {
        'bosque-semejanza': t('bosque_semejanza'),
        'prado-diferencia': t('prado_diferencia'),
        'trio-frondoso': t('trio_frondoso'),
        'pradera-amor': t('pradera_amor'),
        'isla-solitaria': t('isla_solitaria'),
        'rey-selva': t('rey_selva'),
        'dinos-rio': t('dinos_rio')
    };

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
        if (e.target.tagName === 'INPUT' && e.target.closest('#form-recintos')) return;
        closePicker();
    }

    function openPickerFor(input) {
        closePicker();
        const min = parseInt(input.min) || 0;
        const max = parseInt(input.max) || 0;
        const picker = document.createElement('div');
        picker.className = 'number-picker';

        for (let v = min; v <= max; v++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'picker-option';
            btn.textContent = v;
            btn.addEventListener('click', function () {
                input.value = v;
                actualizarTotal();
                closePicker();
    
                input.focus();
            });
            picker.appendChild(btn);
        }

        const rect = input.getBoundingClientRect();
        picker.style.position = 'absolute';
        picker.style.left = Math.max(window.scrollX + rect.left, 8) + 'px';
        picker.style.top = (window.scrollY + rect.bottom + 8) + 'px';
        picker.style.zIndex = '20000';

        document.body.appendChild(picker);
        currentPicker = picker;

        setTimeout(() => {
            document.addEventListener('click', docClickHandler);
        }, 0);
    }

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            openPickerFor(input);
        });
        input.addEventListener('click', function (e) {
            e.stopPropagation();
            openPickerFor(input);
        });
        input.addEventListener('keydown', function (e) {
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

    window.addEventListener('scroll', function () { if (currentPicker) closePicker(); }, true);
    window.addEventListener('resize', function () { if (currentPicker) closePicker(); });

    function actualizarTotal() {
        let total = 0;
        inputs.forEach(input => {
            total += parseInt(input.value) || 0;
        });
        totalValor.textContent = total;
        totalHidden.value = total;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        resultado.style.display = 'none';
        
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
    
    btnReset.addEventListener('click', function() {
        form.reset();
        resultado.style.display = 'none';
        actualizarTotal();
    });

    function mostrarResultado(report) {
        const total = report.totalScore || 0;
        const detalles = report.baseDetails || {};

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

        const card = document.createElement('div');
        card.className = 'card shadow-lg';
        card.style.maxWidth = '760px';
        card.style.width = '90%';

        let html = '<div class="card-body">';
        html += `<h3 class="card-title mb-3">${t('resultado_puntuacion')}</h3>`;
        html += `<div class="mb-3 lead"><strong>${t('puntuacion_total')}</strong> <span class="fs-4">${total} pts</span></div>`;
        html += `<h5>${t('desglose_zona')}</h5>`;
        html += '<ul class="list-group list-group-flush">';

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
        html += `<button class="btn btn-secondary modal-btn-secondary" id="btn-cerrar-modal">${t('cerrar')}</button>`;
        html += '</div>';
        html += '</div>';

        card.innerHTML = html;

        const primaryButtons = card.querySelectorAll('.modal-btn-primary');
        primaryButtons.forEach(btn => btn.remove());

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        document.getElementById('btn-cerrar-modal').addEventListener('click', function() {
            document.body.removeChild(overlay);
        });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    }
    
    actualizarTotal();
});