<?php

/*
 * Clase ScoreCalculator:
 * Encapsula la lógica de cálculo de puntuaciones por jugador y zona.
 * Proporciona funciones para generar informes de puntuación y aplicar
 * reglas específicas por recinto sin alterar la lógica de cálculo.
 */
class ScoreCalculator {
    private $scoringSystems;

    /*
     * Inicializa los sistemas de puntuación mapeando cada zona a su función
     * de cálculo y descripción.
     */
    public function __construct() {
        $this->scoringSystems = $this->defineScoringSystems();
    }

    /*
     * Define las funciones de puntuación para cada zona. Cada entrada contiene
     * una función 'calculate' y una descripción breve.
     */
    private function defineScoringSystems(): array {
        return [
            'bosque-semejanza' => [
                'calculate' => fn($dinosaurios) => $this->calculateForestSimilarity($dinosaurios),
                'description' => 'Puntos por dinosaurios del mismo tipo'
            ],
            'trio-frondoso' => [
                'calculate' => fn($dinosaurios) => $this->calculateThreesomeGrove($dinosaurios),
                'description' => '7 puntos si tiene exactamente 3 dinosaurios'
            ],
            'prado-diferencia' => [
                'calculate' => fn($dinosaurios) => $this->calculateMeadowDifference($dinosaurios),
                'description' => 'Puntos por variedad de tipos'
            ],
            'pradera-amor' => [
                'calculate' => fn($dinosaurios) => $this->calculateLovePrairie($dinosaurios),
                'description' => 'Puntos por parejas completas'
            ],
            'isla-solitaria' => [
                'calculate' => fn($dinosaurios, $playerBoard) => $this->calculateLonelyIsland($dinosaurios, $playerBoard),
                'description' => '7 puntos por el dinosaurio solitario'
            ],
            'rey-selva' => [
                'calculate' => fn($dinosaurios, $allBoards, $playerId) => $this->calculateJungleKing($dinosaurios, $allBoards, $playerId),
                'description' => 'Puntos por el dinosaurio más grande'
            ],
            'dinos-rio' => [
                'calculate' => fn($dinosaurios) => $this->calculateRiverDinos($dinosaurios),
                'description' => 'Puntos por secuencia en el río'
            ],
        ];
    }

    /*
     * Calcula la puntuación base de un jugador recorriendo sus recintos y
     * aplicando el sistema de puntuación correspondiente a cada zona.
     */
    public function calculatePlayerScore(object $playerBoard, int $playerId, array $allPlayerBoards): array {
        $totalScore = 0;
        $zoneDetails = [];

        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if (!empty($dinosaurios)) {
                $score = 0;
                $system = $this->scoringSystems[$zoneId] ?? null;

                if ($system) {

                    if ($zoneId === 'rey-selva') {
                        $score = $this->calculateJungleKing($dinosaurios, $allPlayerBoards, $playerId);
                    } else if ($zoneId === 'isla-solitaria') {
                        $score = $this->calculateLonelyIsland($dinosaurios, $playerBoard);
                    } else {
                        $score = $system['calculate']($dinosaurios);
                    }
                }

                $totalScore += $score;
                $zoneDetails[$zoneId] = [
                    'points' => $score,
                    'dinosaurCount' => count($dinosaurios),
                    'description' => $this->getZoneDescription($zoneId)
                ];
            }
        }

        return [
            'total' => $totalScore,
            'details' => $zoneDetails
        ];
    }

    /*
     * Genera un informe de puntuación completo para un jugador, incluyendo
     * bono por objetivos y detalles por zona.
     */
    public function generateScoreReport(object $fullBoard, int $playerId, array $allPlayerBoards): array {

        $playerBoard = new stdClass();
        foreach ($fullBoard as $zoneId => $dinosInZone) {
            $playerBoard->{$zoneId} = array_filter($dinosInZone, fn($dino) => ($dino->playerPlaced ?? 0) === $playerId);
        }

        $baseScoreResult = $this->calculatePlayerScore($playerBoard, $playerId, $allPlayerBoards);
        $bonusesResult = $this->calculateBonuses($playerBoard, $playerId);

        return [
            'player' => $playerId,
            'baseScore' => $baseScoreResult['total'],
            'baseDetails' => $baseScoreResult['details'],
            'bonuses' => $bonusesResult['total'],
            'bonusDetails' => $bonusesResult['details'],
            'totalScore' => $baseScoreResult['total'] + $bonusesResult['total'],
            'completedZones' => $this->countCompletedZones($playerBoard, $playerId),
            'diversity' => $this->calculateDiversity($playerBoard, $playerId)
        ];
    }

    /*
     * Calcula puntos por similitud en el bosque: usa una tabla de puntuación
     * en función de la mayor cantidad de la misma especie.
     */
    private function calculateForestSimilarity(array $dinosaurios): int {
        if (empty($dinosaurios)) return 0;
        $counts = [];
        foreach ($dinosaurios as $dino) {
            $counts[$dino->type] = ($counts[$dino->type] ?? 0) + 1;
        }
        $maxCount = 0;
        if (!empty($counts)) {
            $maxCount = max(array_values($counts));
        }
        $scoreTable = [0, 1, 3, 6, 10, 15, 21];
        return $scoreTable[min($maxCount, count($scoreTable) - 1)] ?? 0;
    }

    /*
     * Retorna 7 puntos únicamente si hay exactamente 3 dinosaurios en el recinto.
     */
    private function calculateThreesomeGrove(array $dinosaurios): int {
        return count($dinosaurios) === 3 ? 7 : 0;
    }

    /*
     * Calcula puntos por variedad de especies en el prado.
     */
    private function calculateMeadowDifference(array $dinosaurios): int {
        $uniqueTypes = [];
        foreach ($dinosaurios as $dino) {
            $uniqueTypes[$dino->type] = true;
        }
        $typeCount = count($uniqueTypes);
        $scoreTable = [0, 1, 3, 6, 10, 15, 21];
        return $scoreTable[min($typeCount, count($scoreTable) - 1)] ?? 0;
    }

    /*
     * Calcula puntos en la pradera por parejas completas de la misma especie.
     */
    private function calculateLovePrairie(array $dinosaurios): int {
        $counts = [];
        foreach ($dinosaurios as $dino) {
            $counts[$dino->type] = ($counts[$dino->type] ?? 0) + 1;
        }
        $pairs = 0;
        foreach ($counts as $count) {
            $pairs += floor($count / 2);
        }
        return $pairs * 5;
    }

    /*
     * Calcula la bonificación de 'rey de la selva': comprueba que nadie tenga
     * más de la misma especie que el jugador actual.
     */
    private function calculateJungleKing(array $dinosaurios, array $allPlayerBoards, int $playerId): int {
        if (count($dinosaurios) !== 1) return 0;

        $myDinosaur = $dinosaurios[0];
        $myTotalCount = $this->countSpeciesInPark($allPlayerBoards[$playerId], $myDinosaur->type);

        foreach ($allPlayerBoards as $otherPlayerId => $otherPlayerBoard) {
            if ($otherPlayerId !== (string)$playerId) {
                $otherPlayerCount = $this->countSpeciesInPark($otherPlayerBoard, $myDinosaur->type);
                if ($otherPlayerCount > $myTotalCount) {
                    return 0; // Otro jugador tiene más de esta especie
                }
            }
        }
        return 7; // Nadie tiene más, recibe los puntos (incluye empates)
    }

    /*
     * 7 puntos si el dinosaurio es único de su especie en el parque del jugador.
     */
    private function calculateLonelyIsland(array $dinosaurios, object $playerBoard): int {
        if (count($dinosaurios) !== 1) return 0;

        $lonelyDinosaur = $dinosaurios[0];

        $totalSpeciesInPark = 0;
        foreach ($playerBoard as $zoneDinos) {
            foreach ($zoneDinos as $dino) {
                if ($dino->type === $lonelyDinosaur->type) {
                    $totalSpeciesInPark++;
                }
            }
        }

        return $totalSpeciesInPark === 1 ? 7 : 0;
    }

    /*
     * Puntuación para dinosaurios en el río usando tabla de valores por cantidad.
     */
    private function calculateRiverDinos(array $dinosaurios): int {
        $count = count($dinosaurios);
        $scoreTable = [0, 1, 3, 6, 10, 15, 21, 28];
        return $scoreTable[min($count, count($scoreTable) - 1)] ?? 0;
    }

    /*
     * Calcula bonos globales por completar zonas y por diversidad de especies.
     */
    private function calculateBonuses(object $playerBoard, int $playerId): array {
        $totalBonuses = 0;
        $bonusDetails = [];

        $completedZones = $this->countCompletedZones($playerBoard, $playerId);
        if ($completedZones >= 5) {
            $totalBonuses += 10;
            $bonusDetails['completedZones'] = 10;
        }

        $diversity = $this->calculateDiversity($playerBoard, $playerId);
        if ($diversity >= 6) {
            $totalBonuses += 8;
            $bonusDetails['diversity'] = 8;
        }

        return [
            'total' => $totalBonuses,
            'details' => $bonusDetails
        ];
    }

    /*
     * Cuenta cuántas zonas completadas tiene el jugador según reglas propias.
     */
    private function countCompletedZones(object $playerBoard, int $playerId): int {
        $completedZonesCount = 0;
        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if ($this->isZoneCompleted($zoneId, $dinosaurios)) {
                $completedZonesCount++;
            }
        }
        return $completedZonesCount;
    }

    /*
     * Verifica si una zona cumple su criterio de finalización.
     */
    private function isZoneCompleted(string $zoneId, array $dinosaurios): bool {
        $completionRules = [
            'bosque-semejanza' => fn($dinos) => count($dinos) >= 3,
            'trio-frondoso' => fn($dinos) => count($dinos) === 3,
            'prado-diferencia' => fn($dinos) => count(array_unique(array_map(fn($d) => $d->type, $dinos))) >= 3,
            'pradera-amor' => fn($dinos) => $this->hasCompletePairs($dinos),
            'isla-solitaria' => fn($dinos) => count($dinos) === 1,
            'rey-selva' => fn($dinos) => count($dinos) === 1,
            'dinos-rio' => fn($dinos) => count($dinos) >= 4
        ];

        $rule = $completionRules[$zoneId] ?? null;
        return $rule ? $rule($dinosaurios) : false;
    }

    /*
     * Indica si hay al menos una pareja completa dentro de los dinosaurios.
     */
    private function hasCompletePairs(array $dinosaurios): bool {
        $counts = [];
        foreach ($dinosaurios as $dino) {
            $counts[$dino->type] = ($counts[$dino->type] ?? 0) + 1;
        }
        foreach ($counts as $count) {
            if ($count >= 2) return true;
        }
        return false;
    }

    /*
     * Calcula la diversidad total de especies en el tablero del jugador.
     */
    private function calculateDiversity(object $playerBoard, int $playerId): int {
        $uniqueTypes = [];
        foreach ($playerBoard as $dinosaurios) {
            foreach ($dinosaurios as $dino) {
                $uniqueTypes[$dino->type] = true;
            }
        }
        return count($uniqueTypes);
    }

    /*
     * Cuenta cuántas veces aparece una especie en el parque del jugador.
     */
    private function countSpeciesInPark(object $playerBoard, string $speciesType): int {
        $count = 0;
        foreach ($playerBoard as $zoneDinos) {
            foreach ($zoneDinos as $dino) {
                if ($dino->type === $speciesType) {
                    $count++;
                }
            }
        }
        return $count;
    }

    /*
     * Obtiene una descripción legible de la zona para incluir en los detalles.
     */
    private function getZoneDescription(string $zoneId): string {
        $descriptions = [
            'bosque-semejanza' => 'Puntos por dinosaurios de la misma especie',
            'trio-frondoso' => '7 puntos si tiene exactamente 3 dinosaurios',
            'prado-diferencia' => 'Puntos por variedad de especies',
            'pradera-amor' => '5 puntos por cada pareja completa',
            'isla-solitaria' => '7 puntos si es único de su especie en el parque',
            'rey-selva' => '7 puntos si ningún rival tiene más de esa especie',
            'dinos-rio' => 'Puntos por dinosaurios en secuencia',
        ];
        return $descriptions[$zoneId] ?? 'Puntuación especial';
    }

    /*
     * Maneja solicitudes HTTP entrantes para calcular puntuaciones y devolver
     * un informe. Método estático utilizable por el endpoint PHP.
     */
    public static function handleHttpRequest(): void {
        header('Content-Type: application/json; charset=utf-8');

        $response = [
            'exito' => false,
            'mensaje' => 'Solicitud no válida',
            'scoreReport' => null,
        ];

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = file_get_contents('php://input');
            $datos = json_decode($input);

            if ($datos === null && json_last_error() !== JSON_ERROR_NONE) {
                $response['mensaje'] = 'JSON de entrada no válido.';
            } else {
                $calculadora = new self();

                $fullBoard = $datos->fullBoard ?? null;
                $playerId = $datos->playerId ?? null;
                $allPlayerBoards = $datos->allPlayerBoards ?? [];

                if ($fullBoard && $playerId !== null) {
                    $scoreReport = $calculadora->generateScoreReport($fullBoard, $playerId, $allPlayerBoards);

                    $response = [
                        'exito' => true,
                        'mensaje' => 'Puntuación calculada exitosamente.',
                        'scoreReport' => $scoreReport,
                    ];
                } else {
                    $response['mensaje'] = 'Faltan datos esenciales para calcular la puntuación.';
                }
            }
        }

        echo json_encode($response);
        exit;
    }
}

?>
