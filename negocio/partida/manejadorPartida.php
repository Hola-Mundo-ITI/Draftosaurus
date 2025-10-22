<?php
class ManejadorPartida {
    private $sesionIniciada;
    
    public function __construct() {
        $this->sesionIniciada = false;
        $this->iniciarSesion();
    }
    
    private function iniciarSesion() {
        if (!$this->sesionIniciada && session_status() === PHP_SESSION_NONE) {
            session_start();
            $this->sesionIniciada = true;
        }
    }
    
    public function inicializar($jugadores) {
        $this->iniciarSesion();
        
        $_SESSION['partida'] = [
            'jugadores' => $jugadores,
            'turnoActual' => 1,
            'rondaActual' => 1,
            'tableros' => [],
            'mazos' => []
        ];
        
        foreach ($jugadores as $jugador) {
            $_SESSION['partida']['tableros'][$jugador['id']] = $this->crearTableroVacio();
            $_SESSION['partida']['mazos'][$jugador['id']] = $this->crearMazoVacio();
        }
        
        return $_SESSION['partida'];
    }
    
    private function crearTableroVacio() {
        return [
            'casillas' => [],
            'dinosUsados' => [
                1 => false,
                2 => false,
                3 => false,
                4 => false,
                5 => false,
                6 => false
            ]
        ];
    }
    
    private function crearMazoVacio() {
        return [
            1 => false,
            2 => false,
            3 => false,
            4 => false,
            5 => false,
            6 => false
        ];
    }
    
    public function guardarTablero($jugadorId, $tablero) {
        $this->iniciarSesion();
        
        if (!$this->existePartida()) {
            return false;
        }
        
        $_SESSION['partida']['tableros'][$jugadorId] = $tablero;
        return true;
    }
    
    public function cargarTablero($jugadorId) {
        $this->iniciarSesion();
        
        if (!$this->existePartida()) {
            return null;
        }
        
        if (isset($_SESSION['partida']['tableros'][$jugadorId])) {
            return $_SESSION['partida']['tableros'][$jugadorId];
        }
        
        return $this->crearTableroVacio();
    }
    
    public function siguienteTurno() {
        $this->iniciarSesion();
        
        if (!$this->existePartida()) {
            return null;
        }
        
        $partida = &$_SESSION['partida'];
        $cantidadJugadores = count($partida['jugadores']);
        
        $partida['turnoActual']++;
        
        $rondaCompletada = false;
        if ($partida['turnoActual'] > $cantidadJugadores) {
            $partida['turnoActual'] = 1;
            $partida['rondaActual']++;
            $rondaCompletada = true;
        }
        
        $partidaFinalizada = $partida['rondaActual'] > 12;
        
        $jugadorActual = null;
        if (!$partidaFinalizada) {
            $jugadorActual = $this->obtenerJugadorPorId($partida['turnoActual']);
        }
        
        return [
            'turnoActual' => $partida['turnoActual'],
            'rondaActual' => $partida['rondaActual'],
            'jugadorActual' => $jugadorActual,
            'partidaFinalizada' => $partidaFinalizada,
            'rondaCompletada' => $rondaCompletada
        ];
    }
    
    private function obtenerJugadorPorId($id) {
        foreach ($_SESSION['partida']['jugadores'] as $jugador) {
            if ($jugador['id'] == $id) {
                return $jugador;
            }
        }
        return null;
    }
    
    public function rotarMazos() {
        $this->iniciarSesion();
        
        if (!$this->existePartida()) {
            return false;
        }
        
        $partida = &$_SESSION['partida'];
        $cantidadJugadores = count($partida['jugadores']);
        
        $mazosActuales = [];
        foreach ($partida['jugadores'] as $jugador) {
            $mazosActuales[$jugador['id']] = $partida['tableros'][$jugador['id']]['dinosUsados'];
        }
        
        foreach ($partida['jugadores'] as $jugador) {
            $idActual = $jugador['id'];
            $idSiguiente = ($idActual % $cantidadJugadores) + 1;
            $partida['tableros'][$idSiguiente]['dinosUsados'] = $mazosActuales[$idActual];
        }
        
        return true;
    }
    
    public function obtenerEstado() {
        $this->iniciarSesion();
        
        if (!$this->existePartida()) {
            return null;
        }
        
        return $_SESSION['partida'];
    }
    
    public function finalizar() {
        $this->iniciarSesion();
        
        if (!$this->existePartida()) {
            return null;
        }
        
        $resultados = [];
        
        foreach ($_SESSION['partida']['jugadores'] as $jugador) {
            $tablero = $_SESSION['partida']['tableros'][$jugador['id']];
            
            $resultados[] = [
                'jugador' => $jugador['nombre'],
                'id' => $jugador['id'],
                'tablero' => $tablero
            ];
        }
        
        unset($_SESSION['partida']);
        
        return $resultados;
    }
    
    private function existePartida() {
        return isset($_SESSION['partida']);
    }
}
?>