<?php
class Sesion {
    private $conexion;
    
    // Constructor que conecta a la base de datos
    public function __construct() {
        $servidor = "localhost";
        $usuario = "root";
        $clave = "";
        $baseDatos = "draftosaurus_db";

        $this->conexion = new mysqli($servidor, $usuario, $clave, $baseDatos);
        
        if ($this->conexion->connect_error) {
            die("Error de conexion: " . $this->conexion->connect_error);
        }

        $this->conexion->set_charset("utf8");
    }
    
    public function registrarUsuario($nombre, $email, $password) {
        $nombre = trim($nombre);
        $email = trim(strtolower($email));
        $password = trim($password);
        
        if (empty($nombre) || empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'Todos los campos son obligatorios'];
        }
        
        if (strlen($password) < 8) {
            return ['success' => false, 'error' => 'La contrasena debe tener minimo 8 caracteres'];
        }
    
        $consulta = "SELECT id FROM usuarios WHERE email = ?";
        $stmt = $this->conexion->prepare($consulta);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado->num_rows > 0) {
            $stmt->close();
            return ['success' => false, 'error' => 'Este correo ya esta registrado'];
        }
        $stmt->close();

        //hashea la contrasena
        $passwordEncriptado = password_hash($password, PASSWORD_DEFAULT);
        
        $consulta = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";
        $stmt = $this->conexion->prepare($consulta);
        $stmt->bind_param("sss", $nombre, $email, $passwordEncriptado);
        
        if ($stmt->execute()) {
            $idUsuario = $stmt->insert_id;
            $stmt->close();

            session_start();
            $_SESSION['usuario_id'] = $idUsuario;
            $_SESSION['usuario_nombre'] = $nombre;
            $_SESSION['usuario_email'] = $email;
            
            return ['success' => true, 'mensaje' => 'Usuario registrado correctamente'];
        } else {
            $stmt->close();
            return ['success' => false, 'error' => 'Error al registrar usuario'];
        }
    }
    
    public function iniciarSesion($email, $password) {
        $email = trim(strtolower($email));
        $password = trim($password);
        
        if (empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'Email y contrasena son obligatorios'];
        }
        
        $consulta = "SELECT id, nombre, email, password FROM usuarios WHERE email = ?";
        $stmt = $this->conexion->prepare($consulta);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado->num_rows === 0) {
            $stmt->close();
            return ['success' => false, 'error' => 'Usuario no encontrado'];
        }
        
        $usuario = $resultado->fetch_assoc();
        $stmt->close();
        //agarra la contrasena hasheada y compara con la sal de la contrasena 
        if (password_verify($password, $usuario['password'])) {
            session_start();
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nombre'] = $usuario['nombre'];
            $_SESSION['usuario_email'] = $usuario['email'];
            
            return [
                'success' => true,
                'mensaje' => 'Sesion iniciada correctamente',
                'usuario' => [
                    'id' => $usuario['id'],
                    'nombre' => $usuario['nombre'],
                    'email' => $usuario['email']
                ]
            ];
        } else {
            return ['success' => false, 'error' => 'Contrasena incorrecta'];
        }
    }
    
    public function cerrarSesion() {
        session_start();
        
        $_SESSION = array();
        
        // eliminar cockie
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        session_destroy();
        
        return ['success' => true, 'mensaje' => 'Sesion cerrada correctamente'];
    }

    public function verificarSesion() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (isset($_SESSION['usuario_id'])) {
            return [
                'activa' => true,
                'usuario' => [
                    'id' => $_SESSION['usuario_id'],
                    'nombre' => $_SESSION['usuario_nombre'],
                    'email' => $_SESSION['usuario_email']
                ]
            ];
        } else {
            return ['activa' => false];
        }
    }
    
    public function borrarUsuario($email, $password) {
        $email = trim(strtolower($email));
        $password = trim($password);
        
        if (empty($email) || empty($password)) {
            return ['success' => false, 'error' => 'Email y contrasena son obligatorios'];
        }

        $consulta = "SELECT id, password FROM usuarios WHERE email = ?";
        $stmt = $this->conexion->prepare($consulta);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado->num_rows === 0) {
            $stmt->close();
            return ['success' => false, 'error' => 'Usuario no encontrado'];
        }
        
        $usuario = $resultado->fetch_assoc();
        $stmt->close();
        
        if (!password_verify($password, $usuario['password'])) {
            return ['success' => false, 'error' => 'Contrasena incorrecta'];
        }
        
        $consulta = "DELETE FROM usuarios WHERE id = ?";
        $stmt = $this->conexion->prepare($consulta);
        $stmt->bind_param("i", $usuario['id']);
        
        if ($stmt->execute()) {
            $stmt->close();
            
            if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['usuario_id']) && $_SESSION['usuario_id'] == $usuario['id']) {
                $this->cerrarSesion();
            }
            
            return ['success' => true, 'mensaje' => 'Usuario borrado correctamente'];
        } else {
            $stmt->close();
            return ['success' => false, 'error' => 'Error al borrar usuario'];
        }
    }
    
    public function __destruct() {
        if ($this->conexion) {
            $this->conexion->close();
        }
    }
}