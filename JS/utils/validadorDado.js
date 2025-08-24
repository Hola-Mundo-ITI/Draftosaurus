/**
 * Clase para validar las restricciones del dado de colocación
 * Se integra con el sistema de validación existente
 */
class ValidadorDado {
  constructor(options = {}) {
    // kept for compatibility; client-side rules removed
    this.debug = options.debug || false;
    console.log('🎯 ValidadorDado inicializado correctamente');
  }

  async validarPlacement(zonaId, dinosauriosEnZona, dinosaurio, slot, jugadorId, estadoJuego) {
    try {
      const response = await fetch('backend/validarMovimiento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validatePlacement',
          zoneId: zonaId,
          dinosaursInZone: dinosauriosEnZona,
          dinosaur: dinosaurio,
          slot: slot,
          playerId: jugadorId,
          gameState: estadoJuego
        })
      });
      return await response.json();
    } catch (err) {
      console.error('ValidadorDado: error comunicando con backend de validación', err);
      return { valido: false, razon: 'Error de comunicación con el servidor de validación.' };
    }
  }

  async getValidSlots(zonaId, dinosauriosEnZona, dinosaurio, jugadorId, estadoJuego) {
    try {
      const response = await fetch('backend/validarMovimiento.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getValidSlots',
          zoneId: zonaId,
          dinosaursInZone: dinosauriosEnZona,
          dinosaur: dinosaurio,
          playerId: jugadorId,
          gameState: estadoJuego
        })
      });

      // Comprobación robusta del tipo de contenido y manejo de errores HTTP
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok) {
        const texto = await response.text();
        console.error('ValidadorDado: backend responded with status', response.status, texto.slice(0, 500));
        return { valido: false, razon: 'Error del servidor de validación', validSlots: [] };
      }

      if (contentType.includes('application/json')) {
        try {
          return await response.json();
        } catch (parseErr) {
          const texto = await response.text();
          console.error('ValidadorDado: JSON parse error al obtener slots válidos:', parseErr, 'response snippet:', texto.slice(0, 500));
          return { valido: false, razon: 'Respuesta inválida del servidor (no JSON)', validSlots: [] };
        }
      }

      // Si no es JSON, sacar texto para debug y devolver fallback seguro
      const text = await response.text();
      console.error('ValidadorDado: respuesta no JSON al obtener slots válidos:', text.slice(0, 1000));
      return { valido: false, razon: 'Respuesta inválida del servidor', validSlots: [] };

    } catch (err) {
      console.error('ValidadorDado: error obteniendo slots válidos del backend', err);
      return { valido: false, razon: 'Error de comunicación con el servidor de validación.', validSlots: [] };
    }
  }

  // Backwards-compatible stubs for previously used helpers
  async validarMovimiento(zonaId, dinosaurio, slot, jugadorId, estadoJuego) {
    // alias used in some places: map to validarPlacement
    return await this.validarPlacement(zonaId, estadoJuego ? (estadoJuego.tablero && estadoJuego.tablero[zonaId] ? estadoJuego.tablero[zonaId] : []) : [], dinosaurio, slot, jugadorId, estadoJuego);
  }

  obtenerInfoRestriccionActual() {
    // Info del dado vive en el backend; cliente puede leer window.manejadorDado si existe
    if (window.manejadorDado && typeof window.manejadorDado.obtenerInfoRestriccionActual === 'function') {
      try { return window.manejadorDado.obtenerInfoRestriccionActual(); } catch (e) { /* ignore */ }
    }
    return null;
  }

  // Otros métodos ligeros que antes existían devuelven valores neutrales o llaman al backend cuando aplica
  obtenerZonasPermitidas(jugadorId, estadoJuego) {
    const info = this.obtenerInfoRestriccionActual();
    if (!info) return [];
    if (info.zonasPermitidas && Array.isArray(info.zonasPermitidas)) return info.zonasPermitidas;
    return [];
  }
}