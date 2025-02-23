<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$idUsuario = $_GET['idUsuario']; // Obtener el idUsuario desde la URL

try {
    // Consulta SQL para obtener los pedidos del usuario
    $query = "SELECT ID_Pedido, Estado, Fecha FROM Pedidos WHERE ID_Usuario = :idUsuario";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':idUsuario', $idUsuario);
    $stmt->execute();
    $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "pedidos" => $pedidos,
    ]);
} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Error al obtener los pedidos: " . $e->getMessage(),
    ]);
}
?>