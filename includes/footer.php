<?php if (isset($specificJS)): ?>
    <?php if (is_array($specificJS)): ?>
      <?php foreach ($specificJS as $jsFile): ?>
        <script src="JS/<?php echo $jsFile; ?>"></script>
      <?php endforeach; ?>
    <?php else: ?>
      <script src="JS/<?php echo $specificJS; ?>"></script>
    <?php endif; ?>
  <?php endif; ?>

  <!-- Script de navegación unificado (incluido globalmente) -->
  <script src="JS/navigation.js"></script>
</body>
</html>