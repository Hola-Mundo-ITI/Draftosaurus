<?php
class Mano {
    private $cartas; 
    
    public function __construct() {
        $this->cartas = [];
    }
    
    // Agregar una carta a la mano
    public function add($carta) {
        $this->cartas[] = $carta;
    }
    
    // Remover una carta por ID
    public function removeById($id) {
        foreach ($this->cartas as $index => $carta) {
            if ($carta->id === $id) {
                $cartaRemovida = $this->cartas[$index];
                array_splice($this->cartas, $index, 1);
                return $cartaRemovida;
            }
        }
        return null;
    }
    
    // Verificar si tiene una carta por ID
    public function has($id) {
        foreach ($this->cartas as $carta) {
            if ($carta->id === $id) {
                return true;
            }
        }
        return false;
    }
    
    // Obtener todas las cartas
    public function getAll() {
        return $this->cartas;
    }
}
?>