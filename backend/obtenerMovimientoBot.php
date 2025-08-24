<?php
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
            // Inyectar los dinosaurios disponibles en el estado de juego para que SistemaBots los use
            $estadoJuego->availableDinosaurs = $dinosauriosDisponibles;

            $movimientoBot = $sistemaBots->decidirMovimientoBot($jugadorId, $estadoJuego);

            if ($movimientoBot) {
                $respuesta = [
                    'exito' => true,
                    'mensaje' => 'Movimiento del bot calculado exitosamente.',
                    'movimiento' => $movimientoBot
                ];
            } else {
                $respuesta['mensaje'] = 'El bot no pudo encontrar un movimiento válido.';
            }
        } else {
            $respuesta['mensaje'] = 'Faltan datos esenciales para el turno del bot.';
        }
    }
}

echo json_encode($respuesta);
