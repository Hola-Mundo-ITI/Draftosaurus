<?php
declare(strict_types=1);
require_once __DIR__ . '/backend/session.php';
// Asegurar sesión
if (function_exists('iniciarSesionSegura')) iniciarSesionSegura();
$usuario = function_exists('usuarioActual') ? usuarioActual() : null;
if (!$usuario) {
  header('Location: logear.php');
  exit;
}

$pageTitle = "Administración - Draftosaurus";
$pageDescription = "Panel de administración sencillo";
$specificCSS = "adminPage.css";

include 'includes/head.php';
?>

<body>
  <?php include 'includes/navigation.php'; ?>

  <main id="mainContent" class="container main-content" role="main">
    <section class="py-4">
      <h1>Panel de administración</h1>
      <p>Usuario: <?= htmlspecialchars($usuario['name'] ?? $usuario['nombre'] ?? $usuario['email'] ?? '') ?></p>

      <div id="admin-messages" role="status" aria-live="polite"></div>

      <div id="admin-root">
        <table id="users-table" class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- filas generadas por JS -->
          </tbody>
        </table>
      </div>

    </section>
  </main>

  <?php include 'includes/footer.php'; ?>

  <script src="JS/adminPage.js"></script>
</body>
</html>