<?php
require_once 'PassiveRestrictions.php';
require_once 'ActiveRestrictions.php';

class ValidadorTablero {
    private $restriccionesPasivas;
    private $restriccionesActivas;

    public function __construct() {
        $this->restriccionesPasivas = new PassiveRestrictions();
        $this->restriccionesActivas = new ActiveRestrictions();
    }

    public function validarColocacion(
        string $zonaId,
        array $dinosauriosEnZona,
        object $dinosaurio,
        int $slot,
        int $jugadorId,
        object $estadoJuego
    ): array {
        try {
            $validacionActiva = $this->validarRestriccionesActivas(
                $zonaId,
                $estadoJuego->tablero ?? [],
                $jugadorId,
                $estadoJuego
            );

            if (!$validacionActiva['valid']) {
                return $validacionActiva;
            }

            $validacionPasiva = $this->restriccionesPasivas->validatePlacement(
                $zonaId,
                $dinosauriosEnZona,
                $dinosaurio,
                $slot
            );

            return $validacionPasiva;

        } catch (Exception $e) {
            error_log('Error en validacion de restricciones: ' . $e->getMessage());
            return [
                'valid' => false,
                'reason' => 'Error interno de validacion'
            ];
        }
    }

    private function validarRestriccionesActivas(
        string $zonaId,
        $estadoTablero,
        int $jugadorId,
        $estadoJuego
    ): array {
        // Normalizar nulls/ tipos
        if ($estadoTablero === null) {
            error_log('[ValidadorTablero] validarRestriccionesActivas: estadoTablero es null, inicializando a array vacío');
            $estadoTablero = [];
        }

        // Asegurar que $estadoJuego sea objeto; si viene como array convertir
        if (!is_object($estadoJuego)) {
            if (is_array($estadoJuego)) {
                $estadoJuego = json_decode(json_encode($estadoJuego));
                error_log('[ValidadorTablero] validarRestriccionesActivas: estadoJuego convertido de array a objeto');
            } else {
                error_log('[ValidadorTablero] validarRestriccionesActivas: estadoJuego no es objeto ni array, tipo: ' . gettype($estadoJuego));
                // No podemos evaluar restricciones activas sin un estado válido; asumir sin restricción activa
                return ['valid' => true];
            }
        }

        // Compatibilidad: si frontend viejo envía 'diceState' o propiedades en inglés, mapear a español
        if (isset($estadoJuego->diceState) && !isset($estadoJuego->dado)) {
            $estadoJuego->dado = (object)[
                'activo' => $estadoJuego->diceState->active ?? false,
                'caraActual' => $estadoJuego->diceState->currentFace ?? null,
                'jugadorQueLanzo' => $estadoJuego->diceState->playerWhoRolled ?? null,
                'rondaActual' => $estadoJuego->diceState->round ?? ($estadoJuego->rondaActual ?? null)
            ];
            error_log('[ValidadorTablero] Mapeado diceState -> dado para compatibilidad');
        }

        // Si no hay estado del dado o no está activo, no aplicar restricciones activas
        if (!isset($estadoJuego->dado) || !($estadoJuego->dado->activo ?? false)) {
            return ['valid' => true];
        }

        $dadoState = $estadoJuego->dado;

        // Si el jugador que tiró el dado es el actual, no aplicar la restricción
        if ($jugadorId === ($dadoState->jugadorQueLanzo ?? null)) {
            return ['valid' => true];
        }

        // Asegurar que $estadoTablero sea array antes de pasar a ActiveRestrictions
        if (!is_array($estadoTablero)) {
            error_log('[ValidadorTablero] validarRestriccionesActivas: estadoTablero no es array, tipo: ' . gettype($estadoTablero));
            $estadoTablero = [];
        }

        $zonaPermitida = $this->restriccionesActivas->isZoneAllowed(
            $zonaId,
            $dadoState->caraActual ?? null,
            $estadoTablero,
            $dadoState->jugadorQueLanzo ?? null
        );

        if (!$zonaPermitida) {
            $mensaje = $this->restriccionesActivas->getRestrictionMessage(
                $dadoState->caraActual ?? null,
                $jugadorId,
                $dadoState->jugadorQueLanzo ?? null
            );

            return [
                'valid' => false,
                'reason' => "Restricción del dado: {$mensaje}",
                'type' => 'activeRestriction'
            ];
        }

        return ['valid' => true];
    }

    public function obtenerSlotsValidos(
        string $zonaId,
        array $dinosauriosEnZona,
        $dinosaurio,
        int $jugadorId,
        $estadoJuego
    ): array {
        try {
            // Validaciones de tipos y manejo de nulos
            if ($dinosaurio === null) {
                error_log('[ValidadorTablero] obtenerSlotsValidos: dinosaurio es null');
                return [];
            }

            // Si $dinosaurio viene como array, convertir a objeto
            if (is_array($dinosaurio)) {
                $dinosaurio = json_decode(json_encode($dinosaurio));
                error_log('[ValidadorTablero] obtenerSlotsValidos: dinosaurio convertido de array a objeto');
            }

            if (!is_object($dinosaurio)) {
                error_log('[ValidadorTablero] obtenerSlotsValidos: dinosaurio no es un objeto, tipo recibido: ' . gettype($dinosaurio));
                return [];
            }

            // Manejo de estado del juego nulo o no objeto
            if (!is_object($estadoJuego)) {
                if (is_array($estadoJuego)) {
                    $estadoJuego = json_decode(json_encode($estadoJuego));
                    error_log('[ValidadorTablero] obtenerSlotsValidos: estadoJuego convertido de array a objeto');
                } else {
                    error_log('[ValidadorTablero] obtenerSlotsValidos: estadoJuego no es objeto ni array, inicializando con tablero vacío');
                    $estadoJuego = (object)['tablero' => []];
                }
            }

            // Compatibilidad: mapear 'board' a 'tablero' si existe
            if (isset($estadoJuego->board) && !isset($estadoJuego->tablero)) {
                $estadoJuego->tablero = $estadoJuego->board;
                error_log('[ValidadorTablero] map board -> tablero para compatibilidad');
            }

            // Asegurar que tablero exista y sea array
            $estadoTablero = [];
            if (isset($estadoJuego->tablero) && is_array($estadoJuego->tablero)) {
                $estadoTablero = $estadoJuego->tablero;
            } else {
                error_log('[ValidadorTablero] obtenerSlotsValidos: tablero no existe o no es array, inicializando a array vacío');
                $estadoTablero = [];
            }

            $validacionActiva = $this->validarRestriccionesActivas(
                $zonaId,
                $estadoTablero,
                $jugadorId,
                $estadoJuego
            );

            if (!$validacionActiva['valid']) {
                error_log('[ValidadorTablero] obtenerSlotsValidos: restriccion activa impide obtener slots validos');
                return [];
            }

            // Pasar dinosaurio como objeto ya validado a las restricciones pasivas
            return $this->restriccionesPasivas->getValidSlots(
                $zonaId,
                $dinosauriosEnZona,
                $dinosaurio
            );

        } catch (Exception $e) {
            error_log('Error obteniendo slots validos: ' . $e->getMessage());
            return [];
        }
    }

    public function obtenerZonasDisponibles(int $jugadorId, $estadoJuego): array {
        try {
            // Compatibilidad: mapear 'diceState' a 'dado' si es necesario
            if (isset($estadoJuego->diceState) && !isset($estadoJuego->dado)) {
                $estadoJuego->dado = (object)[
                    'activo' => $estadoJuego->diceState->active ?? false,
                    'caraActual' => $estadoJuego->diceState->currentFace ?? null,
                    'jugadorQueLanzo' => $estadoJuego->diceState->playerWhoRolled ?? null,
                    'rondaActual' => $estadoJuego->diceState->round ?? ($estadoJuego->rondaActual ?? null)
                ];
                error_log('[ValidadorTablero] Mapeado diceState -> dado en obtenerZonasDisponibles');
            }

            if (!isset($estadoJuego->dado) || !($estadoJuego->dado->activo ?? false)) {
                return $this->restriccionesActivas->getAllZones();
            }

            $dadoState = $estadoJuego->dado;

            if ($jugadorId === ($dadoState->jugadorQueLanzo ?? null)) {
                return $this->restriccionesActivas->getAllZones();
            }

            $permitidas = $this->restriccionesActivas->filterZonesByDice(
                $dadoState->caraActual ?? null,
                $estadoJuego->tablero ?? [],
                $dadoState->jugadorQueLanzo ?? null
            );

            if (!in_array('dinos-rio', $permitidas)) {
                $permitidas[] = 'dinos-rio';
            }

            return $permitidas;

        } catch (Exception $e) {
            error_log('Error obteniendo zonas disponibles: ' . $e->getMessage());
            return ['dinos-rio'];
        }
    }

    public function generarMensajeError(string $zonaId, array $validacion): string {
        if (isset($validacion['type']) && $validacion['type'] === 'activeRestriction') {
            return $validacion['reason'];
        }

        $mensajes = [
            'bosque-semejanza' => 'Bosque de la Semejanza: ' . $validacion['reason'],
            'prado-diferencia' => 'Prado de la Diferencia: ' . $validacion['reason'],
            'pradera-amor' => 'Pradera del Amor: ' . $validacion['reason'],
            'trio-frondoso' => 'Trío Frondoso: ' . $validacion['reason'],
            'rey-selva' => 'Rey de la Selva: ' . $validacion['reason'],
            'isla-solitaria' => 'Isla Solitaria: ' . $validacion['reason'],
            'dinos-rio' => 'Dinosaurios en el Rio: ' . $validacion['reason']
        ];

        return $mensajes[$zonaId] ?? $validacion['reason'];
    }
}
