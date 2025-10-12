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
    public $descarte;  // Array simple de descartadas
    
    public function __construct($id, $nombre, $mazo = null) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->mazo = $mazo ?? new Mazo([]);
        $this->mano = new Mano();
        $this->descarte = [];
    }
    
    public function robar($n = 1) {
        $cartasRobadas = $this->mazo->robar($n);
        foreach ($cartasRobadas as $carta) {
            $this->mano->add($carta);
        }
        return $cartasRobadas;
    }
    
    public function puedeJugar($carta, $casillaId, $tablero, $restriccion = null) {
        if (!$this->mano->has($carta->id)) {
            return [
                'valido' => false,
                'razon' => 'No tienes esa carta en tu mano'
            ];
        }
        
        if ($carta->tipo === 'especial') {
            return ['valido' => true];
        }
        
        if ($carta->tipo === 'dino' && $carta->especie !== null) {
            return $tablero->puedoColocar($casillaId, $carta->especie, $restriccion);
        }
        
        return [
            'valido' => false,
            'razon' => 'Carta inválida'
        ];
    }
    
    public function jugarCarta($carta, $casillaId, $tablero, $restriccion = null) {
        $validacion = $this->puedeJugar($carta, $casillaId, $tablero, $restriccion);
        
        if (!$validacion['valido']) {
            return $validacion;
        }
        
        $cartaJugada = $this->mano->removeById($carta->id);
        
        if ($cartaJugada) {
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