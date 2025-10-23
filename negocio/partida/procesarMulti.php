<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Metodo no permitido']);
    exit;
}

require_once 'manejadorPartida.php';

$json = file_get_contents('php://input');
$datos = json_decode($json, true);

if (!$datos || !isset($datos['accion'])) {
    echo json_encode(['success' => false, 'error' => 'No se recibio accion']);
    exit;
}

$manejador = new ManejadorPartida();
$accion = $datos['accion'];

switch ($accion) {
    case 'inicializar':
        if (!isset($datos['jugadores']) || !is_array($datos['jugadores'])) {
            echo json_encode(['success' => false, 'error' => 'Faltan datos de jugadores']);
            break;
        }
        
        $estado = $manejador->inicializar($datos['jugadores']);
        echo json_encode([
            'success' => true,
            'mensaje' => 'Partida inicializada',
            'estado' => $estado
        ]);
        break;
    
    case 'guardar_tablero':
        if (!isset($datos['jugadorId']) || !isset($datos['tablero'])) {
            echo json_encode(['success' => false, 'error' => 'Faltan datos del tablero']);
            break;
        }
        
        $resultado = $manejador->guardarTablero($datos['jugadorId'], $datos['tablero']);
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'mensaje' => 'Tablero guardado correctamente'
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        }
        break;
    
    case 'cargar_tablero':
        if (!isset($datos['jugadorId'])) {
            echo json_encode(['success' => false, 'error' => 'Falta ID de jugador']);
            break;
        }
        
        $tablero = $manejador->cargarTablero($datos['jugadorId']);
        
        if ($tablero !== null) {
            echo json_encode([
                'success' => true,
                'tablero' => $tablero
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        }
        break;
    
    case 'siguiente_turno':
        $resultado = $manejador->siguienteTurno();
        
        if ($resultado !== null) {
            echo json_encode(array_merge(['success' => true], $resultado));
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        }
        break;
    
    case 'rotar_mazos':
        $resultado = $manejador->rotarMazos();
        
        if ($resultado) {
            echo json_encode([
                'success' => true,
                'mensaje' => 'Mazos rotados correctamente'
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        }
        break;
    
    case 'obtener_estado':
        $estado = $manejador->obtenerEstado();
        
        if ($estado !== null) {
            echo json_encode([
                'success' => true,
                'estado' => $estado
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        }
        break;
    
    case 'finalizar_partida':
        $resultados = $manejador->finalizar();
        
        if ($resultados !== null) {
            echo json_encode([
                'success' => true,
                'mensaje' => 'Partida finalizada',
                'resultados' => $resultados
            ]);
        } else {
            echo json_encode(['success' => false, 'error' => 'No hay partida activa']);
        }
        break;
    
    default:
        echo json_encode(['success' => false, 'error' => 'Accion no valida']);
}
?>