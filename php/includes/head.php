<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <?php
  // Título de la página (cada página puede definir $pageTitle antes de incluir head.php)
  if (isset($pageTitle)) {
    echo "<title>$pageTitle</title>";
  } else {
    echo "<title>Draftosaurus</title>";
  }
  ?>
  
  <!-- Bootstrap -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  
  <!-- Fuente Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Passero+One&display=swap" rel="stylesheet">
  
  <!-- CSS principal -->
  <link rel="stylesheet" href="CSS/styles.css">
  <link rel="stylesheet" href="CSS/navigation.css">
  <link rel="stylesheet" href="CSS/responsive.css">
  
  <?php
  // CSS específico de la página
  if (isset($specificCSS)) {
    echo "<link rel='stylesheet' href='CSS/$specificCSS'>";
  }
  ?>
  
  <style>
    /* Aplicar fuente a todo */
    * {
      font-family: "Passero One", sans-serif !important;
    }
    
    /* Fondo de la página */
    body {
      background-image: url('Recursos/img/fondoPantalla.png');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
    }
    
    /* Capa de color sobre el fondo */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(247, 231, 204, 0.85);
      z-index: -1;
    }
  </style>
</head>
<body>