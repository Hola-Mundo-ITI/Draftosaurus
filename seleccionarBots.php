<?php
//  exige sesión válida antes de renderizar la página
require_once __DIR__ . '/backend/session.php';
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
if (function_exists('exigirLogin')) exigirLogin();

$pageTitle = "Seleccionar Bots - Draftosaurus";
$pageDescription = "Elige con cuántos bots querés jugar - Draftosaurus";
$specificCSS = "digitalPage.css";
$specificJS = null;

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>

  <main id="mainContent" class="container text-center" role="main" style="padding-top:40px;">
    <section class="prepantalla-seleccion">
      <h1 class="titulo">Modo Digital</h1>
      <p class="lead">Seleccioná con cuántos bots querés jugar</p>

      <div class="caja-seleccion-bots" style="display:flex;gap:18px;justify-content:center;margin-top:24px;flex-wrap:wrap;">
        <a href="digital.php?bots=2" class="boton-opcion" role="button" style="text-decoration:none;">
          <div class="boton-seleccion" style="background:#6b4f28;color:#fffce2;padding:18px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.15);font-family:'Passero One',sans-serif;font-size:18px;">
            2 Bots
          </div>
        </a>

        <a href="digital.php?bots=3" class="boton-opcion" role="button" style="text-decoration:none;">
          <div class="boton-seleccion" style="background:#4CAF50;color:#fff;padding:18px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.15);font-family:'Passero One',sans-serif;font-size:18px;">
            3 Bots
          </div>
        </a>

        <a href="digital.php?bots=4" class="boton-opcion" role="button" style="text-decoration:none;">
          <div class="boton-seleccion" style="background:#FF9800;color:#fff;padding:18px 26px;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,0.15);font-family:'Passero One',sans-serif;font-size:18px;">
            4 Bots
          </div>
        </a>
      </div>

      <p style="margin-top:18px;color:#3b2d15;">Los bots jugarán automáticamente, cada turno tendrá un retraso breve para simular pensamiento.</p>

      <!-- Nueva sección para cargar partidas guardadas -->
      <div style="margin-top:28px;">
        <button id="btnMostrarSaves" class="boton-seleccion" style="background:#2196F3;color:#fff;padding:12px 18px;border-radius:10px;">Cargar partida</button>
      </div>

      <div id="savesContainer" style="max-width:720px;margin:18px auto;display:none;text-align:left;">
        <h3>Tus partidas guardadas</h3>
        <div id="savesList" style="background:#fff;padding:12px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);"></div>
      </div>

    </section>
  </main>

<?php include 'includes/footer.php'; ?>

<script>
(async function(){
  const btn = document.getElementById('btnMostrarSaves');
  const container = document.getElementById('savesContainer');
  const listEl = document.getElementById('savesList');

  if (!btn || !container || !listEl) return;

  btn.addEventListener('click', async () => {
    try {
      if (container.style.display === 'none' || container.style.display === '') {
        // Mostrar y cargar saves
        container.style.display = 'block';
        listEl.innerHTML = 'Cargando...';

        const resp = await fetch('backend/listar_partidas.php', { credentials: 'include' });
        if (!resp.ok) {
          listEl.innerHTML = '<div style="color:#a00;">Error cargando partidas guardadas</div>';
          return;
        }

        const json = await resp.json();
        if (!json || !json.success) {
          listEl.innerHTML = '<div style="color:#a00;">No se encontraron partidas.</div>';
          return;
        }

        const saves = json.saves || [];
        if (saves.length === 0) {
          listEl.innerHTML = '<div>No hay partidas guardadas.</div>';
          return;
        }

        listEl.innerHTML = '';
        saves.forEach(s => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.justifyContent = 'space-between';
          row.style.alignItems = 'center';
          row.style.padding = '8px 6px';
          row.style.borderBottom = '1px solid #eee';

          const left = document.createElement('div');
          left.innerHTML = `<strong>${escapeHtml(s.nombre)}</strong><div style="font-size:12px;color:#666;">Guardada: ${s.created_at} — Bots: ${s.bots_count}</div>`;

          const right = document.createElement('div');
          const btnCargar = document.createElement('button');
          btnCargar.textContent = 'Cargar';
          btnCargar.style.padding = '6px 10px';
          btnCargar.style.borderRadius = '6px';
          btnCargar.style.background = '#4CAF50';
          btnCargar.style.color = '#fff';
          btnCargar.addEventListener('click', async () => {
            btnCargar.disabled = true;
            btnCargar.textContent = 'Cargando...';
            try {
              const r = await fetch('backend/cargar_partida.php?id=' + encodeURIComponent(s.id), { credentials: 'include' });
              if (!r.ok) {
                alert('Error al cargar la partida');
                btnCargar.disabled = false; btnCargar.textContent = 'Cargar';
                return;
              }
              const j = await r.json();
              if (!j || !j.success) {
                alert('No se pudo cargar la partida: ' + (j.error || 'unknown'));
                btnCargar.disabled = false; btnCargar.textContent = 'Cargar';
                return;
              }

              // Guardar el estado en localStorage con la misma clave que usa EstadoJuego
              try {
                const estado = j.save && j.save.data ? j.save.data : null;
                if (!estado) {
                  alert('La partida no contiene estado válido');
                  btnCargar.disabled = false; btnCargar.textContent = 'Cargar';
                  return;
                }

                // Añadir fechaGuardado para compatibilidad con EstadoJuego
                estado.fechaGuardado = new Date().toISOString();
                localStorage.setItem('draftosaurus_estado', JSON.stringify(estado));

                // Redirigir a digital.php con parámetro bots para ajustar jugadores
                const bots = j.save.bots_count || 0;
                const targetBots = (bots > 0) ? bots : 3;
                window.location.href = 'digital.php?bots=' + encodeURIComponent(targetBots);

              } catch (le) {
                console.error('Error guardando estado en localStorage', le);
                alert('Error al preparar la partida en tu navegador');
                btnCargar.disabled = false; btnCargar.textContent = 'Cargar';
              }

            } catch (err) {
              console.error('Error al solicitar cargar_partida.php', err);
              alert('Error al cargar la partida (network)');
              btnCargar.disabled = false; btnCargar.textContent = 'Cargar';
            }
          });

          right.appendChild(btnCargar);

          row.appendChild(left);
          row.appendChild(right);
          listEl.appendChild(row);
        });

      } else {
        container.style.display = 'none';
      }
    } catch (err) {
      console.error('Error mostrando saves:', err);
      listEl.innerHTML = '<div style="color:#a00;">Error al mostrar partidas guardadas</div>';
    }
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }
})();
</script>