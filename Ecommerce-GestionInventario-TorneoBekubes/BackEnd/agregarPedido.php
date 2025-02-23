<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"), true);

$idUsuario = $data['idUsuario']; // ID del usuario que realiza el pedido
$email = $data['email']; // Email del usuario (debe enviarse desde el frontend)
$items = $data['items']; // Productos en el carrito

try {
    // Iniciar transacción
    $conn->beginTransaction();

    // Crear el pedido
    $queryPedido = "INSERT INTO Pedidos (Estado, Email, ID_Usuario) VALUES ('Procesando', :email, :idUsuario)";
    $stmtPedido = $conn->prepare($queryPedido);
    $stmtPedido->bindParam(':email', $email); // Vincular el email
    $stmtPedido->bindParam(':idUsuario', $idUsuario); // Vincular el email
    $stmtPedido->execute();
    $idPedido = $conn->lastInsertId(); // Obtener el ID del pedido creado

    // Insertar los detalles del pedido
    $queryDetalle = "INSERT INTO PedidoDetalles (ID_Pedido, ID_Producto, Cantidad, Precio) 
                     VALUES (:idPedido, :idProducto, :cantidad, :precio)";
    $stmtDetalle = $conn->prepare($queryDetalle);

    foreach ($items as $item) {
        $stmtDetalle->bindParam(':idPedido', $idPedido);
        $stmtDetalle->bindParam(':idProducto', $item['ID_Producto']);
        $stmtDetalle->bindParam(':cantidad', $item['Cantidad']);
        $stmtDetalle->bindParam(':precio', $item['Precio']);
        $stmtDetalle->execute();
    }

    // Confirmar transacción
    $conn->commit();

    echo json_encode([
        "status" => "success",
        "message" => "Pedido creado correctamente.",
        "idPedido" => $idPedido,
    ]);
} catch (PDOException $e) {
    // Revertir transacción en caso de error
    $conn->rollBack();
    echo json_encode([
        "status" => "error",
        "message" => "Error al crear el pedido: " . $e->getMessage(),
    ]);
}
?>
