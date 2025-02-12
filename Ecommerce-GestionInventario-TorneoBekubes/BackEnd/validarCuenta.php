<?php
include 'conexionBD.php';

$token = $_GET['token'] ?? '';

if (empty($token)) {
    echo "Token no válido.";
    exit;
}

// Verificar token
$query = "SELECT ID_Usuario, FechaLimiteVerificacion FROM Usuarios WHERE TokenVerificacion = :token AND Verificado = 0";
$stmt = $conn->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();

if ($stmt->rowCount() === 0) {
    echo "El token no es válido o ya ha sido utilizado.";
    exit;
}

$result = $stmt->fetch();
$fechaLimite = $result['FechaLimiteVerificacion'];

if (strtotime($fechaLimite) < time()) {
    echo "El token ha expirado.";
    exit;
}

// Marcar usuario como verificado
$query = "UPDATE Usuarios SET Verificado = 1, TokenVerificacion = NULL WHERE TokenVerificacion = :token";
$stmt = $conn->prepare($query);
$stmt->bindParam(':token', $token);
$stmt->execute();

echo "Cuenta verificada con éxito.";
?>