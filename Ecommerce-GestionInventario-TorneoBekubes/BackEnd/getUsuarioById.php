<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$idUsuario = $_GET['idUsuario']; 

try {
    $query = "
    SELECT ID_Usuario, nombre, apellido1, apellido2, email, Rol, FechaCreacion, Telefono, Direccion 
    FROM usuarios WHERE ID_Usuario = :idUsuario
    ";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':idUsuario', $idUsuario);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC); // Usar fetch() para un solo registro

    if ($usuario) {
        echo json_encode([
            "status" => "success",
            "usuario" => $usuario, // Corregido: devolver "usuario" en lugar de "pedidos"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Usuario no encontrado.",
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al obtener al usuario: " . $e->getMessage(),
    ]);
}
?>

