<?php

class ScoreCalculator {
    private $scoringSystems;

    public function __construct() {
        $this->scoringSystems = $this->defineScoringSystems();
    }

    /**
     * Define los sistemas de puntuación para cada zona.
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

    /**
     * Calcula la puntuación total de un jugador.
     *
     * @param object $playerBoard Objeto del tablero del jugador, con zonas y dinosaurios.
     * @param int $playerId ID del jugador.
     * @param array $allPlayerBoards Array de todos los tableros de los jugadores (para Rey de la Selva).
     * @return array Reporte de puntuación.
     */
    public function calculatePlayerScore(object $playerBoard, int $playerId, array $allPlayerBoards): array {
        $totalScore = 0;
        $zoneDetails = [];

        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if (!empty($dinosaurios)) {
                $score = 0;
                $system = $this->scoringSystems[$zoneId] ?? null;

                if ($system) {
                    // Cálculos especiales para Rey de la Selva e Isla Solitaria
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

    /**
     * Genera un reporte detallado de puntuación, incluyendo bonificaciones.
     *
     * @param object $fullBoard Objeto del tablero completo del juego.
     * @param int $playerId ID del jugador.
     * @param array $allPlayerBoards Array de todos los tableros de los jugadores (para Rey de la Selva).
     * @return array Reporte completo de puntuación.
     */
    public function generateScoreReport(object $fullBoard, int $playerId, array $allPlayerBoards): array {
        // Extraer el tablero del jugador específico del tablero completo
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

    // --- Métodos de cálculo de puntuación por zona ---

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

    private function calculateThreesomeGrove(array $dinosaurios): int {
        return count($dinosaurios) === 3 ? 7 : 0;
    }

    private function calculateMeadowDifference(array $dinosaurios): int {
        $uniqueTypes = [];
        foreach ($dinosaurios as $dino) {
            $uniqueTypes[$dino->type] = true;
        }
        $typeCount = count($uniqueTypes);
        $scoreTable = [0, 1, 3, 6, 10, 15, 21];
        return $scoreTable[min($typeCount, count($scoreTable) - 1)] ?? 0;
    }

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

    private function calculateRiverDinos(array $dinosaurios): int {
        $count = count($dinosaurios);
        $scoreTable = [0, 1, 3, 6, 10, 15, 21, 28];
        return $scoreTable[min($count, count($scoreTable) - 1)] ?? 0;
    }

    // --- Métodos de bonificación ---

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

    private function countCompletedZones(object $playerBoard, int $playerId): int {
        $completedZonesCount = 0;
        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if ($this->isZoneCompleted($zoneId, $dinosaurios)) {
                $completedZonesCount++;
            }
        }
        return $completedZonesCount;
    }

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

    private function calculateDiversity(object $playerBoard, int $playerId): int {
        $uniqueTypes = [];
        foreach ($playerBoard as $dinosaurios) {
            foreach ($dinosaurios as $dino) {
                $uniqueTypes[$dino->type] = true;
            }
        }
        return count($uniqueTypes);
    }

    // --- Métodos auxiliares ---

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

    /**
     * Manejador HTTP estático para exponer la lógica de cálculo desde un endpoint.
     * Se deja aquí para centralizar lógica y permitir que otros wrappers simplemente incluyan este archivo y llamen a:
     * ScoreCalculator::handleHttpRequest();
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
