<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$accion = $data['accion'] ?? 'deshabilitar'; // Por defecto, deshabilitar

if ($id <= 0) {
    echo json_encode(["status" => "error", "message" => "ID de producto no válido."]);
    exit;
}

try {
    // Determinar el nuevo estado según la acción
    $nuevoEstado = ($accion === 'habilitar') ? 0 : 1; // 0 = Habilitado, 1 = Deshabilitado

    // Actualizar el estado del producto
    $query = "UPDATE Productos SET estado = :estado WHERE ID_Producto = :id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':estado', $nuevoEstado);
    $stmt->bindParam(':id', $id);

    if ($stmt->execute()) {
        $mensaje = ($accion === 'habilitar') ? "Producto habilitado correctamente." : "Producto deshabilitado correctamente.";
        echo json_encode(["status" => "success", "message" => $mensaje]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al actualizar el estado del producto."]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error en la base de datos: " . $e->getMessage()]);
}
?>