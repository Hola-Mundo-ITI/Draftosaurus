<?php

require_once 'ValidadorTablero.php';

/*
 * Clase SistemaBots:
 * Implementa la lógica básica para decidir movimientos de bots y gestionar
 * información sobre bots activos. Utiliza ValidadorTablero para comprobar
 * movimientos válidos antes de proponer una jugada.
 */
class SistemaBots {
    private $bots;
    private $validadorTablero;

    /*
     * Inicializa la lista de bots y el validador al crear la instancia.
     */
    public function __construct() {
        $this->bots = [
            2 => ['nombre' => 'Bot Alpha', 'activo' => true],
            3 => ['nombre' => 'Bot Beta', 'activo' => true]
        ];
        $this->validadorTablero = new ValidadorTablero();
    }

    /*
     * Indica si el identificador corresponde a un bot activo.
     */
    public function esBot(int $jugadorId): bool {
        return isset($this->bots[$jugadorId]) && ($this->bots[$jugadorId]['activo'] ?? false);
    }

    /*
     * Decide un movimiento para el bot dado el estado del juego: itera por
     * los dinosaurios disponibles y las zonas permitidas, validando slots.
     * Devuelve null si no encuentra movimiento válido.
     */
    public function decidirMovimientoBot(int $jugadorId, object $estadoJuego): ?array {
        $dinosauriosDisponibles = $this->obtenerDinosauriosDisponibles($estadoJuego->availableDinosaurs ?? []);
        if (empty($dinosauriosDisponibles)) {
            error_log("SistemaBots: No hay dinosaurios disponibles para el bot {$jugadorId}");
            return null;
        }

        foreach ($dinosauriosDisponibles as $dinosaurio) {
            $todasZonas = $this->validadorTablero->obtenerZonasDisponibles($jugadorId, $estadoJuego);

            if (!in_array('dinos-rio', $todasZonas)) {
                $todasZonas[] = 'dinos-rio';
            }

            foreach ($todasZonas as $zonaId) {
                $dinosEnZona = $estadoJuego->board->{$zonaId} ?? [];

                $slotsValidos = $this->validadorTablero->obtenerSlotsValidos(
                    $zonaId,
                    $dinosEnZona,
                    (object)['type' => $dinosaurio->type, 'id' => $dinosaurio->id, 'image' => $dinosaurio->image],
                    $jugadorId,
                    $estadoJuego
                );

                if (!empty($slotsValidos)) {
                    $slotSeleccionado = $slotsValidos[array_rand($slotsValidos)];

                    return [
                        'dinosaur' => $dinosaurio,
                        'zoneId' => $zonaId,
                        'slot' => $slotSeleccionado
                    ];
                }
            }
        }

        error_log("SistemaBots: Bot {$jugadorId} no pudo encontrar un movimiento válido.");
        return null;
    }

    /*
     * Normaliza y filtra la lista de dinosaurios disponibles, descartando
     * entradas incompletas.
     */
    private function obtenerDinosauriosDisponibles(array $rawDinosaurs): array {
        $dinosaurs = [];
        foreach ($rawDinosaurs as $dino) {
            if (isset($dino->type) && isset($dino->id) && isset($dino->image)) {
                $dinosaurs[] = $dino;
            }
        }
        return $dinosaurs;
    }

    /*
     * Devuelve información resumida de los bots y el conteo de bots activos.
     */
    public function obtenerInfoBots(): array {
        return [
            'bots' => $this->bots,
            'conteoActivos' => count(array_filter($this->bots, fn($bot) => ($bot['activo'] ?? false)))
        ];
    }

    /*
     * Activa o desactiva un bot dado su identificador. Si no existe, registra
     * un error en el log.
     */
    public function alternarBot(int $jugadorId, ?bool $activo = null): void {
        if (!isset($this->bots[$jugadorId])) {
            error_log("SistemaBots: Bot {$jugadorId} no existe.");
            return;
        }

        $this->bots[$jugadorId]['activo'] = $activo !== null ? $activo : !($this->bots[$jugadorId]['activo'] ?? false);
    }

    /*
     * Métodos adaptadores en inglés que delegan en las funciones existentes.
     */
    public function isBot(int $playerId): bool {
        return $this->esBot($playerId);
    }

    public function decideBotMove(int $playerId, object $gameState): ?array {
        return $this->decidirMovimientoBot($playerId, $gameState);
    }

    public function getAvailableDinosaurs(array $rawDinosaurs): array {
        return $this->obtenerDinosauriosDisponibles($rawDinosaurs);
    }

    public function getBotInfo(): array {
        return $this->obtenerInfoBots();
    }

    public function toggleBot(int $playerId, ?bool $active = null): void {
        $this->alternarBot($playerId, $active);
    }
}

if (!class_exists('BotSystem')) {
    class BotSystem extends SistemaBots {}
}

?>