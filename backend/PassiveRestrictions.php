<?php

class RestriccionesPasivas {
    private $reglasZonas;

    public function __construct() {
        $this->reglasZonas = $this->definirReglasZonas();
    }

    /**
     * Define las reglas pasivas de cada recinto (claves en español).
     */
    protected function definirReglasZonas(): array {
        return [
            'bosque-semejanza' => [
                'capacidad' => 6,
                'tipoEspecie' => 'mismaEspecie',
                'ordenamiento' => 'secuencial',
                'descripcion' => 'Todos los dinosaurios deben ser del mismo tipo, colocados de izquierda a derecha'
            ],
            'prado-diferencia' => [
                'capacidad' => 6,
                'tipoEspecie' => 'especiesDiferentes',
                'ordenamiento' => 'secuencial',
                'descripcion' => 'Todas las especies deben ser diferentes, colocados de izquierda a derecha'
            ],
            'pradera-amor' => [
                'capacidad' => 6,
                'tipoEspecie' => 'cualquiera',
                'ordenamiento' => 'libre',
                'descripcion' => 'Cualquier especie, cualquier slot vacío'
            ],
            'trio-frondoso' => [
                'capacidad' => 3,
                'tipoEspecie' => 'cualquiera',
                'ordenamiento' => 'libre',
                'descripcion' => 'Máximo 3 dinosaurios, cualquier especie'
            ],
            'rey-selva' => [
                'capacidad' => 1,
                'tipoEspecie' => 'cualquiera',
                'ordenamiento' => 'libre',
                'descripcion' => 'Solo un dinosaurio'
            ],
            'isla-solitaria' => [
                'capacidad' => 1,
                'tipoEspecie' => 'cualquiera',
                'ordenamiento' => 'libre',
                'descripcion' => 'Solo un dinosaurio'
            ],
            'dinos-rio' => [
                'capacidad' => 7,
                'tipoEspecie' => 'cualquiera',
                'ordenamiento' => 'secuencial',
                'descripcion' => 'Comodín - siempre disponible'
            ]
        ];
    }

    /**
     * Valida si se puede colocar un dinosaurio en un recinto.
     * Devuelve ['valid' => bool, 'reason' => string]
     */
    public function validarColocacion(
        string $zoneId,
        array $dinosaursInZone,
        object $dinosaur,
        int $slot
    ): array {
        $rules = $this->reglasZonas[$zoneId] ?? null;

        if (!$rules) {
            return ['valid' => false, 'reason' => 'Zona no reconocida'];
        }

        // Validar capacidad
        $capacidad = $this->validarCapacidad($dinosaursInZone, $rules['capacidad']);
        if (!$capacidad['valid']) {
            return $capacidad;
        }

        // Validar especie
        $especie = $this->validarEspecie(
            $dinosaursInZone,
            $dinosaur,
            $rules['tipoEspecie']
        );
        if (!$especie['valid']) {
            return $especie;
        }

        // Validar ordenamiento
        $orden = $this->validarOrdenamiento(
            $dinosaursInZone,
            $slot,
            $rules['ordenamiento']
        );
        if (!$orden['valid']) {
            return $orden;
        }

        return ['valid' => true, 'reason' => 'Colocación válida'];
    }

    protected function validarCapacidad(array $dinosaursInZone, int $maxCapacidad): array {
        if (count($dinosaursInZone) >= $maxCapacidad) {
            return ['valid' => false, 'reason' => 'Recinto lleno'];
        }
        return ['valid' => true];
    }

    protected function validarEspecie(array $dinosaursInZone, object $dinosaur, string $tipoEspecie): array {
        switch ($tipoEspecie) {
            case 'mismaEspecie':
                return $this->validarMismaEspecie($dinosaursInZone, $dinosaur);
            case 'especiesDiferentes':
                return $this->validarEspeciesDiferentes($dinosaursInZone, $dinosaur);
            case 'cualquiera':
                return ['valid' => true];
            default:
                return ['valid' => false, 'reason' => 'Tipo de especie no reconocido'];
        }
    }

    protected function validarMismaEspecie(array $dinosaursInZone, object $dinosaur): array {
        if (empty($dinosaursInZone)) {
            return ['valid' => true];
        }

        $existingSpecies = $dinosaursInZone[0]->type;
        if ($dinosaur->type !== $existingSpecies) {
            return [
                'valid' => false,
                'reason' => "Solo dinosaurios {$existingSpecies} permitidos en este recinto"
            ];
        }

        return ['valid' => true];
    }

    protected function validarEspeciesDiferentes(array $dinosaursInZone, object $dinosaur): array {
        $existingSpecies = array_map(function($d) { return $d->type; }, $dinosaursInZone);

        if (in_array($dinosaur->type, $existingSpecies)) {
            return [
                'valid' => false,
                'reason' => 'Solo especies diferentes permitidas en este recinto'
            ];
        }

        return ['valid' => true];
    }

    protected function validarOrdenamiento(array $dinosaursInZone, int $slot, string $ordenamiento): array {
        switch ($ordenamiento) {
            case 'secuencial':
                return $this->validarOrdenSecuencial($dinosaursInZone, $slot);
            case 'libre':
                return ['valid' => true];
            default:
                return ['valid' => false, 'reason' => 'Tipo de ordenamiento no reconocido'];
        }
    }

    protected function validarOrdenSecuencial(array $dinosaursInZone, int $slot): array {
        $expectedSlot = count($dinosaursInZone) + 1;

        if ($slot !== $expectedSlot) {
            return [
                'valid' => false,
                'reason' => "Debe colocar en el slot {$expectedSlot} (de izquierda a derecha)"
            ];
        }

        return ['valid' => true];
    }

    /**
     * Obtiene los slots válidos para un recinto (devuelve enteros).
     */
    public function obtenerSlotsValidos(string $zoneId, array $dinosaursInZone, object $dinosaur): array {
        $rules = $this->reglasZonas[$zoneId] ?? null;
        if (!$rules) return [];

        if (count($dinosaursInZone) >= $rules['capacidad']) return [];

        $especie = $this->validarEspecie($dinosaursInZone, $dinosaur, $rules['tipoEspecie']);
        if (!$especie['valid']) return [];

        if ($rules['ordenamiento'] === 'secuencial') {
            $nextSlot = count($dinosaursInZone) + 1;
            return [$nextSlot];
        } else {
            $occupiedSlots = array_map(function($d) {
                return isset($d->slot) ? (int)$d->slot : null;
            }, $dinosaursInZone);
            $occupiedSlots = array_filter($occupiedSlots, fn($slot) => $slot !== null);

            $validSlots = [];
            for ($i = 1; $i <= $rules['capacidad']; $i++) {
                if (!in_array($i, $occupiedSlots)) {
                    $validSlots[] = $i;
                }
            }
            return $validSlots;
        }
    }

    /**
     * Obtiene información de un recinto (claves en español).
     */
    public function obtenerInfoZona(string $zoneId): ?array {
        return $this->reglasZonas[$zoneId] ?? null;
    }
}

// Wrapper para mantener compatibilidad con el API existente en inglés
class PassiveRestrictions extends RestriccionesPasivas {
    public function __construct() {
        parent::__construct();
    }

    public function validatePlacement(string $zoneId, array $dinosaursInZone, object $dinosaur, int $slot): array {
        return $this->validarColocacion($zoneId, $dinosaursInZone, $dinosaur, $slot);
    }

    public function getValidSlots(string $zoneId, array $dinosaursInZone, object $dinosaur): array {
        return $this->obtenerSlotsValidos($zoneId, $dinosaursInZone, $dinosaur);
    }

    // Devuelve la info de la zona con claves en inglés para compatibilidad
    public function getZoneInfo(string $zoneId): ?array {
        $info = $this->obtenerInfoZona($zoneId);
        if (!$info) return null;

        return [
            'capacity' => $info['capacidad'],
            'speciesType' => $this->mapearTipoEspecieAEtiquetaIngles($info['tipoEspecie']),
            'ordering' => $this->mapearOrdenamientoAEtiquetaIngles($info['ordenamiento']),
            'description' => $info['descripcion']
        ];
    }

    private function mapearTipoEspecieAEtiquetaIngles(string $tipo): string {
        return match ($tipo) {
            'mismaEspecie' => 'sameSpecies',
            'especiesDiferentes' => 'differentSpecies',
            'cualquiera' => 'any',
            default => 'any'
        };
    }

    private function mapearOrdenamientoAEtiquetaIngles(string $orden): string {
        return match ($orden) {
            'secuencial' => 'sequential',
            'libre' => 'free',
            default => 'free'
        };
    }
}

?>
