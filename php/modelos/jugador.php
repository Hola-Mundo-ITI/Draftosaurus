<?php
require_once __DIR__ . '/Carta.php';
require_once __DIR__ . '/Mazo.php';
require_once __DIR__ . '/Mano.php';
require_once __DIR__ . '/../tablero.php';

class Jugador {
    public $id;
    public $nombre;
    public $mazo;      // Objeto Mazo
    public $mano;      // Objeto Mano
    public $descarte;  // Array simple de cartas descartadas
    
    public function __construct($id, $nombre, $mazo = null) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->mazo = $mazo ?? new Mazo([]);
        $this->mano = new Mano();
        $this->descarte = [];
    }
    
    // Robar n cartas del mazo a la mano
    public function robar($n = 1) {
        $cartasRobadas = $this->mazo->robar($n);
        foreach ($cartasRobadas as $carta) {
            $this->mano->add($carta);
        }
        return $cartasRobadas;
    }
    
    // Validar si puede jugar una carta en una casilla
    public function puedeJugar($carta, $casillaId, $tablero, $restriccion = null) {
        // Verificar que la carta esté en la mano
        if (!$this->mano->has($carta->id)) {
            return [
                'valido' => false,
                'razon' => 'No tienes esa carta en tu mano'
            ];
        }
        
        // Si es carta especial, permitir (lógica básica por ahora)
        if ($carta->tipo === 'especial') {
            return ['valido' => true];
        }
        
        // Si es carta de dinosaurio, validar con el tablero
        if ($carta->tipo === 'dino' && $carta->especie !== null) {
            return $tablero->puedoColocar($casillaId, $carta->especie, $restriccion);
        }
        
        return [
            'valido' => false,
            'razon' => 'Carta inválida'
        ];
    }
    
    // Jugar una carta (colocarla y moverla al descarte)
    public function jugarCarta($carta, $casillaId, $tablero, $restriccion = null) {
        $validacion = $this->puedeJugar($carta, $casillaId, $tablero, $restriccion);
        
        if (!$validacion['valido']) {
            return $validacion;
        }
        
        // Remover de la mano
        $cartaJugada = $this->mano->removeById($carta->id);
        
        if ($cartaJugada) {
            // Agregar al descarte
            $this->descarte[] = $cartaJugada;
            return ['valido' => true];
        }
        
        return [
            'valido' => false,
            'razon' => 'Error al jugar la carta'
        ];
    }
}
?>