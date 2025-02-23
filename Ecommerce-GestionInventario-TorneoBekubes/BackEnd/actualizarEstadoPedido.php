<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"), true);

$idPedido = $data['idPedido'];
$nuevoEstado = $data['nuevoEstado'];

try {
    // Actualizar el estado del pedido
    $query = "UPDATE Pedidos SET Estado = :nuevoEstado WHERE ID_Pedido = :idPedido";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':nuevoEstado', $nuevoEstado);
    $stmt->bindParam(':idPedido', $idPedido);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Estado del pedido actualizado correctamente."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al actualizar el estado del pedido: " . $e->getMessage()]);
}
?>
