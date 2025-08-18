<?php
// Configuración común para todas las páginas
$baseUrl = '';
$resourcesPath = 'Recursos/img/';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="<?php echo isset($pageDescription) ? $pageDescription : 'Draftosaurus - Juego de mesa de dinosaurios'; ?>" />
  <title><?php echo isset($pageTitle) ? $pageTitle : 'Draftosaurus'; ?></title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
  <?php include 'includes/font.php'; ?>
  <link rel="stylesheet" href="CSS/styles.css" />
  <?php if (isset($specificCSS)): ?>
    <link rel="stylesheet" href="CSS/<?php echo $specificCSS; ?>" />
  <?php endif; ?>
  <link rel="stylesheet" href="CSS/responsive.css" />
  <style>
    body {
      background-image: url('<?php echo $resourcesPath; ?>fondoPantalla.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
    }
    
    /* Overlay para mejorar legibilidad del texto */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(247, 231, 204, 0.85);
      z-index: -1;
      pointer-events: none;
    }
  </style>
</head>