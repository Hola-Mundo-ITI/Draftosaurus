<?php
/**
 * Este archivo contiene funciones de utilidad que se usan en toda la aplicación.
 * Principalmente para renderizar elementos HTML de forma consistente.
 * 
 * FUNCIONES PRINCIPALES:
 * - renderizarDinosaurios() - Grupo de dinosaurios
 * - renderizarCasillas() - Múltiples casillas de una zona
 * - renderizarCasilla() - Una casilla individual
 */

/**
 * Renderizar un grupo de dinosaurios
 * 
 * Muestra los dinosaurios seleccionables en los laterales del tablero.
 * Cada dinosaurio es clickeable y se puede seleccionar.
 * 
 * @param int $inicio Número del primer dinosaurio (ej: 1)
 * @param int $fin Número del último dinosaurio (ej: 3)
 * 
 * Ejemplo de uso:
 *   renderizarDinosaurios(1, 3);  // Dinos 1, 2, 3 (izquierda)
 *   renderizarDinosaurios(4, 6);  // Dinos 4, 5, 6 (derecha)
 */
function renderizarDinosaurios($inicio, $fin) {
    // Generar cada dinosaurio del rango
    for ($i = $inicio; $i <= $fin; $i++) {
        ?>
        <div class="dinosaurio" 
             onclick="seleccionarDino(<?php echo $i; ?>)" 
             data-dino="<?php echo $i; ?>">
          <img src="Recursos/img/dino<?php echo $i; ?>.png" 
               alt="Dino <?php echo $i; ?>" />
        </div>
        <?php
    }
}

/**
 * Renderiza múltiples casillas de una zona
 * 
 * Crea un grupo de casillas consecutivas para una zona del tablero.
 * Usa renderizarCasilla() internamente para cada casilla.
 * 
 * @param string $zona ID de la zona (ej: '1', '4', '6')
 * @param int $cantidad Número de casillas a crear
 * @param array $datos Array con datos de la vista (de obtenerDatosVista())
 * @param bool $siemprePermitida Si es true, ignora restricciones (para el río)
 */
function renderizarCasillas($zona, $cantidad, $datos, $siemprePermitida = false) {
    // Generar cada casilla del 1 hasta la cantidad
    for ($i = 1; $i <= $cantidad; $i++) {
        $id = "$zona-$i";
        renderizarCasilla($id, $datos, $siemprePermitida);
    }
}

/**
 * Renderiza una casilla individual del tablero
 * 
 * Crea el HTML completo de una casilla, incluyendo:
 * - Clases CSS según su estado (permitida/bloqueada)
 * - Imagen del dinosaurio si está ocupada
 * - Evento onclick para colocar dinosaurios
 * 
 * @param string $id ID de la casilla (ej: '1-1', '4-2', '9-1')
 * @param array $datos Array con datos de la vista
 * @param bool $siemprePermitida Si es true, la casilla siempre está permitida
 * 
 * Estructura de $datos esperada:
 * [
 *   'estadoCasillas' => ['1-1' => 'permitida', '6-1' => 'bloqueada', ...],
 *   'tableroEstado' => ['1-1' => 3, '4-2' => 5, ...]  // casilla => dino
 * ]
 */
function renderizarCasilla($id, $datos, $siemprePermitida = false) {
    if ($siemprePermitida) {
        $estado = 'permitida';
    } else {
        $estado = isset($datos['estadoCasillas'][$id]) 
                  ? $datos['estadoCasillas'][$id] 
                  : 'permitida';
    }
    $ocupado = isset($datos['tableroEstado'][$id]) 
               ? $datos['tableroEstado'][$id] 
               : null;
    
    ?>
    
    <div class="casillero-item clickeable <?php echo $estado; ?>" 
         onclick="colocarDino('<?php echo $id; ?>')" 
         data-casilla="<?php echo $id; ?>">
      
      <?php if ($ocupado): ?>
        <img src="Recursos/img/dino<?php echo $ocupado; ?>.png" 
             alt="Dino <?php echo $ocupado; ?>" 
             style="width:100%;height:100%;object-fit:contain;">
      <?php endif; ?>
      
    </div>
    
    <?php
}

function debugSesion($mostrar = false) {
    if (!$mostrar) {
        return;
    }
    
    echo '<div style="background:#f0f0f0; padding:15px; margin:10px; border:2px solid #333; border-radius:5px;">';
    echo '<h3> DEBUG - Estado de la Sesión</h3>';
    echo '<pre style="background:#fff; padding:10px; overflow:auto;">';
    print_r($_SESSION);
    echo '</pre>';
    echo '</div>';
}

/**
 * Mostrar información de debug del POST
 * Solo para desarrollo
 * 
 * @param bool $mostrar Si es true, muestra el debug
 */
function debugPost($mostrar = false) {
    if (!$mostrar) {
        return;
    }
    
    echo '<div style="background:#fff3cd; padding:15px; margin:10px; border:2px solid #ffc107; border-radius:5px;">';
    echo '<h3> DEBUG - Datos POST</h3>';
    echo '<pre style="background:#fff; padding:10px; overflow:auto;">';
    print_r($_POST);
    echo '</pre>';
    echo '</div>';
}


function sanitizar($dato) {
    return htmlspecialchars(trim($dato), ENT_QUOTES, 'UTF-8');
}

/**
 * Validar ID de casilla
 * Verifica que el ID tenga el formato correcto (zona-numero)
 * 
 * @param string $casilla ID de casilla a validar
 * @return bool True si es válido, False si no
 * 
 * Ejemplos:
 *   validarIdCasilla('1-1')   → true
 *   validarIdCasilla('4-2')   → true
 *   validarIdCasilla('abc')   → false
 *   validarIdCasilla('1-99')  → true (existe aunque no esté en el tablero)
 */
function validarIdCasilla($casilla) {
    // Patrón: número-número (ej: 1-1, 4-2, 9-1)
    return preg_match('/^[0-9]+-[0-9]+$/', $casilla) === 1;
}

/**
 * Validar ID de dinosaurio
 * Verifica que sea un número entre 1 y 6
 * 
 * @param mixed $dino ID del dinosaurio
 * @return bool True si es válido, False si no
 */
function validarIdDinosaurio($dino) {
    $dino = (int)$dino;
    return $dino >= 1 && $dino <= 6;
}

/**
 * Formatear mensaje de error para mostrar al usuario
 * 
 * @param string $mensaje Mensaje de error
 * @return string HTML del mensaje formateado
 */
function formatearError($mensaje) {
    return '<div class="alert alert-error">' . sanitizar($mensaje) . '</div>';
}

/**
 * Formatear mensaje de éxito para mostrar al usuario
 * 
 * @param string $mensaje Mensaje de éxito
 * @return string HTML del mensaje formateado
 */
function formatearExito($mensaje) {
    return '<div class="alert alert-success">' . sanitizar($mensaje) . '</div>';
}

/**
 * Generar ID único para elementos HTML
 * Útil cuando necesitas crear elementos dinámicos con IDs únicos
 * 
 * @param string $prefijo Prefijo del ID
 * @return string ID único
 */
function generarIdUnico($prefijo = 'elemento') {
    return $prefijo . '_' . uniqid();
}

/**
 * Contar total de casillas en el tablero
 * 
 * @return int Total de casillas disponibles
 */
function contarTotalCasillas() {
    // Bosque(6) + Rey(1) + Trío(3) + Prado(6) + Pradera(2) + Río(6) + Isla(1)
    return 25;
}

/**
 * Obtener nombre legible de una zona
 * 
 * @param string $zonaId ID de la zona (ej: '1', '4', '8')
 * @return string Nombre legible de la zona
 */
function obtenerNombreZona($zonaId) {
    $nombres = [
        '1' => 'Bosque de la Semejanza',
        '3' => 'Rey de la Selva',
        '4' => 'El Trío Frondoso',
        '6' => 'Prado de la Diferencia',
        '7' => 'La Pradera del Amor',
        '8' => 'Dinosaurios en el Río',
        '9' => 'La Isla Solitaria'
    ];
    
    return isset($nombres[$zonaId]) ? $nombres[$zonaId] : 'Zona Desconocida';
}

/**
 * Verificar si una casilla pertenece a una zona específica
 * 
 * @param string $casilla ID de casilla (ej: '1-1')
 * @param string $zona ID de zona (ej: '1')
 * @return bool True si pertenece, False si no
 */
function casillaEnZona($casilla, $zona) {
    $partes = explode('-', $casilla);
    
    if (count($partes) !== 2) {
        return false;
    }
    
    return $partes[0] === $zona;
}

?>