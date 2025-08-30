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
     * Ahora acepta un array de opciones: ['totalPlayers' => N] para generar
     * dinámicamente bots para los jugadores 2..N. Mantiene compatibilidad
     * con el comportamiento anterior.
     */
    public function __construct($options = []) {
        $totalPlayers = isset($options['totalPlayers']) ? max(2, intval($options['totalPlayers'])) : 3;

        $defaultNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta'];
        $this->bots = [];
        for ($i = 2; $i <= $totalPlayers; $i++) {
            $name = $defaultNames[$i - 2] ?? "Bot {$i}";
            $this->bots[$i] = ['nombre' => $name, 'activo' => true];
        }

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
        // Obtener lista normalizada de dinosaurios disponibles
        $dinosauriosDisponibles = $this->obtenerDinosauriosDisponibles($estadoJuego->availableDinosaurs ?? []);
        if (empty($dinosauriosDisponibles)) {
            error_log("SistemaBots: No hay dinosaurios disponibles para el bot {$jugadorId}");
            return null;
        }

        // Intentar extraer tableros enviados desde el cliente y seleccionar el tablero del bot
        $tablerosRecibidos = [];
        if (isset($estadoJuego->tableros)) {
            $tablerosRecibidos = (array)$estadoJuego->tableros;
        }

        error_log("[SistemaBots] Tableros recibidos: " . json_encode(array_keys($tablerosRecibidos)));

        $tableroBot = null;
      
        if (isset($estadoJuego->tableros)) {
            if (is_object($estadoJuego->tableros) && isset($estadoJuego->tableros->{$jugadorId})) {
                $tableroBot = $estadoJuego->tableros->{$jugadorId};
            } elseif (is_array($estadoJuego->tableros) && isset($estadoJuego->tableros[$jugadorId])) {
                $tableroBot = (object)$estadoJuego->tableros[$jugadorId];
            }
        }


        if (!$tableroBot) {
            if (isset($estadoJuego->tablero)) {
                $tableroBot = $estadoJuego->tablero;
            }
        }

        if (!$tableroBot) {
            $tableroBot = $this->inicializarTableroVacio();
        }

        error_log("[SistemaBots] Tablero seleccionado para Bot {$jugadorId}: " . json_encode($tableroBot));

        // Crear una copia del estado de juego para validaciones donde el tablero
        // principal (board/tablero) apunta exclusivamente al tablero del bot
        $estadoParaValidacion = clone $estadoJuego;
        $estadoParaValidacion->tablero = $tableroBot;
        $estadoParaValidacion->board = $tableroBot; // compatibilidad

        foreach ($dinosauriosDisponibles as $dinosaurio) {
            $todasZonas = $this->validadorTablero->obtenerZonasDisponibles($jugadorId, $estadoParaValidacion);

            if (!in_array('dinos-rio', $todasZonas)) {
                $todasZonas[] = 'dinos-rio';
            }

            foreach ($todasZonas as $zonaId) {
                $dinosEnZona = [];
                if (is_object($tableroBot) && isset($tableroBot->{$zonaId})) {
                    $dinosEnZona = $tableroBot->{$zonaId};
                } elseif (is_array($tableroBot) && isset($tableroBot[$zonaId])) {
                    $dinosEnZona = $tableroBot[$zonaId];
                } elseif (isset($estadoJuego->board->{$zonaId})) {
                    // último recurso: usar board global si no hay tableros
                    $dinosEnZona = $estadoJuego->board->{$zonaId};
                }

                $slotsValidos = $this->validadorTablero->obtenerSlotsValidos(
                    $zonaId,
                    $dinosEnZona,
                    (object)['type' => $dinosaurio->type, 'id' => $dinosaurio->id, 'image' => $dinosaurio->image],
                    $jugadorId,
                    $estadoParaValidacion
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
     * Inicializa y devuelve un tablero vacío (estructura por zonas).
     */
    private function inicializarTableroVacio(): object {
        return (object)[
            'bosque-semejanza' => [],
            'prado-diferencia' => [],
            'trio-frondoso' => [],
            'pradera-amor' => [],
            'isla-solitaria' => [],
            'rey-selva' => [],
            'dinos-rio' => []
        ];
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