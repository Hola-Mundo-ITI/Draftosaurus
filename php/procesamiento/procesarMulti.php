<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    exit;
}

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!$datos || !isset($datos['accion'])) {
    echo json_encode(['success' => false, 'error' => 'No se recibio accion']);
    exit;
}

$accion = $datos['accion'];

switch ($accion) {
    case 'inicializar':
        inicializarPartida($datos);
        break;
    
    case 'guardar_tablero':
        guardarTablero($datos);
        break;
    
    case 'cargar_tablero':
        cargarTablero($datos);
        break;
    
    case 'siguiente_turno':
        siguienteTurno($datos);
        break;
    
    case 'rotar_mazos':
        rotarMazos($datos);
        break;
    
    case 'obtener_estado':
        obtenerEstado($datos);
        break;
    
    case 'finalizar_partida':
        finalizarPartida($datos);
        break;
    
    default:
        echo json_encode(['success' => false, 'error' => 'Accion no valida']);
}

function inicializarPartida($datos) {
    if (!isset($datos['jugadores']) || !is_array($datos['jugadores'])) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos de jugadores']);
        return;
    }
    
    session_start();
    
    $_SESSION['partida'] = [
        'jugadores' => $datos['jugadores'],
        'turnoActual' => 1,
        'rondaActual' => 1,
        'tableros' => [],
        'mazos' => []
    ];
    
    foreach ($datos['jugadores'] as $jugador) {
        $_SESSION['partida']['tableros'][$jugador['id']] = [
            'casillas' => [],
            'dinosUsados' => [
                1 => false,
                2 => false,
                3 => false,
                4 => false,
                5 => false,
                6 => false
            ]
        ];
        
        $_SESSION['partida']['mazos'][$jugador['id']] = [
            1 => false,
            2 => false,
            3 => false,
            4 => false,
            5 => false,
            6 => false
        ];
    }
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Partida inicializada',
        'estado' => $_SESSION['partida']
    ]);
}

function guardarTablero($datos) {
    if (!isset($datos['jugadorId']) || !isset($datos['tablero'])) {
        echo json_encode(['success' => false, 'error' => 'Faltan datos del tablero']);
        return;
    }
    
    session_start();
    
    if (!isset($_SESSION['partida'])) {
        echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        return;
    }
    
    $jugadorId = $datos['jugadorId'];
    $_SESSION['partida']['tableros'][$jugadorId] = $datos['tablero'];
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Tablero guardado correctamente'
    ]);
}

function cargarTablero($datos) {
    if (!isset($datos['jugadorId'])) {
        echo json_encode(['success' => false, 'error' => 'Falta ID de jugador']);
        return;
    }
    
    session_start();
    
    if (!isset($_SESSION['partida'])) {
        echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        return;
    }
    
    $jugadorId = $datos['jugadorId'];
    $tablero = isset($_SESSION['partida']['tableros'][$jugadorId]) 
        ? $_SESSION['partida']['tableros'][$jugadorId] 
        : [
            'casillas' => [],
            'dinosUsados' => [
                1 => false,
                2 => false,
                3 => false,
                4 => false,
                5 => false,
                6 => false
            ]
        ];
    
    echo json_encode([
        'success' => true,
        'tablero' => $tablero
    ]);
}

function siguienteTurno($datos) {
    session_start();
    
    if (!isset($_SESSION['partida'])) {
        echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        return;
    }
    
    $partida = &$_SESSION['partida'];
    $cantidadJugadores = count($partida['jugadores']);
    
    $partida['turnoActual']++;
    
    $rondaCompletada = false;
    if ($partida['turnoActual'] > $cantidadJugadores) {
        $partida['turnoActual'] = 1;
        $partida['rondaActual']++;
        $rondaCompletada = true;
    }
    
    $partidaFinalizada = $partida['rondaActual'] > 12;
    
    $jugadorActual = null;
    if (!$partidaFinalizada) {
        foreach ($partida['jugadores'] as $jugador) {
            if ($jugador['id'] == $partida['turnoActual']) {
                $jugadorActual = $jugador;
                break;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'turnoActual' => $partida['turnoActual'],
        'rondaActual' => $partida['rondaActual'],
        'jugadorActual' => $jugadorActual,
        'partidaFinalizada' => $partidaFinalizada,
        'rondaCompletada' => $rondaCompletada
    ]);
}

function rotarMazos($datos) {
    session_start();
    
    if (!isset($_SESSION['partida'])) {
        echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        return;
    }
    
    $partida = &$_SESSION['partida'];
    $cantidadJugadores = count($partida['jugadores']);
    
    $mazosActuales = [];
    foreach ($partida['jugadores'] as $jugador) {
        $mazosActuales[$jugador['id']] = $partida['tableros'][$jugador['id']]['dinosUsados'];
    }
    
    foreach ($partida['jugadores'] as $jugador) {
        $idActual = $jugador['id'];
        $idSiguiente = ($idActual % $cantidadJugadores) + 1;
        
        $partida['tableros'][$idSiguiente]['dinosUsados'] = $mazosActuales[$idActual];
    }
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Mazos rotados correctamente'
    ]);
}

function obtenerEstado($datos) {
    session_start();
    
    if (!isset($_SESSION['partida'])) {
        echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'estado' => $_SESSION['partida']
    ]);
}

function finalizarPartida($datos) {
    session_start();
    
    if (!isset($_SESSION['partida'])) {
        echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        return;
    }
    
    $resultados = [];
    
    foreach ($_SESSION['partida']['jugadores'] as $jugador) {
        $tablero = $_SESSION['partida']['tableros'][$jugador['id']];
        
        $resultados[] = [
            'jugador' => $jugador['nombre'],
            'id' => $jugador['id'],
            'tablero' => $tablero
        ];
    }
    
    unset($_SESSION['partida']);
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Partida finalizada',
        'resultados' => $resultados
    ]);
}
?>