<?php
function obtenerIdioma() {
    if (!isset($_SESSION)) {
        session_start();
    }
    
    if (!isset($_SESSION['idioma'])) {
        $_SESSION['idioma'] = 'es';
    }
    
    return $_SESSION['idioma'];
}

function cambiarIdioma($nuevoIdioma) {
    if (!isset($_SESSION)) {
        session_start();
    }
    
    if ($nuevoIdioma === 'es' || $nuevoIdioma === 'en') {
        $_SESSION['idioma'] = $nuevoIdioma;
        return true;
    }
    
    return false;
}

function traducir($clave) {
    $idioma = obtenerIdioma();
    
    $traducciones = [
        'es' => [
            // Navegacion
            'menu_inicio' => 'Inicio',
            'menu_fisica' => 'Partida Fisica',
            'menu_digital' => 'Partida Digital',
            'menu_configuracion' => 'Configuracion',
            'menu_cerrar_sesion' => 'Cerrar Sesion',
            
            // Index
            'bienvenido' => 'Bienvenido a',
            'como_jugar' => '¿Como queres jugar?',
            'modo_fisico' => 'Modo Fisico',
            'modo_digital' => 'Modo Digital',
            
            // Sesion
            'iniciar_sesion' => 'Iniciar Sesion',
            'crear_cuenta' => 'Crear Cuenta',
            'correo' => 'Correo electronico',
            'contrasena' => 'Contraseña',
            'nombre_usuario' => 'Nombre de usuario',
            'confirmar_contrasena' => 'Confirmar tu contraseña',
            'no_tienes_cuenta' => '¿No tenes cuenta?',
            'registrate' => 'Registrate',
            'ya_tienes_cuenta' => '¿Ya tenes cuenta?',
            'volver_login' => 'Volver a iniciar sesion',
            'ingresa_correo' => 'Ingresa tu correo electronico',
            'ingresa_contrasena' => 'Ingresa tu contraseña',
            'elige_nombre' => 'Elige un nombre unico',
            'correo_acceso' => 'Tu correo para acceder',
            'minimo_caracteres' => 'Minimo 8 caracteres',
            'repite_contrasena' => 'Repite la contraseña',
            'datos_acceso' => 'Datos de acceso',
            'datos_nueva_cuenta' => 'Datos para nueva cuenta',
            'crea_cuenta' => 'Crea una nueva cuenta',
            'accede_cuenta' => 'Accede con tu cuenta existente',
            
            // Seleccionar Jugador
            'configurar_partida' => 'Configurar Partida Multijugador',
            'cantidad_jugadores' => 'Cantidad de Jugadores:',
            'seleccionar' => 'Seleccionar...',
            'jugador' => 'Jugador',
            'jugadores' => 'Jugadores',
            'nombre_jugador' => 'Nombre del jugador',
            'iniciar_partida' => 'Iniciar Partida',
            
            // Digital
            'turno_de' => 'Turno de:',
            'ronda' => 'Ronda:',
            'pasar_turno' => 'Pasar Turno',
            'exportar' => 'Exportar',
            
            // Fisico
            'registra_tablero' => 'Registra lo que pasa en tu tablero:',
            'bosque_semejanza' => 'Bosque de la Semejanza',
            'prado_diferencia' => 'Prado de la Diferencia',
            'trio_frondoso' => 'El Trio Frondoso',
            'pradera_amor' => 'La Pradera del Amor',
            'isla_solitaria' => 'La Isla Solitaria',
            'rey_selva' => 'El Rey de la Selva',
            'dinos_rio' => 'Dinosaurios en el Rio',
            'total_dinos' => 'Total de dinosaurios:',
            'calcular' => 'Calcular',
            'limpiar' => 'Limpiar',
            
            // Configuracion
            'configuracion' => 'Configuracion',
            'seleccionar_idioma' => 'Seleccionar Idioma',
            'espanol' => 'Español',
            'ingles' => 'Ingles',
            'guardar_cambios' => 'Guardar Cambios',
            'cambios_guardados' => 'Cambios guardados correctamente',
            
            // Puntuacion
            'ver_puntos' => 'Ver Puntos',
            'puntuacion' => 'Puntuacion',
            'total' => 'Total:',
            'zona' => 'Zona',
            'dinos' => 'Dinos',
            'puntos' => 'Puntos',
            'cerrar' => 'Cerrar',
            'resultado_puntuacion' => 'Resultado de Puntuacion',
            'puntuacion_total' => 'Puntuacion Total:',
            'desglose_zona' => 'Desglose por Zona:',
            
            // Mensajes
            'debe_lanzar_dado' => 'Debes lanzar el dado antes de pasar turno',
            'debe_colocar_dino' => 'Debes colocar un dinosaurio antes de pasar turno',
            'ronda_completada' => 'Ronda completada! Los mazos rotaron al siguiente jugador',
            'partida_finalizada' => 'Partida finalizada Mostrando resultados',
            'nueva_partida' => 'Quieres iniciar una nueva partida?',
            'completa_nombres' => 'Por favor completa todos los nombres',
            'no_jugadores' => 'No hay jugadores configurados. Redirigiendo...',
            'ya_lanzaste_dado' => 'Ya lanzaste el dado en este turno. Coloca tu dinosaurio y pasa turno',
            'partida_guardada' => 'Partida guardada correctamente',
            'pts' => 'pts',
            'error' => 'Error',
            'exito' => 'Exito',
            
            // Descripciones de zonas para puntuacion
            'desc_bosque' => 'Puntos por dinosaurios del mismo tipo',
            'desc_prado' => 'Puntos por variedad de tipos',
            'desc_trio' => '7 puntos si tiene exactamente 3 dinosaurios',
            'desc_pradera' => 'Puntos por parejas completas',
            'desc_isla' => '7 puntos por el dinosaurio solitario',
            'desc_rey' => 'Puntos por el dinosaurio mas grande',
            'desc_rio' => 'Puntos por secuencia en el rio'
        ],
        'en' => [
            // Navigation
            'menu_inicio' => 'Home',
            'menu_fisica' => 'Physical Game',
            'menu_digital' => 'Digital Game',
            'menu_configuracion' => 'Settings',
            'menu_cerrar_sesion' => 'Log Out',
            
            // Index
            'bienvenido' => 'Welcome to',
            'como_jugar' => 'How do you want to play?',
            'modo_fisico' => 'Physical Mode',
            'modo_digital' => 'Digital Mode',
            
            // Session
            'iniciar_sesion' => 'Log In',
            'crear_cuenta' => 'Create Account',
            'correo' => 'Email',
            'contrasena' => 'Password',
            'nombre_usuario' => 'Username',
            'confirmar_contrasena' => 'Confirm your password',
            'no_tienes_cuenta' => 'Don\'t have an account?',
            'registrate' => 'Sign Up',
            'ya_tienes_cuenta' => 'Already have an account?',
            'volver_login' => 'Back to log in',
            'ingresa_correo' => 'Enter your email',
            'ingresa_contrasena' => 'Enter your password',
            'elige_nombre' => 'Choose a unique name',
            'correo_acceso' => 'Your email to access',
            'minimo_caracteres' => 'Minimum 8 characters',
            'repite_contrasena' => 'Repeat the password',
            'datos_acceso' => 'Access credentials',
            'datos_nueva_cuenta' => 'New account details',
            'crea_cuenta' => 'Create a new account',
            'accede_cuenta' => 'Access with your existing account',
            
            // seleccionar jugador
            'configurar_partida' => 'Configure Multiplayer Game',
            'cantidad_jugadores' => 'Number of Players:',
            'seleccionar' => 'Select...',
            'jugador' => 'Player',
            'jugadores' => 'Players',
            'nombre_jugador' => 'Player name',
            'iniciar_partida' => 'Start Game',
            
            // Digital
            'turno_de' => 'Turn of:',
            'ronda' => 'Round:',
            'pasar_turno' => 'Pass Turn',
            'exportar' => 'Export',
            
            // Physical
            'registra_tablero' => 'Record what happens on your board:',
            'bosque_semejanza' => 'Forest of Similarity',
            'prado_diferencia' => 'Meadow of Difference',
            'trio_frondoso' => 'The Leafy Trio',
            'pradera_amor' => 'The Love Meadow',
            'isla_solitaria' => 'The Lonely Island',
            'rey_selva' => 'The King of the Jungle',
            'dinos_rio' => 'Dinosaurs in the River',
            'total_dinos' => 'Total dinosaurs:',
            'calcular' => 'Calculate',
            'limpiar' => 'Clear',
            
            // Configuration
            'configuracion' => 'Settings',
            'seleccionar_idioma' => 'Select Language',
            'espanol' => 'Spanish',
            'ingles' => 'English',
            'guardar_cambios' => 'Save Changes',
            'cambios_guardados' => 'Changes saved successfully',
            
            // puntos
            'ver_puntos' => 'View Points',
            'puntuacion' => 'Score',
            'total' => 'Total:',
            'zona' => 'Zone',
            'dinos' => 'Dinos',
            'puntos' => 'Points',
            'cerrar' => 'Close',
            'resultado_puntuacion' => 'Score Result',
            'puntuacion_total' => 'Total Score:',
            'desglose_zona' => 'Breakdown by Zone:',
            
            // Mensaje
            'debe_lanzar_dado' => 'You must roll the dice before passing turn',
            'debe_colocar_dino' => 'You must place a dinosaur before passing turn',
            'ronda_completada' => 'Round completed! The decks rotated to the next player',
            'partida_finalizada' => 'Game finished Showing results',
            'nueva_partida' => 'Do you want to start a new game?',
            'completa_nombres' => 'Please complete all names',
            'no_jugadores' => 'No players configured. Redirecting...',
            'ya_lanzaste_dado' => 'You already rolled the dice this turn. Place your dinosaur and pass turn',
            'partida_guardada' => 'Game saved successfully',
            'pts' => 'pts',
            'error' => 'Error',
            'exito' => 'Success',
            
            //descripcion zona puntuacion
            'desc_bosque' => 'Points for same type dinosaurs',
            'desc_prado' => 'Points for variety of types',
            'desc_trio' => '7 points if exactly 3 dinosaurs',
            'desc_pradera' => 'Points for complete pairs',
            'desc_isla' => '7 points for the solitary dinosaur',
            'desc_rey' => 'Points for the biggest dinosaur',
            'desc_rio' => 'Points for river sequence'
        ]
    ];
    
    if (isset($traducciones[$idioma][$clave])) {
        return $traducciones[$idioma][$clave];
    }
    
    return $clave;
}

function t($clave) {
    return traducir($clave);
}
?>