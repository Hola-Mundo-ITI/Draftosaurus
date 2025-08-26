<?php
/*
 * Script obtenerMovimientoBot.php:
 * Endpoint que calcula y devuelve un movimiento sugerido para un bot.
 * - Recibe POST con playerId, gameState y availableDinosaurs.
 * - Usa SistemaBots para decidir un movimiento válido y normaliza la respuesta.
 * Devuelve JSON con 'exito' y el movimiento normalizado en 'movimiento' (o null).
 */
header('Content-Type: application/json');

require_once 'SistemaBots.php';

$respuesta = [
    'exito' => false,
    'mensaje' => 'Solicitud no válida',
    'movimiento' => null
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $datos = json_decode($input);

    if ($datos === null && json_last_error() !== JSON_ERROR_NONE) {
        $respuesta['mensaje'] = 'JSON de entrada no válido.';
    } else {
        $sistemaBots = new SistemaBots();

        $jugadorId = $datos->playerId ?? null;
        $estadoJuego = $datos->gameState ?? null; // Objeto con el estado completo del juego
        $dinosauriosDisponibles = $datos->availableDinosaurs ?? []; // Array de objetos de dinosaurios disponibles

        if ($jugadorId !== null && $estadoJuego) {

            $estadoJuego->availableDinosaurs = $dinosauriosDisponibles;

            $movimientoBot = $sistemaBots->decidirMovimientoBot($jugadorId, $estadoJuego);

            if ($movimientoBot) {

                $dino = $movimientoBot['dinosaur'];

                $dinosaurObj = (object)[
                    'id' => $dino->id ?? ($dino->ID ?? null),
                    'type' => $dino->type ?? $dino->tipo ?? null,
                    'image' => $dino->image ?? $dino->imagen ?? null
                ];

                $normalizedMove = [
                    'dinosaur' => $dinosaurObj,
                    'zoneId' => $movimientoBot['zoneId'] ?? $movimientoBot['zona'] ?? null,
                    'slot' => $movimientoBot['slot'] ?? $movimientoBot['slotId'] ?? $movimientoBot['casillero'] ?? null
                ];

                $respuesta = [
                    'exito' => true,
                    'mensaje' => 'Movimiento del bot calculado exitosamente.',
                    'movimiento' => $normalizedMove,

                    'success' => true,
                    'message' => 'Bot move calculated successfully.',
                    'move' => $normalizedMove
                ];

                error_log("[obtenerMovimientoBot] Bot {$jugadorId} mov: " . json_encode($normalizedMove));
            } else {
                $respuesta['mensaje'] = 'El bot no pudo encontrar un movimiento válido.';
                $respuesta['message'] = 'Bot could not find a valid move.';
            }
        } else {
            $respuesta['mensaje'] = 'Faltan datos esenciales para el turno del bot.';
            $respuesta['message'] = 'Missing required data for bot turn.';
        }
    }
}

echo json_encode($respuesta);
