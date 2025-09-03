/**
 * Verifica el estado de la sesión del usuario y configura la interfaz
 * Incluye funcionalidad para cerrar sesión desde cualquier página
 */
async function verificarSesionYConfigurarUI() {
    try {
        const resp = await fetch('backend/infoSesion.php', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
        });

        const contentType = resp.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            // Si el endpoint no devuelve JSON, no intentamos procesar
            return;
        }

        const json = await resp.json();
        const usuario = json && json.usuario ? json.usuario : null;

        // Mostrar/ocultar elementos protegidos
        const elementosProtegidos = document.querySelectorAll('.requires-auth');
        elementosProtegidos.forEach(el => {
            el.style.display = usuario ? '' : 'none';
        });

        // Actualizar nombre de usuario si está presente
        const nombreEl = document.getElementById('usuario-nombre');
        if (nombreEl) {
            nombreEl.textContent = usuario ? (usuario.name || usuario.nombre || usuario.email || '') : '';
        }

        configurarCierreSesionGlobal();

    } catch (err) {
        // Silencioso en caso de error de red
        console.error('Error verificando sesión:', err);
    }
}

function configurarCierreSesionGlobal() {
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (!btnCerrarSesion) return;
    if (btnCerrarSesion.dataset.listenerAdded) return;

    btnCerrarSesion.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('backend/cerrarSesion.php', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                console.error('Error al cerrar sesión: respuesta no OK');
                return;
            }

            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
                // Si no es JSON, forzar redirección a login
                window.location.href = 'logear.php';
                return;
            }

            const j = await res.json();
            if (j && j.success === true) {
                window.location.href = 'index.php';
            } else {
                window.location.href = 'logear.php';
            }

        } catch (err) {
            console.error('Error de red al cerrar sesión:', err);
            window.location.href = 'logear.php';
        }
    });

    btnCerrarSesion.dataset.listenerAdded = 'true';
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        verificarSesionYConfigurarUI();
    });
} else {
    verificarSesionYConfigurarUI();
}