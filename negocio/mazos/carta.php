<?php
class Carta {
    public $id;        
    public $tipo;     
    public $especie;    
    public $nombre;    
    
    //crea carta desde array
    public function __construct($datos) {
        $this->id = $datos['id'] ?? '';
        $this->tipo = $datos['tipo'] ?? 'dino';
        $this->especie = isset($datos['especie']) ? (int)$datos['especie'] : null;
        $this->nombre = $datos['nombre'] ?? '';
    }

    public function toArray() {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'especie' => $this->especie,
            'nombre' => $this->nombre
        ];
    }
}