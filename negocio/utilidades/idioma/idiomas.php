<?php
class Traductor {
    private $idioma;
    private $traducciones;
    private $idiomasDisponibles;
    
    public function __construct() {
        $this->idiomasDisponibles = ['es', 'en'];
        $this->cargarTraducciones();
        $this->cargarIdioma();
    }
    
    private function cargarIdioma() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION['idioma'])) {
            $_SESSION['idioma'] = 'es';
        }
        
        $this->idioma = $_SESSION['idioma'];
    }
    
    public function cambiarIdioma($nuevoIdioma) {
        if (!in_array($nuevoIdioma, $this->idiomasDisponibles)) {
            return false;
        }
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['idioma'] = $nuevoIdioma;
        $this->idioma = $nuevoIdioma;
        return true;
    }
    
    public function obtenerIdioma() {
        return $this->idioma;
    }
    
    private function cargarTraducciones() {
        $this->traducciones = [
            'es' => $this->obtenerTraduccionesEspanol(),
            'en' => $this->obtenerTraduccionesIngles()
        ];
    }
    
    private function obtenerTraduccionesEspanol() {
        return [
            // Menú
            'menu_inicio' => 'Inicio',
            'menu_fisica' => 'Partida Fisica',
            'menu_digital' => 'Partida Digital',
            'menu_configuracion' => 'Configuracion',
            'menu_cerrar_sesion' => 'Cerrar Sesion',
            
            // Inicio
            'bienvenido' => 'Bienvenido a',
            'como_jugar' => 'Como queres jugar?',
            'modo_fisico' => 'Modo Fisico',
            'modo_digital' => 'Modo Digital',
            
            // Sesión
            'iniciar_sesion' => 'Iniciar Sesion',
            'crear_cuenta' => 'Crear Cuenta',
            'correo' => 'Correo electronico',
            'contrasena' => 'Contrasena',
            'nombre_usuario' => 'Nombre de usuario',
            'confirmar_contrasena' => 'Confirmar tu contrasena',
            'no_tienes_cuenta' => 'No tienes cuenta?',
            'registrate' => 'Registrate',
            'ya_tienes_cuenta' => 'Ya tienes cuenta?',
            'volver_login' => 'Volver al login',
            'datos_acceso' => 'Datos de acceso',
            'datos_nueva_cuenta' => 'Datos de nueva cuenta',
            'ingresa_correo' => 'Ingresa tu correo electronico',
            'ingresa_contrasena' => 'Ingresa tu contrasena',
            'crea_cuenta' => 'Crea tu cuenta',
            'elige_nombre' => 'Elige un nombre de usuario',
            'correo_acceso' => 'Tu correo para acceder',
            'minimo_caracteres' => 'Minimo 8 caracteres',
            'repite_contrasena' => 'Repite tu contrasena',
            'accede_cuenta' => 'Accede a tu cuenta',
            
            // Configuración
            'configuracion' => 'Configuracion',
            'seleccionar_idioma' => 'Seleccionar idioma',
            'espanol' => 'Espanol',
            'ingles' => 'Ingles',
            'guardar_cambios' => 'Guardar cambios',
            
            // Seleccionar jugadores
            'configurar_partida' => 'Configurar Partida',
            'cantidad_jugadores' => 'Cantidad de jugadores',
            'seleccionar' => 'Seleccionar',
            'jugador' => 'Jugador',
            'jugadores' => 'Jugadores',
            'iniciar_partida' => 'Iniciar Partida',
            
            // Zonas del tablero
            'bosque_semejanza' => 'Bosque de la Semejanza',
            'prado_diferencia' => 'Prado de la Diferencia',
            'trio_frondoso' => 'El Trio Frondoso',
            'pradera_amor' => 'La Pradera del Amor',
            'isla_solitaria' => 'La Isla Solitaria',
            'rey_selva' => 'El Rey de la Selva',
            'dinos_rio' => 'Dinosaurios en el Rio',
            
            // Físico
            'registra_tablero' => 'Registra tu Tablero',
            'calcular' => 'Calcular',
            'limpiar' => 'Limpiar',
            'total_dinos' => 'Total de dinosaurios:',
            
            // Digital
            'ronda' => 'Ronda',
            'pasar_turno' => 'Pasar Turno',
            'exportar' => 'Exportar',
            
            // Puntuación
            'ver_puntos' => 'Ver Puntos',
            'puntuacion' => 'Puntuacion',
            'total' => 'Total',
            'zona' => 'Zona',
            'dinos' => 'Dinos',
            'puntos' => 'Puntos',
            'pts' => 'pts',
            'cerrar' => 'Cerrar',
            'resultado_puntuacion' => 'Resultado de Puntuacion',
            'puntuacion_total' => 'Puntuacion Total:',
            'desglose_zona' => 'Desglose por Zona:',
            
            // Descripciones de zonas
            'desc_bosque' => 'Puntos por dinosaurios del mismo tipo',
            'desc_prado' => 'Puntos por variedad de tipos',
            'desc_trio' => '7 puntos si tiene exactamente 3 dinosaurios',
            'desc_pradera' => 'Puntos por parejas completas',
            'desc_isla' => '7 puntos por el dinosaurio solitario',
            'desc_rey' => 'Puntos por el dinosaurio mas grande',
            'desc_rio' => 'Puntos por secuencia en el rio',
            
            // Mensajes de juego
            'debe_lanzar_dado' => 'Debes lanzar el dado antes de pasar turno',
            'debe_colocar_dino' => 'Debes colocar un dinosaurio antes de pasar turno',
            'ya_lanzaste_dado' => 'Ya lanzaste el dado en este turno. Coloca tu dinosaurio y pasa turno',
            'ronda_completada' => 'Ronda completada! Los mazos rotaron al siguiente jugador',
            'partida_finalizada' => 'Partida finalizada! Mostrando resultados',
            'nueva_partida' => 'Quieres iniciar una nueva partida?',
            'turno_de' => 'Turno de:',
            'completa_nombres' => 'Por favor completa todos los nombres',
            'no_jugadores' => 'No hay jugadores configurados. Redirigiendo...',
            'partida_guardada' => 'Partida guardada correctamente'
        ];
    }
    
    private function obtenerTraduccionesIngles() {
        return [
         
            'menu_inicio' => 'Home',
            'menu_fisica' => 'Physical Game',
            'menu_digital' => 'Digital Game',
            'menu_configuracion' => 'Settings',
            'menu_cerrar_sesion' => 'Log Out',

            'bienvenido' => 'Welcome to',
            'como_jugar' => 'How do you want to play?',
            'modo_fisico' => 'Physical Mode',
            'modo_digital' => 'Digital Mode',
            
           
            'iniciar_sesion' => 'Log In',
            'crear_cuenta' => 'Create Account',
            'correo' => 'Email',
            'contrasena' => 'Password',
            'nombre_usuario' => 'Username',
            'confirmar_contrasena' => 'Confirm your password',
            'no_tienes_cuenta' => 'Don\'t have an account?',
            'registrate' => 'Sign up',
            'ya_tienes_cuenta' => 'Already have an account?',
            'volver_login' => 'Back to login',
            'datos_acceso' => 'Access data',
            'datos_nueva_cuenta' => 'New account data',
            'ingresa_correo' => 'Enter your email',
            'ingresa_contrasena' => 'Enter your password',
            'crea_cuenta' => 'Create your account',
            'elige_nombre' => 'Choose a username',
            'correo_acceso' => 'Your email to access',
            'minimo_caracteres' => 'Minimum 8 characters',
            'repite_contrasena' => 'Repeat your password',
            'accede_cuenta' => 'Access your account',
            
           
            'configuracion' => 'Settings',
            'seleccionar_idioma' => 'Select language',
            'espanol' => 'Spanish',
            'ingles' => 'English',
            'guardar_cambios' => 'Save changes',
            
           
            'configurar_partida' => 'Configure Game',
            'cantidad_jugadores' => 'Number of players',
            'seleccionar' => 'Select',
            'jugador' => 'Player',
            'jugadores' => 'Players',
            'iniciar_partida' => 'Start Game',
            
        
            'bosque_semejanza' => 'Forest of Similarity',
            'prado_diferencia' => 'Meadow of Difference',
            'trio_frondoso' => 'The Leafy Trio',
            'pradera_amor' => 'The Love Meadow',
            'isla_solitaria' => 'The Lonely Island',
            'rey_selva' => 'The King of the Jungle',
            'dinos_rio' => 'Dinosaurs in the River',
            
            
            'registra_tablero' => 'Register your Board',
            'calcular' => 'Calculate',
            'limpiar' => 'Clear',
            'total_dinos' => 'Total dinosaurs:',
            
            
            'ronda' => 'Round',
            'pasar_turno' => 'Pass Turn',
            'exportar' => 'Export',
            
            
            'ver_puntos' => 'View Points',
            'puntuacion' => 'Score',
            'total' => 'Total',
            'zona' => 'Zone',
            'dinos' => 'Dinos',
            'puntos' => 'Points',
            'pts' => 'pts',
            'cerrar' => 'Close',
            'resultado_puntuacion' => 'Score Result',
            'puntuacion_total' => 'Total Score:',
            'desglose_zona' => 'Breakdown by Zone:',
            
          
            'desc_bosque' => 'Points for same type dinosaurs',
            'desc_prado' => 'Points for variety of types',
            'desc_trio' => '7 points if exactly 3 dinosaurs',
            'desc_pradera' => 'Points for complete pairs',
            'desc_isla' => '7 points for the solitary dinosaur',
            'desc_rey' => 'Points for the biggest dinosaur',
            'desc_rio' => 'Points for river sequence',
            
        
            'debe_lanzar_dado' => 'You must roll the dice before passing turn',
            'debe_colocar_dino' => 'You must place a dinosaur before passing turn',
            'ya_lanzaste_dado' => 'You already rolled the dice this turn. Place your dinosaur and pass turn',
            'ronda_completada' => 'Round completed! The decks rotated to the next player',
            'partida_finalizada' => 'Game finished! Showing results',
            'nueva_partida' => 'Do you want to start a new game?',
            'turno_de' => 'Turn of:',
            'completa_nombres' => 'Please complete all names',
            'no_jugadores' => 'No players configured. Redirecting...',
            'partida_guardada' => 'Game saved successfully'
        ];
    }
    public function traducir($clave) {
        if (isset($this->traducciones[$this->idioma][$clave])) {
            return $this->traducciones[$this->idioma][$clave];
        }
        return $clave;
    }
    
    public function obtenerTodasTraducciones() {
        return $this->traducciones[$this->idioma];
    }
    
    public function obtenerIdiomasDisponibles() {
        return $this->idiomasDisponibles;
    }
}
$traductor = new Traductor();
function t($clave) {
    global $traductor;
    return $traductor->traducir($clave);
}

function obtenerIdioma() {
    global $traductor;
    return $traductor->obtenerIdioma();
}
?>