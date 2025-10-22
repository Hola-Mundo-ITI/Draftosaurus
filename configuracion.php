<?php
session_start();
require_once '/negocio/utilidades/idioma/idiomas.php';

$pageTitle = t('configuracion') . " - Draftosaurus";
$specificCSS = "configuracion.css";
$specificJS = "configuracion.js";

include 'presentacion/includes/head.php';
?>

<body>
  <?php include 'presentacion/includes/navigation.php'; ?>
  
  <main class="contenedor-configuracion">
    <div class="caja-configuracion">
      <h1><?php echo t('configuracion'); ?></h1>
      
      <form id="formConfiguracion">
        <div class="grupo-configuracion">
          <label for="selectorIdioma"><?php echo t('seleccionar_idioma'); ?>:</label>
          <select id="selectorIdioma" name="idioma">
            <option value="es" <?php echo (obtenerIdioma() === 'es') ? 'selected' : ''; ?>>
              <?php echo t('espanol'); ?>
            </option>
            <option value="en" <?php echo (obtenerIdioma() === 'en') ? 'selected' : ''; ?>>
              <?php echo t('ingles'); ?>
            </option>
          </select>
        </div>

        <div id="mensajeConfiguracion" class="mensaje-oculto"></div>

        <button type="submit" class="boton-guardar">
          <?php echo t('guardar_cambios'); ?>
        </button>
      </form>
    </div>
  </main>

  <?php include 'presentacion/includes/footer.php'; ?>
</body>
</html>