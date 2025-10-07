<?php
/**
 * 
 * Este archivo contiene toda la lógica de negocio del juego digital.
 * Se encarga de inicializar la sesión, procesar acciones del usuario
 * y preparar los datos para mostrar en la vista.
 * 
 * RESPONSABILIDADES:
 * - Inicializar variables de sesión
 * - Procesar acciones POST (lanzar dado, colocar dino, reiniciar)
 * - Validar movimientos del jugador
 * - Preparar datos para la vista
 */

function inicializarSesion() {
    if (!isset($_SESSION['tablero_estado'])) {
        $_SESSION['tablero_estado'] = [];
    }

    if (!isset($_SESSION['cara_dado'])) {
        $_SESSION['cara_dado'] = null;
    }
    
    if (!isset($_SESSION['ronda_actual'])) {
        $_SESSION['ronda_actual'] = 1;
    }
    
    if (!isset($_SESSION['numero_bots'])) {
        $_SESSION['numero_bots'] = 2;
    }
    
    if (!isset($_SESSION['jugador_lanzo'])) {
        $_SESSION['jugador_lanzo'] = null;
    }
}


/**
 * Procesar la acción enviada por el usuario
 * 
 * @return array Resultado con mensaje y tipo (success/error/info)
 */
function procesarAccion() {
    $resultado = [
        'mensaje' => '',
        'tipo' => ''
    ];
    
    $accion = isset($_POST['accion']) ? $_POST['accion'] : '';
    
    if (empty($accion)) {
        return $resultado;
    }
    
    switch ($accion) {
        case 'lanzar_dado':
            $resultado = accionLanzarDado();
            break;
            
        case 'colocar_dino':
            $resultado = accionColocarDino();
            break;
            
        case 'reiniciar':
            $resultado = accionReiniciar();
            break;
            
        default:
            $resultado = [
                'mensaje' => 'Acción no reconocida',
                'tipo' => 'error'
            ];
    }
    
    return $resultado;
}

/**
 * ACCIÓN: Lanzar el dado
 * 
 * Genera una cara aleatoria del dado y establece las restricciones
 * para esta ronda.
 * 
 * @return array Resultado de la acción
 */
function accionLanzarDado() {
    $caraLanzada = lanzarDado();
    
    $mensaje = obtenerMensajeRestriccion($caraLanzada);
    
    // Retornar resultado exitoso
    return [
        'mensaje' => "Dado lanzado: $mensaje",
        'tipo' => 'success'
    ];
}

/**
 * ACCIÓN: Colocar un dinosaurio en el tablero
 * 
 * Valida que:
 * 1. El dado haya sido lanzado
 * 2. La casilla esté permitida según la restricción
 * 3. La casilla esté vacía
 * 
 * Si todo es válido, coloca el dinosaurio en el tablero.
 * 
 * @return array Resultado de la acción
 */
function accionColocarDino() {
    $casilla = isset($_POST['casilla']) ? $_POST['casilla'] : '';
    $dino = isset($_POST['dino']) ? $_POST['dino'] : '';
    
    $caraActual = $_SESSION['cara_dado'];
    $tablero = $_SESSION['tablero_estado'];
    
    if (!$caraActual) {
        return [
            'mensaje' => 'Debes lanzar el dado primero',
            'tipo' => 'error'
        ];
    }

    if (empty($casilla) || empty($dino)) {
        return [
            'mensaje' => 'Datos incompletos. Selecciona un dinosaurio y una casilla.',
            'tipo' => 'error'
        ];
    }

    if (!casillaEstaPermitida($casilla, $caraActual, $tablero)) {
        $restriccion = obtenerMensajeRestriccion($caraActual);
        return [
            'mensaje' => "No puedes colocar aquí. Restricción activa: $restriccion",
            'tipo' => 'error'
        ];
    }

    if (isset($tablero[$casilla]) && !empty($tablero[$casilla])) {
        return [
            'mensaje' => 'Esta casilla ya está ocupada',
            'tipo' => 'error'
        ];
    }
    $_SESSION['tablero_estado'][$casilla] = $dino;
    return [
        'mensaje' => "¡Dinosaurio colocado en casilla $casilla!",
        'tipo' => 'success'
    ];
}

/**
 * ACCIÓN: Reiniciar la partida
 * 
 * Limpia todo el estado de la sesión y comienza una nueva partida.
 * 
 * @return array Resultado de la acción
 */
function accionReiniciar() {

    $_SESSION['tablero_estado'] = [];
    
    $_SESSION['cara_dado'] = null;
    $_SESSION['jugador_lanzo'] = null;
    

    $_SESSION['ronda_actual'] = 1;
    
    
    return [
        'mensaje' => 'Partida reiniciada. ¡Lanza el dado para comenzar!',
        'tipo' => 'success'
    ];
}

/**
 * Obtener todos los datos necesarios para renderizar la vista
 * 
 * Esta función prepara un array con toda la información que
 * necesita el HTML para mostrarse correctamente.
 * 
 * @return array Datos para la vista
 */
function obtenerDatosVista() {
    $caraActual = $_SESSION['cara_dado'];
    $tableroEstado = $_SESSION['tablero_estado'];
    
    $estadoCasillas = obtenerEstadoCasillas($caraActual, $tableroEstado);
    $mensajeRestriccion = obtenerMensajeRestriccion($caraActual);
    
    return [
        'caraActual' => $caraActual,                   
        'tableroEstado' => $tableroEstado,              
        'estadoCasillas' => $estadoCasillas,            
        'mensajeRestriccion' => $mensajeRestriccion,    
        'numeroBots' => $_SESSION['numero_bots'],       
        'jugadorLanzo' => $_SESSION['jugador_lanzo']    
    ];
}


/**
 * Verificar si el jugador puede realizar una acción
 * 
 * @return bool True si puede, False si no
 */
function jugadorPuedeActuar() {
    // Por ahora siempre puede actuar (modo solo)
    // Esta función para modo multijugador
    return true;
}

/**
 * Avanzar a la siguiente ronda
 * 
 * Se llama cuando todos los jugadores han colocado sus dinosaurios
 */
function avanzarRonda() {
    $_SESSION['ronda_actual']++;
    $_SESSION['cara_dado'] = null;
    $_SESSION['jugador_lanzo'] = null;
}

/**
 * Verificar si la partida ha terminado
 * 
 * @return bool True si terminó, False si continúa
 */
function partidaTerminada() {
    // Una partida tiene 2 rondas, 6 dinosaurios por jugador
    return $_SESSION['ronda_actual'] > 2;
}

/**
 * Contar dinosaurios colocados por el jugador
 * 
 * @return int Número de dinosaurios colocados
 */
function contarDinosauriosColocados() {
    return count($_SESSION['tablero_estado']);
}

/**
 * Obtener información de debug (solo para desarrollo)
 * 
 * @return array Información de debug
 */
function obtenerInfoDebug() {
    return [
        'sesion' => $_SESSION,
        'post' => $_POST,
        'servidor' => [
            'php_version' => PHP_VERSION,
            'fecha_hora' => date('Y-m-d H:i:s')
        ]
    ];
}

?>