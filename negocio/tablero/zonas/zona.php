<?php
class Zona {
    protected $nombre;
    protected $capacidad;
    protected $casillas;
    protected $dinos;
    protected $orden;
    
    public function __construct($nombre, $capacidad, $casillas, $orden) {
        $this->nombre = $nombre;
        $this->capacidad = $capacidad;
        $this->casillas = $casillas;
        $this->dinos = [];
        $this->orden = $orden;
    }
    
    public function getNombre() {
        return $this->nombre;
    }
    
    public function getDinos() {
        return $this->dinos;
    }
    
    public function getCasillas() {
        return $this->casillas;
    }
    
    public function agregarDino($casillaId, $dino) {
        $this->dinos[$casillaId] = $dino;
    }
    
    public function estaLlena() {
        return count($this->dinos) >= $this->capacidad;
    }
    
    public function tieneDino($casillaId) {
        return isset($this->dinos[$casillaId]);
    }
    
    public function validarOrden($casillaId) {
        if ($this->orden === 'libre') {
            return ['valido' => true];
        }
        
        $cantidadDinos = count($this->dinos);
        $casillaNecesaria = $this->casillas[$cantidadDinos];
        
        if ($casillaId !== $casillaNecesaria) {
            return [
                'valido' => false, 
                'razon' => "Debes llenar de izquierda a derecha. La proxima casilla disponible es: $casillaNecesaria"
            ];
        }
        return ['valido' => true];
    }
    
    public function validarRegla($dino) {
        return ['valido' => true];
    }
    
    public function calcularPuntos() {
        return 0;
    }
    
    protected function obtenerPuntosPorCantidad($cantidad) {
        $tabla = [0, 1, 3, 6, 10, 15, 21];
        if ($cantidad >= count($tabla)) {
            return $tabla[count($tabla) - 1];
        }
        return $tabla[$cantidad];
    }
}

class ZonaTodosIguales extends Zona {
    
    public function validarRegla($dino) {
        if (empty($this->dinos)) {
            return ['valido' => true];
        }
        
        $especieExistente = reset($this->dinos);
        
        if ($especieExistente != $dino) {
            return ['valido' => false, 'razon' => "Solo puedes colocar dinosaurios tipo $especieExistente aqui"];
        }
        
        return ['valido' => true];
    }
    
    public function calcularPuntos() {
        $cantidad = count($this->dinos);
        
        if ($cantidad == 0) {
            return 0;
        }
        
        $primerEspecie = reset($this->dinos);
        foreach ($this->dinos as $especie) {
            if ($especie != $primerEspecie) {
                return 0;
            }
        }
        
        return $this->obtenerPuntosPorCantidad($cantidad);
    }
}

class ZonaTodosDiferentes extends Zona {
    
    public function validarRegla($dino) {
        foreach ($this->dinos as $dinoExistente) {
            if ($dinoExistente == $dino) {
                return ['valido' => false, 'razon' => "Ya hay un dinosaurio tipo $dino en esta zona (deben ser todos diferentes)"];
            }
        }
        
        return ['valido' => true];
    }
    
    public function calcularPuntos() {
        $cantidad = count($this->dinos);
        
        if ($cantidad == 0) {
            return 0;
        }
        
        $especiesUnicas = array_unique($this->dinos);
        if (count($especiesUnicas) != $cantidad) {
            return 0;
        }
        
        return $this->obtenerPuntosPorCantidad($cantidad);
    }
}

class ZonaTrio extends Zona {
    
    public function calcularPuntos() {
        $cantidad = count($this->dinos);
        return ($cantidad == 3) ? 7 : 0;
    }
}

class ZonaPradera extends Zona {
    
    public function calcularPuntos() {
        $cantidad = count($this->dinos);
        $parejas = floor($cantidad / 2);
        return $parejas * 5;
    }
}

class ZonaSolitaria extends Zona {
    
    public function calcularPuntos() {
        $cantidad = count($this->dinos);
        return ($cantidad == 1) ? 7 : 0;
    }
}

class ZonaRio extends Zona {
    
    public function validarRegla($dino) {
        return ['valido' => true];
    }
    
    public function calcularPuntos() {
        $cantidad = count($this->dinos);
        $tabla = [0, 1, 3, 6, 10, 15, 21, 28];
        if ($cantidad >= count($tabla)) {
            return $tabla[count($tabla) - 1];
        }
        return $tabla[$cantidad];
    }
}
?>