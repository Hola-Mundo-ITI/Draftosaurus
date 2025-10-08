<?php
class Mazo {
    private $cartas; // Array de objetos Carta
    
    public function __construct($cartas = []) {
        $this->cartas = $cartas;
    }
    
    // Barajar las cartas
    public function barajar() {
        shuffle($this->cartas);
    }
    
    // Robar n cartas del mazo
    public function robar($n = 1) {
        $robadas = [];
        for ($i = 0; $i < $n && count($this->cartas) > 0; $i++) {
            $robadas[] = array_shift($this->cartas);
        }
        return $robadas;
    }
    
    // Contar cartas restantes
    public function contar() {
        return count($this->cartas);
    }
}
?>