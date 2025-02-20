<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"), true);

$idProducto = $data['idProducto'];
$nuevaCantidad = $data['nuevaCantidad'];

try {
    // Actualizar la cantidad en la base de datos
    $query = "UPDATE Items_Carrito SET Cantidad = :nuevaCantidad WHERE ID_Producto = :idProducto";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':nuevaCantidad', $nuevaCantidad);
    $stmt->bindParam(':idProducto', $idProducto);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Cantidad actualizada correctamente."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al actualizar la cantidad: " . $e->getMessage()]);
}
?>
