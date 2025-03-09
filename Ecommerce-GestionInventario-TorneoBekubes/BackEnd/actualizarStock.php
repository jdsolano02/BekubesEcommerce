<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificar que los datos necesarios estén presentes
    if (!isset($data['idInventario']) || !isset($data['nuevoStock'])) {
        echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
        exit;
    }

    $idInventario = $data['idInventario'];
    $nuevoStock = $data['nuevoStock'];

    // Actualizar el stock en la tabla Inventario
    $query = "UPDATE Inventario SET Cantidad_Disponible = :nuevoStock WHERE ID_Inventario = :idInventario";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':nuevoStock', $nuevoStock, PDO::PARAM_INT);
    $stmt->bindParam(':idInventario', $idInventario, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(["status" => "success", "message" => "Stock actualizado correctamente."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al actualizar el stock: " . $e->getMessage()]);
}
?>
