<?php

/*
 * Clase RestriccionesPasivas:
 * Define y aplica las reglas permanentes de cada zona del tablero (capacidad,
 * tipo de especie y ordenamiento). Se encarga de validar colocaciones y
 * calcular slots válidos según las reglas de cada recinto.
 */
class RestriccionesPasivas {
    private $reglasZonas;

    /*
     * Inicializa las reglas por zona al crear la instancia.
     */
    public function __construct() {
        $this->reglasZonas = $this->definirReglasZonas();
    }

    
    /*
     * Devuelve la definición estática de reglas para cada zona del tablero
     * (capacidad, tipo de especie aceptada, ordenamiento y descripción).
     */
    protected function definirReglasZonas(): array {
        return [
            'bosque-semejanza' => [
                'capacidad' => 6,
                'tipoEspecie' => 'mismaEspecie',
                'ordenamiento' => 'libre',
                'descripcion' => 'Todos los dinosaurios deben ser del mismo tipo'
            ],
            'prado-diferencia' => [
                'capacidad' => 6,
                'tipoEspecie' => 'especiesDiferentes',
                'ordenamiento' => 'libre',
                'descripcion' => 'Todas las especies deben ser diferentes'
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

    
    /*
     * Valida una colocación en una zona concreta comprobando capacidad,
     * tipo de especie y ordenamiento. Devuelve un array con el resultado y
     * una razón si no es válido.
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

        $capacidad = $this->validarCapacidad($dinosaursInZone, $rules['capacidad']);
        if (!$capacidad['valid']) {
            return $capacidad;
        }

        $especie = $this->validarEspecie(
            $dinosaursInZone,
            $dinosaur,
            $rules['tipoEspecie']
        );
        if (!$especie['valid']) {
            return $especie;
        }

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

    /*
     * Comprueba si hay espacio en la zona para añadir otro dinosaurio.
     */
    protected function validarCapacidad(array $dinosaursInZone, int $maxCapacidad): array {
        if (count($dinosaursInZone) >= $maxCapacidad) {
            return ['valid' => false, 'reason' => 'Recinto lleno'];
        }
        return ['valid' => true];
    }

    /*
     * Aplica la regla de tipo de especie de la zona. Puede delegar en
     * validaciones más concretas según el tipo (misma especie, diferentes, etc.).
     */
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

    /*
     * Valida que todos los dinosaurios en la zona sean de la misma especie
     * que el que se intenta colocar. Si la zona está vacía, se permite.
     */
    protected function validarMismaEspecie(array $dinosaursInZone, object $dinosaur): array {
        if (empty($dinosaursInZone)) {
            return ['valid' => true];
        }

        // Aceptar ambas formas de propiedad: type (backend) o tipo (compatibilidad)
        $existingSpecies = $dinosaursInZone[0]->type ?? ($dinosaursInZone[0]->tipo ?? null);
        $incomingSpecies = $dinosaur->type ?? ($dinosaur->tipo ?? null);

        if ($incomingSpecies === null || $existingSpecies === null) {
            return [
                'valid' => false,
                'reason' => 'No se pudo determinar la especie del dinosaurio (propiedades "type" o "tipo" faltantes)'
            ];
        }

        if ($incomingSpecies !== $existingSpecies) {
            return [
                'valid' => false,
                'reason' => "Especie incompatible: este recinto admite únicamente dinosaurios del tipo '{$existingSpecies}'"
            ];
        }

        return ['valid' => true];
    }

    /*
     * Valida que el dinosaurio a colocar tenga una especie distinta de las
     * ya presentes en la zona.
     */
    protected function validarEspeciesDiferentes(array $dinosaursInZone, object $dinosaur): array {
        $existingSpecies = array_map(function($d) {
            return $d->type ?? ($d->tipo ?? null);
        }, $dinosaursInZone);

        $incomingSpecies = $dinosaur->type ?? ($dinosaur->tipo ?? null);

        if ($incomingSpecies === null) {
            return [
                'valid' => false,
                'reason' => 'No se pudo determinar la especie entrante (propiedades "type" o "tipo" faltantes)'
            ];
        }

        if (in_array($incomingSpecies, $existingSpecies, true)) {
            return [
                'valid' => false,
                'reason' => "La especie '{$incomingSpecies}' ya está presente en este recinto; se requieren especies diferentes"
            ];
        }

        return ['valid' => true];
    }

    /*
     * Evalúa el criterio de ordenamiento (secuencial o libre) y delega a la
     * validación específica si hace falta.
     */
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

    /*
     * Valida la colocación secuencial: determina el slot esperado y compara
     * con el slot solicitado, devolviendo el siguiente slot cuando no coincide.
     */
    protected function validarOrdenSecuencial(array $dinosaursInZone, int $slot): array {
        $expectedSlot = $this->calcularSlotSiguienteSecuencial($dinosaursInZone);

        if ($slot !== $expectedSlot) {
            return [
                'valid' => false,
                'reason' => "Colocación secuencial requerida: debe usar el slot {$expectedSlot} (siguiente disponible sin huecos)"
            ];
        }

        return ['valid' => true];
    }

    /**
     * Calcula el siguiente slot secuencial esperado (sin huecos).
     * Devuelve 1 si la zona está vacía, o el primer hueco/slot siguiente.
     */
    protected function calcularSlotSiguienteSecuencial(array $dinosaursInZone): int {
        $occupiedSlots = array_map(function($d) {
            if (isset($d->slot)) return (int)$d->slot;
            if (isset($d->pos)) return (int)$d->pos;
            if (isset($d->position)) return (int)$d->position;
            return null;
        }, $dinosaursInZone);

        $occupiedSlots = array_filter($occupiedSlots, fn($s) => $s !== null);
        sort($occupiedSlots);

        $expectedSlot = 1;
        foreach ($occupiedSlots as $occupied) {
            if ($expectedSlot < $occupied) {
                // hay un hueco: el siguiente esperado es $expectedSlot
                break;
            }
            // si $expectedSlot == $occupied avanzamos al siguiente
            $expectedSlot = $occupied + 1;
        }

        return $expectedSlot;
    }

    
    /*
     * Calcula y devuelve los slots válidos para una zona según las reglas
     * (considera capacidad, especie y ordenamiento).
     */
    public function obtenerSlotsValidos(string $zoneId, array $dinosaursInZone, object $dinosaur): array {
        $rules = $this->reglasZonas[$zoneId] ?? null;
        if (!$rules) return [];

        if (count($dinosaursInZone) >= $rules['capacidad']) return [];

        $especie = $this->validarEspecie($dinosaursInZone, $dinosaur, $rules['tipoEspecie']);
        if (!$especie['valid']) return [];

        if ($rules['ordenamiento'] === 'secuencial') {
            $nextSlot = $this->calcularSlotSiguienteSecuencial($dinosaursInZone);
            // proteger por si excede capacidad
            if ($nextSlot > $rules['capacidad']) return [];
            return [$nextSlot];
        } else {
            $occupiedSlots = array_map(function($d) {
                return isset($d->slot) ? (int)$d->slot : null;
            }, $dinosaursInZone);
            $occupiedSlots = array_filter($occupiedSlots, fn($slot) => $slot !== null);

            $validSlots = [];
            for ($i = 1; $i <= $rules['capacidad']; $i++) {
                if (!in_array($i, $occupiedSlots, true)) {
                    $validSlots[] = $i;
                }
            }
            return $validSlots;
        }
    }

    
    /*
     * Recupera la información legible de una zona (capacidad, tipo, ordenamiento,
     * descripción) o null si la zona no existe.
     */
    public function obtenerInfoZona(string $zoneId): ?array {
        return $this->reglasZonas[$zoneId] ?? null;
    }
}

class PassiveRestrictions extends RestriccionesPasivas {
    /*
     * Adaptador en inglés: reutiliza la implementación en español.
     */
    public function __construct() {
        parent::__construct();
    }

    public function validatePlacement(string $zoneId, array $dinosaursInZone, object $dinosaur, int $slot): array {
        return $this->validarColocacion($zoneId, $dinosaursInZone, $dinosaur, $slot);
    }

    public function getValidSlots(string $zoneId, array $dinosaursInZone, object $dinosaur): array {
        return $this->obtenerSlotsValidos($zoneId, $dinosaursInZone, $dinosaur);
    }

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
