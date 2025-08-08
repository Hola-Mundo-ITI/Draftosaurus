<?php
$pageTitle = "Iniciar Sesión - Draftosaurus";
$pageDescription = "Iniciar sesión o crear cuenta en Draftosaurus";
$specificCSS = "logearPage.css";
$specificJS = "logearPage.js";

include 'includes/head.php';
?>

<body>
  <main role="main">
    <section class="pantalla" id="seccion-login">
      <div class="caja-formulario">
        <header class="form-header">
          <img src="logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="imagen-logo">
          <h1>Iniciar Sesión</h1>
        </header>
        
        <form aria-label="Formulario de inicio de sesión">
          <fieldset>
            <legend class="visually-hidden">Datos de acceso</legend>
            <div class="grupo-campo">
              <label for="email">Correo electrónico</label>
              <input type="email" id="email" name="email" required aria-describedby="email-help" />
              <small id="email-help" class="form-text">Ingresa tu correo electrónico</small>
            </div>
            <div class="grupo-campo">
              <label for="password">Contraseña</label>
              <input type="password" id="password" name="password" required aria-describedby="password-help" />
              <small id="password-help" class="form-text">Ingresa tu contraseña</small>
            </div>
          </fieldset>
          
          <div class="contenedor-botones">
            <a href="index.php" class="boton-accion" role="button">Ingresar</a>
          </div>
          
          <nav class="form-navigation">
            <p>¿No tenés cuenta? 
              <button type="button" class="enlace-texto" onclick="mostrarRegistro()" aria-describedby="registro-help">Registrate</button>
            </p>
            <small id="registro-help" class="form-text">Crea una nueva cuenta</small>
          </nav>
        </form>
      </div>
    </section>

    <section class="pantalla" id="seccion-registro" style="display: none;" aria-hidden="true">
      <div class="caja-formulario">
        <header class="form-header">
          <img src="logo.png" alt="Logo de Draftosaurus - Juego de mesa de dinosaurios" class="imagen-logo">
          <h1>Crear Cuenta</h1>
        </header>
        
        <form aria-label="Formulario de registro">
          <fieldset>
            <legend class="visually-hidden">Datos para nueva cuenta</legend>
            <div class="grupo-campo">
              <label for="nombre">Nombre de usuario</label>
              <input type="text" id="nombre" name="nombre" required aria-describedby="nombre-help" />
              <small id="nombre-help" class="form-text">Elige un nombre único</small>
            </div>
            <div class="grupo-campo">
              <label for="emailRegistro">Correo electrónico</label>
              <input type="email" id="emailRegistro" name="emailRegistro" required aria-describedby="email-registro-help" />
              <small id="email-registro-help" class="form-text">Tu correo para acceder</small>
            </div>
            <div class="grupo-campo">
              <label for="passwordRegistro">Contraseña</label>
              <input type="password" id="passwordRegistro" name="passwordRegistro" required aria-describedby="password-registro-help" />
              <small id="password-registro-help" class="form-text">Mínimo 8 caracteres</small>
            </div>
            <div class="grupo-campo">
              <label for="confirmarPassword">Confirmar tu contraseña</label>
              <input type="password" id="confirmarPassword" name="confirmarPassword" required aria-describedby="confirmar-help" />
              <small id="confirmar-help" class="form-text">Repite la contraseña</small>
            </div>
          </fieldset>
          
          <div class="contenedor-botones">
            <a href="index.php" class="boton-accion boton-verde" role="button">Crear cuenta</a>
          </div>
          
          <nav class="form-navigation">
            <p>¿Ya tenés cuenta? 
              <button type="button" class="enlace-texto" onclick="mostrarLogin()" aria-describedby="login-help">Volver a iniciar sesión</button>
            </p>
            <small id="login-help" class="form-text">Accede con tu cuenta existente</small>
          </nav>
        </form>
      </div>
    </section>
  </main>
  
<?php include 'includes/footer.php'; ?>