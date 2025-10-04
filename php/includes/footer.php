<!-- JavaScript específico de cada página -->
<?php
  if (isset($specificJS)) {
    // Si es un array de varios scripts
    if (is_array($specificJS)) {
      foreach ($specificJS as $jsFile) {
        echo "<script src='JS/$jsFile'></script>";
      }
    } else {
      echo "<script src='JS/$specificJS'></script>";
    }
  }
  ?>

  <!-- Script del menú de navegación -->
  <script src="JS/navigation.js"></script>
</body>
</html>