/*
 * lo que hace es manejar el formulario de fisico.php (modularizacion)
 */

class FisicoFormManager {
    constructor() {
      this.form = null;
      this.resultado = null;
      this.btnReset = null;
      this.playerId = 1;
      this.totalDisplayEl = null;
      this.totalHiddenInput = null;
      this.numberInputs = [];
      
      // Nombres de zonas para mostrar en resultados
      this.zonaNombres = {
        'bosque-semejanza': 'Bosque de la Semejanza',
        'trio-frondoso': 'El Trío Frondoso',
        'prado-diferencia': 'Prado de la Diferencia',
        'pradera-amor': 'La Pradera del Amor',
        'isla-solitaria': 'La Isla Solitaria',
        'rey-selva': 'El Rey de la Selva',
        'dinos-rio': 'Dinosaurios en el Río'
      };
    }
  
    /**
     * Inicializa el manager y todos los event listeners
     */
    init() {
      this.initializeElements();
      if (!this.form) {
        console.warn('Formulario no encontrado, FisicoFormManager no se inicializará');
        return;
      }
      
      this.setupEventListeners();
      this.actualizarTotal(); // Inicializar valor al cargar
    }
  
    /**
     * Obtiene referencias a todos los elementos del DOM necesarios
     */
    initializeElements() {
      this.form = document.getElementById('form-recintos');
      this.resultado = document.getElementById('resultado-form');
      this.btnReset = document.getElementById('btn-reset');
      this.totalDisplayEl = document.getElementById('total-dinos-valor');
      this.totalHiddenInput = document.getElementById('total-dinos');
      this.numberInputs = Array.from(document.querySelectorAll('#form-recintos input[type=number]'));
      
      // Obtener playerId del atributo data
      const mainContent = document.querySelector('main#mainContent');
      this.playerId = parseInt(mainContent?.dataset.playerId || '1', 10);
    }
  
    /**
     * Configura todos los event listeners necesarios
     */
    setupEventListeners() {
      // Event listener para cada input numérico
      this.numberInputs.forEach(inp => {
        inp.addEventListener('input', () => this.actualizarTotal());
      });
  
      // Event listener para el submit del formulario
      this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  
      // Event listener para el botón reset
      if (this.btnReset) {
        this.btnReset.addEventListener('click', () => this.handleReset());
      }
    }
  
    /**
     * Actualiza el total de dinosaurios colocados
     * @returns {number} El total calculado
     */
    actualizarTotal() {
      const total = this.numberInputs.reduce((acc, inp) => {
        const v = Number(inp.value || 0);
        return acc + (Number.isFinite(v) ? v : 0);
      }, 0);
      
      if (this.totalDisplayEl) {
        this.totalDisplayEl.textContent = String(total);
      }
      if (this.totalHiddenInput) {
        this.totalHiddenInput.value = String(total);
      }
      
      return total;
    }
  
    /**
     * Maneja el envío del formulario
     * @param {Event} e - Event object del submit
     */
    async handleFormSubmit(e) {
      e.preventDefault();
      this.hideResultado();
  
      // Validación de frontend
      if (!this.validateInputs()) {
        return;
      }
  
      // Preparar datos para envío
      const formData = this.prepareFormData();
  
      try {
        const response = await this.submitForm(formData);
        const jsonResponse = await this.parseResponse(response);
        
        if (jsonResponse.exito && jsonResponse.scoreReport) {
          this.mostrarPantallaPuntuacion(jsonResponse.scoreReport);
        } else {
          this.showError(jsonResponse.mensaje || jsonResponse.message || 'Error desconocido al calcular puntuación');
        }
      } catch (err) {
        console.error('Error en envío del formulario:', err);
        this.showError('Error procesando solicitud: ' + err.message);
      }
    }
  
    /**
     * Valida todos los inputs del formulario
     * @returns {boolean} true si todos los inputs son válidos
     */
    validateInputs() {
      const inputs = Array.from(this.form.querySelectorAll('input[type=number]'));
      
      for (const input of inputs) {
        const min = Number(input.getAttribute('min') || -Infinity);
        const max = Number(input.getAttribute('max') || Infinity);
        const val = Number(input.value || 0);
        
        if (!Number.isInteger(val) || val < min || val > max) {
          this.showError(`Valor inválido en ${input.name}. Debe ser entero entre ${min} y ${max}.`);
          return false;
        }
      }
      
      return true;
    }
  
    /**
     * Prepara los datos del formulario para envío
     * @returns {FormData} FormData preparado para envío
     */
    prepareFormData() {
      const fd = new FormData(this.form);
      fd.set('playerId', String(this.playerId));
      fd.set('action', 'calcular-puntuacion');
      
      // Asegurar que el total esté actualizado antes del envío
      this.actualizarTotal();
      
      return fd;
    }
  
    /**
     * Envía el formulario al servidor
     * @param {FormData} formData - Datos del formulario
     * @returns {Promise<Response>} Promesa con la respuesta del servidor
     */
    async submitForm(formData) {
      const response = await fetch(window.location.href, { 
        method: 'POST', 
        body: formData 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    }
  
    /**
     * Parsea la respuesta del servidor
     * @param {Response} response - Respuesta del servidor
     * @returns {Promise<Object>} JSON parseado
     */
    async parseResponse(response) {
      const text = await response.text();
      
      if (!text || !text.trim()) {
        throw new Error('Respuesta vacía del servidor');
      }
      
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e, 'raw:', text);
        throw new Error('Respuesta no válida del servidor');
      }
    }
  
    /**
     * Maneja el reset del formulario
     */
    handleReset() {
      this.form.reset();
      this.hideResultado();
      this.actualizarTotal();
    }
  
    /**
     * Oculta el div de resultado
     */
    hideResultado() {
      if (this.resultado) {
        this.resultado.style.display = 'none';
      }
    }
  
    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error a mostrar
     */
    showError(message) {
      if (this.resultado) {
        this.resultado.style.display = 'block';
        this.resultado.className = 'alert alert-danger';
        this.resultado.textContent = message;
      }
    }
  
    /**
     * Muestra la pantalla modal con la puntuación calculada
     * @param {Object} report - Reporte de puntuación del servidor
     */
    mostrarPantallaPuntuacion(report) {
      const total = report.totalScore ?? report.total ?? report.baseScore ?? 0;
      const baseDetails = report.baseDetails ?? report.details ?? {};
      const bonuses = report.bonuses ?? report.bonusDetails ?? 0;
  
      const overlay = this.createOverlay();
      const card = this.createResultCard(total, baseDetails, bonuses);
      
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      
      overlay.scrollIntoView({ behavior: 'smooth' });
      
      // Enfocar el botón cerrar para accesibilidad
      const btnClose = card.querySelector('.btn-secondary');
      if (btnClose) btnClose.focus();
    }
  
    /**
     * Crea el overlay modal
     * @returns {HTMLDivElement} Elemento overlay
     */
    createOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
      overlay.style.background = 'rgba(0,0,0,0.6)';
      overlay.style.zIndex = '9999';
      return overlay;
    }
  
    /**
     * Crea la tarjeta de resultados
     * @param {number} total - Puntuación total
     * @param {Object} baseDetails - Detalles de puntuación por zona
     * @param {number} bonuses - Bonificaciones
     * @returns {HTMLDivElement} Elemento card
     */
    createResultCard(total, baseDetails, bonuses) {
      const card = document.createElement('div');
      card.className = 'card shadow-lg';
      card.style.maxWidth = '760px';
      card.style.width = '90%';
  
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
  
      // Título
      const title = this.createTitle();
      cardBody.appendChild(title);
  
      // Total
      const totalEl = this.createTotalElement(total);
      cardBody.appendChild(totalEl);
  
      // Desglose por zonas
      const detallesWrapper = this.createDetailsSection(baseDetails);
      cardBody.appendChild(detallesWrapper);
  
      // Bonificaciones (si existen)
      if (typeof bonuses === 'number' && bonuses > 0) {
        const bonusDiv = this.createBonusSection(bonuses);
        cardBody.appendChild(bonusDiv);
      }
  
      // Footer con botones
      const footer = this.createFooter();
      cardBody.appendChild(footer);
  
      card.appendChild(cardBody);
      return card;
    }
  
    /**
     * Crea el título del modal
     * @returns {HTMLHeadingElement} Elemento título
     */
    createTitle() {
      const title = document.createElement('h3');
      title.className = 'card-title mb-3';
      title.textContent = 'Resultado de Puntuación';
      return title;
    }
  
    /**
     * Crea el elemento de puntuación total
     * @param {number} total - Puntuación total
     * @returns {HTMLDivElement} Elemento total
     */
    createTotalElement(total) {
      const totalEl = document.createElement('div');
      totalEl.className = 'mb-3 lead';
      totalEl.innerHTML = `<strong>Puntuación Total:</strong> <span class="fs-4">${total} pts</span>`;
      return totalEl;
    }
  
    /**
     * Crea la sección de detalles por zona
     * @param {Object} baseDetails - Detalles de puntuación por zona
     * @returns {HTMLDivElement} Sección de detalles
     */
    createDetailsSection(baseDetails) {
      const detallesWrapper = document.createElement('div');
      detallesWrapper.className = 'mb-3';
      
      const h = document.createElement('h5');
      h.textContent = 'Desglose por Zona:';
      detallesWrapper.appendChild(h);
  
      const ul = document.createElement('ul');
      ul.className = 'list-group list-group-flush';
  
      for (const zonaId of Object.keys(this.zonaNombres)) {
        const det = baseDetails[zonaId] ?? {};
        const li = this.createZoneDetailItem(zonaId, det);
        ul.appendChild(li);
      }
  
      detallesWrapper.appendChild(ul);
      return detallesWrapper;
    }
  
    /**
     * Crea un item de detalle para una zona
     * @param {string} zonaId - ID de la zona
     * @param {Object} det - Detalles de la zona
     * @returns {HTMLLIElement} Item de lista
     */
    createZoneDetailItem(zonaId, det) {
      const points = det.points ?? det.puntos ?? 0;
      const count = det.dinosaurCount ?? det.count ?? 0;
      
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div><strong>${this.zonaNombres[zonaId]}:</strong> ${det.description ?? ''}</div>
        <div>
          <span class="badge bg-primary rounded-pill me-2">${count}</span>
          <span>${points} pts</span>
        </div>
      `;
      
      return li;
    }
  
    /**
     * Crea la sección de bonificaciones
     * @param {number} bonuses - Cantidad de bonificaciones
     * @returns {HTMLDivElement} Sección de bonificaciones
     */
    createBonusSection(bonuses) {
      const bdiv = document.createElement('div');
      bdiv.className = 'alert alert-warning';
      bdiv.innerHTML = `<strong>Bonificaciones:</strong> ${bonuses}`;
      return bdiv;
    }
  
    /**
     * Crea el footer con botones de acción
     * @returns {HTMLDivElement} Footer
     */
    createFooter() {
      const footer = document.createElement('div');
      footer.className = 'd-flex justify-content-end gap-2';
  
      const btnClose = document.createElement('button');
      btnClose.className = 'btn btn-secondary';
      btnClose.textContent = 'Cerrar';
      btnClose.addEventListener('click', () => {
        const overlay = document.querySelector('.position-fixed');
        if (overlay) document.body.removeChild(overlay);
      });
  
      const btnGoPuntaje = document.createElement('a');
      btnGoPuntaje.className = 'btn btn-primary';
      btnGoPuntaje.textContent = 'Ver Página de Puntajes';
      btnGoPuntaje.href = 'puntaje.php';
  
      footer.appendChild(btnGoPuntaje);
      footer.appendChild(btnClose);
      
      return footer;
    }
  }
  
  // Inicialización automática cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    const fisicoManager = new FisicoFormManager();
    fisicoManager.init();
  });
  
  // Exportar para uso en otros módulos si es necesario
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = FisicoFormManager;
  }