<?php

/*
 * Clase RestriccionesActivas:
 * Gestiona las restricciones temporales que impone el dado durante una ronda.
 * Proporciona mapeos de áreas/lados, definición de caras del dado y utilidades
 * para calcular qué recintos están permitidos según la cara activa y el estado
 * del tablero.
 */
class RestriccionesActivas {
    private $mapeoAreas;
    private $mapeoLados;
    private $carasDado;
    private $todasZonas;

    /*
     * Inicializa los mapeos y las caras del dado al crear la instancia.
     */
    public function __construct() {
        $this->mapeoAreas = $this->definirMapeoAreas();
        $this->mapeoLados = $this->definirMapeoLados();
        $this->carasDado = $this->definirCarasDado();
        $this->todasZonas = $this->obtenerTodasZonas();
    }

    
    /*
     * Devuelve el mapeo de áreas a recintos que define qué recintos
     * pertenecen a cada área temática del tablero.
     */
    protected function definirMapeoAreas(): array {
        return [
            'bosque' => ['bosque-semejanza', 'rey-selva', 'trio-frondoso'],
            'llanura' => ['prado-diferencia', 'pradera-amor', 'isla-solitaria']
        ];
    }

    
    /*
     * Devuelve el mapeo de lados del río a recintos. Útil para caras del dado
     * que limitan por izquierda/derecha del río.
     */
    protected function definirMapeoLados(): array {
        return [
            'izquierda' => ['bosque-semejanza', 'trio-frondoso', 'pradera-amor'],
            'derecha' => ['rey-selva', 'prado-diferencia', 'isla-solitaria']
        ];
    }

    
    /*
     * Define las caras del dado con su metadato (nombre, tipo, zonas y descripción).
     * Estas definiciones se usan para aplicar el filtrado de zonas permitido.
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

    
    /*
     * Dado el nombre de la cara activa y el estado del tablero, devuelve la
     * lista de zonas permitidas por esa cara. Si la cara no se reconoce, devuelve
     * todas las zonas por defecto.
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

    
    /*
     * Maneja las caras del dado que requieren cálculo dinámico (p. ej. recintos
     * vacíos) y delega a funciones específicas según la cara.
     */
    protected function filtrarZonasDinamicas(string $caraActual, array $estadoTablero): array {
        switch ($caraActual) {
            case 'recintoVacio':
                return $this->filtrarZonasVacias($this->obtenerTodasZonas(), $estadoTablero);

            default:
                return $this->obtenerTodasZonas();
        }
    }

    
    /*
     * Devuelve solo las zonas que actualmente están vacías según el estado del tablero.
     */
    protected function filtrarZonasVacias(array $zonas, array $estadoTablero): array {
        return array_filter($zonas, function($zona) use ($estadoTablero) {
            $dinosauriosEnZona = $estadoTablero[$zona] ?? [];
            return empty($dinosauriosEnZona);
        });
    }

    
    /*
     * Lista todas las zonas conocidas por el sistema. Se usa como valor por defecto
     * cuando no hay restricciones aplicables o la cara del dado no se reconoce.
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

    
    /*
     * Indica si una zona concreta está permitida según la cara actual del dado.
     * La zona 'dinos-rio' siempre se considera permitida (comodín).
     */
    public function zonaPermitida(
        string $zoneId,
        string $caraActual,
        array $estadoTablero,
        int $jugadorQueLanzo
    ): bool {

        if ($zoneId === 'dinos-rio') {
            return true;
        }

        $zonasPermitidas = $this->filtrarZonasPorDado($caraActual, $estadoTablero, $jugadorQueLanzo);
        return in_array($zoneId, $zonasPermitidas);
    }

    
    /*
     * Devuelve los metadatos de la restricción asociada a una cara del dado,
     * o null si la cara no existe.
     */
    public function obtenerInfoRestriccion(string $caraActual): ?array {
        return $this->carasDado[$caraActual] ?? null;
    }

    
    /*
     * Construye un mensaje legible para el jugador explicando la restricción
     * vigente según la cara del dado. Si el jugador lanzó el dado, indica
     * que puede colocar libremente.
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

/*
 * Clase ActiveRestrictions:
 * Expone métodos equivalentes en inglés que delegan en la implementación
 * en español, facilitando compatibilidad con consumidores que usan nombres
 * en inglés.
 */
class ActiveRestrictions extends RestriccionesActivas {
    /*
     * Simple inicializador que reusa el constructor de la clase base.
     */
    public function __construct() {
        parent::__construct();
    }

    /* Devuelve el mapeo de áreas. */
    public function defineAreaMapping(): array { return $this->definirMapeoAreas(); }
    /* Devuelve el mapeo de lados. */
    public function defineSideMapping(): array { return $this->definirMapeoLados(); }
    /* Devuelve la definición de caras del dado. */
    public function defineDiceFaces(): array { return $this->definirCarasDado(); }

    /* Delegación para obtener zonas permitidas según la cara. */
    public function filterZonesByDice(string $currentFace, array $boardState, int $playerWhoRolled): array {
        return $this->filtrarZonasPorDado($currentFace, $boardState, $playerWhoRolled);
    }

    /* Delegación para zonas dinámicas. */
    public function filterDynamicZones(string $currentFace, array $boardState): array {
        return $this->filtrarZonasDinamicas($currentFace, $boardState);
    }

    /* Delegación para filtrar zonas vacías. */
    public function filterEmptyZones(array $zones, array $boardState): array {
        return $this->filtrarZonasVacias($zones, $boardState);
    }

    /* Devuelve todas las zonas (adaptador en inglés). */
    public function getAllZones(): array { return $this->obtenerTodasZonas(); }

    /* Verifica si una zona está permitida (adaptador en inglés). */
    public function isZoneAllowed(string $zoneId, string $currentFace, array $boardState, int $playerWhoRolled): bool {
        return $this->zonaPermitida($zoneId, $currentFace, $boardState, $playerWhoRolled);
    }

    /* Devuelve la información de la restricción actual. */
    public function getRestrictionInfo(string $currentFace): ?array { return $this->obtenerInfoRestriccion($currentFace); }

    /* Devuelve el mensaje de restricción en inglés delegando en la implementación base. */
    public function getRestrictionMessage(string $currentFace, int $playerId, int $playerWhoRolled): string {
        return $this->obtenerMensajeRestriccion($currentFace, $playerId, $playerWhoRolled);
    }
}

?>
