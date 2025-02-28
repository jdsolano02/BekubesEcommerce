<?php

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include 'conexionBD.php';

$data = json_decode(file_get_contents("php://input"), true);

// Verificar si los datos son válidos
if (!$data || !isset($data['idUsuario'], $data['email'], $data['items'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Datos de entrada no válidos."
    ]);
    exit;
}

$idUsuario = $data['idUsuario'];
$email = $data['email'];
$items = $data['items'];

// Verificar si hay productos
if (empty($items)) {
    echo json_encode([
        "status" => "error",
        "message" => "No hay productos en el carrito."
    ]);
    exit;
}

try {
    // Iniciar transacción
    $conn->beginTransaction();

    // Crear un solo pedido
    $queryPedido = "INSERT INTO Pedidos (Estado, Email, ID_Usuario) VALUES ('Procesando', :email, :idUsuario)";
    $stmtPedido = $conn->prepare($queryPedido);
    $stmtPedido->bindParam(':email', $email);
    $stmtPedido->bindParam(':idUsuario', $idUsuario);
    $stmtPedido->execute();
    $idPedido = $conn->lastInsertId(); // Obtener el ID del pedido creado

    // Insertar los detalles del pedido
    $queryDetalle = "INSERT INTO PedidoDetalles (ID_Pedido, ID_Producto, Cantidad, Precio) 
                     VALUES (:idPedido, :idProducto, :cantidad, :precio)";
    $stmtDetalle = $conn->prepare($queryDetalle);

    foreach ($items as $item) {
        $idProducto = $item['ID_Producto'];
        $cantidad = $item['Cantidad'];
        $precio = $item['Precio'];
    
        $stmtDetalle->bindParam(':idPedido', $idPedido, PDO::PARAM_INT);
        $stmtDetalle->bindParam(':idProducto', $idProducto, PDO::PARAM_INT);
        $stmtDetalle->bindParam(':cantidad', $cantidad, PDO::PARAM_INT);
        $stmtDetalle->bindParam(':precio', $precio, PDO::PARAM_STR);
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

