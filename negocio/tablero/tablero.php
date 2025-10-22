<?php
require_once 'zonas/zona.php';

class Tablero {
    private $zonas;
    
    public function __construct() {
        $this->zonas = [];
        $this->crearTodasLasZonas();
    }
    
    private function crearTodasLasZonas() {
        $this->zonas['bosque-semejanza'] = new ZonaTodosIguales(
            'bosque-semejanza',
            6,
            ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6'],
            'izquierda-derecha'
        );
        
        $this->zonas['prado-diferencia'] = new ZonaTodosDiferentes(
            'prado-diferencia',
            6,
            ['6-1', '6-2', '6-3', '6-4', '6-5', '6-6'],
            'izquierda-derecha'
        );
        
        $this->zonas['trio-frondoso'] = new ZonaTrio(
            'trio-frondoso',
            3,
            ['4-1', '4-2', '4-3'],
            'izquierda-derecha'
        );
        
        $this->zonas['pradera-amor'] = new ZonaPradera(
            'pradera-amor',
            2,
            ['7-1', '7-2'],
            'libre'
        );
        
        $this->zonas['isla-solitaria'] = new ZonaSolitaria(
            'isla-solitaria',
            1,
            ['9-1'],
            'libre'
        );
        
        $this->zonas['rey-selva'] = new ZonaSolitaria(
            'rey-selva',
            1,
            ['3-1'],
            'libre'
        );
        
        $this->zonas['dinos-rio'] = new ZonaRio(
            'dinos-rio',
            6,
            ['8-1', '8-2', '8-3', '8-4', '8-5', '8-6'],
            'libre'
        );
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
    
    public function cargarEstado($tableroEstado) {
        if (isset($tableroEstado['casillas'])) {
            foreach ($tableroEstado['casillas'] as $casillaId => $dino) {
                $nombreZona = $this->obtenerZonaDeCasilla($casillaId);
                if ($nombreZona && isset($this->zonas[$nombreZona])) {
                    $this->zonas[$nombreZona]->agregarDino($casillaId, $dino);
                }
            }
        }
    }
    
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
                return ['valido' => false, 'razon' => "Restriccion del dado ($caraDado): no puedes colocar aqui"];
            }
        }
        
        if ($zona->tieneDino($casillaId)) {
            return ['valido' => false, 'razon' => 'Esta casilla ya tiene un dinosaurio'];
        }
        
        if ($zona->estaLlena()) {
            return ['valido' => false, 'razon' => 'Esta zona esta llena'];
        }
        
        $resultadoOrden = $zona->validarOrden($casillaId);
        if (!$resultadoOrden['valido']) {
            return $resultadoOrden;
        }
        
        $resultadoRegla = $zona->validarRegla($dino);
        if (!$resultadoRegla['valido']) {
            return $resultadoRegla;
        }
        
        return ['valido' => true];
    }
    
    public function calcularPuntuacionTotal() {
        $total = 0;
        $detalles = [];
        
        foreach ($this->zonas as $nombreZona => $zona) {
            $puntos = $zona->calcularPuntos();
            $total += $puntos;
            
            $detalles[$nombreZona] = [
                'puntos' => $puntos,
                'cantidad' => count($zona->getDinos())
            ];
        }
        
        return [
            'total' => $total,
            'detalles' => $detalles
        ];
    }
}
?>