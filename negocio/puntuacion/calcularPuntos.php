<?php
class CalculadorPuntos {
    private $tablaBasica;
    private $tablaRio;
    
    public function __construct() {
        $this->tablaBasica = [0, 1, 3, 6, 10, 15, 21];
        $this->tablaRio = [0, 1, 3, 6, 10, 15, 21, 28];
    }
    
    public function calcular($zonas) {
        $total = 0;
        $detalles = [];
        
        foreach ($zonas as $nombreZona => $dinos) {
            $puntos = $this->calcularPorZona($nombreZona, $dinos);
            $total += $puntos;
            
            $detalles[$nombreZona] = [
                'puntos' => $puntos,
                'cantidad' => count($dinos)
            ];
        }
        
        return [
            'total' => $total,
            'detalles' => $detalles
        ];
    }
    
    private function calcularPorZona($nombreZona, $dinos) {
        switch($nombreZona) {
            case 'bosque-semejanza':
                return $this->calcularBosque($dinos);
            case 'prado-diferencia':
                return $this->calcularPrado($dinos);
            case 'trio-frondoso':
                return $this->calcularTrio($dinos);
            case 'pradera-amor':
                return $this->calcularPradera($dinos);
            case 'isla-solitaria':
            case 'rey-selva':
                return $this->calcularSolitaria($dinos);
            case 'dinos-rio':
                return $this->calcularRio($dinos);
            default:
                return 0;
        }
    }
    
    private function calcularBosque($dinos) {
        $cantidad = count($dinos);
        
        if ($cantidad == 0) {
            return 0;
        }
        
        $primerEspecie = reset($dinos);
        foreach ($dinos as $especie) {
            if ($especie != $primerEspecie) {
                return 0;
            }
        }
        
        return $this->obtenerPuntosTablaBasica($cantidad);
    }
    
    private function calcularPrado($dinos) {
        $cantidad = count($dinos);
        
        if ($cantidad == 0) {
            return 0;
        }
        
        $especiesUnicas = array_unique($dinos);
        if (count($especiesUnicas) != $cantidad) {
            return 0;
        }
        
        return $this->obtenerPuntosTablaBasica($cantidad);
    }
    
    private function calcularTrio($dinos) {
        return (count($dinos) == 3) ? 7 : 0;
    }
    
    private function calcularPradera($dinos) {
        $parejas = floor(count($dinos) / 2);
        return $parejas * 5;
    }
    
    private function calcularSolitaria($dinos) {
        return (count($dinos) == 1) ? 7 : 0;
    }
    
    private function calcularRio($dinos) {
        $cantidad = count($dinos);
        if ($cantidad >= count($this->tablaRio)) {
            return $this->tablaRio[count($this->tablaRio) - 1];
        }
        return $this->tablaRio[$cantidad];
    }
    
    private function obtenerPuntosTablaBasica($cantidad) {
        if ($cantidad >= count($this->tablaBasica)) {
            return $this->tablaBasica[count($this->tablaBasica) - 1];
        }
        return $this->tablaBasica[$cantidad];
    }
}
?>