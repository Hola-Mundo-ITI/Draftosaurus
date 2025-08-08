<?php
$pageTitle = "Configuración - Draftosaurus";
$pageDescription = "Configuración de Draftosaurus - Ajusta volumen, idioma y preferencias";
$specificCSS = "configuracionPage.css";
$specificJS = "configuracionPage.js";

// Variables específicas para la navegación
$menuButtonId = "menu-toggle";
$menuButtonClass = "menu-icon";
$menuId = "menu";
$menuClass = "menu-lateral";
$menuListClass = "";

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>
  
  <main id="contenido" role="main">
    <section class="configuracion-section">
      <h1>Configuración</h1>
      <form aria-label="Formulario de configuración">
        <fieldset>
          <legend class="visually-hidden">Configuraciones de audio y idioma</legend>
          <div class="campo">
            <label for="volumen">Volumen:</label>
            <input type="range" id="volumen" name="volumen" min="0" max="100" aria-describedby="volumen-help" />
            <small id="volumen-help" class="form-text">Ajusta el volumen del juego</small>
          </div>
          <div class="campo">
            <label for="idioma">Idioma:</label>
            <select id="idioma" name="idioma" aria-describedby="idioma-help">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
            <small id="idioma-help" class="form-text">Selecciona tu idioma preferido</small>
          </div>
        </fieldset>
      </form>
      <nav class="user-actions">
        <p class="cerrar-sesion"><a href="logear.php">Cerrar Sesión</a></p>
      </nav>
    </section>
  </main>
  
<?php include 'includes/footer.php'; ?>