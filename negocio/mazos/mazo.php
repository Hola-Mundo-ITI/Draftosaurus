<?php
class Mazo {
    private $cartas; // Array de Carta
    
    public function __construct($cartas = []) {
        $this->cartas = $cartas;
    }
    
    public function barajar() {
        shuffle($this->cartas);
    }
    
    public function robar($n = 1) {
        $robadas = [];
        for ($i = 0; $i < $n && count($this->cartas) > 0; $i++) {
            $robadas[] = array_shift($this->cartas);
        }
        return $robadas;
    }
    public function contar() {
        return count($this->cartas);
    }
}
?>