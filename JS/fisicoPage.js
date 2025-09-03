document.addEventListener("DOMContentLoaded", () => {
  const btnMenu = document.getElementById('btnMenu');
  const menuLateral = document.getElementById('menuLateral');
  const contenido = document.getElementById('contenido');

  btnMenu.addEventListener('click', () => {
    menuLateral.classList.toggle('abierto');
    contenido.classList.toggle('desplazado');
  });

  menuLateral.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuLateral.classList.remove('abierto');
      contenido.classList.remove('desplazado');
    });
  });

  // --- Nuevas funcionalidades para tablero point & click ---
  const estadoTablero = {
    'bosque-semejanza': [],
    'trio-frondoso': [],
    'prado-diferencia': [],
    'pradera-amor': [],
    'isla-solitaria': [],
    'rey-selva': [],
    'dinos-rio': []
  };

  let dinoSeleccionado = null; // { tipo, imagen }

  const dinosauriosDisponibles = document.querySelectorAll('.dinosaurio-disponible');
  const slots = document.querySelectorAll('.slot');
  const snackbarEl = document.getElementById('snackbar');
  const resultadoCont = document.getElementById('resultado-puntuacion');
  const detallesCont = document.getElementById('detalles-puntuacion');
  const playerId = parseInt(document.querySelector('main#mainContent')?.dataset.playerId || '1', 10);

  // Hacer slots focusables para accesibilidad
  slots.forEach(s => s.setAttribute('tabindex', '0'));

  // Selección de dinosaurio (point & click)
  dinosauriosDisponibles.forEach(btn => {
    btn.addEventListener('click', (ev) => {
      seleccionarDino(ev.currentTarget);
    });
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        seleccionarDino(ev.currentTarget);
      }
    });
  });

  function seleccionarDino(buttonEl) {
    // deselect others
    dinosauriosDisponibles.forEach(d => {
      d.classList.remove('seleccionado');
      d.setAttribute('aria-selected', 'false');
    });

    buttonEl.classList.add('seleccionado');
    buttonEl.setAttribute('aria-selected', 'true');

    const tipo = buttonEl.dataset.tipo;
    const img = buttonEl.querySelector('img')?.src || '';
    dinoSeleccionado = { tipo, imagen: img };
  }

  // Colocación por click en slots
  slots.forEach(slot => {
    slot.addEventListener('click', (ev) => {
      const slotEl = ev.currentTarget;
      const zonaEl = slotEl.closest('.zona-tablero');
      if (!zonaEl) return;
      const zona = zonaEl.dataset.zona;
      const numeroSlot = parseInt(slotEl.dataset.slot, 10);

      if (!dinoSeleccionado) {
        // permitir reemplazar si hay dino en slot
        if (slotEl.dataset.ocupado === 'true') {
          // quitar
          eliminarDinosaurio(zona, numeroSlot, slotEl);
          showSnackbar('Dinosaurio eliminado.');
        } else {
          showSnackbar('Selecciona un dinosaurio primero.');
        }
        return;
      }

      const reemplazo = slotEl.dataset.ocupado === 'true';

      // Validar reglas teniendo en cuenta que si es reemplazo, debemos ignorar el propio slot
      if (!validarReglasZona(zona, dinoSeleccionado.tipo, numeroSlot, reemplazo)) return;

      colocarDinosaurio(slotEl, dinoSeleccionado.tipo, dinoSeleccionado.imagen, zona, numeroSlot, reemplazo);
    });

    // Soporte teclado: Enter o Space para interactuar con slot
    slot.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        slot.click();
      }
    });
  });

  function validarReglasZona(zona, tipo, numeroSlot, reemplazo = false) {
    const dinosEnZona = estadoTablero[zona] || [];
    // Si es reemplazo, considerar el listado sin el elemento del slot actual
    const dinosConsiderados = reemplazo ? dinosEnZona.filter(d => d.slot !== numeroSlot) : dinosEnZona.slice();

    switch (zona) {
      case 'bosque-semejanza':
        if (dinosConsiderados.length > 0 && dinosConsiderados[0].tipo !== tipo) {
          showSnackbar('Bosque: todos los dinosaurios deben ser del mismo tipo.');
          return false;
        }
        break;
      case 'prado-diferencia':
        if (dinosConsiderados.some(d => d.tipo === tipo)) {
          showSnackbar('Prado: todos los dinosaurios deben ser de tipos diferentes.');
          return false;
        }
        break;
      case 'trio-frondoso':
        if (dinosConsiderados.length >= 3) {
          showSnackbar('Trío Frondoso: máximo 3 dinosaurios.');
          return false;
        }
        break;
      case 'isla-solitaria':
      case 'rey-selva':
        if (dinosConsiderados.length >= 1) {
          showSnackbar('Esta zona solo admite un dinosaurio.');
          return false;
        }
        break;
      case 'dinos-rio':
        // Debe colocarse en secuencia: calcular siguiente slot disponible
        const ocupados = dinosConsiderados.map(d => d.slot);
        const siguiente = ocupados.length > 0 ? Math.max(...ocupados) + 1 : 1;
        if (numeroSlot !== siguiente) {
          showSnackbar(`Río: coloca en el slot ${siguiente} (siguiente disponible).`);
          return false;
        }
        break;
      // pradera-amor (parejas) no validamos en frontend estrictamente
    }

    return true;
  }

  function colocarDinosaurio(slotElement, tipo, imagenSrc, zona, numeroSlot, reemplazo = false) {
    // Si es reemplazo, eliminar el previo del estado
    if (reemplazo) {
      estadoTablero[zona] = estadoTablero[zona].filter(d => d.slot !== numeroSlot);
    }

    estadoTablero[zona].push({ tipo, slot: numeroSlot, imagen: imagenSrc });

    // Actualizar UI del slot
    slotElement.innerHTML = '';
    const img = document.createElement('img');
    img.src = imagenSrc || 'Recursos/img/RecintoVacio.png';
    img.alt = tipo;
    img.className = 'dino-colocado';
    slotElement.appendChild(img);
    slotElement.dataset.ocupado = 'true';

    showSnackbar(reemplazo ? 'Dinosaurio reemplazado.' : 'Dinosaurio colocado.');
  }

  function eliminarDinosaurio(zona, numeroSlot, slotElement) {
    estadoTablero[zona] = estadoTablero[zona].filter(d => d.slot !== numeroSlot);
    slotElement.innerHTML = '';
    slotElement.dataset.ocupado = 'false';
  }

  // Botones: calcular y limpiar
  document.getElementById('btn-calcular-puntuacion').addEventListener('click', () => {
    calcularPuntuacion();
  });

  document.getElementById('btn-limpiar-tablero').addEventListener('click', () => {
    limpiarTablero();
  });

  function calcularPuntuacion() {
    /*
      calcularPuntuacion:
      - Valida el estado local del tablero y el playerId antes de enviar la petición al backend.
      - Normaliza la estructura de fullBoard para que el backend reciba siempre objetos con { type, slot, imagen, playerPlaced }.
      - Envía la petición y maneja errores HTTP y JSON de forma robusta, intentando recuperar JSON en caso de salida contaminada.
    */

    // Validaciones básicas antes de construir el payload
    if (typeof playerId === 'undefined' || playerId === null || !Number.isInteger(playerId) || playerId <= 0) {
      console.error('calcularPuntuacion - playerId inválido:', playerId);
      showSnackbar('ID de jugador inválido. No se puede calcular la puntuación.');
      return;
    }

    const zonas = Object.keys(estadoTablero || {});
    if (!zonas || zonas.length === 0) {
      console.error('calcularPuntuacion - estadoTablero vacío o no inicializado:', estadoTablero);
      showSnackbar('El tablero está vacío. Coloca dinosaurios antes de calcular.');
      return;
    }

    // Normalizar fullBoard y validar contenido de cada zona
    const fullBoard = {};
    for (const zonaId of zonas) {
      const rawList = estadoTablero[zonaId] ?? [];
      if (!Array.isArray(rawList)) {
        console.warn(`calcularPuntuacion - Zona ${zonaId} no es un arreglo, se intentará normalizar.`, rawList);
      }
      const arr = Array.isArray(rawList) ? rawList : (isObject(rawList) ? Array.from(rawList) : []);

      fullBoard[zonaId] = arr.map(d => {
        const tipo = (d && (d.tipo ?? d.type)) ?? null;
        const slot = (d && (d.slot ?? null)) ?? null;
        // CORRECCIÓN: evitar redundancia en imagen y aceptar 'imagen' o 'image'
        const imagen = (d && (d.imagen ?? d.image)) ?? null;

        return {
          type: tipo,
          slot: slot,
          imagen: imagen,
          playerPlaced: playerId
        };
      }).filter(item => item.type !== null); // eliminar entradas sin tipo

      // Si tras normalizar hay datos, validarlos
      if (fullBoard[zonaId].length > 0) {
        for (const item of fullBoard[zonaId]) {
          if (typeof item.type !== 'string' || item.type.trim() === '') {
            console.error('calcularPuntuacion - Tipo de dinosaurio inválido en zona', zonaId, item);
            showSnackbar('Error: hay dinosaurios con tipo inválido en el tablero.');
            return;
          }
        }
      }
    }

    const payload = {
      fullBoard: fullBoard,
      playerId: playerId,
      allPlayerBoards: { [playerId]: fullBoard }
    };
    
    const params = new URLSearchParams(window.location.search);
    const debugMode = params.get('debug') === '1';
    const endpoint = 'backend/calcularPuntuacion.php' + (debugMode ? '?debug=1' : '');

    // Loguear el payload (estructura y resumen) para debugging
    try {
      console.info('calcularPuntuacion - Enviando payload al backend:', { endpoint, payload });
    } catch (e) {
      console.warn('calcularPuntuacion - No se pudo serializar payload para logging.', e);
    }

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      const status = response.status;
      const statusText = response.statusText;

      // Obtener respuesta raw como texto antes de cualquier parseo
      let rawText = '';
      try {
        rawText = await response.text();
      } catch (e) {
        console.error('calcularPuntuacion - Error leyendo cuerpo de la respuesta:', e);
        throw new Error('No se pudo leer la respuesta del servidor.');
      }

      if (!response.ok) {
        console.error('calcularPuntuacion - Respuesta HTTP no OK:', status, statusText, rawText);
        const mensaje = rawText ? `Error del servidor: ${rawText}` : `Error HTTP ${status}`;
        throw new Error(mensaje);
      }

      if (!rawText || rawText.trim() === '') {
        console.error('calcularPuntuacion - Respuesta vacía del servidor.');
        throw new Error('Respuesta vacía del servidor.');
      }

      // Intentar parsear JSON estrictamente
      try {
        const parsed = JSON.parse(rawText);
        return parsed;
      } catch (e) {
        console.warn('calcularPuntuacion - JSON inválido, intentando extracción parcial. Error:', e);
        // Intentar extraer primer objeto JSON dentro del texto (caso de output contaminado)
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsedPartial = JSON.parse(match[0]);
            console.info('calcularPuntuacion - Se recuperó JSON parcial del servidor.');
            return parsedPartial;
          } catch (e2) {
            console.error('calcularPuntuacion - No se pudo parsear el JSON parcial:', e2, match[0]);
            throw new Error('Respuesta del servidor no es JSON válido.');
          }
        }
        throw new Error('Respuesta del servidor no es JSON válido.');
      }
    })
    .then(data => {
      if (!data) {
        console.error('calcularPuntuacion - Data inválida después del parseado:', data);
        showSnackbar('No se recibió datos de puntuación válidos.');
        return;
      }

      // Normalizar diferentes formas de respuesta del backend
      const report = (data.scoreReport) ? data.scoreReport : (data.scoreReport ?? data);

      if (!report) {
        console.error('calcularPuntuacion - Informe de puntuación no presente en la respuesta:', data);
        showSnackbar('El servidor respondió sin informe de puntuación válido.');
        return;
      }

      mostrarResultadoPuntuacion(report);
    })
    .catch(err => {
      console.error('calcularPuntuacion - Error final al calcular la puntuación:', err);
      showSnackbar('Error al calcular la puntuación: ' + (err.message || 'Error desconocido'), 6000);
    });
  }

  function mostrarResultadoPuntuacion(report) {
    // Esperamos report.totalScore y report.baseDetails (por zona)
    detallesCont.innerHTML = '';
    if (!report) {
      detallesCont.textContent = 'No se recibió informe de puntuación.';
      resultadoCont.style.display = 'block';
      resultadoCont.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const total = document.createElement('div');
    total.className = 'puntuacion-total';
    total.innerHTML = `Puntuación Total: <strong>${report.totalScore ?? report.total ?? 0} puntos</strong>`;
    detallesCont.appendChild(total);

    if (report.baseDetails) {
      const lista = document.createElement('ul');
      for (const [zona, det] of Object.entries(report.baseDetails)) {
        const li = document.createElement('li');
        li.textContent = `${nombreZona(zona)}: ${det.points ?? det.puntos ?? 0} puntos (${det.dinosaurCount ?? det.count ?? 0} dinosaurios)`;
        lista.appendChild(li);
      }
      const cont = document.createElement('div');
      cont.className = 'desglose-puntuacion';
      const h = document.createElement('h3'); h.textContent = 'Desglose por Zona:';
      cont.appendChild(h);
      cont.appendChild(lista);
      detallesCont.appendChild(cont);
    }

    if (report.bonuses || report.bonificaciones) {
      const b = document.createElement('div');
      b.className = 'bonificaciones';
      b.textContent = `Bonificaciones: ${report.bonuses ?? report.bonificaciones}`;
      detallesCont.appendChild(b);
    }

    resultadoCont.style.display = 'block';
    resultadoCont.scrollIntoView({ behavior: 'smooth' });
  }

  function nombreZona(id) {
    const map = {
      'bosque-semejanza': 'Bosque de la Semejanza',
      'trio-frondoso': 'El Trío Frondoso',
      'prado-diferencia': 'Prado de la Diferencia',
      'pradera-amor': 'La Pradera del Amor',
      'isla-solitaria': 'La Isla Solitaria',
      'rey-selva': 'El Rey de la Selva',
      'dinos-rio': 'Dinosaurios en el Río'
    };
    return map[id] || id;
  }

  function limpiarTablero() {
    // reset estado
    for (const k in estadoTablero) estadoTablero[k] = [];
    // limpiar UI
    slots.forEach(s => { s.innerHTML = ''; s.dataset.ocupado = 'false'; });
    // deseleccionar
    dinosauriosDisponibles.forEach(d => { d.classList.remove('seleccionado'); d.setAttribute('aria-selected','false'); });
    dinoSeleccionado = null;
    // ocultar resultados
    resultadoCont.style.display = 'none';
    showSnackbar('Tablero limpiado.');
  }

  // Snackbar simple
  let snackbarTimer = null;
  function showSnackbar(msg, time = 3000) {
    if (!snackbarEl) return;
    snackbarEl.textContent = msg;
    snackbarEl.style.display = 'block';
    snackbarEl.classList.add('visible');
    clearTimeout(snackbarTimer);
    snackbarTimer = setTimeout(() => {
      snackbarEl.classList.remove('visible');
      snackbarEl.style.display = 'none';
    }, time);
  }

  // Utilidad para detectar objetos simples
  function isObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }

});