<?php
session_start();
require_once 'negocio/utilidades/idioma/idiomas.php';
$pageTitle = t('iniciar_sesion') . " - Draftosaurus";
$pageDescription = "Iniciar sesion o crear cuenta en Draftosaurus";
$specificCSS = "utilidades/responsive.css";
$specificCSS = "sesion.css";
$specificJS = "auth/sesion.js";

include 'php/includes/head.php';
?>
<?php include __DIR__ . '/php/includes/navigation.php'; ?>
  <main role="main">
    <section class="pantalla" id="seccion-login">
      <div class="caja-formulario">
        <header class="form-header">
          <img src="Recursos/img/logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="imagen-logo" width="150px">
          <h1><?php echo t('iniciar_sesion'); ?></h1>
        </header>
        
        <form id="form-iniciarSesion" aria-label="Formulario de inicio de sesion" method="post">
          <fieldset>
            <legend class="visually-hidden"><?php echo t('datos_acceso'); ?></legend>
            <div class="grupo-campo">
              <label for="email"><?php echo t('correo'); ?></label>
              <input type="email" id="email" name="email" required aria-describedby="email-help" />
              <small id="email-help" class="form-text"><?php echo t('ingresa_correo'); ?></small>
            </div>
            <div class="grupo-campo">
              <label for="password"><?php echo t('contrasena'); ?></label>
              <input type="password" id="password" name="password" required aria-describedby="password-help" />
              <small id="password-help" class="form-text"><?php echo t('ingresa_contrasena'); ?></small>
            </div>
          </fieldset>
          
          <div id="login-mensaje" role="status" aria-live="polite" class="mensaje"></div>

          <div class="contenedor-botones">
            <button type="submit" class="boton-accion"><img src="Recursos/img/btnIniciarSesion.png" width="150px"></button>
          </div>
          
          <nav class="form-navigation">
            <p><?php echo t('no_tienes_cuenta'); ?> 
              <button type="button" class="enlace-texto" onclick="mostrarRegistro()" aria-describedby="registro-help"><?php echo t('registrate'); ?></button>
            </p>
            <small id="registro-help" class="form-text"><?php echo t('crea_cuenta'); ?></small>
          </nav>
        </form>
      </div>
    </section>

    <section class="pantalla" id="seccion-registro" style="display: none;" aria-hidden="true">
      <div class="caja-formulario">
        <header class="form-header">
          <img src="Recursos/img/logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="imagen-logo" width="150px">
          <h1><?php echo t('crear_cuenta'); ?></h1>
        </header>
        
        <form id="form-registro" aria-label="Formulario de registro" method="post">
          <fieldset>
            <legend class="visually-hidden"><?php echo t('datos_nueva_cuenta'); ?></legend>
            <div class="grupo-campo">
              <label for="nombre"><?php echo t('nombre_usuario'); ?></label>
              <input type="text" id="nombre" name="nombre" required aria-describedby="nombre-help" />
              <small id="nombre-help" class="form-text"><?php echo t('elige_nombre'); ?></small>
            </div>
            <div class="grupo-campo">
              <label for="emailRegistro"><?php echo t('correo'); ?></label>
              <input type="email" id="emailRegistro" name="email" required aria-describedby="email-registro-help" />
              <small id="email-registro-help" class="form-text"><?php echo t('correo_acceso'); ?></small>
            </div>
            <div class="grupo-campo">
              <label for="passwordRegistro"><?php echo t('contrasena'); ?></label>
              <input type="password" id="passwordRegistro" name="password" required aria-describedby="password-registro-help" />
              <small id="password-registro-help" class="form-text"><?php echo t('minimo_caracteres'); ?></small>
            </div>
            <div class="grupo-campo">
              <label for="confirmarPassword"><?php echo t('confirmar_contrasena'); ?></label>
              <input type="password" id="confirmarPassword" name="confirmarPassword" required aria-describedby="confirmar-help" />
              <small id="confirmar-help" class="form-text"><?php echo t('repite_contrasena'); ?></small>
            </div>
          </fieldset>
          
          <div id="registro-mensaje" role="status" aria-live="polite" class="mensaje"></div>

          <div class="contenedor-botones">
            <button type="submit" class="boton-accion"><img src="Recursos/img/btnRegistrarse.png" width="150px"></button>
          </div>
          
          <nav class="form-navigation">
            <p><?php echo t('ya_tienes_cuenta'); ?> 
              <button type="button" class="enlace-texto" onclick="mostrarLogin()" aria-describedby="login-help"><?php echo t('volver_login'); ?></button>
            </p>
            <small id="login-help" class="form-text"><?php echo t('accede_cuenta'); ?></small>
          </nav>
        </form>
      </div>
    </section>
  </main>
  
<?php include 'php/includes/footer.php'; ?>