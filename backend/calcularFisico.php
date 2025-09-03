<?php

/*
 * Clase CalculadorPuntuacionLocal:
 * Implementa la lógica de cálculo de puntuaciones usada por la página física.
 * Este archivo contiene únicamente la clase y sus métodos; el procesamiento de
 * solicitudes y la interfaz de usuario quedan en fisico.php.
 */

class CalculadorPuntuacionLocal {
    private $sistemasPuntuacion;

    public function __construct() {
        $this->sistemasPuntuacion = [
            'bosque-semejanza' => [ 'calculate' => fn($dinosaurios) => $this->calcularSimilitudBosque($dinosaurios), 'description' => 'Puntos por dinosaurios del mismo tipo' ],
            'trio-frondoso'   => [ 'calculate' => fn($dinosaurios) => $this->calcularTrioFrondoso($dinosaurios), 'description' => '7 puntos si tiene exactamente 3 dinosaurios' ],
            'prado-diferencia'=> [ 'calculate' => fn($dinosaurios) => $this->calcularDiferenciaPrado($dinosaurios), 'description' => 'Puntos por variedad de tipos' ],
            'pradera-amor'    => [ 'calculate' => fn($dinosaurios) => $this->calcularPraderaAmor($dinosaurios), 'description' => 'Puntos por parejas completas' ],
            'isla-solitaria'  => [ 'calculate' => fn($dinosaurios, $playerBoard = null) => $this->calcularIslaSolitaria($dinosaurios, $playerBoard), 'description' => '7 puntos por el dinosaurio solitario' ],
            'rey-selva'       => [ 'calculate' => fn($dinosaurios, $allBoards = null, $playerId = null) => $this->calcularReySelva($dinosaurios, $allBoards, $playerId), 'description' => 'Puntos por el dinosaurio más grande' ],
            'dinos-rio'       => [ 'calculate' => fn($dinosaurios) => $this->calcularDinosauriosRio($dinosaurios), 'description' => 'Puntos por secuencia en el río' ],
        ];
    }

    public function generarInformePuntuacion(object $fullBoard, int $playerId, array $allPlayerBoards): array {
        // Construir tablero del jugador con solo los dinosaurios del playerId
        $playerBoard = new stdClass();
        foreach ($fullBoard as $zoneId => $dinosInZone) {
            $filtered = [];
            foreach ($dinosInZone as $d) {
                // Aceptar objetos o arrays (normalizar)
                if (is_array($d)) $d = (object)$d;
                if (!isset($d->playerPlaced) || (int)$d->playerPlaced === $playerId) {
                    $filtered[] = $d;
                }
            }
            $playerBoard->{$zoneId} = $filtered;
        }

        $baseScoreResult = $this->calcularPuntuacionJugador($playerBoard, $playerId, $allPlayerBoards);
        $bonusesResult = $this->calcularBonificaciones($playerBoard, $playerId);

        return [
            'player' => $playerId,
            'baseScore' => $baseScoreResult['total'],
            'baseDetails' => $baseScoreResult['details'],
            'bonuses' => $bonusesResult['total'],
            'bonusDetails' => $bonusesResult['details'],
            'totalScore' => $baseScoreResult['total'] + $bonusesResult['total'],
            'completedZones' => $this->contarZonasCompletadas($playerBoard, $playerId),
            'diversity' => $this->calcularDiversidad($playerBoard, $playerId)
        ];
    }

    public function calcularPuntuacionJugador(object $playerBoard, int $playerId, array $allPlayerBoards): array {
        $totalScore = 0;
        $zoneDetails = [];

        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if (!empty($dinosaurios)) {
                $score = 0;
                $system = $this->sistemasPuntuacion[$zoneId] ?? null;

                if ($system) {
                    if ($zoneId === 'rey-selva') {
                        $score = $this->calcularReySelva($dinosaurios, $allPlayerBoards, $playerId);
                    } elseif ($zoneId === 'isla-solitaria') {
                        $score = $this->calcularIslaSolitaria($dinosaurios, $playerBoard);
                    } else {
                        $score = $system['calculate']($dinosaurios);
                    }
                }

                $totalScore += $score;
                $zoneDetails[$zoneId] = [
                    'points' => $score,
                    'dinosaurCount' => count($dinosaurios),
                    'description' => $this->obtenerDescripcionZona($zoneId)
                ];
            }
        }

        return [ 'total' => $totalScore, 'details' => $zoneDetails ];
    }

    private function calcularSimilitudBosque(array $dinosaurios): int {
        if (empty($dinosaurios)) return 0;
        $counts = [];
        foreach ($dinosaurios as $dino) {
            if (is_array($dino)) $dino = (object)$dino;
            $t = $dino->type ?? $dino->tipo ?? null;
            if (!$t) continue;
            $counts[$t] = ($counts[$t] ?? 0) + 1;
        }
        $maxCount = $counts ? max(array_values($counts)) : 0;
        $scoreTable = [0,1,3,6,10,15,21];
        $idx = min($maxCount, count($scoreTable)-1);
        return $scoreTable[$idx] ?? 0;
    }

    private function calcularTrioFrondoso(array $dinosaurios): int {
        return count($dinosaurios) === 3 ? 7 : 0;
    }

    private function calcularDiferenciaPrado(array $dinosaurios): int {
        $unique = [];
        foreach ($dinosaurios as $dino) {
            if (is_array($dino)) $dino = (object)$dino;
            $t = $dino->type ?? $dino->tipo ?? null;
            if ($t) $unique[$t] = true;
        }
        $typeCount = count($unique);
        $scoreTable = [0,1,3,6,10,15,21];
        $idx = min($typeCount, count($scoreTable)-1);
        return $scoreTable[$idx] ?? 0;
    }

    private function calcularPraderaAmor(array $dinosaurios): int {
        $counts = [];
        foreach ($dinosaurios as $dino) {
            if (is_array($dino)) $dino = (object)$dino;
            $t = $dino->type ?? $dino->tipo ?? null;
            if (!$t) continue;
            $counts[$t] = ($counts[$t] ?? 0) + 1;
        }
        $pairs = 0;
        foreach ($counts as $c) $pairs += floor($c / 2);
        return $pairs * 5;
    }

    private function calcularReySelva(array $dinosaurios, array $allPlayerBoards, int $playerId): int {
        if (count($dinosaurios) !== 1) return 0;
        $myDinosaur = $dinosaurios[0];
        if (is_array($myDinosaur)) $myDinosaur = (object)$myDinosaur;
        $type = $myDinosaur->type ?? $myDinosaur->tipo ?? null;
        if (!$type) return 0;

        $myTotal = $this->contarEspecieEnParque($allPlayerBoards[$playerId] ?? [], $type);
        foreach ($allPlayerBoards as $otherId => $board) {
            if ((string)$otherId === (string)$playerId) continue;
            $otherCount = $this->contarEspecieEnParque($board, $type);
            if ($otherCount > $myTotal) return 0;
        }
        return 7;
    }

    private function calcularIslaSolitaria(array $dinosaurios, $playerBoard): int {
        if (count($dinosaurios) !== 1) return 0;
        $d = $dinosaurios[0]; if (is_array($d)) $d = (object)$d;
        $type = $d->type ?? $d->tipo ?? null;
        if (!$type) return 0;

        $total = 0;
        foreach ($playerBoard as $zone) {
            foreach ($zone as $din) {
                if (is_array($din)) $din = (object)$din;
                if (($din->type ?? $din->tipo ?? null) === $type) $total++;
            }
        }
        return $total === 1 ? 7 : 0;
    }

    private function calcularDinosauriosRio(array $dinosaurios): int {
        $count = count($dinosaurios);
        $scoreTable = [0,1,3,6,10,15,21,28];
        $idx = min($count, count($scoreTable)-1);
        return $scoreTable[$idx] ?? 0;
    }

    private function calcularBonificaciones(object $playerBoard, int $playerId): array {
        $totalBonuses = 0;
        $details = [];
        $completed = $this->contarZonasCompletadas($playerBoard, $playerId);
        if ($completed >= 5) { $totalBonuses += 10; $details['completedZones'] = 10; }
        $div = $this->calcularDiversidad($playerBoard, $playerId);
        if ($div >= 6) { $totalBonuses += 8; $details['diversity'] = 8; }
        return ['total' => $totalBonuses, 'details' => $details];
    }

    private function contarZonasCompletadas(object $playerBoard, int $playerId): int {
        $count = 0;
        foreach ($playerBoard as $zoneId => $dinosaurios) {
            if ($this->esZonaCompletada($zoneId, $dinosaurios)) $count++;
        }
        return $count;
    }

    private function esZonaCompletada(string $zoneId, array $dinosaurios): bool {
        $rules = [
            'bosque-semejanza' => fn($d) => count($d) >= 3,
            'trio-frondoso' => fn($d) => count($d) === 3,
            'prado-diferencia' => fn($d) => count(array_unique(array_map(fn($x) => ($x->type ?? $x->tipo ?? null), $d))) >= 3,
            'pradera-amor' => fn($d) => $this->tieneParejasCompletas($d),
            'isla-solitaria' => fn($d) => count($d) === 1,
            'rey-selva' => fn($d) => count($d) === 1,
            'dinos-rio' => fn($d) => count($d) >= 4
        ];
        $rule = $rules[$zoneId] ?? null;
        return $rule ? (bool)$rule($dinosaurios) : false;
    }

    private function tieneParejasCompletas(array $dinosaurios): bool {
        $counts = [];
        foreach ($dinosaurios as $dino) { if (is_array($dino)) $dino = (object)$dino; $t = $dino->type ?? $dino->tipo ?? null; if ($t) $counts[$t] = ($counts[$t] ?? 0) + 1; }
        foreach ($counts as $c) if ($c >= 2) return true;
        return false;
    }

    private function calcularDiversidad(object $playerBoard, int $playerId): int {
        $unique = [];
        foreach ($playerBoard as $zone) {
            foreach ($zone as $dino) { if (is_array($dino)) $dino = (object)$dino; $t = $dino->type ?? $dino->tipo ?? null; if ($t) $unique[$t] = true; }
        }
        return count($unique);
    }

    private function contarEspecieEnParque($playerBoard, string $speciesType): int {
        $cnt = 0;
        foreach ($playerBoard as $zone) {
            foreach ($zone as $d) { if (is_array($d)) $d = (object)$d; if (($d->type ?? $d->tipo ?? null) === $speciesType) $cnt++; }
        }
        return $cnt;
    }

    private function obtenerDescripcionZona(string $zoneId): string {
        $descriptions = [
            'bosque-semejanza' => 'Puntos por dinosaurios de la misma especie',
            'trio-frondoso' => '7 puntos si tiene exactamente 3 dinosaurios',
            'prado-diferencia' => 'Puntos por variedad de especies',
            'pradera-amor' => '5 puntos por cada pareja completa',
            'isla-solitaria' => '7 puntos si es único de su especie en el parque',
            'rey-selva' => '7 puntos si ningún rival tiene más de esa especie',
            'dinos-rio' => 'Puntos por dinosaurios en secuencia'
        ];
        return $descriptions[$zoneId] ?? 'Puntuación especial';
    }
}
