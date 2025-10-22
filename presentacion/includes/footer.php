
<?php
  if (isset($specificJS)) {
    if (is_array($specificJS)) {
      foreach ($specificJS as $jsFile) {
        echo "<script src='JS/$jsFile'></script>";
      }
    } else {
      echo "<script src='JS/$specificJS'></script>";
    }
  }
  ?>

  <script src="JS/utilidades/navigation.js"></script>
</body>
</html>