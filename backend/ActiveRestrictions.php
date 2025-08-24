<?php

class RestriccionesActivas {
    private $mapeoAreas;
    private $mapeoLados;
    private $carasDado;
    private $todasZonas;

    public function __construct() {
        $this->mapeoAreas = $this->definirMapeoAreas();
        $this->mapeoLados = $this->definirMapeoLados();
        $this->carasDado = $this->definirCarasDado();
        $this->todasZonas = $this->obtenerTodasZonas();
    }

    /**
     * Define el mapeo de recintos por areas (Bosque/Llanura).
     */
    protected function definirMapeoAreas(): array {
        return [
            'bosque' => ['bosque-semejanza', 'rey-selva', 'trio-frondoso'],
            'llanura' => ['prado-diferencia', 'pradera-amor', 'isla-solitaria']
        ];
    }

    /**
     * Define el mapeo de recintos por lados del río.
     */
    protected function definirMapeoLados(): array {
        return [
            'izquierda' => ['bosque-semejanza', 'trio-frondoso', 'pradera-amor'],
            'derecha' => ['rey-selva', 'prado-diferencia', 'isla-solitaria']
        ];
    }

    /**
     * Define las caras del dado y sus restricciones.
     */
    protected function definirCarasDado(): array {
        return [
            'bosque' => [
                'name' => 'Bosque',
                'type' => 'area',
                'zones' => $this->mapeoAreas['bosque'],
                'description' => 'Solo recintos del área Bosque'
            ],
            'llanura' => [
                'name' => 'Llanura',
                'type' => 'area',
                'zones' => $this->mapeoAreas['llanura'],
                'description' => 'Solo recintos del área Llanura'
            ],
            'banos' => [
                'name' => 'Baños',
                'type' => 'side',
                'zones' => $this->mapeoLados['derecha'],
                'description' => 'Solo recintos a la derecha del río'
            ],
            'cafeteria' => [
                'name' => 'Cafetería',
                'type' => 'side',
                'zones' => $this->mapeoLados['izquierda'],
                'description' => 'Solo recintos a la izquierda del río'
            ],
            'recintoVacio' => [
                'name' => 'Recinto Vacío',
                'type' => 'dynamic',
                'description' => 'Solo recintos que no tengan dinosaurios'
            ],
        ];
    }

    /**
     * Filtra los recintos disponibles según la cara del dado.
     *
     * @param string $caraActual Cara actual del dado.
     * @param array $estadoTablero Estado actual del tablero (dinosaurios en cada zona).
     * @param int $jugadorQueLanzo ID del jugador que lanzó el dado.
     * @return array Un array de strings con los IDs de los recintos permitidos.
     */
    public function filtrarZonasPorDado(
        string $caraActual,
        array $estadoTablero,
        int $jugadorQueLanzo
    ): array {
        $cara = $this->carasDado[$caraActual] ?? null;

        if (!$cara) {
            error_log('Cara del dado no reconocida: ' . $caraActual);
            return $this->obtenerTodasZonas();
        }

        switch ($cara['type']) {
            case 'area':
            case 'side':
                return $cara['zones'];

            case 'dynamic':
                return $this->filtrarZonasDinamicas($caraActual, $estadoTablero);

            default:
                return $this->obtenerTodasZonas();
        }
    }

    /**
     * Filtra recintos para restricciones dinámicas.
     *
     * @param string $caraActual Cara actual del dado.
     * @param array $estadoTablero Estado actual del tablero.
     * @return array Un array de strings con los IDs de los recintos permitidos.
     */
    protected function filtrarZonasDinamicas(string $caraActual, array $estadoTablero): array {
        switch ($caraActual) {
            case 'recintoVacio':
                return $this->filtrarZonasVacias($this->obtenerTodasZonas(), $estadoTablero);

            default:
                return $this->obtenerTodasZonas();
        }
    }

    /**
     * Filtra solo los recintos que están vacíos.
     *
     * @param array $zonas Array de IDs de zonas a filtrar.
     * @param array $estadoTablero Estado actual del tablero.
     * @return array Un array de strings con los IDs de los recintos vacíos.
     */
    protected function filtrarZonasVacias(array $zonas, array $estadoTablero): array {
        return array_filter($zonas, function($zona) use ($estadoTablero) {
            $dinosauriosEnZona = $estadoTablero[$zona] ?? [];
            return empty($dinosauriosEnZona);
        });
    }

    /**
     * Obtiene todos los recintos (excepto el río).
     *
     * @return array Un array de strings con los IDs de todos los recintos.
     */
    public function obtenerTodasZonas(): array {
        return [
            'bosque-semejanza',
            'prado-diferencia',
            'pradera-amor',
            'trio-frondoso',
            'rey-selva',
            'isla-solitaria'
        ];
    }

    /**
     * Verifica si un recinto está permitido por las restricciones activas.
     *
     * @param string $zoneId ID de la zona.
     * @param string $caraActual Cara actual del dado.
     * @param array $estadoTablero Estado actual del tablero.
     * @param int $jugadorQueLanzo ID del jugador que lanzó el dado.
     * @return bool True si el recinto está permitido, false en caso contrario.
     */
    public function zonaPermitida(
        string $zoneId,
        string $caraActual,
        array $estadoTablero,
        int $jugadorQueLanzo
    ): bool {
        // El río siempre está disponible como comodín
        if ($zoneId === 'dinos-rio') {
            return true;
        }

        $zonasPermitidas = $this->filtrarZonasPorDado($caraActual, $estadoTablero, $jugadorQueLanzo);
        return in_array($zoneId, $zonasPermitidas);
    }

    /**
     * Obtiene información sobre la restricción actual del dado.
     *
     * @param string $caraActual Cara actual del dado.
     * @return array|null Un array con la información de la cara del dado o null si no se encuentra.
     */
    public function obtenerInfoRestriccion(string $caraActual): ?array {
        return $this->carasDado[$caraActual] ?? null;
    }

    /**
     * Obtiene mensaje explicativo de la restricción del dado.
     *
     * @param string $caraActual Cara actual del dado.
     * @param int $playerId ID del jugador actual.
     * @param int $jugadorQueLanzo ID del jugador que lanzó el dado.
     * @return string Mensaje explicativo de la restricción.
     */
    public function obtenerMensajeRestriccion(
        string $caraActual,
        int $playerId,
        int $jugadorQueLanzo
    ): string {
        if ($playerId === $jugadorQueLanzo) {
            return 'Lanzaste el dado - puedes colocar en cualquier recinto';
        }

        $cara = $this->carasDado[$caraActual] ?? null;

        if (!$cara) {
            return 'Restricción desconocida';
        }

        return "{$cara['name']}: {$cara['description']}";
    }
}

// Compatibilidad: wrapper con nombres en inglés para no romper el sistema existente
class ActiveRestrictions extends RestriccionesActivas {
    public function __construct() {
        parent::__construct();
    }

    public function defineAreaMapping(): array { return $this->definirMapeoAreas(); }
    public function defineSideMapping(): array { return $this->definirMapeoLados(); }
    public function defineDiceFaces(): array { return $this->definirCarasDado(); }

    public function filterZonesByDice(string $currentFace, array $boardState, int $playerWhoRolled): array {
        return $this->filtrarZonasPorDado($currentFace, $boardState, $playerWhoRolled);
    }

    public function filterDynamicZones(string $currentFace, array $boardState): array {
        return $this->filtrarZonasDinamicas($currentFace, $boardState);
    }

    public function filterEmptyZones(array $zones, array $boardState): array {
        return $this->filtrarZonasVacias($zones, $boardState);
    }

    public function getAllZones(): array { return $this->obtenerTodasZonas(); }

    public function isZoneAllowed(string $zoneId, string $currentFace, array $boardState, int $playerWhoRolled): bool {
        return $this->zonaPermitida($zoneId, $currentFace, $boardState, $playerWhoRolled);
    }

    public function getRestrictionInfo(string $currentFace): ?array { return $this->obtenerInfoRestriccion($currentFace); }

    public function getRestrictionMessage(string $currentFace, int $playerId, int $playerWhoRolled): string {
        return $this->obtenerMensajeRestriccion($currentFace, $playerId, $playerWhoRolled);
    }
}

?>
