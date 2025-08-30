<?php
require_once 'PassiveRestrictions.php';
require_once 'ActiveRestrictions.php';

/*
 * Clase ValidadorTablero:
 * Orquesta la validación completa de una colocación teniendo en cuenta
 * las restricciones activas (dado) y las restricciones pasivas (reglas
 * de cada zona). Proporciona utilidades para obtener slots válidos y
 * zonas disponibles para un jugador dado.
 */
class ValidadorTablero {
    private $restriccionesPasivas;
    private $restriccionesActivas;

    /*
     * Inicializa los validadores pasivo y activo al crear la instancia.
     */
    public function __construct() {
        $this->restriccionesPasivas = new PassiveRestrictions();
        $this->restriccionesActivas = new ActiveRestrictions();
    }

    /*
     * Valida una solicitud de colocación combinando comprobaciones de
     * restricciones activas y pasivas. Devuelve un array con 'valid' y 'reason'.
     */
    public function validarColocacion(
        string $zonaId,
        array $dinosauriosEnZona,
        object $dinosaurio,
        int $slot,
        int $jugadorId,
        object $estadoJuego
    ): array {
        try {
            // NUEVA VALIDACIÓN: exigir que el dado haya sido lanzado antes de permitir colocar
            if (isset($estadoJuego->diceState) && !isset($estadoJuego->dado)) {
                $estadoJuego->dado = (object)[
                    'activo' => $estadoJuego->diceState->active ?? false,
                    'caraActual' => $estadoJuego->diceState->currentFace ?? null,
                    'jugadorQueLanzo' => $estadoJuego->diceState->playerWhoRolled ?? null,
                    'rondaActual' => $estadoJuego->diceState->round ?? ($estadoJuego->rondaActual ?? null)
                ];
            }

            if (!isset($estadoJuego->dado) || !($estadoJuego->dado->activo ?? false)) {
                return [
                    'valid' => false,
                    'reason' => 'Debe lanzar el dado antes de colocar un dinosaurio',
                    'type' => 'dadoNoLanzado'
                ];
            }

            // NUEVA VALIDACIÓN: impedir que el mismo jugador coloque más de un dinosaurio en el mismo turno
            // Se acepta que el estado pueda usar nombres distintos; comprobamos varias posibles claves
            $haColocado = $estadoJuego->haColocadoEnEsteTurno ?? ($estadoJuego->hasPlacedThisTurn ?? ($estadoJuego->placedThisTurn ?? false));
            // Si la bandera existe y está activa y el jugador que intenta colocar coincide con el jugador actual o con el jugador que lanzó el dado, rechazamos
            if ($haColocado) {
                $jugadorActualEnEstado = $estadoJuego->jugadorActual ?? ($estadoJuego->currentPlayer ?? null);
                $jugadorQueLanzo = $estadoJuego->dado->jugadorQueLanzo ?? null;

                if ($jugadorActualEnEstado === null || $jugadorActualEnEstado == $jugadorId || $jugadorQueLanzo == $jugadorId) {
                    return [
                        'valid' => false,
                        'reason' => 'Solo puede colocar un dinosaurio por turno',
                        'type' => 'yaColocado'
                    ];
                }
            }

            $validacionActiva = $this->validarRestriccionesActivas(
                $zonaId,
                $estadoJuego->tablero ?? [],
                $jugadorId,
                $estadoJuego
            );

            if (!$validacionActiva['valid']) {
                return $validacionActiva;
            }


            try {
                $infoZona = $this->restriccionesPasivas->obtenerInfoZona($zonaId);
                if ($infoZona && isset($infoZona['ordenamiento']) && $infoZona['ordenamiento'] === 'secuencial' && !in_array($zonaId, ['bosque-semejanza', 'prado-diferencia'], true)) {
                    $resSeq = $this->validarPlacementSecuencial($dinosauriosEnZona, $slot);
                    if (isset($resSeq['valid']) && !$resSeq['valid']) {
                        return [
                            'valid' => false,
                            'reason' => $resSeq['reason'] ?? 'Colocación no secuencial',
                            'type' => 'passiveSequential',
                            'nextSlot' => $resSeq['nextSlot'] ?? null
                        ];
                    }
                }
            } catch (Exception $e) {
                error_log('[ValidadorTablero] Error comprobando orden secuencial: ' . $e->getMessage());

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

    /*
     * Comprueba las restricciones impuestas por el dado (si está activo) y
     * devuelve un resultado que puede bloquear la colocación si procede.
     */
    private function validarRestriccionesActivas(
        string $zonaId,
        $estadoTablero,
        int $jugadorId,
        $estadoJuego
    ): array {

        if ($estadoTablero === null) {
            error_log('[ValidadorTablero] validarRestriccionesActivas: estadoTablero es null, inicializando a array vacío');
            $estadoTablero = [];
        }

        if (!is_object($estadoJuego)) {
            if (is_array($estadoJuego)) {
                $estadoJuego = json_decode(json_encode($estadoJuego));
                error_log('[ValidadorTablero] validarRestriccionesActivas: estadoJuego convertido de array a objeto');
            } else {
                error_log('[ValidadorTablero] validarRestriccionesActivas: estadoJuego no es objeto ni array, tipo: ' . gettype($estadoJuego));

                return ['valid' => true];
            }
        }

        if (isset($estadoJuego->diceState) && !isset($estadoJuego->dado)) {
            $estadoJuego->dado = (object)[
                'activo' => $estadoJuego->diceState->active ?? false,
                'caraActual' => $estadoJuego->diceState->currentFace ?? null,
                'jugadorQueLanzo' => $estadoJuego->diceState->playerWhoRolled ?? null,
                'rondaActual' => $estadoJuego->diceState->round ?? ($estadoJuego->rondaActual ?? null)
            ];
            error_log('[ValidadorTablero] Mapeado diceState -> dado para compatibilidad');
        }

        if (!isset($estadoJuego->dado) || !($estadoJuego->dado->activo ?? false)) {
            return ['valid' => true];
        }

        $dadoState = $estadoJuego->dado;

        if ($jugadorId === ($dadoState->jugadorQueLanzo ?? null)) {
            return ['valid' => true];
        }

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

    /*
     * Devuelve los slots válidos para una zona concreta teniendo en cuenta
     * también las restricciones activas actuales del juego.
     */
    public function obtenerSlotsValidos(
        string $zonaId,
        array $dinosauriosEnZona,
        $dinosaurio,
        int $jugadorId,
        $estadoJuego
    ): array {
        try {

            if ($dinosaurio === null) {
                error_log('[ValidadorTablero] obtenerSlotsValidos: dinosaurio es null');
                return [];
            }

            if (is_array($dinosaurio)) {
                $dinosaurio = json_decode(json_encode($dinosaurio));
                error_log('[ValidadorTablero] obtenerSlotsValidos: dinosaurio convertido de array a objeto');
            }

            if (!is_object($dinosaurio)) {
                error_log('[ValidadorTablero] obtenerSlotsValidos: dinosaurio no es un objeto, tipo recibido: ' . gettype($dinosaurio));
                return [];
            }

            if (!is_object($estadoJuego)) {
                if (is_array($estadoJuego)) {
                    $estadoJuego = json_decode(json_encode($estadoJuego));
                    error_log('[ValidadorTablero] obtenerSlotsValidos: estadoJuego convertido de array a objeto');
                } else {
                    error_log('[ValidadorTablero] obtenerSlotsValidos: estadoJuego no es objeto ni array, inicializando con tablero vacío');
                    $estadoJuego = (object)['tablero' => []];
                }
            }

            if (isset($estadoJuego->board) && !isset($estadoJuego->tablero)) {
                $estadoJuego->tablero = $estadoJuego->board;
                error_log('[ValidadorTablero] map board -> tablero para compatibilidad');
            }

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

    /*
     * Calcula qué zonas están disponibles para un jugador en el estado de
     * juego dado, respetando la lógica del dado cuando está activo.
     */
    public function obtenerZonasDisponibles(int $jugadorId, $estadoJuego): array {
        try {

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

            /**
             * Filtra las zonas permitidas según el dado actual y el tablero recibido en el estado de juego.
             * Convierte $tablero a array para evitar errores de tipo cuando proviene como stdClass.
             * @param object $dadoState Estado del dado (caraActual, jugadorQueLanzo)
             * @param object $estadoJuego Estado completo del juego (contiene el tablero)
             * @return array Zonas permitidas después de aplicar las restricciones activas
             */
            $tablero = $estadoJuego->tablero ?? [];
            if (is_object($tablero)) {
                $tablero = (array) $tablero;
            } elseif (!is_array($tablero)) {
                $tablero = [];
            }

            $permitidas = $this->restriccionesActivas->filterZonesByDice(
                $dadoState->caraActual ?? null,
                $tablero,
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

    /*
     * Genera un mensaje de error legible para el usuario a partir del
     * resultado de validación y la zona en cuestión.
     */
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

    /*
     * Valida que una colocación secuencial sea realizada en el siguiente
     * slot esperado y devuelve información sobre el siguiente slot si falla.
     */
    private function validarPlacementSecuencial(array $dinosauriosEnZona, int $slot): array {
        try {

            $occupied = array_map(function($d) {
                if (isset($d->slot)) return (int)$d->slot;
                if (isset($d->pos)) return (int)$d->pos;
                if (isset($d->position)) return (int)$d->position;
                return null;
            }, $dinosauriosEnZona);

            $occupied = array_filter($occupied, fn($s) => $s !== null);
            sort($occupied);

            $expected = 1;
            foreach ($occupied as $occ) {
                if ($expected < $occ) break;
                $expected = $occ + 1;
            }

            if ($slot !== $expected) {
                error_log("[ValidadorTablero] validarPlacementSecuencial: intento en slot {$slot}, se esperaba {$expected}");
                return [
                    'valid' => false,
                    'reason' => "Debe colocar en el slot {$expected} (orden secuencial requerido)",
                    'nextSlot' => $expected
                ];
            }

            return ['valid' => true, 'reason' => 'Colocación secuencial válida', 'nextSlot' => $expected];
        } catch (Exception $e) {
            error_log('[ValidadorTablero] Error en validarPlacementSecuencial: ' . $e->getMessage());
            return ['valid' => false, 'reason' => 'Error interno validando orden secuencial', 'nextSlot' => null];
        }
    }

}
