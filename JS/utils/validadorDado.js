/*
 * validadorDado.js:
 * Módulo utilitario que encapsula la lógica necesaria para evaluar las
 * restricciones activas definidas por el dado. Proporciona funciones para
 * interpretar la cara actual, filtrar recintos permitidos y exponer helpers
 * usados por la interfaz.
 */

class ValidadorDado {
  constructor(options = {}) {

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

      const text = await response.text();
      console.error('ValidadorDado: respuesta no JSON al obtener slots válidos:', text.slice(0, 1000));
      return { valido: false, razon: 'Respuesta inválida del servidor', validSlots: [] };

    } catch (err) {
      console.error('ValidadorDado: error obteniendo slots válidos del backend', err);
      return { valido: false, razon: 'Error de comunicación con el servidor de validación.', validSlots: [] };
    }
  }

  async validarMovimiento(zonaId, dinosaurio, slot, jugadorId, estadoJuego) {

    return await this.validarPlacement(zonaId, estadoJuego ? (estadoJuego.tablero && estadoJuego.tablero[zonaId] ? estadoJuego.tablero[zonaId] : []) : [], dinosaurio, slot, jugadorId, estadoJuego);
  }

  obtenerInfoRestriccionActual() {

    if (window.manejadorDado && typeof window.manejadorDado.obtenerInfoRestriccionActual === 'function') {
      try { return window.manejadorDado.obtenerInfoRestriccionActual(); } catch (e) {  }
    }
    return null;
  }

  obtenerZonasPermitidas(jugadorId, estadoJuego) {
    const info = this.obtenerInfoRestriccionActual();
    if (!info) return [];
    if (info.zonasPermitidas && Array.isArray(info.zonasPermitidas)) return info.zonasPermitidas;
    return [];
  }
}