<?php
/**
 * SISTEMA DE RESTRICCIONES DEL DADO 
 * 
 * Este archivo maneja toda la lógica de restricciones del juego.
 * Cuando se lanza el dado, este sistema determina qué casillas
 * están permitidas y cuáles bloqueadas según la cara que cayó.
 * 
 * CARAS DEL DADO:
 * - bosque: Solo área del bosque
 * - llanura: Solo área de llanura
 * - banos: Solo lado derecho del río
 * - cafeteria: Solo lado izquierdo del río
 * - recintoVacio: Solo casillas vacías
 */


/**
 * Obtener todas las casillas organizadas por zona
 * 
 * Cada zona tiene su lista de casillas identificadas por 'zona-numero'
 * 
 * @return array Mapeo completo de zonas a casillas
 */
function obtenerCasillasZonas() {
    return [
        'bosque-semejanza' => ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6'],
        'prado-diferencia' => ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6'],
        'pradera-amor' => ['7-1', '7-2'],
        'trio-frondoso' => ['4-1', '4-2', '4-3'],
        'rey-selva' => ['3-1'],
        'isla-solitaria' => ['9-1'],
        'dinos-rio' => ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6']
    ];
}

/**
 * Obtener las áreas temáticas del tablero
 * 
 * El tablero se divide en dos áreas principales:
 * - Bosque: Zonas verdes y frondosas
 * - Llanura: Zonas abiertas y praderas
 * 
 * @return array Mapeo de áreas a zonas
 */
function obtenerAreas() {
    return [
        'bosque' => ['bosque-semejanza', 'rey-selva', 'trio-frondoso'],
        'llanura' => ['prado-diferencia', 'pradera-amor', 'isla-solitaria']
    ];
}

/**
 * Obtener los lados del río
 * 
 * El río divide el tablero en dos lados:
 * - Izquierda: Zonas a la izquierda del río
 * - Derecha: Zonas a la derecha del río
 * 
 * @return array Mapeo de lados a zonas
 */
function obtenerLados() {
    return [
        'izquierda' => ['bosque-semejanza', 'trio-frondoso', 'pradera-amor'],
        'derecha' => ['rey-selva', 'prado-diferencia', 'isla-solitaria']
    ];
}

/**
 * Obtener información de todas las caras del dado
 * 
 * Cada cara tiene:
 * - nombre: Nombre descriptivo
 * - tipo: Tipo de restricción (area, lado, vacio)
 * - descripcion: Mensaje para el jugador
 * 
 * @return array Información completa de las caras
 */
function obtenerCarasDado() {
    return [
        'bosque' => [
            'nombre' => 'Bosque',
            'tipo' => 'area',
            'descripcion' => 'Solo recintos del área Bosque'
        ],
        'llanura' => [
            'nombre' => 'Llanura',
            'tipo' => 'area',
            'descripcion' => 'Solo recintos del área Llanura'
        ],
        'banos' => [
            'nombre' => 'Baños',
            'tipo' => 'lado',
            'descripcion' => 'Solo recintos a la derecha del río'
        ],
        'cafeteria' => [
            'nombre' => 'Cafetería',
            'tipo' => 'lado',
            'descripcion' => 'Solo recintos a la izquierda del río'
        ],
        'recintoVacio' => [
            'nombre' => 'Recinto Vacío',
            'tipo' => 'vacio',
            'descripcion' => 'Solo recintos que no tengan dinosaurios'
        ]
    ];
}

/**
 * Lanzar el dado y obtener una cara aleatoria
 * 
 * Esta función:
 * 1. Selecciona una cara aleatoria del dado
 * 2. Guarda la cara en la sesión
 * 3. Guarda quién lanzó el dado (jugador 1 = humano)
 * 4. Retorna la cara seleccionada
 * 
 * @return string Cara del dado lanzada (bosque, llanura, etc.)
 */
function lanzarDado() {

    $caras = ['bosque', 'llanura', 'banos', 'cafeteria', 'recintoVacio'];
    $caraAleatoria = $caras[array_rand($caras)];
    $_SESSION['cara_dado'] = $caraAleatoria;
    $_SESSION['jugador_lanzo'] = 1;
    return $caraAleatoria;
}

/**
 * Obtener las casillas permitidas según la cara actual del dado
 * 
 * Esta es la función principal que determina dónde puede colocar
 * el jugador según la restricción activa.
 * 
 * @param string $caraActual Cara del dado activa
 * @param array $tableroEstado Estado actual del tablero (casillas ocupadas)
 * @return array Lista de IDs de casillas permitidas
 */
function obtenerCasillasPermitidas($caraActual, $tableroEstado) {
    $todasCasillas = obtenerCasillasZonas();
    $areas = obtenerAreas();
    $lados = obtenerLados();
    $caras = obtenerCarasDado();
    
    $casillasRio = $todasCasillas['dinos-rio'];
    
    if (empty($caraActual)) {
        $todasPermitidas = [];
        foreach ($todasCasillas as $casillas) {
            $todasPermitidas = array_merge($todasPermitidas, $casillas);
        }
        return $todasPermitidas;
    }
    
    if (!isset($caras[$caraActual])) {
        $todasPermitidas = [];
        foreach ($todasCasillas as $casillas) {
            $todasPermitidas = array_merge($todasPermitidas, $casillas);
        }
        return $todasPermitidas;
    }
    

    $cara = $caras[$caraActual];
    $permitidas = $casillasRio;
    
    
    if ($cara['tipo'] == 'area') {
 
        $zonasPermitidas = $areas[$caraActual];
        
        foreach ($zonasPermitidas as $zona) {
            $permitidas = array_merge($permitidas, $todasCasillas[$zona]);
        }
    } 
    elseif ($cara['tipo'] == 'lado') {

        if ($caraActual == 'banos') {
            $zonasPermitidas = $lados['derecha'];
        } else {
            $zonasPermitidas = $lados['izquierda'];
        }
        foreach ($zonasPermitidas as $zona) {
            $permitidas = array_merge($permitidas, $todasCasillas[$zona]);
        }
    } 
    elseif ($cara['tipo'] == 'vacio') {
        foreach ($todasCasillas as $zona => $casillas) {
            foreach ($casillas as $casilla) {
                if (!isset($tableroEstado[$casilla]) || empty($tableroEstado[$casilla])) {
                    $permitidas[] = $casilla;
                }
            }
        }
    }
    
    return $permitidas;
}

/**
 * Verificar si una casilla específica está permitida
 * 
 * Función de conveniencia para validar una casilla individual.
 * 
 * @param string $numeroCasilla ID de la casilla (ej: '1-1', '4-2')
 * @param string $caraActual Cara del dado activa
 * @param array $tableroEstado Estado del tablero
 * @return bool True si está permitida, False si está bloqueada
 */
function casillaEstaPermitida($numeroCasilla, $caraActual, $tableroEstado) {
    $permitidas = obtenerCasillasPermitidas($caraActual, $tableroEstado);
    return in_array($numeroCasilla, $permitidas);
}

/**
 * Obtener el mensaje de restricción para mostrar al jugador
 * 
 * Genera un mensaje legible que explica la restricción actual.
 * 
 * @param string $caraActual Cara del dado activa
 * @return string Mensaje descriptivo
 */
function obtenerMensajeRestriccion($caraActual) {
    if (empty($caraActual)) {
        return 'Lanza el dado para comenzar';
    }
    $caras = obtenerCarasDado();

    if (!isset($caras[$caraActual])) {
        return 'Sin restricción';
    }
    
    $cara = $caras[$caraActual];

    return $cara['nombre'] . ': ' . $cara['descripcion'];
}

/**
 * Obtener el estado de todas las casillas del tablero
 * 
 * Genera un array completo con el estado (permitida/bloqueada)
 * de cada casilla según la restricción activa.
 * 
 * @param string $caraActual Cara del dado activa
 * @param array $tableroEstado Estado del tablero
 * @return array ['1-1' => 'permitida', '6-1' => 'bloqueada', ...]
 */
function obtenerEstadoCasillas($caraActual, $tableroEstado) {
    $todasCasillas = obtenerTodasLasCasillas();
    $permitidas = obtenerCasillasPermitidas($caraActual, $tableroEstado);
    $estadoCasillas = [];
    
    foreach ($todasCasillas as $casilla) {
        if (in_array($casilla, $permitidas)) {
            $estadoCasillas[$casilla] = 'permitida';
        } else {
            $estadoCasillas[$casilla] = 'bloqueada';
        }
    }
    
    return $estadoCasillas;
}

/**
 * Obtener lista plana de todas las casillas del tablero
 * 
 * @return array Lista de todos los IDs de casillas
 */
function obtenerTodasLasCasillas() {
    $todasCasillas = obtenerCasillasZonas();
    $resultado = [];
    
    // Aplanar el array de zonas
    foreach ($todasCasillas as $casillas) {
        $resultado = array_merge($resultado, $casillas);
    }
    
    return $resultado;
}

/**
 * Validar que una cara del dado existe
 * 
 * @param string $cara Nombre de la cara
 * @return bool True si existe, False si no
 */
function caraEsValida($cara) {
    $caras = obtenerCarasDado();
    return isset($caras[$cara]);
}

/**
 * Obtener tipo de restricción de una cara
 * 
 * @param string $cara Nombre de la cara
 * @return string|null Tipo de restricción o null si no existe
 */
function obtenerTipoRestriccion($cara) {
    $caras = obtenerCarasDado();
    return isset($caras[$cara]) ? $caras[$cara]['tipo'] : null;
}

/**
 * Verificar si una casilla pertenece a un área específica
 * 
 * @param string $casilla ID de casilla
 * @param string $area Nombre del área (bosque o llanura)
 * @return bool True si pertenece, False si no
 */
function casillaEnArea($casilla, $area) {
    $areas = obtenerAreas();
    $todasCasillas = obtenerCasillasZonas();
    
    if (!isset($areas[$area])) {
        return false;
    }
    
    // Recorrer zonas del área
    foreach ($areas[$area] as $zona) {
        if (in_array($casilla, $todasCasillas[$zona])) {
            return true;
        }
    }
    
    return false;
}

/**
 * Verificar si una casilla está en un lado específico del río
 * 
 * @param string $casilla ID de casilla
 * @param string $lado Lado del río (izquierda o derecha)
 * @return bool True si está en ese lado, False si no
 */
function casillaEnLado($casilla, $lado) {
    $lados = obtenerLados();
    $todasCasillas = obtenerCasillasZonas();
    
    if (!isset($lados[$lado])) {
        return false;
    }
    
    foreach ($lados[$lado] as $zona) {
        if (in_array($casilla, $todasCasillas[$zona])) {
            return true;
        }
    }
    
    return false;
}

/**
 * Verificar si una casilla es del río
 * 
 * @param string $casilla ID de casilla
 * @return bool True si es del río, False si no
 */
function esDelRio($casilla) {
    $todasCasillas = obtenerCasillasZonas();
    return in_array($casilla, $todasCasillas['dinos-rio']);
}
/**
 * Obtener nombre de la zona a la que pertenece una casilla
 * 
 * @param string $casilla ID de casilla
 * @return string|null Nombre de la zona o null si no se encuentra
 */
function obtenerZonaDeCasilla($casilla) {
    $todasCasillas = obtenerCasillasZonas();
    
    foreach ($todasCasillas as $nombreZona => $casillas) {
        if (in_array($casilla, $casillas)) {
            return $nombreZona;
        }
    }
    
    return null;
}

/**
 * Contar casillas permitidas actual mente
 * 
 * @param string $caraActual Cara del dado
 * @param array $tableroEstado Estado del tablero
 * @return int Número de casillas permitidas
 */
function contarCasillasPermitidas($caraActual, $tableroEstado) {
    $permitidas = obtenerCasillasPermitidas($caraActual, $tableroEstado);
    return count($permitidas);
}

/**
 * Obtener estadísticas de las restricciones
 * 
 * @param string $caraActual Cara del dado
 * @param array $tableroEstado Estado del tablero
 * @return array Estadísticas completas
 */
function obtenerEstadisticasRestricciones($caraActual, $tableroEstado) {
    $total = count(obtenerTodasLasCasillas());
    $permitidas = count(obtenerCasillasPermitidas($caraActual, $tableroEstado));
    $bloqueadas = $total - $permitidas;
    $porcentajePermitido = round(($permitidas / $total)