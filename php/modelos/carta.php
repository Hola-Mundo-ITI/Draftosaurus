<?php
// php/modelos/Carta.php
// Representa una carta del juego (dinosaurio o especial)

class Carta {
    public $id;         // Identificador único de la carta (ej: "c1", "c2")
    public $tipo;       // "dino" o "especial"
    public $especie;    // Número del dinosaurio (1-6) o null si es especial
    public $nombre;     // Nombre descriptivo (ej: "Dino 1", "Carta Especial")
    
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