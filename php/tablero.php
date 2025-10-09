<?php
class Tablero {
    private $zonas; 
    
    public function __construct() {
        $this->zonas = [];
        $this->crearTodasLasZonas();
    }
    
    // Crea todas las zonas del tablero con sus reglas
    private function crearTodasLasZonas() {
        // BOSQUE SEMEJANZA: Todos iguales, llenar de izquierda a derecha
        $this->zonas['bosque-semejanza'] = [
            'capacidad' => 6,
            'casillas' => ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6'],
            'dinos' => [], 
            'regla' => 'todos-iguales',
            'orden' => 'izquierda-derecha'
        ];
        
        // PRADO DIFERENCIA: Todos diferentes, llenar de izquierda a derecha
        $this->zonas['prado-diferencia'] = [
            'capacidad' => 6,
            'casillas' => ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6'],
            'dinos' => [],
            'regla' => 'todos-diferentes',
            'orden' => 'izquierda-derecha'
        ];
        
        // TRIO FRONDOSO: 3 espacios, llenar de izquierda a derecha
        $this->zonas['trio-frondoso'] = [
            'capacidad' => 3,
            'casillas' => ['4-1', '4-2', '4-3'],
            'dinos' => [],
            'regla' => 'ninguna',
            'orden' => 'izquierda-derecha'
        ];
        
        // PRADERA DEL AMOR: 2 espacios, orden libre
        $this->zonas['pradera-amor'] = [
            'capacidad' => 2,
            'casillas' => ['7-1', '7-2'],
            'dinos' => [],
            'regla' => 'ninguna',
            'orden' => 'libre'
        ];
        
        // ISLA SOLITARIA: Solo 1 espacio
        $this->zonas['isla-solitaria'] = [
            'capacidad' => 1,
            'casillas' => ['9-1'],
            'dinos' => [],
            'regla' => 'ninguna',
            'orden' => 'libre'
        ];
        
        // REY DE LA SELVA: Solo 1 espacio
        $this->zonas['rey-selva'] = [
            'capacidad' => 1,
            'casillas' => ['3-1'],
            'dinos' => [],
            'regla' => 'ninguna',
            'orden' => 'libre'
        ];
        

        $this->zonas['dinos-rio'] = [
            'capacidad' => 6,
            'casillas' => ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6'],
            'dinos' => [],
            'regla' => 'rio-libre',
            'orden' => 'libre'
        ];
    }
    
    private function obtenerZonaDeCasilla($casillaId) {
        if (strpos($casillaId, '1-') === 0) return 'bosque-semejanza';
        if (strpos($casillaId, '6-') === 0) return 'prado-diferencia';
        if (strpos($casillaId, '4-') === 0) return 'trio-frondoso';
        if (strpos($casillaId, '7-') === 0) return 'pradera-amor';
        if ($casillaId === '9-1') return 'isla-solitaria';
        if ($casillaId === '3-1') return 'rey-selva';
        if (strpos($casillaId, '8-') === 0) return 'dinos-rio';
        return null;
    }
    
    // Cargar dinos desde el estado del frontend
    public function cargarEstado($tableroEstado) {
        if (isset($tableroEstado['casillas'])) {
            foreach ($tableroEstado['casillas'] as $casillaId => $dino) {
                $nombreZona = $this->obtenerZonaDeCasilla($casillaId);
                if ($nombreZona && isset($this->zonas[$nombreZona])) {
                    $this->zonas[$nombreZona]['dinos'][$casillaId] = $dino;
                }
            }
        }
    }
    
    // VALIDAR si puedo colocar un dino en una casilla
    public function puedoColocar($casillaId, $dino, $restriccionDado = null) {

        $nombreZona = $this->obtenerZonaDeCasilla($casillaId);
        if (!$nombreZona) {
            return ['valido' => false, 'razon' => 'Casilla no existe'];
        }
        
        $zona = $this->zonas[$nombreZona];
        
        if ($restriccionDado) {
            $zonasPermitidas = $restriccionDado['zonasPermitidas'];
            if (!in_array($nombreZona, $zonasPermitidas)) {
                $caraDado = $restriccionDado['caraDado'];
                return ['valido' => false, 'razon' => "Restricción del dado ($caraDado): no puedes colocar aquí"];
            }
        }
        
        if (isset($zona['dinos'][$casillaId])) {
            return ['valido' => false, 'razon' => 'Esta casilla ya tiene un dinosaurio'];
        }
        
        if (count($zona['dinos']) >= $zona['capacidad']) {
            return ['valido' => false, 'razon' => 'Esta zona está llena'];
        }
        
        if ($zona['orden'] === 'izquierda-derecha') {
            $resultado = $this->validarOrdenIzquierdaDerecha($zona, $casillaId);
            if (!$resultado['valido']) {
                return $resultado;
            }
        }
        
        if ($zona['regla'] === 'todos-iguales') {
            $resultado = $this->validarTodosIguales($zona, $dino);
            if (!$resultado['valido']) {
                return $resultado;
            }
        }
        
        if ($zona['regla'] === 'todos-diferentes') {
            $resultado = $this->validarTodosDiferentes($zona, $dino);
            if (!$resultado['valido']) {
                return $resultado;
            }
        }
        
        return ['valido' => true];
    }
    
    private function validarOrdenIzquierdaDerecha($zona, $casillaId) {
        $cantidadDinos = count($zona['dinos']);
        $casillaNecesaria = $zona['casillas'][$cantidadDinos];
        
        if ($casillaId !== $casillaNecesaria) {
            return [
                'valido' => false, 
                'razon' => "Debes llenar de izquierda a derecha. La próxima casilla disponible es: $casillaNecesaria"
            ];
        }
        return ['valido' => true];
    }
    
    // Validar que todos los dinos sean de la misma especie
    private function validarTodosIguales($zona, $dino) {
        // Si está vacía, cualquier dino está bien
        if (empty($zona['dinos'])) {
            return ['valido' => true];
        }
        
        // Ver qué especie ya está en la zona
        $especieExistente = reset($zona['dinos']); // Toma el primer dino
        
        if ($especieExistente != $dino) {
            return ['valido' => false, 'razon' => "Solo puedes colocar dinosaurios tipo $especieExistente aquí"];
        }
        
        return ['valido' => true];
    }
    
    // Validar que todos los dinos sean diferentes
    private function validarTodosDiferentes($zona, $dino) {
        // Ver si ya existe este tipo de dino
        foreach ($zona['dinos'] as $dinoExistente) {
            if ($dinoExistente == $dino) {
                return ['valido' => false, 'razon' => "Ya hay un dinosaurio tipo $dino en esta zona (deben ser todos diferentes)"];
            }
        }
        
        return ['valido' => true];
    }
}