<?php
// Representa una carta del juego (dinosaurio)

class Carta {
    public $id;         // Identificador único de la carta (ej: "c1", "c2")
    public $tipo;       // "dino"
    public $especie;    // Número del dinosaurio (1-6)
    public $nombre;     // Nombre descriptivo 
    
    // Constructor: crear carta desde array
    public function __construct($datos) {
        $this->id = $datos['id'] ?? '';
        $this->tipo = $datos['tipo'] ?? 'dino';
        $this->especie = isset($datos['especie']) ? (int)$datos['especie'] : null;
        $this->nombre = $datos['nombre'] ?? '';
    }
    
    // Convertir carta a array (para enviar por JSON)
    public function toArray() {
        return [
            'id' => $this->id,
            'tipo' => $this->tipo,
            'especie' => $this->especie,
            'nombre' => $this->nombre
        ];
    }
}